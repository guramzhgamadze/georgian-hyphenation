// Georgian Hyphenation Library
class GeorgianHyphenator {
  constructor(hyphenChar = '\u00AD') {
    this.hyphenChar = hyphenChar;
    this.C = '[ბგდვზთკლმნპჟრსტფქღყშჩცძწჭხჯჰ]';
    this.V = '[აეიოუ]';
    this.char = '[ა-ჰ]';
  }

  countVowels(word) {
    const vowels = 'აეიოუ';
    let count = 0;
    for (let v of vowels) {
      count += (word.match(new RegExp(v, 'g')) || []).length;
    }
    return count;
  }

  _escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _applyRules(w, softhpn, startchar, endchar) {
    const C = this.C, V = this.V, char = this.char;
    let t = w;
    
    t = t.replace(new RegExp(`(${V})(${C})(${C}+)(${V})`, 'gu'), `$1$2${softhpn}$3$4`);
    t = t.replace(new RegExp(`(${V})(${C})(${V})(${C})(${V})`, 'gu'), `$1$2$3${softhpn}$4$5`);
    t = t.replace(new RegExp(`(${C})(${V})(${C})(${V})`, 'gu'), `$1$2${softhpn}$3$4`);
    t = t.replace(new RegExp(`(${V})(${V})(${V})`, 'gu'), `$1$2${softhpn}$3`);
    t = t.replace(new RegExp(`${startchar}(${V})(${C})(${V})(${C})(${V})`, 'gu'), `$1$2$3${softhpn}$4$5`);
    t = t.replace(new RegExp(`${startchar}(${V})(${C})(${V})(${C})(${char})`, 'gu'), `$1$2$3${softhpn}$4$5`);
    t = t.replace(new RegExp(`${startchar}(${C}+)(${V})(${C})(${V})`, 'gu'), `$1$2${softhpn}$3$4`);
    t = t.replace(new RegExp(`${startchar}(${C}+)(${V})(${V})(${char})`, 'gu'), `$1$2${softhpn}$3$4`);
    t = t.replace(new RegExp(`(${char})(${V})(${V})(${C}+)${endchar}`, 'gu'), `$1$2${softhpn}$3$4`);
    t = t.replace(new RegExp(`(${char})(${V})(${C})(${V})${endchar}`, 'gu'), `$1$2${softhpn}$3$4`);
    t = t.replace(new RegExp(`(${V})(${C})(${C}+)(${V})(${C}+)${endchar}`, 'gu'), `$1$2${softhpn}$3$4$5`);
    t = t.replace(new RegExp(`(${char})(${V})(${C})(${V}+)(${C}+)${endchar}`, 'gu'), `$1$2${softhpn}$3$4$5`);
    
    return t;
  }

  hyphenate(word) {
    if (this.countVowels(word) <= 1) return word;
    
    const softhpn = this.hyphenChar;
    const escapedHyphen = this._escapeRegex(softhpn);
    
    let result = this._applyRules(word, softhpn, '^', '$');
    result = this._applyRules(result, softhpn, '^', escapedHyphen);
    result = this._applyRules(result, escapedHyphen, '$');
    result = this._applyRules(result, escapedHyphen, escapedHyphen);
    result = result.replace(new RegExp(`${escapedHyphen}+`, 'gu'), softhpn);
    
    return result;
  }

  getSyllables(word) {
    return this.hyphenate(word).split(this.hyphenChar);
  }

  hyphenateText(text) {
    const words = text.split(' ');
    return words.map(w => this.hyphenate(w)).join(' ');
  }
}