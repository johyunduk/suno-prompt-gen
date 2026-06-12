import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractInstrumental, INSTRUMENTAL_TOKEN } from '../src/lib/instrumental.js';

test('토큰 단독', () => {
  assert.deepEqual(extractInstrumental(INSTRUMENTAL_TOKEN), { text: '', instrumental: true });
});

test('토큰이 맨 앞에 있는 프롬프트', () => {
  const r = extractInstrumental('no vocals, instrumental, Lo-Fi, chill, 80bpm');
  assert.equal(r.instrumental, true);
  assert.equal(r.text, 'Lo-Fi, chill, 80bpm');
});

test('토큰이 중간에 있는 프롬프트', () => {
  const r = extractInstrumental('Lo-Fi, no vocals, instrumental, 80bpm');
  assert.equal(r.instrumental, true);
  assert.equal(r.text, 'Lo-Fi, 80bpm');
});

test('토큰이 끝에 있는 프롬프트', () => {
  const r = extractInstrumental('Lo-Fi, chill, no vocals, instrumental');
  assert.equal(r.instrumental, true);
  assert.equal(r.text, 'Lo-Fi, chill');
});

test('대소문자 무시', () => {
  assert.equal(extractInstrumental('Lo-Fi, No Vocals, Instrumental').instrumental, true);
});

test('부분 지시문은 인스트루멘탈로 오인하지 않음', () => {
  for (const s of [
    'no vocals in intro, Lo-Fi',
    'no vocals until the chorus, Pop',
    'instrumental beats, vinyl warmth',
    'lo-fi hip-hop, instrumental break in bridge',
  ]) {
    const r = extractInstrumental(s);
    assert.equal(r.instrumental, false, s);
    assert.equal(r.text, s);
  }
});

test('빈 문자열', () => {
  assert.deepEqual(extractInstrumental(''), { text: '', instrumental: false });
});
