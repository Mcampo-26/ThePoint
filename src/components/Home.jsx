import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons'; // Importar ícono de tachito
import Cerveza from '../assets/Cerveza.jpg';
import Fernet from '../assets/Fernet.jpg';
import Gin from '../assets/Gin.jpg';
import Vodka from '../assets/Vodka.jpg';

export const Home = () => {
  // Estado para manejar la cantidad de cada producto
  const [products, setProducts] = useState([
    { id: 1, name: 'Cerveza', image: Cerveza, quantity: 0 },
    { id: 2, name: 'Fernet', image: Fernet, quantity: 0 },
    { id: 3, name: 'Gin', image: Gin, quantity: 0 },
    { id: 4, name: 'Vodka', image: Vodka, quantity: 0 },
  ]);

  // Función para incrementar la cantidad
  const incrementQuantity = (id) => {
    setProducts(products.map(product =>
      product.id === id ? { ...product, quantity: product.quantity + 1 } : product
    ));
  };

  // Función para decrementar la cantidad
  const decrementQuantity = (id) => {
    setProducts(products.map(product =>
      product.id === id && product.quantity > 0
        ? { ...product, quantity: product.quantity - 1 } : product
    ));
  };

  // Función para eliminar un producto del listado seleccionado
  const removeProduct = (id) => {
    setProducts(products.map(product =>
      product.id === id ? { ...product, quantity: 0 } : product
    ));
  };

  // Filtrar los productos que tienen una cantidad mayor que 0
  const selectedProducts = products.filter(product => product.quantity > 0);

  // Calcular el total de productos
  const totalProducts = selectedProducts.reduce((total, product) => total + product.quantity, 0);

  // Función para manejar singular y plural de "unidad"
  const formatUnits = (quantity) => {
    return quantity === 1 ? "unidad" : "unidades";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Hola, soy The Point</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map(product => (
          <div
            key={product.id}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-40 h-40 object-cover mb-4"
            />
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <div className="flex items-center mt-4 space-x-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => decrementQuantity(product.id)}
              >
                -
              </button>
              <span className="text-xl font-bold">{product.quantity}</span>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => incrementQuantity(product.id)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Listado dinámico de productos seleccionados con botón de eliminar */}
      <div className="mt-10 w-full px-4">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Productos seleccionados:</h2>
        {selectedProducts.length > 0 ? (
          <ul className="bg-white shadow-md rounded-lg p-4 divide-y divide-gray-200">
            {selectedProducts.map(product => (
              <li key={product.id} className="flex justify-between items-center py-4">
                <div className="flex flex-col sm:flex-row items-center space-x-4">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    {product.quantity} {formatUnits(product.quantity)}
                  </span>
                  <span className="font-medium text-gray-700">{product.name}</span>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 font-medium"
                  onClick={() => removeProduct(product.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">No has seleccionado ningún producto.</p>
        )}
      </div>

      {/* Resumen de productos (Ticket) */}
      {selectedProducts.length > 0 && (
        <div className="mt-6 w-full px-4 max-w-md">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Resumen de compra </h3>
          <div className="bg-white shadow-md rounded-lg p-4">
            <ul className="space-y-2">
              {selectedProducts.map(product => (
                <li key={product.id} className="flex justify-between">
                  <span>{product.name}</span>
                  <span>{product.quantity} {formatUnits(product.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t pt-4 flex justify-between font-bold">
              <span>Total de productos:</span>
              <span>{totalProducts} {formatUnits(totalProducts)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Botón de Comprar */}
      {selectedProducts.length > 0 && (
        <div className="mt-6">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300">
            Comprar
          </button>
        </div>
      )}
    </div>
  );
};
