# Georgian Language Hyphenation / ქართული ენის დამარცვლა

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.7+](https://img.shields.io/badge/python-3.7+-blue.svg)](https://www.python.org/downloads/)
[![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)](https://www.ecma-international.org/)

A comprehensive hyphenation library for the Georgian language, supporting multiple output formats including TeX, Hunspell, and web standards.

ქართული ენის სრული დამარცვლის ბიბლიოთეკა, რომელიც მხარს უჭერს მრავალ ფორმატს: TeX, Hunspell და ვებ სტანდარტები.

## Features / ფუნქციები

- ✅ **Accurate syllabification** based on Georgian phonological rules
- ✅ **Multiple output formats**: Soft hyphens (U+00AD), TeX patterns, Hunspell dictionary
- ✅ **Python and JavaScript implementations** for maximum compatibility
- ✅ **Web-ready** with HTML/CSS/JS demo
- ✅ **Export capabilities**: JSON, CSV, TeX, Hunspell
- ✅ **Well-tested** with comprehensive Georgian word corpus

## Installation / ინსტალაცია

### Python

```bash
pip install georgian-hyphenation  # Coming soon
# Or clone this repository
git clone https://github.com/guramzhgamadze/georgian-hyphenation.git
cd georgian-hyphenation
python setup.py install
```

### JavaScript

```bash
npm install georgian-hyphenation  # Coming soon
# Or include directly in HTML
<script src="georgian-hyphenation.js"></script>
```

## Usage / გამოყენება

### Python

```python
from georgian_hyphenation import GeorgianHyphenator

# Initialize with soft hyphen (default)
hyphenator = GeorgianHyphenator()

# Hyphenate a word
word = "საქართველო"
result = hyphenator.hyphenate_word(word)
print(result)  # სა­ქარ­თვე­ლო (with U+00AD soft hyphens)

# Get syllables as a list
syllables = hyphenator.get_syllables(word)
print(syllables)  # ['სა', 'ქარ', 'თვე', 'ლო']

# Use visible hyphens for display
visible = GeorgianHyphenator('-')
print(visible.hyphenate_word(word))  # სა-ქარ-თვე-ლო

# Hyphenate entire text
text = "საქართველო არის ლამაზი ქვეყანა"
print(hyphenator.hyphenate_text(text))
```

### JavaScript

```javascript
// Initialize hyphenator
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

// Hyphenate text
const text = "საქართველო არის ლამაზი ქვეყანა";
console.log(hyphenator.hyphenateText(text));
```

### HTML/CSS Integration

```html
<!DOCTYPE html>
<html lang="ka">
<head>
    <style>
        .hyphenated {
            hyphens: manual;
            text-align: justify;
        }
    </style>
</head>
<body>
    <p class="hyphenated" id="text"></p>
    
    <script src="georgian-hyphenation.js"></script>
    <script>
        const hyphenator = new GeorgianHyphenator('\u00AD');
        const text = "საქართველო არის ძალიან ლამაზი ქვეყანა";
        document.getElementById('text').textContent = 
            hyphenator.hyphenateText(text);
    </script>
</body>
</html>
```

## Export Formats / ექსპორტის ფორმატები

### TeX Patterns

```python
from georgian_hyphenation import TeXPatternGenerator

hyphenator = GeorgianHyphenator()
tex_gen = TeXPatternGenerator(hyphenator)

words = ["საქართველო", "მთავრობა", "დედაქალაქი"]
tex_gen.generate_patterns_file(words, "hyph-ka.tex")
```

Output (`hyph-ka.tex`):
```tex
% Georgian hyphenation patterns
\patterns{
  .სა1ქარ1თვე1ლო
  .მთავ1რო1ბა
  .დე1და1ქა1ლა1ქი
}
```

### Hunspell Dictionary

```python
from georgian_hyphenation import HunspellDictionaryGenerator

hunspell_gen = HunspellDictionaryGenerator(hyphenator)
words = ["საქართველო", "მთავრობა"]
hunspell_gen.generate_dictionary(words, "hyph_ka_GE")
```

Output (`hyph_ka_GE.dic`):
```
UTF-8
2
სა=ქარ=თვე=ლო
მთავ=რო=ბა
```

### JSON Export

```python
from georgian_hyphenation import HyphenationExporter

exporter = HyphenationExporter(hyphenator)
words = ["საქართველო", "მთავრობა"]
exporter.export_json(words, "georgian_hyphenation.json")
```

Output:
```json
{
  "საქართველო": {
    "syllables": ["სა", "ქარ", "თვე", "ლო"],
    "hyphenated": "სა­ქარ­თვე­ლო"
  },
  "მთავრობა": {
    "syllables": ["მთავ", "რო", "ბა"],
    "hyphenated": "მთავ­რო­ბა"
  }
}
```

## Hyphenation Rules / დამარცვლის წესები

The library implements Georgian syllabification rules based on phonological patterns:

ბიბლიოთეკა იყენებს ქართული ფონოლოგიის წესებზე დაფუძნებულ მარცვლების გამოყოფას:

1. **V+C+C+V** → VC|CV (ხმოვანი + თანხმოვანი + თანხმოვნები + ხმოვანი)
2. **V+C+V+C+V** → VCV|CV
3. **C+V+C+V** → CV|CV
4. **V+V+V** → VV|V (სამი ხმოვანი ზედიზედ)
5. Special rules for word boundaries (სიტყვის საზღვრების სპეციალური წესები)

Where:
- **V** = vowel (ხმოვანი): ა, ე, ი, ო, უ
- **C** = consonant (თანხმოვანი): ბ, გ, დ, ვ, ზ, თ, კ, ლ, მ, ნ, პ, ჟ, რ, ს, ტ, ფ, ქ, ღ, ყ, შ, ჩ, ც, ძ, წ, ჭ, ხ, ჯ, ჰ

## Examples / მაგალითები

| Word (სიტყვა) | Syllables (მარცვლები) | Pattern |
|---------------|----------------------|---------|
| საქართველო | სა-ქარ-თვე-ლო | .სა1ქარ1თვე1ლო |
| მთავრობა | მთავ-რო-ბა | .მთავ1რო1ბა |
| დედაქალაქი | დე-და-ქა-ლა-ქი | .დე1და1ქა1ლა1ქი |
| ტელევიზორი | ტე-ლე-ვი-ზო-რი | .ტე1ლე1ვი1ზო1რი |
| კომპიუტერი | კომ-პი-უ-ტე-რი | .კომ1პი1უ1ტე1რი |
| უნივერსიტეტი | უ-ნი-ვერ-სი-ტე-ტი | .უ1ნი1ვერ1სი1ტე1ტი |

## Testing / ტესტირება

```bash
# Python tests
python -m pytest tests/

# JavaScript tests
npm test

# Run demo
python georgian_hyphenation.py
# or open demo.html in browser
```

## Contributing / წვლილის შეტანა

Contributions are welcome! Please feel free to submit a Pull Request.

მოხარული ვიქნებით თქვენი წვლილით! გთხოვთ გამოგზავნოთ Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Integration with Popular Tools / ინტეგრაცია პოპულარულ ხელსაწყოებთან

### LibreOffice / OpenOffice

1. Generate Hunspell dictionary files
2. Copy to extensions directory:
   - Linux: `~/.config/libreoffice/4/user/uno_packages/cache/`
   - Windows: `%APPDATA%\LibreOffice\4\user\uno_packages\cache\`
   - macOS: `~/Library/Application Support/LibreOffice/4/user/uno_packages/cache/`

### LaTeX / XeLaTeX

```latex
\documentclass{article}
\usepackage{polyglossia}
\setmainlanguage{georgian}
\usepackage{hyphenat}

% Include generated patterns
\input{hyph-ka.tex}

\begin{document}
საქართველო არის ძალიან ლამაზი ქვეყანა
\end{document}
```

### Web Browsers (CSS)

```css
html {
    lang: ka;
}

p {
    hyphens: manual;  /* Use with soft hyphens */
    /* or */
    hyphens: auto;    /* If browser supports Georgian */
    text-align: justify;
}
```

## Roadmap / სამომავლო გეგმები

- [ ] PyPI package release
- [ ] NPM package release
- [ ] Browser extension (Chrome, Firefox)
- [ ] InDesign plugin
- [ ] MS Word add-in
- [ ] Submit to TeX Live hyphenation database
- [ ] Submit to Unicode CLDR
- [ ] Mobile apps (iOS, Android)
- [ ] API service

## License / ლიცენზია

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments / მადლობა

- Based on Georgian phonological research
- Inspired by TeX hyphenation patterns
- Thanks to the Georgian linguistic community

## Contact / კონტაქტი

- GitHub Issues: [Report bugs or request features](https://github.com/guramzhgamadze/georgian-hyphenation/issues)
- Email: guramzhgamadze@gmail.com

## References / ლიტერატურა

- Georgian Language Phonology and Syllable Structure
- TeX Hyphenation Algorithm (Liang, 1983)
- Hunspell Hyphenation Documentation
- Unicode Standard for Georgian Script

---

Made with ❤️ for the Georgian language community

შექმნილია ❤️-ით ქართული ენის საზოგადოებისთვის
