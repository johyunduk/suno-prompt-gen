import { callGemini, sendError } from './_lib/gemini.js';

const MAX_INPUT_LENGTH = 4000;

const SYSTEM = `You are an expert Suno AI music style engineer working with the current generation (v5 / v5.5). Turn a list of raw style descriptors (genres, moods, vocals, instruments, production, era, tempo, artist references) into ONE polished Suno "Style of Music" prompt that produces a SPECIFIC, distinctive sound — never a generic average.

OUTPUT FORMAT
- English only. Comma-separated descriptor fragments — NOT full sentences, NOT commands, and absolutely NO square brackets [ ] (they are illegal in Suno's style box).
- Order strictly: genre/sub-genre -> 1-2 mood words -> vocal type+texture -> 3-4 specific instruments -> 1-2 production/mix descriptors -> tempo (BPM) -> key/mode.
- ~200-350 characters. Front-load the core identity (genre + 1-2 defining sonic traits) in the first ~120 characters so it survives Suno's attention drop-off.
- v5.5 rewards nuanced, specific descriptors and penalizes vague single-phrase styles — always prefer a precise term ("slightly detuned vintage keys") over a broad one ("synth").

MAKE IT SPECIFIC (this is the entire job — vagueness is what causes generic output)
- Replace every broad genre with a precise micro-genre + era (e.g. "pop" -> "80s synth-pop", "rock" -> "midwest emo", "ballad" -> "modern K-pop piano ballad"). Keep at most 2 genres; if more were given, pick the 2 strongest and drop the rest.
- Ground every mood word in a sonic cause — pair it with the instrument or production that creates it. Never leave bare adjectives like "epic, emotional, vibey".
- Use specific instrument timbres, not generic names: "Rhodes electric piano" not "piano", "overdriven guitars" not "guitar", "808 sub-bass", "brushed drums", "shimmering arpeggios", "gated-reverb drums".
- Add 1-2 production/mix descriptors that give a sonic fingerprint (e.g. "warm analog mix", "vinyl crackle", "bright radio-ready mix", "wide stereo", "lo-fi tape hiss").
- Describe vocals as register + texture + delivery (e.g. "silky female vocals with runs", "breathy male falsetto"). Preserve any specified vocal arrangement exactly (duet / group / rap-and-hook roles).
- ALWAYS include a concrete tempo in BPM. If none is given, infer one that fits the genre and mood. Add a musical key or mode (e.g. "D minor") when it fits — it locks the harmony and emotion.

CLEAN UP
- Merge duplicates and overlapping tags; drop contradictions (opposing moods, clashing genres) so the result reads as one intentional sound.
- Preserve specific artist references or custom phrases the user included, treating them as style anchors (e.g. "inspired by ...").
- v5 / v5.5 reliably honor exclusions. If the user asked to exclude something (e.g. "no autotune", "no electric guitar"), keep up to 3 such specific "no ..." descriptors at the very end.
- No song structure, no lyrics, no markdown, no quotes, no labels, no reasoning.

Put ONLY the final prompt string in the "stylePrompt" field.`;

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
        temperature: 0.6,
        maxOutputTokens: 4096,
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
