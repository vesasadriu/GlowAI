import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from './supabaseClient';
import Auth from './Auth';
import SavedDupes from './SavedDupes';
import Home from './Home'; 
import './App.css';

const SYSTEM_PROMPT = `You are an AI Cosmetic Ingredient Analyst and Skincare Dupe Finder.

Your job is to analyze cosmetic ingredient lists and recommend affordable drugstore alternatives to expensive skincare products. Your responses must be scientifically grounded and easy to understand for skincare consumers.

Rules you must follow:
1. Always identify the key active ingredients in the product before suggesting a dupe.
2. When suggesting alternatives, prioritize ingredient similarity over brand popularity.
3. Clearly explain why the suggested product is similar based on its formula.
4. If the user provides skin type or concerns (acne, oily skin, sensitivity), tailor the recommendation accordingly.
5. Format answers with clear sections: Active Ingredients, Suggested Dupe, and Reason for Similarity. Use Markdown tables where appropriate.
6. Avoid unsafe medical claims and never guarantee results.
7. Keep explanations concise but informative for skincare beginners.
8. CRITICAL INSTRUCTION: You must return your FINAL response strictly as a JSON object with exactly 3 fields:
   - "reply": Your full explanation formatted in Markdown.
   - "original_product": Only the short name of the expensive product asked by the user (e.g., "Dior Lip Oil").
   - "dupe_product": Only the short name of your recommended affordable alternative (e.g., "NYX Fat Oil").
   Do NOT output any other text or markdown code blocks (like \`\`\`json) outside of the JSON object.

Audience: everyday skincare users looking for affordable alternatives to high-end cosmetics.
Tone: professional, helpful, and educational.`;

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
      setError("Please write the name of a product!");
      return;
    }
    setLoading(true);
    setAiData(null);
    setError("");
    setIsSaved(false);
    setSaveError("");
    
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

      if (!res.ok) throw new Error("API failed.");
      const data = await res.json();
      const rawAiResponse = data.choices[0].message.content;
      
      const start = rawAiResponse.indexOf('{');
      const end = rawAiResponse.lastIndexOf('}');
      const parsed = JSON.parse(rawAiResponse.substring(start, end + 1));

      setAiData({
        reply: parsed.reply.replace(/\\n/g, '\n'),
        original_product: parsed.original_product,
        dupe_product: parsed.dupe_product
      });
    } catch (err) {
      console.error(err);
      setError("There is a problem with AI. Please try again.");
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
      setSaveError("Failed to save.");
    }
    setSaving(false);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FDF2F8", padding: "20px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        
        {/* App Navbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'white', padding: '15px 25px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h1 onClick={() => navigate('/')} style={{ fontSize: '22px', cursor: 'pointer', margin: 0, fontWeight: '800', color: '#F472B6' }}>
            GlowAI ✨
          </h1>
          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '12px', border: 'none', background: '#F3F4F6', color: '#4B5563', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            Log out
          </button>
        </div>

        {/* Search Input Card */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', marginBottom: '30px' }}>
          {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>⚠️ {error}</div>}
          
          <textarea
            rows="3"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a product name (e.g. Dior Lip Oil)..."
            style={{ width: "100%", padding: "16px", borderRadius: "16px", border: "2px solid #FDF2F8", fontSize: "15px", outline: 'none', resize: 'none', backgroundColor: "#FAFAFA", fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
          <button 
            onClick={handleSubmit} 
            disabled={loading} 
            style={{ width: '100%', marginTop: '15px', padding: '16px', background: '#F472B6', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 4px 15px rgba(244, 114, 182, 0.3)' }}
          >
            {loading ? "Searching Database... 🔍" : "Find Dupe ✨"}
          </button>
        </div>

        {/* AI Response Card */}
        {aiData && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #FDF2F8', paddingBottom: '15px' }}>
              <div style={{ background: '#F472B6', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>🤖</div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#1F2937' }}>GlowAI Match</h3>
            </div>
            
            <div className="ai-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiData.reply}</ReactMarkdown>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              {saveError && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{saveError}</div>}
              <button 
                onClick={handleAutoSave} 
                disabled={saving || isSaved} 
                style={{ width: '100%', padding: '14px', borderRadius: '16px', background: isSaved ? '#10B981' : '#1F2937', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}
              >
                {isSaved ? "Saved to Collection ✓" : "Save this Dupe 💾"}
              </button>
            </div>
          </div>
        )}
        
        <SavedDupes session={session} refreshKey={refreshKey} />
      </div>
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
        <Route path="/" element={<Home />} />
        <Route 
          path="/chat" 
          element={!session ? <Auth /> : <ChatPage session={session} refreshKey={refreshKey} setRefreshKey={setRefreshKey} />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;