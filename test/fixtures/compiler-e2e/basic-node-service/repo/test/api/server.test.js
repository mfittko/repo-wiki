import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../../services/api/server.js';

test('createServer returns runtime metadata', () => {
  const server = createServer();
  assert.equal(typeof server.port, 'string');
});
