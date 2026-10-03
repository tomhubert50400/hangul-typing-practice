import assert from 'node:assert/strict';
import test from 'node:test';
import { composeHangul, latinToJamo } from '../src/utils/hangulComposer.js';

test('jamos compose into single, compound and multiple Hangul syllables', () => {
  assert.equal(composeHangul([]), '');
  assert.equal(composeHangul(['ㄱ', 'ㅏ']), '가');
  assert.equal(composeHangul(['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅡ', 'ㄹ']), '한글');
  assert.equal(composeHangul(['ㄱ', 'ㅗ', 'ㅏ']), '과');
});

test('physical key mapping preserves layouts, shift, space and unsupported keys', () => {
  assert.equal(latinToJamo('q', 'QWERTY'), 'ㅂ');
  assert.equal(latinToJamo('a', 'AZERTY'), 'ㅂ');
  assert.equal(latinToJamo('r', 'QWERTY', true), 'ㄲ');
  assert.equal(latinToJamo(' ', 'QWERTY'), ' ');
  assert.equal(latinToJamo('~', 'QWERTY'), null);
});
