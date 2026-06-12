import { useState, useCallback } from 'react';
import { TEMPLATES } from '../data/structures';

export const FALLBACK_TEMPLATE_KEY = Object.keys(TEMPLATES)[0];

export const LANG_OPTIONS = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: '영어' },
  { value: 'mix', label: '한영 혼용' },
];

const LANG_RULES = {
  ko: `한국어(한글)로만 작성하세요. 로마자 표기는 절대 쓰지 마세요(Suno가 한글을 더 자연스럽게 부릅니다).
- 한 줄은 6~12음절 정도로 짧고 부르기 쉽게 쓰세요. 한국어는 음절 밀도가 높아 줄이 길면 발음이 뭉개집니다.
- 영어 단어를 억지로 끼워 넣지 마세요(스타일상 꼭 필요한 짧은 후크 단어 정도만 허용).`,
  en: `Write the lyrics in English only.
- Keep lines singable: roughly 6-10 syllables per line.
- Use natural, idiomatic phrasing — not translated-sounding lines.`,
  mix: `한국어와 영어를 혼용하되, 한 줄 안에서 단어별로 섞지 말고 섹션 단위로 분리하세요(예: Verse는 한국어, Chorus 훅은 영어).
- 한글은 로마자 표기 없이 한글로, 영어는 영어로 또렷하게.
- 줄은 짧고 부르기 쉽게(한국어 6~12음절, 영어 6~10음절).`,
};

function firstKeyByCategory(cat) {
  const entry = Object.entries(TEMPLATES).find(([, t]) => t.category === cat);
  return entry?.[0] ?? FALLBACK_TEMPLATE_KEY;
}

export const DEFAULT_DURATION = 180;

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}분 ${s}초` : `${m}분`;
}

// 곡 길이(초)에 따라 섹션 구성·줄 수 지침을 만든다. 길이와 곡 구조가 충돌하면 길이를 우선한다.
function durationGuide(sec) {
  const target = sec >= 240 ? '4분 이상' : `약 ${formatDuration(sec)}`;
  const header = `- 완성곡이 ${target} 분량이 되도록 가사 양을 조절하세요. 아래 지침이 곡 구조와 충돌하면 길이를 우선해 섹션을 줄이거나 늘리세요.`;

  if (sec <= 60) {
    return `${header}
- 핵심만 남기세요: Verse 1개 + Chorus 1~2회 정도로 압축하고, Intro/Bridge/반복 Verse는 생략하세요.
- Verse 2~4줄, Chorus 2줄, Outro는 생략하거나 1줄.`;
  }
  if (sec <= 90) {
    return `${header}
- 구조를 압축하세요: Verse 2개 + Chorus 2회 정도. Intro/Bridge는 생략하거나 한 줄로 줄이세요.
- Verse 3~4줄, Chorus 2~3줄, Outro 1~2줄.`;
  }
  if (sec <= 120) {
    return `${header}
- 곡 구조를 대체로 유지하되 Intro/Bridge는 짧게(1~2줄), 마지막 반복 Chorus는 1회만.
- Verse 3~5줄, Chorus 2~3줄, Outro 1~2줄.`;
  }
  if (sec >= 240) {
    return `${header}
- 곡 구조의 모든 섹션을 살리고, 필요하면 마지막 Chorus를 한 번 더 반복하거나 Bridge 뒤에 [Instrumental break]를 추가하세요.
- Verse 6~8줄, Chorus 3~4줄, Bridge 3~4줄, Outro 2~3줄.`;
  }
  // 150~210초: 표준 분량
  return `${header}
