ბოდიშს გიხდი გაუგებრობისთვის. ახლა ზუსტად მივხვდი.

შენ გინდა **სრული, განახლებული `README.md**`, სადაც **WordPress-ის სექციაც** განახლებულია (ახალი მენიუთი და სვიჩებით) და **Changelog**-იც ჩამატებულია, ოღონდ ეს ყველაფერი **ერთ მთლიან კოდში**, რომ პირდაპირ დააკოპირო.

აი, სრული ფაილი:

```markdown
# Georgian Language Hyphenation / ქართული ენის დამარცვლა

[![PyPI version](https://img.shields.io/pypi/v/georgian-hyphenation.svg)](https://pypi.org/project/georgian-hyphenation/)
[![NPM version](https://img.shields.io/npm/v/georgian-hyphenation.svg)](https://www.npmjs.com/package/georgian-hyphenation)
[![Python 3.7+](https://img.shields.io/badge/python-3.7+-blue.svg)](https://www.python.org/downloads/)
[![JavaScript ES6+](https://img.shields.io/badge/javascript-ES6+-yellow.svg)](https://www.ecma-international.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Firefox Add-on](https://img.shields.io/amo/v/georgian-hyphenation?label=Firefox)](https://addons.mozilla.org/firefox/addon/georgian-hyphenation/)

**Version 2.0.1** (Library) / **2.0.8** (WordPress Plugin)

A comprehensive hyphenation library for the Georgian language, using advanced linguistic algorithms for accurate syllabification.

ქართული ენის სრული დამარცვლის ბიბლიოთეკა, რომელიც იყენებს თანამედროვე ლინგვისტურ ალგორითმებს ზუსტი მარცვლების გამოყოფისთვის.

---

## ✨ Features / ფუნქციები

### 🎓 v2.0 Academic Logic
- **Phonological Distance Analysis**: Intelligent vowel-to-vowel distance calculation
- **Anti-Orphan Protection**: Prevents single-character splits (minimum 2 chars per side)
- **'R' Rule**: Special handling for Georgian 'რ' in consonant clusters
- **Hiatus Handling**: Proper V-V split detection (e.g., გა-ა-ნა-ლი-ზა)
- **98%+ Accuracy**: Validated on 10,000+ Georgian words

### 🚀 Core Features
- ✅ **Accurate syllabification** based on Georgian phonological rules
- ✅ **Multiple platforms**: Python, JavaScript (Node.js & Browser), Browser Extensions, WordPress
- ✅ **Multiple output formats**: Soft hyphens (U+00AD), visible hyphens, TeX patterns, Hunspell
- ✅ **Zero dependencies**: Lightweight and fast
- ✅ **Open source**: MIT License
- ✅ **Well-tested**: Comprehensive Georgian word corpus

---

## 🧠 Algorithm Logic / ალგორითმის ლოგიკა

### Version 2.0: Academic Approach

The v2.0 algorithm uses **phonological distance analysis** instead of pattern matching:

#### **Core Principles:**

1. **Vowel Distance Analysis** (ხმოვანთა მანძილის ანალიზი)
   - Finds all vowel positions in the word
   - Analyzes consonant cluster distance between vowels
   - Applies context-aware splitting rules

2. **Splitting Rules:**
   - **V-V** (distance = 0): Split between vowels → `გა-ა-ნა`
   - **V-C-V** (distance = 1): Split before consonant → `მა-მა`
   - **V-CC-V** (distance ≥ 2): Split after first consonant → `საქ-მე`

3. **Special Rules:**
   - **'R' Rule**: If cluster starts with 'რ', keep it left → `ბარ-ბი` (not `ბა-რბი`)
   - **Anti-Orphan**: Minimum 2 characters on each side → `არა` stays intact

4. **Safety Filters:**
   - Words < 4 characters: Never hyphenated
   - Single vowel words: Cannot be split
   - Punctuation preserved in text processing

#### **Examples:**

| Word | Analysis | Result |
|------|----------|--------|
| **საქართველო** | V(ა)-C(ქ)-C(რ)-V(ე) | სა-ქარ-თვე-ლო |
| **იარაღი** | V(ი)-V(ა)-C(რ)-V(ა) | ი-ა-რა-ღი |
| **ბარბი** | V(ა)-C(**რ**)-C(ბ)-V(ი) | ბარ-ბი *(R Rule)* |
| **არა** | V(ა)-C(რ)-V(ა) | არა *(Anti-Orphan)* |
| **კომპიუტერი** | Complex cluster | კომ-პი-უ-ტე-რი |

---

## 📦 Installation / ინსტალაცია

### Python
```bash
pip install georgian-hyphenation

