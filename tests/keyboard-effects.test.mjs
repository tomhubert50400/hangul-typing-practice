import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';
import { act, createElement } from 'react';
import { JSDOM } from 'jsdom';
import { build } from 'vite';
import Hangul from 'hangul-js';
import { latinToJamo } from '../src/utils/hangulComposer.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

test('keyboard handlers retain current game settings and cleanly reset input', async () => {
  const cache = path.join(projectRoot, 'node_modules/.cache');
  await mkdir(cache, { recursive: true });
  const output = await mkdtemp(path.join(cache, 'keyboard-test-'));
  const dom = new JSDOM('<!doctype html><div id="app"></div>', {
    url: 'http://localhost/', pretendToBeVisual: true,
  });
  const previous = Object.fromEntries(['window', 'document', 'IS_REACT_ACT_ENVIRONMENT'].map((key) => [key, globalThis[key]]));
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const originalRandom = Math.random;
  let root;
  try {
    await build({
      root: projectRoot,
      logLevel: 'silent',
      build: { ssr: 'src/App.jsx', outDir: output, emptyOutDir: true, rollupOptions: { output: { entryFileNames: 'App.mjs' } } },
    });
    const { default: App } = await import(pathToFileURL(path.join(output, 'App.mjs')));
    const { createRoot } = await import('react-dom/client');
    Math.random = () => 0;
    root = createRoot(document.querySelector('#app'));
    await act(async () => root.render(createElement(App)));
    const click = async (selector) => {
      const element = document.querySelector(selector);
      assert.ok(element, `Missing ${selector}`);
      await act(async () => element.dispatchEvent(new window.MouseEvent('click', { bubbles: true })));
      // Mode changes schedule another render from their passive reset effect.
      await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
    };
    const key = async (value, shiftKey = false) => {
      await act(async () => window.dispatchEvent(new window.KeyboardEvent('keydown', { key: value, shiftKey, bubbles: true })));
    };
    const select = async (selector, value) => {
      const element = document.querySelector(selector);
      await act(async () => {
        element.value = value;
        element.dispatchEvent(new window.Event('change', { bubbles: true }));
      });
    };
    const jamos = () => [...document.querySelectorAll('.jamo-char')].map((node) => node.textContent).join('');

    await click('.mode-btn:nth-child(2)');
    assert.ok(document.querySelector('.rank-start-screen'));
    await select('.game-length-selector select', '25');
    // Keyboard shortcuts must use the current game length.
    await key('Enter');
    assert.equal(document.querySelector('.word-counter').textContent.trim(), '1 / 25');
    await key('q');
    assert.equal(jamos(), 'ㅂ');
    await act(async () => new Promise((resolve) => setTimeout(resolve, 120)));
    assert.ok(document.querySelector('.rank-game-container'), 'timer updates must not reset the current game');
    await key('q');
    assert.equal(jamos(), 'ㅂㅂ', 'exactly one event handler must process each key');
    await key('Backspace');
    assert.equal(jamos(), 'ㅂ');
    await key('Enter');
    assert.equal(jamos(), '');
    assert.equal(document.querySelector('.word-counter').textContent.trim(), '1 / 25');

    // Complete the current real word using the physical-key mapping.
    const target = document.querySelector('.hangul-text').textContent;
    const mapping = new Map();
    for (const letter of 'qwertyuiopasdfghjklzxcvbnm ') {
      for (const shift of [false, true]) {
        const jamo = latinToJamo(letter, 'QWERTY', shift);
        if (jamo && !mapping.has(jamo)) mapping.set(jamo, [letter, shift]);
      }
    }
    for (const jamo of Hangul.disassemble(target)) {
      assert.ok(mapping.has(jamo), `Unmapped test jamo ${jamo}`);
      await key(...mapping.get(jamo));
    }
    assert.equal(document.querySelector('.word-counter').textContent.trim(), '2 / 25');
    assert.equal(jamos(), '');

    await click('.toggle-keyboard-btn');
    await click('.keyboard-key[title^="Click: ㅂ"]');
    assert.equal(jamos(), 'ㅂ');
    await click('.reset-btn');
    await select('.layout-selector select', 'AZERTY');
    await key('a');
    assert.equal(jamos(), 'ㅂ');
    await click('.mode-btn:first-child');
    assert.equal(document.querySelector('.word-counter'), null);
    assert.equal(jamos(), '');
    await click('.mode-btn:nth-child(2)');
    assert.ok(document.querySelector('.rank-start-screen'), document.body.textContent);
    await key('Enter');
    assert.ok(document.querySelector('.word-counter'), document.body.textContent);
    assert.equal(document.querySelector('.word-counter').textContent.trim(), '1 / 25');
    assert.equal(jamos(), '');

    // Leaving training before its delayed word advance must not change rank state.
    await click('.mode-btn:first-child');
    await select('.layout-selector select', 'QWERTY');
    const trainingTarget = document.querySelector('.hangul-text').textContent;
    for (const jamo of Hangul.disassemble(trainingTarget)) await key(...mapping.get(jamo));
    await click('.mode-btn:nth-child(2)');
    await key('Enter');
    await act(async () => new Promise((resolve) => setTimeout(resolve, 550)));
    assert.equal(document.querySelector('.word-counter').textContent.trim(), '1 / 25');
    assert.equal(jamos(), '');

    await click('.mode-btn:first-child');
    const resetTarget = document.querySelector('.hangul-text').textContent;
    for (const jamo of Hangul.disassemble(resetTarget)) await key(...mapping.get(jamo));
    await click('.reset-btn');
    await click('.reset-btn');
    await act(async () => new Promise((resolve) => setTimeout(resolve, 550)));
    assert.equal(document.querySelector('.hangul-text').textContent, resetTarget);
    assert.equal(jamos(), '');
  } finally {
    if (root) await act(async () => root.unmount());
    Math.random = originalRandom;
    dom.window.close();
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
    await rm(output, { recursive: true, force: true });
  }
});