- 곡 구조의 섹션 구성을 그대로 따르세요.
- Verse 4~6줄, Chorus 2~4줄, Outro 2~3줄.`;
}

// 길이 옵션(초)별 인스트루멘탈 섹션 구성 — 옵션마다 섹션 수가 다르게 설계됐다.
const INSTRUMENTAL_SECTIONS = {
  60: [
    '[Instrumental Intro - sparse, atmospheric]',
    '[Main Theme - melodic hook]',
    '[Climax - full arrangement]',
    '[Outro - fade out]',
  ],
  90: [
    '[Instrumental Intro - sparse, atmospheric]',
    '[Main Theme - melodic hook]',
    '[Build - rising energy]',
    '[Climax - full arrangement]',
    '[Outro - fade out]',
  ],
  120: [
    '[Instrumental Intro - sparse, atmospheric]',
    '[Main Theme - melodic hook]',
    '[Build - rising energy]',
    '[Drop - full arrangement]',
    '[Breakdown - stripped back]',
    '[Outro - fade out]',
  ],
  150: [
    '[Instrumental Intro - sparse, atmospheric]',
    '[Main Theme - melodic hook]',
    '[Build - rising energy]',
    '[Drop - full arrangement]',
    '[Breakdown - stripped back]',
    '[Final Climax - layered, intense]',
    '[Outro - fade out]',
  ],
  180: [
    '[Instrumental Intro - sparse, atmospheric]',
    '[Main Theme - melodic hook]',
    '[Build - rising energy]',
    '[Drop - full arrangement]',
    '[Breakdown - stripped back]',
    '[Theme Variation - new texture]',
    '[Final Climax - layered, intense]',
    '[Outro - slow fade]',
  ],
  210: [
    '[Instrumental Intro - sparse, atmospheric]',
    '[Main Theme - melodic hook]',
    '[Build - rising energy]',
    '[Drop - full arrangement]',
    '[Breakdown - stripped back]',
    '[Theme Variation - new texture]',
    '[Build - tension rising]',
    '[Final Climax - layered, intense]',
    '[Outro - slow fade]',
  ],
  240: [
    '[Instrumental Intro - sparse, atmospheric]',
    '[Main Theme - melodic hook]',
    '[Build - rising energy]',
    '[Drop - full arrangement]',
    '[Breakdown - stripped back]',
    '[Interlude - ambient texture]',
    '[Theme Variation - new texture]',
    '[Build - tension rising]',
    '[Final Climax - layered, intense]',
    '[Climax Reprise - extended, evolving]',
    '[Outro - slow fade]',
  ],
};

// 인스트루멘탈 곡용 구조 프롬프트. Suno에서 Instrumental 토글을 켜고 Lyrics 칸에 붙여넣는 용도.
export function buildInstrumentalStructure(durationSec) {
  // 옵션 외의 값이 들어와도 가장 가까운 하위 구간으로 처리한다.
  const keys = Object.keys(INSTRUMENTAL_SECTIONS).map(Number).sort((a, b) => a - b);
  const key = keys.filter(k => k <= durationSec).pop() ?? keys[0];
  return INSTRUMENTAL_SECTIONS[key].join('\n\n');
}

export function buildLyricsPrompt({ stylePrompt, theme, language, structure, extraNotes, styleHints, duration = DEFAULT_DURATION }) {
  const langRule = LANG_RULES[language] ?? LANG_RULES.ko;
  const structureText = TEMPLATES[structure]?.template ?? TEMPLATES[FALLBACK_TEMPLATE_KEY].template;

  // 길이 지침과 모순되지 않도록 곡 구조의 강제 수준을 길이에 따라 조절한다.
  const structureRule = duration <= 120
    ? '기본 틀 — 아래 "길이" 지침에 맞춰 섹션을 생략·압축하세요. 남기는 섹션의 종류와 순서는 이 구조를 따르세요'
    : duration >= 240
      ? '이 섹션 구성과 순서를 따르되, 아래 "길이" 지침이 허용하는 반복·추가는 가능합니다'
      : '이 섹션 구성과 순서를 반드시 그대로 따르세요';
  const shortStructureNote = duration <= 120 ? ' 길이 지침에 따라 섹션을 줄였다면 남긴 섹션만 출력하세요.' : '';

  const hints = [];
  if (styleHints?.genre?.length) hints.push(`- 장르: ${styleHints.genre.join(', ')}`);
  if (styleHints?.mood?.length) {
    hints.push(`- 핵심 무드: ${styleHints.mood.join(', ')} → 가사 전체가 이 감정이어야 합니다. 무드가 어두우면(서글픈·어두운·음산한·침잠하는 등) 절대 밝거나 희망차게 흐르지 말고, 반대로 밝은 무드면 어둡게 빠지지 마세요. 후렴조차 이 무드를 유지하세요.`);
  }
  const hintBlock = hints.length
    ? `\n## 이 곡의 핵심 감정·장르 (최우선 — 반드시 지킬 것)\n${hints.join('\n')}\n`
    : '';

  return `당신은 Suno AI(v5.5, 최신 세대)에 바로 넣을 노래 가사를 쓰는 전문 작사가입니다.
뻔하고 추상적인 가사가 아니라, 구체적이고 기억에 남는 가사를 써주세요.

## 음악 스타일
${stylePrompt || '(스타일 프롬프트 없음 — 가사 내용에 어울리는 톤으로)'}
${hintBlock}
## 스타일을 가사에 반영하기 (가장 중요)
위 "음악 스타일"은 배경 정보가 아니라 가사가 반드시 구현해야 할 토대입니다. 가사를 쓰기 전에 스타일에서 아래를 먼저 읽어내고, 모든 줄이 그것을 따르게 하세요.
- 감정·분위기: 스타일의 무드 단어(예: melancholic, dark, euphoric, dreamy, aggressive, nostalgic)가 가사의 감정 톤과 심상을 결정합니다. 주제가 밝아도 무드가 어두우면 달콤씁쓸하게, 무드가 고양되면 후렴을 터뜨리게 — 무드와 주제가 충돌하면 무드의 렌즈로 주제를 풀어내세요.
- 장르 화법·어휘: 장르에 맞는 어휘와 화법을 쓰세요. 트랩/힙합 → 자신감 있고 리듬감 있는 직설·플렉스, 인디/드림팝 → 부드럽고 인상주의적 심상, 시티팝 → 도시의 밤·드라이브·노스탤지어, R&B/네오소울 → 관능적이고 내밀한, 록 앤썸 → 외치듯 선언적인 후렴, 발라드 → 절제된 서정, EDM → 짧고 반복적인 떼창 훅.
- 보컬·랩: 스타일에 rap / rap flow / melodic rap 이 있으면 해당 벌스를 랩처럼(촘촘한 음절, 내부 라임, 리듬감 있게) 쓰세요. 보컬 구성이 듀엣/그룹/콜앤리스폰스면 파트 분배와 주고받음이 가사에 드러나게 하세요.
- 템포·에너지: 빠른 템포·높은 에너지일수록 줄을 짧고 타격감 있게, 느린 템포일수록 여백을 두고 호흡을 길게. BPM과 무드에 맞춰 줄 밀도를 조절하세요.

## 가사 언어 규칙
${langRule}

## 주제 / 컨셉
${theme || '자유롭게 어울리는 주제로'}

## 곡 구조 (${structureRule})
${structureText}

## 추가 요청
${extraNotes || '없음'}

━━━ 좋은 가사를 위한 핵심 원칙 (반드시 지키세요) ━━━
1. 하나의 분명한 감정·서사 방향을 정하고 끝까지 밀고 가세요. 여러 감정을 두루뭉술하게 섞지 마세요.
2. 보여주되 설명하지 마세요(show, don't tell). "외로워" "슬퍼" 같은 직접 서술 대신 구체적인 장면·사물·행동·감각으로 감정을 드러내세요. 각 Verse마다 손에 잡히는 구체적 이미지(장소, 시간, 물건, 몸짓)를 최소 하나 넣으세요.
3. 진부한 클리셰를 피하세요. 다음 상투어는 쓰지 마세요: 그림자, 메아리, 네온, 불꽃/불씨, 재, 부서진 꿈, 끝없는 밤, 스쳐가는 바람, 별빛, 운명, 멍든 가슴, 흔들리는 촛불.
4. 후렴(Chorus/Hook)에는 10단어 이내의 짧고 반복하기 좋은 핵심 훅 한 줄을 만드세요. 반복되는 후렴마다 그 훅을 똑같이 다시 쓰세요(생략 금지). Verse는 이 훅으로 자연스럽게 이어지도록 빌드업하세요.
5. 섹션마다 역할과 에너지를 다르게 하세요: Verse는 친밀하고 구체적인 장면, Pre-Chorus는 점점 고조, Chorus는 터지고 보편적인 한마디, Bridge는 시점·시간·관점을 바꿔 전환. 모든 섹션이 같은 톤·같은 강도가 되지 않게 하세요.
6. 곡 전체를 관통하는 하나의 중심 이미지·모티프를 정하고, 섹션마다 조금씩 변주하며 반복하세요.
7. 운율(prosody): 같은 역할의 섹션(Verse 1 ↔ Verse 2)은 음절 수와 리듬을 비슷하게 맞춰 같은 멜로디로 부를 수 있게 하세요.

## 섹션 연출 (선택)
- 각 섹션 메타태그 옆에 1~3단어의 짧은 보컬·에너지 연출을 덧붙여도 좋습니다. 예: [Chorus: powerful, layered harmonies], [Bridge: stripped back], [Verse 1: intimate].
- 단, [Reverb: 30%] [Bass: 80%] 같은 수치형 믹싱 태그는 절대 쓰지 마세요(Suno가 무시하고 노이즈가 됩니다).
- 듀엣 구조의 [Verse 1 - Vocalist A] 같은 파트 표기는 그대로 유지하세요.

## 길이 (반드시 지켜주세요)
${durationGuide(duration)}
- 반복 섹션([Chorus] 등)도 매번 가사를 전부 쓰세요(생략·"반복" 표기 금지).

## 출력 형식
- 출력 전, 완성된 가사가 위 음악 스타일의 장르·무드·에너지·보컬(랩 여부)과 일치하는지 점검하세요. 어긋나면 고쳐서 출력하세요.
- 위 곡 구조의 [Verse 1], [Chorus] 등 대괄호 메타태그 표기를 유지하면서 가사만 채워 출력하세요.${shortStructureNote}
- 머리말·해설·부가 설명 없이 가사만 출력하세요.`;
}

