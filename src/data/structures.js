export const TEMPLATES = {
  // ── K-Pop ──────────────────────────────────────
  kpop_standard: {
    label: 'K-팝 기본',
    category: 'K-Pop',
    desc: '가장 흔한 K-팝 구조. 벌스-프리코러스-코러스의 3단 빌드업.',
    template: `[Verse 1]
(가사 작성)

[Pre-Chorus]
(가사 작성)

[Chorus]
(가사 작성)

[Verse 2]
(가사 작성)

[Pre-Chorus]
(가사 작성)

[Chorus]
(가사 작성)

[Bridge]
(분위기 전환)

[Chorus]
(가사 작성)

[Outro]
(마무리)`,
  },

  kpop_girl_group: {
    label: '걸그룹 뱅어',
    category: 'K-Pop',
    desc: '강렬한 인트로 + 포인트 파트가 있는 걸그룹 전형 구조.',
    template: `[Intro]
(강렬한 오프닝)

[Verse 1]
(가사 작성)

[Pre-Chorus]
(가사 작성)

[Chorus]
(가사 작성)

[Verse 2]
(가사 작성)

[Pre-Chorus]
(가사 작성)

[Chorus]
(가사 작성)

[Bridge]
(포인트 파트 - 에너지 전환)

[Big Chorus]
(마지막 코러스 - 더 화려하게)

[Outro]
(마무리)`,
  },

  kpop_4th_gen: {
    label: 'K-팝 4세대',
    category: 'K-Pop',
    desc: '뉴진스·에스파 스타일. 훅이 먼저 나오고 구조가 비선형적.',
    template: `[Intro]
(분위기 세팅 - 짧게)

[Chorus]
(훅 먼저 - 강렬하게)

[Verse 1]
(가사 작성)

[Chorus]
(가사 작성)

[Verse 2]
(가사 작성)

[Bridge]
(미니멀하게 - 분위기 전환)

[Chorus]
(가사 작성)

[Outro]
(짧게 마무리)`,
  },

  kpop_title: {
    label: 'K-팝 타이틀곡',
    category: 'K-Pop',
    desc: '인트로-포인트-아웃트로가 있는 정규 앨범 타이틀 구조.',
    template: `[Intro]
(임팩트 있는 오프닝)

[Verse 1]
(가사 작성)

[Pre-Chorus]
(가사 작성)

[Chorus]
(가사 작성)

[Verse 2]
(가사 작성)

[Pre-Chorus]
(가사 작성)

[Chorus]
(가사 작성)

[Bridge]
(포인트 파트)

[Rap]
(랩 파트 - 선택)

[Big Chorus]
(마지막 코러스)

[Outro]
(시그니처 마무리)`,
  },

  kpop_ballad: {
    label: 'K-팝 감성 발라드',
    category: 'K-Pop',
    desc: '느린 빌드업 후 감정이 폭발하는 K-팝 발라드 구조.',
    template: `[Intro]
(피아노 인트로)

[Verse 1]
(조용하게 시작)

[Chorus]
(감정 폭발)

[Verse 2]
(가사 작성)

[Chorus]
(가사 작성)

[Bridge]
(고조되는 감정)

[Big Chorus]
(마지막 - 가장 웅장하게)

[Outro]
(여운 있게 마무리)`,
  },

  // ── 팝 ──────────────────────────────────────────
  pop_standard: {
    label: '팝 기본',
    category: '팝',
    desc: '서양 팝의 표준 구조. 가장 보편적인 형태.',
    template: `[Verse 1]
(가사 작성)

[Pre-Chorus]
(가사 작성)

[Chorus]
(가사 작성)

[Verse 2]
(가사 작성)

[Pre-Chorus]
(가사 작성)

[Chorus]
(가사 작성)

[Outro]
(마무리)`,
  },

  pop_bridge: {
    label: '팝 + 브릿지',
    category: '팝',
    desc: '클래식한 브릿지가 있는 팝 구조. 빌리 아일리시, 올리비아 로드리고 스타일.',
    template: `[Verse 1]
(가사 작성)

[Chorus]
(가사 작성)

[Verse 2]
(가사 작성)

[Chorus]
(가사 작성)

[Bridge]
(분위기 전환 - 조용하게 또는 강렬하게)

[Big Chorus]
(마지막 코러스)

[Outro]
(마무리)`,
  },

  pop_chorus_first: {
    label: '코러스 먼저 (Hook-First)',
    category: '팝',
    desc: '스트리밍 시대 팝 전략. 첫 5초에 훅 등장.',
    template: `[Chorus]
(훅 먼저 - 강렬하게)

[Verse 1]
(가사 작성)

[Pre-Chorus]
(가사 작성)

[Chorus]
(가사 작성)

[Verse 2]
(가사 작성)

[Pre-Chorus]
(가사 작성)

[Chorus]
(가사 작성)

[Outro]
(마무리)`,
  },

  // ── 힙합 / R&B ──────────────────────────────────
  hiphop: {
    label: '힙합',
    category: '힙합/R&B',
    desc: '벌스-훅 구조. 16바 랩 + 짧은 후크 반복.',
    template: `[Intro]
(분위기 세팅)

[Verse 1]
(16바 랩)

[Hook]
(짧고 반복적인 후크)

[Verse 2]
(16바 랩)

[Hook]
(후크)

[Bridge]
(전환 구간)

[Hook]
(후크)

[Outro]
(마무리)`,
  },

  trap_melodic: {
    label: '멜로딕 트랩',
    category: '힙합/R&B',
    desc: '랩과 멜로디 보컬이 혼합된 현대 트랩 구조.',
    template: `[Intro]
(멜로딕 인트로)

[Chorus]
(멜로딕 후크)

[Verse 1]
(랩 파트)

[Chorus]
(후크)

[Verse 2]
(랩 파트)

[Chorus]
(후크)

[Bridge]
(분위기 전환)

[Outro]
(페이드 아웃)`,
  },

  rnb_smooth: {
    label: 'R&B / 네오소울',
    category: '힙합/R&B',
    desc: '그루비한 R&B 구조. 프랭크 오션, SZA 스타일.',
    template: `[Intro]
(그루브 세팅)

[Verse 1]
(가사 작성)

[Pre-Chorus]
(가사 작성)

[Chorus]
(가사 작성)

[Verse 2]
(가사 작성)

[Pre-Chorus]
(가사 작성)

[Chorus]
(가사 작성)

[Bridge]
(소울풀한 전환)

[Chorus]
(마지막 코러스)

[Outro]
(여운 있게)`,
  },

  // ── EDM ─────────────────────────────────────────
  edm: {
    label: 'EDM / 하우스',
    category: 'EDM',
    desc: '빌드업-드랍이 두 번 반복되는 클럽/페스티벌 구조.',
    template: `[Intro]
(분위기 형성)

[Build]
(긴장감 상승)

[Drop]
(메인 드랍)

[Break]
(중간 정리)

[Build]
(두 번째 빌드)

[Drop]
(두 번째 드랍)

[Outro]
(마무리)`,
  },

  future_bass: {
    label: '퓨처베이스',
    category: 'EDM',
    desc: '보컬 훅이 있는 퓨처베이스 구조. 뭄바톤, 일렉트로팝 계열.',
    template: `[Intro]
(부드러운 시작)

[Verse 1]
(보컬 가사)

[Pre-Chorus]
(빌드업)

[Drop]
(메인 드랍 - 가장 강렬하게)

[Verse 2]
(보컬 가사)

[Pre-Chorus]
(빌드업)

[Drop]
(두 번째 드랍)

[Bridge]
(잔잔하게 전환)

[Drop]
(마지막 드랍)

[Outro]
(페이드 아웃)`,
  },

  // ── 발라드 ──────────────────────────────────────
  ballad: {
    label: '발라드',
    category: '발라드',
    desc: '천천히 쌓아 올리는 감동 발라드 구조.',
    template: `[Intro]
(피아노 인트로)

[Verse 1]
(조용하게 시작)

[Chorus]
(감정 폭발)

[Verse 2]
(가사 작성)

[Chorus]
(가사 작성)

[Bridge]
(감정 고조)

[Big Chorus]
(마지막 - 가장 웅장하게)

[Outro]
(여운 있게 페이드 아웃)`,
  },

  // ── 기타 ────────────────────────────────────────
  folk_simple: {
    label: '포크 / 어쿠스틱',
    category: '기타',
    desc: '단순하고 서정적인 포크 구조. 내러티브 중심.',
    template: `[Verse 1]
(이야기 시작)

[Chorus]
(감정 핵심)

[Verse 2]
(이야기 전개)

[Chorus]
(가사 작성)

[Verse 3]
(이야기 마무리)

[Chorus]
(마지막 코러스)

[Outro]
(조용하게 마무리)`,
  },

  extended: {
    label: '풀 구조 (Long)',
    category: '기타',
    desc: '솔로 구간까지 포함된 완성형 긴 구조.',
    template: `[Intro]
(분위기 세팅)

[Verse 1]
(가사 작성)

[Pre-Chorus]
(가사 작성)

[Chorus]
(가사 작성)

[Verse 2]
(가사 작성)

[Pre-Chorus]
(가사 작성)

[Chorus]
(가사 작성)

[Bridge]
(전환 구간)

[Instrumental]
(악기 솔로)

[Big Chorus]
(마지막 코러스)

[Outro]
(마무리)`,
  },
};

export const TEMPLATE_CATEGORIES = ['K-Pop', '팝', '힙합/R&B', 'EDM', '발라드', '기타'];
