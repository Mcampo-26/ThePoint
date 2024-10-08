import { create } from 'zustand';
import axios from 'axios';
import { URL } from '../utilities/config.js';

export const usePaymentStore = create((set) => ({
  // Estado de pagos
  paymentLoading: false,
  paymentError: null,
  paymentLink: null,
  
  products: JSON.parse(localStorage.getItem('selectedProducts')) || [
    { id: 1, name: 'Cerveza', price: 200, quantity: 0 },
    { id: 2, name: 'Fernet', price: 300, quantity: 0 },
    { id: 3, name: 'Gin', price: 400, quantity: 0 },
    { id: 4, name: 'Vodka', price: 500, quantity: 0 },
  ],

  // Acción para crear enlace de pago
  createPaymentLink: async (productName, price, qrId) => { // qrId agregado como parámetro
    set({ paymentLoading: true, paymentError: null });
    try {
      console.log('Datos a enviar al backend:', { title: productName, price: parseFloat(price), qrId });
  
      const response = await axios.post(`${URL}/Pagos/create_payment_link`, {
        title: productName,
        price: parseFloat(price),
        qrId // Enviar qrId al backend para validación
      });
  
      console.log('Respuesta del backend (Mercado Pago):', response.data); // Verifica lo que viene del backend
  
      const paymentLink = response.data.paymentLink;
      if (paymentLink) {
        set({ paymentLoading: false, paymentLink });
        console.log('Enlace de pago generado:', paymentLink); // Verifica el enlace generado
        return paymentLink;
      } else {
        throw new Error('No se recibió un enlace de pago en la respuesta');
      }
    } catch (error) {
      console.error('Error al crear el enlace de pago:', error); // Log de error si algo falla
      set({
        paymentError: 'Hubo un problema al generar tu enlace de pago.',
        paymentLoading: false,
      });
      throw error;
    }
  },
  
  // Guardar detalles de pago
  savePaymentDetails: async (paymentDetails) => {
    set({ paymentLoading: true, paymentError: null });
    try {
      console.log('Detalles de pago a enviar:', paymentDetails);

      const response = await axios.post(`${URL}/Pagos/save_payment_details`, paymentDetails);

      console.log('Detalles de pago guardados:', response.data);
      set({ paymentLoading: false });
    } catch (error) {
      console.error('Error al guardar los detalles del pago:', error);
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
      console.log('Detalles de pago a registrar:', paymentDetails);

      const response = await axios.post(`${URL}/Pagos/register_payment`, paymentDetails);

      console.log('Pago registrado:', response.data);
      set({ paymentLoading: false });
    } catch (error) {
      console.error('Error al registrar el pago:', error);
      set({
        paymentError: 'Hubo un problema al registrar el pago.',
        paymentLoading: false,
      });
    }
  },

  // Manejar webhook de MercadoPago
  handleWebhook: async (webhookData) => {
    set({ paymentLoading: true, paymentError: null });
    try {
      console.log('Datos del webhook:', webhookData);

      const response = await axios.post(`${URL}/Pagos/webhook`, webhookData);

      console.log('Webhook procesado:', response.data);
      set({ paymentLoading: false });
    } catch (error) {
      console.error('Error al procesar el webhook:', error);
      set({
        paymentError: 'Hubo un problema al procesar el webhook.',
        paymentLoading: false,
      });
    }
  },
}));

export default usePaymentStore;
