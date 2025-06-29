import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration Supabase
const supabaseUrl = "https://hgqndkfkuitafuzawuxl.supabase.co";
const supabaseKey = "yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncW5ka2ZrdWl0YWZ1emF3dXhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkzNDg5MiwiZXhwIjoyMDYzNTEwODkyfQ.BexhC9LB-7Aea67mUPQI1OMVIZonH7-Z5EOOzq7GHDY";
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors({ origin: '*' }));
console.log('CORS enabled for all origins');
app.use(express.json());

// GET config dynamique pour le widget
app.get('/configs/:client_id.json', async (req, res) => {
  try {
    const { client_id } = req.params;
    
    console.log(`📥 Demande de configuration pour: ${client_id}`);
    
    // Si c'est un client de démo, retourner une config de test
    if (client_id === 'DEMO123') {
      const demoConfig = {
        client_id: 'DEMO123',
        logo_url: 'https://via.placeholder.com/32x32/4299e1/ffffff?text=🤖',
        color_primary: '#4299e1',
        bot_description: 'Assistant virtuel de démonstration',
        banner_color: '#2d3748',
        chat_background_color: '#f7fafc',
        text_color: '#2d3748'
      };
      
      console.log(`✅ Configuration démo retournée pour: ${client_id}`);
      return res.json(demoConfig);
    }
    
    const { data, error } = await supabase
      .from('client_configs')
      .select('*')
      .eq('client_id', client_id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.log(`❌ Configuration non trouvée pour: ${client_id}`);
      return res.status(404).json({
        error: 'Configuration introuvable',
        client_id: client_id
      });
    }

    console.log(`✅ Configuration trouvée pour: ${client_id}`);
    
    // Retourner la configuration SANS le webhook_url (sécurité)
    const config = {
      client_id: data.client_id,
      logo_url: data.logo_url,
      color_primary: data.color_primary,
      bot_description: data.bot_description,
      banner_color: data.banner_color,
      chat_background_color: data.chat_background_color,
      text_color: data.text_color
    };

    res.json(config);
  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// GET toutes les configs (pour le dashboard)
app.get('/api/configs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('client_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log(`✅ ${data?.length || 0} configurations récupérées`);
    res.json(data || []);
  } catch (error) {
    console.error('❌ Erreur récupération configs:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// POST créer une config
app.post('/api/configs', async (req, res) => {
  try {
    const { client_id, ...data } = req.body;
    if (!client_id) return res.status(400).json({ error: 'client_id required' });

    const { error } = await supabase
      .from('client_configs')
      .insert([{
        client_id,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) throw error;
    
    console.log(`✅ Configuration créée: ${client_id}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur création config:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// PUT modifier une config
app.put('/api/configs/:client_id', async (req, res) => {
  try {
    const { client_id } = req.params;
    const { data: existingConfig } = await supabase
      .from('client_configs')
      .select('id')
      .eq('client_id', client_id)
      .single();

    if (!existingConfig) {
      return res.status(404).json({ error: 'Config not found' });
    }

    const { error } = await supabase
      .from('client_configs')
      .update({
        ...req.body,
        updated_at: new Date().toISOString()
      })
      .eq('client_id', client_id);

    if (error) throw error;
    
    console.log(`✅ Configuration mise à jour: ${client_id}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur mise à jour config:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// DELETE supprimer une config
app.delete('/api/configs/:client_id', async (req, res) => {
  try {
    const { client_id } = req.params;
    
    const { error } = await supabase
      .from('client_configs')
      .delete()
      .eq('client_id', client_id);

    if (error) throw error;
    
    console.log(`✅ Configuration supprimée: ${client_id}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur suppression config:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// POST relais question → webhook → réponse
app.post('/api/ask', async (req, res) => {
  try {
    const { client_id, question } = req.body;
    if (!client_id || !question) {
      return res.status(400).json({ error: 'Missing client_id or question' });
    }

    const { data: config, error } = await supabase
      .from('client_configs')
      .select('webhook_url')
      .eq('client_id', client_id)
      .eq('is_active', true)
      .single();

    if (error || !config) {
      return res.status(404).json({ error: 'Config not found' });
    }

    const webhookRes = await fetch(config.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    
    const webhookData = await webhookRes.json();
    return res.json({ answer: webhookData.answer });
  } catch (e) {
    console.error('❌ Erreur webhook:', e);
    return res.status(500).json({ error: 'Webhook error', details: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API running on port ${PORT}`);
  console.log(`📊 Utilisation de Supabase pour la persistance des données`);
}); 