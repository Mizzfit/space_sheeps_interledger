import React, { useState } from 'react';
import '../css/Login.css'; 

const LoginForm = ({ onLogin }) => {
  const [wallet, setWallet] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Intentar login
    const success = onLogin(wallet, password);
    
    if (!success) {
      setError('Credenciales incorrectas. Intenta de nuevo.');
    }
  };

  return (
    <section>
      <div className="leftDiv">
        <div className="formContainer">
          <h1 className="title">Inicia sesión</h1>
          
          {error && (
            <div style={{ 
              backgroundColor: '#ff4444', 
              color: 'white', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <div className="form">
            <div className="mb-4">
              <input
                type="text"
                className="form-control input"
                placeholder="Wallet"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                className="form-control input"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="linksContainer">
              <a href="#" className="link">¿Olvidaste tu contraseña?</a>
              <a href="#" className="link">Crear cuenta</a>
            </div>

            <button 
              onClick={handleSubmit}
              className="button w-100"
            >
              Iniciar Sesión
            </button>

            {/* Ayuda para testing */}
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              borderRadius: '8px',
              fontSize: '0.85rem'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>
                <strong>Credenciales de prueba:</strong>
              </p>
              <p style={{ margin: 0, color: '#ddd' }}>
                Wallet: testWallet123<br />
                Contraseña: password123
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rightDiv"></div>
    </section>
  );
};

export default LoginForm;