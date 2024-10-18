import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { usePaymentStore } from "../store/usePaymentStore";
import { useProductStore } from "../store/useProductStore";
import ReactQRCode from "react-qr-code";
import Swal from "sweetalert2";
import io from "socket.io-client";

const socket = io("https://thepointback-03939a97aeeb.herokuapp.com", {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});

const Home = () => {
  const { createModoCheckout, createPaymentLink, paymentLink, modoQRCodeURL, paymentLoading } = usePaymentStore();
  const { products, fetchProducts, needsUpdate, setNeedsUpdate } = useProductStore();
  const [localProducts, setLocalProducts] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null); // Para almacenar el método de pago seleccionado

  useEffect(() => {
    fetchProducts();
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
      quantity: 0,
    }));
    setLocalProducts(initializedProducts);
  }, [products]);

  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(localProducts));
  }, [localProducts]);

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

  const handlePaymentResult = async (status, paymentId) => {
    if (status === "approved") {
      await Swal.fire({
        title: "¡Pago Exitoso!",
        text: "Gracias por tu compra.",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });
      handleCloseQR();
      window.location.reload();
    }
  };

  const handleCloseQR = () => {
    setShowQR(false);
    setSelectedPaymentMethod(null);
  };

  const handlePayment = async () => {
    const totalAmount = localProducts.reduce(
      (total, product) => total + product.quantity * product.price,
      0
    );

    const socketId = socket.id; // Obtener el ID del socket conectado
    if (selectedPaymentMethod === "mercadoPago") {
      await createPaymentLink(totalAmount, localProducts, socketId);
    } else if (selectedPaymentMethod === "modo") {
      await createModoCheckout(totalAmount);
    }

    setShowQR(true);
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center py-8 bg-gray-300">
      {/* Productos y resumen */}
      {/* Contenido omitido para enfocarse en la parte del QR */}

      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="relative bg-white p-8 rounded-lg shadow-lg w-11/12 sm:w-4/5 max-w-lg h-auto">
            <button
              className="absolute -top-4 -right-4 text-red-500 hover:text-red-700 bg-white rounded-full p-2"
              onClick={handleCloseQR}
            >
              <FontAwesomeIcon icon={faTimes} size="xl" />
            </button>

            {/* Botones para elegir el método de pago */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                className={`${
                  selectedPaymentMethod === "mercadoPago" ? "bg-blue-500" : "bg-gray-300"
                } text-white px-4 py-2 rounded-lg`}
                onClick={() => setSelectedPaymentMethod("mercadoPago")}
              >
                Mercado Pago
              </button>
              <button
                className={`${
                  selectedPaymentMethod === "modo" ? "bg-blue-500" : "bg-gray-300"
                } text-white px-4 py-2 rounded-lg`}
                onClick={() => setSelectedPaymentMethod("modo")}
              >
                MODO
              </button>
            </div>

            {/* Renderizar QR */}
            <div className="flex justify-center items-center">
              {selectedPaymentMethod === "mercadoPago" && paymentLink && (
                <ReactQRCode value={paymentLink} size={300} className="max-w-full h-auto" />
              )}
              {selectedPaymentMethod === "modo" && modoQRCodeURL && (
                <ReactQRCode value={modoQRCodeURL} size={300} className="max-w-full h-auto" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
