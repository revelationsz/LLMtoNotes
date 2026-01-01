// Background service worker for LLM to Notes
// Handles native messaging communication

const NATIVE_HOST_NAME = 'com.llmtonotes.host';

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveSelectionToNotes',
    title: 'Save Selection to Notes',
    contexts: ['selection'],
    documentUrlPatterns: [
      'https://chatgpt.com/*',
      'https://chat.openai.com/*',
      'https://claude.ai/*'
    ]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'saveSelectionToNotes' && info.selectionText) {
    handleSaveToObsidian(info.selectionText, tab.title)
      .then((response) => {
        if (response && response.success) {
          // Save to local storage for popup display consistency
          chrome.storage.local.get(['notes'], (result) => {
            const notes = result.notes || [];
            const newNote = {
              id: Date.now(),
              content: info.selectionText,
              timestamp: new Date().toISOString(),
              savedToObsidian: true,
              filename: response.filename
            };
            notes.unshift(newNote);
            chrome.storage.local.set({ notes });
          });
        }
      });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveToObsidian') {
    handleSaveToObsidian(message.content, message.pageTitle)
      .then(sendResponse)
      .catch((error) => sendResponse({ success: false, error: error.message }));
    
    // Return true to indicate async response
    return true;
  }
  
  if (message.action === 'testConnection') {
    testNativeConnection()
      .then(sendResponse)
      .catch((error) => sendResponse({ success: false, error: error.message }));
    
    return true;
  }
});

// Save content to Obsidian via native messaging
async function handleSaveToObsidian(content, pageTitle) {
  // Get vault path from storage
  const { vaultPath } = await chrome.storage.local.get(['vaultPath']);
  
  if (!vaultPath) {
    return { success: false, error: 'Vault path not configured. Please set it in the extension popup.' };
  }
  
  return new Promise((resolve) => {
    chrome.runtime.sendNativeMessage(
      NATIVE_HOST_NAME,
      {
        action: 'save',
        vaultPath: vaultPath,
        content: content,
        pageTitle: pageTitle || 'Untitled Conversation'
      },
      (response) => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: `Native messaging error: ${chrome.runtime.lastError.message}. Make sure you've run the installer.`
          });
        } else {
          resolve(response);
        }
      }
    );
  });
}

// Test connection to native host
async function testNativeConnection() {
  return new Promise((resolve) => {
    chrome.runtime.sendNativeMessage(
      NATIVE_HOST_NAME,
      { action: 'ping' },
      (response) => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message
          });
        } else {
          resolve(response);
        }
      }
    );
  });
}
