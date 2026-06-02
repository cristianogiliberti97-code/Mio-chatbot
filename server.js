const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.static('public'));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Sei l'Assistente MareStay, l'assistente virtuale ufficiale di MareStay (www.marestayliguria.it), il sistema di prenotazioni per i B&B della Liguria.

FUNZIONALITÀ: Calendario in tempo reale, pagamenti online sicuri con Stripe, email automatiche multilingua, pannello admin completo, sincronizzazione con Booking.com, Airbnb, Expedia.

PREZZI:
- Starter 29€/mese: fino a 3 camere, calendario, prenotazioni, email automatiche, pagamenti online, supporto email
- Professional 59€/mese: fino a 10 camere, tutto Starter + sito multilingua + sincronizzazione canali + statistiche + supporto prioritario
- Premium 99€/mese: camere illimitate, tutto Professional + multi-struttura + account manager + API custom + supporto telefonico 7/7

FAQ:
- Commissioni? No, paghi solo l'abbonamento mensile
- Prova gratuita? Sì, 30 giorni gratis senza carta di credito
- Configurazione? In meno di un'ora con assistenza inclusa
- Disdetta? Sì, senza vincoli con un click
- Booking e Airbnb? Sì, dal piano Professional

Per demo o info: www.marestayliguria.it/contatti
Rispondi sempre in italiano, in modo professionale e cordiale.`;

app.post('/chat', async (req, res) => {
  const { messages } = req.body;
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages,
    });
    const reply = response.content && response.content[0] && response.content[0].text
      ? response.content[0].text
      : 'Errore nella risposta.';
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: 'Errore: ' + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`));
