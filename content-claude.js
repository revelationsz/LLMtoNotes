// Content script for injecting save buttons into Claude responses

const INJECTED_ATTR = 'data-llm-notes-injected';

// Inject save button into a Claude response
function injectSaveButton(responseDiv) {
  // Skip if already processed
  if (responseDiv.hasAttribute(INJECTED_ATTR)) {
    return;
  }
  
  // Skip if still streaming
  if (responseDiv.getAttribute('data-is-streaming') === 'true') {
    return;
  }
  
  // Mark as processed
  responseDiv.setAttribute(INJECTED_ATTR, 'true');
  
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
    
    // Extract text content from the font-claude-response div
    const contentDiv = responseDiv.querySelector('.font-claude-response');
    let textContent = contentDiv ? contentDiv.innerText.trim() : responseDiv.innerText.trim();
    
    // Remove "Save to Notes" button text that gets captured
    textContent = textContent.replace(/Save to Notes\n?/g, '');
    textContent = textContent.trim();
    
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
    
    // Get the page title for folder organization
    const pageTitle = document.title || 'Untitled Conversation';
    
    // Send to background script for native messaging
    chrome.runtime.sendMessage(
      { action: 'saveToObsidian', content: textContent, pageTitle: pageTitle },
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
  
  // Insert button at the beginning of the response div
  responseDiv.insertBefore(buttonContainer, responseDiv.firstChild);
}

// Process all existing Claude responses
function processExistingResponses() {
  // Select divs that are finished streaming (Claude responses)
  const responses = document.querySelectorAll('div[data-is-streaming="false"]');
  responses.forEach(injectSaveButton);
}

// Set up MutationObserver to detect new responses and streaming completion
function setupObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // Check for attribute changes (streaming -> finished)
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-is-streaming') {
        const target = mutation.target;
        if (target.getAttribute('data-is-streaming') === 'false') {
          injectSaveButton(target);
        }
      }
      
      // Check added nodes
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        
        // Check if the added node is a completed response
        if (node.matches && node.matches('div[data-is-streaming="false"]')) {
          injectSaveButton(node);
        }
        
        // Check descendants for completed responses
        if (node.querySelectorAll) {
          const responses = node.querySelectorAll('div[data-is-streaming="false"]');
          responses.forEach(injectSaveButton);
        }
      }
    }
  });
  
  // Observe the entire document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-is-streaming']
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

