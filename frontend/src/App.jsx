import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import LoginForm from './components/LoginForm';
import Companies from './components/Companies';
import AddProduct from './components/AddProduct';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('companies'); // 'companies' o 'addProduct'

  // Credenciales hardcodeadas (simulando API)
  const validCredentials = {
    wallet: 'testWallet123',
    password: 'password123'
  };

  const handleLogin = (wallet, password) => {
    if (wallet === validCredentials.wallet && password === validCredentials.password) {
      setIsAuthenticated(true);
      setUser({ wallet });
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView('companies');
  };

  const goToAddProduct = () => {
    setCurrentView('addProduct');
  };

  const goToCompanies = () => {
    setCurrentView('companies');
  };

  return (
    <div>
      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <>
          {currentView === 'companies' && (
            <Companies 
              user={user} 
              onLogout={handleLogout}
              onAddProduct={goToAddProduct}
            />
          )}
          {currentView === 'addProduct' && (
            <AddProduct onBack={goToCompanies} />
          )}
        </>
      )}
    </div>
  );
}

export default App;