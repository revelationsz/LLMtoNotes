#!/usr/bin/env python3
"""
Native messaging host for LLM to Notes Chrome extension.
Receives note content from the extension and saves it as markdown files to an Obsidian vault.
"""

import json
import os
import re
import struct
import sys
from datetime import datetime


def read_message():
    """Read a message from Chrome extension via stdin."""
    # Read the message length (first 4 bytes)
    raw_length = sys.stdin.buffer.read(4)
    if not raw_length:
        return None
    
    # Unpack message length as 32-bit unsigned int
    message_length = struct.unpack('I', raw_length)[0]
    
    # Read the message itself
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)


def send_message(message):
    """Send a message to the Chrome extension via stdout."""
    encoded = json.dumps(message).encode('utf-8')
    # Write message length as 32-bit unsigned int
    sys.stdout.buffer.write(struct.pack('I', len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()


def sanitize_name(text, max_length=50, fallback='Untitled'):
    """
    Create a safe filename/folder name from text.
    Removes special characters and limits length.
    """
    # Remove markdown headers
    text = re.sub(r'^#+\s*', '', text)
    
    # Remove special characters except spaces and hyphens
    sanitized = re.sub(r'[^\w\s-]', '', text)
    
    # Replace multiple spaces/underscores with single space
    sanitized = re.sub(r'[\s_]+', ' ', sanitized)
    
    # Strip and limit length
    sanitized = sanitized.strip()[:max_length].strip()
    
    # Fallback if empty
    if not sanitized:
        sanitized = fallback
    
    return sanitized


def get_unique_filepath(folder_path, filename):
    """
    Get a unique filepath, appending timestamp if file exists.
    """
    base_path = os.path.join(folder_path, f"{filename}.md")
    
    if not os.path.exists(base_path):
        return base_path
    
    # Add timestamp to make unique
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return os.path.join(folder_path, f"{filename}_{timestamp}.md")


def save_note(vault_path, content, page_title):
    """
    Save note content as a markdown file in a folder based on page title.
    Creates the folder if it doesn't exist.
    Returns the filepath on success, or error message on failure.
    """
    try:
        # Validate vault path
        if not vault_path:
            return {'success': False, 'error': 'Vault path not configured'}
        
        if not os.path.isdir(vault_path):
            return {'success': False, 'error': f'Vault path does not exist: {vault_path}'}
        
        if not content or not content.strip():
            return {'success': False, 'error': 'Note content is empty'}
        
        # Create folder name from page title
        folder_name = sanitize_name(page_title, max_length=100, fallback='Untitled Conversation')
        folder_path = os.path.join(vault_path, folder_name)
        
        # Create folder if it doesn't exist
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
        
        # Get first line for filename
        first_line = content.strip().split('\n')[0]
        filename = sanitize_name(first_line, max_length=50, fallback='Untitled Note')
        
        # Get unique filepath within the folder
        filepath = get_unique_filepath(folder_path, filename)
        
        # Write the file
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return {
            'success': True,
            'filepath': filepath,
            'filename': os.path.basename(filepath),
            'folder': folder_name
        }
    
    except Exception as e:
        return {'success': False, 'error': str(e)}


def main():
    """Main loop - read messages and process them."""
    while True:
        message = read_message()
        
        if message is None:
            break
        
        action = message.get('action')
        
        if action == 'save':
            vault_path = message.get('vaultPath', '')
            content = message.get('content', '')
            page_title = message.get('pageTitle', 'Untitled Conversation')
            result = save_note(vault_path, content, page_title)
            send_message(result)
        
        elif action == 'ping':
            # Health check
            send_message({'success': True, 'status': 'connected'})
        
        else:
            send_message({'success': False, 'error': f'Unknown action: {action}'})


if __name__ == '__main__':
    main()
