import { chromium } from 'playwright';
import fs from 'fs';
import { handleCookiePopup, launchBrowser } from '../utils/helpers.js'; // Import helpers

// Specify the workflow to use
import { SLMarketplaceWorkflow } from '../workflow/scripts/slMarketplaceWorkflow.js';

// Read config files for the specified workflow
const setupWorkflow = JSON.parse(fs.readFileSync('./workflow/setup/productInfo.json', 'utf-8'));
const config = JSON.parse(fs.readFileSync('./workflow/configs/slMarketplaceconfig.json', 'utf8'));
const credentials = JSON.parse(fs.readFileSync('./workflow/credentials.json', 'utf8'));

// Can add in an additional config param later on, which decides what walkthrough to use, this way we can have an additional script -
// containing case/conditional statements to determine which workflow to use. 

(async () => {

    // Launch browser using helper
    const { browser, page } = await launchBrowser();

     // Initialise the workflow
    const slMarketplace = new SLMarketplaceWorkflow(page, config, setupWorkflow, credentials);

    // Navigate and action the login.
    await slMarketplace.navigateTo(config.url);
    await slMarketplace.login();
    
    // Go to the merchant home area. 
    await slMarketplace.goToMerchantHome();
    await slMarketplace.verifyMerchantHome();

    // Navigate to the merchant inventory.
    await slMarketplace.goToInventory();
    await slMarketplace.verifyManageListings();
    
    // Search for the product.
    await slMarketplace.searchListing();

    // Cleanup.
    console.log("⌛ Waiting before closing browser...");
    await page.waitForTimeout(5000);
    
    console.log("❌ Closing browser...");
    //await browser.close();

    console.log("✅ Test completed successfully.");
})();
