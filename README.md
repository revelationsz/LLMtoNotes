# LLM to Notes - Chrome Extension

A sleek, minimal Chrome extension for quickly capturing and saving notes while browsing.

## Features

- ✨ Clean, dark-themed UI with orange accents
- 📝 Quick note capture with keyboard shortcut (Ctrl/Cmd + Enter)
- 💾 Persistent storage using Chrome's local storage
- 🕐 Relative timestamps for notes
- 🗑️ Delete individual notes or clear all

## Installation

1. **Download/Clone** this repository to your local machine

2. **Open Chrome** and navigate to `chrome://extensions/`

3. **Enable Developer Mode** by toggling the switch in the top-right corner

4. **Click "Load unpacked"** and select the folder containing these extension files

5. The extension icon will appear in your Chrome toolbar!

## Adding Icons

For the extension to display properly, create an `icons` folder and add these icon files:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use any icon or create simple ones using tools like:
- [Favicon.io](https://favicon.io/)
- [IconGenerator](https://www.icongeneratorai.com/)

## Usage

1. Click the extension icon in your toolbar
2. Type your note in the text area
3. Click "Save Note" or press `Ctrl/Cmd + Enter`
4. Your notes are saved and will persist across browser sessions

## File Structure

```
LLMtoNotes/
├── manifest.json    # Extension configuration
├── popup.html       # Popup UI structure
├── popup.css        # Styling
├── popup.js         # Functionality
├── icons/           # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md        # This file
```

## Development

To modify the extension:
1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## License

MIT License - Feel free to modify and use as needed!

