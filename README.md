# Georgian Language Hyphenation / ქართული ენის დამარცვლა

[![PyPI version](https://img.shields.io/pypi/v/georgian-hyphenation.svg)](https://pypi.org/project/georgian-hyphenation/)
[![NPM version](https://img.shields.io/npm/v/georgian-hyphenation.svg)](https://www.npmjs.com/package/georgian-hyphenation)
[![Python 3.7+](https://img.shields.io/badge/python-3.7+-blue.svg)](https://www.python.org/downloads/)
[![JavaScript ES6+](https://img.shields.io/badge/javascript-ES6+-yellow.svg)](https://www.ecma-international.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Firefox Add-on](https://img.shields.io/amo/v/georgian-hyphenation?label=Firefox)](https://addons.mozilla.org/firefox/addon/georgian-hyphenation/)

**Version 2.2.2** (Library) / **2.0.8** (WordPress Plugin)

A comprehensive hyphenation library for the Georgian language, using advanced linguistic algorithms for accurate syllabification.

ქართული ენის სრული დამარცვლის ბიბლიოთეკა, რომელიც იყენებს თანამედროვე ლინგვისტურ ალგორითმებს ზუსტი მარცვლების გამოყოფისთვის.

---

## ✨ Features / ფუნქციები

### 🌟 New in v2.2.2 (Smart Updates)

* **🧹 Automatic Sanitization**: ბიბლიოთეკა ავტომატურად ცნობს და შლის ტექსტში უკვე არსებულ დამარცვლის ნიშნებს (Soft-hyphens) დამუშავებამდე. ეს გამორიცხავს "ორმაგი დამარცვლის" შეცდომას.
* **📚 Dictionary Integration**: მხარდაჭერილია გამონაკლისების ლექსიკონი (`exceptions.json`), რომელიც პრიორიტეტულია ალგორითმთან შედარებით რთული სიტყვების დამუშავებისას.
* **⚡ High Performance**: ჰარმონიული ჯგუფების ძებნა ოპტიმიზირებულია `Set` სტრუქტურით, რაც უზრუნველყოფს მყისიერ დამუშავებას (O(1) complexity) დიდ ტექსტებზეც კი.
* **📦 Modern ESM**: სრული თავსებადობა თანამედროვე JavaScript სტანდარტებთან (`import/export`), რაც აადვილებს ინტეგრაციას Vite, React და Vue პროექტებში.

### 🎓 v2.2 Academic Logic (Linguistic Core)

* **🧠 Phonological Distance Analysis**: ხმოვნებს შორის მანძილის ჭკვიანი გაზომვა ზუსტი დამარცვლისთვის.
* **🛡️ Anti-Orphan Protection**: ხელს უშლის სიტყვის დასაწყისში ან ბოლოში ერთი ასოს მარტო დატოვებას (მინიმუმ 2 სიმბოლო თითოეულ მხარეს).
* **🎼 Harmonic Clusters Support**: სპეციალური წესები ქართული ჰარმონიული თანხმოვნებისთვის (მაგ: `ბრ`, `წვ`, `მთ`), რომლებიც დამარცვლისას არ იშლება.
* **🔄 Hiatus Handling**: ხმოვანთშერწყმის (V-V) სწორი დამუშავება (მაგ: `გა-ა-ნა-ლი-ზა`).

### 🚀 Integration & Flexibility

* ✅ **Multi-Platform**: ხელმისაწვდომია Python, JavaScript (Node & Browser), WordPress და Browser Extensions პლატფორმებისთვის.
* ✅ **Universal Formats**: მხარდაჭერილია Soft-hyphen (\u00AD), ვიზუალური ტირე, TeX patterns და Hunspell ფორმატები.
* ✅ **Zero Dependencies**: ბიბლიოთეკა არის სრულიად დამოუკიდებელი და მსუბუქი (~5KB).
* ✅ **Punctuation Aware**: ტექსტის დამუშავებისას ინარჩუნებს სასვენ ნიშნებს, ციფრებს და ლათინურ სიმბოლოებს.

---

რა თქმა უნდა, აი განახლებული და გაუმჯობესებული **Algorithm Logic** სექცია, რომელიც დეტალურად ხსნის v2.2.1 ვერსიის მუშაობის პრინციპს:

---

## 🧠 Algorithm Logic / ალგორითმის ლოგიკა

ბიბლიოთეკა იყენებს აკადემიურ ფონოლოგიურ ანალიზს, რომელიც ეფუძნება ხმოვნებს შორის მანძილს და თანხმოვნების ტიპებს. v2.2 ვერსიაში დამატებულია წინასწარი გასუფთავების ფენა (Sanitization).

### 1. წინასწარი დამუშავება (Sanitization)

დამარცვლის დაწყებამდე სისტემა ასრულებს შემდეგ ნაბიჯებს:

* **Cleaning**: ტექსტიდან იშლება ყველა არსებული დამარცვლის სიმბოლო (`\u00AD` ან `-`), რათა თავიდან ავიცილოთ ორმაგი დამარცვლა.
* **Validation**: მოკლე სიტყვები (4 სიმბოლოზე ნაკლები) და სიტყვები ხმოვნების გარეშე ავტომატურად გამოიტოვება.

### 2. ხმოვანთა მანძილის ანალიზი

ალგორითმი პოულობს ხმოვნების ინდექსებს და ითვლის მანძილს () მათ შორის:

* **V-V ():** იყოფა ხმოვნებს შორის.
> მაგალითი: `ი-ა-რა-ღი`


* **V-C-V ():** იყოფა პირველი ხმოვნის შემდეგ.
> მაგალითი: `მა-მა`, `დე-და`


* **V-CC-V ():** სისტემა ამოწმებს თანხმოვნების ტიპს:
* **Double Consonants**: თუ გვერდიგვერდ ერთი და იგივე თანხმოვანია, იყოფა მათ შორის (`ჯ-ჯ`, `ტ-ტ`).
* **Harmonic Clusters**: თუ თანხმოვნები ქმნიან ჰარმონიულ წყვილს (მაგ: `ბრ`, `წვ`), ისინი რჩებიან ერთად და მარცვალი წყდება მათ წინ.
* **Default**: სხვა შემთხვევაში იყოფა პირველი თანხმოვნის შემდეგ.



### 3. უსაფრთხოების წესები (Constraints)

* **Anti-Orphan**: მარცვალი არასდროს წყდება ისე, რომ რომელიმე მხარეს დარჩეს მხოლოდ 1 ასო.
* **Left/Right Min**: დამარცვლა ხდება მხოლოდ მაშინ, თუ ორივე მხარეს მინიმუმ 2 სიმბოლო რჩება (მაგ: `არა` არ დაიყოფა).

### მაგალითების ანალიზი:

| სიტყვა | ანალიზი (ხმოვნებს შორის) | შედეგი | წესი |
| --- | --- | --- | --- |
| **საქართველო** | `ა-ქ-რ-ე` (2 თანხმოვანი) | `სა-ქარ-თვე-ლო` |  (სტანდარტული) |
| **ბარბი** | `ა-რ-ბ-ი` ('რ' წესი) | `ბარ-ბი` | სპეციალური 'რ' წესი |
| **მწვრთნელი** | `მ-წ-ვ-რ-თ-ნ-ე` | `მწვრთნე-ლი` | ჰარმონიული ჯგუფი |
| **გაანალიზება** | `ა-ა` (0 თანხმოვანი) | `გა-ა-ნა-ლი-ზე-ბა` |  (ხმოვანთშერწყმა) |


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

---

## 📚 JavaScript API (v2.2.1+)

v2.2.1 ვერსია სრულად გადასულია **ES Modules (ESM)** სტანდარტზე, რაც უზრუნველყოფს საუკეთესო თავსებადობას თანამედროვე ხელსაწყოებთან (Vite, React, Vue, Next.js) და Node.js-ის ახალ ვერსიებთან.

### ⚙️ ინიციალიზაცია

ბიბლიოთეკის შემოტანა ხდება `import` სინტაქსით. კონსტრუქტორი იღებს ერთ არასავალდებულო პარამეტრს — დამარცვლის სიმბოლოს.

```javascript
import GeorgianHyphenator from 'georgian-hyphenation';

// ნაგულისხმევი სიმბოლოა Soft-Hyphen (\u00AD)
const hyphenator = new GeorgianHyphenator();

// ტესტირებისთვის შეგიძლიათ გამოიყენოთ ხილული ტირე (-)
const visibleHyphenator = new GeorgianHyphenator('-');

```

### 🛠 ძირითადი მეთოდები

#### 1. `hyphenate(word)`

ამარცვლებს ერთ კონკრეტულ ქართულ სიტყვას.

* **ავტომატური Sanitization**: მეთოდი ჯერ ასუფთავებს სიტყვას მასში უკვე არსებული დამარცვლის სიმბოლოებისგან და შემდეგ ამარცვლებს მას თავიდან.
* **პრიორიტეტი**: ჯერ მოწმდება გამონაკლისების ლექსიკონი, შემდეგ კი გამოიყენება ალგორითმი.

```javascript
const result = hyphenator.hyphenate('საქართველო');
console.log(result); // "სა-ქარ-თვე-ლო"

```

#### 2. `hyphenateText(text)`

ამარცვლებს მთლიან ტექსტს (წინადადებას, აბზაცს).

* ინარჩუნებს ყველა სასვენ ნიშანს, ციფრს და ლათინურ სიმბოლოს.
* ამარცვლებს მხოლოდ ქართულ სიტყვებს (სიგრძით >= 4 სიმბოლო).

```javascript
const longText = "გამარჯობა, საქართველო მშვენიერი ქვეყანაა!";
console.log(hyphenator.hyphenateText(longText));

```

#### 3. `getSyllables(word)`

სიტყვას შლის და აბრუნებს მარცვლების მასივს (`Array`).

```javascript
const syllables = hyphenator.getSyllables('უნივერსიტეტი');
console.log(syllables); // ["უ", "ნი", "ვერ", "სი", "ტე", "ტი"]

```

#### 4. `loadDefaultLibrary()` (Async)

ტვირთავს გამონაკლისების ლექსიკონს (`exceptions.json`) საუკეთესო სიზუსტისთვის.

* **Browser-ში**: ტვირთავს CDN-იდან (unpkg).
* **Node-ში**: კითხულობს ლოკალური ფაილიდან.

```javascript
await hyphenator.loadDefaultLibrary();
console.log('ლექსიკონი ჩაიტვირთა');

```
---

## 🌐 Browser Usage (CDN / ESM)

v2.2.1 ვერსიიდან ბიბლიოთეკა მუშაობს როგორც სტანდარტული JavaScript მოდული. ეს საშუალებას გაძლევთ გამოიყენოთ `import` პირდაპირ ბრაუზერში, ყოველგვარი Build-ხელსაწყოების (Webpack, Vite) გარეშე.

### 1. CSS კონფიგურაცია

იმისათვის, რომ ბრაუზერმა სწორად აჩვენოს "ფარული დამარცვლის" სიმბოლოები (**Soft Hyphens**), აუცილებელია კონტეინერს ჰქონდეს შემდეგი სტილები:

```css
.hyphenated {
  /* ააქტიურებს დამარცვლის სიმბოლოების ხილვადობას საჭიროებისას */
  hyphens: manual;
  -webkit-hyphens: manual;
  
  /* რეკომენდებულია ტექსტის გასწორება უკეთესი ვიზუალისთვის */
  text-align: justify;
  line-height: 1.6;
}

```

---

### 2. იმპორტი და ინიციალიზაცია

გამოიყენეთ `type="module"` თქვენს `<script>` თეგში. რეკომენდებულია **Async/Await** მიდგომა, რათა გამონაკლისების ლექსიკონი (`exceptions.json`) სწორად ჩაიტვირთოს.

```html
<p class="hyphenated" id="content"></p>

<script type="module">
  // იმპორტი პირდაპირ CDN-იდან (unpkg)
  import GeorgianHyphenator from 'https://cdn.jsdelivr.net/npm/georgian-hyphenation@2.2.1/src/javascript/index.js';

  async function initializeHyphenator() {
    // ინიციალიზაცია Soft Hyphen (\u00AD) სიმბოლოთი
    const hyphenator = new GeorgianHyphenator('\u00AD');

    // ტვირთავს გამონაკლისების ბაზას (Optional, but recommended)
    await hyphenator.loadDefaultLibrary();

    const text = "საქართველო არის ძალიან ლამაზი ქვეყანა, სადაც ბევრი ისტორიული ძეგლია.";
    
    // დამარცვლა და ტექსტის ასახვა
    document.getElementById('content').textContent = hyphenator.hyphenateText(text);
  }

  initializeHyphenator();
</script>

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

### Version 2.2.1 (2026-01-26) — The Modernization Update 🚀

* 🧹 **Automatic Sanitization**: დაემატა `_stripHyphens` ფუნქციონალი, რომელიც ავტომატურად ასუფთავებს ტექსტს ძველი დამარცვლის სიმბოლოებისგან.
* 📦 **ES Modules (ESM)**: ბიბლიოთეკა სრულად გადავიდა თანამედროვე JavaScript სტანდარტზე (`import/export`).
* 📚 **Async Dictionary Support**: დაემატა `loadDefaultLibrary()` მეთოდი გამონაკლისების ლექსიკონის ავტომატური ჩატვირთვისთვის.
* ⚡ **Optimization**: ჰარმონიული ჯგუფების ძებნა გადავიდა `Set` სტრუქტურაზე ( სისწრაფისთვის).
* 🛠 **Package Improvements**: განახლდა `package.json` კონფიგურაცია (`exports`, `files` whitelist) NPM-ისთვის.

---

### Version 2.0.8 (WordPress Plugin) (2025-01-23)

* 🔌 **WP UI/UX Update**:
* პარამეტრები გადავიდა მთავარ მენიუში (Top-Level Menu) შესაბამისი აიკონით.
* დაემატა თანამედროვე Red/Green UI გადამრთველები (Switches).
* **Smart Fallback**: დაემატა სელექტორების ავტომატური მოძებნის ლოგიკა.
* **Helper Text**: დაემატა დეტალური ინსტრუქციები Custom CSS სელექტორების გამოსაყენებლად.

---

### Version 2.0.1 (2025-01-22)

* 📦 **NPM Deployment**: ბიბლიოთეკა ოფიციალურად გამოქვეყნდა NPM-ზე ცალკეული `README-NPM.md` დოკუმენტაციით.
* 📝 **Docs**: გაუმჯობესდა საინსტალაციო და გამოყენების ინსტრუქციები.
* 🐛 **Bug Fixes**: გამოსწორდა მცირე ხარვეზები სიმბოლოების დამუშავებისას.

---

### Version 2.0.0 (2025-01-21) — Academic Logic v2.0 🎉

* ✅ **Major Algorithm Rewrite**: დაინერგა აკადემიური ფონოლოგიური დისტანციის ანალიზი.
* 🛡️ **Anti-Orphan Protection**: მინიმუმ 2 სიმბოლოს შენარჩუნება მარცვლის ორივე მხარეს.
* 🎼 **'R' Rule**: სპეციალური ლოგიკა 'რ' თანხმოვნის შემცველი ჯგუფებისთვის.
* 🔄 **Hiatus Detection**: ხმოვანთშერწყმის (V-V) სწორი დამარცვლა.
* 📈 **Accuracy**: სიზუსტე გაიზარდა **98%+**-მდე (ვალიდირებულია 10,000+ სიტყვაზე).
* 🏗️ **Packaging**: დაემატა `pyproject.toml` მხარდაჭერა Python-ისთვის.


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