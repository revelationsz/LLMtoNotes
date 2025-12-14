// Content script for injecting save buttons into ChatGPT responses

const INJECTED_ATTR = 'data-llm-notes-injected';

// Inject save button into an assistant response article
function injectSaveButton(article) {
  // Skip if already processed
  if (article.hasAttribute(INJECTED_ATTR)) {
    return;
  }
  
  // Mark as processed
  article.setAttribute(INJECTED_ATTR, 'true');
  
  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'llm-notes-btn-container';
  
  // Create save button
  const saveBtn = document.createElement('button');
  saveBtn.className = 'llm-notes-save-btn';
  saveBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
    <span>Save to Notes</span>
  `;
  
  // Handle click
  saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Extract text content from the article
    const textContent = article.innerText.trim();
    
    if (!textContent) {
      return;
    }
    
    // Show saving state
    saveBtn.disabled = true;
    saveBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning">
        <circle cx="12" cy="12" r="10"/>
      </svg>
      <span>Saving...</span>
    `;
    
    // Send to background script for native messaging
    chrome.runtime.sendMessage(
      { action: 'saveToObsidian', content: textContent },
      (response) => {
        saveBtn.disabled = false;
        
        if (response && response.success) {
          // Show success feedback
          saveBtn.classList.add('saved');
          saveBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Saved!</span>
          `;
          
          // Also save to local storage for popup display
          chrome.storage.local.get(['notes'], (result) => {
            const notes = result.notes || [];
            const newNote = {
              id: Date.now(),
              content: textContent,
              timestamp: new Date().toISOString(),
              savedToObsidian: true,
              filename: response.filename
            };
            notes.unshift(newNote);
            chrome.storage.local.set({ notes });
          });
        } else {
          // Show error feedback
          saveBtn.classList.add('error');
          const errorMsg = response?.error || 'Save failed';
          saveBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span title="${errorMsg}">Error</span>
          `;
        }
        
        // Reset after 2 seconds
        setTimeout(() => {
          saveBtn.classList.remove('saved', 'error');
          saveBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <span>Save to Notes</span>
          `;
        }, 2000);
      }
    );
  });
  
  buttonContainer.appendChild(saveBtn);
  
  // Find the nested agent-turn container (two levels deep in the article)
  const agentTurnContainer = article.querySelector('.agent-turn');
  
  if (agentTurnContainer) {
    // Insert at the beginning of the agent-turn div
    agentTurnContainer.insertBefore(buttonContainer, agentTurnContainer.firstChild);
  } else {
    // Fallback: insert at beginning of article if structure differs
    article.insertBefore(buttonContainer, article.firstChild);
  }
}

// Process all existing assistant responses
function processExistingResponses() {
  const articles = document.querySelectorAll('article[data-turn="assistant"]');
  articles.forEach(injectSaveButton);
}

// Set up MutationObserver to detect new responses
function setupObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // Check added nodes
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        
        // Check if the added node is an assistant article
        if (node.matches && node.matches('article[data-turn="assistant"]')) {
          injectSaveButton(node);
        }
        
        // Check descendants for assistant articles
        if (node.querySelectorAll) {
          const articles = node.querySelectorAll('article[data-turn="assistant"]');
          articles.forEach(injectSaveButton);
        }
      }
    }
  });
  
  // Observe the entire document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}

// Initialize
function init() {
  // Process any existing responses
  processExistingResponses();
  
  // Set up observer for new responses
  setupObserver();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
