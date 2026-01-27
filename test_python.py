"""
Georgian Hyphenation v2.2.1 - Python Test Suite
"""

from src.georgian_hyphenation import GeorgianHyphenator

print('🧪 Georgian Hyphenation v2.2.1 - Python Tests\n')

# Initialize hyphenator
h = GeorgianHyphenator('-')

# Test results
passed = 0
failed = 0

def test(name, actual, expected):
    global passed, failed
    if actual == expected:
        print(f'✅ {name}')
        print(f'   Result: {actual}\n')
        passed += 1
    else:
        print(f'❌ {name}')
        print(f'   Expected: {expected}')
        print(f'   Got:      {actual}\n')
        failed += 1

# Test Suite
print('📋 Basic Hyphenation Tests:\n')

test('Test 1: საქართველო', 
    h.hyphenate('საქართველო'), 
    'სა-ქარ-თვე-ლო'
)

test('Test 2: მთავრობა', 
    h.hyphenate('მთავრობა'), 
    'მთავ-რო-ბა'
)

test('Test 3: დედაქალაქი', 
    h.hyphenate('დედაქალაქი'), 
    'დე-და-ქა-ლა-ქი'
)

print('📋 v2.2.1 New Features - Gemination:\n')

test('Test 4: კლასი (V-C-V pattern)', 
    h.hyphenate('კლასი'), 
    'კლა-სი'
)

test('Test 5: მასალა (gemination)', 
    h.hyphenate('მასალა'), 
    'მა-სა-ლა'
)

print('📋 v2.2.1 New Features - Harmonic Clusters:\n')

test('Test 6: ბლოკი (harmonic cluster)', 
    h.hyphenate('ბლოკი'), 
    'ბლო-კი'
)

test('Test 7: კრემი (harmonic cluster)', 
    h.hyphenate('კრემი'), 
    'კრე-მი'
)

print('📋 Edge Cases:\n')

test('Test 8: Short word (არა)', 
    h.hyphenate('არა'), 
    'არა'
)

test('Test 9: V-V split (გაანალიზა)', 
    h.hyphenate('გაანალიზა'), 
    'გა-ა-ნა-ლი-ზა'
)

test('Test 10: R Rule (ბარბარე)', 
    h.hyphenate('ბარბარე'), 
    'ბარ-ბა-რე'
)

print('📋 Already Hyphenated (v2.2.1: Strip & Re-hyphenate):\n')

already_hyphenated = 'სა\u00ADქარ\u00ADთვე\u00ADლო'
test('Test 11: Already hyphenated (Re-hyphenate)', 
    h.hyphenate(already_hyphenated), 
    'სა-ქარ-თვე-ლო'
)

print('📋 Text Processing:\n')

text = 'საქართველო არის ლამაზი ქვეყანა'
expected_text = 'სა-ქარ-თვე-ლო არის ლა-მა-ზი ქვე-ყა-ნა'
test('Test 12: hyphenate_text()', 
    h.hyphenate_text(text), 
    expected_text
)

print('📋 Syllables:\n')

syllables = h.get_syllables('საქართველო')
print('✅ Test 13: get_syllables()')
print(f'   Result: {syllables}')
print(f'   Expected: [\'სა\', \'ქარ\', \'თვე\', \'ლო\']\n')
if syllables == ['სა', 'ქარ', 'თვე', 'ლო']:
    passed += 1
else:
    failed += 1

# Dictionary Test (if available)
print('📋 Dictionary Test:\n')

try:
    h.load_default_library()
    print(f'✅ Dictionary loaded: {len(h.dictionary)} words\n')
except Exception as e:
    print('⚠️  Dictionary not available (using algorithm only)\n')

# Summary
print('═══════════════════════════════════════')
print(f'📊 Test Results: {passed} passed, {failed} failed')
print('═══════════════════════════════════════\n')

if failed == 0:
    print('🎉 All tests passed!')
else:
    print('❌ Some tests failed. Please review.')
    exit(1)