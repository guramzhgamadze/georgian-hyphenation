// Background Script v2.2.6.1 - Firefox - FIXED
console.log('Georgian Hyphenation v2.2.6.1 (Firefox): Background script loaded');

// Initialize default settings on install/update
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Georgian Hyphenation v2.2.6.1 (Firefox): Extension installed!');
    
    browser.storage.sync.set({
      enabled: true,
      smartJustify: true,
      stats: { processed: 0, hyphenated: 0 },
      version: '2.2.6.1'
    }).catch(err => {
      console.error('Storage error:', err);
      // Fallback to local storage if sync fails
      browser.storage.local.set({
        enabled: true,
        smartJustify: true,
        stats: { processed: 0, hyphenated: 0 },
        version: '2.2.6.1'
      });
    });
  } else if (details.reason === 'update') {
    console.log('Georgian Hyphenation v2.2.6.1 (Firefox): Extension updated!');
    
    // Update version in storage
    browser.storage.sync.set({ version: '2.2.6.1' }).catch(err => {
      browser.storage.local.set({ version: '2.2.6.1' });
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
    }).catch(err => {
      console.error('Storage error:', err);
    });
  }
});

// Keep background script responsive
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  sendResponse({ received: true, version: '2.2.6.1' });
  return true;
});