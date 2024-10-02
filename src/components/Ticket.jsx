import React from 'react';

const Ticket = ({ status, productName, totalAmount, paymentId }) => {
  // Función para imprimir el ticket
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ticket-container">
      <h2>Resumen del Ticket</h2>
      <div className="ticket-details">
        <p><strong>Producto:</strong> {productName}</p>
        <p><strong>Total Pagado:</strong> ${totalAmount}</p>
        <p><strong>ID de Pago:</strong> {paymentId}</p>
        <p><strong>Estado del Pago:</strong> {status === "approved" ? "Aprobado" : status === "pending" ? "Pendiente" : "Rechazado"}</p>
      </div>
      <button onClick={handlePrint} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Imprimir Ticket</button>
    </div>
  );
};

export default Ticket;
