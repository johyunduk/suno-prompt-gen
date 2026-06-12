import { extractInstrumental } from './instrumental.js';

// 저장 항목의 data 구조: { stylePrompt, exclude, instrumental, advanced }
// advanced: { vocalGender, weirdness, styleInfluence } | null (AI 정제를 거친 경우에만)
//
// 인스트루멘탈 토큰은 stylePrompt에 저장하지 않고 instrumental 플래그로만 관리한다.
// (양쪽에 있으면 불러오기 시 토큰이 중복 조립된다.)

// 저장 직전 데이터 정리 — stylePrompt에 토큰이 섞여 있으면 분리해 플래그로 합친다.
export function makeEntryData({ stylePrompt, exclude, instrumental, advanced }) {
  const parsed = extractInstrumental(stylePrompt || '');
  return {
    stylePrompt: parsed.text,
    exclude: exclude || '',
    instrumental: !!instrumental || parsed.instrumental,
    advanced: advanced ?? null,
  };
}

// 구버전(문자열 prompt) 항목을 신버전 data 구조로 정규화한다.
// 신버전 항목도 토큰 분리를 다시 적용해 일관성을 보장한다.
export function normalizeEntry(entry) {
  if (entry?.data && typeof entry.data.stylePrompt === 'string') {
    return { ...entry, data: makeEntryData(entry.data) };
  }
  const parsed = extractInstrumental(entry?.prompt || '');
  return {
    id: entry?.id,
    name: entry?.name || '',
    createdAt: entry?.createdAt,
    data: {
      stylePrompt: parsed.text,
      exclude: '',
      instrumental: parsed.instrumental,
      advanced: null,
    },
  };
}

// 불러오기 시 빌더 상태로 변환한다.
export function entryToBuilderState(data) {
  const parsed = extractInstrumental(data?.stylePrompt || '');
  return {
    custom: parsed.text,
    instrumental: !!data?.instrumental || parsed.instrumental,
    exclude: data?.exclude || '',
  };
}

// 불러오기 직후 useStyleBuilder의 refinePayload가 갖게 될 모양.
// (불러오기는 태그/보컬 캐스팅을 비우므로 selection/vocalPrompt는 빈 값)
// Builder가 저장된 advanced 설정을 정제 결과로 복원할 때 캐시 키 계산에 사용한다.
// 주의: useStyleBuilder.refinePayload의 키 순서와 정확히 일치해야 한다.
export function payloadAfterLoad(data) {
  const state = entryToBuilderState(data);
  return {
    selection: {},
    vocalPrompt: '',
    custom: state.custom.trim(),
    instrumental: state.instrumental,
    exclude: state.exclude.trim(),
  };
}
