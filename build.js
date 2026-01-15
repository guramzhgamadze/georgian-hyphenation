// Simple build script for NPM package
const fs = require('fs');
const path = require('path');

console.log('Building georgian-hyphenation for NPM...');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy JavaScript source to dist
const srcFile = path.join(__dirname, 'src', 'javascript', 'index.js');
const destFile = path.join(distDir, 'index.js');

fs.copyFileSync(srcFile, destFile);
console.log('✅ Copied index.js to dist/');

// Create TypeScript definitions
const dtsContent = `
/**
 * Georgian Language Hyphenation Library
 * ქართული ენის დამარცვლის ბიბლიოთეკა
 */

export class GeorgianHyphenator {
  /**
   * Create a Georgian hyphenator
   * @param hyphenChar - Character to use for hyphenation points (default: U+00AD soft hyphen)
   */
  constructor(hyphenChar?: string);

  /**
   * Hyphenate a Georgian word
   * @param word - Georgian word to hyphenate
   * @returns Word with hyphenation points inserted
   */
  hyphenate(word: string): string;

  /**
   * Get syllables for a Georgian word
   * @param word - Georgian word
   * @returns Array of syllables
   */
  getSyllables(word: string): string[];

  /**
   * Hyphenate entire text
   * @param text - Georgian text
   * @returns Hyphenated text
   */
  hyphenateText(text: string): string;
}

/**
 * Convert word to TeX pattern format
 * @param word - Georgian word
 * @returns TeX pattern
 */
export function toTeXPattern(word: string): string;

/**
 * Convert word to Hunspell format
 * @param word - Georgian word
 * @returns Hunspell format
 */
export function toHunspellFormat(word: string): string;
`;

const dtsFile = path.join(distDir, 'index.d.ts');
fs.writeFileSync(dtsFile, dtsContent.trim());
console.log('✅ Created index.d.ts');

console.log('✅ Build complete!');