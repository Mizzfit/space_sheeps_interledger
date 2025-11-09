import React, { useState } from 'react';
import '../css/AddProduct.css'; 

const AddProduct = ({ onBack }) => {
  const [sector, setSector] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Producto agregado:', { sector, title, description });
    // Aquí irá la lógica para enviar al backend
    
    // Opcional: Limpiar formulario después de enviar
    setSector('');
    setTitle('');
    setDescription('');
  };

  return (
    <div className="addProductContainer">
      <header className="addProductHeader">
        <button onClick={onBack} className="backButton">
          ← Volver
        </button>
        <h1 className="addProductTitle">Agregar producto</h1>
      </header>

      <div className="formWrapper">
        <div className="formBox">
          <div className="inputGroup">
            <input
              type="text"
              placeholder="Sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="formInput"
              required
            />
          </div>

          <div className="inputGroup">
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="formInput"
              required
            />
          </div>

          <div className="inputGroup">
            <textarea
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="formTextarea"
              rows="6"
              required
            />
          </div>

          <button onClick={handleSubmit} className="submitButton">
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;