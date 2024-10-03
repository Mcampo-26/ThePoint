import React, { useState } from "react";
import Swal from "sweetalert2";

const PaymentSimulator = ({ onPaymentResult }) => {
  const [loading, setLoading] = useState(false);

  const simulatePayment = (status) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Swal.fire({
        title: "Simulación de Pago",
        text: `El pago ha sido ${status}`,
        icon: status === "approved" ? "success" : status === "pending" ? "info" : "error",
        confirmButtonText: "OK",
      }).then(() => {
        onPaymentResult(status, "12345"); // Simulamos un ID de pago
      });
    }, 1000); // Simulación de retardo en el pago
  };

  return (
    <div className="payment-simulator">
      <h2>Simulador de Pago</h2>
      <div className="buttons">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => simulatePayment("approved")}
          disabled={loading}
        >
          Simular Pago Exitoso
        </button>
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          onClick={() => simulatePayment("pending")}
          disabled={loading}
        >
          Simular Pago Pendiente
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => simulatePayment("failure")}
          disabled={loading}
        >
          Simular Pago Fallido
        </button>
      </div>
    </div>
  );
};

export default PaymentSimulator;
