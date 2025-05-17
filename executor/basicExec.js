import fs from 'fs';
import { launchBrowser } from '../utils/helpers.js';
import { SLMarketplaceWorkflow } from '../workflow/scripts/slMarketplaceWorkflow.js';

// Load configs and credentials
const fullConfig = JSON.parse(fs.readFileSync('./workflow/setup/productInfo.json', 'utf-8'));
const config = JSON.parse(fs.readFileSync('./workflow/configs/slMarketplaceconfig.json', 'utf8'));
const credentials = JSON.parse(fs.readFileSync('./workflow/credentials.json', 'utf8'));

const products = fullConfig.products || [];

(async () => {
  const { browser, page } = await launchBrowser();
  const slMarketplace = new SLMarketplaceWorkflow(page, config, {}, credentials);

  // Log in and get ready
  await slMarketplace.navigateTo(config.url);
  await slMarketplace.login();
  await slMarketplace.goToMerchantHome();
  await slMarketplace.verifyMerchantHome();
  await slMarketplace.goToInventory();
  await slMarketplace.verifyManageListings();

  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    console.log(`\n📦 Starting: ${product.listingName}`);

    // Inject setupWorkflow into class instance
    slMarketplace.setupWorkflow = product;

    // Lookup and edit the listing
    await slMarketplace.searchListing();
    await slMarketplace.extractListings();
    await slMarketplace.selectCorrectListing();
    
    await page.waitForTimeout(1000); // cooldown between listings
    // Apply Quick Fill for all but first product
    if (index > 0) {
    console.log("⚙️ Performing quick fill for this variant...");
    await slMarketplace.quickFillListing();
    }

    // Fill/edit the listing
    await slMarketplace.addProductListing();
    await slMarketplace.addRelatedItems();
    await slMarketplace.addRevenueDistributions();
    await slMarketplace.saveListing();

    console.log(`✅ Finished editing: ${product.listingName}`);
  }

  console.log("⌛ Waiting before closing browser...");
  await page.waitForTimeout(3000);
  console.log("❌ Closing browser...");
  await browser.close();

  console.log("✅ All products processed.");
})();