```

### JavaScript (NPM)

```bash
npm install georgian-hyphenation

```

### Browser Extension

**🦊 Firefox:** [Install from Firefox Add-ons](https://addons.mozilla.org/firefox/addon/georgian-hyphenation/)

**🌐 Chrome:** *Coming soon to Chrome Web Store*

---

## 📖 Quick Start / სწრაფი დაწყება

### Python

```python
from georgian_hyphenation import GeorgianHyphenator

# Initialize
hyphenator = GeorgianHyphenator('-')

# Hyphenate
print(hyphenator.hyphenate('საქართველო'))
# Output: სა-ქარ-თვე-ლო

# Get syllables
print(hyphenator.get_syllables('საქართველო'))
# Output: ['სა', 'ქარ', 'თვე', 'ლო']

```

### JavaScript

```javascript
const { GeorgianHyphenator } = require('georgian-hyphenation');

// Initialize
const hyphenator = new GeorgianHyphenator('-');

// Hyphenate
console.log(hyphenator.hyphenate('საქართველო'));
// Output: სა-ქარ-თვე-ლო

// Get syllables
console.log(hyphenator.getSyllables('საქართველო'));
// Output: ['სა', 'ქარ', 'თვე', 'ლო']

```

---

## 📚 Documentation / დოკუმენტაცია

### Python API

```python
from georgian_hyphenation import GeorgianHyphenator

# Initialize with soft hyphen (default: U+00AD)
hyphenator = GeorgianHyphenator()

# Hyphenate a word
word = "საქართველო"
result = hyphenator.hyphenate(word)
print(result)  # სა­ქარ­თვე­ლო (with U+00AD soft hyphens)

# Get syllables as a list
syllables = hyphenator.get_syllables(word)
print(syllables)  # ['სა', 'ქარ', 'თვე', 'ლო']

# Use visible hyphens for display
visible = GeorgianHyphenator('-')
print(visible.hyphenate(word))  # სა-ქარ-თვე-ლო

# Hyphenate entire text (preserves punctuation)
text = "საქართველო არის ლამაზი ქვეყანა."
print(hyphenator.hyphenate_text(text))
# Output: სა­ქარ­თვე­ლო არის ლა­მა­ზი ქვე­ყა­ნა.

```

### JavaScript API

```javascript
const { GeorgianHyphenator } = require('georgian-hyphenation');

// Initialize with soft hyphen (default: U+00AD)
const hyphenator = new GeorgianHyphenator();

// Hyphenate a word
const word = "საქართველო";
const result = hyphenator.hyphenate(word);
console.log(result);  // სა­ქარ­თვე­ლო (with U+00AD)

// Get syllables
const syllables = hyphenator.getSyllables(word);
console.log(syllables);  // ['სა', 'ქარ', 'თვე', 'ლო']

// Use visible hyphens
const visible = new GeorgianHyphenator('-');
console.log(visible.hyphenate(word));  // სა-ქარ-თვე-ლო

// Hyphenate entire text
const text = "საქართველო არის ლამაზი ქვეყანა";
console.log(hyphenator.hyphenateText(text));

```

### Browser Usage

```html
<!DOCTYPE html>
<html lang="ka">
<head>
    <style>
        .hyphenated {
            hyphens: manual;
            -webkit-hyphens: manual;
            text-align: justify;
        }
    </style>
</head>
<body>
    <p class="hyphenated" id="text"></p>
    
    <script src="[https://cdn.jsdelivr.net/npm/georgian-hyphenation@2/src/javascript/index.js](https://cdn.jsdelivr.net/npm/georgian-hyphenation@2/src/javascript/index.js)"></script>
    <script>
        const hyphenator = new GeorgianHyphenator('\u00AD');
        const text = "საქართველო არის ძალიან ლამაზი ქვეყანა";
        document.getElementById('text').textContent = 
            hyphenator.hyphenateText(text);
    </script>
</body>
</html>

```

---

## 🎨 Export Formats / ექსპორტის ფორმატები

### TeX Patterns

```python
from georgian_hyphenation import to_tex_pattern

print(to_tex_pattern('საქართველო'))
# Output: .სა1ქარ1თვე1ლო.

```

Use in LaTeX:

```latex
\documentclass{article}
\usepackage{polyglossia}
\setmainlanguage{georgian}
\input{georgian-patterns.tex}

\begin{document}
საქართველო არის ძალიან ლამაზი ქვეყანა
\end{document}

```

### Hunspell Dictionary

```python
from georgian_hyphenation import to_hunspell_format

print(to_hunspell_format('საქართველო'))
# Output: სა=ქარ=თვე=ლო

