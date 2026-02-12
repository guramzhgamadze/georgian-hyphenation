// Popup Script v2.2.7 - Firefox - FIXED
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

  function loadState() {
    browser.storage.sync.get(['enabled', 'smartJustify', 'stats']).then(result => {
      const isEnabled = result.enabled !== false;
      const smartJustify = result.smartJustify !== false;
      
      console.log('Popup loaded state:', { isEnabled, smartJustify, stats: result.stats });
      
      updateUI(isEnabled);
      updateJustifyUI(smartJustify);

      if (result.stats) {
        wordsProcessed.textContent = result.stats.processed || 0;
        wordsHyphenated.textContent = result.stats.hyphenated || 0;
      }

      loadStats();
    }).catch(err => {
      console.error('Error loading state:', err);
    });
  }

  function handleToggle() {
    const isActive = toggle.classList.contains('active');
    const newState = !isActive;

    console.log('Toggle clicked. New state:', newState);
    
    updateUI(newState);
    
    // ✅ Save to storage first
    browser.storage.sync.set({ enabled: newState }).then(() => {
      console.log('Saved enabled state to storage:', newState);
    }).catch(err => {
      console.error('Error saving state:', err);
    });

    // ✅ Send message to content script
    sendMessageToTab({ action: 'toggleHyphenation', enabled: newState });
  }

  function handleToggleJustify() {
    if (!toggleJustify) return;
    
    const isActive = toggleJustify.classList.contains('active');
    const newState = !isActive;

    console.log('Smart Justify toggled. New state:', newState);
    
    updateJustifyUI(newState);
    
    browser.storage.sync.set({ smartJustify: newState }).then(() => {
      console.log('Saved smartJustify state to storage:', newState);
    }).catch(err => {
      console.error('Error saving state:', err);
    });

    sendMessageToTab({ action: 'toggleSmartJustify', smartJustify: newState });
  }

  function sendMessageToTab(message) {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (!tabs || !tabs[0]) {
        console.error('No active tab found');
        return;
      }

      console.log('Sending message to tab:', tabs[0].id, message);

      browser.tabs.sendMessage(tabs[0].id, message).then(response => {
        console.log('Message sent successfully:', response);
      }).catch(err => {
        console.log('Could not send message:', err.message);
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
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (!tabs || !tabs[0]) return;

      browser.tabs.sendMessage(tabs[0].id, { action: 'getStats' }).then(response => {
        if (response && response.stats) {
          wordsProcessed.textContent = response.stats.processed || 0;
          wordsHyphenated.textContent = response.stats.hyphenated || 0;
          
          // Save to storage for persistence
          browser.storage.sync.set({ stats: response.stats });
        }
      }).catch(err => {
        // Silent fail - content script might not be loaded
      });
    });
  }

  // Event listeners
  toggle.addEventListener('click', handleToggle);
  
  if (toggleJustify) {
    toggleJustify.addEventListener('click', handleToggleJustify);
  }

  // Initialize
  loadState();

  // Refresh stats every 2 seconds
  const statsInterval = setInterval(loadStats, 2000);
  
  window.addEventListener('unload', () => {
    clearInterval(statsInterval);
  });

})();