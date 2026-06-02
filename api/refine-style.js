import { callGemini, sendError } from './_lib/gemini.js';

const MAX_INPUT_LENGTH = 4000;

const SYSTEM = `You are an expert Suno AI music prompt engineer. Convert a list of raw style descriptors (genres, moods, instruments, vocals, production, era, tempo, artist references) into ONE polished, coherent Suno "Style of Music" prompt.

Rules:
- Output ENGLISH only — Suno performs best in English.
- A single line of comma-separated descriptors, ordered roughly: genre/subgenre, mood, vocals, key instruments, production texture, era/tempo.
- Merge redundant or overlapping tags, resolve contradictions, and add 1–3 tasteful connecting descriptors so it reads as an intentional, cohesive sound.
- Under ~480 characters. No song structure, no lyrics, no markdown, no quotes, no labels.
- Preserve any specific artist references or custom phrases the user included.
- Put the final prompt in the "stylePrompt" field. Do NOT include any reasoning or commentary.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    stylePrompt: { type: 'string' },
  },
  required: ['stylePrompt'],
};

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

  const prompt = `${SYSTEM}\n\nSelected descriptors:\n${rawPrompt}`;

  try {
    const raw = await callGemini({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    let text = '';
    try {
      text = (JSON.parse(raw || '{}').stylePrompt || '').trim();
    } catch {
      return res.status(502).json({ error: 'AI 응답을 해석하지 못했습니다. 다시 시도해주세요.' });
    }

    if (!text) {
      return res.status(502).json({ error: 'AI가 빈 결과를 반환했습니다. 다시 시도해주세요.' });
    }

    res.status(200).json({ text });
  } catch (err) {
    sendError(res, err);
  }
}
