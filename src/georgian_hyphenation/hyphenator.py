# -*- coding: utf-8 -*-
"""
Georgian Language Hyphenation Library (v2.0 - Academic Logic)
ქართული ენის დამარცვლის ბიბლიოთეკა
Logic: Phonological distance analysis & Anti-Orphan protection
Author: Guram Zhgamadze
"""

class GeorgianHyphenator:
    """
    Georgian word hyphenation based on phonological distance analysis
    """
    
    def __init__(self, hyphen_char='\u00AD'):
        """
        Initialize hyphenator
        
        Args:
            hyphen_char (str): Character to use for hyphenation (default: soft hyphen U+00AD)
        """
        self.hyphen_char = hyphen_char
        self.vowels = 'აეიოუ'
    
    def hyphenate(self, word):
        """
        Hyphenate a single Georgian word
        
        Args:
            word (str): Georgian word to hyphenate
            
        Returns:
            str: Word with hyphenation points inserted
        """
        # Rule 1: Words shorter than 4 chars are never hyphenated
        if len(word) < 4:
            return word
        
        # Find all vowel indices
        vowel_indices = [i for i, char in enumerate(word) if char in self.vowels]
        
        # Rule 2: Need at least 2 vowels to hyphenate
        if len(vowel_indices) < 2:
            return word
        
        insert_points = []
        
        # Analyze distance between consecutive vowels
        for i in range(len(vowel_indices) - 1):
            v1 = vowel_indices[i]
            v2 = vowel_indices[i + 1]
            distance = v2 - v1 - 1  # Number of consonants between vowels
            between_substring = word[v1 + 1:v2]
            
            candidate_pos = -1
            
            if distance == 0:
                # Case V-V: Split between vowels (hiatus)
                candidate_pos = v1 + 1
            elif distance == 1:
                # Case V-C-V: Split before consonant
                candidate_pos = v1 + 1
            else:
                # Case V-CC...-V: Cluster handling
                # 'R' Rule: If cluster starts with 'რ', keep it left
                if between_substring[0] == 'რ':
                    candidate_pos = v1 + 2
                else:
                    candidate_pos = v1 + 2
            
            # Anti-Orphan Filter: Ensure at least 2 chars on both sides
            if candidate_pos >= 2 and (len(word) - candidate_pos) >= 2:
                insert_points.append(candidate_pos)
        
        # Reconstruct word with hyphens
        result = list(word)
        for pos in reversed(insert_points):
            result.insert(pos, self.hyphen_char)
        
        return ''.join(result)
    
    def get_syllables(self, word):
        """
        Get array of syllables for a word
        
        Args:
            word (str): Georgian word
            
        Returns:
            list: List of syllables
        """
        temp_hyphenator = GeorgianHyphenator('-')
        return temp_hyphenator.hyphenate(word).split('-')
    
    def hyphenate_text(self, text):
        """
        Hyphenate entire text (preserves punctuation)
        
        Args:
            text (str): Georgian text
            
        Returns:
            str: Hyphenated text
        """
        import re
        # Split by non-Georgian characters to preserve punctuation
        parts = re.split(r'([^ა-ჰ]+)', text)
        
        return ''.join(
            self.hyphenate(part) if re.search(r'[ა-ჰ]{4,}', part) else part
            for part in parts
        )


def to_tex_pattern(word):
    """
    Convert word to TeX pattern format
    
    Args:
        word (str): Georgian word
        
    Returns:
        str: TeX pattern (e.g., .გ1ა1ნ1ა1თ1ლე1ბა.)
    """
    hyphenator = GeorgianHyphenator()
    syllables = hyphenator.get_syllables(word)
    if len(syllables) <= 1:
        return f'.{word}.'
    return '.' + '1'.join(syllables) + '.'


def to_hunspell_format(word):
    """
    Convert word to Hunspell dictionary format
    
    Args:
        word (str): Georgian word
        
    Returns:
        str: Hunspell format (syllable=syllable)
    """
    hyphenator = GeorgianHyphenator()
    syllables = hyphenator.get_syllables(word)
    return '='.join(syllables)