const path = require('path');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'La clé GEMINI_API_KEY manque dans le fichier .env.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image reçue.' });
  }

  try {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = client.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `Analyse cette photo de plat. Réponds uniquement avec un JSON valide, sans markdown, avec exactement ces clés : plat (string), calories (number), proteines (number en grammes), glucides (number en grammes), lipides (number en grammes), confiance (number entre 0 et 100). Si tu n'es pas certain, indique le plat le plus probable et une confiance faible. Les calories et macros doivent être des estimations pour toute la portion visible.`;
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } },
    ]);
    const responseText = result.response.text().replace(/```json|```/g, '').trim();
    const nutrition = JSON.parse(responseText);
    return res.json(nutrition);
  } catch (error) {
    console.error('Analyse Gemini impossible:', error.message);
    return res.status(502).json({ error: 'Gemini n’a pas pu analyser cette image. Vérifie ta clé API et réessaie.' });
  }
});

app.listen(port, () => {
  console.log(`NutriAI est disponible sur http://localhost:${port}`);
});
