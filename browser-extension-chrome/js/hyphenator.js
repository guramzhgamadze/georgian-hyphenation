/**
 * Georgian Hyphenation Library v2.2.7
 * Embedded from NPM Package
 */

if (typeof window.GeorgianHyphenator === 'undefined') {
  
  class GeorgianHyphenator {
    constructor(hyphenChar = '\u00AD') {
      this.hyphenChar = hyphenChar;
      this.vowels = 'აეიოუ';
      this.leftMin = 2;
      this.rightMin = 2;

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

    _stripHyphens(text) {
      if (!text) return '';
    return text.replace(/[\u00AD\u200B]/g, '').replace(new RegExp(this.hyphenChar, 'g'), '');
    }

    loadLibrary(data) {
      if (data && typeof data === 'object') {
        Object.entries(data).forEach(([word, hyphenated]) => {
          this.dictionary.set(word, hyphenated);
        });
      }
    }

    async loadDefaultLibrary() {
      if (this.dictionaryLoaded) return;

      if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
        try {
          const response = await fetch('https://cdn.jsdelivr.net/npm/georgian-hyphenation@2.2.6/data/exceptions.json');
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          this.loadLibrary(data);
          this.dictionaryLoaded = true;
          
          console.log(`Georgian Hyphenation v2.2.7: Dictionary loaded (${this.dictionary.size} words)`);
        } catch (error) {
          console.warn('Georgian Hyphenation v2.2.7: Dictionary not available, using algorithm only');
        }
      }
    }

    hyphenate(word) {
      const sanitizedWord = this._stripHyphens(word);
      const cleanWord = sanitizedWord.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

      if (this.dictionary.has(cleanWord)) {
        return this.dictionary.get(cleanWord).replace(/-/g, this.hyphenChar);
      }

      return this.applyAlgorithm(sanitizedWord);
    }

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

    getSyllables(word) {
      return this.hyphenate(word).split(this.hyphenChar);
    }

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

  window.GeorgianHyphenator = GeorgianHyphenator;
}