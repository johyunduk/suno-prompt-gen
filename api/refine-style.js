import { callGemini, sendError } from './_lib/gemini.js';
import { collectArtistNames, findArtistLeaks } from './_lib/artistGuard.js';
import { TAG_GROUPS } from '../src/data/tags.js';

const MAX_INPUT_LENGTH = 4000;
const VALID_GROUP_IDS = new Set(TAG_GROUPS.map(g => g.id));
// "City Pop style"처럼 장르명+style 입력을 아티스트로 오인하지 않도록 알려진 음악 용어는 제외한다.
const KNOWN_MUSIC_TERMS = new Set(TAG_GROUPS.flatMap(g => g.tags.map(t => t.value.toLowerCase())));

const SYSTEM = `You are an expert Suno AI music style engineer working with the current generation (v5 / v5.5). You receive the user's selections grouped by category (genre, mood, vocals, instruments, production, era, tempo, custom text, exclusions). Produce a structured result for Suno's separate input fields.

## stylePrompt — Suno "Style of Music" field
- English only. Comma-separated descriptor fragments — NOT full sentences, NOT commands, and NO square brackets [ ] (brackets are for the lyrics box, not the style box).
- Order: genre/sub-genre -> 1-2 mood words -> vocal type+texture -> 3-4 specific instruments -> 1-2 production/mix descriptors -> tempo (BPM) -> key/mode.
- Aim for roughly 200-350 characters, with the core identity (genre + 1-2 defining sonic traits) in the first ~120 characters.
- Make it SPECIFIC — vagueness causes generic output:
  - Replace broad genres with a precise micro-genre + era ("pop" -> "80s synth-pop"). Keep at most 2 genres.
  - Ground every mood word in a sonic cause (the instrument or production that creates it). No bare adjectives like "epic, emotional".
  - Use specific instrument timbres: "Rhodes electric piano" not "piano", "808 sub-bass", "gated-reverb drums".
  - Add 1-2 production/mix descriptors as a sonic fingerprint ("warm analog mix", "vinyl crackle", "wide stereo").
  - Describe vocals as register + texture + delivery. Preserve any specified vocal arrangement exactly (duet / group / rap-and-hook roles).
  - ALWAYS include a concrete tempo in BPM (infer one if missing). Add a key or mode (e.g. "D minor") when it fits.
- ARTIST NAMES ARE FORBIDDEN. Suno blocks generation when prompts contain names of well-known artists or people. If the input references an artist (e.g. "inspired by IU", "Frank Ocean style"), DECOMPOSE it into genre, vocal, and production characteristics instead (e.g. "intimate Korean indie-pop ballad, delicate female vocal, piano-led arrangement, restrained emotional delivery"). Never output a real person's name.
- NO negations in stylePrompt. Anything to avoid goes into the exclude field instead.
- If instrumental is true: describe the instrumental character (lead instruments carry the melody), include "instrumental", and do not describe vocals.
- Merge duplicates; drop contradictions (opposing moods, clashing genres) so the result reads as one intentional sound.

## exclude — Suno Advanced Options "Exclude Styles" field
- Plain comma-separated terms WITHOUT "no" (e.g. "autotune, electric guitar"), combining the user's exclusions with any "no X" phrases found in the input. Empty string if nothing to exclude.
- ONLY include what the user explicitly asked to exclude. Do NOT invent additional exclusions. Exception: for instrumental tracks you may add "vocals".
- Never put something here that the stylePrompt asks for.

## Recommended Advanced Options (for the user to set in Suno)
- vocalGender: "female" | "male" | "any" — from the vocal arrangement (mixed/duet/choir or instrumental -> "any").
- weirdness: integer 0-100 — conventional radio-ready styles 25-45, genre-blending or moody styles 45-60, experimental styles (vaporwave, shoegaze, hyperpop, heavy fusion) 60-80.
- styleInfluence: integer 0-100 — how strictly Suno should follow the style prompt. Detailed, specific prompts deserve 60-85; sparse prompts 40-60.

## personalization — Suno v5.5 Pro feature recommendation (write in KOREAN, 1-2 short sentences)
Recommend how to use Suno v5.5 personalization features for THIS specific style. Pick only what's relevant:
- Voices (Pro/Premier 전용): the user can capture their own voice and apply it — recommend when vocal identity/intimacy defines the style (singer-songwriter, ballad, indie).
- Custom Models (Pro/Premier, 최대 3개): built from the user's own uploaded tracks — recommend when consistency with the user's existing discography in this genre matters.
- My Taste (모든 사용자): learns preferences from likes/history — recommend for exploratory or recurring style workflows.
For instrumental tracks, do not recommend Voices. Be concrete to the style (mention the genre/vibe), not generic.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    stylePrompt: { type: 'string' },
    exclude: { type: 'string' },
    vocalGender: { type: 'string', enum: ['female', 'male', 'any'] },
    weirdness: { type: 'integer' },
    styleInfluence: { type: 'integer' },
    personalization: { type: 'string' },
  },
  required: ['stylePrompt', 'exclude', 'vocalGender', 'weirdness', 'styleInfluence', 'personalization'],
};

const GROUP_LABELS = {
  genre: 'Genres',
  mood: 'Moods',
  vocal_arrangement: 'Vocal arrangement',
  vocal_style: 'Vocal style/texture',
  instrument: 'Instruments',
  production: 'Production/mix',
  era: 'Era/reference',
  tempo: 'Tempo',
  reference: 'Style reference (already decomposed, artist-free)',
};

function buildUserBlock({ selection, vocalPrompt, custom, instrumental, exclude }) {
  const lines = [];
  for (const [groupId, values] of Object.entries(selection)) {
    if (values.length === 0) continue;
    lines.push(`${GROUP_LABELS[groupId] ?? groupId}: ${values.join(', ')}`);
  }
  if (vocalPrompt) lines.push(`Vocal casting: ${vocalPrompt}`);
  if (custom) lines.push(`Custom user text: ${custom}`);
  lines.push(`Instrumental: ${instrumental ? 'yes' : 'no'}`);
  if (exclude) lines.push(`User exclusions: ${exclude}`);
  return lines.join('\n');
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, Math.round(Number(n) || 0)));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const selection = {};
  if (body.selection && typeof body.selection === 'object') {
    for (const [groupId, values] of Object.entries(body.selection)) {
      if (!VALID_GROUP_IDS.has(groupId) || !Array.isArray(values)) continue;
      selection[groupId] = values.filter(v => typeof v === 'string').slice(0, 40);
    }
  }
  const payload = {
    selection,
    vocalPrompt: typeof body.vocalPrompt === 'string' ? body.vocalPrompt : '',
    custom: typeof body.custom === 'string' ? body.custom : '',
    instrumental: !!body.instrumental,
    exclude: typeof body.exclude === 'string' ? body.exclude : '',
  };

  const userBlock = buildUserBlock(payload);
  if (!userBlock.replace(/^Instrumental: (yes|no)$/m, '').trim()) {
    return res.status(400).json({ error: '스타일 태그가 없습니다.' });
  }
  if (userBlock.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({ error: '입력이 너무 깁니다.' });
  }

  const basePrompt = `${SYSTEM}\n\nUser selections:\n${userBlock}`;
  const artistNames = collectArtistNames(payload.custom)
    .filter(name => !KNOWN_MUSIC_TERMS.has(name.toLowerCase()));

  try {
    let parsed = null;
    let leaks = [];

    // 아티스트명이 결과에 남으면 1회 재시도하고, 그래도 남으면 오류로 처리한다.
    for (let attempt = 0; attempt < 2; attempt++) {
      const retryNote = attempt > 0
        ? `\n\nIMPORTANT: Your previous attempt leaked an artist reference (${leaks.join(', ')}). Remove ALL real names and "inspired by" phrasing — describe the musical characteristics instead.`
        : '';
      const raw = await callGemini({
        contents: [{ parts: [{ text: basePrompt + retryNote }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        },
      });

      try {
        parsed = JSON.parse(raw || '{}');
      } catch {
        return res.status(502).json({ error: 'AI 응답을 해석하지 못했습니다. 다시 시도해주세요.' });
      }

      leaks = findArtistLeaks(parsed.stylePrompt || '', artistNames);
      if (leaks.length === 0) break;
    }

    if (leaks.length > 0) {
      return res.status(422).json({
        error: `아티스트 참조(${leaks.join(', ')})를 제거하지 못했습니다. 아티스트명 대신 장르·보컬·프로덕션 특성으로 입력해 주세요.`,
      });
    }

    const stylePrompt = (parsed.stylePrompt || '').trim();
    if (!stylePrompt) {
      return res.status(502).json({ error: 'AI가 빈 결과를 반환했습니다. 다시 시도해주세요.' });
    }

    res.status(200).json({
      result: {
        stylePrompt,
        exclude: (parsed.exclude || '').trim(),
        vocalGender: ['female', 'male', 'any'].includes(parsed.vocalGender) ? parsed.vocalGender : 'any',
        weirdness: clamp(parsed.weirdness, 0, 100),
        styleInfluence: clamp(parsed.styleInfluence, 0, 100),
        personalization: (typeof parsed.personalization === 'string' ? parsed.personalization : '').trim().slice(0, 500),
      },
    });
  } catch (err) {
    sendError(res, err);
  }
}
