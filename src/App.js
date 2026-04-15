import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from './supabaseClient';
import Auth from './Auth';
import SavedDupes from './SavedDupes';
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

function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  
  const [aiData, setAiData] = useState(null); 
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // <-- SHTUAR: State për menaxhimin e gabimeve dhe suksesit
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const handleLogout = () => {
    supabase.auth.signOut();
    setAiData(null);
    setError("");
  }

  const handleSubmit = async () => {
    // EDGE CASE 1: Kontrolli për input bosh
    if (!input.trim()) {
      setError("Ju lutem shkruani një produkt për të kërkuar një alternativë!");
      return;
    }

    setLoading(true);
    setAiData(null); 
    setError(""); // Pastro gabimin e kaluar
    setIsSaved(false); // Reseto butonin e ruajtjes
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
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: input }
          ],
          max_tokens: 2000,
          temperature: 0.7
        }),
      });

      if (!res.ok) throw new Error("API dështoi të përgjigjet.");

      const data = await res.json();
      const rawAiResponse = data.choices[0].message.content;

      let tekstFinal = rawAiResponse;
      let orig = null;
      let dupe = null;

      try {
        const start = rawAiResponse.indexOf('{');
        const end = rawAiResponse.lastIndexOf('}');
        const vetemJson = rawAiResponse.substring(start, end + 1);
        const parsed = JSON.parse(vetemJson);
        
        tekstFinal = parsed.reply;
        orig = parsed.original_product;
        dupe = parsed.dupe_product;
      } catch (err) {
        const matchReply = rawAiResponse.match(/"reply"\s*:\s*"([\s\S]*?)",\s*"original_product"/);
        if (matchReply) tekstFinal = matchReply[1];

        const matchOrig = rawAiResponse.match(/"original_product"\s*:\s*"([^"]+)"/);
        if (matchOrig) orig = matchOrig[1];

        const matchDupe = rawAiResponse.match(/"dupe_product"\s*:\s*"([^"]+)"/);
        if (matchDupe) dupe = matchDupe[1];
      }

      tekstFinal = tekstFinal.replace(/\\n/g, '\n');

      setAiData({
        reply: tekstFinal,
        original_product: orig,
        dupe_product: dupe
      });
      
    } catch (error) {
      console.error("Gabim:", error);
      // EDGE CASE 2: Mesazh gabimi në vend që të ngrijë aplikacioni
      setError("Pati një problem gjatë komunikimit me AI. Ju lutem provoni përsëri pak më vonë.");
    } finally {
      // EDGE CASE 3: Lirimi i butonit pavarësisht nëse ka sukses apo error
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!session || !aiData || !aiData.original_product) return;
    setSaving(true);
    setSaveError("");

    const { error } = await supabase.from('saved_dupes').insert([
      { 
        user_id: session.user.id, 
        original_product: aiData.original_product, 
        dupe_product: aiData.dupe_product 
      }
    ]);

    if (!error) {
      // ZËVENDËSIMI I ALERT-IT: Shfaqim suksesin dhe pastrojmë pas 1.5 sekondash
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setInput(""); 
        setAiData(null); 
        setRefreshKey(prev => prev + 1); 
      }, 1500);
    } else {
      setSaveError("Nuk mundëm të ruajmë produktin: " + error.message);
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
            
            {/* KUTIA E ERROREVE (Shfaqet vetëm kur ka gabim) */}
            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #f87171', fontSize: '14px' }}>
                ⚠️ {error}
              </div>
            )}

            <textarea
              rows="3"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(""); // Hiq errorin kur nis të shkruajë prapë
              }}
              placeholder="P.sh. Dua një dupe për Tatcha Water Cream..."
              style={{ 
                width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #e0e0e0", 
                fontSize: "16px", outline: "none", resize: "none", backgroundColor: "#fafafa"
              }}
            />
            <button 
              onClick={handleSubmit} 
              disabled={loading} // Parandalon klikimin e dyfishtë
              style={{ 
                marginTop: "15px", padding: "14px 24px", background: "#111", 
                color: "#fff", border: "none", borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer", 
                fontSize: "16px", fontWeight: "600", width: "100%", opacity: loading ? 0.7 : 1
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
              
              {aiData.original_product && aiData.dupe_product && (
                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #ddd', textAlign: 'center' }}>
                  
                  {/* Gabimi gjatë ruajtjes nëse ndodh */}
                  {saveError && <div style={{ color: '#991b1b', marginBottom: '10px', fontSize: '14px' }}>{saveError}</div>}
                  
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                    Dëshiron ta ruash këtë krahasim?
                  </p>
                  <button 
                    onClick={handleAutoSave} 
                    disabled={saving || isSaved} // Parandalon klikimin e shumëfishtë
                    style={{ 
                      padding: "12px 24px", 
                      background: isSaved ? "#10b981" : "#f472b6", // Bëhet jeshile kur ruhet
                      color: "white", 
                      border: "none", borderRadius: "20px", cursor: (saving || isSaved) ? "default" : "pointer", 
                      fontSize: "15px", fontWeight: "600", transition: "background 0.3s"
                    }}
                  >
                    {saving ? "Po ruhet..." : isSaved ? "U ruajt ✓" : "💾 Ruaj në Koleksionin Tim"}
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