# -*- coding: utf-8 -*-
"""
Georgian Hyphenation Library v2.2.7
ქართული ენის დამარცვლის ბიბლიოთეკა

Enhanced with 17+ utility functions
- Hybrid Engine: Algorithm + Dictionary
- Harmonic Clusters Support
- Gemination Handling
- HTML-aware hyphenation
- Configurable settings with method chaining
- Dictionary management
- O(1) Cluster Lookup with Set
- Preserves compound word hyphens

Author: Guram Zhgamadze
"""

import json
import os
import re
from typing import List, Dict, Set, Optional


class GeorgianHyphenator:
    """
    Georgian language hyphenation with hybrid engine
    
    Features:
    - Phonological distance analysis
    - Dictionary-based exception handling
    - Harmonic cluster awareness
    - Gemination (double consonant) handling
    - Anti-orphan protection
    - Preserves compound word hyphens
    - HTML-aware hyphenation (v2.2.7)
    - 17+ utility functions (v2.2.7)
    """
    
    def __init__(self, hyphen_char: str = '\u00AD'):
        """
        Initialize Georgian Hyphenator
        
        Args:
            hyphen_char: Character to use for hyphenation (default: soft hyphen U+00AD)
        """
        self.hyphen_char = hyphen_char
        self.vowels = 'აეიოუ'
        self.left_min = 2
        self.right_min = 2
        
        # Optimized - Set for O(1) lookup instead of list
        self.harmonic_clusters: Set[str] = {
            'ბლ', 'ბრ', 'ბღ', 'ბზ', 'გდ', 'გლ', 'გმ', 'გნ', 'გვ', 'გზ', 'გრ',
            'დრ', 'თლ', 'თრ', 'თღ', 'კლ', 'კმ', 'კნ', 'კრ', 'კვ', 'მტ', 'პლ', 
            'პრ', 'ჟღ', 'რგ', 'რლ', 'რმ', 'სწ', 'სხ', 'ტკ', 'ტპ', 'ტრ', 'ფლ', 
            'ფრ', 'ფქ', 'ფშ', 'ქლ', 'ქნ', 'ქვ', 'ქრ', 'ღლ', 'ღრ', 'ყლ', 'ყრ', 
            'შთ', 'შპ', 'ჩქ', 'ჩრ', 'ცლ', 'ცნ', 'ცრ', 'ცვ', 'ძგ', 'ძვ', 'ძღ', 
            'წლ', 'წრ', 'წნ', 'წკ', 'ჭკ', 'ჭრ', 'ჭყ', 'ხლ', 'ხმ', 'ხნ', 'ხვ', 'ჯგ'
        }
        
        # Dictionary for exception words
        self.dictionary: Dict[str, str] = {}
    
    def _strip_hyphens(self, text: str) -> str:
        """
        Remove existing hyphenation symbols (Sanitization)
        
        Only removes soft hyphens and zero-width spaces,
        preserves regular hyphens for compound words.
        
        Args:
            text: Input text
            
        Returns:
            Text without soft hyphens or zero-width spaces
        """
        if not text:
            return ''
        # Remove only soft hyphens (\u00AD) and zero-width spaces (\u200B)
        # Preserve regular hyphens (-) for compound words
        text = text.replace('\u00AD', '')  # soft hyphen
        text = text.replace('\u200B', '')  # zero-width space
        
        # Remove custom hyphen_char if it's different from regular hyphen
        if self.hyphen_char not in ['-', '\u00AD']:
            text = text.replace(self.hyphen_char, '')
        
        return text
    
    def load_library(self, data: Dict[str, str]) -> None:
        """
        Load custom dictionary
        
        Args:
            data: Dictionary mapping words to their hyphenation
                  Example: {"საქართველო": "სა-ქარ-თვე-ლო"}
        """
        if data and isinstance(data, dict):
            self.dictionary.update(data)
    
    def load_default_library(self) -> None:
        """
        Load default exceptions dictionary from data/exceptions.json
        
        Works in both development and installed package modes.
        Tries multiple locations to find the data file.
        """
        try:
            package_dir = os.path.dirname(__file__)
            
            # Try multiple possible locations
            locations = [
                # Development mode (root data/ folder)
                os.path.join(package_dir, '..', '..', 'data', 'exceptions.json'),
                # Installed via pip (data/ copied to site-packages)
                os.path.join(os.path.dirname(package_dir), 'data', 'exceptions.json'),
                # Alternative installed location
                os.path.join(package_dir, 'data', 'exceptions.json'),
            ]
            
            data_file = None
            for loc in locations:
                abs_loc = os.path.abspath(loc)
                if os.path.exists(abs_loc):
                    data_file = abs_loc
                    break
            
            if data_file:
                with open(data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.load_library(data)
                    print(f"Georgian Hyphenation v2.2.7: Dictionary loaded ({len(self.dictionary)} words)")
            else:
                print("Georgian Hyphenation v2.2.7: Dictionary not found, using algorithm only")
        
        except Exception as e:
            print(f"Georgian Hyphenation v2.2.7: Could not load dictionary ({e}), using algorithm only")
    
    def hyphenate(self, word: str) -> str:
        """
        Hyphenate a Georgian word
        
        Strips soft hyphens but preserves regular hyphens in compound words.
        
        Args:
            word: Georgian word to hyphenate
            
        Returns:
            Hyphenated word with configured hyphen character
        """
        # Strip only soft hyphens and zero-width spaces
        sanitized_word = self._strip_hyphens(word)
        
        # Remove punctuation for dictionary lookup (but not hyphens)
        clean_word = re.sub(r'[.,/#!$%^&*;:{}=_`~()]', '', sanitized_word)
        
        # Check dictionary first (if available)
        if clean_word in self.dictionary:
            return self.dictionary[clean_word].replace('-', self.hyphen_char)
        
        # Fallback to algorithm
        return self.apply_algorithm(sanitized_word)
    
    def apply_algorithm(self, word: str) -> str:
        """
        Apply hyphenation algorithm
        
        Algorithm Features:
        - Vowel-based syllable detection
        - Gemination (double consonant) handling
        - Harmonic cluster preservation
        - Anti-orphan protection (leftMin=2, rightMin=2)
        
        Args:
            word: Word to hyphenate
            
        Returns:
            Hyphenated word
        """
        # Skip short words
        if len(word) < (self.left_min + self.right_min):
            return word
        
        # Find all vowel positions
        vowel_indices = [i for i, char in enumerate(word) if char in self.vowels]
        
        # Need at least 2 vowels for hyphenation
        if len(vowel_indices) < 2:
            return word
        
        insert_points = []
        
        # Analyze each vowel pair
        for i in range(len(vowel_indices) - 1):
            v1 = vowel_indices[i]
            v2 = vowel_indices[i + 1]
            distance = v2 - v1 - 1  # Number of consonants between vowels
            between_substring = word[v1 + 1:v2]
            
            candidate_pos = -1
            
            if distance == 0:
                # V-V: Split between vowels
                candidate_pos = v1 + 1
            elif distance == 1:
                # V-C-V: Split after vowel
                candidate_pos = v1 + 1
            else:
                # V-CC...C-V: Complex case
                
                # Check for gemination (double consonants)
                double_consonant_index = -1
                for j in range(len(between_substring) - 1):
                    if between_substring[j] == between_substring[j + 1]:
                        double_consonant_index = j
                        break
                
                if double_consonant_index != -1:
                    # Split between double consonants
                    candidate_pos = v1 + 1 + double_consonant_index + 1
                else:
                    # Check for harmonic clusters
                    break_index = -1
                    if distance >= 2:
                        last_two = between_substring[distance - 2:distance]
                        if last_two in self.harmonic_clusters:
                            break_index = distance - 2
                    
                    if break_index != -1:
                        # Split before harmonic cluster
                        candidate_pos = v1 + 1 + break_index
                    else:
                        # Default: split after first consonant
                        candidate_pos = v1 + 2
            
            # Anti-orphan protection: ensure minimum chars on each side
            if candidate_pos >= self.left_min and (len(word) - candidate_pos) >= self.right_min:
                insert_points.append(candidate_pos)
        
        # Insert hyphens (from right to left to maintain positions)
        result = list(word)
        for pos in reversed(insert_points):
            result.insert(pos, self.hyphen_char)
        
        return ''.join(result)
    
    def get_syllables(self, word: str) -> List[str]:
        """
        Get syllables as a list
        
        Args:
            word: Word to split into syllables
            
        Returns:
            List of syllables without hyphen characters
        """
        hyphenated = self.hyphenate(word)
        return hyphenated.split(self.hyphen_char)
    
    def hyphenate_text(self, text: str) -> str:
        """
        Hyphenate entire Georgian text
        
        Preserves:
        - Punctuation
        - Non-Georgian characters
        - Word boundaries
        - Whitespace
        - Regular hyphens in compound words
        
        Args:
            text: Text to hyphenate (can contain multiple words)
            
        Returns:
            Hyphenated text
        """
        if not text:
            return ''
        
        # Strip only soft hyphens and zero-width spaces
        sanitized_text = self._strip_hyphens(text)
        
        # Split text into Georgian words and other characters
        # Pattern captures Georgian letter sequences
        parts = re.split(r'([ა-ჰ]+)', sanitized_text)
        
        result = []
        for part in parts:
            # Only hyphenate Georgian words with 4+ characters
            if len(part) >= 4 and re.search(r'[ა-ჰ]', part):
                result.append(self.hyphenate(part))
            else:
                result.append(part)
        
        return ''.join(result)
    
    # ========================================
    # NEW UTILITY FUNCTIONS (v2.2.7)
    # ========================================
    
    def unhyphenate(self, text: str) -> str:
        """
        Remove all hyphenation from text (public method)
        
        Args:
            text: Text with hyphens to remove
            
        Returns:
            Text without hyphens
        """
        return self._strip_hyphens(text)
    
    def count_syllables(self, word: str) -> int:
        """
        Count syllables in a word
        
        Args:
            word: Word to count syllables
            
        Returns:
            Number of syllables
        """
        return len(self.get_syllables(word))
    
    def get_hyphenation_points(self, word: str) -> int:
        """
        Get the number of hyphenation points in a word
        
        Args:
            word: Word to analyze
            
        Returns:
            Number of hyphenation points (syllables - 1)
        """
        hyphenated = self.hyphenate(word)
        return hyphenated.count(self.hyphen_char)
    
    def is_georgian(self, text: str) -> bool:
        """
        Check if text contains only Georgian characters
        
        Args:
            text: Text to validate
            
        Returns:
            True if only Georgian characters
        """
        if not text:
            return False
        return bool(re.match(r'^[ა-ჰ]+$', text))
    
    def can_hyphenate(self, word: str) -> bool:
        """
        Check if a word can be hyphenated (meets minimum length)
        
        Args:
            word: Word to check
            
        Returns:
            True if word can be hyphenated
        """
        if not word:
            return False
        return len(word) >= (self.left_min + self.right_min)
    
    def hyphenate_words(self, words: List[str]) -> List[str]:
        """
        Hyphenate multiple words at once
        
        Args:
            words: List of words to hyphenate
            
        Returns:
            List of hyphenated words
        """
        return [self.hyphenate(word) for word in words]
    
    def hyphenate_html(self, html: str) -> str:
        """
        Hyphenate HTML content while preserving tags
        Skips <script>, <style>, <code>, <pre> tags
        
        Args:
            html: HTML content to hyphenate
            
        Returns:
            Hyphenated HTML
        """
        if not html:
            return ''
        
        # Tags to skip entirely
        skip_tags = ['script', 'style', 'code', 'pre', 'textarea']
        skip_pattern = '|'.join(skip_tags)
        
        # Store skipped content
        skipped = []
        def store_skip(match):
            skipped.append(match.group(0))
            return f'___SKIP_{len(skipped) - 1}___'
        
        # Replace skip tags with placeholders
        placeholder = re.sub(
            f'<({skip_pattern})[^>]*>.*?</\\1>',
            store_skip,
            html,
            flags=re.IGNORECASE | re.DOTALL
        )
        
        # Split by tags to preserve HTML structure
        parts = re.split(r'(<[^>]+>)', placeholder)
        
        processed = []
        for part in parts:
            # Skip HTML tags themselves
            if part.startswith('<'):
                processed.append(part)
            else:
                # Process text content
                processed.append(self.hyphenate_text(part))
        
        # Restore skipped content
        result = ''.join(processed)
        for i, content in enumerate(skipped):
            result = result.replace(f'___SKIP_{i}___', content)
        
        return result
    
    def set_left_min(self, value: int) -> 'GeorgianHyphenator':
        """
        Set the minimum characters before first hyphen
        
        Args:
            value: Minimum left characters (default: 2)
            
        Returns:
            Self for method chaining
        """
        if isinstance(value, int) and value >= 1:
            self.left_min = value
        return self
    
    def set_right_min(self, value: int) -> 'GeorgianHyphenator':
        """
        Set the minimum characters after last hyphen
        
        Args:
            value: Minimum right characters (default: 2)
            
        Returns:
            Self for method chaining
        """
        if isinstance(value, int) and value >= 1:
            self.right_min = value
        return self
    
    def set_hyphen_char(self, char: str) -> 'GeorgianHyphenator':
        """
        Change the hyphen character
        
        Args:
            char: New hyphen character
            
        Returns:
            Self for method chaining
        """
        if isinstance(char, str) and len(char) > 0:
            self.hyphen_char = char
        return self
    
    def add_exception(self, word: str, hyphenated: str) -> 'GeorgianHyphenator':
        """
        Add a single hyphenation exception to dictionary
        
        Args:
            word: Original word
            hyphenated: Hyphenated version (use '-' for breaks)
            
        Returns:
            Self for method chaining
        """
        if word and hyphenated:
            self.dictionary[word] = hyphenated
        return self
    
    def remove_exception(self, word: str) -> bool:
        """
        Remove a hyphenation exception from dictionary
        
        Args:
            word: Word to remove
            
        Returns:
            True if word was removed
        """
        if word in self.dictionary:
            del self.dictionary[word]
            return True
        return False
    
    def export_dictionary(self) -> Dict[str, str]:
        """
        Export the current dictionary as a plain dict
        
        Returns:
            Dictionary as key-value pairs
        """
        return dict(self.dictionary)
    
    def get_dictionary_size(self) -> int:
        """
        Get the current dictionary size
        
        Returns:
            Number of words in dictionary
        """
        return len(self.dictionary)
    
    def add_harmonic_cluster(self, cluster: str) -> 'GeorgianHyphenator':
        """
        Add a custom harmonic cluster
        
        Args:
            cluster: Two-character cluster (e.g., 'ბრ')
            
        Returns:
            Self for method chaining
        """
        if isinstance(cluster, str) and len(cluster) == 2:
            self.harmonic_clusters.add(cluster)
        return self
    
    def remove_harmonic_cluster(self, cluster: str) -> bool:
        """
        Remove a harmonic cluster
        
        Args:
            cluster: Cluster to remove
            
        Returns:
            True if cluster was removed
        """
        if cluster in self.harmonic_clusters:
            self.harmonic_clusters.remove(cluster)
            return True
        return False
    
    def get_harmonic_clusters(self) -> List[str]:
        """
        Get all harmonic clusters
        
        Returns:
            List of harmonic clusters
        """
        return sorted(list(self.harmonic_clusters))


# Convenience functions for backward compatibility and quick usage

def hyphenate(word: str, hyphen_char: str = '\u00AD') -> str:
    """
    Hyphenate a single Georgian word
    
    Args:
        word: Georgian word
        hyphen_char: Hyphen character to use
        
    Returns:
        Hyphenated word
    """
    h = GeorgianHyphenator(hyphen_char)
    return h.hyphenate(word)


def get_syllables(word: str) -> List[str]:
    """
    Get syllables of a Georgian word
    
    Args:
        word: Georgian word
        
    Returns:
        List of syllables
    """
    h = GeorgianHyphenator('-')
    return h.get_syllables(word)


def hyphenate_text(text: str, hyphen_char: str = '\u00AD') -> str:
    """
    Hyphenate Georgian text
    
    Args:
        text: Text containing Georgian words
        hyphen_char: Hyphen character to use
        
    Returns:
        Hyphenated text
    """
    h = GeorgianHyphenator(hyphen_char)
    return h.hyphenate_text(text)


# Export format converters (v2.0 compatibility)

def to_tex_pattern(word: str) -> str:
    """
    Convert to TeX hyphenation pattern format
    
    Args:
        word: Georgian word
        
    Returns:
        TeX pattern (e.g., ".სა1ქარ1თვე1ლო.")
    """
    h = GeorgianHyphenator('-')
    syllables = h.get_syllables(word)
    return '.' + '1'.join(syllables) + '.'


def to_hunspell_format(word: str) -> str:
    """
    Convert to Hunspell hyphenation format
    
    Args:
        word: Georgian word
        
    Returns:
        Hunspell format (e.g., "სა=ქარ=თვე=ლო")
    """
    h = GeorgianHyphenator('-')
    hyphenated = h.hyphenate(word)
    return hyphenated.replace('-', '=')