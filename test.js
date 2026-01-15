// Simple test for NPM package
const { GeorgianHyphenator } = require('./dist/index.js');

console.log('Testing georgian-hyphenation NPM package...\n');

try {
  // Test 1: Basic hyphenation
  const hyphenator = new GeorgianHyphenator('-');
  const word = 'საქართველო';
  const result = hyphenator.hyphenate(word);
  
  console.log(`✅ hyphenate("${word}") = "${result}"`);
  
  // Test 2: Get syllables
  const syllables = hyphenator.getSyllables(word);
  console.log(`✅ getSyllables("${word}") = [${syllables.map(s => `"${s}"`).join(', ')}]`);
  
  // Test 3: Multiple words
  const text = 'საქართველო არის ლამაზი ქვეყანა';
  const hyphenated = hyphenator.hyphenateText(text);
  console.log(`✅ hyphenateText works: "${hyphenated}"`);
  
  console.log('\n✅ All tests passed!');
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}