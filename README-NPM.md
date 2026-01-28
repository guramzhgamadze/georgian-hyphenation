# Georgian Language Hyphenation

[![NPM version](https://img.shields.io/npm/v/georgian-hyphenation.svg)](https://www.npmjs.com/package/georgian-hyphenation)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/javascript-ESM-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
[![Downloads](https://img.shields.io/npm/dm/georgian-hyphenation.svg)](https://www.npmjs.com/package/georgian-hyphenation)

**Version 2.2.4** - Browser + Node.js Compatible with Dictionary Support

ქართული ენის სრული დამარცვლის ბიბლიოთეკა. ვერსია 2.2.4 სრულად თავსებადია როგორც Browser, ისე Node.js გარემოსთან.

---

## ✨ New in v2.2.4

- 🌐 **Full Browser Support**: CDN URL fixed for reliable dictionary loading in browsers
- 📦 **NPM Package Files**: Added `data/` folder to published package
- 🔧 **Improved Error Handling**: Better fallback when dictionary is unavailable
- 📝 **Documentation**: Corrected examples (removed non-existent Georgian words)

---

## ✨ Features from v2.2.2

- 🧹 **Automatic Sanitization**: Strips existing soft-hyphens before processing to prevent double-hyphenation
- 📚 **Dictionary Support**: 150+ exception words for edge cases
- ⚡ **Performance Boost**: Harmonic cluster lookups optimized using `Set` (O(1) complexity)
- 📦 **Modern ESM Support**: Native `import/export` syntax
- 🎯 **Hybrid Engine**: Dictionary-first, Algorithm fallback

---

## 📦 Installation
```bash
npm install georgian-hyphenation
```

---

## 🚀 Quick Start

### Browser (CDN)
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    .hyphenated {
      hyphens: manual;
      -webkit-hyphens: manual;
      text-align: justify;
    }
  </style>
</head>
<body>
  <div class="hyphenated" id="content"></div>

  <script type="module">
    import GeorgianHyphenator from 'https://cdn.jsdelivr.net/npm/georgian-hyphenation@2.2.4/src/javascript/index.js';

    async function initialize() {
      const hyphenator = new GeorgianHyphenator('\u00AD'); // Soft hyphen
      
      // Load dictionary (optional, but recommended)
      await hyphenator.loadDefaultLibrary();

      const text = "საქართველო არის ძალიან ლამაზი ქვეყანა, სადაც ბევრი ისტორიული ძეგლია.";
      document.getElementById('content').textContent = hyphenator.hyphenateText(text);
    }

    initialize();
  </script>
</body>
</html>
```

---

### Node.js (ESM)
```javascript
import GeorgianHyphenator from 'georgian-hyphenation';

const hyphenator = new GeorgianHyphenator('-'); // Visible hyphen

// Hyphenate a word
console.log(hyphenator.hyphenate('საქართველო')); 
// Output: "სა-ქარ-თვე-ლო"

// Load dictionary (optional)
await hyphenator.loadDefaultLibrary();

// Hyphenate text
const text = "გამარჯობა, საქართველო მშვენიერი ქვეყანაა!";
console.log(hyphenator.hyphenateText(text));
// Output: "გა-მარ-ჯო-ბა, სა-ქარ-თვე-ლო მშვე-ნი-ე-რი ქვე-ყა-ნა-ა!"
```

---

### Node.js (CommonJS)
```javascript
const GeorgianHyphenator = require('georgian-hyphenation');

const hyphenator = new GeorgianHyphenator('-');
console.log(hyphenator.hyphenate('საქართველო'));
```

---

## 📖 API Reference

### **Constructor**
```javascript
new GeorgianHyphenator(hyphenChar = '\u00AD')
```

**Parameters:**
- `hyphenChar` (string): Character to use for hyphenation
  - `'\u00AD'` - Soft hyphen (invisible, default)
  - `'-'` - Regular hyphen (visible)
  - `'·'` - Middle dot
  - Any custom character

---

### **Methods**

#### `hyphenate(word)`

Hyphenates a single Georgian word.

**Features:**
- Automatically strips existing hyphens (sanitization)
- Checks dictionary first (if loaded)
- Falls back to algorithm
```javascript
hyphenator.hyphenate('საქართველო'); // → "სა-ქარ-თვე-ლო"
hyphenator.hyphenate('ბლოკი');       // → "ბლო-კი" (harmonic cluster)
```

---

#### `hyphenateText(text)`

Hyphenates entire text while preserving:
- Punctuation
- Numbers
- Latin characters
- Whitespace
```javascript
const text = "საქართველო არის ლამაზი ქვეყანა.";
hyphenator.hyphenateText(text);
// → "სა-ქარ-თვე-ლო არის ლა-მა-ზი ქვე-ყა-ნა."
```

---

#### `getSyllables(word)`

Returns syllables as an array.
```javascript
hyphenator.getSyllables('საქართველო');
// → ['სა', 'ქარ', 'თვე', 'ლო']
```

---

#### `loadDefaultLibrary()` (Async)

Loads the default exception dictionary (150+ words).

**Browser:** Fetches from CDN (`jsdelivr`)  
**Node.js:** Loads from local `data/exceptions.json`
```javascript
await hyphenator.loadDefaultLibrary();
console.log('Dictionary loaded!');
```

---

#### `loadLibrary(data)`

Load custom dictionary.
```javascript
hyphenator.loadLibrary({
  'სპეციალური': 'სპე-ცი-ა-ლუ-რი',
  'კომპიუტერი': 'კომ-პიუ-ტე-რი'
});
```

---

## 🧠 Algorithm Logic

The v2.2 algorithm uses **phonological distance analysis** with these rules:

### 1. **Vowel Distance Analysis**
```
საქართველო → vowels at: [1, 3, 5, 7]
```

### 2. **Consonant Cluster Rules**

- **V-V (0 consonants)**: Split between vowels
```javascript
  'გააკეთა' → 'გა-ა-კე-თა'
```

- **V-C-V (1 consonant)**: Split after first vowel
```javascript
  'მამა' → 'მა-მა'
```

- **V-CC-V (2+ consonants)**:
  1. Check for double consonants (gemination) - rare in Georgian
  2. Check for harmonic clusters (ბლ, გლ, კრ, etc.) - keep together
  3. Default: split after first consonant

### 3. **Harmonic Clusters (62 clusters)**

These consonant pairs stay together:
```
ბლ, ბრ, ბღ, ბზ, გდ, გლ, გმ, გნ, გვ, გზ, გრ, დრ, თლ, თრ, თღ,
კლ, კმ, კნ, კრ, კვ, მტ, პლ, პრ, ჟღ, რგ, რლ, რმ, სწ, სხ, ტკ, 
ტპ, ტრ, ფლ, ფრ, ფქ, ფშ, ქლ, ქნ, ქვ, ქრ, ღლ, ღრ, ყლ, ყრ, შთ, 
შპ, ჩქ, ჩრ, ცლ, ცნ, ცრ, ცვ, ძგ, ძვ, ძღ, წლ, წრ, წნ, წკ, ჭკ, 
ჭრ, ჭყ, ხლ, ხმ, ხნ, ხვ, ჯგ
```

### 4. **Anti-Orphan Protection**

Minimum 2 characters on each side:
```javascript
'არა' → 'არა'    // Not split (would create 1-letter syllable)
'არაა' → 'ა-რა-ა' // OK to split
```

---

## 🎨 Examples

### Basic Words
```javascript
hyphenate('საქართველო')  // → სა-ქარ-თვე-ლო
hyphenate('მთავრობა')     // → მთავ-რო-ბა
hyphenate('დედაქალაქი')   // → დე-და-ქა-ლა-ქი
hyphenate('პარლამენტი')   // → პარ-ლა-მენ-ტი
```

### Harmonic Clusters
```javascript
hyphenate('ბლოკი')        // → ბლო-კი  (ბლ stays together)
hyphenate('კრემი')        // → კრე-მი  (კრ stays together)
hyphenate('გლეხი')        // → გლე-ხი  (გლ stays together)
hyphenate('პროგრამა')    // → პროგ-რა-მა (პრ and გრ preserved)
```

### V-V Split
```javascript
hyphenate('გააკეთა')      // → გა-ა-კე-თა
hyphenate('გაიარა')       // → გა-ი-ა-რა
hyphenate('გაანალიზა')    // → გა-ა-ნა-ლი-ზა
```

### Text Processing
```javascript
hyphenateText('საქართველო არის ლამაზი ქვეყანა')
// → 'სა­ქარ­თვე­ლო არის ლა­მა­ზი ქვე­ყა­ნა' (with soft hyphens)

// Preserves punctuation
hyphenateText('მთავრობა, პარლამენტი და სასამართლო.')
// → 'მთავ­რო­ბა, პარ­ლა­მენ­ტი და სა­სა­მარ­თლო.'
```

---

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Expected output:
```
✅ Test 1: საქართველო → სა-ქარ-თვე-ლო
✅ Test 2: მთავრობა → მთავ-რო-ბა
...
📊 Test Results: 13 passed, 0 failed
🎉 All tests passed!
```

---

## 📊 Dictionary

The library includes `data/exceptions.json` with 150+ Georgian words:
```json
{
  "საქართველო": "სა-ქარ-თვე-ლო",
  "კომპიუტერი": "კომ-პიუ-ტე-რი",
  "პროგრამა": "პროგ-რა-მა",
  "ინტერნეტი": "ინ-ტერ-ნე-ტი"
}
```

---

## 📝 Changelog

### Version 2.2.4 (2026-01-27)

* 🌐 **Browser Fix**: Fixed CDN URL for reliable dictionary loading
* 📦 **NPM Files**: Added `data/` folder to published package (`files` whitelist)
* 🔧 **Error Handling**: Improved fallback when dictionary unavailable
* 📝 **Documentation**: Corrected examples, removed non-existent words

### Version 2.2.1 (2026-01-26)

* 🧹 **Sanitization**: Added `_stripHyphens` for automatic input cleaning
* ⚡ **Performance**: Converted `harmonicClusters` to `Set` (O(1) lookup)
* 📦 **ESM**: Full ES Modules support
* 📚 **Dictionary**: Added `loadDefaultLibrary()` method

### Version 2.0.1 (2026-01-22)

* 🎓 **Academic Rewrite**: Phonological distance analysis
* 🛡️ **Anti-Orphan**: Minimum 2 characters on each side
* 🎼 **Harmonic Clusters**: Georgian-specific consonant groups

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Run tests: `npm test`
4. Submit a Pull Request

---

## 🐛 Bug Reports

Found a bug? [Open an issue](https://github.com/guramzhgamadze/georgian-hyphenation/issues)

---

## 📄 License

MIT License

Copyright (c) 2025 Guram Zhgamadze

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 📧 Contact

**Guram Zhgamadze**

- 🐙 GitHub: [@guramzhgamadze](https://github.com/guramzhgamadze)
- 📧 Email: guramzhgamadze@gmail.com
- 📦 NPM: [georgian-hyphenation](https://www.npmjs.com/package/georgian-hyphenation)

---

## 🔗 Links

- **NPM Package:** https://www.npmjs.com/package/georgian-hyphenation
- **GitHub Repository:** https://github.com/guramzhgamadze/georgian-hyphenation
- **Demo:** https://guramzhgamadze.github.io/georgian-hyphenation/
- **PyPI (Python):** https://pypi.org/project/georgian-hyphenation/

---

**Made with ❤️ for the Georgian language community**

🇬🇪 **ქართული ენის ციფრული განვითარებისთვის**