import { callGemini, sendError } from './_lib/gemini.js';

const MAX_PROMPT_LENGTH = 12000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt가 없습니다.' });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: '프롬프트가 너무 깁니다.' });
  }

  try {
    const text = await callGemini({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 8192 },
    });
    res.status(200).json({ text });
  } catch (err) {
    sendError(res, err);
  }
}
