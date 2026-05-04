import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from './supabaseClient';
import Auth from './Auth';
import SavedDupes from './SavedDupes';
import Home from './Home'; // Importo faqen e re
import './App.css';

// ... (SYSTEM_PROMPT mbetet i njëjtë siç e kishim)

function ChatPage({ session, setRefreshKey, refreshKey }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  }

  const handleSubmit = async () => {
    if (!input.trim()) {
      setError("Ju lutem shkruani një produkt!");
      return;
    }
    setLoading(true);
    setAiData(null);
    setError("");
    setIsSaved(false);
    
    try {
      const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_HUGGINGFACE_API_KEY}`
        },
        body: JSON.stringify({ 
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: input }],
          max_tokens: 2000,
          temperature: 0.7
        }),
      });

      if (!res.ok) throw new Error("API dështoi.");
      const data = await res.json();
      const rawAiResponse = data.choices[0].message.content;
      
      // ... (Logjika e parsing JSON mbetet e njëjtë)
      // Për thjeshtësi po e kaloj direkt te setAiData (përdor logjikën tënde të mëparshme këtu)
      const start = rawAiResponse.indexOf('{');
      const end = rawAiResponse.lastIndexOf('}');
      const parsed = JSON.parse(rawAiResponse.substring(start, end + 1));

      setAiData({
        reply: parsed.reply.replace(/\\n/g, '\n'),
        original_product: parsed.original_product,
        dupe_product: parsed.dupe_product
      });
    } catch (err) {
      setError("Pati një problem me AI. Provoni përsëri.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!session || !aiData) return;
    setSaving(true);
    const { error } = await supabase.from('saved_dupes').insert([
      { user_id: session.user.id, original_product: aiData.original_product, dupe_product: aiData.dupe_product }
    ]);
    if (!error) {
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setAiData(null);
        setInput("");
        setRefreshKey(prev => prev + 1);
      }, 1500);
    } else {
      setSaveError("Gabim në ruajtje.");
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer', margin: 0 }}>GlowAI ✨</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>Dil</button>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginBottom: '40px' }}>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Dua një dupe për..."
          style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #eee", fontSize: "16px" }}
        />
        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', marginTop: '10px', padding: '15px', borderRadius: '12px', background: '#111', color: 'white', cursor: 'pointer' }}>
          {loading ? "Duke kërkuar..." : "Gjej Dupe"}
        </button>
      </div>

      {aiData && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #eee' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiData.reply}</ReactMarkdown>
          <button onClick={handleAutoSave} disabled={saving || isSaved} style={{ marginTop: '20px', padding: '12px 24px', borderRadius: '20px', background: isSaved ? '#10b981' : '#f472b6', color: 'white', border: 'none', cursor: 'pointer' }}>
            {isSaved ? "U ruajt ✓" : "💾 Ruaj Koleksionin"}
          </button>
        </div>
      )}
      
      <SavedDupes session={session} refreshKey={refreshKey} />
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  return (
    <Router>
      <Routes>
        {/* Faqja Kryesore */}
        <Route path="/" element={<Home />} />
        
        {/* Faqja e Chatit - Nëse s'ka session, shkon te Auth */}
        <Route 
          path="/chat" 
          element={!session ? <Auth /> : <ChatPage session={session} refreshKey={refreshKey} setRefreshKey={setRefreshKey} />} 
        />

        {/* Redirect nëse shkruhet rrugë e gabuar */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;