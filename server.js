import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.resolve();
const CONFIGS_DIR = path.join(__dirname, 'backend', 'configs');

app.use(cors({ origin: '*' }));
app.use(express.json());

// GET config dynamique pour le widget
app.get('/configs/:client_id.json', (req, res) => {
  const file = path.join(CONFIGS_DIR, `${req.params.client_id}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Config not found' });
  res.sendFile(file);
});

// GET toutes les configs (pour le dashboard)
app.get('/api/configs', (req, res) => {
  const files = fs.readdirSync(CONFIGS_DIR).filter(f => f.endsWith('.json'));
  const configs = files.map(f => {
    const data = fs.readFileSync(path.join(CONFIGS_DIR, f));
    return JSON.parse(data);
  });
  res.json(configs);
});

// POST créer une config
app.post('/api/configs', (req, res) => {
  const { client_id, ...data } = req.body;
  if (!client_id) return res.status(400).json({ error: 'client_id required' });
  const file = path.join(CONFIGS_DIR, `${client_id}.json`);
  fs.writeFileSync(file, JSON.stringify({ client_id, ...data }, null, 2));
  res.json({ success: true });
});

// PUT modifier une config
app.put('/api/configs/:client_id', (req, res) => {
  const { client_id } = req.params;
  const file = path.join(CONFIGS_DIR, `${client_id}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Config not found' });
  fs.writeFileSync(file, JSON.stringify({ client_id, ...req.body }, null, 2));
  res.json({ success: true });
});

// DELETE supprimer une config
app.delete('/api/configs/:client_id', (req, res) => {
  const { client_id } = req.params;
  const file = path.join(CONFIGS_DIR, `${client_id}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Config not found' });
  fs.unlinkSync(file);
  res.json({ success: true });
});

// POST relais question → webhook → réponse
app.post('/api/ask', async (req, res) => {
  const { client_id, question } = req.body;
  if (!client_id || !question) return res.status(400).json({ error: 'Missing client_id or question' });

  const file = path.join(CONFIGS_DIR, `${client_id}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Config not found' });
  const config = JSON.parse(fs.readFileSync(file));

  try {
    const webhookRes = await fetch(config.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const webhookData = await webhookRes.json();
    return res.json({ answer: webhookData.answer });
  } catch (e) {
    return res.status(500).json({ error: 'Webhook error', details: e.message });
  }
});

// Crée le dossier configs si besoin
if (!fs.existsSync(CONFIGS_DIR)) fs.mkdirSync(CONFIGS_DIR, { recursive: true });

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
}); 