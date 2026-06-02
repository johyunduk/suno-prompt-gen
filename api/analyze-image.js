import { callGemini, sendError } from './_lib/gemini.js';

const VALID = {
  genre: ['K-Pop','J-Pop','Pop','Synth-Pop','Electropop','Dark Pop','Indie Pop','Indie Rock','Dream Pop','Shoegaze','City Pop','Y2K pop','Vaporwave','Hip-Hop','Trap','Drill','Boom Bap','Cloud Rap','R&B','Neo Soul','Soul','Funk','EDM','House','Techno','Trance','Future Bass','Dubstep','Drum & Bass','Lo-Fi','Chillwave','Ambient','Jazz','Nu Jazz','Jazz Fusion','Rock','Alternative Rock','Post-Rock','Grunge','Metal','Heavy Metal','Progressive Metal','Metalcore','Folk','Indie Folk','Acoustic','Classical','Orchestral','Cinematic','Gospel','Reggae','Reggaeton','Afrobeats','Latin Pop','Bossa Nova','Country','Punk','New Wave','Blues','Pop Ballad','Power Ballad'],
  mood: ['melancholic','euphoric','dreamy','dark','uplifting','nostalgic','aggressive','romantic','chill','cinematic','ethereal','haunting','playful','mysterious','empowering','bittersweet','triumphant','eerie','hopeful','desperate','introspective','sensual','peaceful','frantic','brooding','intense','serene','chaotic','tender','whimsical'],
  vocal_arrangement: ['female vocals','male vocals','male and female duet','two female vocalists','two male vocalists','female group vocals','male group vocals','mixed group vocals, male and female','no vocals, instrumental'],
  vocal_style: ['falsetto','breathy','raspy','powerful','smooth','whisper','croon','operatic','autotuned','rich harmonies','layered vocals','rap flow','melodic rap','gospel vocal runs','vibrato','pitched up vocals'],
  instrument: ['piano','electric piano','Rhodes','organ','acoustic guitar','electric guitar','classical guitar','fingerpicked guitar','bass guitar','electric bass','808 bass','synth','pad synth','lead synth','arpeggio synth','analog synth','strings','violin','cello','orchestral strings','drums','drum machine','TR-808','live drums','brass','trumpet','saxophone','flute','vinyl crackle','cassette hiss','harp','marimba'],
  production: ['reverb-heavy','dry signal','warm analog','clean digital','vintage','heavy compression','punchy mix','wide stereo','sidechain compression','vinyl warmth','tape saturation','cassette lo-fi','distortion','heavy distortion','minimal production','maximalist','glossy mix','heavy bass','sub-bass heavy','club-ready','radio-ready','sample-based'],
  era: ['60s','70s','80s','90s','2000s','2010s','modern','80s Tokyo','90s New York','Y2K','classic rock era','disco era','golden age hip-hop','K-pop 4th gen','City Pop 80s'],
  tempo: ['60bpm','70bpm','80bpm','85bpm','90bpm','95bpm','100bpm','110bpm','120bpm','128bpm','130bpm','140bpm','150bpm','160bpm','slow tempo','mid tempo','uptempo'],
};

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const PROMPT = `You are a music style analyzer. Look at this character illustration and suggest music tags that best match the character's visual aesthetic, mood, color palette, clothing style, and overall energy. Choose values that feel most fitting for this specific image.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    genre:             { type: 'array', items: { type: 'string', enum: VALID.genre },             minItems: 1, maxItems: 2 },
    mood:              { type: 'array', items: { type: 'string', enum: VALID.mood },              minItems: 1, maxItems: 3 },
    vocal_arrangement: { type: 'array', items: { type: 'string', enum: VALID.vocal_arrangement }, minItems: 1, maxItems: 1 },
    vocal_style:       { type: 'array', items: { type: 'string', enum: VALID.vocal_style },       minItems: 1, maxItems: 2 },
    instrument:        { type: 'array', items: { type: 'string', enum: VALID.instrument },        minItems: 1, maxItems: 3 },
    production:        { type: 'array', items: { type: 'string', enum: VALID.production },        minItems: 1, maxItems: 2 },
    era:               { type: 'array', items: { type: 'string', enum: VALID.era },               minItems: 0, maxItems: 1 },
    tempo:             { type: 'array', items: { type: 'string', enum: VALID.tempo },             minItems: 1, maxItems: 1 },
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
