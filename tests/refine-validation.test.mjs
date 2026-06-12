import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/refine-style.js';

function mockRes() {
  return {
    statusCode: 0,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.body = obj; return this; },
  };
}

test('POST 외 메서드는 405', async () => {
  const res = mockRes();
  await handler({ method: 'GET' }, res);
  assert.equal(res.statusCode, 405);
});

test('빈 payload는 400', async () => {
  const res = mockRes();
  await handler({ method: 'POST', body: {} }, res);
  assert.equal(res.statusCode, 400);
});

test('인스트루멘탈만 있는 payload는 400 (정제할 스타일 내용 없음)', async () => {
  const res = mockRes();
  await handler({ method: 'POST', body: { instrumental: true } }, res);
  assert.equal(res.statusCode, 400);
});

test('알 수 없는 그룹/비문자열 값은 무시되어 400', async () => {
  const res = mockRes();
  await handler({
    method: 'POST',
    body: { selection: { bogus_group: ['x'], genre: [123, null] } },
  }, res);
  assert.equal(res.statusCode, 400);
});

test('너무 긴 입력은 400', async () => {
  const res = mockRes();
  await handler({ method: 'POST', body: { custom: 'x'.repeat(5000) } }, res);
  assert.equal(res.statusCode, 400);
});
