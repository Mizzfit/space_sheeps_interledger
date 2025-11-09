import React from 'react';
import '../css/Header.css';

const Header = ({ 
  showSearch = false, 
  searchValue = '', 
  onSearchChange,
  showBackButton = false,
  onBackClick,
  rightButton,
  title = ''
}) => {
  return (
    <header className="app-header">
      <div className="header-content">
        {/* Lado izquierdo - Botón de volver o título */}
        <div className="header-left">
          {showBackButton ? (
            <button onClick={onBackClick} className="back-button">
              ← {title || 'Volver'}
            </button>
          ) : (
            <div className="header-logo">
              <h2>HIVE</h2>
            </div>
          )}
        </div>

        {/* Centro - Búsqueda (opcional) */}
        {showSearch && (
          <div className="header-center">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Buscar productos..." 
                className="search-input"
                value={searchValue}
                onChange={onSearchChange}
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
        )}

        {/* Lado derecho - Botón personalizable */}
        <div className="header-right">
          {rightButton}
        </div>
      </div>
    </header>
  );
};

export default Header;