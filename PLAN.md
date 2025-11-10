# MCP Server Plan: Website Browser

## 1. Purpose

Enable Claude to access and read complete website content, including JavaScript-rendered elements, navigation menus, and dynamically loaded components that standard web fetching cannot retrieve.

## 2. Solution

### 2.1 Packages to Install ✅

```bash
npm install puppeteer
npm install @types/node
npm install @modelcontextprotocol/sdk
```

### 2.2 Internal Operations

1. **Browser Connection Modes**: Support multiple browser launch strategies
   - **Mode 1 - Headless (default)**: Launch new headless Chromium instance
   - **Mode 2 - Connect to Running**: Connect to existing Chrome with remote debugging
     - User starts Chrome with: `chrome.exe --remote-debugging-port=9222`
     - Server connects via: `puppeteer.connect({ browserURL: 'http://localhost:9222' })`
   - **Mode 3 - Use Profile**: Launch with specific Chrome profile
     - Use profile path: `puppeteer.launch({ userDataDir: 'C:\\Users\\Name\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1' })`
     - Benefits: Logged-in sessions, cookies, extensions, personalized settings

2. **Browser Pool Management**: Maintain a pool of reusable browser instances
   - Initialize browser on first request based on configured mode
   - Reuse browser instance across multiple tool calls
   - Clean up idle browsers after timeout
   - Handle browser crashes and auto-restart

3. **Page Navigation**: Navigate to the target URL with timeout handling

4. **Content Extraction**:
   - Wait for page load (networkidle2)
   - Extract all visible text, links, and DOM structure
   - Capture a screenshot as base64

5. **Resource Cleanup**: Close pages after each request, close browser only on shutdown

6. **Error Handling**: Catch navigation failures, timeouts, and blocked sites

### 2.3 Common Parameters (All Tools)

Every tool accepts these optional parameters for browser mode selection:
- **`mode`**: "headless" | "connect" | "profile" (default: "headless")
- **`profilePath`**: Chrome profile directory path (required if mode="profile")
- **`debuggingPort`**: Remote debugging port (default: 9222, used if mode="connect")
- **`headless`**: true/false (default: true, only for mode="headless")

**User Interaction Flow:**
1. User: "Browse example.com using my Chrome profile"
2. Claude asks: "What's your Chrome profile path?"
3. User: "C:\\Users\\John\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1"
4. Tool call: `browse_page(url, mode="profile", profilePath="...")`

### 2.4 Tools (7 total)

**Tool 1: `browse_page`**
- Input: URL + [common params]
- Output: Screenshot (base64) + visible text + page title
- Use: Initial page load

**Tool 2: `extract_links`**
- Input: URL, CSS selector (optional) + [common params]
- Output: Array of `{text, href, selector}`
- Use: Get navigation/component links

**Tool 3: `click_element`**
- Input: URL, CSS selector, wait time (ms) + [common params]
- Output: Screenshot + text after click
- Use: Click tabs, buttons, dropdowns

**Tool 4: `wait_for_selector`**
- Input: URL, CSS selector, timeout (ms) + [common params]
- Output: Success status + screenshot when element appears
- Use: Wait for dynamic content to load before interaction

**Tool 5: `execute_script`**
- Input: URL, JavaScript code + [common params]
- Output: Script return value + screenshot
- Use: Custom interactions, data extraction

**Tool 6: `scroll_and_capture`**
- Input: URL, scroll distance ("bottom" or px) + [common params]
- Output: Screenshot + newly visible text
- Use: Lazy-loaded content

**Tool 7: `page_to_pdf`**
- Input: URL, click actions (optional array of selectors), output path + [common params]
- Output: PDF file path + base64
- Use: Save the complete page with all tabs/sections expanded
- Special: Can automate clicking multiple elements before generating PDF

### 2.5 Workflow Examples

**Example 1: Headless browsing (default)**
```
browse_page(url="https://example.com")
→ Uses default headless mode
```

**Example 2: Using Chrome profile**
```
User: "Browse my bank website using my Chrome profile"
Claude: "What's your Chrome profile path?"
User: "C:\Users\John\AppData\Local\Google\Chrome\User Data\Profile 1"
Claude calls: browse_page(
  url="https://bank.com",
  mode="profile",
  profilePath="C:\Users\John\AppData\Local\Google\Chrome\User Data\Profile 1"
)
→ Opens with saved cookies, logged-in session
```

**Example 3: Connect to running Chrome**
```
User: "Connect to my running Chrome on port 9222"
Claude calls: browse_page(
  url="https://example.com",
  mode="connect",
  debuggingPort=9222
)
→ Uses your currently open Chrome browser
```

**Example 4: Tab interaction**
```
1. browse_page(url) → See "Code" tab exists
2. wait_for_selector(url, selector='button[data-tab="code"]') → Ensure button is ready
3. click_element(url, selector='button[data-tab="code"]') → Get code content
```

### 2.6 Final Output Format

```json
{
  "success": true,
  "url": "https://example.com",
  "screenshot": "base64_encoded_image_data",
  "content": {
    "title": "Page Title",
    "text": "All extracted text...",
    "links": [
      {"text": "Component Name", "href": "/docs/component"}
    ],
    "metadata": {
      "loadTime": 1234,
      "viewport": "1920x1080"
    }
  }
}
```

**Key Implementation Details**:
- Set `--no-sandbox` and `--disable-setuid-sandbox` flags for Puppeteer if running in Docker/containers
- Browser instance pool: Reuse browser across requests for 10x performance improvement
- Auto-cleanup: Close idle browsers after 5 minutes of inactivity
- Profile mode benefits: Access authenticated sessions, use extensions, bypass anti-bot detection
- Windows profile paths: `C:\Users\<Name>\AppData\Local\Google\Chrome\User Data\<Profile Name>`
- Mac profile paths: `~/Library/Application Support/Google/Chrome/<Profile Name>`
- Linux profile paths: `~/.config/google-chrome/<Profile Name>`
