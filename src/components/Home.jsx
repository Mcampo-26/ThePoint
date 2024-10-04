import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { usePaymentStore } from "../store/usePaymentStore";
import { useProductStore } from "../store/useProductStore";
import Swal from "sweetalert2";

const Home = () => {
  const { products, fetchProducts, needsUpdate, setNeedsUpdate } = useProductStore();
  const [localProducts, setLocalProducts] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const hiddenTicketRef = useRef(null); 

  useEffect(() => {
    fetchProducts(); // Obtener productos
  }, [fetchProducts]);

  useEffect(() => {
    if (needsUpdate) {
      fetchProducts();
      setNeedsUpdate(false);
    }
  }, [needsUpdate, fetchProducts, setNeedsUpdate]);

  useEffect(() => {
    const initializedProducts = products.map((product) => ({
      ...product,
      quantity: 0, // Inicializamos con cantidad 0
    }));
    setLocalProducts(initializedProducts);
  }, [products]);

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

  const handleApprovedPayment = () => {
    const paymentResult = { status: "approved", paymentId: "fakePaymentId12345" };
    handlePaymentResult(paymentResult.status, paymentResult.paymentId);
  };

   
 // Función para determinar si usar "un" o "una"
 const getArticle = (productName) => {
  return `<span class="product-name">${productName}</span>`;
};




const handlePaymentResult = (status, paymentId) => {
  const printTickets = () => {
    let allTicketsContent = selectedProducts
      .flatMap((product) => {
        return Array.from({ length: product.quantity }).map(() => {
          return `
            <div class="ticket-container">
              <h2 class="ticket-title">1x</h2>
              <p class="ticket-item">${getArticle(product.name)}</p>
              <h2 class="ticket-footer">Gracias por tu compra.</h2>
            </div>
          `;
        });
      })
      .join(''); // Eliminar cualquier espacio entre tickets
  
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <style>
            /* Estilos generales del ticket */
            body {
               margin: 0;
               padding: 0;
             
              
            }
  
            /* Eliminar márgenes superiores e inferiores de los contenedores */
            .ticket-container {
              width: 10cm;             
              height: 6cm; /* Asegurar una altura específica */
              margin: 0; /* Sin margen en el contenedor */              
              display: flex;
              flex-direction: column;
              justify-content: center; /* Centrar contenido verticalmente */
              align-items: center;
              box-sizing: border-box;
              overflow: hidden;
              page-break-inside: avoid; /* Evitar cortes en los tickets */
              padding-left: 2cm; /* Ajusta este valor según lo necesites */
            }
  
            /* Estilos para los elementos dentro del ticket */
            .ticket-title, .ticket-item, .ticket-footer {
              margin: 0;
              padding: 0;
              text-align: center;
            }
  
            /* Eliminar márgenes y padding en el título */
            .ticket-title {
              font-size: 35px;
              padding-bottom: 2px;
            }
  
            /* Control preciso del tamaño de la fuente del nombre del producto */
            .ticket-item {
              font-size: 100px;
              padding: 0;
            }
  
            /* Control sobre el footer para evitar cualquier espacio adicional */
            .ticket-footer {
              font-size: 18px;
              margin-top: 3px;
              padding: 0;
            }
  
            /* Forzar sin margen entre tickets consecutivos */
            .ticket-container + .ticket-container {
              margin-top: 0 !important;
              padding-top: 0 !important;
            }
          </style>
        </head>
        <body>${allTicketsContent}</body>
      </html>
    `);
    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    document.body.removeChild(iframe);
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
        printTickets();
        window.location.reload();
      }, 1000);
    });
  }
};

  
  

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center py-10 bg-gray-300">
      <div className="mb-8 w-full max-w-5xl mx-auto px-4 lg:px-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-400 py-3 px-6 rounded-lg inline-block">
          Productos
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row w-full">
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
                className="bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg hover:bg-green-700 transition duration-300 w-full"
                onClick={handleApprovedPayment} // Botón para simular pago aprobado
              >
                Pago aprobado
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
