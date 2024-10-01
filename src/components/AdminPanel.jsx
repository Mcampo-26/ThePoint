import React, { useState, useEffect } from 'react';
import { useProductStore } from '../store/useProductStore'; // Importar el store de Zustand
import Swal from 'sweetalert2'; // Importar SweetAlert2

const AdminPanel = () => {
  const { addProduct, fetchProducts, products, deleteProduct, updateProduct, setNeedsUpdate } = useProductStore();
  const [form, setForm] = useState({ name: '', price: '', imageUrl: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  // Cargar los productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await updateProduct(editProductId, form);
        setNeedsUpdate(true); // Marcar que hay una actualización pendiente
        Swal.fire('Actualizado', 'El producto ha sido actualizado correctamente.', 'success');
      } else {
        await addProduct({
          name: form.name,
          price: form.price,
          imageUrl: form.imageUrl,
        });
        setNeedsUpdate(true); // Marcar que hay una actualización pendiente
        Swal.fire('Agregado', 'El producto ha sido agregado correctamente.', 'success');
      }

      // Restablecer el formulario
      setForm({ name: '', price: '', imageUrl: '' });
      setIsEditing(false);
      setEditProductId(null);

    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al procesar el producto', 'error');
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setEditProductId(product._id);
    setForm({
      name: product.name || '',
      price: product.price || '',
      imageUrl: product.imageUrl || '', // Asegúrate de usar el campo correcto para la imagen
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProduct(id).then(() => {
          Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
          setNeedsUpdate(true); // Notificar que los productos se actualizaron
        });
      }
    });
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl mb-4">{isEditing ? 'Editar Producto' : 'Agregar Producto'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleInputChange}
          placeholder="Nombre del producto"
          className="border p-2 w-full"
        />
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleInputChange}
          placeholder="Precio"
          className="border p-2 w-full"
        />
        <input
          type="text"
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleInputChange}
          placeholder="URL de la imagen"
          className="border p-2 w-full"
        />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          {isEditing ? 'Actualizar Producto' : 'Agregar Producto'}
        </button>
      </form>

      <h2 className="text-2xl mt-8">Lista de Productos</h2>
      <ul className="mt-4">
        {products.map((product) => (
          <li key={product._id} className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center space-x-4">
              {/* Mostrar una miniatura de la imagen del producto */}
              <img src={product.image} alt={product.name} className="w-16 h-16 object-cover" />
              <div>
                <h3>{product.name}</h3>
                <p>Precio: ${product.price}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(product)}
                className="bg-yellow-500 text-white px-4 py-2"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(product._id)}
                className="bg-red-500 text-white px-4 py-2"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
