import GeorgianHyphenator from './src/javascript/index.js';

const hyphenator = new GeorgianHyphenator();

// Test with compound word (should preserve hyphen)
console.log('Testing: მაგ-რამ');
console.log('Result:', hyphenator.hyphenate('მაგ-რამ'));

// Test regular word
console.log('\nTesting: საქართველო');
console.log('Result:', hyphenator.hyphenate('საქართველო'));

console.log('\n✅ Tests completed');