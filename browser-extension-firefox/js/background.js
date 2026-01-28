// Background Script v2.2.4 - Firefox (Enhanced with Auto-injection)
console.log('Georgian Hyphenation v2.2.4: Background script loaded');

// Initialize default settings on install/update
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Georgian Hyphenation Extension installed!');
    
    browser.storage.sync.set({
      enabled: true,
      smartJustify: true,
      stats: { processed: 0, hyphenated: 0 }
    });
  } else if (details.reason === 'update') {
    console.log('Georgian Hyphenation Extension updated to v2.2.4!');
    
    // Ensure new settings exist
    browser.storage.sync.get(['enabled', 'smartJustify']).then(result => {
      const updates = {};
      if (result.enabled === undefined) updates.enabled = true;
      if (result.smartJustify === undefined) updates.smartJustify = true;
      
      if (Object.keys(updates).length > 0) {
        browser.storage.sync.set(updates);
      }
    });
  }
});

// Listen for tab updates (page loads) - Auto-inject with duplicate check
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only inject when page is fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    // Skip special pages
    if (tab.url.startsWith('about:') || 
        tab.url.startsWith('moz-extension://') ||
        tab.url.startsWith('chrome://')) {
      return;
    }

    // Check if extension is enabled
    browser.storage.sync.get(['enabled']).then(result => {
      if (result.enabled !== false) {
        // Check if already injected
        browser.tabs.executeScript(tabId, {
          code: 'typeof window.georgianHyphenationExtensionLoaded !== "undefined"'
        }).then(results => {
          // Only inject if not already loaded
          if (!results || !results[0]) {
            console.log('Injecting scripts into tab:', tabId);
            
            // Inject hyphenator first, then content script
            browser.tabs.executeScript(tabId, {
              file: 'js/hyphenator.js',
              runAt: 'document_idle'
            }).then(() => {
              return browser.tabs.executeScript(tabId, {
                file: 'js/content.js',
                runAt: 'document_idle'
              });
            }).catch(err => {
              // Silent fail for restricted pages
              console.log('Could not inject on:', tab.url, err.message);
            });
          } else {
            console.log('Scripts already loaded in tab:', tabId);
          }
        }).catch(err => {
          // If check fails, try to inject anyway (might be first load)
          console.log('Check failed, attempting injection on tab:', tabId);
          
          browser.tabs.executeScript(tabId, {
            file: 'js/hyphenator.js',
            runAt: 'document_idle'
          }).then(() => {
            return browser.tabs.executeScript(tabId, {
              file: 'js/content.js',
              runAt: 'document_idle'
            });
          }).catch(err => {
            console.log('Could not inject on:', tab.url, err.message);
          });
        });
      }
    });
  }
});

// Keep background script responsive
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  sendResponse({ received: true });
  return true;
});