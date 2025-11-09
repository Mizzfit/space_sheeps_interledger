import React, { useState, useEffect, useRef } from 'react';
import { animateProductDetail } from '../animations/productDetailAnimations';
import '../css/ProductDetail.css'; 
import transition from '../animations/transition';
import Header from './Header';

const ProductDetail = ({ company, onBack }) => {
  const [realPrice, setRealPrice] = useState('');

  // Referencias para GSAP
  const imageRef = useRef(null);
  const nameRef = useRef(null);
  const ratingRef = useRef(null);
  const comisionRef = useRef(null);
  const priceRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonRef = useRef(null);

  // Validar que company existe
  if (!company) {
    return (
      <div className="productDetailContainer">
        <Header 
          showBackButton={true}
          title="Volver"
          onBackClick={onBack}
        />
        <div style={{ color: 'black', textAlign: 'center', padding: '2rem' }}>
          No se encontró información de la empresa.
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Ejecutar animaciones al montar
    const refs = {
      imageRef,
      nameRef,
      ratingRef,
      comisionRef,
      priceRef,
      descriptionRef,
      buttonRef
    };

    const timer = setTimeout(() => {
      animateProductDetail(refs);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const handleLinkReferido = () => {
    window.open(company.linkReferido, '_blank');
  };

  // Generar estrellas (4 llenas, 1 vacía por defecto)
  const renderStars = () => {
    const stars = [];
    const rating = 4;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star empty'}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="productDetailContainer">
      <Header 
        showBackButton={true}
        title="Volver"
        onBackClick={onBack}
      />

      <div className="productContent">
        <div className="productLayout">
          {/* Imagen del producto */}
          <div className="productImageSection" ref={imageRef}>
            <img 
              src={company.imagen} 
              alt={company.nombre}
              className="productImage"
            />
          </div>

          {/* Información del producto */}
          <div className="productInfoSection">
            <h1 className="companyName" ref={nameRef}>{company.nombre}</h1>
            
            <div className="rating" ref={ratingRef}>
              {renderStars()}
            </div>

            <p className="comisionText" ref={comisionRef}>Comision o porcentaje</p>

            <div className="priceSection" ref={priceRef}>
              <div className="recommendedPrice">
                <span className="priceLabel">Recomendada:</span>
                <span className="priceValue">3%</span>
              </div>
              <input
                type="text"
                placeholder="Real"
                value={realPrice}
                onChange={(e) => setRealPrice(e.target.value)}
                className="realPriceInput"
              />
            </div>

            <div className="descriptionBox" ref={descriptionRef}>
              <p className="descriptionText">{company.descripcion}</p>
            </div>

            <button 
              ref={buttonRef}
              onClick={handleLinkReferido} 
              className="linkButton"
            >
              Link de referido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default transition(ProductDetail);