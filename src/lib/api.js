// JSON POST 공통 헬퍼 — 타임아웃과 비정상 응답(HTML 에러 페이지 등)을 견고하게 처리한다.
const DEFAULT_TIMEOUT_MS = 35000;

export async function postJSON(url, body, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.', { cause: e });
    }
    throw new Error('네트워크 오류로 요청에 실패했습니다.', { cause: e });
  } finally {
    clearTimeout(timer);
  }

  // 응답 본문이 JSON이 아닐 수도 있으므로 안전하게 파싱한다.
  let data;
  try {
    data = await res.json();
  } catch {
    // 비-JSON 응답(HTML 에러 페이지 등)은 무시하고 상태코드로 판단한다.
  }

  if (!res.ok) {
    throw new Error(data?.error || `요청에 실패했습니다. (${res.status})`);
  }
  return data ?? {};
}
