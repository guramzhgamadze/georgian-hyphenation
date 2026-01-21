from georgian_hyphenation import GeorgianHyphenator

h = GeorgianHyphenator('-')

tests = [
    ('საქართველო', 'სა-ქარ-თვე-ლო'),
    ('იარაღი', 'ია-რა-ღი'),
    ('ბარბი', 'ბარ-ბი'),
    ('არა', 'არა'),
    ('კომპიუტერი', 'კომ-პი-უ-ტე-რი'),
]

print('Georgian Hyphenation v2.0 Test')
print('='*50)

for word, expected in tests:
    result = h.hyphenate(word)
    status = '✅' if result == expected else '❌'
    print(f'{status} {word:15} → {result:20} (expected: {expected})')

print('='*50)
print('All tests passed!' if all(h.hyphenate(w) == e for w, e in tests) else 'Some tests failed!')