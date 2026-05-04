import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 
  const [isLogin, setIsLogin] = useState(true); 
  
  // <-- SHTUAR: State për të mbajtur mesazhet e gabimit/suksesit
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' }); // Pastro mesazhin e vjetër
    
    // VALIDIMI PA ALERT (Shfaqet si tekst i kuq)
    if (!email || !password || (!isLogin && !name)) {
      return setMessage({ type: 'error', text: "Please fill out all blank areas!" });
    }
    if (password.length < 6) {
      return setMessage({ type: 'error', text: "Password must have at least 6 characters!" });
    }

    setLoading(true);

    if (isLogin) {
      // LOGJIKA E LOGIN
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      }
      // Shënim: Nëse ka sukses, App.js e kap vetë "session" dhe e mbyll këtë faqe automatikisht.
    } else {
      // LOGJIKA E SIGN UP
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name: name }
        }
      });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: "Account created! You can Log In now." });
        setTimeout(() => {
          setIsLogin(true); // E kalon automatikisht te forma e Login pas suksesit
          setMessage({ type: '', text: '' });
        }, 2000);
      }
    }
    
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 10px', fontSize: '24px', color: '#111' }}>
          {isLogin ? "Welcome to ✨GlowAI✨" : "Create account🤍"}
        </h2>
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
          {isLogin ? "Log In to save your products." : "Sign Up to start."}
        </p>

        {/* <-- SHTUAR: Kutia e Mesazheve (Error ose Sukses) në vend të alert() --> */}
        {message.text && (
          <div style={{ 
            background: message.type === 'error' ? '#fee2e2' : '#d1fae5', 
            color: message.type === 'error' ? '#991b1b' : '#065f46', 
            padding: '10px', 
            borderRadius: '8px', 
            marginBottom: '15px', 
            fontSize: '14px', 
            border: `1px solid ${message.type === 'error' ? '#f87171' : '#34d399'}` 
          }}>
            {message.type === 'error' ? '❌ ' : '✔️ '} {message.text}
          </div>
        )}
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {!isLogin && (
            <input 
              type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} 
              style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '15px', outline: 'none' }}
            />
          )}

          <input 
            type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} 
            style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '15px', outline: 'none' }}
          />
          <input 
            type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} 
            style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '15px', outline: 'none' }}
          />
          
          <button type="submit" disabled={loading} style={{ 
            marginTop: '10px', padding: '12px', background: '#111', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', opacity: loading ? 0.7 : 1
          }}>
            {loading ? "Loading..." : (isLogin ? "Log In" : "Sign Up")}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage({ type: '', text: '' }); // Pastron mesazhet kur ndërron formën
            }} 
            style={{ color: '#f472b6', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isLogin ? "Sign Up" : "Log In"}
          </span>
        </p>
      </div>
    </div>
  );
}