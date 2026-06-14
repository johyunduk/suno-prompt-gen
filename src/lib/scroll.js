// 동작 감소(prefers-reduced-motion) 설정을 존중하는 스크롤 헬퍼.
// reduce이면 behavior:'auto'로 즉시 이동한다.
// (CSS html { scroll-behavior } 도 reduced-motion 미디어쿼리로 함께 auto가 되어야
//  scrollIntoView의 'auto'가 CSS smooth로 되돌아가지 않는다 — index.css 참고.)
export function scrollIntoViewA11y(el, block = 'start') {
  if (!el) return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block });
}
