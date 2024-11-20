import { create } from "zustand";
import axios from "axios";
import { NGROK_URL } from "../utilities/config.js";
import socket from "../utilities/socket.js";

export const usePaymentStore = create((set) => ({
  // Estado inicial
  paymentLoading: false,
  paymentError: null,
  orderStatus: null, // Estado de la orden (aprobada, rechazada, pendiente)
  paymentLink: null, // No se usa para QR fijo, pero lo dejo para posibles futuros usos

  // Acción para crear una orden asociada al QR fijo
  createOrder: async (title, items, totalAmount) => {
    set({ paymentLoading: true, paymentError: null });
    try {
      const response = await axios.put(`${NGROK_URL}/Pagos/create_interoperable_qr`, {
        title,
        items: items.map((product) => ({
          name: product.name,
          price: product.price,
          quantity: product.quantity,
        })),
        totalAmount: parseFloat(totalAmount),
        socketId: socket.id, // Asociar el socket conectado
      });
  
      const orderData = response.data; // Respuesta del backend
      set({
        paymentLoading: false,
        orderStatus: orderData.status, // Estado de la orden (puedes ajustarlo según la respuesta del backend)
      });
  
      return orderData; // Devuelve la información completa al frontend si es necesario
    } catch (error) {
      console.error("Error al asociar la orden al QR fijo:", error.response?.data || error.message);
      set({
        paymentError: "Hubo un problema al asociar la orden al QR.",
        paymentLoading: false,
      });
      throw error;
    }
  },
}));

export default usePaymentStore;
