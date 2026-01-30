/**
 * Georgian Hyphenation Library v2.2.6
 * Browser + Node.js Compatible (ES Module)
 */

export default class GeorgianHyphenator {
  constructor(hyphenChar = '\u00AD') {
    this.hyphenChar = hyphenChar;
    this.vowels = 'აეიოუ';
    this.leftMin = 2;
    this.rightMin = 2;

    // ოპტიმიზაცია: გამოყენებულია Set სწრაფი ძებნისთვის (O(1))
    this.harmonicClusters = new Set([
      'ბლ', 'ბრ', 'ბღ', 'ბზ', 'გდ', 'გლ', 'გმ', 'გნ', 'გვ', 'გზ', 'გრ',
      'დრ', 'თლ', 'თრ', 'თღ', 'კლ', 'კმ', 'კნ', 'კრ', 'კვ', 'მტ', 'პლ', 
      'პრ', 'ჟღ', 'რგ', 'რლ', 'რმ', 'სწ', 'სხ', 'ტკ', 'ტპ', 'ტრ', 'ფლ', 
      'ფრ', 'ფქ', 'ფშ', 'ქლ', 'ქნ', 'ქვ', 'ქრ', 'ღლ', 'ღრ', 'ყლ', 'ყრ', 
      'შთ', 'შპ', 'ჩქ', 'ჩრ', 'ცლ', 'ცნ', 'ცრ', 'ცვ', 'ძგ', 'ძვ', 'ძღ', 
      'წლ', 'წრ', 'წნ', 'წკ', 'ჭკ', 'ჭრ', 'ჭყ', 'ხლ', 'ხმ', 'ხნ', 'ხვ', 'ჯგ'
    ]);

    this.dictionary = new Map();
    this.dictionaryLoaded = false;
  }

  /**
   * შლის არსებულ დამარცვლის სიმბოლოებს (Sanitization)
   */
  _stripHyphens(text) {
    if (!text) return '';
    // Remove soft hyphens and zero-width spaces only
    return text.replace(/[\u00AD\u200B]/g, '').replace(new RegExp(this.hyphenChar, 'g'), '');
  }

  /**
   * ტვირთავს მომხმარებლის dictionary-ს
   */
  loadLibrary(data) {
    if (data && typeof data === 'object') {
      Object.entries(data).forEach(([word, hyphenated]) => {
        this.dictionary.set(word, hyphenated);
      });
    }
  }

  /**
   * ✅ ტვირთავს default dictionary-ს (Browser + Node.js compatible)
   */
  async loadDefaultLibrary() {
    if (this.dictionaryLoaded) return;

    // Browser Environment
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        // ✅ სწორი CDN URL - jsdelivr უფრო სანდოა unpkg-ზე
        const response = await fetch('https://cdn.jsdelivr.net/npm/georgian-hyphenation@2.2.6/data/exceptions.json');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        this.loadLibrary(data);
        this.dictionaryLoaded = true;
        
        console.log(`Georgian Hyphenation v2.2.6: Dictionary loaded (${this.dictionary.size} words)`);
      } catch (error) {
        console.warn('Georgian Hyphenation v2.2.6: Dictionary not available, using algorithm only');
        console.warn('Error:', error.message);
      }
    }
    // Node.js Environment (Dynamic Import for ESM)
    else if (typeof process !== 'undefined') {
      try {
        // Use dynamic import for JSON in ESM
        const module = await import('../../data/exceptions.json', { assert: { type: 'json' } });
        const data = module.default;
        this.loadLibrary(data);
        this.dictionaryLoaded = true;
        console.log(`Georgian Hyphenation v2.2.6: Dictionary loaded (${this.dictionary.size} words)`);
      } catch (error) {
        console.warn('Georgian Hyphenation v2.2.6: Local dictionary not found, using algorithm only');
      }
    }
  }

  /**
   * ამარცვლებს ერთ სიტყვას
   */
  hyphenate(word) {
    const sanitizedWord = this._stripHyphens(word);
    const cleanWord = sanitizedWord.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

    // Dictionary check
    if (this.dictionary.has(cleanWord)) {
      return this.dictionary.get(cleanWord).replace(/-/g, this.hyphenChar);
    }

    // Algorithm fallback
    return this.applyAlgorithm(sanitizedWord);
  }

  /**
   * ალგორითმის გამოყენება
   */
  applyAlgorithm(word) {
    if (word.length < (this.leftMin + this.rightMin)) return word;

    const vowelIndices = [];
    for (let i = 0; i < word.length; i++) {
      if (this.vowels.includes(word[i])) vowelIndices.push(i);
    }

    if (vowelIndices.length < 2) return word;

    const insertPoints = [];
    for (let i = 0; i < vowelIndices.length - 1; i++) {
      const v1 = vowelIndices[i];
      const v2 = vowelIndices[i + 1];
      const distance = v2 - v1 - 1;
      const betweenSubstring = word.substring(v1 + 1, v2);

      let candidatePos = -1;

      if (distance === 0 || distance === 1) {
        candidatePos = v1 + 1;
      } else {
        // Gemination check
        let doubleConsonantIndex = -1;
        for (let j = 0; j < betweenSubstring.length - 1; j++) {
          if (betweenSubstring[j] === betweenSubstring[j + 1]) {
            doubleConsonantIndex = j;
            break;
          }
        }

        if (doubleConsonantIndex !== -1) {
          candidatePos = v1 + 1 + doubleConsonantIndex + 1;
        } else {
          // Harmonic cluster check
          let breakIndex = -1;
          if (distance >= 2) {
            const lastTwo = betweenSubstring.substring(distance - 2, distance);
            if (this.harmonicClusters.has(lastTwo)) {
              breakIndex = distance - 2;
            }
          }
          candidatePos = (breakIndex !== -1) ? v1 + 1 + breakIndex : v1 + 2;
        }
      }

      // Anti-orphan protection
      if (candidatePos >= this.leftMin && (word.length - candidatePos) >= this.rightMin) {
        insertPoints.push(candidatePos);
      }
    }

    let result = word.split('');
    for (let i = insertPoints.length - 1; i >= 0; i--) {
      result.splice(insertPoints[i], 0, this.hyphenChar);
    }
    return result.join('');
  }

  /**
   * მარცვლების მიღება მასივის სახით
   */
  getSyllables(word) {
    return this.hyphenate(word).split(this.hyphenChar);
  }

  /**
   * მთელი ტექსტის დამარცვლა
   */
  hyphenateText(text) {
    if (!text) return '';
    const sanitizedText = this._stripHyphens(text);
    const parts = sanitizedText.split(/([ა-ჰ]+)/);

    return parts.map(part => {
      if (part.length >= 4 && /[ა-ჰ]/.test(part)) {
        return this.hyphenate(part);
      }
      return part;
    }).join('');
  }
}

// Browser Global (for <script> tag without type="module")
if (typeof window !== 'undefined') {
  window.GeorgianHyphenator = GeorgianHyphenator;
}