# -*- coding: utf-8 -*-
"""
Georgian Language Hyphenation Library
ქართული ენის დამარცვლის ბიბლიოთეკა
Version: 2.0.0
"""

from .hyphenator import (
    GeorgianHyphenator,
    to_tex_pattern,
    to_hunspell_format
)

__version__ = '2.0.0'
__author__ = 'Guram Zhgamadze'
__all__ = ['GeorgianHyphenator', 'to_tex_pattern', 'to_hunspell_format']