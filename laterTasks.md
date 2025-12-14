# Later Tasks

## Setup

### Why the Extension ID is Required

The extension ID is needed for **security purposes** in Chrome's Native Messaging API. The `allowed_origins` field in the native messaging manifest (`com.llmtonotes.host.json`) ensures that **only your specific extension** can communicate with the native host. Without this restriction, any malicious extension could potentially send commands to the Python script and write arbitrary files to your Obsidian vault.

### Why It Can't Be Fully Automatic (for unpacked extensions)

When you load an extension unpacked (Developer mode), Chrome generates a **random extension ID** based on the path where the extension is loaded from. This ID:
- Changes if you move the extension folder
- Is different on every machine
- Is not known until after the extension is loaded

### Ways to Make It Automatic or Easier

1. **Publish to Chrome Web Store** – Published extensions get a **permanent, fixed extension ID**. You could then hardcode it in `install.sh` and users would never need to enter it manually.

2. **Use an Extension Key** – You can add a `"key"` field to your `manifest.json` with a generated public key. This gives your extension a consistent ID across all installs, even when unpacked. You would:
   - Generate a key pair
   - Add the public key to `manifest.json`
   - Hardcode the resulting fixed ID in your installer

3. **Auto-detect via the extension itself** – The extension can query its own ID with `chrome.runtime.id`, display it prominently in the popup, or even copy it to clipboard for easier pasting.

4. **Wildcard origins (NOT recommended)** – Chrome does not support wildcards in `allowed_origins` for security reasons, so this isn't an option.

The most practical solution for development/personal use is **option 2** (using a fixed key in manifest.json). For distribution, **option 1** (publishing) is the cleanest approach.
