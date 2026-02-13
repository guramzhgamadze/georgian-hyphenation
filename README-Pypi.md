# Georgian Hyphenation

[![PyPI version](https://img.shields.io/pypi/v/georgian-hyphenation.svg)](https://pypi.org/project/georgian-hyphenation/)
[![Python versions](https://img.shields.io/pypi/pyversions/georgian-hyphenation.svg)](https://pypi.org/project/georgian-hyphenation/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/pypi/dm/georgian-hyphenation.svg)](https://pypi.org/project/georgian-hyphenation/)

Georgian Language Hyphenation Library - Fast, accurate syllabification for Georgian (ქართული) text with support for Python 3.7+.

## Features

- ✅ **Accurate Georgian syllabification** based on phonetic rules
- ✅ **Harmonic consonant clusters** recognition (ბრ, გრ, კრ, etc.)
- ✅ **Gemination handling** (double consonant splitting)
- ✅ **Exception dictionary** for irregular words (148 words)
- ✅ **HTML-aware hyphenation** - preserves tags and code blocks (new in v2.2.7)
- ✅ **17+ utility functions** for advanced text processing (new in v2.2.7)
- ✅ **Configurable settings** - adjust margins and hyphen character (new in v2.2.7)
- ✅ **Method chaining** support (new in v2.2.7)
- ✅ **Zero dependencies**
- ✅ **Lightweight** and fast
- ✅ **Type hints** for better IDE support

## Installation

```bash
pip install georgian-hyphenation
```

## Quick Start

```python
from georgian_hyphenation import GeorgianHyphenator

# Create hyphenator instance
hyphenator = GeorgianHyphenator()

# Basic hyphenation
result = hyphenator.hyphenate('საქართველო')
print(result)  # სა­ქარ­თვე­ლო

# Get syllables as a list
syllables = hyphenator.get_syllables('თბილისი')
print(syllables)  # ['თბი', 'ლი', 'სი']

# NEW in v2.2.7: Count syllables
count = hyphenator.count_syllables('გამარჯობა')
print(count)  # 4

# NEW in v2.2.7: Hyphenate HTML
html = '<p>ქართული ენა <code>console.log()</code></p>'
result = hyphenator.hyphenate_html(html)
# Code tags are preserved!

# NEW in v2.2.7: Method chaining
hyphenator = (GeorgianHyphenator()
              .set_left_min(3)
              .set_right_min(3)
              .set_hyphen_char('-'))
```

---

## Core Methods

### `hyphenate(word: str) -> str`

Hyphenate a single Georgian word.

```python
hyphenator = GeorgianHyphenator()
result = hyphenator.hyphenate('კომპიუტერი')
print(result)  # კომ­პი­უ­ტე­რი
```

### `get_syllables(word: str) -> List[str]`

Get syllables as a list.

```python
syllables = hyphenator.get_syllables('განათლება')
print(syllables)  # ['გა', 'ნათ', 'ლე', 'ბა']
```

### `hyphenate_text(text: str) -> str`

Hyphenate all Georgian words in text.

```python
text = 'საქართველო არის ლამაზი ქვეყანა'
result = hyphenator.hyphenate_text(text)
print(result)  # სა­ქარ­თვე­ლო არის ლა­მა­ზი ქვე­ყა­ნა
```

---

## New in v2.2.7: Utility Functions

### `count_syllables(word: str) -> int`

Count the number of syllables in a word.

```python
count = hyphenator.count_syllables('გამარჯობა')
print(count)  # 4
```

### `get_hyphenation_points(word: str) -> int`

Get the number of hyphenation points (hyphens) in a word.

```python
points = hyphenator.get_hyphenation_points('გამარჯობა')
print(points)  # 3 (four syllables = three hyphens)
```

### `is_georgian(text: str) -> bool`

Check if text contains only Georgian characters.

```python
print(hyphenator.is_georgian('გამარჯობა'))  # True
print(hyphenator.is_georgian('hello'))       # False
print(hyphenator.is_georgian('გამარჯობა123'))  # False
```

### `can_hyphenate(word: str) -> bool`

Check if a word meets minimum length requirements.

```python
print(hyphenator.can_hyphenate('გა'))     # False (too short)
print(hyphenator.can_hyphenate('გამარ'))  # True
```

### `unhyphenate(text: str) -> str`

Remove all hyphenation from text.

```python
hyphenated = hyphenator.hyphenate('გამარჯობა')
clean = hyphenator.unhyphenate(hyphenated)
print(clean)  # გამარჯობა
```

### `hyphenate_words(words: List[str]) -> List[str]`

Hyphenate multiple words at once (batch processing).

```python
words = ['ქართული', 'ენა', 'მშვენიერია']
result = hyphenator.hyphenate_words(words)
print(result)  # ['ქარ­თუ­ლი', 'ე­ნა', 'მშვე­ნი­ე­რია']
```

### `hyphenate_html(html: str) -> str` ⭐ Most Useful!

Hyphenate HTML content while preserving tags and skipping code blocks.

```python
html = '''
  <article>
    <h1>ქართული ენა</h1>
    <p>პროგრამირება და კომპიუტერული მეცნიერება</p>
    <code>console.log('skip me')</code>
    <pre>this won't be hyphenated</pre>
  </article>
'''

result = hyphenator.hyphenate_html(html)
# Only <p> content gets hyphenated
# <code>, <pre>, <script>, <style>, <textarea> are preserved
```

---

## New in v2.2.7: Configuration Methods

All configuration methods support **method chaining**:

### `set_left_min(value: int) -> GeorgianHyphenator`

Set minimum characters before the first hyphen (default: 2).

```python
hyphenator.set_left_min(3)
# Now requires at least 3 characters before first hyphen
```

### `set_right_min(value: int) -> GeorgianHyphenator`

Set minimum characters after the last hyphen (default: 2).

```python
hyphenator.set_right_min(3)
# Now requires at least 3 characters after last hyphen
```

### `set_hyphen_char(char: str) -> GeorgianHyphenator`

Change the hyphen character.

```python
# Use visible hyphen for debugging
hyphenator.set_hyphen_char('-')
print(hyphenator.hyphenate('გამარჯობა'))
# Output: გა-მარ-ჯო-ბა

# Use custom separator
hyphenator.set_hyphen_char('•')
print(hyphenator.hyphenate('საქართველო'))
# Output: სა•ქარ•თვე•ლო
```

### Method Chaining

```python
hyphenator = (GeorgianHyphenator()
              .set_left_min(3)
              .set_right_min(3)
              .set_hyphen_char('-'))

print(hyphenator.hyphenate('გამარჯობა'))
```

---

## New in v2.2.7: Dictionary Management

### `load_library(data: Dict[str, str]) -> None`

Load custom exception dictionary.

```python
custom_words = {
    'განათლება': 'გა-ნათ-ლე-ბა',
    'უნივერსიტეტი': 'უ-ნი-ვერ-სი-ტე-ტი'
}

hyphenator.load_library(custom_words)
```

### `load_default_library() -> None`

Load the built-in exception dictionary (148 words).

```python
hyphenator.load_default_library()
# Dictionary loaded with tech terms, places, political terms
```

### `add_exception(word: str, hyphenated: str) -> GeorgianHyphenator`

Add a single custom hyphenation exception.

```python
hyphenator.add_exception('ტესტი', 'ტეს-ტი')

print(hyphenator.hyphenate('ტესტი'))
# Returns: ტეს­ტი (uses your custom hyphenation)
```

### `remove_exception(word: str) -> bool`

Remove an exception from the dictionary.

```python
removed = hyphenator.remove_exception('ტესტი')
print(removed)  # True if word was removed
```

### `export_dictionary() -> Dict[str, str]`

Export the entire dictionary as a dict.

```python
dict_data = hyphenator.export_dictionary()
print(dict_data)
# {'გამარჯობა': 'გა-მარ-ჯო-ბა', ...}
```

### `get_dictionary_size() -> int`

Get the number of words in the dictionary.

```python
hyphenator.load_default_library()
print(hyphenator.get_dictionary_size())
# Output: 148
```

---

## New in v2.2.7: Advanced Features

### Harmonic Cluster Management

For advanced users who need to customize consonant cluster recognition:

```python
# Add a custom harmonic cluster
hyphenator.add_harmonic_cluster('ტვ')

# Remove a cluster
hyphenator.remove_harmonic_cluster('ტვ')

# Get all clusters
clusters = hyphenator.get_harmonic_clusters()
print(clusters)
# ['ბლ', 'ბრ', 'ბღ', ... (70+ clusters)]
```

---

## Custom Hyphen Character

```python
# Use visible hyphen instead of soft hyphen
hyphenator = GeorgianHyphenator(hyphen_char='-')
print(hyphenator.hyphenate('საქართველო'))
# Output: სა-ქარ-თვე-ლო

# Use custom separator
hyphenator = GeorgianHyphenator(hyphen_char='•')
print(hyphenator.hyphenate('საქართველო'))
# Output: სა•ქარ•თვე•ლო
```

---

## Built-in Dictionary

The library includes 148 pre-hyphenated words including:

**Tech Terms:** კომპიუტერი, ფეისბუქი, იუთუბი, ინსტაგრამი  
**Places:** საქართველო, თბილისი  
**Political:** პარლამენტი, დემოკრატია, რესპუბლიკა  
**Compound Words:** სახელმწიფო, გულმავიწყი, თავდადებული

```python
hyphenator.load_default_library()
print(hyphenator.hyphenate('კომპიუტერი'))
# Uses dictionary: კომ­პიუ­ტე­რი
```

---

## Convenience Functions

For quick one-off usage without creating an instance:

```python
from georgian_hyphenation import hyphenate, get_syllables, hyphenate_text

# Quick hyphenation
print(hyphenate('საქართველო'))

# Quick syllable extraction
print(get_syllables('თბილისი'))

# Quick text hyphenation
print(hyphenate_text('ეს არის ტექსტი'))
```

---

## Export Formats

### TeX Pattern Format

```python
from georgian_hyphenation import to_tex_pattern

pattern = to_tex_pattern('საქართველო')
print(pattern)  # .სა1ქარ1თვე1ლო.
```

### Hunspell Format

```python
from georgian_hyphenation import to_hunspell_format

hunspell = to_hunspell_format('საქართველო')
print(hunspell)  # სა=ქარ=თვე=ლო
```

---

## Use Cases & Examples

### E-book Generator

```python
from georgian_hyphenation import GeorgianHyphenator

hyphenator = GeorgianHyphenator()
hyphenator.load_default_library()

def format_for_ebook(paragraphs):
    formatted = []
    for paragraph in paragraphs:
        formatted.append(hyphenator.hyphenate_text(paragraph))
    return '\n\n'.join(formatted)
```

### Blog/CMS Integration

```python
from georgian_hyphenation import GeorgianHyphenator

hyphenator = GeorgianHyphenator()
hyphenator.load_default_library()

def process_article(html_content):
    """Process article HTML for better typography"""
    return hyphenator.hyphenate_html(html_content)
```

### Form Validation

```python
hyphenator = GeorgianHyphenator()

def validate_georgian_input(text):
    if not hyphenator.is_georgian(text):
        raise ValueError('გთხოვთ შეიყვანოთ მხოლოდ ქართული ტექსტი')
    return True
```

### Syllable Counter

```python
def count_syllables_in_text(text):
    hyphenator = GeorgianHyphenator()
    words = text.split()
    total = 0
    
    for word in words:
        clean_word = ''.join(c for c in word if c.isalpha())
        if clean_word:
            total += hyphenator.count_syllables(clean_word)
    
    return total

text = "საქართველო არის ლამაზი ქვეყანა"
print(f"Total syllables: {count_syllables_in_text(text)}")
```

### Poetry Analyzer

```python
from georgian_hyphenation import GeorgianHyphenator

def analyze_verse(line):
    """Analyze syllable structure of Georgian poetry"""
    hyphenator = GeorgianHyphenator('-')
    words = line.split()
    
    analysis = []
    for word in words:
        syllables = hyphenator.get_syllables(word)
        analysis.append({
            'word': word,
            'syllables': syllables,
            'count': len(syllables)
        })
    
    return analysis

verse = "მთვარე ანათებს ცისკარზე"
print(analyze_verse(verse))
```

---

## Algorithm

The library uses a phonetic algorithm based on Georgian syllable structure:

### Rules Applied:

1. **Vowel Detection**: Identifies Georgian vowels (ა, ე, ი, ო, უ)
2. **Consonant Cluster Analysis**: Recognizes 70+ harmonic clusters
3. **Gemination Rules**: Splits double consonants (კკ → კ­კ)
4. **Orphan Prevention**: Ensures minimum syllable length (2 characters by default)
5. **Dictionary Lookup**: Checks exceptions first for accuracy

### Supported Harmonic Clusters:

```
ბლ, ბრ, ბღ, ბზ, გდ, გლ, გმ, გნ, გვ, გზ, გრ, დრ, თლ, თრ, თღ, 
კლ, კმ, კნ, კრ, კვ, მტ, პლ, პრ, ჟღ, რგ, რლ, რმ, სწ, სხ, ტკ, 
ტპ, ტრ, ფლ, ფრ, ფქ, ფშ, ქლ, ქნ, ქვ, ქრ, ღლ, ღრ, ყლ, ყრ, შთ, 
შპ, ჩქ, ჩრ, ცლ, ცნ, ცრ, ცვ, ძგ, ძვ, ძღ, წლ, წრ, წნ, წკ, ჭკ, 
ჭრ, ჭყ, ხლ, ხმ, ხნ, ხვ, ჯგ
```

### Syllable Patterns:

- **V-V**: Split between vowels (გა­ა­ნა­თლე­ბა)
- **V-C-V**: Split after first vowel (მა­მა)
- **V-CC-V**: Split between consonants (გარ­გა­რი)
- **V-ხრ-V**: Keep harmonic clusters together (ას­ტრო­ნო­მი­ა)
- **V-კკ-V**: Split gemination (კლას­სი)

---

## Performance

- **Speed**: ~0.05ms per word on average
- **HTML Processing**: ~2ms for 1000 words
- **Memory**: ~100KB with dictionary loaded
- **Optimization**: Uses `Set` for O(1) cluster lookups

---

## API Reference

### Main Class

#### `GeorgianHyphenator(hyphen_char: str = '\u00AD')`

**Parameters:**
- `hyphen_char` (str): Character to use for hyphenation. Default is soft hyphen (U+00AD)

**Core Methods:**
- `hyphenate(word: str) -> str`
- `get_syllables(word: str) -> List[str]`
- `hyphenate_text(text: str) -> str`
- `apply_algorithm(word: str) -> str`

**New Utility Methods (v2.2.7):**
- `count_syllables(word: str) -> int`
- `get_hyphenation_points(word: str) -> int`
- `is_georgian(text: str) -> bool`
- `can_hyphenate(word: str) -> bool`
- `unhyphenate(text: str) -> str`
- `hyphenate_words(words: List[str]) -> List[str]`
- `hyphenate_html(html: str) -> str`

**Configuration Methods (v2.2.7):**
- `set_left_min(value: int) -> GeorgianHyphenator`
- `set_right_min(value: int) -> GeorgianHyphenator`
- `set_hyphen_char(char: str) -> GeorgianHyphenator`

**Dictionary Methods (v2.2.7):**
- `load_library(data: Dict[str, str]) -> None`
- `load_default_library() -> None`
- `add_exception(word: str, hyphenated: str) -> GeorgianHyphenator`
- `remove_exception(word: str) -> bool`
- `export_dictionary() -> Dict[str, str]`
- `get_dictionary_size() -> int`

**Advanced Methods (v2.2.7):**
- `add_harmonic_cluster(cluster: str) -> GeorgianHyphenator`
- `remove_harmonic_cluster(cluster: str) -> bool`
- `get_harmonic_clusters() -> List[str]`

### Convenience Functions

```python
hyphenate(word: str, hyphen_char: str = '\u00AD') -> str
get_syllables(word: str) -> List[str]
hyphenate_text(text: str, hyphen_char: str = '\u00AD') -> str
to_tex_pattern(word: str) -> str
to_hunspell_format(word: str) -> str
```

---

## Changelog

### v2.2.7 (2025-02-13) 🎉

**New Features (17 functions added):**

✨ **Utility Functions:**
- `count_syllables(word)` - Get syllable count
- `get_hyphenation_points(word)` - Get hyphen count
- `is_georgian(text)` - Validate Georgian text
- `can_hyphenate(word)` - Check if word can be hyphenated
- `unhyphenate(text)` - Remove all hyphens
- `hyphenate_words(words)` - Batch processing
- `hyphenate_html(html)` - HTML-aware hyphenation 🌟

✨ **Configuration (Chainable):**
- `set_left_min(value)` - Configure left margin
- `set_right_min(value)` - Configure right margin
- `set_hyphen_char(char)` - Change hyphen character

✨ **Dictionary Management:**
- `add_exception(word, hyphenated)` - Add custom word
- `remove_exception(word)` - Remove exception
- `export_dictionary()` - Export as dict
- `get_dictionary_size()` - Get word count

✨ **Advanced:**
- `add_harmonic_cluster(cluster)` - Add custom cluster
- `remove_harmonic_cluster(cluster)` - Remove cluster
- `get_harmonic_clusters()` - List all clusters

**Improvements:**
- 🔧 All configuration methods support method chaining
- 📚 Comprehensive docstrings for all methods
- ✅ 100% backwards compatible
- 🎯 No breaking changes

### v2.2.6 (2026-01-30)
- ✨ Preserves regular hyphens in compound words
- 🐛 Fixed hyphen stripping behavior
- 📝 Improved documentation

### v2.2.5
- Dictionary support added
- Performance optimizations

---

## Testing

```bash
# Install the package
pip install georgian-hyphenation

# Test in Python
python -c "
from georgian_hyphenation import GeorgianHyphenator
h = GeorgianHyphenator()
h.load_default_library()
print('✅ Dictionary:', h.get_dictionary_size(), 'words')
print('✅ New functions work:', h.count_syllables('გამარჯობა'))
"
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT © [Guram Zhgamadze](https://github.com/guramzhgamadze)

---

## Author

**Guram Zhgamadze**
- GitHub: [@guramzhgamadze](https://github.com/guramzhgamadze)
- Email: guramzhgamadze@gmail.com

---

## Related Projects

- [georgian-hyphenation (npm)](https://www.npmjs.com/package/georgian-hyphenation) - JavaScript/Node.js version
- [Georgian Language Resources](https://www.omniglot.com/writing/georgian.htm)
- [Unicode Georgian Range](https://unicode.org/charts/PDF/U10A0.pdf)

---

## Citation

If you use this library in academic work, please cite:

```bibtex
@software{georgian_hyphenation,
  author = {Zhgamadze, Guram},
  title = {Georgian Hyphenation Library},
  year = {2025},
  publisher = {GitHub},
  url = {https://github.com/guramzhgamadze/georgian-hyphenation}
}
```

---

Made with ❤️ for the Georgian language community

**ქართული ენის თანამშრომლობისთვის**