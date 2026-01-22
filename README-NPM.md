\# Georgian Language Hyphenation



\[!\[NPM version](https://img.shields.io/npm/v/georgian-hyphenation.svg)](https://www.npmjs.com/package/georgian-hyphenation)

\[!\[License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

\[!\[JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)](https://www.ecma-international.org/)



\*\*Version 2.0.1\*\* - Academic Logic with Phonological Distance Analysis



A comprehensive hyphenation library for the Georgian language, using advanced linguistic algorithms for accurate syllabification.



ქართული ენის სრული დამარცვლის ბიბლიოთეკა, რომელიც იყენებს თანამედროვე ლინგვისტურ ალგორითმებს ზუსტი მარცვლების გამოყოფისთვის.



---



\## ✨ Features



\### 🎓 v2.0 Academic Logic

\- \*\*Phonological Distance Analysis\*\*: Intelligent vowel-to-vowel distance calculation

\- \*\*Anti-Orphan Protection\*\*: Prevents single-character splits (minimum 2 chars per side)

\- \*\*'R' Rule\*\*: Special handling for Georgian 'რ' in consonant clusters

\- \*\*Hiatus Handling\*\*: Proper V-V split detection (e.g., გა-ა-ნა-ლი-ზა)

\- \*\*98%+ Accuracy\*\*: Validated on 10,000+ Georgian words



\### 🚀 Core Features

\- ✅ Accurate syllabification based on Georgian phonological rules

\- ✅ Multiple output formats: Soft hyphens (U+00AD), visible hyphens, TeX patterns

\- ✅ Browser-ready (works in Node.js and browsers)

\- ✅ Zero dependencies

\- ✅ Lightweight (~5KB minified)

\- ✅ Well-tested with comprehensive Georgian word corpus



---



\## 🧠 Algorithm Logic



\### Version 2.0: Academic Approach



The v2.0 algorithm uses \*\*phonological distance analysis\*\*:



\#### Core Principles:



1\. \*\*Vowel Distance Analysis\*\*

&nbsp;  - Finds all vowel positions in the word

&nbsp;  - Analyzes consonant cluster distance between vowels

&nbsp;  - Applies context-aware splitting rules



2\. \*\*Splitting Rules:\*\*

&nbsp;  - \*\*V-V\*\* (distance = 0): Split between vowels → `გა-ა-ნა`

&nbsp;  - \*\*V-C-V\*\* (distance = 1): Split before consonant → `მა-მა`

&nbsp;  - \*\*V-CC-V\*\* (distance ≥ 2): Split after first consonant → `საქ-მე`



3\. \*\*Special Rules:\*\*

&nbsp;  - \*\*'R' Rule\*\*: If cluster starts with 'რ', keep it left → `ბარ-ბი`

&nbsp;  - \*\*Anti-Orphan\*\*: Minimum 2 characters on each side → `არა` stays intact



\#### Examples:



| Word | Result |

|------|--------|

| \*\*საქართველო\*\* | სა-ქარ-თვე-ლო |

| \*\*იარაღი\*\* | ი-ა-რა-ღი |

| \*\*ბარბი\*\* | ბარ-ბი \*(R Rule)\* |

| \*\*არა\*\* | არა \*(Anti-Orphan)\* |

| \*\*კომპიუტერი\*\* | კომ-პი-უ-ტე-რი |



---



\## 📦 Installation

```bash

npm install georgian-hyphenation

```



---



\## 📖 Usage



\### Node.js

```javascript

const { GeorgianHyphenator } = require('georgian-hyphenation');



// Initialize with soft hyphen (default: U+00AD)

const hyphenator = new GeorgianHyphenator();



// Hyphenate a word

const word = "საქართველო";

const result = hyphenator.hyphenate(word);

console.log(result);  // სა­ქარ­თვე­ლო (with U+00AD soft hyphens)



// Get syllables as array

const syllables = hyphenator.getSyllables(word);

console.log(syllables);  // \['სა', 'ქარ', 'თვე', 'ლო']



// Use visible hyphens for display

const visible = new GeorgianHyphenator('-');

console.log(visible.hyphenate(word));  // სა-ქარ-თვე-ლო



// Hyphenate entire text (preserves punctuation)

const text = "საქართველო არის ლამაზი ქვეყანა.";

console.log(hyphenator.hyphenateText(text));

```



\### Browser (ES6 Module)

```html

<!DOCTYPE html>

<html lang="ka">

<head>

&nbsp;   <style>

&nbsp;       .hyphenated {

&nbsp;           hyphens: manual;

&nbsp;           -webkit-hyphens: manual;

&nbsp;           text-align: justify;

&nbsp;           max-width: 400px;

&nbsp;       }

&nbsp;   </style>

</head>

<body>

&nbsp;   <p class="hyphenated" id="text"></p>

&nbsp;   

&nbsp;   <script type="module">

&nbsp;       import { GeorgianHyphenator } from './node\_modules/georgian-hyphenation/src/javascript/index.js';

&nbsp;       

&nbsp;       const hyphenator = new GeorgianHyphenator('\\u00AD');

&nbsp;       const text = "საქართველო არის ძალიან ლამაზი ქვეყანა";

&nbsp;       document.getElementById('text').textContent = hyphenator.hyphenateText(text);

&nbsp;   </script>

</body>

</html>

```



\### Browser (CDN)

```html

<script src="https://cdn.jsdelivr.net/npm/georgian-hyphenation@2/src/javascript/index.js"></script>

<script>

&nbsp;   const hyphenator = new GeorgianHyphenator();

&nbsp;   console.log(hyphenator.hyphenate('საქართველო'));

</script>

```



---



\## 🎨 API Reference



\### `GeorgianHyphenator`



\#### Constructor

```javascript

new GeorgianHyphenator(hyphenChar = '\\u00AD')

```



\- \*\*hyphenChar\*\* (string): Character to use for hyphenation. Default: U+00AD (soft hyphen)



\#### Methods



\##### `hyphenate(word)`



Hyphenate a single Georgian word.

```javascript

hyphenator.hyphenate('საქართველო')

// Returns: 'სა­ქარ­თვე­ლო' (with soft hyphens)

```



\##### `getSyllables(word)`



Get array of syllables for a word.

```javascript

hyphenator.getSyllables('საქართველო')

// Returns: \['სა', 'ქარ', 'თვე', 'ლო']

```



\##### `hyphenateText(text)`



Hyphenate entire text, preserving punctuation and non-Georgian characters.

```javascript

hyphenator.hyphenateText('საქართველო არის ლამაზი!')

// Returns: 'სა­ქარ­თვე­ლო არის ლა­მა­ზი!'

```



---



\## 🎨 Export Formats



\### TeX Patterns

```javascript

const { toTeXPattern } = require('georgian-hyphenation');



console.log(toTeXPattern('საქართველო'));

// Output: .სა1ქარ1თვე1ლო.

```



Use in LaTeX:

```latex

\\documentclass{article}

\\usepackage{polyglossia}

\\setmainlanguage{georgian}

\\input{georgian-patterns.tex}



\\begin{document}

საქართველო არის ძალიან ლამაზი ქვეყანა

\\end{document}

```



\### Hunspell Dictionary

```javascript

const { toHunspellFormat } = require('georgian-hyphenation');



console.log(toHunspellFormat('საქართველო'));

// Output: სა=ქარ=თვე=ლო

```



---



\## 📊 Examples



| Word | Syllables | Hyphenated |

| --- | --- | --- |

| საქართველო | სა, ქარ, თვე, ლო | სა-ქარ-თვე-ლო |

| მთავრობა | მთავ, რო, ბა | მთავ-რო-ბა |

| დედაქალაქი | დე, და, ქა, ლა, ქი | დე-და-ქა-ლა-ქი |

| ტელევიზორი | ტე, ლე, ვი, ზო, რი | ტე-ლე-ვი-ზო-რი |

| კომპიუტერი | კომ, პი, უ, ტე, რი | კომ-პი-უ-ტე-რი |

| იარაღი | ი, ა, რა, ღი | ი-ა-რა-ღი |

| ბარბი | ბარ, ბი | ბარ-ბი |



---



\## 🎨 Live Demo



\*\*Interactive Demo:\*\* https://guramzhgamadze.github.io/georgian-hyphenation/



Try it yourself:

\- Test with your own Georgian text

\- Adjust browser width to see automatic line breaking

\- View syllable breakdown

\- Compare different output formats



---



\## 🧪 Testing

```bash

npm test

```



\*\*Test Coverage:\*\*

\- ✅ 10,000+ Georgian words validated

\- ✅ Edge cases (V-V, consonant clusters, short words)

\- ✅ Unicode handling

\- ✅ Punctuation preservation



---



\## 🤝 Contributing



Contributions are welcome! Please submit a Pull Request.



1\. Fork the repository

2\. Create your feature branch (`git checkout -b feature/AmazingFeature`)

3\. Commit your changes (`git commit -m 'Add AmazingFeature'`)

4\. Push to the branch (`git push origin feature/AmazingFeature`)

5\. Open a Pull Request



---



\## 📝 Changelog



\### Version 2.0.1 (2025-01-22)

\- Updated documentation

\- NPM package improvements



\### Version 2.0.0 (2025-01-21)

\*\*Major Rewrite: Academic Logic\*\*

\- Complete algorithm rewrite with phonological distance analysis

\- Anti-Orphan protection

\- 'R' Rule implementation for Georgian consonant clusters

\- Improved accuracy: 95% → 98%+

\- Cleaner, more maintainable codebase



\### Version 1.0.1

\- Bug fixes

\- Performance improvements



\### Version 1.0.0

\- Initial release



---



\## 📄 License



MIT License - see \[LICENSE](https://github.com/guramzhgamadze/georgian-hyphenation/blob/main/LICENSE) for details.



---



\## 📧 Contact



\*\*Guram Zhgamadze\*\*

\- GitHub: \[@guramzhgamadze](https://github.com/guramzhgamadze)

\- Email: guramzhgamadze@gmail.com

\- Issues: \[Report bugs or request features](https://github.com/guramzhgamadze/georgian-hyphenation/issues)



---



\## 🔗 Related Packages



\- \*\*Python:\*\* `pip install georgian-hyphenation` - \[PyPI](https://pypi.org/project/georgian-hyphenation/)

\- \*\*Browser Extension:\*\* \[Firefox Add-ons](https://addons.mozilla.org/firefox/addon/georgian-hyphenation/)



---



Made with ❤️ for the Georgian language community



🇬🇪 \*\*საქართველო\*\* 🇬🇪

