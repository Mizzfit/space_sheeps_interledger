import React from 'react';
import '../css/Companies.css'; 
// JSON simulando datos de API
const mockCompaniesData = [
  {
    id: 1,
    nombre: "Tech Solutions",
    imagen: "https://via.placeholder.com/600x400/666/fff?text=Tech+Solutions",
    descripcion: "Empresa líder en soluciones tecnológicas innovadoras",
    linkReferido: "https://example.com/ref/tech-solutions"
  },
  {
    id: 2,
    nombre: "Green Energy Co",
    imagen: "https://via.placeholder.com/600x400/666/fff?text=Green+Energy",
    descripcion: "Energía renovable para un futuro sostenible",
    linkReferido: "https://example.com/ref/green-energy"
  },
  {
    id: 3,
    nombre: "Fashion Hub",
    imagen: "https://via.placeholder.com/600x400/666/fff?text=Fashion+Hub",
    descripcion: "Las últimas tendencias en moda y estilo",
    linkReferido: "https://example.com/ref/fashion-hub"
  },
  {
    id: 4,
    nombre: "Food Delivery Express",
    imagen: "https://via.placeholder.com/600x400/666/fff?text=Food+Express",
    descripcion: "Entrega rápida de tus comidas favoritas",
    linkReferido: "https://example.com/ref/food-delivery"
  }
];

const Companies = ({ user, onLogout, onAddProduct }) => {
    return (
      <div>
        <header className="header">
          <div className="searchContainer">
            <input 
              type="text" 
              placeholder="Buscar empresas..." 
              className="searchInput"
            />
            <span className="searchIcon">🔍</span>
          </div>
          <button className="sellButton" onClick={onAddProduct}>Vender</button>
        </header>
  
        <main className="main">
          <h1 className="title">Categorías</h1>
          
          <div className="grid">
            {mockCompaniesData.map((company) => (
              <div key={company.id} className="card">
                <div className="cardHeader">
                  <h3 className="cardTitle">{company.nombre}</h3>
                </div>
                
                <div className="imageContainer">
                  <img 
                    src={company.imagen} 
                    alt={company.nombre}
                    className="image"
                  />
                </div>
                
                <div className="cardFooter">
                  <p className="description">{company.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  };

export default Companies;