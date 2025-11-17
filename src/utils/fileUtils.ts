import * as os from 'os';
import * as path from 'path';

/**
 * Get the Downloads folder path based on OS
 */
export const getDownloadsFolder = (): string => {
    const homeDir = os.homedir();
    const platform = os.platform();

    switch (platform) {
        case 'win32':
            return path.join(homeDir, 'Downloads');
        case 'darwin': // macOS
            return path.join(homeDir, 'Downloads');
        case 'linux':
            return path.join(homeDir, 'Downloads');
        default:
            return path.join(homeDir, 'Downloads');
    }
}

/**
 * Generate a safe filename from URL
 * Examples:
 * - https://github.com/trending -> github-com-trending.pdf
 * - https://www.example.com -> example-com.pdf
 * - https://docs.site.com/api/reference -> docs-site-com-api.pdf
 */
export const generateFilenameFromUrl = (url: string): string => {
    try {
        const urlObj = new URL(url);
        let filename = urlObj.hostname.replace(/^www\./, '');

        // Add first path segment if available
        const pathSegments = urlObj.pathname.split('/').filter(s => s);
        if (pathSegments.length > 0) {
            filename += '-' + pathSegments[0];
        }

        // Sanitize filename - remove special characters and replace with hyphens
        filename = filename.replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-');

        return filename + '.pdf';
    } catch (error: any) {
        // Fallback if URL parsing fails
        return 'page.pdf';
    }
}
