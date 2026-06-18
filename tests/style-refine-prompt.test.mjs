import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildExternalStyleRefinePrompt } from '../src/lib/styleRefinePrompt.js';

test('외부 AI 스타일 정제 요청문에 구조화 선택값과 출력 형식을 포함', () => {
  const prompt = buildExternalStyleRefinePrompt({
    selection: {
      genre: ['K-Pop', 'Synth-Pop'],
      mood: ['euphoric'],
      tempo: ['140bpm'],
    },
    vocalPrompt: 'male group vocals',
    custom: 'cinematic build',
    instrumental: false,
    exclude: 'lo-fi',
  });

  assert.match(prompt, /장르: K-Pop, Synth-Pop/);
  assert.match(prompt, /분위기: euphoric/);
  assert.match(prompt, /BPM \/ 템포: 140bpm/);
  assert.match(prompt, /보컬 캐스팅: male group vocals/);
  assert.match(prompt, /직접 입력: cinematic build/);
  assert.match(prompt, /사용자가 제외한 요소: lo-fi/);
  assert.match(prompt, /### Style of Music/);
  assert.match(prompt, /### Exclude Styles/);
  assert.match(prompt, /Weirdness: 숫자%/);
});

test('인스트루멘탈 상태를 외부 AI 요청문에 명시', () => {
  const prompt = buildExternalStyleRefinePrompt({
    selection: { genre: ['Ambient'] },
    instrumental: true,
  });

  assert.match(prompt, /인스트루멘탈: 예/);
  assert.match(prompt, /보컬 설명은 제거/);
});
