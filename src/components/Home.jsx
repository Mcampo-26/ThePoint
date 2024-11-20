import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { usePaymentStore } from "../store/usePaymentStore";
import { useProductStore } from "../store/useProductStore";
import Swal from "sweetalert2";
import socket from "../utilities/socket.js";

export const Home = () => {
  const { createOrder, paymentLoading } = usePaymentStore();
  const { products, fetchProducts, needsUpdate, setNeedsUpdate } =
    useProductStore();
  const [localProducts, setLocalProducts] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const FIXED_QR_URL =
    "https://www.mercadopago.com/instore/merchant/qr/106583461/f146bc9de93842e9bb5ae5025e4fe9b882cd072f031d429aa3682768e7c0aed1.png";

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

  const handlePayment = async () => {
    const selected = localProducts.filter((product) => product.quantity > 0);
    const total = selected.reduce(
      (sum, product) => sum + product.quantity * product.price,
      0
    );
  
    setSelectedProducts(selected);
    setTotalAmount(total);
  
    if (selected.length === 0) {
      Swal.fire({
        title: "Sin productos",
        text: "Por favor, selecciona al menos un producto.",
        icon: "warning",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }
  
    try {
      await createOrder("Compra en La Previa", selected, total); // Llama a la acción en el store
      setShowQR(true);
    } catch (error) {
      console.error("Error al asociar la orden al QR fijo:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al asociar la orden.",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const handleCloseQR = () => {
    setShowQR(false);
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-400 mb-4">
        Productos
      </h1>

      <div
        className={`flex flex-col lg:flex-row w-full ${
          showQR ? "blur-md" : ""
        }`}
      >
        <div className="flex-1 grid grid-cols-1 gap-6 px-4 md:px-8 mt-20">
          {localProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between"
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
              <div className="flex items-center space-x-2">
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => decrementQuantity(product._id)}
                >
                  -
                </button>
                <span className="text-lg font-bold">{product.quantity}</span>
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  onClick={() => incrementQuantity(product._id)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-1/3 mt-10 lg:ml-8 lg:sticky lg:top-4">
          <h2 className="text-xl font-semibold mb-4 text-center">Resumen</h2>
          {selectedProducts.length > 0 ? (
            <div className="bg-white shadow-md rounded-lg p-4">
              <ul className="divide-y divide-gray-200">
                {selectedProducts.map((product) => (
                  <li
                    key={product._id}
                    className="flex justify-between items-center py-4"
                  >
                    <span>
                      {product.quantity}x {product.name}
                    </span>
                    <span>${product.quantity * product.price}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 font-bold flex justify-between">
                <span>Total:</span>
                <span>${totalAmount}</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No has seleccionado ningún producto.
            </p>
          )}
          <button
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg w-full"
            onClick={handlePayment}
          >
            {paymentLoading ? "Generando orden..." : "Generar orden"}
          </button>
        </div>
      </div>

      {showQR && (
        <div>
          <h2>Escanea el QR</h2>
          <img
            src="https://www.mercadopago.com/instore/merchant/qr/106583461/f146bc9de93842e9bb5ae5025e4fe9b882cd072f031d429aa3682768e7c0aed1.png"
            alt="QR Fijo"
          />
          <button onClick={handleCloseQR}>Cerrar</button>
        </div>
      )}
    </div>
  );
};

export default Home;
