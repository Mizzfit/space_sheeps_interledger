import React, { useState } from 'react';
import transition from '../animations/transition';
import '../css/AddProduct.css';
import Header from './Header';

const sectores = [
    { value: '', label: 'Selecciona un sector' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'energia', label: 'Energía' },
    { value: 'moda', label: 'Moda' },
    { value: 'alimentos', label: 'Alimentos y Bebidas' },
    { value: 'salud', label: 'Salud y Bienestar' },
    { value: 'educacion', label: 'Educación' },
    { value: 'entretenimiento', label: 'Entretenimiento' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'finanzas', label: 'Finanzas' },
    { value: 'otros', label: 'Otros' }
  ];
  
  const AddProduct = ({ onBack }) => {
    const [sector, setSector] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (!sector) {
        alert('Por favor selecciona un sector');
        return;
      }
      
      console.log('Producto agregado:', { sector, title, description });
      // Aquí irá la lógica para enviar al backend
      
      // Opcional: Limpiar formulario después de enviar
      setSector('');
      setTitle('');
      setDescription('');
    };
  
    return (
        <div className="addProductContainer">
          <Header 
            showBackButton={true}
            title="Volver"
            onBackClick={onBack}
          />
  
        <div className="formWrapper">
          <div className="formBox">
            <div className="inputGroup">
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="formSelect"
                required
              >
                {sectores.map((sec) => (
                  <option key={sec.value} value={sec.value}>
                    {sec.label}
                  </option>
                ))}
              </select>
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
  
  export default transition(AddProduct);