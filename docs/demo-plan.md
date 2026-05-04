# Plani i Prezantimit - GlowAI ✨🎀

## 1. Çka është projekti dhe kujt i shërben?
GlowAI është një aplikacion inteligjent (Modern iOS App UI) që ndihmon entuziastët e kujdesit të lëkurës të gjejnë alternativa më të lira (dupes) për produktet luksoze. 
Duke përdorur AI për të analizuar përbërësit (ingredients), aplikacioni ofron sugjerime të bazuara në shkencë, duke i kursyer përdoruesve kohë dhe para. I shërben çdo personi që dëshiron një rutinë cilësore skincare pa shpenzuar buxhet të tepruar.

## 2. Flow-i kryesor që do të demonstroj
Gjatë demos sime të shkurtër (5-7 min), do të ndjek këtë rrjedhë:
1. **Landing Page:** Prezantimi i ndërfaqes (Soft Pink Aesthetic) dhe seksionit "Trending Dupes".
2. **Autentikimi:** Hyrja në aplikacion për të përdorur chat-in.
3. **AI Search:** Kërkimi live i një produkti të njohur (psh. "Dior Lip Glow Oil").
4. **Analiza:** Shpjegimi i përgjigjes së strukturuar të AI në formë tabele.
5. **Koleksioni:** Ruajtja e produktit dhe shfaqja e "Saved Dupes" në databazë.

## 3. Pjesët teknike që do shpjegoj
- **Integrimi i AI:** Përdorimi i Qwen/HuggingFace API dhe instruksionet specifike (System Prompt) për ta detyruar AI të kthejë një format JSON ekzakt.
- **Backend/Auth:** Lidhja me Supabase për autentikimin e përdoruesve dhe ruajtjen e të dhënave (dupes) në kohë reale.
- **UI/UX:** Zgjedhjet e dizajnit me inline-styling dhe CSS për të krijuar një ndjesi të një "Aplikacioni iOS Modern".

## 4. Çfarë kam kontrolluar para demos
- [x] Linku i Vercel funksionon saktë.
- [x] API Key e HuggingFace është vendosur saktë në Environment Variables te Vercel.
- [x] Databaza e Supabase pranon ruajtjen e të dhënave të reja.
- [x] Dizajni është testuar dhe duket estetikisht pastër.

## 5. Plani B (Nëse live demo dështon)
Në rast se ka probleme me rrjetin, Vercel-in ose API-n e HuggingFace:
- Kam një video (screen-recording) të gatshme të përdorimit të aplikacionit.
- Mund ta ekzekutoj aplikacionin edhe lokalisht (localhost) nga VS Code.