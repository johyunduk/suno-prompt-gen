// 아티스트명 유출 방어 — LLM 지시만 믿지 않고 입력에서 감지한 이름이
// 정제 결과에 남아 있는지 코드로 검증한다.

// 사용자 직접 입력에서 아티스트 참조 패턴으로 이름 후보를 수집한다.
// (임의의 고유명사 전부를 감지할 수는 없으므로 명시적 참조 패턴에 한정한다.)
export function collectArtistNames(custom) {
  if (!custom) return [];
  const names = new Set();
  const patterns = [
    /inspired by\s+([A-Za-z가-힣][A-Za-z0-9가-힣 .&'-]{0,30}?)(?=\s*(?:,|$))/gi, // inspired by IU
    /([A-Z][A-Za-z0-9.&'-]*(?:\s+[A-Z][A-Za-z0-9.&'-]*)*)[\s-]+style/g, // Frank Ocean style / IU-style
    /([A-Za-z가-힣][A-Za-z0-9가-힣 .&'-]{0,30}?)\s*스타일/g, // IU 스타일 / 아이유 스타일
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(custom))) {
      const name = m[1].trim();
      if (name) names.add(name);
    }
  }
  return [...names];
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 단어 경계 기반 포함 검사 — "IU"가 "triumphant" 안에서 오탐되지 않게 한다.
// (\b는 유니코드 문자에 약하므로 문자/숫자 경계 lookaround를 직접 쓴다.)
function containsName(text, name) {
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(name)}(?![\\p{L}\\p{N}])`, 'iu');
  return re.test(text);
}

// 정제 결과에 아티스트 참조가 남았는지 검사해 유출 목록을 돌려준다.
export function findArtistLeaks(stylePrompt, names) {
  const leaks = [];
  const text = stylePrompt || '';
  if (/inspired by/i.test(text)) leaks.push('inspired by');
  for (const name of names) {
    if (containsName(text, name)) leaks.push(name);
  }
  return leaks;
}
