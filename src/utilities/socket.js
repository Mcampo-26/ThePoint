// src/socket.js
import { io } from "socket.io-client";
import { URL } from "../utilities/config.js"; // URL de tu backend WebSocket

const socket = io(URL, {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});

// Log de conexión
socket.on("connect", () => {
  console.log("Conectado al WebSocket con socket ID:", socket.id);
});

// Exporta la instancia de socket para ser usada en otros archivos
export default socket;
