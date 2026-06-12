import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeEntryData, normalizeEntry, entryToBuilderState, payloadAfterLoad } from '../src/lib/promptStorage.js';
import { INSTRUMENTAL_TOKEN } from '../src/lib/instrumental.js';

// useStyleBuilder.prompt 메모와 같은 방식으로 프롬프트를 재조립한다.
function rebuildPrompt(state) {
  const values = [];
  if (state.instrumental) values.unshift(INSTRUMENTAL_TOKEN);
  if (state.custom.trim()) values.push(state.custom.trim());
  return values.join(', ');
}

test('인스트루멘탈 저장→불러오기 왕복에서 토큰이 중복되지 않음', () => {
  // 빌더의 effectiveStyle에는 이미 토큰이 포함되어 있다.
  const effectiveStyle = `${INSTRUMENTAL_TOKEN}, Lo-Fi, 80bpm`;
  const saved = makeEntryData({ stylePrompt: effectiveStyle, exclude: '', instrumental: true, advanced: null });

  assert.equal(saved.stylePrompt, 'Lo-Fi, 80bpm'); // 토큰은 플래그로만
  assert.equal(saved.instrumental, true);

  const state = entryToBuilderState(normalizeEntry({ id: 1, name: 'x', data: saved }).data);
  const rebuilt = rebuildPrompt(state);
  assert.equal(rebuilt, `${INSTRUMENTAL_TOKEN}, Lo-Fi, 80bpm`);
  assert.equal(rebuilt.split(INSTRUMENTAL_TOKEN).length - 1, 1); // 토큰 정확히 1회
});

test('일반 항목 왕복: stylePrompt/exclude/advanced 보존', () => {
  const data = makeEntryData({
    stylePrompt: 'city pop, nostalgic, 100bpm',
    exclude: 'rap, autotune',
    instrumental: false,
    advanced: { vocalGender: 'female', weirdness: 35, styleInfluence: 75 },
  });
  const norm = normalizeEntry({ id: 2, name: 'y', data });
  assert.deepEqual(norm.data, data);

  const state = entryToBuilderState(norm.data);
  assert.equal(state.custom, 'city pop, nostalgic, 100bpm');
  assert.equal(state.exclude, 'rap, autotune');
  assert.equal(state.instrumental, false);
});

test('payloadAfterLoad가 불러오기 직후 refinePayload 모양과 일치 (advanced 복원 캐시 키)', () => {
  const data = {
    stylePrompt: 'city pop, 100bpm',
    exclude: ' rap ',
    instrumental: false,
    advanced: { vocalGender: 'female', weirdness: 35, styleInfluence: 75 },
  };
  // useStyleBuilder.refinePayload의 리터럴 키 순서·정규화 규칙과 동일해야 한다.
  const expected = {
    selection: {},
    vocalPrompt: '',
    custom: 'city pop, 100bpm',
    instrumental: false,
    exclude: 'rap',
  };
  assert.equal(JSON.stringify(payloadAfterLoad(data)), JSON.stringify(expected));
});

test('구버전 문자열 항목(토큰 포함)도 왕복 시 토큰 1회', () => {
  const norm = normalizeEntry({ id: 3, name: 'old', prompt: `${INSTRUMENTAL_TOKEN}, Ambient, 60bpm` });
  const state = entryToBuilderState(norm.data);
  const rebuilt = rebuildPrompt(state);
  assert.equal(rebuilt.split(INSTRUMENTAL_TOKEN).length - 1, 1);
  assert.ok(rebuilt.endsWith('Ambient, 60bpm'));
});
