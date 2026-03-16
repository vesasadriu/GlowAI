import { useState } from "react";

function App() {

const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
const [response, setResponse] = useState("");

const handleSubmit = async () => {

setLoading(true);

const res = await fetch("http://localhost:8000/chat", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({ message: input })
});

const data = await res.json();

setResponse(data.reply);
setLoading(false);

};

return (

<div style={{maxWidth:"600px",margin:"auto",padding:"40px"}}>

<h1>GlowAI</h1>

<textarea
rows="4"
value={input}
onChange={(e)=>setInput(e.target.value)}
placeholder="Ask about skincare products..."
style={{width:"100%",padding:"10px"}}
/>

<br/>

<button onClick={handleSubmit} style={{marginTop:"10px"}}>
Send
</button>

{loading && <p>Loading...</p>}

{response && (
<div>
<h3>AI Response:</h3>
<p>{response}</p>
</div>
)}

</div>

);

}

export default App;