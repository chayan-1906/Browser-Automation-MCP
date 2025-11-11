import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer, {Browser, Page} from 'puppeteer';
import {printInConsole} from 'mcp-utils/utils';
import {serverName, transport} from '../server';
import {BrowserConfig, BrowserInstance} from "../types";

class BrowserPool {
    private pools: Map<string, BrowserInstance> = new Map();
    private cleanupInterval: NodeJS.Timeout | null = null;
    private readonly IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    private readonly CLEANUP_INTERVAL = 60 * 1000; // 1 minute

    constructor() {
        this.startCleanupTimer();
    }

    /**
     * Get browser instance from pool or create new one
     */
    async getBrowser(config: BrowserConfig): Promise<Browser> {
        const key = this.getConfigKey(config);
        const existing: BrowserInstance | undefined = this.pools.get(key);

        // Return existing browser if available and connected
        if (existing && existing.browser.connected) {
            existing.lastUsed = Date.now();
            existing.inUse = true;
            const mode = config.headless !== false ? 'headless' : 'visible';
            await printInConsole(transport, `Reusing existing browser instance (${mode} mode)`);
            return existing.browser;
        }

        // Create new browser instance
        const mode = config.headless !== false ? 'headless' : 'visible';
        await printInConsole(transport, `Creating new browser instance (${mode} mode)`);
        const browser = await this.createBrowser(config);

        this.pools.set(key, {
            browser,
            config,
            lastUsed: Date.now(),
            inUse: true,
        });

        return browser;
    }

    /**
     * Create a new browser instance based on config
     */
    private async createBrowser(config: BrowserConfig): Promise<Browser> {
        // Use a persistent user data directory to maintain sessions
        const userDataDir = path.join(os.homedir(), `.${serverName}-mcp`, 'chromium-profile');

        // Create directory if it doesn't exist
        if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir, {recursive: true});
        }

        const launchOptions: any = {
            headless: config.headless !== false, // Default to true
            userDataDir, // Persist sessions here
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
            ],
        };

        const browser = await puppeteer.launch(launchOptions);
        const mode = config.headless !== false ? 'headless' : 'visible';
        await printInConsole(transport, `Browser launched successfully in ${mode} mode (profile: ${userDataDir})`);
        return browser;
    }

    /**
     * Create a new page from browser
     */
    async createPage(browser: Browser): Promise<Page> {
        const page = await browser.newPage();
        await page.setViewport({width: 1920, height: 1080});
        return page;
    }

    /**
     * Generate unique key for browser config
     */
    private getConfigKey(config: BrowserConfig): string {
        return `headless:${config.headless !== false}`;
    }

    /**
     * Start cleanup timer to close idle browsers
     */
    private startCleanupTimer(): void {
        this.cleanupInterval = setInterval(async () => {
            await this.cleanupIdleBrowsers();
        }, this.CLEANUP_INTERVAL) as NodeJS.Timeout;
    }

    /**
     * Clean up idle browsers that haven't been used for IDLE_TIMEOUT
     */
    private async cleanupIdleBrowsers(): Promise<void> {
        const now = Date.now();
        const toRemove: string[] = [];

        for (const [key, instance] of this.pools.entries()) {
            const idleTime = now - instance.lastUsed;

            if (!instance.inUse && idleTime > this.IDLE_TIMEOUT) {
                try {
                    await instance.browser.close();
                    await printInConsole(transport, `Closed idle browser: ${key} (idle for ${Math.round(idleTime / 1000)}s)`);
                    toRemove.push(key);
                } catch (error: any) {
                    await printInConsole(transport, `Error closing browser ${key}: ${error.message}`);
                }
            }
        }

        toRemove.forEach(key => this.pools.delete(key));
    }

    /**
     * Close all browsers and stop cleanup timer
     */
    async closeAll(): Promise<void> {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }

        const closePromises = Array.from(this.pools.values()).map(async (instance) => {
            try {
                await instance.browser.close();
            } catch (error: any) {
                await printInConsole(transport, `Error closing browser: ${error.message}`);
            }
        });

        await Promise.all(closePromises);
        this.pools.clear();
        await printInConsole(transport, 'All browsers closed');
    }
}

export const browserPool = new BrowserPool();
