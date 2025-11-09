import React, { useState, useEffect, useRef } from 'react';
import transition from '../animations/transition';
import Header from './Header';
import { QRCodeSVG } from 'qrcode.react';
import '../css/Sell.css';

const Sell = ({ company, onBack }) => {
  const [realPrice, setRealPrice] = useState('');
  
  // Referencias para GSAP (si se necesitan animaciones)
  const qrContainerRef = useRef(null);
  const priceInputRef = useRef(null);

  // Validar que company existe
  if (!company) {
    return (
      <div className="sellContainer">
        <Header 
          showBackButton={true}
          title="Volver"
          onBackClick={onBack}
        />
        <div style={{ color: 'black', textAlign: 'center', padding: '2rem' }}>
          No se encontró información del producto.
        </div>
      </div>
    );
  }

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

  return (
    <div className="sellContainer">
      <Header 
        showBackButton={true}
        title="Volver"
        onBackClick={onBack}
      />

      <div className="sellContent">
        <div className="sellLayout">
          {/* Información del producto */}
          <div className="sellInfoSection">
            <h1 className="sellTitle">{company.nombre}</h1>
            
            <div className="priceInputSection">
              <label className="priceLabel">Monto a recibir:</label>
              <input
                ref={priceInputRef}
                type="text"
                placeholder="Ingresa el monto"
                value={realPrice}
                onChange={(e) => setRealPrice(e.target.value)}
                className="priceInput"
              />
            </div>

            <div className="productDescription">
              <p className="descriptionText">{company.descripcion}</p>
            </div>
          </div>

          {/* Sección del QR */}
          <div className="qrSection" ref={qrContainerRef}>
            <div className="qrWrapper">
              <QRCodeSVG 
                value={getQRData()} 
                size={300}
                level="H"
                includeMargin={true}
              />
              <p className="qrLabel">Escanea para recibir pago</p>
              <div className="qrDataContainer">
                <p className="qrDataLabel">Datos del pago:</p>
                <p className="qrData">{getQRData()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default transition(Sell);

