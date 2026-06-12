import { callGemini, sendError } from './_lib/gemini.js';
import { TAG_GROUPS, GROUP_LIMITS } from '../src/data/tags.js';

// UI 태그(tags.js)를 단일 원본으로 사용 — 목록이 갈라지지 않게 여기서 파생한다.
// reference 그룹은 아티스트 스타일 설명이라 이미지 분석 대상에서 제외한다.
const ANALYZED_GROUPS = ['genre', 'mood', 'vocal_arrangement', 'vocal_style', 'instrument', 'production', 'era', 'tempo'];
const VALID = Object.fromEntries(
  TAG_GROUPS
    .filter(g => ANALYZED_GROUPS.includes(g.id))
    .map(g => [g.id, g.tags.map(t => t.value)])
);

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const PROMPT = `You are a music style analyzer. Look at this character illustration and suggest music tags that best match the character's visual aesthetic, mood, color palette, clothing style, and overall energy. Choose values that feel most fitting for this specific image.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    // maxItems는 UI의 선택 한도(GROUP_LIMITS)와 동일하게 유지한다.
    genre:             { type: 'array', items: { type: 'string', enum: VALID.genre },             minItems: 1, maxItems: GROUP_LIMITS.genre },
    mood:              { type: 'array', items: { type: 'string', enum: VALID.mood },              minItems: 1, maxItems: GROUP_LIMITS.mood },
    vocal_arrangement: { type: 'array', items: { type: 'string', enum: VALID.vocal_arrangement }, minItems: 1, maxItems: GROUP_LIMITS.vocal_arrangement },
    vocal_style:       { type: 'array', items: { type: 'string', enum: VALID.vocal_style },       minItems: 1, maxItems: 2 },
    instrument:        { type: 'array', items: { type: 'string', enum: VALID.instrument },        minItems: 1, maxItems: 3 },
    production:        { type: 'array', items: { type: 'string', enum: VALID.production },        minItems: 1, maxItems: 2 },
    era:               { type: 'array', items: { type: 'string', enum: VALID.era },               minItems: 0, maxItems: GROUP_LIMITS.era },
    tempo:             { type: 'array', items: { type: 'string', enum: VALID.tempo },             minItems: 1, maxItems: GROUP_LIMITS.tempo },
  },
  required: ['genre', 'mood', 'vocal_arrangement', 'vocal_style', 'instrument', 'production', 'tempo'],
};

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageData, mimeType } = req.body || {};
  if (!imageData || !mimeType) {
    return res.status(400).json({ error: '이미지 데이터가 없습니다.' });
  }
  if (!ALLOWED_MIME.includes(mimeType)) {
    return res.status(400).json({ error: '지원하지 않는 이미지 형식입니다. (JPG, PNG, WEBP, GIF)' });
  }

  try {
    const raw = await callGemini({
      contents: [{
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: mimeType, data: imageData } },
        ],
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        // 이미지→태그 분류는 깊은 추론이 불필요 — thinking을 낮춰 지연/504를 줄인다.
        thinkingConfig: { thinkingLevel: 'low' },
      },
    });

    let tags;
    try {
      tags = JSON.parse(raw || '{}');
    } catch {
      return res.status(502).json({ error: 'Gemini 응답을 해석하지 못했습니다.' });
    }

    // 허용된 값만 통과시킨다.
    const filtered = {};
    for (const [k, values] of Object.entries(tags)) {
      if (!VALID[k] || !Array.isArray(values)) continue;
      const clean = values.filter(v => VALID[k].includes(v));
      if (clean.length > 0) filtered[k] = clean;
    }

    res.status(200).json({ tags: filtered });
  } catch (err) {
    sendError(res, err);
  }
}
