/**
 * Georgian Language Hyphenation Library (v2.0 - Academic Logic)
 * ქართული ენის დამარცვლის ბიბლიოთეკა
 * * Logic: Phonological distance analysis & Anti-Orphan protection.
 * Author: Guram Zhgamadze
 */

class GeorgianHyphenator {
  /**
   * Initialize Georgian Hyphenator
   * @param {string} hyphenChar - Character to use for hyphenation (default: soft hyphen U+00AD)
   */
  constructor(hyphenChar = '\u00AD') {
    this.hyphenChar = hyphenChar;
    this.vowels = 'აეიოუ';
  }

  /**
   * Hyphenate a single Georgian word
   * @param {string} word - Georgian word to hyphenate
   * @returns {string} Word with hyphenation points
   */
  hyphenate(word) {
    // 1. Safety Rule: Words shorter than 4 chars are never hyphenated
    // (Prevents: "a-ra", "i-gi", "e-na")
    if (word.length < 4) return word;

    // 2. Find all vowel indices
    let vowelIndices = [];
    for (let i = 0; i < word.length; i++) {
      if (this.vowels.includes(word[i])) {
        vowelIndices.push(i);
      }
    }

    // 3. If less than 2 vowels, cannot be hyphenated (e.g. "mcvrtnls")
    if (vowelIndices.length < 2) return word;

    let insertPoints = [];

    // 4. Core Logic: Analyze distance between vowels
    for (let i = 0; i < vowelIndices.length - 1; i++) {
      let v1 = vowelIndices[i];
      let v2 = vowelIndices[i + 1];
      let distance = v2 - v1 - 1; // Number of consonants between vowels
      let betweenSubstring = word.substring(v1 + 1, v2);

      let candidatePos = -1;

      if (distance === 0) {
        // Case V-V (Hiatus): Split between vowels (ga-a-a-na-li-za)
        candidatePos = v1 + 1;
      } else if (distance === 1) {
        // Case V-C-V: Split before consonant (ga-da)
        candidatePos = v1 + 1;
      } else {
        // Case V-CC...-V: Cluster handling
        // 'R' Rule: If cluster starts with 'r', keep it left (bar-bi)
        // Otherwise, split after first consonant (saq-me) for balance
        if (betweenSubstring[0] === 'რ') {
          candidatePos = v1 + 2;
        } else {
          candidatePos = v1 + 2;
        }
      }

      // 5. Critical Filter (Anti-Orphan / Anti-Widow)
      // Ensure at least 2 characters remain on both sides of the hyphen
      if (candidatePos >= 2 && (word.length - candidatePos) >= 2) {
        insertPoints.push(candidatePos);
      }
    }

    // 6. Reconstruct the word
    let result = word.split('');
    for (let i = insertPoints.length - 1; i >= 0; i--) {
      result.splice(insertPoints[i], 0, this.hyphenChar);
    }

    return result.join('');
  }

  /**
   * Get array of syllables for a word
   * @param {string} word - Georgian word
   * @returns {string[]} Array of syllables
   */
  getSyllables(word) {
    // Use a temporary hyphenator with a safe delimiter to split
    const tempHyphenator = new GeorgianHyphenator('-');
    return tempHyphenator.hyphenate(word).split('-');
  }

  /**
   * Hyphenate entire text (preserves punctuation)
   * @param {string} text - Georgian text
   * @returns {string} Hyphenated text
   */
  hyphenateText(text) {
    // Improved Tokenizer: Splits by non-Georgian chars to protect punctuation
    const parts = text.split(/([^ა-ჰ]+)/);
    
    return parts.map(part => {
      // Process only Georgian words with length >= 4
      if (/[ა-ჰ]{4,}/.test(part)) {
        return this.hyphenate(part);
      }
      return part;
    }).join('');
  }
}

/**
 * Convert word to TeX pattern format (e.g., .გ1ა1ა1ნ1ა1ლ1ი1ზ1ა.)
 * Useful for LaTeX or TeX engines
 */
function toTeXPattern(word) {
  const hyphenator = new GeorgianHyphenator();
  const syllables = hyphenator.getSyllables(word);
  if (syllables.length <= 1) {
    return `.${word}.`;
  }
  // TeX hyphenation patterns usually use odd numbers (1, 3, 5) to indicate hyphens
  // Here we simply join syllables with '1'
  return '.' + syllables.join('1') + '.';
}

/**
 * Convert word to Hunspell format (syllable=syllable)
 */
function toHunspellFormat(word) {
  const hyphenator = new GeorgianHyphenator();
  const syllables = hyphenator.getSyllables(word);
  return syllables.join('=');
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GeorgianHyphenator,
    toTeXPattern,
    toHunspellFormat
  };
}

// Export for Browser
if (typeof window !== 'undefined') {
  window.GeorgianHyphenator = GeorgianHyphenator;
  window.toTeXPattern = toTeXPattern;
  window.toHunspellFormat = toHunspellFormat;
}