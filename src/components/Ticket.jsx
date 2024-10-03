import React, { useEffect } from 'react';

const Ticket = ({ productName }) => {
  // Estilos en línea para el ticket
  const ticketStyle = {
    width: '10cm',
    height: '10cm',
    padding: '1cm',
    border: '1px solid black',
    margin: '0 auto',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
  };

  useEffect(() => {
    // Disparar la impresión automáticamente cuando el componente se monta
    const timeoutId = setTimeout(() => {
      window.print();
    }, 500); // Añadir un retraso para asegurarse de que el contenido está cargado

    return () => clearTimeout(timeoutId); // Limpiar el timeout cuando el componente se desmonte
  }, []);

  return (
    <div style={ticketStyle}>
      <h2>Vale por:</h2>
      <p><strong>{productName}</strong></p>
    </div>
  );
};

export default Ticket;
