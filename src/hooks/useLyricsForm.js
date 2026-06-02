import { useState, useCallback } from 'react';
import { TEMPLATES } from '../data/structures';

export const FALLBACK_TEMPLATE_KEY = Object.keys(TEMPLATES)[0];

export const LANG_OPTIONS = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: '영어' },
  { value: 'mix', label: '한영 혼용' },
];

const LANG_LABEL = {
  ko: '한국어',
  en: '영어',
  mix: '한국어와 영어를 자연스럽게 혼용해서',
};

function firstKeyByCategory(cat) {
  const entry = Object.entries(TEMPLATES).find(([, t]) => t.category === cat);
  return entry?.[0] ?? FALLBACK_TEMPLATE_KEY;
}

export function buildLyricsPrompt({ stylePrompt, theme, language, structure, extraNotes }) {
  const lang = LANG_LABEL[language] ?? LANG_LABEL.ko;
  const structureText = TEMPLATES[structure]?.template ?? TEMPLATES[FALLBACK_TEMPLATE_KEY].template;

  return `다음 조건에 맞는 노래 가사를 써줘.

## 음악 스타일
${stylePrompt || '(스타일 프롬프트 없음)'}

## 가사 언어
${lang}

## 주제 / 컨셉
${theme || '자유롭게 어울리는 주제로'}

## 곡 구조 (이 구조를 반드시 따라줘)
${structureText}

## 추가 요청
${extraNotes || '없음'}

## 길이 제한 (반드시 지켜줘)
- 완성된 곡이 **2분 30초~3분** 사이가 되도록 가사 분량을 조절해줘
- 각 섹션(Verse, Chorus 등)은 **4~6줄**로 작성해줘
- Outro는 **2~3줄**로 마무리해줘
- 반복 섹션([Chorus] 등)도 가사를 생략하지 말고 매번 전체를 다 써줘

---
위 구조 그대로 [Verse 1], [Chorus] 등 메타태그를 유지하면서 가사를 채워줘.
각 섹션의 분위기와 에너지가 자연스럽게 흐르도록 해줘.
Suno AI에 바로 넣을 수 있는 형태로 완성해줘.
가사만 출력해줘. 설명이나 부가 텍스트 없이.
`;
}

// 가사 생성 폼의 상태를 관리하는 훅. 프리셋이 곡 구조를 추천하면 자동으로 동기화한다.
export function useLyricsForm(presetStructure) {
  const [theme, setTheme] = useState('');
  const [language, setLanguage] = useState('ko');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('K-Pop');
  const [structure, setStructure] = useState(FALLBACK_TEMPLATE_KEY);

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

  const buildPrompt = useCallback((stylePrompt) => buildLyricsPrompt({
    stylePrompt, theme, language, structure, extraNotes: notes,
  }), [theme, language, structure, notes]);

  return {
    theme, setTheme,
    language, setLanguage,
    notes, setNotes,
    category, changeCategory,
    structure, setStructure,
    buildPrompt,
  };
}
