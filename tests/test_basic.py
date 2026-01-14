# -*- coding: utf-8 -*-
"""
Test Suite for Georgian Hyphenation
ქართული დამარცვლის ტესტირება
"""

import re
from functools import reduce

class GeorgianHyphenator:
    def __init__(self, hyphen_char='\u00AD'):
        self.hyphen_char = hyphen_char
        self.C = '[ბგდვზთკლმნპჟრსტფქღყშჩცძწჭხჯჰ]'
        self.V = '[აეიოუ]'
        self.char = '[ა-ჰ]'
    
    def count_vowels(self, word):
        vowel_counts = [word.count(x) for x in "აეიოუ"]
        return reduce(lambda x, y: x + y, vowel_counts, 0)
    
    def _apply_rules(self, w, softhpn, startchar, endchar):
        C, V, char = self.C, self.V, self.char
        t = w
        
        t = re.sub(f"({V})({C})({C}+)({V})", rf"\1\2{softhpn}\3\4", t, flags=re.U)
        t = re.sub(f"({V})({C})({V})({C})({V})", rf"\1\2\3{softhpn}\4\5", t, flags=re.U)
        t = re.sub(f"({C})({V})({C})({V})", rf"\1\2{softhpn}\3\4", t, flags=re.U)
        t = re.sub(f"({V})({V})({V})", rf"\1\2{softhpn}\3", t, flags=re.U)
        t = re.sub(f"{startchar}({V})({C})({V})({C})({V})", rf"\1\2\3{softhpn}\4\5", t, flags=re.U)
        t = re.sub(f"{startchar}({V})({C})({V})({C})({char})", rf"\1\2\3{softhpn}\4\5", t, flags=re.U)
        t = re.sub(f"{startchar}({C}+)({V})({C})({V})", rf"\1\2{softhpn}\3\4", t, flags=re.U)
        t = re.sub(f"{startchar}({C}+)({V})({V})({char})", rf"\1\2{softhpn}\3\4", t, flags=re.U)
        t = re.sub(f"({char})({V})({V})({C}+){endchar}", rf"\1\2{softhpn}\3\4", t, flags=re.U)
        t = re.sub(f"({char})({V})({C})({V}){endchar}", rf"\1\2{softhpn}\3\4", t, flags=re.U)
        t = re.sub(f"({V})({C})({C}+)({V})({C}+){endchar}", rf"\1\2{softhpn}\3\4\5", t, flags=re.U)
        t = re.sub(f"({char})({V})({C})({V}+)({C}+){endchar}", rf"\1\2{softhpn}\3\4\5", t, flags=re.U)
        
        return t
    
    def hyphenate(self, word):
        if self.count_vowels(word) <= 1:
            return word
        
        softhpn = self.hyphen_char
        escapedHyphen = re.escape(softhpn)
        
        result = self._apply_rules(word, softhpn, '^', '$')
        result = self._apply_rules(result, softhpn, '^', escapedHyphen)
        result = self._apply_rules(result, escapedHyphen, '$')
        result = self._apply_rules(result, escapedHyphen, escapedHyphen)
        result = re.sub(f"{escapedHyphen}+", softhpn, result, flags=re.U)
        
        return result
    
    def getSyllables(self, word):
        return self.hyphenate(word).split(self.hyphen_char)


# ==================== TEST CASES ====================