```

---

## 🌐 Browser Extension / ბრაუზერის გაფართოება

### Features:

* ✅ Automatic hyphenation on all Georgian websites
* ✅ Works on Facebook, Twitter, Wikipedia, News sites
* ✅ Toggle on/off per site
* ✅ Real-time statistics
* ✅ Zero performance impact
* ✅ Supports dynamic content (React, Vue, Angular)
* ✅ Respects editable fields (no interference with typing)

### Installation:

**Firefox:**

1. Visit [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/georgian-hyphenation/)
2. Click "Add to Firefox"
3. Done! ✅

**Chrome (Manual):**

1. Download
2. Extract `browser-extension-chrome.zip`
3. Chrome → `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" → Select folder

---

## 🔌 WordPress Plugin

**Current Version: v2.0.8**

### Features:

* ✅ **Full Elementor support** with individual widget controls
* ✅ **Modern UI** with Red/Green switches
* ✅ **Smart Fallback** (automatically finds content)
* ✅ **Custom CSS selectors** with helper guide
* ✅ **Auto-justify option**
* ✅ **Real-time configuration preview**
* ✅ **Debug console logging**
* ✅ **MutationObserver** for dynamic content (AJAX, Load More)
* ✅ **Zero performance impact**

### Installation:

**From WordPress.org:** *(Coming soon)*

**Manual Installation:**

1. Download **`georgian-hyphenation-wp-2.0.8.zip`**
2. WordPress Admin → Plugins → Add New → Upload Plugin
3. Choose ZIP file and click "Install Now"
4. Activate the plugin
5. Go to **"Geo Hyphenation"** in the main left sidebar menu.

### Configuration:

**Admin Menu → Geo Hyphenation**

1. **Enable Hyphenation** - Main on/off toggle
2. **Elementor Widgets** - Individual controls:
* Text Editor Widget (`.elementor-text-editor`, `.elementor-widget-container p`)
* Heading Widget (`.elementor-heading-title`)
* Icon Box Widget (`.elementor-icon-box-description`)
* Testimonial Widget (`.elementor-testimonial-content`)
* Accordion/Tabs/Toggle (`.elementor-accordion-content`, etc.)


3. **Additional CSS Selectors** - Add custom selectors:
```
article p, .entry-content p, .my-custom-class

```


4. **Auto Justify Text** - Apply `text-align: justify` for better effect

### Screenshots:

* **Settings Page:** New modern UI with switches.
* **Before & After:** Visual comparison.

### Requirements:

* WordPress 5.0+
* PHP 7.0+
* Works with or without Elementor

### Compatibility:

* ✅ Elementor Free & Pro
* ✅ All WordPress themes
* ✅ Page builders (Elementor, Gutenberg)
* ✅ Classic Editor
* ✅ WooCommerce
* ✅ Multisite

### Debugging:

Open browser console (F12) to see detailed logs:

```log
🇬🇪 GH: 🎯 Georgian Hyphenation Plugin v2.0.8: Starting...
🇬🇪 GH: ✅ GeorgianHyphenator library loaded!
🇬🇪 GH: 📋 CSS Selectors: .elementor-text-editor...
🇬🇪 GH: 🎯 Found elements: 12
🇬🇪 GH: ✅ Georgian Hyphenation Complete! Processed 12 elements.

```

---

## 🎨 Live Demo

**Interactive Demo:** https://guramzhgamadze.github.io/georgian-hyphenation/

Try it yourself:

* Test with your own Georgian text
* See before/after comparison
* Adjust browser width to see automatic line breaking
* View syllable breakdown
* Compare different output formats

---

## 📊 Examples / მაგალითები

| Word (სიტყვა) | Syllables (მარცვლები) | Hyphenated | TeX Pattern |
| --- | --- | --- | --- |
| საქართველო | სა, ქარ, თვე, ლო | სა-ქარ-თვე-ლო | .სა1ქარ1თვე1ლო. |
| მთავრობა | მთავ, რო, ბა | მთავ-რო-ბა | .მთავ1რო1ბა. |
| დედაქალაქი | დე, და, ქა, ლა, ქი | დე-და-ქა-ლა-ქი | .დე1და1ქა1ლა1ქი. |
| ტელევიზორი | ტე, ლე, ვი, ზო, რი | ტე-ლე-ვი-ზო-რი | .ტე1ლე1ვი1ზო1რი. |
| კომპიუტერი | კომ, პი, უ, ტე, რი | კომ-პი-უ-ტე-რი | .კომ1პი1უ1ტე1რი. |
| უნივერსიტეტი | უ, ნი, ვერ, სი, ტე, ტი | უ-ნი-ვერ-სი-ტე-ტი | .უ1ნი1ვერ1სი1ტე1ტი. |
| იარაღი | ი, ა, რა, ღი | ი-ა-რა-ღი | .ი1ა1რა1ღი. |
| ბარბი | ბარ, ბი | ბარ-ბი | .ბარ1ბი. |

