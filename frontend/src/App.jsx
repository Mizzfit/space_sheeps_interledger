import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';

import LoginForm from './components/LoginForm';
import Companies from './components/Companies';
import AddProduct from './components/AddProduct';
import ProductDetail from './components/ProductDetail';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('companies');
  const [selectedCompany, setSelectedCompany] = useState(null);

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
    setSelectedCompany(null);
  };

  const goToProductDetail = (company) => {
    setSelectedCompany(company);
    setCurrentView('productDetail');
  };

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <LoginForm key="login" onLogin={handleLogin} />
      ) : (
        <>
          {currentView === 'companies' && (
            <Companies 
              key="companies"
              user={user} 
              onLogout={handleLogout}
              onAddProduct={goToAddProduct}
              onSelectCompany={goToProductDetail}
            />
          )}
          {currentView === 'addProduct' && (
            <AddProduct key="addProduct" onBack={goToCompanies} />
          )}
          {currentView === 'productDetail' && selectedCompany && (
            <ProductDetail 
              key="productDetail"
              company={selectedCompany} 
              onBack={goToCompanies} 
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}

export default App;