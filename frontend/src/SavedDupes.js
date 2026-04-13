import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function SavedDupes({ session, refreshKey }) {
  const [dupes, setDupes] = useState([]);

  useEffect(() => {
    if (session) fetchDupes();
  }, [session, refreshKey]);

  const fetchDupes = async () => {
    const { data, error } = await supabase.from('saved_dupes').select('*').order('created_at', { ascending: false });
    if (!error) setDupes(data);
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
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #eee'
            }}>
              <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Original</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#111' }}>{item.original_product}</div>
              
              <div style={{ color: '#16a34a', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>GlowAI Dupe</div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>{item.dupe_product}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}