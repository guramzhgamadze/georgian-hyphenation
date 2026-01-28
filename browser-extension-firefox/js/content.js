// Georgian Hyphenation Extension v2.2.4 - Content Script (Firefox)
(function() {
  'use strict';

  if (window.georgianHyphenationExtensionLoaded) {
    console.log('Georgian Hyphenation Extension: Already loaded');
    return;
  }
  window.georgianHyphenationExtensionLoaded = true;

  console.log('🇬🇪 Georgian Hyphenation v2.2.4: Initializing...');

  function waitForLibrary() {
    if (typeof GeorgianHyphenator === 'undefined') {
      setTimeout(waitForLibrary, 100);
      return;
    }
    initializeHyphenation();
  }

  function initializeHyphenation() {
    const DEBUG = true;
    
    function log(msg, ...args) {
      if(DEBUG) console.log('🇬🇪 GH v2.2.4:', msg, ...args);
    }

    log('🚀 Library loaded');

    const blacklistedHosts = ['claude.ai', 'chat.openai.com', 'gemini.google.com'];
    if (blacklistedHosts.some(host => window.location.hostname.includes(host))) {
      log('⚠️ Skipping blacklisted site');
      return;
    }

    let isEnabled = true;
    let smartJustifyEnabled = true;
    let hyphenator = new GeorgianHyphenator('\u00AD');
    let stats = { processed: 0, hyphenated: 0 };
    let processedNodes = new WeakSet();
    let isProcessing = false;

    // ✅ CRITICAL CSS FIX: Inject styles to hide soft hyphens
    function injectStyles() {
      if (document.getElementById('georgian-hyphenation-css')) return;
      
      const style = document.createElement('style');
      style.id = 'georgian-hyphenation-css';
      style.textContent = `
        body, p, div, span, article, section, li, td, th, blockquote, figcaption {
          hyphens: manual !important;
          -webkit-hyphens: manual !important;
          -moz-hyphens: manual !important;
          -ms-hyphens: manual !important;
        }
        
        body, p, div, span, article, section, li, td, th, blockquote, figcaption {
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
        }
        
        * {
          font-feature-settings: normal !important;
        }
      `;
      document.head.appendChild(style);
      log('🎨 CSS injected');
    }

    // Load settings
    browser.storage.sync.get(['enabled', 'smartJustify']).then(data => {
      isEnabled = data.enabled !== false;
      smartJustifyEnabled = data.smartJustify !== false;
      log(`Settings loaded: enabled=${isEnabled}, smartJustify=${smartJustifyEnabled}`);
      
      if (isEnabled) {
        injectStyles();
      }
    });

    function saveStats() {
      browser.storage.sync.set({ stats: stats }).catch(err => {
        console.error('Error saving stats:', err);
      });
    }

    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleHyphenation') {
        isEnabled = request.enabled;
        log(`Hyphenation ${isEnabled ? 'enabled' : 'disabled'}`);
        
        if (isEnabled) {
          injectStyles();
        } else {
          const styleElement = document.getElementById('georgian-hyphenation-css');
          if (styleElement) {
            styleElement.remove();
          }
        }
      } else if (request.action === 'toggleSmartJustify') {
        smartJustifyEnabled = request.smartJustify;
        log(`Smart Justify ${smartJustifyEnabled ? 'enabled' : 'disabled'}`);
      } else if (request.action === 'getStats') {
        sendResponse({ stats: stats });
      }
      return true;
    });

    function isGeorgianText(text) {
      return /[ა-ჰ]/.test(text);
    }

    // ✅ BALANCED: Skip only critical elements
    function shouldSkipElement(element) {
      if (!element) return true;
      
      const tagName = element.tagName.toLowerCase();
      
      const skipTags = [
        'script', 'style', 'noscript', 'iframe', 'object', 'embed',
        'input', 'textarea', 'select', 'code', 'pre',
        'nav', 'header', 'footer', 'aside',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'button'
      ];
      
      if (skipTags.includes(tagName)) return true;
      
      if (element.isContentEditable || element.contentEditable === 'true') {
        return true;
      }
      
      const role = element.getAttribute('role');
      if (role === 'heading' || role === 'navigation' || 
          role === 'button' || role === 'textbox') {
        return true;
      }
      
      if (element.hasAttribute('aria-level')) return true;
      
      // ✅ FIXED: fontSize > 20 (not 16)
      try {
        const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
        if (fontSize > 20) return true;
      } catch (e) {}
      
      return false;
    }

    // ✅ Check only 5 levels (not 15)
    function shouldSkipNode(node) {
      let currentElement = node.parentElement;
      let depth = 0;
      
      while (currentElement && depth < 5) {
        if (shouldSkipElement(currentElement)) {
          return true;
        }
        currentElement = currentElement.parentElement;
        depth++;
      }
      
      return false;
    }

    function applySmartJustify(element) {
      if (!element || !smartJustifyEnabled) return;
      
      try {
        const computedStyle = window.getComputedStyle(element);
        const currentAlign = computedStyle.textAlign;
        
        if (currentAlign === 'center' || currentAlign === 'right') {
          return;
        }
        
        const inlineAlign = element.style.textAlign;
        if (inlineAlign === 'center' || inlineAlign === 'right') {
          return;
        }
        
        element.style.textAlign = 'justify';
        element.style.hyphens = 'manual';
        element.style.MozHyphens = 'manual';
        
      } catch (e) {}
    }

    function processTextNode(node) {
      if (!isEnabled || !node.textContent || !node.textContent.trim()) return;
      if (processedNodes.has(node)) return;
      
      const text = node.textContent;
      if (!isGeorgianText(text)) return;
      if (shouldSkipNode(node)) return;
      
      // ✅ REMOVED: foundContentContainer check - too restrictive
      if (!/[ა-ჰ]{4,}/.test(text)) return;

      try {
        const words = text.split(/(\s+)/);
        let hasChanges = false;
        
        const processedWords = words.map(word => {
          if (!word.trim() || word.length < 4) return word;
          if (!isGeorgianText(word)) return word;

          stats.processed++;
          
          try {
            const hyphenated = hyphenator.hyphenate(word);
            
            if (hyphenated !== word) {
              stats.hyphenated++;
              hasChanges = true;
            }
            
            return hyphenated;
          } catch (e) {
            return word;
          }
        });

        if (hasChanges) {
          node.textContent = processedWords.join('');
          processedNodes.add(node);
          applySmartJustify(node.parentElement);
        }
      } catch (error) {
        console.error('Georgian Hyphenation v2.2.4 error:', error);
      }
    }

    function processNode(node, depth = 0) {
      if (!isEnabled || depth > 30) return;

      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        const skipTags = [
          'script', 'style', 'noscript', 'iframe', 'object', 'embed',
          'input', 'textarea', 'select', 'code', 'pre',
          'nav', 'header', 'footer', 'aside',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'button'
        ];
        
        if (skipTags.includes(tagName)) return;
        if (shouldSkipElement(node)) return;
        if (processedNodes.has(node)) return;
        
        processedNodes.add(node);
      }

      if (node.nodeType === Node.TEXT_NODE) {
        processTextNode(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const children = Array.from(node.childNodes).slice(0, 100);
        for (let child of children) {
          processNode(child, depth + 1);
        }
      }
    }

    let lastProcessTime = 0;
    async function processPage() {
      if (!isEnabled || isProcessing) return;
      
      const now = Date.now();
      if (now - lastProcessTime < 1000) return;
      
      lastProcessTime = now;
      isProcessing = true;
      
      log('📋 Processing page...');
      stats = { processed: 0, hyphenated: 0 };
      
      try {
        await hyphenator.loadDefaultLibrary();
        log('📚 Dictionary loaded');
      } catch (error) {
        log('⚠️ Dictionary unavailable');
      }
      
      const process = () => {
        try {
          processNode(document.body);
          log(`✅ Processed ${stats.processed} words, hyphenated ${stats.hyphenated}`);
          
          if (stats.processed === 0) {
            console.warn('Georgian Hyphenation v2.2.4: No words found to process!');
          }
          
          saveStats();
        } catch (error) {
          console.error('Georgian Hyphenation v2.2.4 error:', error);
        } finally {
          isProcessing = false;
        }
      };

      if (window.requestIdleCallback) {
        requestIdleCallback(process, { timeout: 2000 });
      } else {
        setTimeout(process, 100);
      }
    }

    let mutationTimeout;
    const observer = new MutationObserver((mutations) => {
      if (!isEnabled || isProcessing) return;
      
      clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(() => {
        for (let mutation of mutations) {
          for (let node of mutation.addedNodes) {
            if (!processedNodes.has(node)) {
              processNode(node);
            }
          }
        }
        saveStats();
      }, 500);
    });

    function startObserving() {
      if (!document.body) return;
      observer.observe(document.body, { childList: true, subtree: true });
      log('👀 Observer started');
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          processPage();
          startObserving();
        }, 100);
      });
    } else {
      setTimeout(() => {
        processPage();
        startObserving();
      }, 100);
    }

    let lastUrl = location.href;
    new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        log('🔄 URL changed');
        processedNodes = new WeakSet();
        setTimeout(processPage, 500);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  waitForLibrary();
})();