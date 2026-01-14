# setup.py - For PyPI distribution
from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="georgian-hyphenation",
    version="1.0.0",
    author="Your Name",
    author_email="your.email@example.com",
    description="Georgian Language Hyphenation Library / ქართული ენის დამარცვლის ბიბლიოთეკა",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/georgian-hyphenation",
    project_urls={
        "Bug Tracker": "https://github.com/yourusername/georgian-hyphenation/issues",
        "Documentation": "https://github.com/yourusername/georgian-hyphenation#readme",
        "Source Code": "https://github.com/yourusername/georgian-hyphenation",
    },
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Education",
        "Intended Audience :: Science/Research",
        "Topic :: Text Processing :: Linguistic",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Natural Language :: Georgian",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.7",
    install_requires=[
        # No external dependencies!
    ],
    extras_require={
        "dev": [
            "pytest>=7.0",
            "pytest-cov>=4.0",
            "black>=22.0",
            "flake8>=5.0",
            "mypy>=0.990",
        ],
        "docx": [
            "python-docx>=0.8.11",
        ],
    },
    keywords=[
        "georgian",
        "hyphenation",
        "syllabification",
        "nlp",
        "linguistics",
        "text-processing",
        "ქართული",
        "დამარცვლა",
    ],
    entry_points={
        "console_scripts": [
            "georgian-hyphenate=georgian_hyphenation.cli:main",
        ],
    },
)

# =============================================================================
# package.json - For NPM distribution
# =============================================================================
"""
{
  "name": "georgian-hyphenation",
  "version": "1.0.0",
  "description": "Georgian Language Hyphenation Library / ქართული ენის დამარცვლის ბიბლიოთეკა",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "src",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.js",
    "format": "prettier --write src/**/*.js",
    "prepublishOnly": "npm run build && npm test"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/yourusername/georgian-hyphenation.git"
  },
  "keywords": [
    "georgian",
    "hyphenation",
    "syllabification",
    "nlp",
    "linguistics",
    "text-processing",
    "kartuli",
    "ქართული",
    "დამარცვლა"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/yourusername/georgian-hyphenation/issues"
  },
  "homepage": "https://github.com/yourusername/georgian-hyphenation#readme",
  "devDependencies": {
    "@rollup/plugin-node-resolve": "^15.0.0",
    "@rollup/plugin-commonjs": "^24.0.0",
    "@rollup/plugin-terser": "^0.4.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "prettier": "^2.8.0",
    "rollup": "^3.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=12.0.0"
  }
}
"""

# =============================================================================
# .github/workflows/publish.yml - GitHub Actions for automated publishing
# =============================================================================
"""
name: Publish Package

on:
  release:
    types: [created]

jobs:
  publish-pypi:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install build twine
      - name: Build package
        run: python -m build
      - name: Publish to PyPI
        env:
          TWINE_USERNAME: __token__
          TWINE_PASSWORD: ${{ secrets.PYPI_API_TOKEN }}
        run: twine upload dist/*

  publish-npm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Publish to NPM
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
"""

# =============================================================================
# MANIFEST.in - For including additional files in Python package
# =============================================================================
"""
include README.md
include LICENSE
include requirements.txt
recursive-include src *.py
recursive-include tests *.py
recursive-include examples *.py *.html *.js
recursive-include docs *.md *.rst
"""

# =============================================================================
# pyproject.toml - Modern Python packaging
# =============================================================================
"""
[build-system]
requires = ["setuptools>=45", "wheel", "setuptools_scm>=6.2"]
build-backend = "setuptools.build_meta"

[project]
name = "georgian-hyphenation"
version = "1.0.0"
description = "Georgian Language Hyphenation Library"
readme = "README.md"
requires-python = ">=3.7"
license = {text = "MIT"}
authors = [
    {name = "Your Name", email = "your.email@example.com"}
]
keywords = ["georgian", "hyphenation", "nlp", "linguistics"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.7",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
]

[project.optional-dependencies]
dev = ["pytest>=7.0", "pytest-cov>=4.0", "black>=22.0"]
docx = ["python-docx>=0.8.11"]

[project.urls]
Homepage = "https://github.com/yourusername/georgian-hyphenation"
Documentation = "https://github.com/yourusername/georgian-hyphenation#readme"
Repository = "https://github.com/yourusername/georgian-hyphenation"
"Bug Tracker" = "https://github.com/yourusername/georgian-hyphenation/issues"

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]

[tool.black]
line-length = 88
target-version = ['py37']

[tool.mypy]
python_version = "3.7"
warn_return_any = true
warn_unused_configs = true
"""

print("Setup files created!")
print("\nTo publish to PyPI:")
print("  1. python -m build")
print("  2. twine upload dist/*")
print("\nTo publish to NPM:")
print("  1. npm run build")
print("  2. npm publish")