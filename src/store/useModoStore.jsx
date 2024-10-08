import { create } from 'zustand';
import axios from 'axios';
import { URL } from '../utilities/config.js'; // Asegúrate de que la URL esté configurada correctamente

export const useModoStore = create((set) => ({
  // Estado de pagos
  modoPaymentLoading: false,
  modoPaymentError: null,
  modoPaymentLink: null,
  modoQR: null, // Almacena el QR de MODO
  modoDeeplink: null, // Almacena el deeplink de MODO

  // Acción para crear enlace de pago con MODO
  createModoPaymentLink: async (price) => {
    set({ modoPaymentLoading: true, modoPaymentError: null });
    try {
      console.log('Precio a enviar al backend para MODO:', price);
  
      const response = await axios.post(`${URL}/Pagos/create_modo_checkout`, {
        price: parseFloat(price),
      });
  
      console.log('Respuesta de MODO:', response.data);
  
      const { qr_url, deeplink } = response.data; // Ajusta a los nombres de campos correctos
      if (qr_url || deeplink) {
        set({
          modoPaymentLoading: false,
          modoQR: qr_url,
          modoDeeplink: deeplink,
        });
        return { qr_url, deeplink };
      } else {
        throw new Error('No se recibió un QR o un deeplink en la respuesta');
      }
    } catch (error) {
      console.error('Error al crear la intención de pago en MODO:', error);
      set({
        modoPaymentError: 'Hubo un problema al generar tu enlace de pago con MODO.',
        modoPaymentLoading: false,
      });
      throw error;
    }
  },

  // Guardar detalles de pago de MODO
  saveModoPaymentDetails: async (paymentDetails) => {
    set({ modoPaymentLoading: true, modoPaymentError: null });
    try {
      console.log('Detalles de pago de MODO a enviar:', paymentDetails);

      const response = await axios.post(`${URL}/Pagos/save_modo_payment_details`, paymentDetails);

      console.log('Detalles de pago guardados:', response.data);
      set({ modoPaymentLoading: false });
    } catch (error) {
      console.error('Error al guardar los detalles del pago de MODO:', error);
      set({
        modoPaymentError: 'Hubo un problema al guardar los detalles del pago de MODO.',
        modoPaymentLoading: false,
      });
    }
  },

  // Registrar un pago en MODO
  registerModoPayment: async (paymentDetails) => {
    set({ modoPaymentLoading: true, modoPaymentError: null });
    try {
      console.log('Detalles de pago de MODO a registrar:', paymentDetails);

      const response = await axios.post(`${URL}/Pagos/register_modo_payment`, paymentDetails);

      console.log('Pago de MODO registrado:', response.data);
      set({ modoPaymentLoading: false });
    } catch (error) {
      console.error('Error al registrar el pago de MODO:', error);
      set({
        modoPaymentError: 'Hubo un problema al registrar el pago de MODO.',
        modoPaymentLoading: false,
      });
    }
  },

  // Manejar webhook de MODO
  handleModoWebhook: async (webhookData) => {
    set({ modoPaymentLoading: true, modoPaymentError: null });
    try {
      console.log('Datos del webhook de MODO:', webhookData);

      const response = await axios.post(`${URL}/Pagos/modo_webhook`, webhookData);

      console.log('Webhook de MODO procesado:', response.data);
      set({ modoPaymentLoading: false });
    } catch (error) {
      console.error('Error al procesar el webhook de MODO:', error);
      set({
        modoPaymentError: 'Hubo un problema al procesar el webhook de MODO.',
        modoPaymentLoading: false,
      });
    }
  },
}));

export default useModoStore;
