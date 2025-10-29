# 🤖 Bot WhatsApp – Clínica Blanquer (Meta Cloud API + Vercel) – v3

Compatível 100% com Vercel (runtime nodejs18).

## 🚀 Deploy
1. Acesse https://vercel.com → **New Project → Import Project**
2. Quando aparecer **Framework Preset**, escolha **Other**
3. Em **Environment Variables**, adicione:
   - `VERIFY_TOKEN` = `clinica_token`
   - `WHATSAPP_TOKEN` = cole o token do painel Meta
4. Clique em **Deploy**
5. Acesse `https://SEU-APP.vercel.app/api/webhook` → deve mostrar `Token inválido` ✅
6. Vá ao painel da Meta → Configurações → Webhook URL → cole a mesma URL.
