import React from 'react';

const Ticket = ({ status, productName, totalAmount, paymentId }) => {
  return (
    <div
      style={{
        width: '10cm',
        height: '10cm',
        padding: '10px',
        border: '1px solid #000',
        fontSize: '12px', // Ajustar tamaño de fuente
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h2 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Resumen del Ticket</h2>
      <div style={{ textAlign: 'center' }}>
        <p><strong>Vale por:</strong> {productName}</p>
        <p><strong>Total Pagado:</strong> ${totalAmount}</p>
        <p><strong>ID de Pago:</strong> {paymentId}</p>
        <p><strong>Estado del Pago:</strong> {status === "approved" ? "Aprobado" : status === "pending" ? "Pendiente" : "Rechazado"}</p>
      </div>
    </div>
  );
};

export default Ticket;
