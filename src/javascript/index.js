/**
 * Georgian Hyphenation Library v2.2.7
 * Browser + Node.js Compatible (ES Module)
 * Enhanced with additional utility functions
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
        const response = await fetch('https://cdn.jsdelivr.net/npm/georgian-hyphenation@2.2.7/data/exceptions.json');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        this.loadLibrary(data);
        this.dictionaryLoaded = true;
        
        console.log(`Georgian Hyphenation v2.2.7: Dictionary loaded (${this.dictionary.size} words)`);
      } catch (error) {
        console.warn('Georgian Hyphenation v2.2.7: Dictionary not available, using algorithm only');
        console.warn('Error:', error.message);
      }
    }
    // Node.js Environment (Dynamic Import for ESM)
    else if (typeof process !== 'undefined') {
      try {
        // Import from ../../data/exceptions.json (from src/javascript/ to data/)
        const module = await import('../../data/exceptions.json', { assert: { type: 'json' } });
        const data = module.default;
        this.loadLibrary(data);
        this.dictionaryLoaded = true;
        console.log(`Georgian Hyphenation v2.2.7: Dictionary loaded (${this.dictionary.size} words)`);
      } catch (error) {
        console.warn('Georgian Hyphenation v2.2.7: Local dictionary not found, using algorithm only');
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

  // ========================================
  // NEW UTILITY FUNCTIONS (v2.2.7)
  // ========================================

  /**
   * Removes all hyphenation from text (public method)
   * @param {string} text - Text with hyphens to remove
   * @returns {string} Text without hyphens
   */
  unhyphenate(text) {
    return this._stripHyphens(text);
  }

  /**
   * Counts syllables in a word
   * @param {string} word - Word to count syllables
   * @returns {number} Number of syllables
   */
  countSyllables(word) {
    return this.getSyllables(word).length;
  }

  /**
   * Gets the number of hyphenation points in a word
   * @param {string} word - Word to analyze
   * @returns {number} Number of hyphenation points
   */
  getHyphenationPoints(word) {
    const hyphenated = this.hyphenate(word);
    const matches = hyphenated.match(new RegExp(this.hyphenChar, 'g'));
    return matches ? matches.length : 0;
  }

  /**
   * Checks if text contains only Georgian characters
   * @param {string} text - Text to validate
   * @returns {boolean} True if only Georgian characters
   */
  isGeorgian(text) {
    if (!text) return false;
    return /^[ა-ჰ]+$/.test(text);
  }

  /**
   * Checks if a word can be hyphenated (meets minimum length)
   * @param {string} word - Word to check
   * @returns {boolean} True if word can be hyphenated
   */
  canHyphenate(word) {
    if (!word) return false;
    return word.length >= (this.leftMin + this.rightMin);
  }

  /**
   * Hyphenates multiple words at once
   * @param {string[]} words - Array of words to hyphenate
   * @returns {string[]} Array of hyphenated words
   */
  hyphenateWords(words) {
    return words.map(word => this.hyphenate(word));
  }

  /**
   * Hyphenates HTML content while preserving tags
   * Skips <script>, <style>, <code>, <pre> tags
   * @param {string} html - HTML content to hyphenate
   * @returns {string} Hyphenated HTML
   */
  hyphenateHTML(html) {
    if (!html) return '';

    // Tags to skip entirely
    const skipTags = ['script', 'style', 'code', 'pre', 'textarea'];
    const skipPattern = new RegExp(`<(${skipTags.join('|')})[^>]*>.*?</\\1>`, 'gis');
    
    // Store skipped content
    const skipped = [];
    let placeholder = html.replace(skipPattern, (match) => {
      skipped.push(match);
      return `___SKIP_${skipped.length - 1}___`;
    });

    // Split by tags to preserve HTML structure
    const parts = placeholder.split(/(<[^>]+>)/);
    
    const processed = parts.map(part => {
      // Skip HTML tags themselves
      if (part.startsWith('<')) {
        return part;
      }
      // Process text content
      return this.hyphenateText(part);
    });

    // Restore skipped content
    let result = processed.join('');
    skipped.forEach((content, index) => {
      result = result.replace(`___SKIP_${index}___`, content);
    });

    return result;
  }

  /**
   * Sets the minimum characters before first hyphen
   * @param {number} value - Minimum left characters (default: 2)
   * @returns {GeorgianHyphenator} Returns this for method chaining
   */
  setLeftMin(value) {
    if (typeof value === 'number' && value >= 1) {
      this.leftMin = value;
    }
    return this;
  }

  /**
   * Sets the minimum characters after last hyphen
   * @param {number} value - Minimum right characters (default: 2)
   * @returns {GeorgianHyphenator} Returns this for method chaining
   */
  setRightMin(value) {
    if (typeof value === 'number' && value >= 1) {
      this.rightMin = value;
    }
    return this;
  }

  /**
   * Changes the hyphen character
   * @param {string} char - New hyphen character
   * @returns {GeorgianHyphenator} Returns this for method chaining
   */
  setHyphenChar(char) {
    if (typeof char === 'string' && char.length > 0) {
      this.hyphenChar = char;
    }
    return this;
  }

  /**
   * Adds a single hyphenation exception to dictionary
   * @param {string} word - Original word
   * @param {string} hyphenated - Hyphenated version (use '-' for breaks)
   * @returns {GeorgianHyphenator} Returns this for method chaining
   */
  addException(word, hyphenated) {
    if (word && hyphenated) {
      this.dictionary.set(word, hyphenated);
    }
    return this;
  }

  /**
   * Removes a hyphenation exception from dictionary
   * @param {string} word - Word to remove
   * @returns {boolean} True if word was removed
   */
  removeException(word) {
    return this.dictionary.delete(word);
  }

  /**
   * Exports the current dictionary as a plain object
   * @returns {Object} Dictionary as key-value pairs
   */
  exportDictionary() {
    return Object.fromEntries(this.dictionary);
  }

  /**
   * Gets the current dictionary size
   * @returns {number} Number of words in dictionary
   */
  getDictionarySize() {
    return this.dictionary.size;
  }

  /**
   * Adds a custom harmonic cluster
   * @param {string} cluster - Two-character cluster (e.g., 'ბრ')
   * @returns {GeorgianHyphenator} Returns this for method chaining
   */
  addHarmonicCluster(cluster) {
    if (typeof cluster === 'string' && cluster.length === 2) {
      this.harmonicClusters.add(cluster);
    }
    return this;
  }

  /**
   * Removes a harmonic cluster
   * @param {string} cluster - Cluster to remove
   * @returns {boolean} True if cluster was removed
   */
  removeHarmonicCluster(cluster) {
    return this.harmonicClusters.delete(cluster);
  }

  /**
   * Gets all harmonic clusters
   * @returns {string[]} Array of harmonic clusters
   */
  getHarmonicClusters() {
    return Array.from(this.harmonicClusters);
  }
}

// Browser Global (for <script> tag without type="module")
if (typeof window !== 'undefined') {
  window.GeorgianHyphenator = GeorgianHyphenator;
}