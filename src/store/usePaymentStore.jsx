import { create } from 'zustand';
import axios from 'axios';
import { URL } from '../utilities/config.js';

export const usePaymentStore = create((set) => ({
  // Estado de pagos
  paymentLoading: false,
  paymentError: null,
  paymentLink: null,
  qrCodeURL: null, 
  modoQRCodeURL: null,
  modoDeeplink: null,
  
  products: JSON.parse(localStorage.getItem('selectedProducts')) || [
    { id: 1, name: 'Cerveza', price: 200, quantity: 0 },
    { id: 2, name: 'Fernet', price: 300, quantity: 0 },
    { id: 3, name: 'Gin', price: 400, quantity: 0 },
    { id: 4, name: 'Vodka', price: 500, quantity: 0 },
  ],

  // Acción para crear QR dinámico de Mercado Pago
  createPaymentLink: async (productName, price) => {
    set({ paymentLoading: true, paymentError: null });
    try {
      const response = await axios.post(`${URL}/Pagos/create_payment_link`, {
        title: productName,
        price: parseFloat(price),
      });

      const paymentLink = response.data.paymentLink;
      if (paymentLink) {
        set({ paymentLoading: false, paymentLink });
        return paymentLink;
      } else {
        throw new Error('No se recibió un enlace de pago en la respuesta');
      }
    } catch (error) {
      set({
        paymentError: 'Hubo un problema al generar tu enlace de pago.',
        paymentLoading: false,
      });
      throw error;
    }
  },

  // Acción para crear checkout de MODO
 createModoCheckout: async (price, details) => {
  set({ paymentLoading: true, paymentError: null });
  try {
    const response = await axios.post(`${URL}/Pagos/create_modo`, {
      price: parseFloat(price),
      details: details,
    });

    // Desestructura la respuesta que recibiste del backend
    const { qr, deeplink } = response.data;

    // Agrega el console.log para ver la respuesta
    console.log("Respuesta de MODO:", response.data);

    // Guarda los datos en el estado de Zustand
    set({
      paymentLoading: false,
      modoQRCodeURL: qr, // El código QR en formato de cadena
      modoDeeplink: deeplink, // El deep link
    });

    return { qr, deeplink };
  } catch (error) {
    set({
      paymentError: 'Hubo un problema al crear el checkout de MODO.',
      paymentLoading: false,
    });
    throw error;
  }
},

  // Guardar detalles de pago
  savePaymentDetails: async (paymentDetails) => {
    set({ paymentLoading: true, paymentError: null });
    try {
      const response = await axios.post(`${URL}/Pagos/save_payment_details`, paymentDetails);
      set({ paymentLoading: false });
    } catch (error) {
      set({
        paymentError: 'Hubo un problema al guardar los detalles del pago.',
        paymentLoading: false,
      });
    }
  },

  // Registrar un pago
  registerPayment: async (paymentDetails) => {
    set({ paymentLoading: true, paymentError: null });
    try {
      const response = await axios.post(`${URL}/Pagos/register_payment`, paymentDetails);
      set({ paymentLoading: false });
    } catch (error) {
      set({
        paymentError: 'Hubo un problema al registrar el pago.',
        paymentLoading: false,
      });
    }
  },

  // Manejar webhook de MODO
  handleModoWebhook: async (webhookData) => {
    set({ paymentLoading: true, paymentError: null });
    try {
      const response = await axios.post(`${URL}/Pagos/webhook/modo`, webhookData);
      set({ paymentLoading: false });
    } catch (error) {
      set({
        paymentError: 'Hubo un problema al procesar el webhook de MODO.',
        paymentLoading: false,
      });
    }
  },
}));

export default usePaymentStore;
