const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'La clé GEMINI_API_KEY manque dans Vercel.' });
  }

  try {
    await new Promise((resolve, reject) => upload.single('image')(req, res, (error) => error ? reject(error) : resolve()));
    if (!req.file) return res.status(400).json({ error: 'Aucune image reçue.' });

    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = client.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `Analyse cette photo de plat. Réponds uniquement avec un JSON valide, sans markdown, avec exactement ces clés : plat (string), calories (number), proteines (number en grammes), glucides (number en grammes), lipides (number en grammes), confiance (number entre 0 et 100). Si tu n'es pas certain, indique le plat le plus probable et une confiance faible. Les calories et macros doivent être des estimations pour toute la portion visible.`;
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } },
    ]);
    const responseText = result.response.text().replace(/```json|```/g, '').trim();
    return res.json(JSON.parse(responseText));
  } catch (error) {
    console.error('Analyse Gemini impossible:', error.message);
    return res.status(502).json({ error: 'Gemini n’a pas pu analyser cette image. Vérifie ta clé API et réessaie.' });
  }
};
