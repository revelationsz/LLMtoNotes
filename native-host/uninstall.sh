#!/bin/bash

# LLM to Notes - Native Messaging Host Uninstaller
# This script removes the native messaging host

echo "=========================================="
echo "  LLM to Notes - Native Host Uninstaller"
echo "=========================================="
echo ""

# Configuration
HOST_NAME="com.llmtonotes.host"
INSTALL_DIR="$HOME/.llm-to-notes"

# Browser manifest locations
CHROME_MANIFEST_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
CHROMIUM_MANIFEST_DIR="$HOME/Library/Application Support/Chromium/NativeMessagingHosts"
BRAVE_MANIFEST_DIR="$HOME/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts"
EDGE_MANIFEST_DIR="$HOME/Library/Application Support/Microsoft Edge/NativeMessagingHosts"

echo "Removing browser manifests..."

# Remove Chrome manifest
if [ -f "$CHROME_MANIFEST_DIR/$HOST_NAME.json" ]; then
    rm "$CHROME_MANIFEST_DIR/$HOST_NAME.json"
    echo "  - Removed Google Chrome manifest"
fi

# Remove Chromium manifest
if [ -f "$CHROMIUM_MANIFEST_DIR/$HOST_NAME.json" ]; then
    rm "$CHROMIUM_MANIFEST_DIR/$HOST_NAME.json"
    echo "  - Removed Chromium manifest"
fi

# Remove Brave manifest
if [ -f "$BRAVE_MANIFEST_DIR/$HOST_NAME.json" ]; then
    rm "$BRAVE_MANIFEST_DIR/$HOST_NAME.json"
    echo "  - Removed Brave manifest"
fi

# Remove Edge manifest
if [ -f "$EDGE_MANIFEST_DIR/$HOST_NAME.json" ]; then
    rm "$EDGE_MANIFEST_DIR/$HOST_NAME.json"
    echo "  - Removed Microsoft Edge manifest"
fi

echo ""
echo "Removing installed files..."

if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
    echo "  - Removed $INSTALL_DIR"
else
    echo "  - Install directory not found (already removed?)"
fi

echo ""
echo "=========================================="
echo "  Uninstall Complete!"
echo "=========================================="
echo ""

