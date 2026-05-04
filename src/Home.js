import React from 'react';
import { useNavigate } from 'react-router-dom';

const TRENDING_DUPES = [
  { id: 1, brand: "Dior", product: "Lip Glow Oil", dupe: "NYX Fat Oil Lip Drip", saving: "€35 -> €9" },
  { id: 2, brand: "Drunk Elephant", product: "Protini Polypeptide", dupe: "The Inkey List Peptide", saving: "€68 -> €15" },
  { id: 3, brand: "Charlotte Tilbury", product: "Flawless Filter", dupe: "e.l.f. Halo Glow", saving: "€49 -> €14" }
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      fontFamily: 'sans-serif', 
      color: '#111', 
      height: '100vh',       
      display: 'flex',         
      flexDirection: 'column',  
      overflow: 'hidden',       
      backgroundColor: '#fff'
    }}>
      
      {/* Hero Section */}
      <header style={{ 
        textAlign: 'center', 
        padding: '40px 20px',  
        background: 'linear-gradient(180deg, #fff 0%, #fff5f8 100%)',
        borderRadius: '0 0 40px 40px',
        flexShrink: 0         
      }}>
        <h1 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '10px', letterSpacing: '-1px' }}>
          GlowAI ✨
        </h1>
        <p style={{ fontSize: '16px', color: '#555', maxWidth: '500px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
          Find dupes of high-end products. Ingredient list analysis by AI.
        </p>
        
        <button 
          onClick={() => navigate('/chat')}
          style={{ 
            padding: '14px 30px', fontSize: '16px', fontWeight: '700', background: '#111', color: 'white', 
            border: 'none', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }}
        >
          Try GlowAI Chatbot 🤖
        </button>
      </header>

      {/* Trending Section */}
      <main style={{ 
        flex: 1,                
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '20px',
        width: '100%'
      }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}>Trending Dupes of the week 💫</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '15px' 
        }}>
          {TRENDING_DUPES.map(item => (
            <div key={item.id} style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '20px', 
              border: '1px solid #eee',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '11px', color: '#f472b6', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>
                {item.brand}
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>{item.product}</div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', padding: '10px', borderRadius: '12px' }}>
                <span style={{ fontSize: '18px' }}>✅</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a' }}>{item.dupe}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Save: {item.saving}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}