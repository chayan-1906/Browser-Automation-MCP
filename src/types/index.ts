import {Browser} from "puppeteer";

export interface BrowserConfig {
    headless?: boolean;
}

export interface BrowserInstance {
    browser: Browser;
    config: BrowserConfig;
    lastUsed: number;
    inUse: boolean;
}

export interface BrowserOptions {
    headless?: boolean;
}

export interface BrowsePageParams extends BrowserOptions {
    url: string;
    timeout?: number;
}

export interface ExtractLinksParams extends BrowserOptions {
    url: string;
    selector?: string;
}

export interface ClickElementParams extends BrowserOptions {
    url: string;
    selector: string;
    waitTime?: number;
}

export interface WaitForSelectorParams extends BrowserOptions {
    url: string;
    selector: string;
    timeout?: number;
}

export interface ExecuteScriptParams extends BrowserOptions {
    url: string;
    script: string;
}

export interface ScrollAndCaptureParams extends BrowserOptions {
    url: string;
    scrollDistance?: string | number;
}

export interface PageToPdfParams extends BrowserOptions {
    url: string;
    outputPath: string;
    clickSelectors?: string[];
    waitTimeAfterClick?: number;
}

export interface LinkInfo {
    text: string;
    href: string;
    selector: string;
}

export interface PageContent {
    title: string;
    text: string;
    screenshot: string;
}

export interface BrowsePageResult {
    success: boolean;
    url: string;
    content: PageContent;
    loadTime: number;
}
