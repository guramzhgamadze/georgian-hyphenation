# Georgian Language Hyphenation

[![NPM version](https://img.shields.io/npm/v/georgian-hyphenation.svg)](https://www.npmjs.com/package/georgian-hyphenation)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/javascript-ESM-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

**Version 2.2.1** - Academic Logic with Automatic Sanitization & Dictionary Support

ქართული ენის სრული დამარცვლის ბიბლიოთეკა. ვერსია 2.2.1 მოიცავს ავტომატურ გასუფთავებას (Sanitization) და გამონაკლისების ლექსიკონის მხარდაჭერას.

---

## ✨ New in v2.2.1

- 🧹 **Automatic Sanitization**: Automatically strips existing soft-hyphens or markers before processing to prevent "double-hyphenation" bugs.
- 📚 **Dictionary Support**: Integrated exception handling for irregular words.
- 🚀 **Performance Boost**: Harmonic cluster lookups optimized using `Set` (O(1) complexity).
- 📦 **Modern ESM Support**: Native support for `import/export` syntax.

---

## 📦 Installation

```bash
npm install georgian-hyphenation

```

---

## 📖 Usage (Modern JavaScript / ESM)

### Basic Usage

```javascript
import GeorgianHyphenator from 'georgian-hyphenation';

const hyphenator = new GeorgianHyphenator('-'); // Use '-' for visible results

// 1. Hyphenate a word
console.log(hyphenator.hyphenate('საქართველო')); 
// Output: "სა-ქარ-თვე-ლო"

// 2. Automatic Sanitization (New!)
// If the word already contains hyphens, it cleans them first
const messyWord = 'სა-ქარ-თვე-ლო'; 
console.log(hyphenator.hyphenate(messyWord)); 
// Output: "სა-ქარ-თვე-ლო" (Correctly re-processed)

```

### Loading Exceptions Dictionary

```javascript
// Load the built-in dictionary of exceptions
await hyphenator.loadDefaultLibrary();

console.log(hyphenator.hyphenate('ობიექტი'));

```

### Hyphenate Entire Text

```javascript
const text = "გამარჯობა, საქართველო მშვენიერი ქვეყანაა!";
console.log(hyphenator.hyphenateText(text));

```

---

## 🧠 Algorithm Logic

The v2.2 algorithm continues to use **phonological distance analysis** combined with academic rules:

1. **V-V (Hiatus)**: Split between vowels → `გა-ა-ნა`
2. **V-C-V**: Split before consonant → `მა-მა`
3. **Harmonic Clusters**: Special Georgian clusters (ბრ, წვ, მს) stay together.
4. **Anti-Orphan**: Minimum 2 characters on each side.

---

## 🎨 API Reference

### `new GeorgianHyphenator(hyphenChar)`

* **hyphenChar** (string): Character for hyphenation. Default: `\u00AD` (soft-hyphen).

### `.hyphenate(word)`

Hyphenates a single word. Strips existing hyphens first.

### `.hyphenateText(text)`

Processes a full string, preserving punctuation and non-Georgian characters.

### `.loadDefaultLibrary()`

(Async) Fetches or imports the `exceptions.json` data.

---

## 🧪 Testing

We use a comprehensive test suite to ensure 98%+ accuracy.

```bash
npm test

```

---

## 📝 Changelog

### Version 2.2.1 (Current)

* Added `_stripHyphens` for input sanitization.
* Converted `harmonicClusters` to `Set` for high-performance processing.
* Switched to **ES Modules (ESM)** as default.
* Added `loadDefaultLibrary` for browser/node dictionary fetching.

### Version 2.0.1

* Academic logic rewrite.
* Phonological distance analysis.

---

## 📄 License

MIT License - see [LICENSE.txt](https://www.google.com/search?q=LICENSE.txt) for details.

---

## 📧 Contact

**Guram Zhgamadze** - guramzhgamadze@gmail.com

```