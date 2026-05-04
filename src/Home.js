import React from 'react';
import { useNavigate } from 'react-router-dom';

const TRENDING_DUPES = [
  { id: 1, brand: "Dior", product: "Lip Glow Oil", dupe: "NYX Fat Oil", price: "€35 ➔ €9", icon: "💄" },
  { id: 2, brand: "Drunk Elephant", product: "Protini Cream", dupe: "Inkey List Peptide", price: "€68 ➔ €15", icon: "🧴" },
  { id: 3, brand: "Charlotte Tilbury", product: "Flawless Filter", dupe: "e.l.f. Halo Glow", price: "€49 ➔ €14", icon: "✨" }
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      fontFamily: "'Inter', sans-serif", // Font modern aplikacionesh
      color: '#333', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#FDF2F8', // Roze shume e hapur (App Background)
    }}>
      
      {/* App Header / Hero */}
      <header style={{ 
        textAlign: 'center', 
        padding: '50px 20px 30px', 
      }}>
        <div style={{ 
          display: 'inline-block', 
          background: 'white', 
          padding: '8px 16px', 
          borderRadius: '20px', 
          fontSize: '13px', 
          fontWeight: '600', 
          color: '#F472B6', 
          boxShadow: '0 4px 15px rgba(244, 114, 182, 0.15)',
          marginBottom: '20px'
        }}>
          GlowAI Version 1.0 🎀
        </div>
        <h1 style={{ 
          fontSize: '42px', 
          fontWeight: '800', 
          margin: '0 0 15px 0',
          letterSpacing: '-1px',
          color: '#1F2937'
        }}>
          Skincare, but make it <span style={{ color: '#F472B6' }}>affordable.</span>
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7280', maxWidth: '400px', margin: '0 auto 30px auto', lineHeight: '1.5' }}>
          Your AI bestie for finding the perfect dupes.
        </p>
        
        <button 
          onClick={() => navigate('/chat')}
          style={{ 
            padding: '16px 32px', 
            fontSize: '16px', 
            fontWeight: '700', 
            background: '#F472B6', // Solid Pink Button
            color: 'white', 
            border: 'none',
            borderRadius: '16px', // Kende si iPhone App
            cursor: 'pointer', 
            boxShadow: '0 10px 25px rgba(244, 114, 182, 0.4)', // Hije e forte
            transition: 'transform 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 auto'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Open Chat 💬
        </button>
      </header>

      {/* Widgets Section (Si Karta Aplikacioni) */}
      <main style={{ 
        flex: 1, 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '20px 20px 60px',
        width: '100%',
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '700', color: '#374151' }}>
          Trending This Week 🔥
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
          gap: '20px' 
        }}>
          {TRENDING_DUPES.map(item => (
            <div key={item.id} style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '24px', // Shume e rrumbullakosur (App style)
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)', // Hije e bute si re
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '12px', color: '#F472B6', fontWeight: '700', textTransform: 'uppercase' }}>
                  {item.brand}
                </div>
                <div style={{ fontSize: '24px' }}>{item.icon}</div>
              </div>
              
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937' }}>
                {item.product}
              </div>
              
              <div style={{ background: '#FDF2F8', padding: '12px', borderRadius: '12px', marginTop: 'auto' }}>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>AI Match:</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>{item.dupe}</div>
                <div style={{ fontSize: '12px', color: '#10B981', fontWeight: '600', marginTop: '4px' }}>{item.price}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}