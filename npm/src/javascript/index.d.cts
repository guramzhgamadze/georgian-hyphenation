/**
 * Georgian Hyphenation Library — type declarations (CommonJS build)
 */

declare class GeorgianHyphenator {
  /**
   * @param hyphenChar Character inserted at break points (default: soft hyphen U+00AD)
   */
  constructor(hyphenChar?: string, options?: GeorgianHyphenator.Options);

  hyphenChar: string;
  debug: boolean;
  vowels: string;
  leftMin: number;
  rightMin: number;
  harmonicClusters: Set<string>;
  dictionary: Map<string, string>;
  dictionaryLoaded: boolean;

  loadLibrary(data: Record<string, string>): void;
  loadDefaultLibrary(source?: string): Promise<void>;
  hyphenate(word: string): string;
  applyAlgorithm(word: string): string;
  getSyllables(word: string): string[];
  hyphenateText(text: string): string;
  unhyphenate(text: string): string;
  countSyllables(word: string): number;
  getHyphenationPoints(word: string): number;
  isGeorgian(text: string): boolean;
  canHyphenate(word: string): boolean;
  hyphenateWords(words: string[]): string[];
  hyphenateHTML(html: string): string;
  setLeftMin(value: number): this;
  setRightMin(value: number): this;
  setHyphenChar(char: string): this;
  setDebug(value: boolean): this;
  addException(word: string, hyphenated: string): this;
  removeException(word: string): boolean;
  exportDictionary(): Record<string, string>;
  getDictionarySize(): number;
  addHarmonicCluster(cluster: string): this;
  removeHarmonicCluster(cluster: string): boolean;
  getHarmonicClusters(): string[];
}

declare namespace GeorgianHyphenator {
  interface Options {
    /** Log dictionary loading details to the console (default: false) */
    debug?: boolean;
  }
}

export = GeorgianHyphenator;
