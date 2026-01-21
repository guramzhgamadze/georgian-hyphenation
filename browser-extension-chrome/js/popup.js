// Popup Script - Final Version with Auto-Injection
(function() {
  'use strict';

  const toggle = document.getElementById('toggle');
  const status = document.getElementById('status');
  const wordsProcessed = document.getElementById('wordsProcessed');
  const wordsHyphenated = document.getElementById('wordsHyphenated');

  if (!toggle || !status || !wordsProcessed || !wordsHyphenated) {
    console.error('Georgian Hyphenation: UI elements not found');
    return;
  }

  // Inject content script into current tab if not already injected
  function injectContentScript(tabId) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['js/hyphenator.js', 'js/content.js']
    }).catch(err => {
      // Silent fail - might be restricted page
      console.log('Could not inject script:', err);
    });
  }

  // Load current state
  function loadState() {
    chrome.storage.local.get(['enabled', 'stats'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error loading state:', chrome.runtime.lastError);
        return;
      }

      const isEnabled = result.enabled !== false;
      updateUI(isEnabled);

      if (result.stats) {
        wordsProcessed.textContent = result.stats.processed || 0;
        wordsHyphenated.textContent = result.stats.hyphenated || 0;
      }
    });
  }

  // Toggle click handler
  function handleToggle() {
    const isActive = toggle.classList.contains('active');
    const newState = !isActive;

    updateUI(newState);
    
    // Save state
    chrome.storage.local.set({ enabled: newState }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving state:', chrome.runtime.lastError);
        return;
      }
    });

    // Get current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError || !tabs || !tabs[0]) {
        return;
      }

      const tabId = tabs[0].id;

      // Try to send message first
      chrome.tabs.sendMessage(
        tabId,
        { action: 'toggle', enabled: newState },
        (response) => {
          if (chrome.runtime.lastError) {
            // Content script not loaded - inject it
            console.log('Content script not loaded, injecting...');
            injectContentScript(tabId);
            
            // Wait a bit and try again
            setTimeout(() => {
              chrome.tabs.sendMessage(
                tabId,
                { action: 'toggle', enabled: newState },
                () => {
                  // Ignore errors
                  if (chrome.runtime.lastError) {
                    console.log('Script injection might be restricted on this page');
                  }
                }
              );
            }, 500);
          }
        }
      );
    });
  }

  // Update UI
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

  // Request stats from content script
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
            // Silent fail
            return;
          }
          
          if (response && response.stats) {
            wordsProcessed.textContent = response.stats.processed || 0;
            wordsHyphenated.textContent = response.stats.hyphenated || 0;
          }
        }
      );
    });
  }

  // Event listeners
  toggle.addEventListener('click', handleToggle);

  // Initialize
  loadState();
  loadStats();

})();