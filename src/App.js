import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from './supabaseClient';
import Auth from './Auth';
import SavedDupes from './SavedDupes';
import Home from './Home'; 
import './App.css';

// KETU ISHTE PROBLEMI - Duhet te jete i perkufizuar lart fare:
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
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer', margin: 0, fontSize: '28px' }}>✨GlowAI✨</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #ddd', background: 'transparent' }}>Log Out</button>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginBottom: '40px' }}>
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>⚠️ {error}</div>}
        <textarea
          rows="3"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Find me a dupe for..."
          style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #eee", fontSize: "16px", outline: 'none', resize: 'none' }}
        />
        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', marginTop: '10px', padding: '15px', borderRadius: '12px', background: '#111', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? "Searching..." : "Find Dupe"}
        </button>
      </div>

      {aiData && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #eee', marginBottom: '40px' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiData.reply}</ReactMarkdown>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
             {saveError && <div style={{ color: 'red', marginBottom: '10px' }}>{saveError}</div>}
             <button onClick={handleAutoSave} disabled={saving || isSaved} style={{ padding: '12px 24px', borderRadius: '20px', background: isSaved ? '#10b981' : '#f472b6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
               {isSaved ? "Saved✓" : "💾Save to your collection"}
             </button>
          </div>
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