def run_tests():
    """Run comprehensive tests"""
    
    print("=" * 70)
    print("ქართული დამარცვლის ტესტირება")
    print("Georgian Hyphenation Testing")
    print("=" * 70)
    print()
    
    hyphenator = GeorgianHyphenator('-')
    
    # Test 1: Basic words
    print("TEST 1: ძირითადი სიტყვები (Basic Words)")
    print("-" * 70)
    
    test_words = {
        "საქართველო": ["სა", "ქარ", "თვე", "ლო"],
        "მთავრობა": ["მთავ", "რო", "ბა"],
        "დედაქალაქი": ["დე", "და", "ქა", "ლა", "ქი"],
        "ტელევიზორი": ["ტე", "ლე", "ვი", "ზო", "რი"],
        "კომპიუტერი": ["კომ", "პი", "უ", "ტე", "რი"],
    }
    
    passed = 0
    failed = 0
    
    for word, expected in test_words.items():
        result = hyphenator.getSyllables(word)
        status = "✅ PASS" if result == expected else "❌ FAIL"
        
        if result == expected:
            passed += 1
        else:
            failed += 1
        
        print(f"{status} | {word:20} → {'-'.join(result):30}")
        if result != expected:
            print(f"       Expected: {'-'.join(expected)}")
    
    print()
    
    # Test 2: Edge cases
    print("TEST 2: სპეციალური შემთხვევები (Edge Cases)")
    print("-" * 70)
    
    edge_cases = {
        "ა": ["ა"],           # ერთი ხმოვანი
        "და": ["და"],         # ორი ასო
        "ვარ": ["ვარ"],       # მოკლე სიტყვა
        "მე": ["მე"],          # ორი ასო
        "საქართველოს": None,  # დასტესტება
    }
    
    for word, expected in edge_cases.items():
        result = hyphenator.getSyllables(word)
        print(f"    {word:20} → {'-'.join(result)}")
    
    print()
    
    # Test 3: Long words
    print("TEST 3: გრძელი სიტყვები (Long Words)")
    print("-" * 70)
    
    long_words = [
        "უნივერსიტეტი",
        "დამოუკიდებლობა",
        "გათვითცნობიერება",
        "განათლება",
        "პარლამენტი",
    ]
    
    for word in long_words:
        result = hyphenator.getSyllables(word)
        print(f"    {word:20} → {'-'.join(result):30} [{len(result)} მარცვალი]")
    
    print()
    
    # Test 4: Complex consonant clusters
    print("TEST 4: რთული თანხმოვნების კლასტერები (Complex Clusters)")
    print("-" * 70)
    
    complex_words = [
        "მწვანე",
        "ცხვარი",
        "მთვარე",
        "გრძელი",
        "სწრაფად",
    ]
    
    for word in complex_words:
        result = hyphenator.getSyllables(word)
        print(f"    {word:20} → {'-'.join(result)}")
    
    print()
    
    # Test 5: Sentences
    print("TEST 5: წინადადებები (Sentences)")
    print("-" * 70)
    
    sentences = [
        "საქართველო არის ლამაზი ქვეყანა",
        "თბილისი არის დედაქალაქი",
        "ქართული ენა უნიკალურია",
    ]
    
    for sentence in sentences:
        words = sentence.split()
        result_words = [hyphenator.hyphenate(w) for w in words]
        print(f"    {sentence}")
        print(f"    → {' '.join(result_words)}")
        print()
    
    # Test 6: Performance test
    print("TEST 6: წარმადობის ტესტი (Performance Test)")
    print("-" * 70)
    
    import time
    
    test_text = """
    საქართველო არის ძალიან ლამაზი ქვეყანა კავკასიაში. 
    თბილისი არის დედაქალაქი და ძალიან საინტერესო ქალაქია.
    ქართული ენა უნიკალურია და აქვს საკუთარი დამწერლობა.
    ქართველები გამორჩეულნი არიან თავიანთი სტუმართმოყვარეობით.
    """ * 10  # გაამრავლე 10-ჯერ
    
    words = test_text.split()
    
    start_time = time.time()
    for word in words:
        hyphenator.hyphenate(word)
    end_time = time.time()
    
    elapsed = (end_time - start_time) * 1000  # მილიწამებში
    
    print(f"    დამუშავებული სიტყვები: {len(words)}")
    print(f"    დრო: {elapsed:.2f} ms")
    print(f"    სიჩქარე: {len(words) / (elapsed / 1000):.0f} სიტყვა/წამში")
    
    print()
    
    # Test 7: Validation tests
    print("TEST 7: ვალიდაცია (Validation)")
    print("-" * 70)
    
    validation_checks = []
    
    # Check 1: ყველა მარცვალში უნდა იყოს ხმოვანი
    for word, expected in test_words.items():
        syllables = hyphenator.getSyllables(word)
        for syl in syllables:
            has_vowel = any(v in syl for v in 'აეიოუ')
            if not has_vowel:
                validation_checks.append(f"❌ {word}: მარცვალი '{syl}' არ შეიცავს ხმოვანს")
    
    # Check 2: მარცვლების შეერთება უნდა იძლეოდეს თავდაპირველ სიტყვას
    for word, expected in test_words.items():
        syllables = hyphenator.getSyllables(word)
        reconstructed = ''.join(syllables)
        if reconstructed != word:
            validation_checks.append(f"❌ {word}: {''.join(syllables)} ≠ {word}")
    
    if not validation_checks:
        print("    ✅ ყველა ვალიდაციის ტესტი გავლილია!")
    else:
        for check in validation_checks:
            print(f"    {check}")
    
    print()
    
    # Summary
    print("=" * 70)
    print("შედეგები (SUMMARY)")
    print("=" * 70)
    print(f"✅ გავლილი: {passed}")
    print(f"❌ ჩავარდნილი: {failed}")
    print(f"📊 წარმატების პროცენტი: {(passed/(passed+failed)*100):.1f}%")
    print("=" * 70)
    
    return passed, failed


