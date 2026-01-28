// Popup Script v2.2.4 - Firefox
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

    updateUI(newState);
    
    browser.storage.sync.set({ enabled: newState }).catch(err => {
      console.error('Error saving state:', err);
    });

    sendMessageToTab({ action: 'toggleHyphenation', enabled: newState });
  }

  function handleToggleJustify() {
    if (!toggleJustify) return;
    
    const isActive = toggleJustify.classList.contains('active');
    const newState = !isActive;

    updateJustifyUI(newState);
    
    browser.storage.sync.set({ smartJustify: newState }).catch(err => {
      console.error('Error saving state:', err);
    });

    sendMessageToTab({ action: 'toggleSmartJustify', smartJustify: newState });
  }

  function sendMessageToTab(message) {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (!tabs || !tabs[0]) return;

      browser.tabs.sendMessage(tabs[0].id, message).catch(err => {
        console.log('Could not send message:', err);
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
          
          browser.storage.sync.set({ stats: response.stats });
        }
      }).catch(err => {
        // Silent fail
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