import React, { useState, useEffect, useRef } from 'react';
import { animateLoginForm, animateError, setupButtonHover } from '../animations/loginAnimations';
import { getCookie, setCookie } from '../utils/cookies';
import transition from '../animations/transition';
import '../css/Login.css';

const LoginForm = ({ onLogin }) => {
  const [wallet, setWallet] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Referencias para GSAP
  const titleRef = useRef(null);
  const input1Ref = useRef(null);
  const input2Ref = useRef(null);
  const linksRef = useRef(null);
  const buttonRef = useRef(null);
  const helpBoxRef = useRef(null);
  const errorRef = useRef(null);
  const leftDivRef = useRef(null);

  // Cargar wallet desde cookie al montar
  useEffect(() => {
    const savedWallet = getCookie('userWallet');
    if (savedWallet) {
      setWallet(savedWallet);
    }
  }, []);

  useEffect(() => {
    // Ejecutar animaciones al montar con un pequeño delay
    const timer = setTimeout(() => {
      const refs = {
        titleRef,
        input1Ref,
        input2Ref,
        linksRef,
        buttonRef,
        helpBoxRef,
        leftDivRef
      };

      animateLoginForm(refs);
      const cleanup = setupButtonHover(buttonRef);

      // Cleanup
      return () => {
        if (cleanup) cleanup();
      };
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Animar error cuando aparece
    if (error && errorRef.current) {
      animateError(errorRef);
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validar que el wallet no esté vacío
    if (!wallet.trim()) {
      setError('Por favor ingresa tu wallet.');
      return;
    }

    // Cualquier contraseña es válida, solo llamar onLogin con el wallet
    const success = onLogin(wallet, password);
    
    if (success) {
      // Guardar wallet en cookie si el login es exitoso
      setCookie('userWallet', wallet, 30); // Expira en 30 días
    } else {
      setError('Error al iniciar sesión. Intenta de nuevo.');
    }
  };

  return (
    <section>
      <div className="leftDiv" ref={leftDivRef}>
        <div className="formContainer">
          <h1 className="title-login" ref={titleRef}>Inicia sesión</h1>
          
          {error && (
            <div 
              ref={errorRef}
              style={{ 
                backgroundColor: '#ff4444', 
                color: 'white', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}
            >
              {error}
            </div>
          )}
          
          <div className="form">
            <div className="mb-4" ref={input1Ref}>
              <input
                type="text"
                className="form-control input"
                placeholder="https://ilp.interledger-test.dev/seller_example"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                required
              />
            </div>

            <div className="mb-4" ref={input2Ref}>
              <input
                type="password"
                className="form-control input"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="linksContainer" ref={linksRef}>
              <a href="#" className="link">¿Olvidaste tu contraseña?</a>
              <a href="#" className="link">Crear cuenta</a>
            </div>

            <button 
              ref={buttonRef}
              onClick={handleSubmit}
              className="button w-100"
            >
              Iniciar Sesión
            </button>

            {/* Ayuda para testing */}
            <div 
              ref={helpBoxRef}
              style={{ 
                marginTop: '2rem', 
                padding: '1rem', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}
            >
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default transition(LoginForm);