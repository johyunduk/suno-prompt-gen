import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyTagToggle, sanitizeSelection, findSoftConflicts } from '../src/lib/tagRules.js';

test('단일 선택 그룹(BPM)은 새 선택이 기존 선택을 교체', () => {
  let s = { tempo: ['60bpm'] };
  const r = applyTagToggle(s, 'tempo', '160bpm');
  assert.deepEqual(r.selected.tempo, ['160bpm']);
  assert.deepEqual(r.released, ['60bpm']);
});

test('장르는 최대 2개 — 3번째 선택 시 가장 오래된 것 해제', () => {
  const s = { genre: ['Pop', 'Rock'] };
  const r = applyTagToggle(s, 'genre', 'Jazz');
  assert.deepEqual(r.selected.genre, ['Rock', 'Jazz']);
  assert.deepEqual(r.released, ['Pop']);
});

test('무드는 최대 3개', () => {
  const s = { mood: ['dark', 'dreamy', 'ethereal'] };
  const r = applyTagToggle(s, 'mood', 'haunting');
  assert.equal(r.selected.mood.length, 3);
  assert.ok(r.selected.mood.includes('haunting'));
  assert.deepEqual(r.released, ['dark']);
});

test('이미 선택된 태그 토글은 해제만 수행', () => {
  const s = { genre: ['Pop', 'Rock'] };
  const r = applyTagToggle(s, 'genre', 'Pop');
  assert.deepEqual(r.selected.genre, ['Rock']);
  assert.deepEqual(r.released, []);
});

test('하드 충돌: 미니멀 프로덕션 선택 시 맥시멀 자동 해제', () => {
  const s = { production: ['maximalist', 'wide stereo'] };
  const r = applyTagToggle(s, 'production', 'minimal production');
  assert.ok(!r.selected.production.includes('maximalist'));
  assert.ok(r.selected.production.includes('minimal production'));
  assert.ok(r.selected.production.includes('wide stereo'));
  assert.deepEqual(r.released, ['maximalist']);
});

test('하드 충돌: 속삭임 ↔ 파워풀 (보컬 음색)', () => {
  const s = { vocal_style: ['powerful'] };
  const r = applyTagToggle(s, 'vocal_style', 'whisper');
  assert.deepEqual(r.selected.vocal_style, ['whisper']);
});

test('sanitizeSelection: 한도 초과는 앞에서부터 유지, 충돌은 선선택 우선', () => {
  const clean = sanitizeSelection({
    genre: ['Pop', 'Rock', 'Jazz'],
    mood: ['dark', 'dreamy', 'ethereal', 'haunting'],
    tempo: ['60bpm', '160bpm'],
    production: ['reverb-heavy', 'dry signal', 'warm analog'],
  });
  assert.deepEqual(clean.genre, ['Pop', 'Rock']);
  assert.equal(clean.mood.length, 3);
  assert.deepEqual(clean.tempo, ['60bpm']);
  assert.deepEqual(clean.production, ['reverb-heavy', 'warm analog']); // dry signal은 reverb-heavy와 충돌
});

test('소프트 충돌은 자동 해제 없이 경고 목록만 반환', () => {
  const s = { mood: ['dark', 'uplifting'] };
  const r = applyTagToggle(s, 'mood', 'dreamy'); // 토글해도 dark/uplifting 유지
  assert.ok(r.selected.mood.includes('dark'));
  assert.ok(r.selected.mood.includes('uplifting'));

  const warnings = findSoftConflicts({ mood: ['dark', 'uplifting'] });
  assert.equal(warnings.length, 1);
  assert.ok(warnings[0].message.includes('상충'));
});

test('충돌 없는 선택은 경고 없음', () => {
  assert.deepEqual(findSoftConflicts({ mood: ['dark', 'haunting'], genre: ['Dark Pop'] }), []);
});
