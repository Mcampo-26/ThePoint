import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home'; // Componente principal para manejar todas las rutas
import AdminPanel from './components/AdminPanel'; // Componente para el panel de administración

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Home />} />

        {/* Ruta para el panel de administración */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Rutas para los resultados de pago, todas usando el componente Home */}
        <Route path="/payment-result/success" element={<Home />} />
        <Route path="/payment-result/failure" element={<Home />} />
        <Route path="/payment-result/pending" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
