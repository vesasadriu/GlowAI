import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function SavedDupes({ session, refreshKey }) {
  const [dupes, setDupes] = useState([]);

  useEffect(() => {
    if (session) fetchDupes();
  }, [session, refreshKey]);

  const fetchDupes = async () => {
    const { data, error } = await supabase
      .from('saved_dupes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setDupes(data);
  };

  const fshiProduktin = async (id_e_produktit) => {
    // 1. I themi Supabase të fshijë rreshtin nga tabela e saktë (saved_dupes)
    const { error } = await supabase
      .from('saved_dupes') 
      .delete()
      .eq('id', id_e_produktit);

    if (error) {
      alert("Gabim gjatë fshirjes: " + error.message);
    } else {
      // 2. Nëse fshihet me sukses në DB, e heqim direkt nga ekrani
      // Përdorim variablat 'setDupes' dhe 'dupes' që ekzistojnë në këtë komponent
      setDupes(dupes.filter(produkt => produkt.id !== id_e_produktit));
    }
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '20px', margin: 0 }}>Koleksioni im 🧴</h3>
        <span style={{ fontSize: '13px', color: '#888' }}>{dupes.length} Produkte</span>
      </div>

      {dupes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '1px dashed #ccc' }}>
          <p style={{ color: '#888', margin: 0 }}>Nuk ke ruajtur ende asnjë produkt.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {dupes.map((item) => (
            <div key={item.id} style={{ 
              background: 'white', padding: '20px', borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #eee',
              position: 'relative' // SHTUAR: Për të lejuar pozicionimin e butonit X
            }}>
              
              {/* Butoni i fshirjes */}
              <button 
                onClick={() => fshiProduktin(item.id)}
                style={{
                  position: 'absolute', top: '15px', right: '15px',
                  background: 'none', border: 'none', color: '#ccc',
                  fontSize: '14px', cursor: 'pointer', padding: '5px'
                }}
                onMouseOver={(e) => e.target.style.color = '#dc2626'} // Bëhet i kuq kur kalon mausin
                onMouseOut={(e) => e.target.style.color = '#ccc'}
                title="Fshi produktin"
              >
                ✖
              </button>

              <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Original</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#111', paddingRight: '20px' }}>{item.original_product}</div>
              
              <div style={{ color: '#16a34a', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>GlowAI Dupe</div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>{item.dupe_product}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}