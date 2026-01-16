// Content Script - Final Version with Inline Links Support
(function() {
  'use strict';

  // Prevent duplicate injection
  if (window.georgianHyphenationLoaded) {
    console.log('Georgian Hyphenation: Already loaded, skipping');
    return;
  }
  window.georgianHyphenationLoaded = true;

  let isEnabled = true;
  let hyphenator = new GeorgianHyphenator('\u00AD');
  let stats = { processed: 0, hyphenated: 0 };
  let processedNodes = new WeakSet();
  let isProcessing = false;

  // Blacklist problematic sites
  const blacklistedHosts = ['claude.ai', 'chat.openai.com', 'gemini.google.com'];
  if (blacklistedHosts.some(host => window.location.hostname.includes(host))) {
    console.log('Georgian Hyphenation: Skipping blacklisted site');
    return;
  }

  // Check if text is Georgian
  function isGeorgianText(text) {
    return /[ა-ჰ]/.test(text);
  }

  // Reset processed nodes
  function resetProcessedNodes() {
    processedNodes = new WeakSet();
  }

  // Process text nodes (with inline links support)
  function processTextNode(node) {
    if (!isEnabled) return;
    if (!node.textContent || !node.textContent.trim()) return;
    if (processedNodes.has(node)) return;
    
    const text = node.textContent;
    if (!isGeorgianText(text)) return;

    // Check parent element and all ancestors
    let currentElement = node.parentElement;
    let depth = 0;
    let isInNavigation = false;
    
    while (currentElement && depth < 5) {
      const tagName = currentElement.tagName.toLowerCase();
      
      // Skip headings (h1-h6)
      if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || 
          tagName === 'h4' || tagName === 'h5' || tagName === 'h6') {
        return;
      }
      
      // Skip buttons
      if (tagName === 'button') {
        return;
      }
      
      // Check if in navigation context
      if (tagName === 'nav' || tagName === 'header' || tagName === 'footer') {
        isInNavigation = true;
      }
      
      // Skip by role attribute
      const role = currentElement.getAttribute('role');
      if (role === 'heading' || role === 'navigation') {
        return;
      }
      
      // Skip by aria-level (heading level)
      if (currentElement.hasAttribute('aria-level')) {
        return;
      }
      
            // Skip if className suggests heading, title, or slider
      try {
        // Handle different className types
        let classStr = '';
        if (typeof currentElement.className === 'string') {
          classStr = currentElement.className;
        } else if (currentElement.getAttribute) {
          classStr = currentElement.getAttribute('class') || '';
        }
        classStr = classStr.toLowerCase();
        
        if (classStr.includes('headline') || 
            classStr.includes('heading') ||
            classStr.includes('title') ||
            classStr.includes('header') ||
            classStr.includes('slider') ||
            classStr.includes('carousel')) {
          return;
        }
      } catch (e) {
        // Continue if className check fails
      }
      
      // Check font size - skip if large (likely heading/title)
      try {
        const computedStyle = window.getComputedStyle(currentElement);
        const fontSize = parseFloat(computedStyle.fontSize);
        
        // Skip if font-size > 18px (likely heading/title)
        if (fontSize > 18) {
          return;
        }
      } catch (e) {
        // Continue if style check fails
      }
      
      currentElement = currentElement.parentElement;
      depth++;
    }

    // Check immediate parent
    const parent = node.parentElement;
    if (parent) {
      const tagName = parent.tagName.toLowerCase();
      
      // For links: only skip if in navigation
      if (tagName === 'a' && isInNavigation) {
        return;
      }
      
      // Double-check font size on immediate parent
      try {
        const computedStyle = window.getComputedStyle(parent);
        const fontSize = parseFloat(computedStyle.fontSize);
        
        // Skip if large font (heading/title)
        if (fontSize > 18) {
          return;
        }
      } catch (e) {
        // Continue
      }
    }

    // Process if has Georgian words 4+ chars
    if (!/[ა-ჰ]{4,}/.test(text)) return;

    try {
      const words = text.split(/(\s+)/);
      let hasChanges = false;
      
      const processedWords = words.map(word => {
        // Skip whitespace and short words
        if (!word.trim() || word.length < 4) return word;
        if (!isGeorgianText(word)) return word;
        if (word.includes('\u00AD')) return word;

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
      console.error('Georgian Hyphenation error:', error);
    }
  }

  // Walk through DOM tree (with limits)
  function processNode(node, depth = 0) {
    if (!isEnabled) return;
    if (depth > 30) return;

    // Skip problematic elements
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      const skipTags = ['script', 'style', 'noscript', 'iframe', 'object', 
                        'input', 'textarea', 'select', 'option', 'code', 'pre'];
      
      if (skipTags.includes(tagName)) return;
      if (processedNodes.has(node)) return;
      
      processedNodes.add(node);
    }

    if (node.nodeType === Node.TEXT_NODE) {
      processTextNode(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Limit children to process
      const children = Array.from(node.childNodes).slice(0, 100);
      for (let child of children) {
        processNode(child, depth + 1);
      }
    }
  }

  // Process entire page (with throttling)
  let lastProcessTime = 0;
  function processPage() {
    if (!isEnabled) return;
    if (isProcessing) return;
    
    const now = Date.now();
    if (now - lastProcessTime < 1000) return;
    
    lastProcessTime = now;
    isProcessing = true;
    
    console.log('Georgian Hyphenation: Processing page on', window.location.hostname);
    stats = { processed: 0, hyphenated: 0 };
    
    const process = () => {
      try {
        processNode(document.body);
        console.log(`Georgian Hyphenation: Processed ${stats.processed} words, hyphenated ${stats.hyphenated}`);
        chrome.storage.local.set({ stats: stats });
      } catch (error) {
        console.error('Georgian Hyphenation error:', error);
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

// Aggressive Mutation Observer (Facebook-optimized)
let mutationTimeout;

// Facebook-specific detection
const isFacebook = window.location.hostname.includes('facebook.com');

const observer = new MutationObserver((mutations) => {
  if (!isEnabled || isProcessing) return;
  
  clearTimeout(mutationTimeout);
  
  // Faster debounce for Facebook
  const debounceTime = isFacebook ? 200 : 500;
  
  mutationTimeout = setTimeout(() => {
    for (let mutation of mutations) {
      // Process added nodes
      for (let node of mutation.addedNodes) {
        if (!processedNodes.has(node)) {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            processNode(node);
          }
        }
      }
      
      // NEW: Also process when text content changes (React updates)
      if (isFacebook && mutation.type === 'characterData') {
        const textNode = mutation.target;
        if (textNode.nodeType === Node.TEXT_NODE) {
          // Remove from processed set to allow re-processing
          processedNodes.delete(textNode);
          processTextNode(textNode);
        }
      }
    }
  }, debounceTime);
});

function startObserving() {
  if (!document.body) return;
  
  // Enhanced observation for Facebook
  const observeConfig = {
    childList: true,
    subtree: true
  };
  
  // On Facebook, also watch for text changes
  if (isFacebook) {
    observeConfig.characterData = true;
    observeConfig.characterDataOldValue = false;
  }
  
  observer.observe(document.body, observeConfig);
  
  console.log('Georgian Hyphenation: Observer started', isFacebook ? '(Facebook mode)' : '');
}

  // Stop observing
  function stopObserving() {
    observer.disconnect();
  }

  // Initialize
  function initialize() {
    chrome.storage.local.get(['enabled'], (result) => {
      isEnabled = result.enabled !== false;
      
      if (isEnabled) {
        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
          body {
            hyphens: manual !important;
            -webkit-hyphens: manual !important;
          }
          p, div, span, article, section {
            hyphens: manual !important;
            -webkit-hyphens: manual !important;
          }
          span {
            font-feature-settings: "liga" 0 !important;
            text-rendering: optimizeSpeed !important;
          }
        `;
        document.head.appendChild(style);

     // Process page when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (isFacebook) {
      // Facebook needs extra delay for content to load
      setTimeout(() => {
        processPage();
        startObserving();
      }, 2000); // 2 second delay
    } else {
      processPage();
      startObserving();
  }
  });
} else {
  if (isFacebook) {
    // Facebook: delay initial processing
    setTimeout(() => {
      processPage();
      startObserving();
    }, 2000);
  } else {
    processPage();
    startObserving();
	  }
	  }
	  }
    });
  }

  // Message listener
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggle') {
      isEnabled = message.enabled;
      
      if (isEnabled) {
        processPage();
        startObserving();
      } else {
        stopObserving();
      }
      
      sendResponse({ success: true });
      return true;
    } else if (message.action === 'getStats') {
      sendResponse({ stats: stats });
      return true;
    }
  });

  // Initialize extension
  initialize();

  // Watch for URL changes (SPA navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log('Georgian Hyphenation: URL changed to', currentUrl);
      
      // Reset processed nodes
      resetProcessedNodes();
      
      // Wait for new content to load
      setTimeout(() => {
        processPage();
      }, 500);
    }
  }).observe(document, { subtree: true, childList: true });

})();