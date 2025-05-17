import { chromium } from 'playwright';

// Browser setup. // We can add more browsers here, and update with a fw.config to select the browser to launch with. 
export async function launchBrowser() {
    console.log("🚀 Launching browser...");

    const browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized'] // Maximize the window
    });

    const context = await browser.newContext({
        viewport: null // Don't override the native window size
    });

    const page = await context.newPage();
    return { browser, page };
}


// Helper handler for cookie popup
export async function handleCookiePopup(page) {
    const acceptButtonSelector = '#onetrust-accept-btn-handler'; // Correct selector

    try {
        // Wait up to 5 seconds for the popup (if it appears)
        const popupExists = await page.waitForSelector(acceptButtonSelector, { timeout: 5000 }).then(() => true).catch(() => false);

        if (popupExists) {
            console.log("🍪 Cookie popup detected! Clicking 'Accept All'...");
            await page.click(acceptButtonSelector);
            await page.waitForTimeout(1000); // Ensure the popup disappears
        } else {
            console.log("✅ No cookie popup detected.");
        }
    } catch (error) {
        console.log("⚠️ Error handling cookie popup:", error);
    }
}
