import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { usePaymentStore } from "../store/usePaymentStore";
import { useModoStore } from "../store/useModoStore";// Asegúrate deimportar tu store de MODO
import { useProductStore } from "../store/useProductStore";
import ReactQRCode from "react-qr-code";
import Swal from "sweetalert2";
import io from "socket.io-client";

// URL de tu servidor WebSocket en Heroku
const socket = io("https://thepointback-03939a97aeeb.herokuapp.com", {
  transports: ["websocket"],
  reconnectionAttempts: 5, // Número de intentos de reconexión
  reconnectionDelay: 3000, // Retraso entre intentos de reconexión
});

const Home = () => {
  const { createPaymentLink, paymentLink, paymentLoading } = usePaymentStore();
  const { products, fetchProducts, needsUpdate, setNeedsUpdate } =
    useProductStore();
  const [modoQR, setModoQR] = useState(null); // Estado para almacenar el QR de MODO
  const [localProducts, setLocalProducts] = useState([]); // Para gestionar cantidades de productos seleccionados
  const [showQR, setShowQR] = useState(false); // Estado para mostrar/ocultar el QR
  const [paymentStatus, setPaymentStatus] = useState(null); // Estado del pago
  const [paymentId, setPaymentId] = useState(null); // ID del pago
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null); // Estado para seleccionar el método de pago
  const { createModoPaymentLink } = useModoStore(); // Ensure this is imported


  // Obtener productos al cargar el componente
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (needsUpdate) {
      fetchProducts();
      setNeedsUpdate(false);
    }
  }, [needsUpdate, fetchProducts, setNeedsUpdate]);

  // Inicializa los productos en el estado con cantidad 0
  useEffect(() => {
    const initializedProducts = products.map((product) => ({
      ...product,
      quantity: 0, // Inicializa la cantidad en 0 para cada producto
    }));
    setLocalProducts(initializedProducts);
  }, [products]);

  // Almacenar productos seleccionados en localStorage
  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(localProducts));
  }, [localProducts]);

  // Maneja el evento WebSocket para recibir el pago exitoso
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Conectado al servidor WebSocket");
    });

    socket.on("paymentSuccess", ({ status, paymentId }) => {
      handlePaymentResult(status, paymentId);
    });

    socket.on("disconnect", () => {
      console.log("Desconectado del servidor WebSocket");
    });

    return () => {
      socket.off("paymentSuccess");
      socket.disconnect();
    };
  }, []);


  //MODO
  const handleModoPayment = async () => {
    try {
      const response = await createModoPaymentLink(totalAmount); // Calls MODO payment link
      const { qr_url } = response; // Extract the QR from the backend response
      handlePaymentResult("approved", "modoPaymentId", qr_url); // Pass the QR to handlePaymentResult
    } catch (error) {
      console.error("Error creating MODO payment:", error); // Log the error
    }
  };
  
  ////

  // Maneja el resultado del pago
  const handlePaymentResult = async (status, paymentId) => {
    const storedProducts =
      JSON.parse(localStorage.getItem("selectedProducts")) || [];
  
    const selectedProducts = storedProducts.filter(
      (product) => product.quantity > 0
    );
  
    console.log("Productos seleccionados al confirmar pago:", selectedProducts);
    console.log("Estado del pago recibido:", status, "ID de pago:", paymentId);
  
    setPaymentStatus(status);
    setPaymentId(paymentId);
  
    if (status === "approved") {
      console.log("Pago aprobado, mostrando notificación...");
      await Swal.fire({
        title: "¡Pago Exitoso!",
        text: "Gracias por tu compra.",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });
  
      handleCloseQR();
      setTimeout(() => {
        printTickets(selectedProducts);
      }, 100);
    } else if (status === "rejected") {
      console.log("Pago rechazado, mostrando notificación...");
      await Swal.fire({
        title: "Pago Rechazado",
        text: "Lamentablemente, el pago fue rechazado.",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };
  

  // Función para imprimir los tickets
  const printTickets = (selectedProducts) => {
    if (selectedProducts.length === 0) {
      console.log("No hay productos seleccionados para imprimir.");
      return;
    }

    let ticketContent = selectedProducts
      .map((product) =>
        Array.from({ length: product.quantity })
          .map(
            () => `
              <div class="ticket-container">
                <h2 class="ticket-title">1x</h2>
                <p class="ticket-item">${product.name}</p>
                <h2 class="ticket-footer">Precio: ${product.price}</h2>
              </div>`
          )
          .join("")
      )
      .join("");

    const printWindow = window.open("", "", "width=500,height=500");
    if (!printWindow) {
      alert(
        "Error: El navegador bloqueó la ventana de impresión. Permita las ventanas emergentes."
      );
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <style>
            body { text-align: center; margin: 0; padding: 0; height: auto; }
            .ticket-container { width: 100%; height: auto; }
            .ticket-title { font-size: 20px; margin-top: 1px; }
            .ticket-item { font-size: 55px; margin-top: -15px; }
            .ticket-footer { font-size: 10px; margin-top: -20px; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          ${ticketContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Función para cerrar el QR
  const handleCloseQR = () => {
    setShowQR(false);
    setSelectedPaymentMethod(null); // Resetea el método de pago al cerrar el modal
  };

  // Simula un pago exitoso para pruebas
  const simulatePaymentSuccess = () => {
    const fakePaymentId = "12345"; // ID de pago simulado
    const fakeStatus = "approved"; // Estado simulado
    handlePaymentResult(fakeStatus, fakePaymentId); // Llama a la función que maneja el resultado del pago
  };

  // Incrementa la cantidad de productos
  const incrementQuantity = (id) => {
    setLocalProducts(
      localProducts.map((product) =>
        product._id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product
      )
    );
  };

  // Decrementa la cantidad de productos
  const decrementQuantity = (id) => {
    setLocalProducts(
      localProducts.map((product) =>
        product._id === id && product.quantity > 0
          ? { ...product, quantity: product.quantity - 1 }
          : product
      )
    );
  };

  // Elimina un producto del carrito
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
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center py-8 bg-gray-300">
     <div className="flex justify-end">
  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-400 rounded-lg mb-0">
    Productos
  </h1>
</div>


      <div
        className={`flex flex-col lg:flex-row w-full -mt-10 ${
          showQR ? "blur-md" : ""
        }`}
      >
        <div className="flex-1 grid grid-cols-1 gap-6 px-4 md:px-8 mt-20">
          {localProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between transform transition-transform duration-500 hover:scale-105 hover:shadow-lg"
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

              <div className="mt-4 border-t pt-4 flex justify-between font-bold">
                <span>Total de productos:</span>
                <span>
                  {totalProducts} {formatUnits(totalProducts)}
                </span>
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
          <button
            className="bg-yellow-500 text-white px-4 py-2 mt-4 rounded-lg shadow-lg"
            onClick={simulatePaymentSuccess}
            hidden
          >
            Simular Pago Exitoso
          </button>
        </div>
      </div>

      {showQR && paymentLink && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="relative bg-white p-8 rounded-lg shadow-lg w-11/12 sm:w-4/5 max-w-lg h-auto">
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

            {/* Coloca los botones aquí */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                className={`${
                  selectedPaymentMethod === "mercadoPago"
                    ? "bg-blue-500"
                    : "bg-gray-300"
                } text-white px-4 py-2 rounded-lg`}
                onClick={() => setSelectedPaymentMethod("mercadoPago")}
              >
                Mercado Pago
              </button>
              <button
                className={`${
                  selectedPaymentMethod === "modo"
                    ? "bg-blue-500"
                    : "bg-gray-300"
                } text-white px-4 py-2 rounded-lg`}
                onClick={() => handleModoPayment("modo")}
              >
                MODO
              </button>
            </div>

            {/* QR Code centrado abajo */}
            <div className="flex justify-center items-center">
              {selectedPaymentMethod === "mercadoPago" && (
                <ReactQRCode
                  value={paymentLink}
                  size={300} // Ajusta el tamaño del QR
                  className="max-w-full h-auto"
                />
              )}

              {selectedPaymentMethod === "modo" && modoQR && (
                <ReactQRCode
                  value={modoQR} // Utiliza el valor dinámico del QR de MODO
                  size={300}
                  className="max-w-full h-auto"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
