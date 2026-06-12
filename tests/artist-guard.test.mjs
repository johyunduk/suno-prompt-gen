import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectArtistNames, findArtistLeaks } from '../api/_lib/artistGuard.js';

test('inspired by 패턴에서 이름 수집', () => {
  assert.deepEqual(collectArtistNames('inspired by IU, no autotune'), ['IU']);
});

test('X style / X-style 패턴에서 이름 수집', () => {
  assert.ok(collectArtistNames('Frank Ocean style hip-hop').includes('Frank Ocean'));
  assert.ok(collectArtistNames('IU-style ballad').includes('IU'));
});

test('한국어 "스타일" 패턴에서 이름 수집 (한글 이름 포함)', () => {
  assert.ok(collectArtistNames('IU 스타일로 만들어줘').includes('IU'));
  assert.ok(collectArtistNames('아이유 스타일').includes('아이유'));
  assert.ok(collectArtistNames('inspired by 아이유').includes('아이유'));
});

test('짧은 이름이 다른 단어 일부와 겹쳐도 오탐하지 않음 (단어 경계)', () => {
  // "IU"가 "triumphant" 안의 iu에 매칭되면 안 된다.
  const leaks = findArtistLeaks('K-pop, triumphant, powerful female vocals', ['IU']);
  assert.deepEqual(leaks, []);
});

test('단어 경계가 있는 진짜 유출은 검출', () => {
  assert.ok(findArtistLeaks('K-pop ballad, IU, piano', ['IU']).includes('IU'));
  assert.ok(findArtistLeaks('K-pop, IU-style ballad', ['IU']).includes('IU'));
});

test('참조 패턴이 없으면 빈 배열', () => {
  assert.deepEqual(collectArtistNames('warm analog, 90s production'), []);
  assert.deepEqual(collectArtistNames(''), []);
});

test('결과에 이름이 남으면 유출로 검출', () => {
  const leaks = findArtistLeaks('K-pop ballad inspired by IU, piano-led', ['IU']);
  assert.ok(leaks.includes('inspired by'));
  assert.ok(leaks.includes('IU'));
});

test('이름이 제거된 결과는 통과', () => {
  const leaks = findArtistLeaks('intimate Korean indie-pop ballad, delicate female vocal', ['IU']);
  assert.deepEqual(leaks, []);
});
