import { chromium } from 'playwright';
import fs from 'fs';
import { SLMarketplaceWorkflow } from '../workflow/scripts/slMarketplaceWorkflow.js';
import { handleCookiePopup } from '../utils/helpers.js'; // Import helpers

// Read config files
const config = JSON.parse(fs.readFileSync('./workflow/config.json', 'utf8'));
const credentials = JSON.parse(fs.readFileSync('./workflow/credentials.json', 'utf8'));

(async () => {
    console.log("🚀 Launching browser...");
    const browser = await chromium.launch({ headless: false });

    console.log("🌍 Opening new page...");
    const page = await browser.newPage();

    console.log(`🔗 Navigating to: ${config.url}`);
    await page.goto(config.url);

    // Handle cookie popup using the reusable function
    await handleCookiePopup(page);

     // Initialise the workflow
     const slMarketplace = new SLMarketplaceWorkflow(page, config, credentials);
     await slMarketplace.navigateTo(config.url);

     // Perform login
    await slMarketplace.login();

    // Cleanup.
    console.log("⌛ Waiting before closing browser...");
    await page.waitForTimeout(5000);
    
    console.log("❌ Closing browser...");
    await browser.close();

    console.log("✅ Test completed successfully.");
})();
