// Content Script v2.2.10 - Facebook Character-Span Obfuscation Handler
(function() {
  'use strict';

  if (window.georgianHyphenationExtensionLoaded) {
    console.log('Georgian Hyphenation Extension: Already loaded');
    return;
  }
  window.georgianHyphenationExtensionLoaded = true;

  let isEnabled = true;
  let smartJustifyEnabled = true;
  let hyphenator = new GeorgianHyphenator('\u00AD');
  let stats = { processed: 0, hyphenated: 0 };
  let processedNodes = new WeakSet();
  let isProcessing = false;
  let processingQueue = [];
  let debounceTimer = null;

  console.log('Georgian Hyphenation v2.2.10: Extension started');

  // Blacklist
  const blacklistedHosts = ['claude.ai', 'chat.openai.com', 'gemini.google.com'];
  if (blacklistedHosts.some(host => window.location.hostname.includes(host))) {
    console.log('Georgian Hyphenation v2.2.10: Skipping blacklisted site');
    return;
  }

  // Simple Meta platform detection
  const hostname = window.location.hostname;
  const isMetaPlatform = hostname.includes('facebook.com') || 
                         hostname.includes('instagram.com') || 
                         hostname.includes('threads.net') || 
                         hostname.includes('messenger.com') ||
                         hostname.includes('fb.com');

  function isGeorgianText(text) {
    return /[\u10D0-\u10F0]/.test(text);
  }

  function shouldSkipElement(element) {
    if (!element) return true;
    
    const tagName = element.tagName.toLowerCase();
    
    const skipTags = [
      'script', 'style', 'noscript', 'iframe', 'object', 'embed',
      'input', 'textarea', 'select', 'code', 'pre',
      'nav', 'button'
    ];
    
    if (skipTags.includes(tagName)) return true;
    
    if (element.isContentEditable || element.contentEditable === 'true') {
      return true;
    }
    
    const role = element.getAttribute('role');
    if (role === 'button' || role === 'textbox' || role === 'combobox') {
      return true;
    }
    
    // Don't skip aria-hidden or aria-label - Facebook posts use these!
    
    return false;
  }

  function shouldSkipNode(node) {
    let currentElement = node.parentElement;
    let depth = 0;
    
    while (currentElement && depth < 8) {
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
    
    // Check if already processed AND hyphenation actually exists
    if (processedNodes.has(node)) {
      // Verify hyphenation actually worked
      if (node.textContent.includes('\u00AD')) {
        return; // Already processed and hyphenated, skip
      } else {
        // Was marked as processed but has no hyphens - process again
        processedNodes.delete(node);
      }
    }
    
    const text = node.textContent;
    if (!isGeorgianText(text)) return;

    if (shouldSkipNode(node)) return;
    if (!/[\u10D0-\u10F0]{4,}/.test(text)) return;

    // Remove inline text-align styles on Meta platforms (Facebook) 
    // These override our CSS justify rules and prevent hyphens from showing
    if (isMetaPlatform && node.parentElement) {
      let current = node.parentElement;
      let depth = 0;
      while (current && depth < 5) {
        if (current.style && current.style.textAlign) {
          current.style.removeProperty('text-align');
        }
        current = current.parentElement;
        depth++;
      }
    }

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
      // Silent error
    }
  }

  // Check if element contains Facebook's character-by-character obfuscation
  function hasFacebookCharSpans(element) {
    if (!element || !element.children || element.children.length < 6) return false;
    
    // Look for pattern: multiple consecutive spans each containing 1-2 characters
    let charSpanCount = 0;
    let totalChildren = 0;
    
    for (const child of element.children) {
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      totalChildren++;
      
      if (child.tagName === 'SPAN' && 
          child.children.length === 0 && 
          child.textContent.length <= 2) {
        charSpanCount++;
      }
    }
    
    // If most children are single-char spans, it's Facebook obfuscation
    return totalChildren > 5 && charSpanCount / totalChildren > 0.7;
  }

  // Process Facebook's character-by-character span obfuscation
  function processFacebookCharSpans(element) {
    if (!isEnabled || processedNodes.has(element)) return false;
    
    // Collect all text from character spans
    let fullText = '';
    const textParts = [];
    
    for (const child of element.children) {
      if (child.tagName === 'SPAN' && child.children.length === 0) {
        const char = child.textContent;
        fullText += char;
        textParts.push({ span: child, char: char });
      }
    }
    
    if (!isGeorgianText(fullText) || fullText.length < 4) return false;
    
    // Hyphenate the full text
    const words = fullText.split(/(\s+)/);
    let hyphenatedText = '';
    
    for (const word of words) {
      if (!word.trim() || word.length < 4 || !isGeorgianText(word)) {
        hyphenatedText += word;
      } else {
        try {
          hyphenatedText += hyphenator.hyphenate(word);
          stats.processed++;
          stats.hyphenated++;
        } catch (e) {
          hyphenatedText += word;
        }
      }
    }
    
    if (hyphenatedText === fullText) return false;
    
    // Redistribute hyphenated text back into character spans
    let hyphenIndex = 0;
    for (let i = 0; i < textParts.length && hyphenIndex < hyphenatedText.length; i++) {
      const part = textParts[i];
      const originalChar = part.char;
      
      if (hyphenatedText[hyphenIndex] === originalChar) {
        // Check if soft hyphen follows
        if (hyphenatedText[hyphenIndex + 1] === '\u00AD') {
          part.span.textContent = originalChar + '\u00AD';
          hyphenIndex += 2;
        } else {
          hyphenIndex += 1;
        }
      } else {
        hyphenIndex += 1;
      }
    }
    
    processedNodes.add(element);
    return true;
  }

  function processNode(node, depth = 0) {
    if (!isEnabled || depth > 30) return;

    if (node.nodeType === Node.ELEMENT_NODE) {
      if (shouldSkipElement(node)) return;
      if (processedNodes.has(node)) return;
      
      // Check for Facebook's character-by-character obfuscation on Meta platforms
      if (isMetaPlatform && hasFacebookCharSpans(node)) {
        if (processFacebookCharSpans(node)) {
          return; // Successfully processed, don't recurse into children
        }
      }
      
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

  function queueProcessing(node) {
    if (!isEnabled) return;
    
    processingQueue.push(node);
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = setTimeout(() => {
      processBatchedQueue();
    }, 300);
  }

  function processBatchedQueue() {
    if (!isEnabled || isProcessing || processingQueue.length === 0) return;
    
    isProcessing = true;
    const oldStats = { ...stats };
    
    const process = () => {
      try {
        const nodesToProcess = [...processingQueue];
        processingQueue = [];
        
        for (const node of nodesToProcess) {
          processNode(node);
        }
        
        if (stats.processed > oldStats.processed) {
          console.log(`Georgian Hyphenation v2.2.10: Processed ${stats.processed - oldStats.processed} new words, hyphenated ${stats.hyphenated - oldStats.hyphenated}`);
          
          // Try to save stats, but handle extension reload gracefully
          try {
            chrome.storage.sync.set({ stats: stats });
          } catch (e) {
            // Extension was reloaded, ignore storage error
            if (e.message && e.message.includes('Extension context invalidated')) {
              console.log('Georgian Hyphenation v2.2.10: Extension reloaded, skipping stats save');
            }
          }
        }
      } catch (error) {
        // Only log real errors, not extension reload
        if (!error.message || !error.message.includes('Extension context invalidated')) {
          console.error('Georgian Hyphenation v2.2.10 error:', error);
        }
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

  const observer = new MutationObserver((mutations) => {
    if (!isEnabled || isProcessing) return;
    
    const relevantMutations = mutations.filter(mutation => {
      if (mutation.target && shouldSkipElement(mutation.target)) {
        return false;
      }
      return mutation.type === 'childList' && mutation.addedNodes.length > 0;
    });
    
    if (relevantMutations.length === 0) return;
    
    for (let mutation of relevantMutations) {
      for (let node of mutation.addedNodes) {
        if (processedNodes.has(node)) continue;
        
        if (node.nodeType === Node.TEXT_NODE) {
          if (isGeorgianText(node.textContent)) {
            queueProcessing(node);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const text = node.textContent || '';
          if (isGeorgianText(text)) {
            queueProcessing(node);
          }
        }
      }
    }
  });

  function startObserving() {
    if (!document.body) return;
    
    // Simple approach: use body for all sites, but disable attributes on Meta platforms
    if (isMetaPlatform) {
      observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: false  // Skip attribute changes on Meta platforms
      });
      console.log('Georgian Hyphenation v2.2.10: Observer started (Meta platform mode - Character-Span Handler)');
      
      // Add click listener for "See more" / "See less" buttons on Facebook
      document.body.addEventListener('click', (event) => {
        // Check if clicked element or its parent is a "See more" type button
        const target = event.target;
        const clickedText = target.textContent || '';
        
        // Facebook "See more" buttons often contain these phrases
        if (clickedText.includes('See more') || 
            clickedText.includes('See less') ||
            clickedText.includes('...more') ||
            target.getAttribute('role') === 'button') {
          
          // Wait for DOM to update, then reprocess nearby content
          setTimeout(() => {
            // Find the nearest post container
            let postContainer = target.closest('[role="article"]') || 
                               target.closest('[data-pagelet]') ||
                               target.parentElement;
            
            if (postContainer) {
              // Clear processed tracking for this container's text nodes
              const walker = document.createTreeWalker(
                postContainer,
                NodeFilter.SHOW_TEXT,
                null
              );
              
              let node;
              while (node = walker.nextNode()) {
                processedNodes.delete(node);
              }
              
              // Reprocess the container
              queueProcessing(postContainer);
              console.log('Georgian Hyphenation v2.2.10: Reprocessing after "See more" click');
            }
          }, 300); // Wait for Facebook's expand animation
        }
      }, true); // Use capture phase to catch clicks early
      
    } else {
      observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
      console.log('Georgian Hyphenation v2.2.10: Observer started');
    }
  }

  function stopObserving() {
    observer.disconnect();
    console.log('Georgian Hyphenation v2.2.10: Observer stopped');
  }

  function addHyphenationCSS() {
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
    console.log('Georgian Hyphenation v2.2.10: CSS injected');
  }

  function removeHyphenationCSS() {
    const styleElement = document.getElementById('georgian-hyphenation-css');
    if (styleElement) {
      styleElement.remove();
      console.log('Georgian Hyphenation v2.2.10: CSS removed');
    }
  }

  function addSmartJustifyCSS() {
    if (document.getElementById('georgian-smart-justify-css')) return;
    
    const style = document.createElement('style');
    style.id = 'georgian-smart-justify-css';
    style.textContent = `
      /* Justify paragraphs, articles, sections - normal content */
      p,
      article, 
      section,
      div.content,
      div[dir="auto"] {
        text-align: justify !important;
      }
      
      /* EXCLUSIONS: Never justify anything inside these containers */
      /* 1. Contenteditable elements (chat inputs, composers) */
      [contenteditable] *,
      [contenteditable="true"] *,
      [role="textbox"] *,
      
      /* 2. Lexical editor (Facebook's rich text editor) */
      [data-lexical-editor] *,
      
      /* 3. Form inputs */
      textarea,
      textarea *,
      input,
      input *,
      [placeholder] *,
      
      /* 4. Specific Facebook composer/input classes */
      [data-pagelet*="composer"] *,
      [data-testid*="composer"] *,
      ._1mf *,
      ._5rpb *,
      ._5rpu *,
      
      /* 5. ARIA labels indicating input areas */
      [aria-label*="comment" i] *,
      [aria-label*="write" i] *,
      [aria-label*="message" i] *,
      [aria-label*="chat" i] * {
        text-align: left !important;
      }
    `;
    document.head.appendChild(style);
    console.log('Georgian Hyphenation v2.2.10: Smart Justify CSS injected');
  }

  function removeSmartJustifyCSS() {
    const styleElement = document.getElementById('georgian-smart-justify-css');
    if (styleElement) {
      styleElement.remove();
      console.log('Georgian Hyphenation v2.2.10: Smart Justify CSS removed');
    }
  }

  function enable() {
    isEnabled = true;
    console.log('Georgian Hyphenation v2.2.10: ENABLED');
    
    addHyphenationCSS();
    queueProcessing(document.body);
    startObserving();
    
    if (smartJustifyEnabled) {
      addSmartJustifyCSS();
    }
  }

  function disable() {
    isEnabled = false;
    console.log('Georgian Hyphenation v2.2.10: DISABLED');
    
    stopObserving();
    removeHyphenationCSS();
    removeSmartJustifyCSS();
    
    processingQueue = [];
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    location.reload();
  }

  function initialize() {
    chrome.storage.sync.get(['enabled', 'smartJustify'], (result) => {
      isEnabled = result.enabled !== false;
      smartJustifyEnabled = result.smartJustify !== false;
      
      console.log('Georgian Hyphenation v2.2.10: Initial state -', { isEnabled, smartJustifyEnabled });
      
      if (isEnabled) {
        addHyphenationCSS();
        
        if (smartJustifyEnabled) {
          addSmartJustifyCSS();
        }

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
              queueProcessing(document.body);
              startObserving();
            }, 100);
          });
        } else {
          setTimeout(() => {
            queueProcessing(document.body);
            startObserving();
          }, 100);
        }
      }
    });
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Georgian Hyphenation v2.2.10: Received message', message);
    
    if (message.action === 'toggle' || message.action === 'toggleHyphenation') {
      const newState = message.enabled;
      
      if (newState) {
        enable();
      } else {
        disable();
      }
      
      sendResponse({ success: true, enabled: isEnabled });
      return true;
    } 
    else if (message.action === 'toggleSmartJustify') {
      smartJustifyEnabled = message.smartJustify;
      
      if (smartJustifyEnabled) {
        addSmartJustifyCSS();
      } else {
        removeSmartJustifyCSS();
      }
      
      sendResponse({ success: true, smartJustify: smartJustifyEnabled });
      return true;
    }
    else if (message.action === 'getStats') {
      sendResponse({ stats: stats });
      return true;
    }
    
    return false;
  });

  initialize();

  // SPA navigation detection
  let lastUrl = location.href;
  
  const urlChangeObserver = new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log('Georgian Hyphenation v2.2.10: URL changed, reprocessing...');
      
      processedNodes = new WeakSet();
      stats = { processed: 0, hyphenated: 0 };
      
      setTimeout(() => {
        queueProcessing(document.body);
      }, 800);
    }
  });
  
  if (document.querySelector('title')) {
    urlChangeObserver.observe(document.querySelector('title'), { 
      childList: true 
    });
  }
  
  window.addEventListener('popstate', () => {
    console.log('Georgian Hyphenation v2.2.10: Navigation detected (popstate), reprocessing...');
    processedNodes = new WeakSet();
    stats = { processed: 0, hyphenated: 0 };
    setTimeout(() => {
      queueProcessing(document.body);
    }, 800);
  });
  
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    console.log('Georgian Hyphenation v2.2.10: Navigation detected (pushState), reprocessing...');
    processedNodes = new WeakSet();
    stats = { processed: 0, hyphenated: 0 };
    setTimeout(() => {
      queueProcessing(document.body);
    }, 800);
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    console.log('Georgian Hyphenation v2.2.10: Navigation detected (replaceState), reprocessing...');
    processedNodes = new WeakSet();
    stats = { processed: 0, hyphenated: 0 };
    setTimeout(() => {
      queueProcessing(document.body);
    }, 800);
  };

})();