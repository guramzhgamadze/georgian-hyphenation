/**
 * Georgian Language Hyphenation Library (v2.0 - Academic Logic)
 * ქართული ენის დამარცვლის ბიბლიოთეკა
 * Logic: Phonological distance analysis & Anti-Orphan protection
 * Author: Guram Zhgamadze
 */

class GeorgianHyphenator {
  constructor(hyphenChar = '\u00AD') {
    this.hyphenChar = hyphenChar;
    this.vowels = 'აეიოუ';
  }

  hyphenate(word) {
    if (word.length < 4) return word;

    let vowelIndices = [];
    for (let i = 0; i < word.length; i++) {
      if (this.vowels.includes(word[i])) {
        vowelIndices.push(i);
      }
    }

    if (vowelIndices.length < 2) return word;

    let insertPoints = [];

    for (let i = 0; i < vowelIndices.length - 1; i++) {
      let v1 = vowelIndices[i];
      let v2 = vowelIndices[i + 1];
      let distance = v2 - v1 - 1;
      let betweenSubstring = word.substring(v1 + 1, v2);

      let candidatePos = -1;

      if (distance === 0) {
        candidatePos = v1 + 1;
      } else if (distance === 1) {
        candidatePos = v1 + 1;
      } else {
        if (betweenSubstring[0] === 'რ') {
          candidatePos = v1 + 2;
        } else {
          candidatePos = v1 + 2;
        }
      }

      if (candidatePos >= 2 && (word.length - candidatePos) >= 2) {
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
    const tempHyphenator = new GeorgianHyphenator('-');
    return tempHyphenator.hyphenate(word).split('-');
  }

  hyphenateText(text) {
    const parts = text.split(/([^ა-ჰ]+)/);
    return parts.map(part => {
      if (/[ა-ჰ]{4,}/.test(part)) {
        return this.hyphenate(part);
      }
      return part;
    }).join('');
  }
}

function toTeXPattern(word) {
  const hyphenator = new GeorgianHyphenator();
  const syllables = hyphenator.getSyllables(word);
  if (syllables.length <= 1) {
    return `.${word}.`;
  }
  return '.' + syllables.join('1') + '.';
}

function toHunspellFormat(word) {
  const hyphenator = new GeorgianHyphenator();
  const syllables = hyphenator.getSyllables(word);
  return syllables.join('=');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GeorgianHyphenator, toTeXPattern, toHunspellFormat };
}

if (typeof window !== 'undefined') {
  window.GeorgianHyphenator = GeorgianHyphenator;
  window.toTeXPattern = toTeXPattern;
  window.toHunspellFormat = toHunspellFormat;
}