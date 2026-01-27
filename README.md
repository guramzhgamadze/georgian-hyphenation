# Georgian Language Hyphenation / ქართული ენის დამარცვლა

**Version 2.2.2** (Library) / **2.0.8** (WordPress Plugin)

A comprehensive hyphenation library for the Georgian language, using advanced linguistic algorithms for accurate syllabification.

ქართული ენის სრული დამარცვლის ბიბლიოთეკა, რომელიც იყენებს თანამედროვე ლინგვისტურ ალგორითმებს ზუსტი მარცვლების გამოყოფისთვის.

---

## ✨ Features / ფუნქციები

### 🌟 New in v2.2.2 (Documentation Update)

* **📝 Corrected Examples**: გამოსწორდა არასწორი მაგალითები დოკუმენტაციაში (მაგ: არასწორი "კლასსი" → წაშლილია).
* **📚 Python README**: განახლდა Python package-ის README სრული და ზუსტი დოკუმენტაციით.
* **✅ PyPI Update**: ხელახლა გამოქვეყნდა PyPI-ზე გასწორებული README-ით.

### 🌟 v2.2.1 Features

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

## 🧠 Algorithm Logic / ალგორითმის ლოგიკა

ბიბლიოთეკა იყენებს აკადემიურ ფონოლოგიურ ანალიზს, რომელიც ეფუძნება ხმოვნებს შორის მანძილს და თანხმოვნების ტიპებს. v2.2 ვერსიაში დამატებულია წინასწარი გასუფთავების ფენა (Sanitization).

### 1. წინასწარი დამუშავება (Sanitization)

დამარცვლის დაწყებამდე სისტემა ასრულებს შემდეგ ნაბიჯებს:

* **Cleaning**: ტექსტიდან იშლება ყველა არსებული დამარცვლის სიმბოლო (`\u00AD` ან `-`), რათა თავიდან ავიცილოთ ორმაგი დამარცვლა.
* **Validation**: მოკლე სიტყვები (4 სიმბოლოზე ნაკლები) და სიტყვები ხმოვნების გარეშე ავტომატურად გამოიტოვება.

### 2. ხმოვანთა მანძილის ანალიზი

ალგორითმი პოულობს ხმოვნების ინდექსებს და ითვლის მანძილს მათ შორის:

* **V-V:** იყოფა ხმოვნებს შორის.

> მაგალითი: **`გა-ა-ი-ა-რა-ღა`**

* **V-C-V:** იყოფა პირველი ხმოვნის შემდეგ.

> მაგალითი: `მა-მა`, `დე-და`

* **V-CC-V:** სისტემა ამოწმებს თანხმოვნების ტიპს:
* **Double Consonants**: თუ გვერდიგვერდ ერთი და იგივე თანხმოვანია, იყოფა მათ შორის (იშვიათია ქართულში).
* **Harmonic Clusters**: თუ თანხმოვნები ქმნიან ჰარმონიულ წყვილს (მაგ: `ბრ`, `წვ`), ისინი რჩებიან ერთად და მარცვალი წყდება მათ წინ.
* **Default**: სხვა შემთხვევაში იყოფა პირველი თანხმოვნის შემდეგ.



### 3. უსაფრთხოების წესები (Constraints)

* **Anti-Orphan**: მარცვალი არასდროს წყდება ისე, რომ რომელიმე მხარეს დარჩეს მხოლოდ 1 ასო.
* **Left/Right Min**: დამარცვლა ხდება მხოლოდ მაშინ, თუ ორივე მხარეს მინიმუმ 2 სიმბოლო რჩება (მაგ: `არა` არ დაიყოფა).

### მაგალითების ანალიზი:

| სიტყვა | ანალიზი (ხმოვნებს შორის) | შედეგი | წესი |
| --- | --- | --- | --- |
| **საქართველო** | `ა-ქ-რ-ე` (2 თანხმოვანი) | `სა-ქარ-თვე-ლო` | სტანდარტული |
| **ბარბი** | `ა-რ-ბ-ი` ('რ' წესი) | `ბარ-ბი` | სპეციალური 'რ' წესი |
| **მწვრთნელი** | `მ-წ-ვ-რ-თ-ნ-ე` | `მწვრთნე-ლი` | ჰარმონიული ჯგუფი |
| **გაანალიზება** | `ა-ა` (0 თანხმოვანი) | `გა-ა-ნა-ლი-ზე-ბა` | ხმოვანთშერწყმა |

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

```javascript
import GeorgianHyphenator from 'georgian-hyphenation';

// ნაგულისხმევი სიმბოლოა Soft-Hyphen (\u00AD)
const hyphenator = new GeorgianHyphenator();

// ტესტირებისთვის შეგიძლიათ გამოიყენოთ ხილული ტირე (-)
const visibleHyphenator = new GeorgianHyphenator('-');

```

### 🛠 ძირითადი მეთოდები

#### 1. `hyphenate(word)`

