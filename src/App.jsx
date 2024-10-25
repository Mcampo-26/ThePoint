import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import AdminPanel from './components/AdminPanel';
import socket from './utilities/socket.js';

function App() {
  useEffect(() => {
    socket.connect(); // Conectar socket al cargar `App`

    socket.on("connect", () => {
      console.log("Conectado al servidor WebSocket con socket ID:", socket.id);
    });

    return () => {
      socket.disconnect(); // Desconectar socket cuando se desmonta `App`
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
