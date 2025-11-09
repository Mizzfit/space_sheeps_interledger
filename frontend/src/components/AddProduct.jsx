import React, { useState, useEffect, useRef } from 'react';
import { animateAddProductForm, setupButtonHover } from '../animations/addProductAnimations';
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

  // Referencias para GSAP
  const formBoxRef = useRef(null);
  const selectRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Ejecutar animaciones al montar con un pequeño delay
    const timer = setTimeout(() => {
      const refs = {
        formBoxRef,
        selectRef,
        inputRef,
        textareaRef,
        buttonRef
      };

      animateAddProductForm(refs);
      const cleanup = setupButtonHover(buttonRef);

      // Cleanup
      return () => {
        if (cleanup) cleanup();
      };
    }, 50);

    return () => clearTimeout(timer);
  }, []);

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
        <div className="formBox" ref={formBoxRef}>
          <div className="inputGroup" ref={selectRef}>
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

          <div className="inputGroup" ref={inputRef}>
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="formInput"
              required
            />
          </div>

          <div className="inputGroup" ref={textareaRef}>
            <textarea
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="formTextarea"
              rows="6"
              required
            />
          </div>

          <button 
            ref={buttonRef}
            onClick={handleSubmit} 
            className="submitButton"
          >
            Agregar producto
          </button>
        </div>
      </div>
    </div>
  );
};

export default transition(AddProduct);