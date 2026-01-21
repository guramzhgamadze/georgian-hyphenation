// Background Service Worker - Auto-inject with duplicate check
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Georgian Hyphenation Extension installed!');
    
    chrome.storage.local.set({
      enabled: true,
      stats: { processed: 0, hyphenated: 0 }
    });
  } else if (details.reason === 'update') {
    console.log('Georgian Hyphenation Extension updated!');
  }
});

// Listen for tab updates (page loads)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only inject when page is fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    // Skip chrome:// and extension pages
    if (tab.url.startsWith('chrome://') || 
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('about:')) {
      return;
    }

    // Check if extension is enabled
    chrome.storage.local.get(['enabled'], (result) => {
      if (result.enabled !== false) {
        // Check if already injected
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: () => window.georgianHyphenationLoaded
        }).then(results => {
          // Only inject if not already loaded
          if (!results || !results[0] || !results[0].result) {
            console.log('Injecting scripts into tab:', tabId);
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              files: ['js/hyphenator.js', 'js/content.js']
            }).catch(err => {
              // Silent fail for restricted pages
              console.log('Could not inject on:', tab.url, err);
            });
          } else {
            console.log('Scripts already loaded in tab:', tabId);
          }
        }).catch(() => {
          // If check fails, try to inject anyway (might be first load)
          console.log('Check failed, attempting injection on tab:', tabId);
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['js/hyphenator.js', 'js/content.js']
          }).catch(err => {
            console.log('Could not inject on:', tab.url, err);
          });
        });
      }
    });
  }
});

// Keep service worker alive
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  sendResponse({ received: true });
  return true;
});