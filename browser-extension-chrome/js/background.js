// Background Service Worker v2.2.4
console.log('Georgian Hyphenation v2.2.4: Background service worker loaded');

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Georgian Hyphenation v2.2.4: Extension installed!');
    
    chrome.storage.local.set({
      enabled: true,
      stats: { processed: 0, hyphenated: 0 },
      version: '2.2.4'
    });
  } else if (details.reason === 'update') {
    console.log('Georgian Hyphenation v2.2.4: Extension updated!');
    
    // Update version in storage
    chrome.storage.local.set({ version: '2.2.4' });
  }
});

// Listen for tab updates (page loads)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Skip restricted URLs
    if (tab.url.startsWith('chrome://') || 
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('about:') ||
        tab.url.startsWith('edge://')) {
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
          if (!results || !results[0] || !results[0].result) {
            console.log('Georgian Hyphenation v2.2.4: Injecting into tab', tabId);
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              files: ['js/hyphenator.js', 'js/content.js']
            }).catch(err => {
              console.log('Could not inject:', err.message);
            });
          }
        }).catch(() => {
          // Try injection anyway
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['js/hyphenator.js', 'js/content.js']
          }).catch(() => {});
        });
      }
    });
  }
});

// Keep service worker alive
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  sendResponse({ received: true, version: '2.2.4' });
  return true;
});