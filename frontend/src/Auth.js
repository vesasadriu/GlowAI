import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Shtuam state për Emrin
  const [isLogin, setIsLogin] = useState(true); // Për të ndërruar mes Login dhe Signup

  const handleAuth = async (e) => {
    e.preventDefault();
    
    // VALIDIMI I KËRKUAR NGA DETYRA
    if (!email || !password || (!isLogin && !name)) {
      return alert("Ju lutem plotësoni të gjitha fushat!");
    }
    if (password.length < 6) {
      return alert("Fjalëkalimi duhet të ketë të paktën 6 karaktere!");
    }

    setLoading(true);

    if (isLogin) {
      // LOGJIKA E LOGIN
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    } else {
      // LOGJIKA E SIGN UP ME EMËR
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name: name } // Kështu ruhet emri në Supabase
        }
      });
      if (error) alert(error.message);
      else alert("Llogaria u krijua me sukses!");
    }
    
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 10px', fontSize: '24px', color: '#111' }}>
          {isLogin ? "Mirësevjen në GlowAI ✨" : "Krijo Llogari 🧴"}
        </h2>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px' }}>
          {isLogin ? "Hyr për të ruajtur produktet e tua." : "Regjistrohu për të filluar."}
        </p>
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Fusha e emrit shfaqet VETËM kur jemi në Sign Up */}
          {!isLogin && (
            <input 
              type="text" placeholder="Emri juaj" value={name} onChange={(e) => setName(e.target.value)} 
              style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '15px', outline: 'none' }}
            />
          )}

          <input 
            type="email" placeholder="Emaili yt" value={email} onChange={(e) => setEmail(e.target.value)} 
            style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '15px', outline: 'none' }}
          />
          <input 
            type="password" placeholder="Fjalëkalimi (min. 6 karaktere)" value={password} onChange={(e) => setPassword(e.target.value)} 
            style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '15px', outline: 'none' }}
          />
          
          <button type="submit" disabled={loading} style={{ 
            marginTop: '10px', padding: '12px', background: '#111', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
          }}>
            {loading ? "Po ngarkohet..." : (isLogin ? "Log In" : "Sign Up")}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          {isLogin ? "Nuk ke një llogari? " : "Ke tashmë një llogari? "}
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: '#f472b6', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isLogin ? "Regjistrohu" : "Hyr këtu"}
          </span>
        </p>
      </div>
    </div>
  );
}