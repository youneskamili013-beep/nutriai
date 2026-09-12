# NutriAI

Application web d'analyse nutritionnelle de plats avec Gemini.

## Lancer en local

```powershell
$env:Path = "C:\Program Files\nodejs;$env:Path"
npm install
npm start
```

Ouvrir http://localhost:3000.

## Deployer sur Render

- Build Command : `npm install`
- Start Command : `npm start`
- Variable `GEMINI_API_KEY` : ajouter la cle Gemini dans les variables d'environnement Render
- Variable `PORT` : `10000`
