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

  // Acción para crear QR dinámico
  createDynamicQR: async (productName, price, selectedProducts, socketId) => {
    set({ paymentLoading: true, paymentError: null });
    try {
      console.log('Datos a enviar al backend:', { title: productName, price: parseFloat(price), products: selectedProducts });
  
      const response = await axios.post(`${URL}/Pagos/create-dynamic-qr`, {
        title: productName,
        price: parseFloat(price),
        products: selectedProducts,
        socketId,
      });
  
      const qrCodeURL = response.data.qrCodeURL;
      if (qrCodeURL) {
        set({ paymentLoading: false, qrCodeURL });
        return qrCodeURL;
      } else {
        throw new Error('No se recibió una URL de código QR en la respuesta');
      }
    } catch (error) {
      set({
        paymentError: 'Hubo un problema al generar tu QR.',
        paymentLoading: false,
      });
      throw error;
    }
  },
  
  // Acción para crear checkout de MODO
  createModoCheckout: async (price) => {
    set({ paymentLoading: true, paymentError: null });
    try {
      console.log("Creando checkout de MODO para el precio:", price);
  
      const response = await axios.post(`${URL}/Pagos/create-modo-checkout`, {
        price: parseFloat(price),
      });
  
      const { qr_url, deeplink } = response.data;
      set({ paymentLoading: false, modoQRCodeURL: qr_url, modoDeeplink: deeplink });
      return { qr_url, deeplink };
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
