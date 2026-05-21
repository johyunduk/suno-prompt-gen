const SHORT_TEMPLATE = `[Verse 1]
(가사 작성)

[Chorus]
(가사 작성)

[Verse 2]
(가사 작성)

[Chorus]
(가사 작성)

[Outro]
(짧게 마무리)`;

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

  kpop_short: {
    label: 'K-팝 숏 (~2분)',
    category: 'K-Pop',
    desc: '벌스-코러스 2회 + 짧은 아웃트로. 2분 이내 완성형.',
    template: SHORT_TEMPLATE,
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

  pop_short: {
    label: '팝 숏 (~2분)',
    category: '팝',
    desc: '군더더기 없는 2분 팝. 코러스 2회로 빠르게 끝내는 구조.',
    template: SHORT_TEMPLATE,
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

  hiphop_short: {
    label: '힙합 숏 (~2분)',
    category: '힙합/R&B',
    desc: '벌스 2개 + 후크 2회. 2분 안에 핵심만.',
    template: `[Verse 1]
(16바 랩)

[Hook]
(짧은 후크)

[Verse 2]
(16바 랩)

[Hook]
(후크)

[Outro]
(마무리)`,
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

  edm_short: {
    label: 'EDM 숏 (~2분)',
    category: 'EDM',
    desc: '빌드업-드랍 1회 구조. 2분 EDM 클립.',
    template: `[Intro]
(분위기 형성)

[Build]
(긴장감 상승)

[Drop]
(메인 드랍)

[Outro]
(마무리)`,
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

  ballad_short: {
    label: '발라드 숏 (~2분)',
    category: '발라드',
    desc: '절제된 감동. 벌스-코러스 2회로 2분 안에 완성.',
    template: `[Verse 1]
(조용하게 시작)

[Chorus]
(감정 폭발)

[Verse 2]
(가사 작성)

[Chorus]
(가사 작성)

[Outro]
(여운 있게 마무리)`,
  },

  // ── 듀엣 ────────────────────────────────────────
  duet_vv_ab: {
    label: '보컬A → 보컬B',
    category: '듀엣',
    desc: '두 보컬이 각자 벌스를 맡고 코러스는 함께. A가 먼저 시작.',
    template: `[Verse 1 - Vocalist A]
(A의 시점으로 이야기 시작)

[Pre-Chorus - Both]
(함께 긴장감 쌓기)

[Chorus - Both]
(함께 부르는 후크)

[Verse 2 - Vocalist B]
(B의 시점으로 이야기 전개)

[Pre-Chorus - Both]
(가사 작성)

[Chorus - Both]
(가사 작성)

[Bridge - Vocalist A]
(A의 감정 전환)

[Bridge - Vocalist B]
(B의 응답)

[Chorus - Both]
(마지막 코러스 - 함께)

[Outro - Both]
(마무리)`,
  },

  duet_vv_ba: {
    label: '보컬B → 보컬A',
    category: '듀엣',
    desc: '두 보컬이 각자 벌스를 맡고 코러스는 함께. B가 먼저 시작.',
    template: `[Verse 1 - Vocalist B]
(B의 시점으로 이야기 시작)

[Pre-Chorus - Both]
(함께 긴장감 쌓기)

[Chorus - Both]
(함께 부르는 후크)

[Verse 2 - Vocalist A]
(A의 시점으로 이야기 전개)

[Pre-Chorus - Both]
(가사 작성)

[Chorus - Both]
(가사 작성)

[Bridge - Vocalist B]
(B의 감정 전환)

[Bridge - Vocalist A]
(A의 응답)

[Chorus - Both]
(마지막 코러스 - 함께)

[Outro - Both]
(마무리)`,
  },

  duet_vr_vocal_first: {
    label: '보컬 선행 + 랩',
    category: '듀엣',
    desc: '보컬이 벌스 1을 노래하고, 랩퍼가 벌스 2를 랩. 코러스는 함께.',
    template: `[Verse 1 - Vocalist]
(보컬이 감성적으로 시작)

[Pre-Chorus - Both]
(함께 빌드업)

[Chorus - Both]
(함께 부르는 후크)

[Verse 2 - Rapper]
(랩퍼의 16바 랩)

[Chorus - Both]
(가사 작성)

[Verse 3 - Vocalist]
(보컬의 마지막 벌스)

[Rap Bridge - Rapper]
(랩퍼의 브릿지 랩)

[Chorus - Both]
(마지막 코러스)

[Outro - Vocalist]
(보컬로 마무리)`,
  },

  duet_vr_rap_first: {
    label: '랩 선행 + 보컬',
    category: '듀엣',
    desc: '랩퍼가 벌스 1로 시작하고, 보컬이 벌스 2를 노래. 코러스는 함께.',
    template: `[Verse 1 - Rapper]
(랩퍼가 강렬하게 시작 - 16바)

[Pre-Chorus - Both]
(함께 빌드업)

[Chorus - Both]
(함께 부르는 후크)

[Verse 2 - Vocalist]
(보컬이 감성적으로 이어받기)

[Chorus - Both]
(가사 작성)

[Verse 3 - Rapper]
(랩퍼의 두 번째 랩)

[Bridge - Vocalist]
(보컬 브릿지 - 감정 고조)

[Chorus - Both]
(마지막 코러스)

[Outro - Rapper]
(랩으로 마무리)`,
  },

  duet_call_response: {
    label: '콜앤리스폰스',
    category: '듀엣',
    desc: '두 보컬이 한 절씩 교대로 주고받는 대화형 구조.',
    template: `[Intro - Both]
(함께 오프닝)

[Verse 1A - Vocalist A]
(A의 첫 번째 라인)

[Verse 1B - Vocalist B]
(B의 응답 라인)

[Chorus - Both]
(함께 후크)

[Verse 2A - Vocalist B]
(이번엔 B가 먼저)

[Verse 2B - Vocalist A]
(A의 응답)

[Chorus - Both]
(가사 작성)

[Bridge - Vocalist A]
(A 단독 감정 폭발)

[Bridge - Vocalist B]
(B 단독 응답)

[Final Chorus - Both]
(함께 - 가장 강렬하게)

[Outro - Both]
(함께 마무리)`,
  },

  duet_kpop_feature: {
    label: 'K-팝 피처링',
    category: '듀엣',
    desc: '메인 아티스트 + 피처링 구조. 피처링이 브릿지/랩 파트 담당.',
    template: `[Intro - Main]
(메인 보컬 인트로)

[Verse 1 - Main]
(메인 보컬 벌스)

[Pre-Chorus - Main]
(가사 작성)

[Chorus - Main]
(메인 훅)

[Verse 2 - Feature]
(피처링 아티스트 파트)

[Pre-Chorus - Both]
(함께 빌드업)

[Chorus - Both]
(함께 코러스)

[Bridge - Feature]
(피처링의 랩 또는 보컬 브릿지)

[Chorus - Both]
(마지막 코러스 - 함께)

[Outro - Main]
(메인 보컬 마무리)`,
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

export const TEMPLATE_CATEGORIES = ['K-Pop', '팝', '힙합/R&B', 'EDM', '발라드', '듀엣', '기타'];
