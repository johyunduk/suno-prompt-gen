import { callGemini, sendError } from './_lib/gemini.js';

const MAX_INPUT_LENGTH = 4000;

const SYSTEM = `You are an expert Suno AI music prompt engineer. You convert a list of raw style descriptors (genres, moods, instruments, vocals, production, era, tempo, artist references) into ONE polished, coherent Suno "Style of Music" prompt.

Rules:
- Output ENGLISH only — Suno performs best in English.
- Write a single line of comma-separated descriptors, ordered roughly: genre/subgenre, mood, vocals, key instruments, production texture, era/tempo.
- Merge redundant or overlapping tags, resolve contradictions, and add 1–3 tasteful connecting descriptors so the style reads as an intentional, cohesive sound (e.g. how the instruments sit in the mix).
- Keep it under ~480 characters. No song structure, no lyrics, no markdown, no quotes, no labels, no explanation.
- Preserve any specific artist references or custom phrases the user included.
- Output ONLY the final style prompt text.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { rawPrompt } = req.body || {};
  if (!rawPrompt || typeof rawPrompt !== 'string') {
    return res.status(400).json({ error: '스타일 태그가 없습니다.' });
  }
  if (rawPrompt.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({ error: '입력이 너무 깁니다.' });
  }

  const prompt = `${SYSTEM}\n\nSelected descriptors:\n${rawPrompt}\n\nRefined Suno style prompt:`;

  try {
    const text = await callGemini({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    });
    res.status(200).json({ text: text.trim() });
  } catch (err) {
    sendError(res, err);
  }
}
