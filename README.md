# Georgian Hyphenation / ქართული დამარცვლა

<div align="center">

[![PyPI](https://img.shields.io/pypi/v/georgian-hyphenation?color=blue&label=PyPI)](https://pypi.org/project/georgian-hyphenation/)
[![npm](https://img.shields.io/npm/v/georgian-hyphenation?color=red&label=npm)](https://www.npmjs.com/package/georgian-hyphenation)
[![Firefox](https://img.shields.io/amo/v/georgian-hyphenation?label=Firefox&color=orange)](https://addons.mozilla.org/firefox/addon/georgian-hyphenation/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.7+-blue.svg)](https://www.python.org/)
[![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)](https://www.ecma-international.org/)

**Professional-grade syllabification for the Georgian language**

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](https://guramzhgamadze.github.io/georgian-hyphenation/docs/index.html)

</div>

---

## 🎯 Overview

Georgian Hyphenation is a comprehensive, linguistically accurate library for automatic syllabification of Georgian (ქართული) text. Built on academic phonological principles, it provides high-quality hyphenation for digital typography, text processing, and publishing across multiple platforms.

**Version 2.2.7** – Enhanced browser extensions with Meta platform optimization!  
**Version 2.2.6** – Word add-in with advanced features!

### Why Georgian Hyphenation?

- **🎓 Academically Accurate**: Based on Georgian phonological research and syllable structure rules
- **⚡ High Performance**: Optimized algorithms with O(1) cluster lookups, processes 1000+ words/second
- **🌍 Multi-Platform**: Works in Python, JavaScript (Node.js & Browser), WordPress, Microsoft Word, and browser extensions
- **🎨 Typography-Ready**: Generates soft hyphens, TeX patterns, and Hunspell formats
- **📚 Dictionary Support**: 1000+ exception words for edge cases
- **🔧 Flexible**: Customizable hyphen characters and user dictionaries
- **✨ Smart Features**: Context-aware justify, Meta platform optimization, dynamic content support
- **📱 Social Media Ready**: Special handling for Facebook, Instagram, Threads with character-span obfuscation

---

## ✨ Features

### Core Algorithm

- ✅ **Vowel-based syllable detection** with phonological distance analysis
- ✅ **70+ harmonic consonant clusters** (ბრ, გრ, კრ, წვ, მთ, etc.)
- ✅ **Gemination handling** (double consonant splitting)
- ✅ **Anti-orphan protection** (minimum 2 characters per syllable)
- ✅ **Hiatus detection** (V-V splitting: გა-ა-ნა-ლი-ზა)
- ✅ **Compound word preservation** (keeps hyphens in მაგ-რამ)

### Integration Options

| Platform | Version | Status | Installation |
|----------|---------|--------|--------------|
| 🐍 **Python** | 2.2.6 | [![PyPI](https://img.shields.io/pypi/v/georgian-hyphenation)](https://pypi.org/project/georgian-hyphenation/) | `pip install georgian-hyphenation` |
| 📦 **JavaScript/Node.js** | 2.2.6 | [![npm](https://img.shields.io/npm/v/georgian-hyphenation)](https://www.npmjs.com/package/georgian-hyphenation) | `npm install georgian-hyphenation` |
| 🦊 **Firefox Extension** | 2.2.7 | [![Firefox](https://img.shields.io/amo/v/georgian-hyphenation)](https://addons.mozilla.org/firefox/addon/georgian-hyphenation/) | [Install from AMO](https://addons.mozilla.org/firefox/addon/georgian-hyphenation/) |
| 🌐 **Chrome Extension** | 2.2.7 | Beta | [Manual install](#chrome-extension) |
| 🔌 **WordPress Plugin** | 2.2.6 | Stable | [Download](#wordpress-plugin) |
| 📝 **MS Word Add-in** | 2.2.6 | Beta | [Installation guide](#microsoft-word-add-in) |

---

## 🚀 Quick Start

### Python
```python
from georgian_hyphenation import GeorgianHyphenator

# Initialize
hyphenator = GeorgianHyphenator()

# Hyphenate a word
print(hyphenator.hyphenate('საქართველო'))
# Output: სა­ქარ­თვე­ლო (with soft hyphens \u00AD)

# Get syllables as list
print(hyphenator.get_syllables('თბილისი'))
# Output: ['თბი', 'ლი', 'სი']

# Hyphenate text
text = 'საქართველო არის ლამაზი ქვეყანა'
print(hyphenator.hyphenate_text(text))

# Load dictionary for better accuracy
hyphenator.load_default_library()
```

### JavaScript / Node.js
```javascript
import GeorgianHyphenator from 'georgian-hyphenation';

// Initialize
const hyphenator = new GeorgianHyphenator();

// Hyphenate
console.log(hyphenator.hyphenate('საქართველო'));
// Output: სა­ქარ­თვე­ლო

// Get syllables
console.log(hyphenator.getSyllables('თბილისი'));
// Output: ['თბი', 'ლი', 'სი']

// Load dictionary (async)
await hyphenator.loadDefaultLibrary();

// Process text
const text = 'საქართველო არის ლამაზი ქვეყანა';
console.log(hyphenator.hyphenateText(text));
```

### Browser (CDN)
```html
<script type="module">
  import GeorgianHyphenator from 'https://cdn.jsdelivr.net/npm/georgian-hyphenation@2.2.6/src/javascript/index.js';
  
  const hyphenator = new GeorgianHyphenator('\u00AD');
  await hyphenator.loadDefaultLibrary();
  
  const text = document.getElementById('content').textContent;
  document.getElementById('content').textContent = hyphenator.hyphenateText(text);
</script>
```

---

## 📦 Installation

<details>
<summary><b>Python</b></summary>

```bash
pip install georgian-hyphenation
```

**Requirements:** Python 3.7+

**Usage:**
```python
from georgian_hyphenation import hyphenate, get_syllables

print(hyphenate('საქართველო'))
print(get_syllables('თბილისი'))
```

</details>

<details>
<summary><b>JavaScript / Node.js</b></summary>

```bash
npm install georgian-hyphenation
```

**Requirements:** Node.js 14+ or modern browser with ES6+ support

**ESM (recommended):**
```javascript
import GeorgianHyphenator from 'georgian-hyphenation';
```

**CommonJS:**
```javascript
const GeorgianHyphenator = require('georgian-hyphenation');
```

</details>

<details>
<summary><b>Browser Extension</b></summary>

### Firefox (Recommended)

1. Visit [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/georgian-hyphenation/)
2. Click "Add to Firefox"
3. Extension auto-activates on Georgian websites

### Chrome

1. Download the latest release from GitHub
2. Extract ZIP file
3. Open `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" → select extracted folder

**Features (v2.2.7):**
- ✅ **Meta Platform Optimized**: Special handling for Facebook, Instagram, Threads
- ✅ **Smart Justify**: Only applies to Georgian text (not English!)
- ✅ **Dynamic Content Support**: Works with SPAs and live updates
- ✅ **Character-Data Observer**: Catches Facebook's content replacements
- ✅ **Facebook Char-Span Handler**: Processes obfuscated ad/link text
- ✅ **Auto-hyphenation on all Georgian websites**
- ✅ **Smart skip logic** (navigation, headers, buttons)
- ✅ **Toggle on/off per site**
- ✅ **Real-time statistics**
- ✅ **Works with React, Vue, Angular**

**What's New in v2.2.7:**
- **Fixed**: Facebook partial hyphenation bug
- **Fixed**: Smart Justify applying to non-Georgian text (eBay, Amazon)
- **Added**: CharacterData mutation observer for persistent hyphenation
- **Added**: Class-based CSS targeting (.georgian-text-content)
- **Added**: Meta platform detection and special handling
- **Added**: Batched processing queue for better performance
- **Improved**: Memory management with WeakSet verification

</details>

<details>
<summary><b>WordPress Plugin</b></summary>

1. Download **georgian-hyphenation.zip**
2. WordPress Admin → Plugins → Add New → Upload Plugin
3. Install and activate
4. Configure at **Settings → Geo Hyphenation**

**Features:**
- ✅ Full Elementor support
- ✅ Custom CSS selectors
- ✅ Auto-justify option
- ✅ Dictionary support
- ✅ Real-time preview

</details>

<details>
<summary><b>Microsoft Word Add-in</b></summary>

**Status:** Beta (Web-hosted, ready to use)  
**Version:** 2.2.6

### Quick Installation

**Option 1: Direct Installation (Recommended)**
1. Open Microsoft Word
2. Go to **Insert** → **Get Add-ins**
3. Click **My Add-ins** tab
4. Click **Upload My Add-in** (bottom of dialog)
5. Download the manifest: [manifest.xml](https://guramzhgamadze.github.io/georgian-hyphenation/word-addin/manifest.xml)
6. Upload the manifest file
7. Click **OK**

**Option 2: Network Share (For Organizations)**
1. Share the `word-addin` folder on your network:
   - Right-click folder → Properties → Sharing → Share
   - Add "Everyone" with Read permissions
   - Copy network path (e.g., `\\YourPC\word-addin`)

2. Add to Word Trust Center:
   - File → Options → Trust Center → Trust Center Settings
   - Trusted Add-in Catalogs → Add catalog URL
   - Paste network path → Check "Show in Menu" → OK

3. Activate in Word:
   - Insert → Get Add-ins → Shared Folder
   - Select "Georgian Hyphenation" → Add

### Features (v2.2.6)

**Core Functionality:**
- ✅ **Soft Hyphens (U+00AD)**: Clean, invisible hyphens for professional documents
- ✅ **Two-Pass Processing**: Remove old → Sync → Add new (prevents duplicates)
- ✅ **Hybrid Engine**: Algorithm + 1000+ word dictionary
- ✅ **Full Document Hyphenation**: Process entire document in one click
- ✅ **Selection Hyphenation**: Process only selected text
- ✅ **Preserves Formatting**: Maintains all fonts, styles, colors

**Advanced Features:**
- ✅ **Error Detection**: Automatically highlights problematic paragraphs
- ✅ **Progress Tracking**: Real-time progress bar with percentage
- ✅ **Activity Journal**: Detailed log of all operations with timestamps
- ✅ **Theme Support**: Auto-adapts to Office theme (Light/Dark Gray/Black)
- ✅ **Language Detection**: Processes only Georgian text (checks languageId)
- ✅ **Clear Highlighting**: Remove all error markers in one click

**Smart Processing:**
- Skips tables of contents
- Skips headers/footers
- Skips text boxes
- Processes main document body
- Handles complex OOXML structures

**User Interface:**
- Modern Microsoft 365 design
- Collapsible features card
- Toggle activity journal on/off
- Download log as .txt file
- Georgian/English bilingual interface
- Responsive task pane

**Technical Specs:**
- Processing speed: ~1000 words/second
- Memory efficient: WeakMap caching
- Error handling: Try-catch for all operations
- Performance monitoring: Built-in timers

</details>

---

## 📖 Documentation

### Python API
```python
from georgian_hyphenation import GeorgianHyphenator

# Initialize with custom hyphen character
hyphenator = GeorgianHyphenator(hyphen_char='-')  # visible hyphen
# hyphenator = GeorgianHyphenator()  # soft hyphen (default: \u00AD)

# Main methods
hyphenator.hyphenate(word: str) -> str
hyphenator.get_syllables(word: str) -> List[str]
hyphenator.hyphenate_text(text: str) -> str

# Dictionary management
hyphenator.load_library(data: Dict[str, str])  # custom dictionary
hyphenator.load_default_library()  # built-in exceptions

# Export formats
from georgian_hyphenation import to_tex_pattern, to_hunspell_format

to_tex_pattern('საქართველო')      # .სა1ქარ1თვე1ლო.
to_hunspell_format('საქართველო')  # სა=ქარ=თვე=ლო
```

### JavaScript API
```javascript
import GeorgianHyphenator from 'georgian-hyphenation';

// Initialize
const hyphenator = new GeorgianHyphenator(hyphenChar = '\u00AD');

// Main methods
hyphenator.hyphenate(word)           // Returns hyphenated string
hyphenator.getSyllables(word)        // Returns array of syllables
hyphenator.hyphenateText(text)       // Processes entire text

// Dictionary (async)
await hyphenator.loadDefaultLibrary()          // Load built-in
hyphenator.loadLibrary({ word: 'hy-phen' })   // Custom dictionary
```

### Custom Dictionaries
```python
# Python
custom_words = {
    'განათლება': 'გა-ნათ-ლე-ბა',
    'უნივერსიტეტი': 'უ-ნი-ვერ-სი-ტე-ტი'
}
hyphenator.load_library(custom_words)
```
```javascript
// JavaScript
const customWords = {
    'განათლება': 'გა-ნათ-ლე-ბა',
    'უნივერსიტეტი': 'უ-ნი-ვერ-სი-ტე-ტი'
};
hyphenator.loadLibrary(customWords);
```

---

## 🧪 Algorithm Details

### Syllabification Rules

The algorithm applies Georgian phonological principles:

| Pattern | Rule | Example | Output |
|---------|------|---------|--------|
| **V-V** | Split between vowels | გაანალიზა | გა-ა-ნა-ლი-ზა |
| **V-C-V** | Split after first vowel | მამა | მა-მა |
| **V-CC-V** | Split between consonants | ბარბარე | ბარ-ბა-რე |
| **V-XY-V** | Keep harmonic clusters | ასტრონომია | ას-ტრო-ნო-მი-ა |
| **Compound** | Preserve existing hyphens | მაგ-რამ | მაგ-რამ |

### Harmonic Clusters (70+ supported)
```
ბლ ბრ ბღ ბზ    |  გდ გლ გმ გნ გვ გზ გრ    |  დრ
თლ თრ თღ        |  კლ კმ კნ კრ კვ            |  მტ
პლ პრ            |  ჟღ                        |  რგ რლ რმ
სწ სხ            |  ტკ ტპ ტრ                |  ფლ ფრ ფქ ფშ
ქლ ქნ ქვ ქრ        |  ღლ ღრ                    |  ყლ ყრ
შთ შპ            |  ჩქ ჩრ                    |  ცლ ცნ ცრ ცვ
ძგ ძვ ძღ        |  წლ წრ წნ წკ                |  ჭკ ჭრ ჭყ
ხლ ხმ ხნ ხვ        |  ჯგ
```

### Constraints

- **Minimum syllable length:** 2 characters (left and right)
- **Anti-orphan protection:** Never leaves single character isolated
- **Punctuation preservation:** Maintains all non-Georgian characters
- **Sanitization:** Removes old hyphens before processing (except regular hyphens in compounds)

---

## 💡 Examples

### Basic Usage
```python
from georgian_hyphenation import GeorgianHyphenator

h = GeorgianHyphenator('-')  # visible hyphen for display

# Simple words
print(h.hyphenate('საქართველო'))      # სა-ქარ-თვე-ლო
print(h.hyphenate('თბილისი'))          # თბი-ლი-სი
print(h.hyphenate('კომპიუტერი'))      # კომ-პი-უ-ტე-რი

# Complex clusters
print(h.hyphenate('მწვრთნელი'))       # მწვრთნე-ლი (keeps მწვრთ together)
print(h.hyphenate('ასტრონომია'))      # ას-ტრო-ნო-მი-ა (keeps ტრ cluster)

# Compound words (v2.2.6)
print(h.hyphenate('მაგ-რამ'))         # მაგ-რამ (preserves hyphen)
print(h.hyphenate('ხელ-ფეხი'))        # ხელ-ფეხი (preserves hyphen)
```

### Text Processing
```python
text = """
საქართველო არის ერთ-ერთი უძველესი ქვეყანა მსოფლიოში.
თბილისი არის დედაქალაქი და კულტურული ცენტრი.
"""

h = GeorgianHyphenator('\u00AD')  # soft hyphen for web
h.load_default_library()

processed = h.hyphenate_text(text)
print(processed)
```

### Web Integration
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    .hyphenated {
      text-align: justify;
      hyphens: manual;
      -webkit-hyphens: manual;
      max-width: 400px;
    }
  </style>
</head>
<body>
  <div class="hyphenated" id="content"></div>
  
  <script type="module">
    import GeorgianHyphenator from 'https://cdn.jsdelivr.net/npm/georgian-hyphenation@2.2.6/src/javascript/index.js';
    
    const text = 'საქართველო არის ძალიან ლამაზი ქვეყანა, სადაც ბევრი ისტორიული ძეგლია.';
    
    const hyphenator = new GeorgianHyphenator('\u00AD');
    await hyphenator.loadDefaultLibrary();
    
    document.getElementById('content').textContent = hyphenator.hyphenateText(text);
  </script>
</body>
</html>
```

### Microsoft Word Usage

```
1. Open your Georgian document in Word
2. Click "Insert" → "My Add-ins" → "Georgian Hyphenation"
3. Task pane opens on the right
4. Click "მთლიანი დოკუმენტის დამარცვლა" to hyphenate entire document
   OR select text and click "მონიშნული ტექსტის დამარცვლა"
5. Use Justify alignment (Ctrl+J) to see hyphenation in action
6. Toggle "აქტივობის ჟურნალი" to see processing details
```

**Pro Tips for Word Add-in:**
- Use Justify alignment to activate hyphenation
- Problematic paragraphs are highlighted in yellow
- Click "მარკირების მოშორება" to clear highlights
- Download activity log for debugging
- Theme auto-adapts to your Office settings

### LaTeX Integration
```python
from georgian_hyphenation import to_tex_pattern

# Generate TeX patterns
words = ['საქართველო', 'თბილისი', 'მთავრობა']

with open('georgian-patterns.tex', 'w', encoding='utf-8') as f:
    f.write('\\patterns{\n')
    for word in words:
        f.write(f'{to_tex_pattern(word)}\n')
    f.write('}\n')
```
```latex
\documentclass{article}
\usepackage{polyglossia}
\setmainlanguage{georgian}
\input{georgian-patterns.tex}

\begin{document}
საქართველო არის ძალიან ლამაზი ქვეყანა
\end{document}
```

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| **Speed** | ~1000 words/second |
| **Memory** | ~50KB with dictionary (1000+ words) |
| **Accuracy** | 98%+ (validated on 10,000+ words) |
| **Cluster Lookup** | O(1) with Set structure |
| **Average Word** | ~0.05ms processing time |
| **Extension Overhead** | <5MB per browser tab |

---

## 🆕 What's New

### Version 2.2.7 (Browser Extensions)

**Critical Bug Fixes:**
- ✅ **Fixed Facebook partial hyphenation** - Text now fully hyphenated on all posts
- ✅ **Fixed Smart Justify on English text** - eBay/Amazon products remain left-aligned
- ✅ **Fixed dynamic content handling** - Hyphenation persists even after site updates

**New Features:**
- 🆕 **CharacterData MutationObserver** - Catches Facebook's content replacements
- 🆕 **Meta Platform Detection** - Special handling for Facebook/Instagram/Threads
- 🆕 **Facebook Char-Span Handler** - Processes obfuscated ad/link text
- 🆕 **Class-based CSS targeting** - `.georgian-text-content` for precise control
- 🆕 **Batched processing queue** - Better performance on dynamic sites

**Performance Improvements:**
- ⚡ WeakSet verification prevents false positives
- ⚡ Optimized DOM traversal
- ⚡ Better memory management
- ⚡ Reduced CPU usage

### Version 2.2.6 (Core Library & Word Add-in)

**Core Library:**
- ✅ Compound word hyphen preservation (მაგ-რამ, ხელ-ფეხი)
- ✅ Enhanced dictionary with 1000+ exception words

**Word Add-in:**
- 🆕 Two-pass processing method (prevents duplicate hyphens)
- 🆕 Error detection and highlighting
- 🆕 Activity journal with download
- 🆕 Office theme support (Light/Dark/Black)
- 🆕 Progress tracking
- 🆕 Language-aware processing

---

## 🗺️ Roadmap

### ✅ Completed

- [x] v2.0 Academic algorithm
- [x] Python package (PyPI)
- [x] JavaScript package (npm)
- [x] Firefox extension (published on AMO)
- [x] Chrome extension (beta)
- [x] WordPress plugin
- [x] MS Word add-in (beta, web-hosted)
- [x] v2.2.6 Compound word preservation
- [x] v2.2.7 Browser extension enhancements
- [x] Meta platform optimization

### 🚧 In Progress

- [ ] Chrome Web Store submission
- [ ] WordPress.org plugin directory
- [ ] MS Word add-in (Office Store submission)

### 📅 Planned

- [ ] LibreOffice extension
- [ ] Google Docs add-on
- [ ] Adobe InDesign plugin
- [ ] TeX Live hyphenation database
- [ ] Academic paper publication
- [ ] Unicode CLDR proposal
- [ ] iOS/Android keyboard integration
- [ ] Desktop app (Electron)

---

## 🤝 Contributing

Contributions are welcome! We're especially looking for:

- 🐛 Bug reports and edge cases
- 📚 Additional dictionary words
- 🌍 Platform integrations (LibreOffice, Google Docs, etc.)
- 📖 Documentation improvements
- 🧪 Test cases
- 🎨 UI/UX enhancements

**How to contribute:**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Code Style:**
- Python: Follow PEP 8
- JavaScript: Use ES6+ features
- Add tests for new features
- Update documentation

---

## 🐛 Known Issues & Limitations

### Browser Extensions
- ⚠️ Requires internet for initial dictionary load (cached afterwards)
- ⚠️ Large headings (>20px) may be skipped
- ⚠️ Some rich text editors may not work
- ⚠️ Chrome version requires manual installation (not on Web Store yet)

### Word Add-in
- ⚠️ Requires Office 2016 or later
- ⚠️ Web-hosted manifest (internet required for initial load)
- ⚠️ Not yet on Office Store (sideloading required)
- ⚠️ May skip complex table structures

### Core Library
- ℹ️ Dictionary lookup improves accuracy but adds ~50KB memory
- ℹ️ Soft hyphens (U+00AD) invisible until line breaks

---

## 📱 Platform Support

| Platform | Python | JavaScript | Browser Ext. | WordPress | MS Word |
|----------|--------|------------|--------------|-----------|---------|
| **Windows** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **macOS** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Linux** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Web** | ❌ | ✅ | ✅ | ✅ | ✅ (Online) |

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 📧 Contact

**Guram Zhgamadze**

- 🐙 GitHub: [@guramzhgamadze](https://github.com/guramzhgamadze)
- 📧 Email: guramzhgamadze@gmail.com
- 🐛 Issues: [Report here](https://github.com/guramzhgamadze/georgian-hyphenation/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/guramzhgamadze/georgian-hyphenation/discussions)

---

## 🙏 Acknowledgments

- Based on Georgian phonological research
- Inspired by TeX hyphenation algorithms (Liang, 1983)
- Thanks to the Georgian linguistic community
- Special thanks to early adopters and beta testers
- Microsoft Office.js team for add-in platform
- Mozilla and Chrome extension APIs

---

## 📚 Citation

If you use this library in academic work, please cite:

```bibtex
@software{georgian_hyphenation_2026,
  author = {Zhgamadze, Guram},
  title = {Georgian Hyphenation: A Phonological Approach to Automatic Syllabification},
  year = {2026},
  publisher = {GitHub},
  url = {https://github.com/guramzhgamadze/georgian-hyphenation},
  version = {2.2.7}
}
```

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

<div align="center">

**Made with ❤️ for the Georgian language community**

**შექმნილია ❤️-ით ქართული ენის საზოგადოებისთვის**

🇬🇪 **საქართველო** 🇬🇪

[⬆ Back to Top](#georgian-hyphenation--ქართული-დამარცვლა)

</div>