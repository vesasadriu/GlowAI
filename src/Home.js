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
    <div style={{ fontFamily: 'sans-serif', color: '#111' }}>
      {/* Hero Section */}
      <header style={{ 
        textAlign: 'center', padding: '80px 20px', background: 'linear-gradient(180deg, #fff 0%, #fff5f8 100%)',
        borderRadius: '0 0 40px 40px'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', letterSpacing: '-1px' }}>
          GlowAI ✨
        </h1>
        <p style={{ fontSize: '18px', color: '#555', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
          Gjej alternativa (dupes) të lira për produktet luksoze. Analizë shkencore e përbërësve me ndihmën e AI.
        </p>
        
        <button 
          onClick={() => navigate('/chat')}
          style={{ 
            padding: '18px 36px', fontSize: '18px', fontWeight: '700', background: '#111', color: 'white', 
            border: 'none', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }}
        >
          Provo Chatbot-in AI 🤖
        </button>
      </header>

      {/* Trending Section */}
      <main style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>Trending Dupes të Javës 🔥</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {TRENDING_DUPES.map(item => (
            <div key={item.id} style={{ 
              background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #eee',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '12px', color: '#f472b6', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
                {item.brand}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>{item.product}</div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', padding: '10px', borderRadius: '12px' }}>
                <span style={{ fontSize: '20px' }}>✅</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a' }}>{item.dupe}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Kursimi: {item.saving}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}