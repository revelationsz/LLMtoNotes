// DOM Elements
const noteInput = document.getElementById('noteInput');
const saveBtn = document.getElementById('saveBtn');
const notesList = document.getElementById('notesList');
const noteCount = document.getElementById('noteCount');
const emptyState = document.getElementById('emptyState');
const clearAllBtn = document.getElementById('clearAllBtn');
const vaultPathInput = document.getElementById('vaultPathInput');
const browseBtn = document.getElementById('browseBtn');
const connectionStatus = document.getElementById('connectionStatus');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadVaultPath();
});

// Event Listeners

// Vault path handling
let isEditing = false;

browseBtn.addEventListener('click', () => {
  if (isEditing) {
    // Save the path
    saveVaultPath(vaultPathInput.value.trim());
    isEditing = false;
    browseBtn.textContent = 'Edit';
    vaultPathInput.readOnly = true;
  } else {
    // Enable editing
    isEditing = true;
    vaultPathInput.readOnly = false;
    vaultPathInput.focus();
    browseBtn.textContent = 'Save';
  }
});

vaultPathInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    saveVaultPath(vaultPathInput.value.trim());
    isEditing = false;
    browseBtn.textContent = 'Edit';
    vaultPathInput.readOnly = true;
  }
});

// Load notes from storage
// function loadNotes() {
//   chrome.storage.local.get(['notes'], (result) => {
//     const notes = result.notes || [];
//     renderNotes(notes);
//   });
// }

// Save a new note
function saveNote() {
  const content = noteInput.value.trim();
  if (!content) return;

  chrome.storage.local.get(['notes'], (result) => {
    const notes = result.notes || [];
    const newNote = {
      id: Date.now(),
      content: content,
      timestamp: new Date().toISOString()
    };
    
    notes.unshift(newNote);
    
    chrome.storage.local.set({ notes }, () => {
      noteInput.value = '';
      renderNotes(notes);
    });
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load vault path from storage
function loadVaultPath() {
  chrome.storage.local.get(['vaultPath'], (result) => {
    if (result.vaultPath) {
      vaultPathInput.value = result.vaultPath;
      vaultPathInput.readOnly = true;
      testConnection();
    } else {
      vaultPathInput.readOnly = true;
      setConnectionStatus('Set vault path to enable Obsidian sync', 'pending');
    }
  });
}

// Save vault path to storage
function saveVaultPath(path) {
  if (!path) {
    setConnectionStatus('Please enter a valid path', 'error');
    return;
  }
  
  chrome.storage.local.set({ vaultPath: path }, () => {
    vaultPathInput.value = path;
    setConnectionStatus('Path saved. Testing connection...', 'pending');
    testConnection();
  });
}

// Test connection to native host
function testConnection() {
  chrome.runtime.sendMessage({ action: 'testConnection' }, (response) => {
    if (chrome.runtime.lastError) {
      setConnectionStatus('Extension error: ' + chrome.runtime.lastError.message, 'error');
      return;
    }
    
    if (response && response.success) {
      setConnectionStatus('Connected to native host', 'success');
    } else {
      const error = response?.error || 'Connection failed';
      setConnectionStatus(error, 'error');
    }
  });
}

// Set connection status display
function setConnectionStatus(message, type) {
  connectionStatus.textContent = message;
  connectionStatus.className = 'connection-status ' + type;
}

