import React, { useState, useEffect, useRef } from 'react';
import transition from '../animations/transition';
import Header from './Header';
import { getCookie } from '../utils/cookies';
import '../css/PaymentSuccess.css';

const PaymentSuccess = ({ company, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  // Obtener datos del producto y wallet
  const productPrice = company?.price || 0;
  const productId = company?.id || '1';
  const userWallet = getCookie('userWallet') || 'testWallet123';
  
  // Calcular la distribución del pago
  const referralPercentage = 5; // 5% para el referido
  const sellerPercentage = 95; // 95% para el vendedor
  const referralAmount = (productPrice * referralPercentage) / 100;
  const sellerAmount = (productPrice * sellerPercentage) / 100;

  useEffect(() => {
    // Prevenir doble llamada en React StrictMode
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Llamar al endpoint de referral
    const fetchPaymentLink = async () => {
      try {
        setLoading(true);
        
        // Usar la cartera del referido
        const refererId = 'https://ilp.interledger-test.dev/refeerer1';
        const response = await fetch(
          `http://localhost:3000/api/referal/link?productId=${productId}&refererId=${encodeURIComponent(refererId)}`
        );

        const data = await response.json();
        
        // Verificar si la respuesta contiene los links de pago
        if (data.sellerPaymentLink && data.referralPaymentLink) {
          setPaymentData(data);
        } else if (data.error) {
          setError(data.error || 'Error al procesar el pago');
          console.error('Payment error:', data);
        } else {
          setError('Respuesta inesperada del servidor');
          console.error('Unexpected response:', data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentLink();
  }, [productId]);

  if (!company) {
    return (
      <div className="paymentSuccessContainer">
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

  return (
    <div className="paymentSuccessContainer">
      <Header 
        showBackButton={true}
        title="Volver"
        onBackClick={onBack}
      />

      <div className="paymentSuccessContent">
        <div className="successCard">
          {loading ? (
            <div className="loadingSection">
              <div className="spinner"></div>
              <p className="loadingText">Procesando pago...</p>
            </div>
          ) : error ? (
            <div className="errorSection">
              <div className="errorIcon">❌</div>
              <h2 className="errorTitle">Error en el pago</h2>
              <p className="errorMessage">{error}</p>
            </div>
          ) : (
            <>
              <div className="successIcon">✅</div>
              <h1 className="successTitle">¡Pago Exitoso!</h1>
              
              <div className="paymentDetails">
                <div className="detailSection">
                  <h3 className="sectionTitle">Información del Producto</h3>
                  <div className="detailRow">
                    <span className="detailLabel">Producto:</span>
                    <span className="detailValue">{company.nombre}</span>
                  </div>
                  <div className="detailRow">
                    <span className="detailLabel">Monto Total:</span>
                    <span className="detailValue highlight">${productPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="detailSection">
                  <h3 className="sectionTitle">Cartera Actual</h3>
                  <div className="detailRow">
                    <span className="detailLabel">Wallet:</span>
                    <span className="detailValue">{userWallet}</span>
                  </div>
                </div>

                <div className="detailSection distributionSection">
                  <h3 className="sectionTitle">Distribución del Pago</h3>
                  
                  <div className="distributionCard">
                    <div className="distributionHeader">
                      <span className="distributionIcon">👤</span>
                      <span className="distributionTitle">Comisión Referido</span>
                    </div>
                    <div className="distributionAmount">
                      <span className="percentage">{referralPercentage}%</span>
                      <span className="amount">${referralAmount.toLocaleString()}</span>
                    </div>
                    <div className="distributionWallet">
                      <small>Francel (MXN)</small>
                    </div>
                  </div>

                  <div className="distributionCard">
                    <div className="distributionHeader">
                      <span className="distributionIcon">🏪</span>
                      <span className="distributionTitle">Pago al Vendedor</span>
                    </div>
                    <div className="distributionAmount">
                      <span className="percentage">{sellerPercentage}%</span>
                      <span className="amount">${sellerAmount.toLocaleString()}</span>
                    </div>
                    <div className="distributionWallet">
                      <small>Vendedor del producto</small>
                    </div>
                  </div>
                </div>

                {(paymentData?.sellerPaymentLink || paymentData?.referralPaymentLink) && (
                  <div className="detailSection">
                    <h3 className="sectionTitle">Links de Pago</h3>
                    
                    {paymentData?.sellerPaymentLink && (
                      <div className="linkContainer">
                        <label className="linkLabel">Link de Pago - Vendedor (95%):</label>
                        <a 
                          href={paymentData.sellerPaymentLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="paymentLink"
                        >
                          Abrir link de pago del vendedor
                        </a>
                      </div>
                    )}
                    
                    {paymentData?.referralPaymentLink && (
                      <div className="linkContainer">
                        <label className="linkLabel">Link de Pago - Referido (5%):</label>
                        <a 
                          href={paymentData.referralPaymentLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="paymentLink referralLink"
                        >
                          Abrir link de pago del referido
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default transition(PaymentSuccess);

