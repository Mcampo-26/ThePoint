import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { usePaymentStore } from "../store/usePaymentStore";
import { useProductStore } from "../store/useProductStore";
import ReactQRCode from "react-qr-code";
import Swal from "sweetalert2";
import io from "socket.io-client";

// URL de tu servidor WebSocket en Heroku (asegúrate de que el backend esté correctamente configurado)
const socket = io("https://thepointback-03939a97aeeb.herokuapp.com", {
  transports: ["websocket"],
  reconnectionAttempts: 5, // Número de intentos de reconexión
  reconnectionDelay: 3000, // Retraso entre intentos de reconexión
});

const Home = () => {
  const { createPaymentLink, paymentLink, paymentLoading } = usePaymentStore();
  const { products, fetchProducts, needsUpdate, setNeedsUpdate } = useProductStore();
  const [showQR, setShowQR] = useState(false);
  const [localProducts, setLocalProducts] = useState([]); // Para gestionar cantidades de productos seleccionados
  const [paymentStatus, setPaymentStatus] = useState(null); // Estado del pago
  const [paymentId, setPaymentId] = useState(null); // ID del pago
  const printRef = useRef(null); // Para acceder al contenido del ticket de forma oculta

  // Obtener productos al cargar el componente
  useEffect(() => {
    fetchProducts(); // Se obtienen los productos cuando se monta el componente
  }, [fetchProducts]);

  // Actualizar productos cuando detectamos que hay una actualización pendiente
  useEffect(() => {
    if (needsUpdate) {
      fetchProducts(); // Volver a obtener los productos si hay cambios
      setNeedsUpdate(false); // Restablecer la bandera después de la actualización
    }
  }, [needsUpdate, fetchProducts, setNeedsUpdate]);

  // Sincronizar productos locales con el estado global
  useEffect(() => {
    const initializedProducts = products.map((product) => ({
      ...product,
      quantity: 0, // Inicializa la cantidad en 0 para cada producto
    }));
    setLocalProducts(initializedProducts);
  }, [products]);

  // Conectar al servidor WebSocket y escuchar eventos
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Conectado al servidor WebSocket");
    });

    socket.on("paymentSuccess", ({ status, paymentId }) => {
      handlePaymentResult(status, paymentId); // Usa la función para manejar el resultado del pago
    });

    socket.on("disconnect", () => {
      console.log("Desconectado del servidor WebSocket");
    });

    // Limpiar el listener cuando el componente se desmonta
    return () => {
      socket.off("paymentSuccess");
      socket.disconnect(); // Desconectar el socket cuando el componente se desmonte
    };
  }, []);

  // Función para manejar el estado del pago y resetear productos
  const handlePaymentResult = (status, paymentId) => {
    const selectedProducts = localProducts.filter((product) => product.quantity > 0);

    setPaymentStatus(status);
    setPaymentId(paymentId);

    // Función para imprimir los tickets
    const printTickets = () => {
      const printArea = document.getElementById("printArea");

      let allTicketsContent = selectedProducts
        .flatMap((product) => {
          // Generar un ticket por cada unidad del producto
          return Array.from({ length: product.quantity }).map(() => {
            return `
              <div
                style="
                  width: 8cm; /* Ajusta el ancho a 8 cm */
                  height: 8cm; /* Ajusta la altura a 8 cm */
                  padding: 5px; /* Mantén un pequeño padding */
                  text-align: center;
                  font-size: 25px; /* Aumenta el tamaño de la fuente */
                  border: 1px solid #000; /* Mantén el borde para referencia visual */
                  margin-bottom: 10px; /* Espacio entre tickets */
                "
              >
                <h2 style="font-size: 25px; margin-bottom: 5px;">Vale por:</h2>
                <p style="font-size: 30px;">${product.name}</p>
                <h2 style="font-size: 25px; margin-bottom: 5px;">Gracias por tu compra</h2>
              </div>
            `;
          });
        })
        .join(""); // Unir todo el contenido en una sola cadena de HTML

      // Insertar el contenido generado en el div oculto
      printArea.innerHTML = allTicketsContent;

      // Imprimir el contenido
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printArea.innerHTML;
      window.print(); // Imprimir el contenido del área de tickets
      document.body.innerHTML = originalContent; // Restaurar el contenido original después de la impresión
    };

    if (status === "approved") {
      Swal.fire({
        title: "¡Pago Exitoso!",
        text: "Gracias por tu compra.",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        setTimeout(() => {
          printTickets(); // Imprimir tickets después de la alerta de éxito
          window.location.reload();
        }, 1000);
      });
    }
  };

  const handleCloseQR = () => {
    setShowQR(false); // Cierra el modal del QR
  };

  const incrementQuantity = (id) => {
    setLocalProducts(
      localProducts.map((product) =>
        product._id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product
      )
    );
  };

  const decrementQuantity = (id) => {
    setLocalProducts(
      localProducts.map((product) =>
        product._id === id && product.quantity > 0
          ? { ...product, quantity: product.quantity - 1 }
          : product
      )
    );
  };

  const removeProduct = (id) => {
    setLocalProducts(
      localProducts.map((product) =>
        product._id === id ? { ...product, quantity: 0 } : product
      )
    );
  };

  const selectedProducts = localProducts.filter(
    (product) => product.quantity > 0
  );

  const totalAmount = selectedProducts.reduce(
    (total, product) => total + product.quantity * product.price,
    0
  );

  const totalProducts = selectedProducts.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const formatUnits = (quantity) => {
    return quantity === 1 ? "unidad" : "unidades";
  };

  const handlePayment = async () => {
    const productName = "La Previa";
    try {
      await createPaymentLink(productName, totalAmount);
      setShowQR(true);
    } catch (error) {
      console.error("Error al generar el enlace de pago:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center py-10 bg-gray-300">
      {/* Si se muestra el QR, difumina el contenido detrás */}
      <div className="mb-8 w-full max-w-5xl mx-auto px-4 lg:px-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-400 py-3 px-6 rounded-lg inline-block">
          Productos
        </h1>
      </div>

      <div
        className={`flex flex-col lg:flex-row w-full ${
          showQR ? "blur-md" : ""
        }`}
      >
        <div className="flex-1 grid grid-cols-1 gap-8 px-4 md:px-8 mt-20">
          {localProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex items-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 md:w-24 md:h-24 object-cover mr-4"
                />
                <h2 className="text-lg md:text-xl font-semibold">
                  {product.name} - ${product.price}
                </h2>
              </div>
              <div className="flex items-center space-x-2 md:space-x-4">
                <button
                  className="bg-red-500 text-white px-2 md:px-4 py-1 md:py-2 rounded"
                  onClick={() => decrementQuantity(product._id)}
                >
                  -
                </button>
                <span className="text-lg md:text-xl font-bold">
                  {product.quantity}
                </span>
                <button
                  className="bg-green-500 text-white px-2 md:px-4 py-1 md:py-2 rounded"
                  onClick={() => incrementQuantity(product._id)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-1/3 mt-10 lg:mt-0 lg:ml-8 lg:sticky lg:top-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center text-gray-800">
            Resumen de compra
          </h2>
          {selectedProducts.length > 0 ? (
            <div className="bg-white shadow-md rounded-lg p-4">
              <ul className="divide-y divide-gray-200">
                {selectedProducts.map((product) => (
                  <li
                    key={product._id}
                    className="flex justify-between items-center py-4"
                  >
                    <div className="flex flex-col sm:flex-row items-center space-x-2 md:space-x-4">
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {product.quantity} {formatUnits(product.quantity)}
                      </span>
                      <span className="font-medium text-gray-700">
                        {product.name}
                      </span>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-700 font-medium"
                      onClick={() => removeProduct(product._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t pt-4 flex justify_between font-bold">
                <span>Total de productos:</span>
                <span>{totalProducts} {formatUnits(totalProducts)}</span>
              </div>
              <div className="mt-4 border-t pt-4 flex justify-between font-bold">
                <span>Total a pagar:</span>
                <span>${totalAmount}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              No has seleccionado ningún producto.
            </p>
          )}

          {selectedProducts.length > 0 && (
            <div className="mt-6">
              <button
                className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 w-full"
                onClick={handlePayment}
              >
                {paymentLoading
                  ? "Generando enlace..."
                  : `Comprar por $${totalAmount}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {showQR && paymentLink && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-4/5 max-w-md h-auto">
            <button
              className="absolute -top-4 -right-4 text-red-500 hover:text-red-700 bg-white rounded-full p-2"
              onClick={handleCloseQR}
            >
              <FontAwesomeIcon
                icon={faTimes}
                size="xl"
                className="text-red-500 cursor-pointer transition-transform duration-200 hover:rotate-90"
              />
            </button>
            <div className="flex justify-center items-center w-full">
              <ReactQRCode
                value={paymentLink}
                size={450}
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* Div oculto para imprimir los tickets */}
      <div id="printArea" ref={printRef} style={{ display: "none" }}></div>
    </div>
  );
};

export default Home;