# ==================== INTERACTIVE TESTING ====================

def interactive_test():
    """Interactive testing mode"""
    print("\n" + "=" * 70)
    print("ინტერაქტიული რეჟიმი (Interactive Mode)")
    print("=" * 70)
    print("შეიყვანეთ სიტყვა ან 'exit' გასასვლელად\n")
    
    hyphenator = GeorgianHyphenator('-')
    
    while True:
        word = input("სიტყვა: ").strip()
        
        if word.lower() == 'exit':
            break
        
        if not word:
            continue
        
        syllables = hyphenator.getSyllables(word)
        hyphenated = hyphenator.hyphenate(word)
        
        print(f"  დამარცვლილი: {hyphenated}")
        print(f"  მარცვლები: {syllables}")
        print(f"  რაოდენობა: {len(syllables)}")
        print()


# ==================== COMPARISON WITH EXPECTED RESULTS ====================

def compare_with_manual():
    """Compare with manually verified results"""
    print("\n" + "=" * 70)
    print("შედარება მანუალურ შედეგებთან (Manual Verification)")
    print("=" * 70)
    print()
    
    hyphenator = GeorgianHyphenator('-')
    
    # ეს სიტყვები უნდა იყოს მანუალურად გადამოწმებული
    manual_results = {
        "საქართველო": "სა-ქარ-თვე-ლო",
        "დედაქალაქი": "დე-და-ქა-ლა-ქი",
        "გათვითცნობიერება": "გათ-ვით-ცნო-ბი-ე-რე-ბა",
        "უნივერსიტეტი": "უ-ნი-ვერ-სი-ტე-ტი",
        "პარლამენტი": "პარ-ლა-მენ-ტი",
    }
    
    matches = 0
    mismatches = 0
    
    for word, expected in manual_results.items():
        result = hyphenator.hyphenate(word)
        
        if result == expected:
            print(f"✅ {word:20} → {result}")
            matches += 1
        else:
            print(f"❌ {word:20}")
            print(f"   ალგორითმი: {result}")
            print(f"   მოსალოდნელი: {expected}")
            mismatches += 1
    
    print()
    print(f"დამთხვევები: {matches}/{matches + mismatches}")


# ==================== MAIN ====================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'interactive':
        interactive_test()
    elif len(sys.argv) > 1 and sys.argv[1] == 'compare':
        compare_with_manual()
    else:
        # Run all tests
        run_tests()
        
        # Ask if user wants interactive mode
        print("\nგსურთ ინტერაქტიული რეჟიმი? (y/n): ", end='')
        choice = input().strip().lower()
        
        if choice == 'y':
            interactive_test()