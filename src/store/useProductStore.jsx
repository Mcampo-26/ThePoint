import { create } from 'zustand';
import axios from 'axios';
import { URL } from '../utilities/config'; // Asegúrate de que esta URL apunte a tu backend

export const useProductStore = create((set) => ({
  products: [],
  needsUpdate: false, // Estado para controlar actualizaciones

  // Obtener productos del backend
  fetchProducts: async () => {
    try {
      const response = await axios.get(`${URL}/productos`);
      set({ products: response.data });
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  },

  // Marcar que los productos necesitan ser actualizados
  setNeedsUpdate: (status) => {
    set({ needsUpdate: status });
  },

  // Agregar un nuevo producto
  addProduct: async (product) => {
    try {
      const response = await axios.post(`${URL}/productos`, product);
      set((state) => ({
        products: [...state.products, response.data],
        needsUpdate: true, // Marcar la actualización pendiente
      }));
    } catch (error) {
      console.error('Error al agregar el producto:', error);
    }
  },

  // Actualizar un producto existente
  updateProduct: async (id, product) => {
    try {
      const response = await axios.put(`${URL}/productos/${id}`, product);
      set((state) => ({
        products: state.products.map((p) => (p._id === id ? response.data : p)),
        needsUpdate: true, // Marcar la actualización pendiente
      }));
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
    }
  },

  // Eliminar un producto
  deleteProduct: async (id) => {
    try {
      await axios.delete(`${URL}/productos/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p._id !== id),
        needsUpdate: true, // Marcar la actualización pendiente
      }));
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  },
}));
