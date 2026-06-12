// 인스트루멘탈은 빌더의 전용 상태로 관리하고, 프롬프트 문자열에는 이 토큰으로만 나타난다.
export const INSTRUMENTAL_TOKEN = 'no vocals, instrumental';

// 저장 프롬프트·공유 URL 문자열에서 인스트루멘탈 토큰만 정확히 분리한다.
// ("no vocals in intro" 같은 부분 지시문은 인스트루멘탈로 오인하지 않는다.)
export function extractInstrumental(text) {
  const re = /(?:^|,\s*)no vocals,\s*instrumental(?=\s*,|\s*$)/i;
  if (!re.test(text)) return { text, instrumental: false };
  const stripped = text.replace(re, '').replace(/^\s*,\s*/, '').trim();
  return { text: stripped, instrumental: true };
}
