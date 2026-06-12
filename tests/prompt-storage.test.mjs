import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEntry } from '../src/lib/promptStorage.js';

test('신버전 구조화 항목은 그대로 통과 (왕복 보존)', () => {
  const entry = {
    id: 1,
    name: '시티팝',
    createdAt: '2026-06-12T00:00:00.000Z',
    data: {
      stylePrompt: 'city pop, nostalgic, 100bpm',
      exclude: 'rap, autotune',
      instrumental: false,
      advanced: { vocalGender: 'female', weirdness: 35, styleInfluence: 75 },
    },
  };
  const out = normalizeEntry(entry);
  assert.deepEqual(out.data, entry.data);
  assert.equal(out.name, '시티팝');
});

test('구버전 문자열 항목은 data 구조로 마이그레이션', () => {
  const out = normalizeEntry({ id: 2, name: 'old', prompt: 'Lo-Fi, chill, 80bpm' });
  assert.deepEqual(out.data, {
    stylePrompt: 'Lo-Fi, chill, 80bpm',
    exclude: '',
    instrumental: false,
    advanced: null,
  });
});

test('구버전 항목의 인스트루멘탈 토큰은 플래그로 분리', () => {
  const out = normalizeEntry({ id: 3, name: 'old-inst', prompt: 'no vocals, instrumental, Lo-Fi, 80bpm' });
  assert.equal(out.data.instrumental, true);
  assert.equal(out.data.stylePrompt, 'Lo-Fi, 80bpm');
});

test('advanced의 personalization 등 추가 필드도 그대로 보존', () => {
  const advanced = { vocalGender: 'any', weirdness: 50, styleInfluence: 70, personalization: '발라드라면 Voices로 본인 음색을 입혀보세요.' };
  const out = normalizeEntry({ id: 9, name: 'p13n', data: { stylePrompt: 'ballad', exclude: '', instrumental: false, advanced } });
  assert.deepEqual(out.data.advanced, advanced);
});

test('부분 필드만 있는 신버전 항목은 기본값 보강', () => {
  const out = normalizeEntry({ id: 4, name: 'p', data: { stylePrompt: 'pop' } });
  assert.deepEqual(out.data, { stylePrompt: 'pop', exclude: '', instrumental: false, advanced: null });
});

test('깨진 항목도 빈 data로 정규화', () => {
  const out = normalizeEntry({});
  assert.deepEqual(out.data, { stylePrompt: '', exclude: '', instrumental: false, advanced: null });
});
