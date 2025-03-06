import { chromium } from 'playwright';

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

// Browser setup.
export async function launchBrowser() {
    console.log("🚀 Launching browser...");
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    return { browser, page };
}
