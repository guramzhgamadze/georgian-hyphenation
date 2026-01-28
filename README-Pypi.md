# 🇬🇪 Georgian Hyphenation - Python Library

[![PyPI version](https://badge.fury.io/py/georgian-hyphenation.svg)](https://pypi.org/project/georgian-hyphenation/)
[![Python versions](https://img.shields.io/pypi/pyversions/georgian-hyphenation.svg)](https://pypi.org/project/georgian-hyphenation/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Georgian Language Hyphenation Library v2.2.1** - ქართული ენის დამარცვლის ბიბლიოთეკა

Automatic hyphenation (syllabification) for Georgian text with hybrid engine: **Algorithm + Dictionary**.

---

## ✨ Features

### **v2.2.1 (Latest)**
- 🎯 **Hybrid Engine**: Algorithm + Dictionary (150+ exception words)
- ⚡ **Optimized Performance**: Set-based harmonic cluster lookup (O(1))
- 🔄 **Strip & Re-hyphenate**: Corrects old incorrect hyphenation
- 🎵 **Harmonic Clusters**: Preserves natural Georgian sound clusters (ბლ, გლ, კრ, etc.)
- 💎 **Gemination Handling**: Splits double consonants correctly (rare in Georgian)
- 🛡️ **Anti-Orphan Protection**: Minimum 2 characters on each side
- 🐍 **Pure Python**: No external dependencies
- 🌐 **Unicode Support**: Full Georgian script support

### **Core Algorithm**
- Phonological distance analysis
- Vowel-based syllable detection
- Contextual consonant cluster handling
- Punctuation preservation

---

## 📦 Installation
```bash
pip install georgian-hyphenation
```

### **Requirements**
- Python 3.7+
- No external dependencies (uses only standard library)

---

## 🚀 Quick Start

### **Basic Usage**
```python
from georgian_hyphenation import GeorgianHyphenator

# Initialize with visible hyphen
hyphenator = GeorgianHyphenator('-')

# Hyphenate single word
print(hyphenator.hyphenate('საქართველო'))
# Output: სა-ქარ-თვე-ლო

# Hyphenate text
text = 'საქართველო არის ლამაზი ქვეყანა'
print(hyphenator.hyphenate_text(text))
# Output: სა-ქარ-თვე-ლო არის ლა-მა-ზი ქვე-ყა-ნა

# Get syllables as list
syllables = hyphenator.get_syllables('დედაქალაქი')
print(syllables)
# Output: ['დე', 'და', 'ქა', 'ლა', 'ქი']
```

### **Using Dictionary (Recommended)**
```python
from georgian_hyphenation import GeorgianHyphenator

hyphenator = GeorgianHyphenator('-')

# Load default dictionary (150+ exception words)
hyphenator.load_default_library()

# Now hyphenation will use dictionary first, then algorithm
print(hyphenator.hyphenate('კომპიუტერი'))
# Output: კომ-პიუ-ტე-რი (from dictionary)
```

### **Convenience Functions**
```python
from georgian_hyphenation import hyphenate, get_syllables, hyphenate_text

# Quick hyphenation with default settings
print(hyphenate('საქართველო'))
# Output: სა­ქარ­თვე­ლო (with soft hyphens U+00AD)

# Get syllables
print(get_syllables('მთავრობა'))
# Output: ['მთავ', 'რო', 'ბა']

# Hyphenate entire text
text = 'საქართველო არის ლამაზი ქვეყანა'
print(hyphenate_text(text))
```

---

## 🎨 Hyphen Character Options

### **Soft Hyphen (Invisible, default)**
```python
# Soft hyphen (U+00AD) - invisible, only appears at line breaks
hyphenator = GeorgianHyphenator('\u00AD')
print(hyphenator.hyphenate('საქართველო'))
# Output: სა­ქარ­თვე­ლო (hyphens invisible until line wraps)
```

### **Visible Hyphen**
```python
# Regular hyphen - always visible
hyphenator = GeorgianHyphenator('-')
print(hyphenator.hyphenate('საქართველო'))
# Output: სა-ქარ-თვე-ლო
```

### **Middle Dot**
```python
# Middle dot - useful for visualization
hyphenator = GeorgianHyphenator('·')
print(hyphenator.hyphenate('საქართველო'))
# Output: სა·ქარ·თვე·ლო
```

### **Custom Character**
```python
# Any character you want
hyphenator = GeorgianHyphenator('|')
print(hyphenator.hyphenate('საქართველო'))
# Output: სა|ქარ|თვე|ლო
```

---

## 📚 Advanced Usage

### **Custom Dictionary**
```python
from georgian_hyphenation import GeorgianHyphenator

hyphenator = GeorgianHyphenator('-')

# Add your own exception words
custom_dict = {
    'კომპიუტერი': 'კომ-პიუ-ტე-რი',
    'პროგრამა': 'პროგ-რა-მა',
    'ინტერნეტი': 'ინ-ტერ-ნე-ტი'
}

hyphenator.load_library(custom_dict)

# Now these words will use your custom hyphenation
print(hyphenator.hyphenate('კომპიუტერი'))
# Output: კომ-პიუ-ტე-რი
```

### **Combining Default + Custom Dictionary**
```python
hyphenator = GeorgianHyphenator('-')

# Load default dictionary first
hyphenator.load_default_library()

# Add your custom words
hyphenator.load_library({
    'სპეციალური': 'სპე-ცი-ა-ლუ-რი'
})

# Now has both default + custom exceptions
```

### **Export Formats**
```python
from georgian_hyphenation import to_tex_pattern, to_hunspell_format

# TeX hyphenation pattern
print(to_tex_pattern('საქართველო'))
# Output: .სა1ქარ1თვე1ლო.

# Hunspell format
print(to_hunspell_format('საქართველო'))
# Output: სა=ქარ=თვე=ლო
```

### **Processing Files**
```python
from georgian_hyphenation import GeorgianHyphenator

hyphenator = GeorgianHyphenator('\u00AD')
hyphenator.load_default_library()

# Read file
with open('input.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Hyphenate
hyphenated = hyphenator.hyphenate_text(text)

# Write output
with open('output.txt', 'w', encoding='utf-8') as f:
    f.write(hyphenated)
```

---

## 🔬 How It Works

### **v2.2.1 Hybrid Engine**

1. **Sanitization**: Strip existing hyphens from input
2. **Dictionary Lookup**: Check exception words first (if loaded)
3. **Algorithm Fallback**: Apply phonological rules if not in dictionary

### **Algorithm Rules**

#### **1. Vowel Detection**
```
საქართველო → vowels at positions: [1, 3, 5, 7]
```

#### **2. Consonant Cluster Analysis**

Between each vowel pair:

- **0 consonants (V-V)**: Split between vowels
```python
  'გააკეთა' → 'გა-ა-კე-თა'
```

- **1 consonant (V-C-V)**: Split after first vowel
```python
  'მამა' → 'მა-მა'
```

- **2+ consonants (V-CC...C-V)**:
  1. Check for **gemination** (double consonants) - rare in Georgian
```python
     'სამმა' → 'სამ-მა'  # Split between double 'მ' (if exists)
```
  
  2. Check for **harmonic clusters**
```python
     'ბლოკი' → 'ბლო-კი'  # Keep 'ბლ' together
```
  
  3. Default: Split after first consonant
```python
     'ბარბარე' → 'ბარ-ბა-რე'
```

#### **3. Harmonic Clusters (62 clusters)**

These consonant pairs stay together:
```
ბლ, ბრ, ბღ, ბზ, გდ, გლ, გმ, გნ, გვ, გზ, გრ, დრ, თლ, თრ, თღ,
კლ, კმ, კნ, კრ, კვ, მტ, პლ, პრ, ჟღ, რგ, რლ, რმ, სწ, სხ, ტკ, 
ტპ, ტრ, ფლ, ფრ, ფქ, ფშ, ქლ, ქნ, ქვ, ქრ, ღლ, ღრ, ყლ, ყრ, შთ, 
შპ, ჩქ, ჩრ, ცლ, ცნ, ცრ, ცვ, ძგ, ძვ, ძღ, წლ, წრ, წნ, წკ, ჭკ, 
ჭრ, ჭყ, ხლ, ხმ, ხნ, ხვ, ჯგ
```

#### **4. Anti-Orphan Protection**

Minimum 2 characters on each side:
```python
'არა' → 'არა'  # Not split (would create 1-letter syllable)
'არაა' → 'ა-რა-ა'  # OK to split
```

---

## 🧪 Examples

### **Basic Words**
```python
hyphenate('საქართველო')   # → სა-ქარ-თვე-ლო
hyphenate('მთავრობა')      # → მთავ-რო-ბა
hyphenate('დედაქალაქი')    # → დე-და-ქა-ლა-ქი
hyphenate('პარლამენტი')    # → პარ-ლა-მენ-ტი
```

### **V-C-V Pattern (Single Consonant)**
```python
hyphenate('კლასი')         # → კლა-სი
hyphenate('მასა')          # → მა-სა
hyphenate('მამა')          # → მა-მა
hyphenate('ბაბა')          # → ბა-ბა
```

### **Harmonic Clusters**
```python
hyphenate('ბლოკი')         # → ბლო-კი  (keeps ბლ)
hyphenate('კრემი')         # → კრე-მი  (keeps კრ)
hyphenate('გლეხი')         # → გლე-ხი  (keeps გლ)
hyphenate('ტრამვაი')       # → ტრამ-ვა-ი (keeps ტრ)
hyphenate('პროგრამა')     # → პროგ-რა-მა (keeps პრ and გრ)
```

### **V-V Split**
```python
hyphenate('გააკეთა')       # → გა-ა-კე-თა
hyphenate('გაიარა')        # → გა-ი-ა-რა
hyphenate('ააშენა')         # → ა-ა-შე-ნა
hyphenate('გაანალიზა')     # → გა-ა-ნა-ლი-ზა
```

### **Complex Words**
```python
hyphenate('მთავრობა')      # → მთავ-რო-ბა
hyphenate('სამთავრობო')    # → სამ-თავ-რო-ბო
hyphenate('ბარბარე')       # → ბარ-ბა-რე
hyphenate('ასტრონომია')    # → ას-ტრო-ნო-მი-ა
```

### **Text Processing**
```python
text = 'საქართველო არის ლამაზი ქვეყანა'
hyphenate_text(text)
# → 'სა­ქარ­თვე­ლო არის ლა­მა­ზი ქვე­ყა­ნა'

# Preserves punctuation
text = 'მთავრობა, პარლამენტი და სასამართლო.'
hyphenate_text(text)
# → 'მთავ­რო­ბა, პარ­ლა­მენ­ტი და სა­სა­მარ­თლო.'

# Preserves numbers and Latin text
text = 'საქართველოში 2025 წელს'
hyphenate_text(text)
# → 'სა­ქარ­თვე­ლო­ში 2025 წელს'
```

### **Get Syllables**
```python
get_syllables('საქართველო')    # → ['სა', 'ქარ', 'თვე', 'ლო']
get_syllables('დედაქალაქი')     # → ['დე', 'და', 'ქა', 'ლა', 'ქი']
get_syllables('მთავრობა')       # → ['მთავ', 'რო', 'ბა']
get_syllables('ბლოკი')          # → ['ბლო', 'კი']
```

---

## 📊 Dictionary

The library includes `data/exceptions.json` with 150+ Georgian words that require special hyphenation:
```json
{
  "კომპიუტერი": "კომ-პიუ-ტე-რი",
  "ინტერნეტი": "ინ-ტერ-ნე-ტი",
  "საქართველო": "სა-ქარ-თვე-ლო",
  "პროგრამა": "პროგ-რა-მა",
  "მთავრობა": "მთავ-რო-ბა"
}
```

Load it with:
```python
hyphenator.load_default_library()
```

---

## 🔧 API Reference

### **Class: GeorgianHyphenator**
```python
class GeorgianHyphenator:
    def __init__(self, hyphen_char: str = '\u00AD')
```

**Parameters:**
- `hyphen_char` (str): Character to use for hyphenation. Default: soft hyphen `\u00AD`

---

### **Methods**

#### **hyphenate(word: str) → str**
Hyphenate a single Georgian word.
```python
hyphenator = GeorgianHyphenator('-')
result = hyphenator.hyphenate('საქართველო')
# Returns: 'სა-ქარ-თვე-ლო'
```

---

#### **hyphenate_text(text: str) → str**
Hyphenate entire text (preserves punctuation and non-Georgian characters).
```python
hyphenator = GeorgianHyphenator('-')
result = hyphenator.hyphenate_text('საქართველო არის ლამაზი')
# Returns: 'სა-ქარ-თვე-ლო არის ლა-მა-ზი'
```

---

#### **get_syllables(word: str) → List[str]**
Get syllables as a list.
```python
hyphenator = GeorgianHyphenator('-')
syllables = hyphenator.get_syllables('საქართველო')
# Returns: ['სა', 'ქარ', 'თვე', 'ლო']
```

---

#### **load_library(data: Dict[str, str]) → None**
Load custom dictionary.
```python
hyphenator.load_library({
    'სიტყვა': 'სი-ტყვა',
    'მაგალითი': 'მა-გა-ლი-თი'
})
```

---

#### **load_default_library() → None**
Load default exception dictionary from `data/exceptions.json`.
```python
hyphenator.load_default_library()
```

---

### **Convenience Functions**

#### **hyphenate(word: str, hyphen_char: str = '\u00AD') → str**
```python
from georgian_hyphenation import hyphenate
result = hyphenate('საქართველო', '-')
```

#### **get_syllables(word: str) → List[str]**
```python
from georgian_hyphenation import get_syllables
syllables = get_syllables('საქართველო')
```

#### **hyphenate_text(text: str, hyphen_char: str = '\u00AD') → str**
```python
from georgian_hyphenation import hyphenate_text
result = hyphenate_text('საქართველო არის ლამაზი')
```

#### **to_tex_pattern(word: str) → str**
```python
from georgian_hyphenation import to_tex_pattern
pattern = to_tex_pattern('საქართველო')
# Returns: '.სა1ქარ1თვე1ლო.'
```

#### **to_hunspell_format(word: str) → str**
```python
from georgian_hyphenation import to_hunspell_format
hunspell = to_hunspell_format('საქართველო')
# Returns: 'სა=ქარ=თვე=ლო'
```

---

## 🧪 Testing

Run the test suite:
```bash
python test_python.py
```

Expected output:
```
🧪 Georgian Hyphenation v2.2.1 - Python Tests

📋 Basic Hyphenation Tests:
✅ Test 1: საქართველო
   Result: სა-ქარ-თვე-ლო
...
═══════════════════════════════════════
📊 Test Results: 13 passed, 0 failed
═══════════════════════════════════════
🎉 All tests passed!
```

---

## 📁 Project Structure
```
georgian-hyphenation/
├── data/
│   └── exceptions.json          # Dictionary (150+ words)
├── src/
│   └── georgian_hyphenation/
│       ├── __init__.py          # Package init
│       └── hyphenator.py        # Main code
├── test_python.py               # Test suite
├── pyproject.toml               # Package config
├── MANIFEST.in                  # Data files manifest
├── README.md                    # This file
└── LICENSE.txt                  # MIT License
```

---

## 📜 Changelog

### **v2.2.1 (2025-01-27)**
- ✨ Optimized: Set-based harmonic cluster lookup (O(1) instead of O(n))
- ✨ Added 12 new harmonic clusters: ბრ, გრ, დრ, თღ, მტ, შპ, ჩრ, წკ, ჭყ
- 🔄 Strip & Re-hyphenate: Always removes old hyphens and reapplies correctly
- 📦 Dictionary: 150+ exception words in `data/exceptions.json`
- 🎯 Hybrid Engine: Dictionary-first, Algorithm fallback
- 📝 Improved documentation with detailed API reference

### **v2.0.0 (2024)**
- Initial release
- Phonological algorithm
- Basic harmonic cluster handling
- TeX and Hunspell export formats

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository: https://github.com/guramzhgamadze/georgian-hyphenation
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests: `python test_python.py`
5. Commit: `git commit -m 'Add new feature'`
6. Push: `git push origin feature/new-feature`
7. Open a Pull Request

### **Adding Exception Words**

To add words to the dictionary:

1. Edit `data/exceptions.json`
2. Add your word in format: `"სიტყვა": "სი-ტყვა"`
3. Test: `python test_python.py`
4. Submit PR

---

## 🐛 Bug Reports

Found a bug? Please open an issue:
https://github.com/guramzhgamadze/georgian-hyphenation/issues

Include:
- Python version
- Code snippet that reproduces the issue
- Expected vs actual output

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

## 👨‍💻 Author

**Guram Zhgamadze**

- GitHub: [@guramzhgamadze](https://github.com/guramzhgamadze)
- Email: guramzhgamadze@gmail.com
- PyPI: [georgian-hyphenation](https://pypi.org/project/georgian-hyphenation/)

---

## 🙏 Acknowledgments

- Georgian linguistic research on syllabification
- TeX hyphenation algorithm inspiration
- Python community for excellent packaging tools

---

## 📚 Related Projects

- [Hyphen](https://github.com/hunspell/hyphen) - Generic hyphenation library
- [PyHyphen](https://github.com/dr-leo/PyHyphen) - Python wrapper for Hyphen
- [TeX hyphenation patterns](http://www.ctan.org/tex-archive/language/hyph-utf8)

---

## ⭐ Support

If you find this library useful, please:
- ⭐ Star the repository on GitHub
- 📢 Share with others
- 🐛 Report bugs
- 💡 Suggest improvements

---

**Made with ❤️ for the Georgian language community**

🇬🇪 **ქართული ენის ციფრული განვითარებისთვის**