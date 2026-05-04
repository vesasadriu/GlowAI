import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function SavedDupes({ session, refreshKey }) {
  const [dupes, setDupes] = useState([]);
  
  // SHTUAR: State për gabimet e fshirjes dhe për të ditur cili element po fshihet
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);

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
    setErrorMsg(""); // Pastrojmë error-et e vjetra
    setDeletingId(id_e_produktit); // Tregojmë që po fillon fshirja për këtë ID

    const { error } = await supabase
      .from('saved_dupes') 
      .delete()
      .eq('id', id_e_produktit);

    if (error) {
      // ZËVENDËSOJMË ALERT-IN ME ERROR STATE VIZUAL
      setErrorMsg("Delete failed: " + error.message);
      setDeletingId(null);
    } else {
      setDupes(dupes.filter(produkt => produkt.id !== id_e_produktit));
      setDeletingId(null);
    }
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '20px', margin: 0 }}>My collection💌</h3>
        <span style={{ fontSize: '13px', color: '#888' }}>{dupes.length} Products</span>
      </div>

      {/* SHTUAR: Kutia e Error-it për fshirjen */}
      {errorMsg && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #f87171', fontSize: '14px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {dupes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '1px dashed #ccc' }}>
          <p style={{ color: '#888', margin: 0 }}>No products saved yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {dupes.map((item) => (
            <div key={item.id} style={{ 
              background: 'white', padding: '20px', borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #eee',
              position: 'relative',
              opacity: deletingId === item.id ? 0.5 : 1 // SHTUAR: Zbehet pak kur po fshihet
            }}>
              
              {/* Butoni i fshirjes */}
              <button 
                onClick={() => fshiProduktin(item.id)}
                disabled={deletingId === item.id} // Bllokon klikimet e tjera ndërkohë që po fshihet
                style={{
                  position: 'absolute', top: '15px', right: '15px',
                  background: 'none', border: 'none', color: '#ccc',
                  fontSize: '14px', cursor: deletingId === item.id ? 'not-allowed' : 'pointer', padding: '5px'
                }}
                onMouseOver={(e) => { if (deletingId !== item.id) e.target.style.color = '#dc2626'; }} 
                onMouseOut={(e) => { if (deletingId !== item.id) e.target.style.color = '#ccc'; }}
                title="Fshi produktin"
              >
                {deletingId === item.id ? "⌛" : "✖"}
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