// 가사 생성 폼의 상태를 관리하는 훅. 프리셋이 곡 구조를 추천하면 자동으로 동기화한다.
export function useLyricsForm(presetStructure) {
  const [theme, setTheme] = useState('');
  const [language, setLanguage] = useState('ko');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('K-Pop');
  const [structure, setStructure] = useState(FALLBACK_TEMPLATE_KEY);
  const [duration, setDuration] = useState(DEFAULT_DURATION);

  // 프리셋이 곡 구조를 추천하면 렌더 중에 동기화한다(React 권장 패턴).
  const [prevPreset, setPrevPreset] = useState(presetStructure);
  if (presetStructure !== prevPreset) {
    setPrevPreset(presetStructure);
    if (presetStructure) {
      setCategory(presetStructure.category);
      setStructure(presetStructure.structure);
    }
  }

  const changeCategory = useCallback((cat) => {
    setCategory(cat);
    setStructure(firstKeyByCategory(cat));
  }, []);

  const buildPrompt = useCallback((stylePrompt, styleHints) => buildLyricsPrompt({
    stylePrompt, theme, language, structure, extraNotes: notes, styleHints, duration,
  }), [theme, language, structure, notes, duration]);

  return {
    theme, setTheme,
    language, setLanguage,
    notes, setNotes,
    category, changeCategory,
    structure, setStructure,
    duration, setDuration,
    buildPrompt,
  };
}
