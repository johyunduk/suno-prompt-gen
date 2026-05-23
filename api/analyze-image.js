const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// 유효한 태그 값 목록 (tags.js와 동기화)
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

const PROMPT = `You are a music style analyzer. Look at this character illustration and suggest music tags that match the character's visual aesthetic, mood, color palette, clothing style, and overall energy.

Return ONLY a valid JSON object. Use ONLY values from the lists below. Do not invent new values.

{
  "genre": [1-2 values from: ${VALID.genre.join(', ')}],
  "mood": [1-3 values from: ${VALID.mood.join(', ')}],
  "vocal_arrangement": [exactly 1 value from: ${VALID.vocal_arrangement.join(', ')}],
  "vocal_style": [1-2 values from: ${VALID.vocal_style.join(', ')}],
  "instrument": [1-3 values from: ${VALID.instrument.join(', ')}],
  "production": [1-2 values from: ${VALID.production.join(', ')}],
  "era": [0-1 values from: ${VALID.era.join(', ')}],
  "tempo": [exactly 1 value from: ${VALID.tempo.join(', ')}]
}

Return pure JSON only. No explanation, no markdown, no code block.`;

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.GEMINI_KEY;
  if (!key) {
    return res.status(500).json({ error: 'GEMINI_KEY 환경변수가 설정되지 않았습니다.' });
  }

  const { imageData, mimeType } = req.body;
  if (!imageData || !mimeType) {
    return res.status(400).json({ error: '이미지 데이터가 없습니다.' });
  }

  const response = await fetch(`${API_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: mimeType, data: imageData } },
        ],
      }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    return res.status(response.status).json({ error: data.error?.message || '분석 실패' });
  }

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

  let tags;
  try {
    tags = JSON.parse(raw);
  } catch {
    return res.status(500).json({ error: 'Gemini 응답 파싱 실패', raw });
  }

  // 유효한 값만 필터링
  const filtered = {};
  for (const [key, values] of Object.entries(tags)) {
    if (!VALID[key] || !Array.isArray(values)) continue;
    const clean = values.filter(v => VALID[key].includes(v));
    if (clean.length > 0) filtered[key] = clean;
  }

  res.status(200).json({ tags: filtered });
}
