// Content Script v2.2.4 - CSS Fix for Visible Soft Hyphens
(function() {
  'use strict';

  if (window.georgianHyphenationExtensionLoaded) {
    console.log('Georgian Hyphenation Extension: Already loaded');
    return;
  }
  window.georgianHyphenationExtensionLoaded = true;

  let isEnabled = true;
  let hyphenator = new GeorgianHyphenator('\u00AD');
  let stats = { processed: 0, hyphenated: 0 };
  let processedNodes = new WeakSet();
  let isProcessing = false;

  console.log('Georgian Hyphenation v2.2.4: Extension started');

  // Blacklist
  const blacklistedHosts = ['claude.ai', 'chat.openai.com', 'gemini.google.com'];
  if (blacklistedHosts.some(host => window.location.hostname.includes(host))) {
    console.log('Georgian Hyphenation v2.2.4: Skipping blacklisted site');
    return;
  }

  function isGeorgianText(text) {
    return /[ა-ჰ]/.test(text);
  }

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
      if (shouldSkipElement(currentElement)) {
        return true;
      }
      currentElement = currentElement.parentElement;
      depth++;
    }
    
    return false;
  }

  function processTextNode(node) {
    if (!isEnabled || !node.textContent || !node.textContent.trim()) return;
    if (processedNodes.has(node)) return;
    
    const text = node.textContent;
    if (!isGeorgianText(text)) return;

    if (shouldSkipNode(node)) return;
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
  function processPage() {
    if (!isEnabled || isProcessing) return;
    
    const now = Date.now();
    if (now - lastProcessTime < 1000) return;
    
    lastProcessTime = now;
    isProcessing = true;
    
    console.log('Georgian Hyphenation v2.2.4: Processing page...');
    stats = { processed: 0, hyphenated: 0 };
    
    const process = () => {
      try {
        processNode(document.body);
        console.log(`Georgian Hyphenation v2.2.4: Processed ${stats.processed} words, hyphenated ${stats.hyphenated}`);
        
        if (stats.processed === 0) {
          console.warn('Georgian Hyphenation v2.2.4: No words found to process!');
        }
        
        chrome.storage.local.set({ stats: stats });
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
    }, 500);
  });

  function startObserving() {
    if (!document.body) return;
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('Georgian Hyphenation v2.2.4: Observer started');
  }

  function stopObserving() {
    observer.disconnect();
  }

  function initialize() {
    chrome.storage.local.get(['enabled'], (result) => {
      isEnabled = result.enabled !== false;
      
      if (isEnabled) {
        // ✅ CRITICAL CSS FIX: Hide soft hyphens properly
        const style = document.createElement('style');
        style.id = 'georgian-hyphenation-css';
        style.textContent = `
          /* Force manual hyphenation mode */
          body, p, div, span, article, section, li, td, th, blockquote, figcaption {
            hyphens: manual !important;
            -webkit-hyphens: manual !important;
            -moz-hyphens: manual !important;
            -ms-hyphens: manual !important;
          }
          
          /* ✅ CRITICAL: Hide soft hyphens when NOT at line break */
          body, p, div, span, article, section, li, td, th, blockquote, figcaption {
            overflow-wrap: break-word !important;
            word-wrap: break-word !important;
          }
          
          /* ✅ Fix for fonts that show soft hyphens as visible dashes */
          * {
            font-feature-settings: normal !important;
          }
        `;
        document.head.appendChild(style);

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
      }
    });
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggle') {
      isEnabled = message.enabled;
      
      if (isEnabled) {
        processPage();
        startObserving();
      } else {
        stopObserving();
        
        // Remove CSS when disabled
        const styleElement = document.getElementById('georgian-hyphenation-css');
        if (styleElement) {
          styleElement.remove();
        }
      }
      
      sendResponse({ success: true });
      return true;
    } else if (message.action === 'getStats') {
      sendResponse({ stats: stats });
      return true;
    }
  });

  initialize();

  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log('Georgian Hyphenation v2.2.4: URL changed');
      processedNodes = new WeakSet();
      setTimeout(processPage, 500);
    }
  }).observe(document, { subtree: true, childList: true });

})();