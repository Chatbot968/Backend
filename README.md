# ChatBot Dashboard Backend

## Lancer en local

```bash
npm install
npm start
```

- Les configs sont stockées dans le dossier `configs/` (un fichier JSON par client).
- L'API expose :
  - `GET /configs/:client_id.json` (pour le widget)
  - `GET /api/configs` (pour le dashboard)
  - `POST /api/configs` (créer)
  - `PUT /api/configs/:client_id` (modifier)
  - `DELETE /api/configs/:client_id` (supprimer)
  - `POST /api/ask` (relais question → webhook → réponse)

## Déploiement Render

- Crée un service **Web Service** (Node.js) sur Render
- Build command : `npm install`
- Start command : `npm start`
- Port : 3001 (ou variable d'environnement `$PORT`) 