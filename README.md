# 🌐 Browser Automation MCP Server: Puppeteer Power for AI Agents

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/en/download)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-24+-red.svg)](https://pptr.dev/)
[![MCP](https://img.shields.io/badge/Model%20Context%20Protocol-Compliant-purple.svg)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

> The ultimate toolset for **AI agents** to perform complex **browser automation** and **web scraping**. Leverage the power of **Puppeteer** to interact with dynamic web content, maintain user sessions, and extract critical data, all via the **Model Context Protocol (MCP)**.

---

## ✨ Key Features

This server equips AI assistants with advanced web interaction capabilities, including:

- **Persistent Sessions:** Automatically manages and reuses Chromium user profiles, allowing login sessions to persist across multiple tool calls (e.g., login once, then browse with `headless: true`).
- **Headless & Visible Modes:** Run automation in the background (`headless: true`) or open a visible browser window (`headless: false`) for manual actions like complex CAPTCHA or initial login.
- **Lazy Content Handling:** Specialized tools to scroll the page and wait for lazy-loaded content or images to appear before capture.
- **Rich Output Formats:** Capture pages as high-quality PDFs or extract focused HTML (full, interactive elements, or structural tree).
- **Custom Script Execution:** Inject and execute custom JavaScript logic to retrieve deeply nested data or perform unique interactions.

## 🧰 Available Tools (9 Powerful Automation Capabilities)

| Tool Name            | Purpose                                                                    | Key Use Case                                                           |
|:---------------------|:---------------------------------------------------------------------------|:-----------------------------------------------------------------------|
| `browse-page`        | Load page, extract text, and capture screenshot.                           | Initial exploration of any URL.                                        |
| `get-page-html`      | Extract full, interactive, or structural HTML.                             | Finding the right CSS selectors for hidden elements.                   |
| `extract-links`      | Scrape all links from a page or a specific container.                      | Discovering navigation paths and related content.                      |
| `click-element`      | Locate and click a specified element on the page.                          | Interacting with buttons, tabs, or forms.                              |
| `scroll-and-capture` | Scroll down to load content and compare before/after states.               | Capturing content from infinite scroll pages.                          |
| `wait-for-selector`  | Pause execution until a dynamic element appears.                           | Waiting for post-login dashboards or AJAX content.                     |
| `execute-script`     | Run custom JavaScript code in the browser context.                         | Complex data extraction or unique client-side tasks.                   |
| `page-to-pdf`        | Generate a complete, printable PDF of the webpage.                         | Archiving a full web page, optionally expanding hidden sections first. |
| `wait-for-user`      | Open a visible browser and wait for manual user interaction (e.g., login). | Handling sites requiring human interaction.                            |

---

## 🛠️ Tech Stack & Architecture

This Model Context Protocol server is built on a robust, asynchronous architecture designed for high concurrency:

- **Core Engine:** **Puppeteer** (Headless Chrome/Chromium API)
- **Framework:** **Node.js** & **Express**
- **Type Safety:** **TypeScript**
- **Validation:** **Zod** (Schema-based input validation)
- **Messaging:** **Model Context Protocol SDK**

## 🚀 Quick Start (Build from Source)

The server requires Node.js (18+) and npm to run.

### 1. Clone the Repository

```bash
git clone https://github.com/chayan-1906/Browser-Automation-MCP.git
cd Browser-Automation-MCP
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the MCP Server

The server runs on port `20254` by default.

```bash
npm run dev
# Server running on http://localhost:20254
```

### 4. Integration

The server automatically registers its tools with connected AI clients (like Claude Code) via the Model Context Protocol. Once running, you can use your AI assistant to perform browser automation tasks immediately.
