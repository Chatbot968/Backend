# ChatBot Dashboard Backend

## Configuration

Ce backend utilise **Supabase** pour la persistance des données. Les configurations sont stockées en base de données et ne disparaissent jamais, même après redémarrage.

### Variables d'environnement requises

Crée un fichier `.env` dans le dossier `backend/` avec :

```env
VITE_SUPABASE_URL=https://ton-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ton-service-role-key
```

### Configuration Render

1. **Crée un service Web Service** (Node.js) sur Render
2. **Build command** : `npm install`
3. **Start command** : `npm start`
4. **Port** : 3001 (ou variable d'environnement `$PORT`)

### Variables d'environnement sur Render

Dans les paramètres de ton service Render, ajoute ces variables :

- `VITE_SUPABASE_URL` = URL de ton projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` = Clé service role de Supabase

## API Endpoints

- `GET /configs/:client_id.json` - Récupère une config pour le widget
- `GET /api/configs` - Liste toutes les configs (dashboard)
- `POST /api/configs` - Crée une nouvelle config
- `PUT /api/configs/:client_id` - Modifie une config
- `DELETE /api/configs/:client_id` - Supprime une config
- `POST /api/ask` - Relais question → webhook → réponse

## Lancer en local

```bash
cd backend
npm install
npm start
```

## Persistance des données

✅ **Les configs sont maintenant persistantes** grâce à Supabase
✅ **Plus de perte de données** lors des redémarrages
✅ **Synchronisation automatique** entre dashboard et backend 