# Georgian Language Hyphenation

[![NPM version](https://img.shields.io/npm/v/georgian-hyphenation.svg)](https://www.npmjs.com/package/georgian-hyphenation)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/javascript-ESM-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
[![Downloads](https://img.shields.io/npm/dm/georgian-hyphenation.svg)](https://www.npmjs.com/package/georgian-hyphenation)

Georgian Language Hyphenation Library - Fast, accurate syllabification for Georgian (ქართული) text with support for both browser and Node.js environments.

## Features

- ✅ **Accurate Georgian syllabification** based on phonetic rules
- ✅ **Harmonic consonant clusters** recognition (ბრ, გრ, კრ, etc.)
- ✅ **Gemination handling** (double consonant splitting)
- ✅ **Exception dictionary** for irregular words (142 words)
- ✅ **TypeScript declarations** included (new in v2.3.0)
- ✅ **HTML-aware hyphenation** - preserves tags and code blocks (new in v2.2.7)
- ✅ **17+ utility functions** for advanced text processing (new in v2.2.7)
- ✅ **Configurable settings** - adjust margins and hyphen character (new in v2.2.7)
- ✅ **Browser + Node.js compatible** (ESM & CommonJS)
- ✅ **Zero dependencies**
- ✅ **Lightweight** (~12KB)

## Installation

```bash
npm install georgian-hyphenation
```

## Quick Start

### ES Modules (Modern)

```javascript
import GeorgianHyphenator from 'georgian-hyphenation';

const hyphenator = new GeorgianHyphenator();

// Basic hyphenation
console.log(hyphenator.hyphenate('საქართველო'));
// Output: სა­ქარ­თვე­ლო

// Get syllables as array
console.log(hyphenator.getSyllables('თბილისი'));
// Output: ['თბი', 'ლი', 'სი']

// Count syllables (NEW in v2.2.7)
console.log(hyphenator.countSyllables('გამარჯობა'));
// Output: 4

// Hyphenate HTML (NEW in v2.2.7)
const html = '<p>ქართული ენა <code>console.log()</code> პროგრამირება</p>';
console.log(hyphenator.hyphenateHTML(html));
// Code tags are preserved!
```

### CommonJS (Node.js)

```javascript
const GeorgianHyphenator = require('georgian-hyphenation');

const hyphenator = new GeorgianHyphenator();
console.log(hyphenator.hyphenate('კომპიუტერი'));
```

### Browser (CDN)

```html
<script type="module">
  import GeorgianHyphenator from 'https://cdn.jsdelivr.net/npm/georgian-hyphenation@2.3.0/src/javascript/index.js';
  
  const hyphenator = new GeorgianHyphenator();
  console.log(hyphenator.hyphenate('პროგრამირება'));
</script>
```

## API Reference

### Constructor

```javascript
const hyphenator = new GeorgianHyphenator(hyphenChar = '\u00AD', options = {});
```

**Parameters:**
- `hyphenChar` (optional): Character to use for hyphenation. Default is soft hyphen (`\u00AD`)
- `options.debug` (optional): Log dictionary loading details to the console. Default is `false`

---

## Core Methods

### `hyphenate(word)`

Hyphenates a single word.

```javascript
hyphenator.hyphenate('საქართველო');
// Returns: 'სა­ქარ­თვე­ლო'
```

### `getSyllables(word)`

Returns an array of syllables.

```javascript
hyphenator.getSyllables('თბილისი');
// Returns: ['თბი', 'ლი', 'სი']
```

### `hyphenateText(text)`

Hyphenates all words in a text string.

```javascript
hyphenator.hyphenateText('საქართველო არის ლამაზი ქვეყანა');
// Returns: 'სა­ქარ­თვე­ლო არის ლა­მა­ზი ქვე­ყა­ნა'
```

---

## New in v2.2.7: Utility Functions

### `countSyllables(word)`

Get the number of syllables in a word.

```javascript
hyphenator.countSyllables('გამარჯობა');
// Returns: 4
```

### `getHyphenationPoints(word)`

Get the number of hyphenation points (hyphens) in a word.

```javascript
hyphenator.getHyphenationPoints('გამარჯობა');
// Returns: 3 (four syllables = three hyphens)
```

### `isGeorgian(text)`

Check if text contains only Georgian characters.

```javascript
hyphenator.isGeorgian('გამარჯობა');  // true
hyphenator.isGeorgian('hello');       // false
hyphenator.isGeorgian('გამარჯობა123'); // false
```

### `canHyphenate(word)`

Check if a word meets minimum length requirements for hyphenation.

```javascript
hyphenator.canHyphenate('გა');     // false (too short)
hyphenator.canHyphenate('გამარ');  // true
```

### `unhyphenate(text)`

Remove all hyphenation from text.

```javascript
const hyphenated = hyphenator.hyphenate('გამარჯობა');
hyphenator.unhyphenate(hyphenated);
// Returns: 'გამარჯობა'
```

### `hyphenateWords(words)`

Hyphenate multiple words at once (batch processing).

```javascript
const words = ['ქართული', 'ენა', 'მშვენიერია'];
hyphenator.hyphenateWords(words);
// Returns: ['ქარ­თუ­ლი', 'ე­ნა', 'მშვე­ნი­ე­რია']
```

### `hyphenateHTML(html)` ⭐ Most Useful!

Hyphenate HTML content while preserving tags and skipping code blocks.

```javascript
const html = `
  <article>
    <h1>ქართული ენა</h1>
    <p>პროგრამირება და კომპიუტერული მეცნიერება</p>
    <code>console.log('skip me')</code>
    <pre>this won't be hyphenated</pre>
  </article>
`;

const result = hyphenator.hyphenateHTML(html);
// Only <p> content gets hyphenated
// <code>, <pre>, <script>, <style>, <textarea> are preserved
```

---

## New in v2.2.7: Configuration Methods

All configuration methods support **method chaining**:

### `setLeftMin(value)`

Set minimum characters before the first hyphen (default: 2).

```javascript
hyphenator.setLeftMin(3);
// Now requires at least 3 characters before first hyphen
```

### `setRightMin(value)`

Set minimum characters after the last hyphen (default: 2).

```javascript
hyphenator.setRightMin(3);
// Now requires at least 3 characters after last hyphen
```

### `setHyphenChar(char)`

Change the hyphen character.

```javascript
// Use visible hyphen for debugging
hyphenator.setHyphenChar('-');
console.log(hyphenator.hyphenate('გამარჯობა'));
// Output: 'გა-მარ-ჯო-ბა'

// Use custom separator
hyphenator.setHyphenChar('•');
console.log(hyphenator.hyphenate('საქართველო'));
// Output: 'სა•ქარ•თვე•ლო'
```

### Method Chaining

```javascript
const hyphenator = new GeorgianHyphenator()
  .setLeftMin(3)
  .setRightMin(3)
  .setHyphenChar('-');

console.log(hyphenator.hyphenate('გამარჯობა'));
```

---

## New in v2.2.7: Dictionary Management

### `loadLibrary(data)`

Load custom exception dictionary.

```javascript
const customWords = {
  'განათლება': 'გა-ნათ-ლე-ბა',
  'უნივერსიტეტი': 'უ-ნი-ვერ-სი-ტე-ტი'
};

hyphenator.loadLibrary(customWords);
```

### `async loadDefaultLibrary(source?)`

Load the built-in exception dictionary (142 words). The dictionary is
resolved relative to the module itself, so it always matches the installed
package version — on a CDN, in a bundler, or in Node.js.

```javascript
await hyphenator.loadDefaultLibrary();
// Dictionary loaded with tech terms, places, political terms

// Optional: load from a custom URL (browser) or file path (Node.js),
// e.g. a locally hosted copy
await hyphenator.loadDefaultLibrary('/assets/exceptions.json');
```

### `addException(word, hyphenated)`

Add a single custom hyphenation exception.

```javascript
hyphenator.addException('ტესტი', 'ტეს-ტი');

console.log(hyphenator.hyphenate('ტესტი'));
// Returns: 'ტეს­ტი' (uses your custom hyphenation)
```

### `removeException(word)`

Remove an exception from the dictionary.

```javascript
hyphenator.removeException('ტესტი');
// Returns: true (if word was removed)
```

### `exportDictionary()`

Export the entire dictionary as a JSON object.

```javascript
const dict = hyphenator.exportDictionary();
console.log(dict);
// { "გამარჯობა": "გა-მარ-ჯო-ბა", ... }
```

### `getDictionarySize()`

Get the number of words in the dictionary.

```javascript
await hyphenator.loadDefaultLibrary();
console.log(hyphenator.getDictionarySize());
// Output: 142
```

---

## New in v2.2.7: Advanced Features

### Harmonic Cluster Management

For advanced users who need to customize consonant cluster recognition:

```javascript
// Add a custom harmonic cluster
hyphenator.addHarmonicCluster('ტვ');

// Remove a cluster
hyphenator.removeHarmonicCluster('ტვ');

// Get all clusters
const clusters = hyphenator.getHarmonicClusters();
console.log(clusters);
// ['ბლ', 'ბრ', 'ბღ', ... (70+ clusters)]
```

---

## CSS Integration

Use soft hyphens for automatic line breaking:

```css
.georgian-text {
  hyphens: auto;
  -webkit-hyphens: auto;
  -ms-hyphens: auto;
}
```

```javascript
const hyphenator = new GeorgianHyphenator('\u00AD'); // soft hyphen
document.querySelector('.georgian-text').innerHTML = 
  hyphenator.hyphenateText('თქვენი ტექსტი აქ');
```

---

## Built-in Dictionary

The library includes 142 pre-hyphenated words including:

**Tech Terms:** კომპიუტერი, ფეისბუქი, იუთუბი, ინსტაგრამი  
**Places:** საქართველო, თბილისი  
**Political:** პარლამენტი, დემოკრატია, რესპუბლიკა  
**Compound Words:** სახელმწიფო, გულმავიწყი, თავდადებული

```javascript
await hyphenator.loadDefaultLibrary();
console.log(hyphenator.hyphenate('კომპიუტერი'));
// Uses dictionary: 'კომ­პიუ­ტე­რი'
```

---

## Algorithm

The library uses a phonetic algorithm based on Georgian syllable structure:

1. **Vowel Detection**: Identifies vowels (ა, ე, ი, ო, უ)
2. **Consonant Cluster Analysis**: Recognizes 70+ harmonic clusters
3. **Gemination Rules**: Splits double consonants (კკ → კ­კ)
4. **Orphan Prevention**: Ensures minimum syllable length (2 characters by default)
5. **Dictionary Lookup**: Checks exceptions first for accuracy

### Supported Harmonic Clusters

```
ბლ, ბრ, ბღ, ბზ, გდ, გლ, გმ, გნ, გვ, გზ, გრ, დრ, თლ, თრ, თღ, 
კლ, კმ, კნ, კრ, კვ, მტ, პლ, პრ, ჟღ, რგ, რლ, რმ, სწ, სხ, ტკ, 
ტპ, ტრ, ფლ, ფრ, ფქ, ფშ, ქლ, ქნ, ქვ, ქრ, ღლ, ღრ, ყლ, ყრ, შთ, 
შპ, ჩქ, ჩრ, ცლ, ცნ, ცრ, ცვ, ძგ, ძვ, ძღ, წლ, წრ, წნ, წკ, ჭკ, 
ჭრ, ჭყ, ხლ, ხმ, ხნ, ხვ, ჯგ
```

---

## Use Cases & Examples

### E-book Reader

```javascript
const hyphenator = new GeorgianHyphenator();
await hyphenator.loadDefaultLibrary();

function formatBook(htmlContent) {
  return hyphenator.hyphenateHTML(htmlContent);
}

document.getElementById('content').innerHTML = formatBook(bookHTML);
```

### Text Justification

```javascript
const hyphenator = new GeorgianHyphenator('\u00AD');

const justified = hyphenator.hyphenateText(
  'საქართველო არის ერთ-ერთი უძველესი ქვეყანა მსოფლიოში'
);
```

### Blog/CMS Integration

```javascript
const hyphenator = new GeorgianHyphenator();
await hyphenator.loadDefaultLibrary();

// Hyphenate all articles
document.querySelectorAll('article p').forEach(p => {
  p.innerHTML = hyphenator.hyphenateHTML(p.innerHTML);
});
```

### Form Validation

```javascript
const hyphenator = new GeorgianHyphenator();

function validateGeorgianInput(text) {
  if (!hyphenator.isGeorgian(text)) {
    alert('გთხოვთ შეიყვანოთ მხოლოდ ქართული ტექსტი');
    return false;
  }
  return true;
}
```

### Syllable-based Animation

```javascript
const hyphenator = new GeorgianHyphenator();
const syllables = hyphenator.getSyllables('პროგრამირება');

syllables.forEach((syllable, i) => {
  setTimeout(() => {
    console.log(syllable);
  }, i * 200);
});
// Displays: პრო... გრა... მი... რე... ბა
```

---

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Node.js 16+ (both `import` and `require`)

---

## Performance

- Average hyphenation speed: **~0.05ms per word**
- HTML hyphenation: **~2ms for 1000 words**
- Memory usage: **~100KB with dictionary loaded**
- Optimized with `Set` for O(1) cluster lookups

---

## Changelog

### v2.3.0 (2026-07-21) 🛠️

**Fixes:**
- 🐛 **CommonJS**: `require('georgian-hyphenation')` works again (the published `.cjs` file was accidentally an ES module)
- 🐛 **Node.js 22+**: dictionary loading no longer fails (removed the deleted `assert { type: 'json' }` import syntax)
- 🐛 **CDN**: dictionary URL now resolves relative to the module — no more hard-coded version that could drift
- 🐛 Dictionary hits keep surrounding punctuation (`'კომპიუტერი,'` keeps its comma)
- 🐛 No more break insertion directly next to a compound-word hyphen
- 🐛 `hyphenateHTML()` no longer corrupts `$&`-style sequences in skipped tags
- 🐛 Custom hyphen characters with regex meaning (`*`, `|`, …) handled safely

**New:**
- ✨ TypeScript declarations (`.d.ts` / `.d.cts`)
- ✨ `loadDefaultLibrary(source)` — optional custom URL or file path
- ✨ `setDebug(value)` / `debug` option — success logs are now opt-in

### v2.2.7 (2025-02-13) 🎉

**New Features (17 functions added):**

✨ **Utility Functions:**
- `countSyllables(word)` - Get syllable count
- `getHyphenationPoints(word)` - Get hyphen count
- `isGeorgian(text)` - Validate Georgian text
- `canHyphenate(word)` - Check if word can be hyphenated
- `unhyphenate(text)` - Remove all hyphens
- `hyphenateWords(words)` - Batch processing
- `hyphenateHTML(html)` - HTML-aware hyphenation 🌟

✨ **Configuration (Chainable):**
- `setLeftMin(value)` - Configure left margin
- `setRightMin(value)` - Configure right margin
- `setHyphenChar(char)` - Change hyphen character

✨ **Dictionary Management:**
- `addException(word, hyphenated)` - Add custom word
- `removeException(word)` - Remove exception
- `exportDictionary()` - Export as JSON
- `getDictionarySize()` - Get word count

✨ **Advanced:**
- `addHarmonicCluster(cluster)` - Add custom cluster
- `removeHarmonicCluster(cluster)` - Remove cluster
- `getHarmonicClusters()` - List all clusters

**Improvements:**
- 🔧 All configuration methods support method chaining
- 📚 JSDoc documentation for all methods
- ✅ 100% backwards compatible
- 🎯 No breaking changes

### v2.2.6 (2026-01-30)
- ✨ Preserves regular hyphens in compound words
- 🐛 Fixed hyphen stripping to only remove soft hyphens and zero-width spaces
- 📝 Improved documentation

### v2.2.4 (2026-01-27)
- 🌐 **Browser Fix**: Fixed CDN URL for reliable dictionary loading
- 📦 **NPM Files**: Added `data/` folder to published package
- 🔧 **Error Handling**: Improved fallback when dictionary unavailable
- 📝 **Documentation**: Corrected examples

### v2.2.1 (2026-01-26)
- 🧹 **Sanitization**: Added `_stripHyphens` for automatic input cleaning
- ⚡ **Performance**: Converted `harmonicClusters` to `Set` (O(1) lookup)
- 📦 **ESM**: Full ES Modules support
- 📚 **Dictionary**: Added `loadDefaultLibrary()` method

### v2.0.1 (2026-01-22)
- 🎓 **Academic Rewrite**: Phonological distance analysis
- 🛡️ **Anti-Orphan**: Minimum 2 characters on each side
- 🎼 **Harmonic Clusters**: Georgian-specific consonant groups

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Guram Zhgamadze](https://github.com/guramzhgamadze)

## Author

**Guram Zhgamadze**
- GitHub: [@guramzhgamadze](https://github.com/guramzhgamadze)
- Email: guramzhgamadze@gmail.com

## Related

- [Georgian Language Resources](https://www.omniglot.com/writing/georgian.htm)
- [Unicode Georgian Range](https://unicode.org/charts/PDF/U10A0.pdf)

---

Made with ❤️ for the Georgian language community