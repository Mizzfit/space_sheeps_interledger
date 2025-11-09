import React, { useRef } from 'react';
import transition from '../animations/transition';
import Header from './Header';
import { QRCodeSVG } from 'qrcode.react';
import '../css/Sell.css';

const Sell = ({ company, onBack, onNavigateToPayment }) => {
  // Referencias para GSAP (si se necesitan animaciones)
  const qrContainerRef = useRef(null);

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

  // Obtener el precio del producto
  const productPrice = company.price || 0;

  // Datos hardcodeados para el QR (será reemplazado con datos reales)
  const getQRData = () => {
    // Datos hardcodeados: wallet address y monto para recibir pago
    const walletAddress = 'https://ilp.interledger-test.dev/eb37db34';
    const amount = productPrice.toString(); // Usa el precio del producto
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
            
            <div className="priceDisplaySection">
              <label className="priceLabel">Monto a recibir:</label>
              <div className="priceValue">${productPrice.toLocaleString()}</div>
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
                <p className="qrDataLabel">Link de pago:</p>
                <button 
                  onClick={() => onNavigateToPayment(company)}
                  className="paymentLinkButton"
                >
                  Ver detalles del pago
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default transition(Sell);

