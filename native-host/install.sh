#!/bin/bash

# LLM to Notes - Native Messaging Host Installer
# This script installs the native messaging host for the Chrome extension

set -e

echo "=========================================="
echo "  LLM to Notes - Native Host Installer"
echo "=========================================="
echo ""

# Configuration
HOST_NAME="com.llmtonotes.host"
INSTALL_DIR="$HOME/.llm-to-notes"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Detect browser and set manifest location
CHROME_MANIFEST_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
CHROMIUM_MANIFEST_DIR="$HOME/Library/Application Support/Chromium/NativeMessagingHosts"
BRAVE_MANIFEST_DIR="$HOME/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts"
EDGE_MANIFEST_DIR="$HOME/Library/Application Support/Microsoft Edge/NativeMessagingHosts"

# Fixed extension ID (derived from the key in manifest.json)
EXTENSION_ID="jlopaibpmommnelcgjmjjhkcbflfecjl"

# Create install directory
echo ""
echo "Creating install directory: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

# Copy Python script
echo "Installing native host script..."
cp "$SCRIPT_DIR/llm_to_notes_host.py" "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/llm_to_notes_host.py"

# Create the manifest with correct paths and extension ID
MANIFEST_CONTENT=$(cat <<EOF
{
  "name": "$HOST_NAME",
  "description": "Native messaging host for LLM to Notes extension",
  "path": "$INSTALL_DIR/llm_to_notes_host.py",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://$EXTENSION_ID/"]
}
EOF
)

# Install for Chrome
if [ -d "$HOME/Library/Application Support/Google/Chrome" ]; then
    echo "Installing manifest for Google Chrome..."
    mkdir -p "$CHROME_MANIFEST_DIR"
    echo "$MANIFEST_CONTENT" > "$CHROME_MANIFEST_DIR/$HOST_NAME.json"
fi

# Install for Chromium
if [ -d "$HOME/Library/Application Support/Chromium" ]; then
    echo "Installing manifest for Chromium..."
    mkdir -p "$CHROMIUM_MANIFEST_DIR"
    echo "$MANIFEST_CONTENT" > "$CHROMIUM_MANIFEST_DIR/$HOST_NAME.json"
fi

# Install for Brave
if [ -d "$HOME/Library/Application Support/BraveSoftware/Brave-Browser" ]; then
    echo "Installing manifest for Brave..."
    mkdir -p "$BRAVE_MANIFEST_DIR"
    echo "$MANIFEST_CONTENT" > "$BRAVE_MANIFEST_DIR/$HOST_NAME.json"
fi

# Install for Edge
if [ -d "$HOME/Library/Application Support/Microsoft Edge" ]; then
    echo "Installing manifest for Microsoft Edge..."
    mkdir -p "$EDGE_MANIFEST_DIR"
    echo "$MANIFEST_CONTENT" > "$EDGE_MANIFEST_DIR/$HOST_NAME.json"
fi

echo ""
echo "=========================================="
echo "  Installation Complete!"
echo "=========================================="
echo ""
echo "Native host installed to: $INSTALL_DIR"
echo "Extension ID: $EXTENSION_ID"
echo ""
echo "Next steps:"
echo "  1. Reload the extension in chrome://extensions/"
echo "  2. Open the extension popup"
echo "  3. Set your Obsidian vault path"
echo "  4. Start saving notes from ChatGPT!"
echo ""
