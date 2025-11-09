import React, { useState, useEffect, useRef } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { animateAddProductForm, setupButtonHover } from '../animations/addProductAnimations';
import transition from '../animations/transition';
import '../css/AddProduct.css';
import Header from './Header';

const sectores = [
  { value: '', label: 'Selecciona un sector' },
  { value: 'Equipment', label: 'Equipo' },
  { value: 'Technology', label: 'Tecnología' },
  { value: 'Energy', label: 'Energía' },
  { value: 'Fashion', label: 'Moda' },
  { value: 'Food', label: 'Alimentos y Bebidas' },
  { value: 'Health', label: 'Salud y Bienestar' },
  { value: 'Education', label: 'Educación' },
  { value: 'Entertainment', label: 'Entretenimiento' },
  { value: 'Transport', label: 'Transporte' },
  { value: 'Finance', label: 'Finanzas' },
  { value: 'Others', label: 'Otros' }
];

const AddProduct = ({ onBack }) => {
  const [sector, setSector] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para el toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success'); // 'success', 'danger', 'warning'

  // Referencias para GSAP
  const formBoxRef = useRef(null);
  const selectRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const buttonRef = useRef(null);

  // Función para mostrar toast
  const showToastMessage = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sector) {
      showToastMessage('Por favor selecciona un sector', 'warning');
      return;
    }

    if (!title.trim()) {
      showToastMessage('Por favor ingresa un título', 'warning');
      return;
    }

    if (!description.trim()) {
      showToastMessage('Por favor ingresa una descripción', 'warning');
      return;
    }

    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      showToastMessage('Por favor ingresa un precio válido', 'warning');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: {
            sector,
            title,
            description,
            price: parseFloat(price)
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        showToastMessage('¡Producto agregado exitosamente!', 'success');
        console.log('Producto creado:', data.data);
        
        // Limpiar formulario después de enviar
        setSector('');
        setTitle('');
        setDescription('');
        setPrice('');
      } else {
        showToastMessage('Error al agregar el producto. Por favor intenta de nuevo.', 'danger');
      }
    } catch (error) {
      console.error('Error:', error);
      showToastMessage('Error al conectar con el servidor. Por favor verifica que el backend esté funcionando.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addProductContainer">
      <Header 
        showBackButton={true}
        title="Volver"
        onBackClick={onBack}
      />

      {/* Toast Container */}
      <ToastContainer 
        position="top-end" 
        className="p-3" 
        style={{ position: 'fixed', zIndex: 9999 }}
      >
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastVariant === 'success' ? '✓ Éxito' : 
               toastVariant === 'danger' ? '✗ Error' : 
               '⚠ Advertencia'}
            </strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'success' || toastVariant === 'danger' ? 'text-white' : ''}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

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

          <div className="inputGroup">
            <input
              type="number"
              placeholder="Precio"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="formInput"
              min="0"
              step="0.01"
              required
            />
          </div>

          <button 
            ref={buttonRef}
            onClick={handleSubmit} 
            className="submitButton"
            disabled={loading}
          >
            {loading ? 'Agregando...' : 'Agregar producto'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default transition(AddProduct);