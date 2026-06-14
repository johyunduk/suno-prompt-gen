import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countAdvancedTags, countActiveExtras } from '../src/lib/builderSummary.js';

test('countAdvancedTags: 핵심(genre/mood)은 제외하고 상세 그룹만 합산', () => {
  const selected = { genre: ['Pop', 'Rock'], mood: ['dark'], instrument: ['piano', 'synth'], tempo: ['120bpm'] };
  // genre/mood 제외 → instrument 2 + tempo 1 = 3
  assert.equal(countAdvancedTags(selected, false), 3);
});

test('countAdvancedTags: 인스트루멘탈이면 보컬 그룹은 집계 제외', () => {
  const selected = { vocal_arrangement: ['female vocals'], vocal_style: ['breathy'], instrument: ['piano'] };
  assert.equal(countAdvancedTags(selected, false), 3); // 1 + 1 + 1
  assert.equal(countAdvancedTags(selected, true), 1);  // 보컬 2개 제외 → instrument 1
});

test('countActiveExtras: 값의 개수가 아니라 활성 카테고리 수(0~3)', () => {
  // 직접 입력에 단어가 여러 개여도 카테고리는 1
  assert.equal(countActiveExtras({ vocalPrompt: '', custom: 'warm analog, vintage', excludePrompt: '', instrumental: false }), 1);
  // 세 카테고리 모두 값 → 3
  assert.equal(countActiveExtras({ vocalPrompt: 'female vocals', custom: 'x', excludePrompt: 'autotune', instrumental: false }), 3);
  // 빈 문자열/공백은 미집계 → 0
  assert.equal(countActiveExtras({ vocalPrompt: '   ', custom: '', excludePrompt: '  ', instrumental: false }), 0);
});

test('countActiveExtras: 인스트루멘탈이면 보컬 캐스팅은 미집계', () => {
  assert.equal(countActiveExtras({ vocalPrompt: 'female vocals', custom: '', excludePrompt: '', instrumental: true }), 0);
  // Exclude는 인스트루멘탈과 무관하게 집계
  assert.equal(countActiveExtras({ vocalPrompt: 'female vocals', custom: '', excludePrompt: 'autotune', instrumental: true }), 1);
});
