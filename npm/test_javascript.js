/**
 * Georgian Hyphenation - JavaScript test suite
 * Covers both builds: index.js (ESM) and index.cjs (CommonJS)
 * Run: node test_javascript.js
 */

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import GeorgianHyphenatorESM from './src/javascript/index.js';

const require = createRequire(import.meta.url);
const GeorgianHyphenatorCJS = require('./src/javascript/index.cjs');

let passed = 0;

function test(name, fn) {
  fn();
  passed++;
  console.log(`  ok - ${name}`);
}

console.log('ESM build:');

test('ESM: basic hyphenation', () => {
  const h = new GeorgianHyphenatorESM('-');
  assert.equal(h.hyphenate('საქართველო'), 'სა-ქარ-თვე-ლო');
});

test('ESM: compound word keeps its hyphen, no adjacent break', () => {
  const h = new GeorgianHyphenatorESM('-');
  assert.equal(h.hyphenate('მაგ-რამ'), 'მაგ-რამ');
});

{
  const h = new GeorgianHyphenatorESM('-');
  await h.loadDefaultLibrary();
  assert.ok(h.getDictionarySize() > 0,
    `dictionary should load, got ${h.getDictionarySize()} words`);
  passed++;
  console.log('  ok - ESM: dictionary actually loaded ' +
    `(${h.getDictionarySize()} words)`);

  test('ESM: dictionary entry wins over algorithm', () => {
    assert.equal(h.hyphenate('კომპიუტერი'), 'კომ-პიუ-ტე-რი');
  });

  test('ESM: punctuation preserved around dictionary hit', () => {
    assert.equal(h.hyphenate('კომპიუტერი,'), 'კომ-პიუ-ტე-რი,');
    assert.equal(h.hyphenate('(კომპიუტერი)'), '(კომ-პიუ-ტე-რი)');
  });

  test('ESM: hyphenateText round-trips with unhyphenate (soft hyphen)', () => {
    // Only the default soft-hyphen char round-trips: unhyphenate()
    // deliberately preserves '-' to protect compound words
    const soft = new GeorgianHyphenatorESM();
    const text = 'საქართველო არის ლამაზი ქვეყანა';
    assert.equal(soft.unhyphenate(soft.hyphenateText(text)), text);
  });
}

test('ESM: hyphenateHTML keeps $-sequences in skipped tags intact', () => {
  const h = new GeorgianHyphenatorESM('-');
  const html = '<p>ქართული ტექსტი</p><code>const s = "$& $\' $`";</code>';
  const out = h.hyphenateHTML(html);
  assert.ok(out.includes('<code>const s = "$& $\' $`";</code>'),
    `skipped content must be untouched, got: ${out}`);
});

test('ESM: custom hyphen char with regex special meaning', () => {
  const h = new GeorgianHyphenatorESM('*');
  const word = h.hyphenate('საქართველო');
  assert.equal(word, 'სა*ქარ*თვე*ლო');
  assert.equal(h.unhyphenate(word), 'საქართველო');
});

console.log('CJS build:');

test('CJS: require() returns the class', () => {
  assert.equal(typeof GeorgianHyphenatorCJS, 'function');
  assert.equal(typeof GeorgianHyphenatorCJS.default, 'function');
});

test('CJS: basic hyphenation', () => {
  const h = new GeorgianHyphenatorCJS('-');
  assert.equal(h.hyphenate('საქართველო'), 'სა-ქარ-თვე-ლო');
});

{
  const h = new GeorgianHyphenatorCJS('-');
  await h.loadDefaultLibrary();
  assert.ok(h.getDictionarySize() > 0,
    `dictionary should load, got ${h.getDictionarySize()} words`);
  passed++;
  console.log('  ok - CJS: dictionary actually loaded ' +
    `(${h.getDictionarySize()} words)`);
}

console.log('ESM/CJS parity:');

{
  const esm = new GeorgianHyphenatorESM('-');
  const cjs = new GeorgianHyphenatorCJS('-');
  await esm.loadDefaultLibrary();
  await cjs.loadDefaultLibrary();

  test('parity: dictionary sizes match', () => {
    assert.equal(esm.getDictionarySize(), cjs.getDictionarySize());
  });

  const words = [
    'გამარჯობა', 'საქართველო', 'კომპიუტერი', 'უნივერსიტეტი',
    'მოგზაურობა', 'მაგ-რამ', 'ერთ-ერთი', 'თბილისი', 'პროგრამირება'
  ];
  test('parity: identical output for sample words', () => {
    for (const word of words) {
      assert.equal(esm.hyphenate(word), cjs.hyphenate(word),
        `builds disagree on "${word}"`);
    }
  });
}

console.log(`\nAll ${passed} tests passed`);