```javascript
const result = hyphenator.hyphenate('საქართველო');
console.log(result); // "სა-ქარ-თვე-ლო"

```

#### 2. `hyphenateText(text)`

```javascript
const longText = "გამარჯობა, საქართველო მშვენიერი ქვეყანაა!";
console.log(hyphenator.hyphenateText(longText));

```

#### 3. `getSyllables(word)`

```javascript
const syllables = hyphenator.getSyllables('უნივერსიტეტი');
console.log(syllables); // ["უ", "ნი", "ვერ", "სი", "ტე", "ტი"]

```

#### 4. `loadDefaultLibrary()` (Async)

```javascript
await hyphenator.loadDefaultLibrary();
console.log('ლექსიკონი ჩაიტვირთა');

```

---

## 🌐 Browser Usage (CDN / ESM)

```html
<p class="hyphenated" id="content"></p>

<script type="module">
  import GeorgianHyphenator from 'https://cdn.jsdelivr.net/npm/georgian-hyphenation@2.2.2/src/javascript/index.js';

  async function initializeHyphenator() {
    const hyphenator = new GeorgianHyphenator('\u00AD');
    await hyphenator.loadDefaultLibrary();

    const text = "საქართველო არის ძალიან ლამაზი ქვეყანა, სადაც ბევრი ისტორიული ძეგლია.";
    
    document.getElementById('content').textContent = hyphenator.hyphenateText(text);
  }

  initializeHyphenator();
</script>

```

---

## 📊 Examples / მაგალითები

| Word (სიტყვა) | Syllables (მარცვლები) | Hyphenated | TeX Pattern |
| --- | --- | --- | --- |
| საქართველო | სა, ქარ, თვე, ლო | სა-ქარ-თვე-ლო | .სა1ქარ1თვე1ლო. |
| მთავრობა | მთავ, რო, ბა | მთავ-რო-ბა | .მთავ1რო1ბა. |
| დედაქალაქი | დე, და, ქა, ლა, ქი | დე-და-ქა-ლა-ქი | .დე1და1ქა1ლა1ქი. |
| ბლოკი | ბლო, კი | ბლო-კი | .ბლო1კი. |
| კრემი | კრე, მი | კრე-მი | .კრე1მი. |

---

## 📝 Changelog

### Version 2.2.2 (2025-01-27) — Documentation Update 📝

* 📝 **README Corrections**: გამოსწორდა არასწორი მაგალითები (მაგ: "კლასსი" → წაშლილია, რადგან არ არსებობს ქართულში).
* 📚 **Python README**: განახლდა Python package-ის README სრული დოკუმენტაციით და გასწორებული მაგალითებით.
* ✅ **PyPI v2.2.2**: ხელახლა გამოქვეყნდა PyPI-ზე გასწორებული დოკუმენტაციით.

---

### Version 2.2.1 (2025-01-26) — The Modernization Update 🚀

* 🧹 **Automatic Sanitization**: დაემატა `_stripHyphens` ფუნქციონალი, რომელიც ავტომატურად ასუფთავებს ტექსტს ძველი დამარცვლის სიმბოლოებისგან.
* 📦 **ES Modules (ESM)**: ბიბლიოთეკა სრულად გადავიდა თანამედროვე JavaScript სტანდარტზე (`import/export`).
* 📚 **Async Dictionary Support**: დაემატა `loadDefaultLibrary()` მეთოდი გამონაკლისების ლექსიკონის ავტომატური ჩატვირთვისთვის.
* ⚡ **Optimization**: ჰარმონიული ჯგუფების ძებნა გადავიდა `Set` სტრუქტურაზე სისწრაფისთვის.
* 🛠 **Package Improvements**: განახლდა `package.json` კონფიგურაცია (`exports`, `files` whitelist) NPM-ისთვის.

---

## 📄 License / ლიცენზია

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📧 Contact / კონტაქტი

**Guram Zhgamadze**

* 🐙 GitHub: [@guramzhgamadze](https://github.com/guramzhgamadze)
* 📧 Email: guramzhgamadze@gmail.com
* 🐛 Issues: [Report bugs or request features](https://github.com/guramzhgamadze/georgian-hyphenation/issues)

---

## 🔗 Links / ლინკები

* 🐍 **PyPI:** [https://pypi.org/project/georgian-hyphenation/](https://pypi.org/project/georgian-hyphenation/)
* 📦 **NPM:** [https://www.npmjs.com/package/georgian-hyphenation](https://www.npmjs.com/package/georgian-hyphenation)
* 🦊 **Firefox:** [https://addons.mozilla.org/firefox/addon/georgian-hyphenation/](https://addons.mozilla.org/firefox/addon/georgian-hyphenation/)
* 🎨 **Demo:** [https://guramzhgamadze.github.io/georgian-hyphenation/](https://guramzhgamadze.github.io/georgian-hyphenation/)

---

Made with ❤️ for the Georgian language community

შექმნილია ❤️-ით ქართული ენის საზოგადოებისთვის

🇬🇪 **საქართველო** 🇬🇪

---