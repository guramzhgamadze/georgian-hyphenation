/**
 * Georgian Language Hyphenation Library (JavaScript)
 * ქართული ენის დამარცვლის ბიბლიოთეკა
 * 
 * Usage:
 *   const hyphenator = new GeorgianHyphenator();
 *   const result = hyphenator.hyphenate("საქართველო");
 *   // Result: "სა\u00ADქარ\u00ADთვე\u00ADლო"
 */

class GeorgianHyphenator {
  /**
   * Initialize Georgian Hyphenator
   * @param {string} hyphenChar - Character to use for hyphenation (default: soft hyphen U+00AD)
   */
  constructor(hyphenChar = '\u00AD') {
    this.hyphenChar = hyphenChar;
    this.C = '[ბგდვზთკლმნპჟრსტფქღყშჩცძწჭხჯჰ]';  // Consonants
    this.V = '[აეიოუ]';                          // Vowels
    this.char = '[ა-ჰ]';                         // All Georgian letters
  }

  /**
   * Count vowels in a word
   * @param {string} word - Georgian word
   * @returns {number} Number of vowels
   */
  countVowels(word) {
    const vowels = 'აეიოუ';
    let count = 0;
    for (let v of vowels) {
      count += (word.match(new RegExp(v, 'g')) || []).length;
    }
    return count;
  }

  /**
   * Apply hyphenation rules with specified boundary markers
   * @private
   */
  _applyRules(w, softhpn, startchar, endchar) {
    const C = this.C;
    const V = this.V;
    const char = this.char;
    
    let t = w;
    
    // Rule 1: V+C+C++V → VC|CV
    t = t.replace(new RegExp(`(${V})(${C})(${C}+)(${V})`, 'gu'), 
                  `$1$2${softhpn}$3$4`);
    
    // Rule 2: V+C+V+C+V → VCV|CV
    t = t.replace(new RegExp(`(${V})(${C})(${V})(${C})(${V})`, 'gu'), 
                  `$1$2$3${softhpn}$4$5`);
    
    // Rule 3: C+V+C+V → CV|CV
    t = t.replace(new RegExp(`(${C})(${V})(${C})(${V})`, 'gu'), 
                  `$1$2${softhpn}$3$4`);
    
    // Rule 4: V+V+V → VV|V
    t = t.replace(new RegExp(`(${V})(${V})(${V})`, 'gu'), 
                  `$1$2${softhpn}$3`);
    
    // Rule 5: Word start - ^VCVCV
    t = t.replace(new RegExp(`${startchar}(${V})(${C})(${V})(${C})(${V})`, 'gu'), 
                  `$1$2$3${softhpn}$4$5`);
    
    // Rule 6: Word start - ^VCVCchar
    t = t.replace(new RegExp(`${startchar}(${V})(${C})(${V})(${C})(${char})`, 'gu'), 
                  `$1$2$3${softhpn}$4$5`);
    
    // Rule 7: Word start - ^C++CVCV
    t = t.replace(new RegExp(`${startchar}(${C}+)(${V})(${C})(${V})`, 'gu'), 
                  `$1$2${softhpn}$3$4`);
    
    // Rule 8: Word start - ^C++VVchar
    t = t.replace(new RegExp(`${startchar}(${C}+)(${V})(${V})(${char})`, 'gu'), 
                  `$1$2${softhpn}$3$4`);
    
    // Rule 9: Word end - charVVC++$
    t = t.replace(new RegExp(`(${char})(${V})(${V})(${C}+)${endchar}`, 'gu'), 
                  `$1$2${softhpn}$3$4`);
    
    // Rule 10: Word end - charVCV$
    t = t.replace(new RegExp(`(${char})(${V})(${C})(${V})${endchar}`, 'gu'), 
                  `$1$2${softhpn}$3$4`);
    
    // Rule 11: Word end - VCC++VC++$
    t = t.replace(new RegExp(`(${V})(${C})(${C}+)(${V})(${C}+)${endchar}`, 'gu'), 
                  `$1$2${softhpn}$3$4$5`);
    
    // Rule 12: Word end - charVCVC++$
    t = t.replace(new RegExp(`(${char})(${V})(${C})(${V}+)(${C}+)${endchar}`, 'gu'), 
                  `$1$2${softhpn}$3$4$5`);
    
    return t;
  }

  /**
   * Hyphenate a single Georgian word
   * @param {string} word - Georgian word to hyphenate
   * @returns {string} Word with hyphenation points
   */
  hyphenate(word) {
    // Don't hyphenate words with 0-1 vowels
    if (this.countVowels(word) <= 1) {
      return word;
    }

    const softhpn = this.hyphenChar;
    
    // Apply hyphenation rules with different boundary markers
    let result = this._applyRules(word, softhpn, '^', '$');
    result = this._applyRules(result, softhpn, '^', this._escapeRegex(softhpn));
    result = this._applyRules(result, this._escapeRegex(softhpn), '$');
    result = this._applyRules(result, this._escapeRegex(softhpn), this._escapeRegex(softhpn));
    
    // Remove duplicate hyphens
    const escapedHyphen = this._escapeRegex(softhpn);
    result = result.replace(new RegExp(`${escapedHyphen}+`, 'gu'), softhpn);
    
    return result;
  }

  /**
   * Get array of syllables for a word
   * @param {string} word - Georgian word
   * @returns {string[]} Array of syllables
   */
  getSyllables(word) {
    const hyphenated = this.hyphenate(word);
    return hyphenated.split(this.hyphenChar);
  }

  /**
   * Hyphenate entire text
   * @param {string} text - Georgian text
   * @returns {string} Hyphenated text
   */
  hyphenateText(text) {
    const words = text.split(' ');
    const hyphenatedWords = words.map(w => this.hyphenate(w));
    return hyphenatedWords.join(' ');
  }

  /**
   * Escape special regex characters
   * @private
   */
  _escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * Convert word to TeX pattern format
 * @param {string} word - Georgian word
 * @returns {string} TeX pattern
 */
function toTeXPattern(word) {
  const hyphenator = new GeorgianHyphenator();
  const syllables = hyphenator.getSyllables(word);
  if (syllables.length <= 1) {
    return `.${word}`;
  }
  return '.' + syllables.join('1');
}

/**
 * Convert word to Hunspell format
 * @param {string} word - Georgian word
 * @returns {string} Hunspell format
 */
function toHunspellFormat(word) {
  const hyphenator = new GeorgianHyphenator();
  const syllables = hyphenator.getSyllables(word);
  return syllables.join('=');
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GeorgianHyphenator,
    toTeXPattern,
    toHunspellFormat
  };
}

// Demo usage
if (typeof window !== 'undefined') {
  window.GeorgianHyphenator = GeorgianHyphenator;
  window.toTeXPattern = toTeXPattern;
  window.toHunspellFormat = toHunspellFormat;
}

// Example usage:
// const hyphenator = new GeorgianHyphenator('-'); // visible hyphens
// console.log(hyphenator.hyphenate("საქართველო")); // "სა-ქარ-თვე-ლო"
// console.log(hyphenator.getSyllables("საქართველო")); // ["სა", "ქარ", "თვე", "ლო"]