---

## 🧪 Testing / ტესტირება

```bash
# Python tests
python test_v2.py

# JavaScript tests
npm test

```

**Test Coverage:**

* ✅ 10,000+ Georgian words validated
* ✅ Edge cases (V-V, consonant clusters, short words)
* ✅ Unicode handling
* ✅ Punctuation preservation
* ✅ Performance benchmarks

---

## 🤝 Contributing / წვლილის შეტანა

Contributions are welcome! Please feel free to submit a Pull Request.

მოხარული ვიქნებით თქვენი წვლილით! გთხოვთ გამოგზავნოთ Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Changelog

### Version 2.0.8 (WordPress Plugin) (2025-01-23)

* 🔌 **WordPress Plugin Update**:
* Moved settings to Top-Level Menu with icon
* Added modern Red/Green UI switches
* Added smart fallback selectors
* Added detailed helper text for custom CSS selectors



### Version 2.0.1 (2025-01-22)

* 📦 NPM package published with dedicated README
* 📝 Documentation improvements
* 🐛 Minor bug fixes

### Version 2.0.0 (2025-01-21) 🎉

**Major Rewrite: Academic Logic**

* ✅ **Complete algorithm rewrite** - Phonological distance analysis
* ✅ **Anti-Orphan protection** - Minimum 2 characters on each side
* ✅ **'R' Rule implementation** - Special handling for 'რ' consonant clusters
* ✅ **Hiatus detection** - Proper V-V split handling
* ✅ **Improved accuracy** - 95% → 98%+ on test corpus
* ✅ **Cleaner codebase** - 60 lines vs 100+ lines (v1.0)
* ✅ **Modern packaging** - `pyproject.toml` support

---

## 🗺️ Roadmap / სამომავლო გეგმები

### Short-term (2025 Q4)

* ✅ v2.0 Academic Logic - **DONE**
* ✅ PyPI v2.0.1 release - **DONE**
* ✅ NPM v2.0.1 release - **DONE**
* ✅ Firefox Extension v2.0.1 - **DONE**
* ✅ WordPress Plugin v2.0.8 - **DONE**
* 🔄 Chrome Web Store submission
* 📱 Mobile app (React Native)

### Mid-term (2026 Q3-Q4)

* 📄 Submit to TeX Live hyphenation database
* 📚 Academic paper publication
* 🎨 Adobe InDesign plugin
* 📊 Microsoft Word add-in

### Long-term (2027+)

* 🌍 Unicode CLDR proposal
* 🏛️ Official endorsement (Georgian Language Institute)
* 🤖 Integration into major OS (Windows, macOS, iOS, Android)
* 🌐 Browser native support proposal

---

## 📄 License / ლიცენზია

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE.txt) file for details.

---

## 📧 Contact / კონტაქტი

**Guram Zhgamadze**

* 🐙 GitHub: [@guramzhgamadze](https://github.com/guramzhgamadze)
* 📧 Email: guramzhgamadze@gmail.com
* 🐛 Issues: [Report bugs or request features](https://github.com/guramzhgamadze/georgian-hyphenation/issues)

---

## 🙏 Acknowledgments / მადლობა

* Based on Georgian phonological research
* Inspired by TeX hyphenation algorithms (Liang, 1983)
* Thanks to the Georgian linguistic community
* Special thanks to early testers and contributors

---

## 📚 References / ლიტერატურა

* Georgian Language Phonology and Syllable Structure
* TeX Hyphenation Algorithm (Liang, Franklin Mark. 1983)
* Hunspell Hyphenation Documentation
* Unicode Standard for Georgian Script (U+10A0–U+10FF)
* CLDR Language Data

---

## 🔗 Links / ლინკები

* 🐍 **PyPI:** https://pypi.org/project/georgian-hyphenation/
* 📦 **NPM:** https://www.npmjs.com/package/georgian-hyphenation
* 🦊 **Firefox:** https://addons.mozilla.org/firefox/addon/georgian-hyphenation/
* 🎨 **Demo:** https://guramzhgamadze.github.io/georgian-hyphenation/
* 📖 **Documentation:** [GitHub Wiki](https://github.com/guramzhgamadze/georgian-hyphenation/wiki)

---

Made with ❤️ for the Georgian language community

შექმნილია ❤️-ით ქართული ენის საზოგადოებისთვის

🇬🇪 **საქართველო** 🇬🇪

```

```