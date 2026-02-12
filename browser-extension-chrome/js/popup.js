// Popup Script v2.2.7 - Fixed Toggle Communication
(function() {
  'use strict';

  const toggle = document.getElementById('toggle');
  const toggleJustify = document.getElementById('toggleJustify');
  const status = document.getElementById('status');
  const wordsProcessed = document.getElementById('wordsProcessed');
  const wordsHyphenated = document.getElementById('wordsHyphenated');

  if (!toggle || !status || !wordsProcessed || !wordsHyphenated) {
    console.error('Georgian Hyphenation: UI elements not found');
    return;
  }

  function injectContentScript(tabId) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['js/hyphenator.js', 'js/content.js']
    }).catch(err => {
      console.log('Could not inject script:', err);
    });
  }

  function loadState() {
    chrome.storage.sync.get(['enabled', 'smartJustify', 'stats'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error loading state:', chrome.runtime.lastError);
        return;
      }

      const isEnabled = result.enabled !== false;
      const smartJustify = result.smartJustify !== false;
      
      console.log('Popup loaded state:', { isEnabled, smartJustify, stats: result.stats });
      
      updateUI(isEnabled);
      updateJustifyUI(smartJustify);

      // Load stats from storage first
      if (result.stats) {
        wordsProcessed.textContent = result.stats.processed || 0;
        wordsHyphenated.textContent = result.stats.hyphenated || 0;
      }

      // Then try to get live stats from content script
      loadStats();
    });
  }

  function handleToggle() {
    const isActive = toggle.classList.contains('active');
    const newState = !isActive;

    console.log('Toggle clicked. New state:', newState);
    
    updateUI(newState);
    
    // ✅ Save to storage first
    chrome.storage.sync.set({ enabled: newState }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving state:', chrome.runtime.lastError);
        return;
      }
      console.log('Saved enabled state to storage:', newState);
    });

    // ✅ Then send message to content script
    sendMessageToTab({ action: 'toggleHyphenation', enabled: newState });
  }

  function handleToggleJustify() {
    if (!toggleJustify) return;
    
    const isActive = toggleJustify.classList.contains('active');
    const newState = !isActive;

    console.log('Smart Justify toggled. New state:', newState);
    
    updateJustifyUI(newState);
    
    chrome.storage.sync.set({ smartJustify: newState }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving state:', chrome.runtime.lastError);
        return;
      }
      console.log('Saved smartJustify state to storage:', newState);
    });

    sendMessageToTab({ action: 'toggleSmartJustify', smartJustify: newState });
  }

  function sendMessageToTab(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError || !tabs || !tabs[0]) {
        console.error('Error querying tabs:', chrome.runtime.lastError);
        return;
      }

      const tabId = tabs[0].id;
      
      console.log('Sending message to tab:', tabId, message);

      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Content script not loaded, injecting...', chrome.runtime.lastError.message);
          injectContentScript(tabId);
          
          // Wait and try again
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, message, (response) => {
              if (chrome.runtime.lastError) {
                console.log('Script injection might be restricted on this page');
              } else {
                console.log('Message sent successfully after injection:', response);
              }
            });
          }, 500);
        } else {
          console.log('Message sent successfully:', response);
        }
      });
    });
  }

  function updateUI(isEnabled) {
    if (isEnabled) {
      toggle.classList.add('active');
      status.classList.add('active');
      status.textContent = '✅ გააქტიურებულია';
    } else {
      toggle.classList.remove('active');
      status.classList.remove('active');
      status.textContent = '⏸️ გამორთულია';
    }
  }

  function updateJustifyUI(isEnabled) {
    if (!toggleJustify) return;
    
    if (isEnabled) {
      toggleJustify.classList.add('active');
    } else {
      toggleJustify.classList.remove('active');
    }
  }

  function loadStats() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError || !tabs || !tabs[0]) {
        return;
      }

      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'getStats' },
        (response) => {
          if (chrome.runtime.lastError) {
            // Content script not loaded - stats will come from storage
            console.log('Could not get live stats:', chrome.runtime.lastError.message);
            return;
          }
          
          if (response && response.stats) {
            wordsProcessed.textContent = response.stats.processed || 0;
            wordsHyphenated.textContent = response.stats.hyphenated || 0;
            
            // Save to storage for persistence
            chrome.storage.sync.set({ stats: response.stats });
          }
        }
      );
    });
  }

  // Event listeners
  toggle.addEventListener('click', handleToggle);
  
  if (toggleJustify) {
    toggleJustify.addEventListener('click', handleToggleJustify);
  }

  // Initialize
  loadState();

  // Refresh stats every 2 seconds while popup is open
  const statsInterval = setInterval(loadStats, 2000);
  
  // Cleanup on popup close
  window.addEventListener('unload', () => {
    clearInterval(statsInterval);
  });

})();