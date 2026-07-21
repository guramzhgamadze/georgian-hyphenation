/**
 * Georgian Hyphenation Library — type declarations (ES module build)
 */

export interface GeorgianHyphenatorOptions {
  /** Log dictionary loading details to the console (default: false) */
  debug?: boolean;
}

export default class GeorgianHyphenator {
  /**
   * @param hyphenChar Character inserted at break points (default: soft hyphen U+00AD)
   */
  constructor(hyphenChar?: string, options?: GeorgianHyphenatorOptions);

  hyphenChar: string;
  debug: boolean;
  vowels: string;
  leftMin: number;
  rightMin: number;
  harmonicClusters: Set<string>;
  dictionary: Map<string, string>;
  dictionaryLoaded: boolean;

  /** Load a custom exception dictionary ({ word: "hy-phen-at-ed" }) */
  loadLibrary(data: Record<string, string>): void;

  /**
   * Load the bundled exception dictionary.
   * @param source Optional custom URL (browser) or file path (Node.js)
   */
  loadDefaultLibrary(source?: string): Promise<void>;

  /** Hyphenate a single word (leading/trailing punctuation is preserved) */
  hyphenate(word: string): string;

  /** Apply the phonetic algorithm directly, bypassing the dictionary */
  applyAlgorithm(word: string): string;

  /** Get syllables as an array */
  getSyllables(word: string): string[];

  /** Hyphenate every Georgian word in a text */
  hyphenateText(text: string): string;

  /** Remove all hyphenation characters from text */
  unhyphenate(text: string): string;

  /** Count syllables in a word */
  countSyllables(word: string): number;

  /** Number of hyphenation points in a word */
  getHyphenationPoints(word: string): number;

  /** True if text consists only of Georgian (Mkhedruli) characters */
  isGeorgian(text: string): boolean;

  /** True if the word meets the minimum length for hyphenation */
  canHyphenate(word: string): boolean;

  /** Hyphenate multiple words at once */
  hyphenateWords(words: string[]): string[];

  /** Hyphenate HTML while preserving tags; skips script/style/code/pre/textarea */
  hyphenateHTML(html: string): string;

  /** Minimum characters before the first hyphen (default: 2) */
  setLeftMin(value: number): this;

  /** Minimum characters after the last hyphen (default: 2) */
  setRightMin(value: number): this;

  /** Change the hyphen character */
  setHyphenChar(char: string): this;

  /** Enable or disable debug logging */
  setDebug(value: boolean): this;

  /** Add a hyphenation exception (use '-' for breaks in the hyphenated form) */
  addException(word: string, hyphenated: string): this;

  /** Remove a hyphenation exception; true if it existed */
  removeException(word: string): boolean;

  /** Export the dictionary as a plain object */
  exportDictionary(): Record<string, string>;

  /** Number of words in the dictionary */
  getDictionarySize(): number;

  /** Add a custom two-character harmonic cluster */
  addHarmonicCluster(cluster: string): this;

  /** Remove a harmonic cluster; true if it existed */
  removeHarmonicCluster(cluster: string): boolean;

  /** All harmonic clusters */
  getHarmonicClusters(): string[];
}
