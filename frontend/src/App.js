import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from './supabaseClient';
import Auth from './Auth';
import SavedDupes from './SavedDupes';
import './App.css'; // Aktivizon stilin global

function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  
  // State i ri: Ruan gjithë objektin JSON që vjen nga backend
  const [aiData, setAiData] = useState(null); 
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const handleLogout = () => {
    supabase.auth.signOut();
    setAiData(null);
  }

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setAiData(null); // Pastron ekranin

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      
      // Variablat ku do të ruajmë të dhënat e pastruara
      let tekstFinal = data.reply;
      let orig = null;
      let dupe = null;

      try {
        // PROVA 1: Përpiqemi ta lexojmë si format JSON perfekt
        const start = data.reply.indexOf('{');
        const end = data.reply.lastIndexOf('}');
        const vetemJson = data.reply.substring(start, end + 1);
        const parsed = JSON.parse(vetemJson);
        
        tekstFinal = parsed.reply;
        orig = parsed.original_product;
        dupe = parsed.dupe_product;
      } catch (error) {
        // PROVA 2 (PLANI B): Nëse AI bën gabim sintakse, i gjejmë të dhënat manualisht!
        
        // Gjen vetëm tekstin e shpjegimit
        const matchReply = data.reply.match(/"reply"\s*:\s*"([\s\S]*?)",\s*"original_product"/);
        if (matchReply) tekstFinal = matchReply[1];

        // Gjen emrin e produktit të shtrenjtë
        const matchOrig = data.reply.match(/"original_product"\s*:\s*"([^"]+)"/);
        if (matchOrig) orig = matchOrig[1];

        // Gjen emrin e dupe-it
        const matchDupe = data.reply.match(/"dupe_product"\s*:\s*"([^"]+)"/);
        if (matchDupe) dupe = matchDupe[1];
      }

      // Kthejmë rreshtat e rinj fiktivë (\n) në rreshta të rinj të vërtetë për ekranin
      tekstFinal = tekstFinal.replace(/\\n/g, '\n');

      // Tani i japim React-it një objekt perfekt, pa kllapa!
      setAiData({
        reply: tekstFinal,
        original_product: orig,
        dupe_product: dupe
      });
      
    } catch (error) {
      console.error("Gabim:", error);
      setAiData({ reply: "Ndodhi një gabim me serverin." });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!session || !aiData || !aiData.original_product) return;
    setSaving(true);

    const { error } = await supabase.from('saved_dupes').insert([
      { 
        user_id: session.user.id, 
        original_product: aiData.original_product, 
        dupe_product: aiData.dupe_product 
      }
    ]);

    if (!error) {
      alert("Produkti u ruajt me sukses!");
      setInput(""); 
      setAiData(null); // Fshin ekranin pasi ruhet që të duket pastër
      setRefreshKey(prev => prev + 1); 
    } else {
      alert("Gabim gjatë ruajtjes: " + error.message);
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      
      {/* Headeri Kryesor */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ margin: 0, color: '#111', fontSize: '28px', letterSpacing: '-0.5px' }}>GlowAI ✨</h1>
        {session && (
          <button onClick={handleLogout} style={{ 
            padding: '8px 16px', background: 'transparent', border: '1px solid #ddd', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', color: '#555'
          }}>Dil (Log Out)</button>
        )}
      </div>

      {!session ? (
        <Auth />
      ) : (
        <>
          {/* Zona e Kërkimit */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#333', marginTop: 0, marginBottom: '15px' }}>Gjej Alternativa të Lira</h2>
            <textarea
              rows="3"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="P.sh. Dua një dupe për Tatcha Water Cream..."
              style={{ 
                width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #e0e0e0", 
                fontSize: "16px", outline: "none", resize: "none", backgroundColor: "#fafafa"
              }}
            />
            <button 
              onClick={handleSubmit} disabled={loading}
              style={{ 
                marginTop: "15px", padding: "14px 24px", background: loading ? "#ccc" : "#111", 
                color: "#fff", border: "none", borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer", 
                fontSize: "16px", fontWeight: "600", width: "100%"
              }}
            >
              {loading ? "✨ Duke kërkuar..." : "Analizo Përbërësit"}
            </button>
          </div>

          {/* Përgjigja e AI dhe Butoni Ruaj */}
          {aiData && aiData.reply && (
            <div style={{ 
              padding: "30px", border: "1px solid #eee", borderRadius: "16px", 
              backgroundColor: "white", lineHeight: "1.7", marginBottom: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {aiData.reply}
              </ReactMarkdown>
              
              {/* Shfaqet vetëm nëse backend ktheu emrat specifikë */}
              {aiData.original_product && aiData.dupe_product && (
                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #ddd', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                    Dëshiron ta ruash këtë krahasim?
                  </p>
                  <button 
                    onClick={handleAutoSave} disabled={saving}
                    style={{ 
                      padding: "12px 24px", background: "#f472b6", color: "white", 
                      border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "15px", fontWeight: "600"
                    }}
                  >
                    {saving ? "Po ruhet..." : "💾 Ruaj në Koleksionin Tim"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Koleksioni i Objekteve të Ruajtura */}
          <SavedDupes session={session} refreshKey={refreshKey}/>
        </>
      )}
    </div>
  );
}

export default App;