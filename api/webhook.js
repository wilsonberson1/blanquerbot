// WhatsApp Bot (Meta Cloud API) - Clínica Blanquer Saúde Integrativa
// Rota: /api/webhook
import axios from "axios";

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "clinica_token";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "COLE_SEU_TOKEN_DA_META_AQUI";

function menu() {
  return [
    "Olá! 👋",
    "Sou o assistente virtual da *Clínica Blanquer Saúde Integrativa*.",
    "",
    "Como posso te ajudar hoje?",
    "",
    "1️⃣ Agendar consulta",
    "2️⃣ Convênios",
    "3️⃣ Horário de funcionamento",
    "4️⃣ Localização",
    "",
    "Digite *menu* para voltar ao menu a qualquer momento, ou *sair* para deixar o WhatsApp livre."
  ].join("\n");
}

function normalize(text = "") {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

function isGreeting(t) {
  const x = normalize(t);
  return ["oi","ola","olá","bom dia","boa tarde","boa noite","iniciar"].includes(x);
}

function isMenuCommand(t) {
  return normalize(t) === "menu";
}

function isExitCommand(t) {
  const x = normalize(t);
  return x === "sair" || x === "cancelar";
}

function buildReply(text) {
  const raw = (text || "").trim();
  const t = normalize(raw);

  // Comandos sempre válidos
  if (isMenuCommand(raw)) {
    return menu();
  }
  if (isExitCommand(raw)) {
    return "Perfeito! ✅ Canal livre. Quando quiser voltar, digite *menu*.";
  }

  // Opções do menu
  if (t.startsWith("1")) {
    return [
      "Perfeito! 😊",
      "Pode me enviar *nome*, *dia/horário preferencial* e *telefone* para contato.",
      "Encaminharei sua mensagem ao Dr. para finalizar o agendamento.",
      "",
      "Quando quiser voltar ao menu, digite *menu*. Para deixar o WhatsApp livre, digite *sair*."
    ].join("\n");
  }
  if (t.startsWith("2")) {
    return [
      "No momento, realizamos atendimentos *particulares*.",
      "O valor da consulta é de *R$ 190,00*.",
      "Oferecemos *recibo para reembolso* junto ao seu plano de saúde.",
      "",
      "Digite *menu* para voltar ou *sair* para encerrar."
    ].join("\n");
  }
  if (t.startsWith("3")) {
    return [
      "Atendemos de *segunda a sexta*, das *6h às 22h*.",
      "Sempre com horário agendado para melhor te atender!",
      "",
      "Digite *menu* para voltar ou *sair* para encerrar."
    ].join("\n");
  }
  if (t.startsWith("4")) {
    return [
      "Estamos na *Av. Paulista, 807 – Conjunto 425*, São Paulo – SP.",
      "📍 Local de fácil acesso, próximo ao metrô. Será um prazer te receber!",
      "",
      "Digite *menu* para voltar ou *sair* para encerrar."
    ].join("\n");
  }

  // Saudações mostram o menu uma vez
  if (isGreeting(raw)) {
    return menu();
  }

  // 🟢 DIGITAÇÃO LIVRE (qualquer outra coisa vira mensagem livre)
  // Não mostramos “não entendi”. Apenas acusamos recebimento e mantemos canal livre.
  return [
    "Mensagem recebida ✅ Encaminhei ao Dr. e em breve retornaremos.",
    "Se precisar, digite *menu* para ver as opções ou *sair* para deixar o WhatsApp livre."
  ].join("\n");
}

export default async function handler(req, res) {
  // Verificação GET
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Token inválido");
  }

  // Recebimento POST
  if (req.method === "POST") {
    try {
      const entry = req.body?.entry?.[0]?.changes?.[0]?.value;
      const msg = entry?.messages?.[0];
      const phone_number_id = entry?.metadata?.phone_number_id;

      if (msg && phone_number_id) {
        const from = msg.from;
        // Captura texto de várias origens (texto, botão, lista)
        const userText =
          msg?.text?.body ??
          msg?.interactive?.button_reply?.title ??
          msg?.interactive?.list_reply?.title ??
          "";

        const reply = buildReply(userText);

        await axios.post(
          `https://graph.facebook.com/v21.0/${phone_number_id}/messages`,
          {
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: { body: reply }
          },
          { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
        );
      }

      return res.status(200).send("EVENT_RECEIVED");
    } catch (e) {
      console.error("Erro ao processar webhook:", e?.response?.data || e.message);
      return res.status(500).send("Erro interno");
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).send("Method Not Allowed");
}
