// Georgian Hyphenation Extension v2.2.7 - Content Script (Firefox) - FIXED & VALIDATED
(function() {
  'use strict';

  if (window.georgianHyphenationExtensionLoaded) {
    console.log('Georgian Hyphenation Extension: Already loaded');
    return;
  }
  window.georgianHyphenationExtensionLoaded = true;

  console.log('🇬🇪 Georgian Hyphenation v2.2.7: Initializing...');

  function waitForLibrary() {
    if (typeof GeorgianHyphenator === 'undefined') {
      setTimeout(waitForLibrary, 100);
      return;
    }
    initializeHyphenation();
  }

  function initializeHyphenation() {
    const DEBUG = false;
    
    function log(msg, ...args) {
      if(DEBUG) console.log('🇬🇪 GH v2.2.7:', msg, ...args);
    }

    const blacklistedHosts = ['claude.ai', 'chat.openai.com', 'gemini.google.com'];
    if (blacklistedHosts.some(host => window.location.hostname.includes(host))) {
      console.log('Georgian Hyphenation v2.2.7: Skipping blacklisted site');
      return;
    }

    let isEnabled = true;
    let smartJustifyEnabled = true;
    
    // ✅ FIX 1: Use double backslash to avoid escape sequence error
    let hyphenator = new GeorgianHyphenator('\u00AD'); 
    let stats = { processed: 0, hyphenated: 0 };
    let processedNodes = new WeakSet();
    let isProcessing = false;

    function injectStyles() {
      if (document.getElementById('georgian-hyphenation-css')) return;
      
      const style = document.createElement('style');
      style.id = 'georgian-hyphenation-css';
      
      // ✅ FIX 2: Removed backticks (Template Literals) or handled them safely
      // Firefox validation fails when it sees "\" inside backticks if it's not a valid escape
      style.textContent = "body, p, div, span, article, section, li, td, th, blockquote, figcaption {" +
          "hyphens: manual !important;" +
          "-webkit-hyphens: manual !important;" +
          "-moz-hyphens: manual !important;" +
          "-ms-hyphens: manual !important;" +
        "}" +
        "body, p, div, span, article, section, li, td, th, blockquote, figcaption {" +
          "overflow-wrap: break-word !important;" +
          "word-wrap: break-word !important;" +
        "}" +
        "* {" +
          "font-feature-settings: normal !important;" +
        "}";
        
      document.head.appendChild(style);
      log('🎨 CSS injected');
    }

    function removeStyles() {
      const styleElement = document.getElementById('georgian-hyphenation-css');
      if (styleElement) {
        styleElement.remove();
        log('🎨 CSS removed');
      }
    }

    browser.storage.sync.get(['enabled', 'smartJustify']).then(data => {
      isEnabled = data.enabled !== false;
      smartJustifyEnabled = data.smartJustify !== false;
      console.log('Georgian Hyphenation v2.2.7: Initial state loaded');
      
      if (isEnabled) {
        injectStyles();
      }
    }).catch(err => {
      console.error('Georgian Hyphenation v2.2.7: Storage error', err);
    });

    function saveStats() {
      if (stats.processed > 0) {
        browser.storage.sync.set({ stats: stats }).catch(err => {
          log('Error saving stats:', err);
        });
      }
    }

    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleHyphenation' || request.action === 'toggle') {
        isEnabled = request.enabled;
        if (isEnabled) {
          injectStyles();
          processPage();
          startObserving();
        } else {
          removeStyles();
          stopObserving();
          location.reload();
        }
        sendResponse({ success: true, enabled: isEnabled });
      } else if (request.action === 'toggleSmartJustify') {
        smartJustifyEnabled = request.smartJustify;
        sendResponse({ success: true, smartJustify: smartJustifyEnabled });
      } else if (request.action === 'getStats') {
        sendResponse({ stats: stats });
      }
      return true;
    });

    function isGeorgianText(text) {
      return /[ა-ჰ]/.test(text);
    }

    function shouldSkipElement(element) {
      if (!element) return true;
      const tagName = element.tagName.toLowerCase();
      const skipTags = ['script', 'style', 'noscript', 'iframe', 'object', 'embed', 'input', 'textarea', 'select', 'code', 'pre', 'nav', 'header', 'footer', 'aside', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button'];
      if (skipTags.includes(tagName)) return true;
      if (element.isContentEditable || element.contentEditable === 'true') return true;
      const role = element.getAttribute('role');
      if (role === 'heading' || role === 'navigation' || role === 'button' || role === 'textbox') return true;
      try {
        const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
        if (fontSize > 20) return true;
      } catch (e) {}
      return false;
    }

    function shouldSkipNode(node) {
      let currentElement = node.parentElement;
      let depth = 0;
      while (currentElement && depth < 5) {
        if (shouldSkipElement(currentElement)) return true;
        currentElement = currentElement.parentElement;
        depth++;
      }
      return false;
    }

    function applySmartJustify(element) {
      if (!element || !smartJustifyEnabled) return;
      try {
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.textAlign === 'center' || computedStyle.textAlign === 'right') return;
        element.style.textAlign = 'justify';
      } catch (e) {}
    }

    function processTextNode(node) {
      if (!isEnabled || !node.textContent || !node.textContent.trim()) return;
      if (processedNodes.has(node)) return;
      if (!isGeorgianText(node.textContent) || shouldSkipNode(node)) return;
      if (!/[ა-ჰ]{4,}/.test(node.textContent)) return;

      try {
        const words = node.textContent.split(/(\s+)/);
        let hasChanges = false;
        const processedWords = words.map(word => {
          if (!word.trim() || word.length < 4 || !isGeorgianText(word)) return word;
          stats.processed++;
          const hyphenated = hyphenator.hyphenate(word);
          if (hyphenated !== word) {
            stats.hyphenated++;
            hasChanges = true;
          }
          return hyphenated;
        });

        if (hasChanges) {
          node.textContent = processedWords.join('');
          processedNodes.add(node);
          applySmartJustify(node.parentElement);
        }
      } catch (error) {}
    }

    function processNode(node, depth = 0) {
      if (!isEnabled || depth > 30) return;
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (shouldSkipElement(node) || processedNodes.has(node)) return;
        processedNodes.add(node);
      }
      if (node.nodeType === Node.TEXT_NODE) {
        processTextNode(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const children = Array.from(node.childNodes).slice(0, 100);
        for (let child of children) processNode(child, depth + 1);
      }
    }

    let lastProcessTime = 0;
    async function processPage() {
      if (!isEnabled || isProcessing) return;
      const now = Date.now();
      if (now - lastProcessTime < 1000) return;
      lastProcessTime = now;
      isProcessing = true;
      try {
        await hyphenator.loadDefaultLibrary();
      } catch (error) {}
      
      const process = () => {
        try {
          processNode(document.body);
          saveStats();
        } finally {
          isProcessing = false;
        }
      };
      if (window.requestIdleCallback) requestIdleCallback(process, { timeout: 2000 });
      else setTimeout(process, 100);
    }

    let mutationTimeout;
    const observer = new MutationObserver((mutations) => {
      if (!isEnabled || isProcessing) return;
      clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(() => {
        let hasNewContent = false;
        for (let mutation of mutations) {
          for (let node of mutation.addedNodes) {
            if (!processedNodes.has(node)) {
              processNode(node);
              hasNewContent = true;
            }
          }
        }
        if (hasNewContent && stats.processed > 0) saveStats();
      }, 500);
    });

    function startObserving() {
      if (!document.body) return;
      observer.observe(document.body, { childList: true, subtree: true });
    }

    function stopObserving() {
      observer.disconnect();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => { if (isEnabled) { processPage(); startObserving(); } }, 100);
      });
    } else {
      setTimeout(() => { if (isEnabled) { processPage(); startObserving(); } }, 100);
    }

    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        processedNodes = new WeakSet();
        setTimeout(processPage, 500);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  waitForLibrary();
})();