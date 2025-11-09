import React, { useState, useEffect, useRef } from 'react';
import { animateProductDetail } from '../animations/productDetailAnimations';
import '../css/ProductDetail.css'; 
import transition from '../animations/transition';
import Header from './Header';
import { getCookie } from '../utils/cookies';
import { QRCodeSVG } from 'qrcode.react';

const ProductDetail = ({ company, onBack }) => {
  const [realPrice, setRealPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Referencias para GSAP
  const imageRef = useRef(null);
  const nameRef = useRef(null);
  const ratingRef = useRef(null);
  const comisionRef = useRef(null);
  const priceRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonRef = useRef(null);
  const qrButtonRef = useRef(null);

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
      buttonRef,
      qrButtonRef
    };

    const timer = setTimeout(() => {
      animateProductDetail(refs);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Datos hardcodeados para el QR (será reemplazado con datos reales)
  const getQRData = () => {
    // Datos hardcodeados: wallet address y monto para recibir pago
    const walletAddress = 'https://ilp.interledger-test.dev/eb37db34';
    const amount = realPrice || '100'; // Usa el precio real si está disponible, sino 100
    const productId = company.id || '1';
    
    // Formato del QR: JSON con información de pago
    return JSON.stringify({
      type: 'payment',
      walletAddress: walletAddress,
      amount: amount,
      productId: productId,
      currency: 'USD'
    });
  };

  const handleShowQR = () => {
    setShowQR(!showQR);
  };

  const handleLinkReferido = async () => {
    try {
      setIsLoading(true);
      
      // Obtener wallet de la cookie
      const wallet = getCookie('userWallet');
      if (!wallet) {
        alert('No se encontró el wallet. Por favor, inicia sesión nuevamente.');
        setIsLoading(false);
        return;
      }

      // Obtener el id del producto
      const productId = company.id;
      if (!productId) {
        alert('No se encontró el ID del producto.');
        setIsLoading(false);
        return;
      }

      // Llamar al endpoint del servidor
      const response = await fetch(
        `http://localhost:3000/api/referal/link?mywallet=${encodeURIComponent(wallet)}&productId=${encodeURIComponent(productId)}`
      );

      const data = await response.json();

      if (data.success && data.link) {
        // Abrir el link de pago en una nueva ventana
        window.open(data.link, '_blank');
      } else {
        alert('Error al generar el link de referido: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al obtener el link de referido:', error);
      alert('Error al conectar con el servidor. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
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
          <div className={`productInfoSection ${showQR ? 'withScroll' : ''}`}>
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

            <div className="buttonsContainer">
              <button 
                ref={buttonRef}
                onClick={handleLinkReferido} 
                className="linkButton"
                disabled={isLoading}
              >
                {isLoading ? 'Generando link...' : 'Link de referido'}
              </button>
              
              <button 
                ref={qrButtonRef}
                onClick={handleShowQR} 
                className="qrButton"
              >
                {showQR ? 'Ocultar QR' : 'Mostrar QR'}
              </button>
            </div>

            {showQR && (
              <div className="qrContainer">
                <div className="qrWrapper">
                  <QRCodeSVG 
                    value={getQRData()} 
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                  <p className="qrLabel">Escanea para recibir pago</p>
                  <p className="qrData">{getQRData()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default transition(ProductDetail);