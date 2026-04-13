from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()  # kjo lexon .env
api_key = os.getenv("HUGGINGFACE_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. POINT THE CLIENT TO HUGGING FACE INSTEAD OF OPENAI
client = OpenAI(
    base_url="https://router.huggingface.co/v1",  # <--- New address!
    api_key=api_key
)

class ChatRequest(BaseModel):
    message: str

# This is the "brain" of your app
SYSTEM_PROMPT = """You are an AI Cosmetic Ingredient Analyst and Skincare Dupe Finder.

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
   Do NOT output any other text or markdown code blocks (like ```json) outside of the JSON object.

Audience: everyday skincare users looking for affordable alternatives to high-end cosmetics.
Tone: professional, helpful, and educational."""

@app.post("/chat")
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Mesazhi është i zbrazët")
    try:
       response = client.chat.completions.create(
            model="Qwen/Qwen2.5-7B-Instruct", # <--- Added the server tag!
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": request.message}
            ],
            max_tokens=2000, 
            temperature=0.7
        )
       return {"reply": response.choices[0].message.content}
    except Exception as e:
        print(f"THE ERROR IS: {str(e)}") # This will print errors in your terminal
        raise HTTPException(status_code=500, detail=str(e))