# Note Platform Support Roadmap

This document outlines the implementation approach for supporting various note-taking platforms with LLMtoNotes.

---

## Currently Supported: File-Based Platforms

These platforms work **out of the box** by pointing the vault path to their local folder.

| Platform | Status | Notes |
|----------|--------|-------|
| **Obsidian** | ✅ Supported | Primary target. Point to vault folder. |
| **Logseq** | ✅ Supported | Point to graph folder. May prefer flat structure. |
| **Notable** | ✅ Supported | Point to notes directory. |
| **Typora** | ✅ Supported | Any folder works. |
| **iA Writer** | ✅ Supported | Point to library location. |
| **Joplin** | ✅ Supported | Requires "File system sync" configured. |

### Considerations for File-Based Platforms

- **Folder structure**: Current implementation creates subfolders per conversation. Some apps may prefer flat structures.
- **Frontmatter**: Adding YAML frontmatter could improve compatibility with some apps.
- **Wikilinks vs Markdown links**: Obsidian uses `[[wikilinks]]`, others may prefer standard `[markdown](links)`.

---

## Cloud-Based Platforms (Requires New Implementation)

### Notion

| Attribute | Details |
|-----------|---------|
| **Integration Method** | REST API + OAuth 2.0 |
| **Complexity** | Medium |
| **API Documentation** | https://developers.notion.com/ |
| **Requirements** | Notion Integration token, database/page ID |
| **Rate Limits** | 3 requests/second |

**Implementation Approach:**
- Create a Notion integration in their developer portal
- User authorizes the integration to access their workspace
- Notes saved as new pages in a specified database or under a parent page
- Markdown needs conversion to Notion's block format

**Limitations:**
- Notion's block format differs from markdown (requires conversion)
- OAuth flow requires a redirect URI (complicates extension setup)
- Some markdown features don't map cleanly to Notion blocks

---

### Evernote

| Attribute | Details |
|-----------|---------|
| **Integration Method** | REST API + OAuth 1.0a |
| **Complexity** | High |
| **API Documentation** | https://dev.evernote.com/ |
| **Requirements** | API key (requires approval), OAuth tokens |
| **Rate Limits** | Varies by account type |

**Implementation Approach:**
- Apply for Evernote API key (approval process)
- Implement OAuth 1.0a flow
- Convert markdown to ENML (Evernote Markup Language)
- Save notes to specified notebook

**Limitations:**
- API key approval can take time
- ENML is restrictive and doesn't support all HTML/markdown
- OAuth 1.0a is more complex than modern OAuth 2.0
- API access may be limited for free accounts

---

### Apple Notes

| Attribute | Details |
|-----------|---------|
| **Integration Method** | AppleScript / JXA (JavaScript for Automation) |
| **Complexity** | Low |
| **API Documentation** | macOS Scripting Guide |
| **Requirements** | macOS only, Automation permissions |
| **Rate Limits** | None |

**Implementation Approach:**
- Use AppleScript via the native Python host (`osascript` command)
- Create notes in specified folder
- HTML formatting supported

**Limitations:**
- **macOS only** - no Windows/Linux support
- Limited formatting options
- No folder creation via AppleScript (folders must exist)
- Requires user to grant Automation permissions

**Example AppleScript:**
```applescript
tell application "Notes"
    tell folder "LLM Notes"
        make new note with properties {name:"Title", body:"Content here"}
    end tell
end tell
```

---

### Microsoft OneNote

| Attribute | Details |
|-----------|---------|
| **Integration Method** | Microsoft Graph API + OAuth 2.0 |
| **Complexity** | High |
| **API Documentation** | https://learn.microsoft.com/graph/api/resources/onenote |
| **Requirements** | Azure AD app registration, OAuth tokens |
| **Rate Limits** | 10,000 requests per app per day |

**Implementation Approach:**
- Register app in Azure AD
- Implement OAuth 2.0 with Microsoft identity platform
- Convert markdown to OneNote HTML format
- Create pages in specified notebook/section

**Limitations:**
- Complex Azure AD setup required
- OneNote HTML format has specific requirements
- Enterprise accounts may have additional restrictions
- Limited markdown feature support

---

### Google Keep

| Attribute | Details |
|-----------|---------|
| **Integration Method** | No official API |
| **Complexity** | High (unsupported) |
| **API Documentation** | None |
| **Requirements** | Unofficial methods only |
| **Rate Limits** | N/A |

**Implementation Approach:**
- **Not recommended** - No official API exists
- Possible workarounds:
  - Google Takeout for export only
  - Browser automation (fragile, against ToS)
  - Third-party unofficial APIs (unreliable)

