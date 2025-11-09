import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import { animateCards } from '../animations/cardAnimations';
import transition from '../animations/transition';
import '../css/Companies.css'; 

const Companies = ({ user, onLogout, onAddProduct, onSelectCompany }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Referencias para las cards
  const cardRefs = useRef([]);

  useEffect(() => {
    // Cargar productos desde el backend
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: searchQuery })
        });
        
        const data = await response.json();
        
        const mappedProducts = data.map(product => ({
          id: product.id,
          nombre: product.title,
          imagen: product.image,
          descripcion: product.description,
          linkReferido: `https://example.com/ref/${product.id}`,
          sector: product.sector,
          price: product.price
        }));
        
        setProducts(mappedProducts);
      } catch (err) {
        setError('Error de conexión con el servidor');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  // Animar cards cuando los productos carguen
  useEffect(() => {
    if (!loading && products.length > 0 && cardRefs.current.length > 0) {
      // Filtrar nulls de las referencias
      const validRefs = cardRefs.current.filter(ref => ref !== null);
      animateCards(validRefs);
    }
  }, [loading, products]);

  if (loading) {
    return (
      <div>
        <Header 
          rightButton={
            <button onClick={onLogout} className="header-button secondary">
              Cerrar Sesión
            </button>
          }
        />
        <div style={{ 
          color: '#000', 
          textAlign: 'center', 
          padding: '3rem',
          fontSize: '1.5rem' 
        }}>
          Cargando productos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header 
          rightButton={
            <button onClick={onLogout} className="header-button secondary">
              Cerrar Sesión
            </button>
          }
        />
        <div style={{ 
          color: '#000', 
          textAlign: 'center', 
          padding: '3rem',
          fontSize: '1.5rem' 
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Usar el Header reutilizable */}
      <Header 
        showSearch={true}
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        rightButton={
          <>
            <button onClick={onAddProduct} className="header-button">
              Vender
            </button>
            <button 
              onClick={onLogout} 
              className="header-button secondary" 
              style={{ marginLeft: '1rem' }}
            >
              Cerrar Sesión
            </button>
          </>
        }
      />

      <main className="main">
        <h1 className="title">Categorías</h1>
        
        <div className="grid">
          {products.map((company, index) => (
            <div 
              key={company.id} 
              ref={el => cardRefs.current[index] = el}
              className="card"
              onClick={() => onSelectCompany(company)}
              style={{ cursor: 'pointer' }}
            >
            <div className="imageContainer">
                <img 
                  src={company.imagen} 
                  alt={company.nombre}
                  className="image"
                />
            </div>

            
              
            <div className="cardFooter">
                <div className="cardHeader">
                    <h3 className="cardTitle">{company.nombre}</h3>
                </div>
                    <p className="description">{company.descripcion}</p>
                </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default transition(Companies);