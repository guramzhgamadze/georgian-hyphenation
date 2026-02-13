# -*- coding: utf-8 -*-
"""
Georgian Hyphenation v2.2.7 - Python Test Script
Tests all functions including 17 new utility functions
"""

# Import from the package (adjust path if testing locally)
try:
    from georgian_hyphenation import GeorgianHyphenator
except ImportError:
    # For local testing before installation
    import sys
    import os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
    from georgian_hyphenation import GeorgianHyphenator


def print_section(title):
    """Print section header"""
    print('\n' + '='*70)
    print(f' {title}')
    print('='*70)


def test_core_functions():
    """Test original core functions"""
    print_section('1. CORE FUNCTIONS (Original)')
    
    h = GeorgianHyphenator()
    
    print(f"hyphenate('გამარჯობა'): {h.hyphenate('გამარჯობა')}")
    print(f"get_syllables('ქართული'): {h.get_syllables('ქართული')}")
    print(f"hyphenate_text('ეს არის ტექსტი'): {h.hyphenate_text('ეს არის ტექსტი')}")


def test_new_utility_functions():
    """Test new utility functions"""
    print_section('2. NEW UTILITY FUNCTIONS (v2.2.7)')
    
    h = GeorgianHyphenator()
    
    print(f"count_syllables('გამარჯობა'): {h.count_syllables('გამარჯობა')}")
    print(f"get_hyphenation_points('გამარჯობა'): {h.get_hyphenation_points('გამარჯობა')}")
    print(f"is_georgian('გამარჯობა'): {h.is_georgian('გამარჯობა')}")
    print(f"is_georgian('hello'): {h.is_georgian('hello')}")
    print(f"can_hyphenate('გა'): {h.can_hyphenate('გა')}")
    print(f"can_hyphenate('გამარ'): {h.can_hyphenate('გამარ')}")
    
    hyphenated = "გა\u00ADმარ\u00ADჯო\u00ADბა"
    print(f"unhyphenate('{hyphenated}'): {h.unhyphenate(hyphenated)}")
    
    words = ['ქართული', 'ენა', 'მშვენიერია']
    print(f"hyphenate_words({words}): {h.hyphenate_words(words)}")


def test_configuration():
    """Test configuration methods"""
    print_section('3. CONFIGURATION METHODS (v2.2.7)')
    
    h = GeorgianHyphenator()
    
    print(f"Default left_min: {h.left_min}")
    print(f"Default right_min: {h.right_min}")
    
    h.set_left_min(3).set_right_min(3)
    print(f"\nAfter set_left_min(3).set_right_min(3):")
    print(f"  left_min: {h.left_min}")
    print(f"  right_min: {h.right_min}")
    
    h.set_hyphen_char('-')
    print(f"\nAfter set_hyphen_char('-'):")
    print(f"  hyphenate('გამარჯობა'): {h.hyphenate('გამარჯობა')}")


def test_dictionary_management():
    """Test dictionary management"""
    print_section('4. DICTIONARY MANAGEMENT (v2.2.7)')
    
    h = GeorgianHyphenator()
    
    print(f"Initial dictionary size: {h.get_dictionary_size()}")
    
    h.add_exception('ტესტი', 'ტეს-ტი')
    print(f"\nAfter adding 'ტესტი':")
    print(f"  Dictionary size: {h.get_dictionary_size()}")
    print(f"  hyphenate('ტესტი'): {h.hyphenate('ტესტი')}")
    
    h.remove_exception('ტესტი')
    print(f"\nAfter removing 'ტესტი':")
    print(f"  Dictionary size: {h.get_dictionary_size()}")
    print(f"  hyphenate('ტესტი'): {h.hyphenate('ტესტი')}")


def test_html_hyphenation():
    """Test HTML hyphenation"""
    print_section('5. HTML HYPHENATION (v2.2.7)')
    
    h = GeorgianHyphenator()
    
    html = '<p>ეს არის ქართული ტექსტი <code>console.log()</code> და კიდევ ტექსტი</p>'
    print('Input HTML:')
    print(f'  {html}')
    print('\nOutput HTML:')
    print(f'  {h.hyphenate_html(html)}')


def test_harmonic_clusters():
    """Test harmonic cluster management"""
    print_section('6. HARMONIC CLUSTER MANAGEMENT (v2.2.7)')
    
    h = GeorgianHyphenator()
    
    clusters = h.get_harmonic_clusters()
    print(f"Total clusters: {len(clusters)}")
    print(f"First 10 clusters: {clusters[:10]}")
    
    h.add_harmonic_cluster('ტვ')
    print(f"\nAfter adding 'ტვ': {'ტვ' in h.get_harmonic_clusters()}")
    
    h.remove_harmonic_cluster('ტვ')
    print(f"After removing 'ტვ': {'ტვ' in h.get_harmonic_clusters()}")


def test_comprehensive_analysis():
    """Test comprehensive word analysis"""
    print_section('7. COMPREHENSIVE WORD ANALYSIS')
    
    h = GeorgianHyphenator()
    
    test_words = [
        'გამარჯობა',
        'ქართული',
        'კომპიუტერი',
        'უნივერსიტეტი',
        'მოგზაურობა'
    ]
    
    for word in test_words:
        print(f"\n'{word}':")
        print(f"  Hyphenated: {h.hyphenate(word)}")
        print(f"  Syllables: {h.get_syllables(word)}")
        print(f"  Count: {h.count_syllables(word)} syllables")
        print(f"  Points: {h.get_hyphenation_points(word)} hyphen points")


def test_method_chaining():
    """Test method chaining"""
    print_section('8. METHOD CHAINING (v2.2.7)')
    
    h = (GeorgianHyphenator()
         .set_left_min(2)
         .set_right_min(2)
         .set_hyphen_char('-')
         .add_exception('ტესტი', 'ტეს-ტი'))
    
    print('Chained configuration:')
    print(f"  left_min: {h.left_min}")
    print(f"  right_min: {h.right_min}")
    print(f"  hyphen_char: '{h.hyphen_char}'")
    print(f"  hyphenate('ტესტი'): {h.hyphenate('ტესტი')}")
    print(f"  hyphenate('გამარჯობა'): {h.hyphenate('გამარჯობა')}")


def test_with_dictionary():
    """Test with loaded dictionary"""
    print_section('9. WITH DICTIONARY (if available)')
    
    h = GeorgianHyphenator()
    h.load_default_library()
    
    print(f"Dictionary loaded: {h.get_dictionary_size()} words")
    
    # Test some words that might be in dictionary
    test_words = ['კომპიუტერი', 'საქართველო', 'თბილისი']
    for word in test_words:
        result = h.hyphenate(word)
        in_dict = word in h.dictionary
        source = '📖 Dictionary' if in_dict else '🤖 Algorithm'
        print(f"{source}: {word} → {result}")


def main():
    """Run all tests"""
    print('\n' + '🧪 Georgian Hyphenation Library v2.2.7 - Python Test'.center(70))
    print('Testing all functions including 17 new utilities\n')
    
    try:
        test_core_functions()
        test_new_utility_functions()
        test_configuration()
        test_dictionary_management()
        test_html_hyphenation()
        test_harmonic_clusters()
        test_comprehensive_analysis()
        test_method_chaining()
        test_with_dictionary()
        
        print('\n' + '='*70)
        print('✅ All tests completed successfully!'.center(70))
        print('='*70 + '\n')
        
    except Exception as e:
        print(f'\n❌ Error during testing: {e}')
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()