**Limitations:**
- No official API - Google has not provided one
- Any workaround may break without notice
- Potential Terms of Service violations
- Not feasible for reliable integration

---

### Bear

| Attribute | Details |
|-----------|---------|
| **Integration Method** | URL Scheme (x-callback-url) |
| **Complexity** | Low |
| **API Documentation** | https://bear.app/faq/x-callback-url-scheme-documentation/ |
| **Requirements** | macOS/iOS only, Bear installed |
| **Rate Limits** | None |

**Implementation Approach:**
- Use `bear://` URL scheme to create notes
- Can be invoked from Python using `open` command on macOS
- Supports tags, titles, and markdown content

**Limitations:**
- **macOS/iOS only**
- Requires Bear app to be installed
- URL scheme has length limits for very long notes
- No folder organization (uses tags instead)

**Example URL:**
```
bear://x-callback-url/create?title=My%20Note&text=Content%20here&tags=llm,imported
```

---

### Roam Research

| Attribute | Details |
|-----------|---------|
| **Integration Method** | Backend API (unofficial) / Graph API |
| **Complexity** | Medium |
| **API Documentation** | https://roamresearch.com/#/app/developer-documentation |
| **Requirements** | Roam API token, graph name |
| **Rate Limits** | Varies |

**Implementation Approach:**
- Generate API token in Roam settings
- Use Roam's backend API to create/append to pages
- Content uses Roam's block-based format

**Limitations:**
- API is relatively new and may change
- Block-based structure differs from linear markdown
- Requires paid Roam account for API access
- Limited documentation

---

### Craft

| Attribute | Details |
|-----------|---------|
| **Integration Method** | URL Scheme + Craft Extension API |
| **Complexity** | Medium |
| **API Documentation** | https://developer.craft.do/ |
| **Requirements** | macOS/iOS, Craft installed |
| **Rate Limits** | None |

**Implementation Approach:**
- Use `craftdocs://` URL scheme for simple operations
- Craft Extensions for more complex integrations
- Supports markdown import

**Limitations:**
- macOS/iOS only
- Extension API requires separate development
- URL scheme has limitations for complex content

---

## Architecture Considerations

To support multiple platforms, the current architecture would need to evolve:

### Current Flow
```
Browser Extension → Native Host (Python) → File System (Obsidian)
```

### Proposed Multi-Platform Flow
```
Browser Extension → Native Host (Python) → Platform Router
                                              ├── File Handler (Obsidian, Logseq, etc.)
                                              ├── Notion Handler (API)
                                              ├── Apple Notes Handler (AppleScript)
                                              ├── Bear Handler (URL Scheme)
                                              └── ... other handlers
```

### Key Changes Needed

1. **Platform Selection**: Add UI in popup to select target platform
2. **Handler Pattern**: Implement a plugin-like handler for each platform
3. **Credential Storage**: Secure storage for API tokens (for cloud platforms)
4. **Format Conversion**: Markdown → platform-specific format converters
5. **OAuth Flow**: For platforms requiring OAuth, may need a companion web service

---

## Priority Recommendation

Based on complexity and user value:

| Priority | Platform | Reason |
|----------|----------|--------|
| 1 | Apple Notes | Low complexity, native macOS integration |
| 2 | Bear | Low complexity, popular among Mac users |
| 3 | Notion | High demand, manageable complexity |
| 4 | Roam Research | Growing user base, block-based thinking |
| 5 | OneNote | Enterprise users, but high complexity |
| 6 | Evernote | Legacy platform, complex OAuth 1.0a |
| 7 | Google Keep | No official API - not recommended |

---

## Summary Table

| Platform | Method | Complexity | OS Support | Status |
|----------|--------|------------|------------|--------|
| Obsidian | File | ✅ Low | All | ✅ Supported |
| Logseq | File | ✅ Low | All | ✅ Supported |
| Notable | File | ✅ Low | All | ✅ Supported |
| Typora | File | ✅ Low | All | ✅ Supported |
| iA Writer | File | ✅ Low | All | ✅ Supported |
| Joplin | File | ✅ Low | All | ✅ Supported |
| Apple Notes | AppleScript | ✅ Low | macOS | 🔲 Planned |
| Bear | URL Scheme | ✅ Low | macOS/iOS | 🔲 Planned |
| Notion | REST API | ⚠️ Medium | All | 🔲 Planned |
| Roam | API | ⚠️ Medium | All | 🔲 Planned |
| Craft | URL Scheme | ⚠️ Medium | macOS/iOS | 🔲 Planned |
| OneNote | Graph API | ❌ High | All | 🔲 Future |
| Evernote | REST API | ❌ High | All | 🔲 Future |
| Google Keep | None | ❌ N/A | - | ❌ Not Feasible |

