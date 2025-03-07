import { handleCookiePopup } from '../../utils/helpers.js';

export class SLMarketplaceWorkflow {
    constructor(page, config, setupWorkflow, credentials) {
        this.page = page;
        this.config = config;
        this.setupWorkflow = setupWorkflow;
        this.credentials = credentials;

        // Store extracted product listings
        this.extractedListings = [];
    }

    async navigateTo(url) {
        console.log(`🔗 Navigating to: ${url}`);
        await this.page.goto(url);
    }

    async login() {
        // Navigate to the sign in page and action. 
        console.log("🔍 Looking for 'Sign In' button...");
        await this.page.waitForSelector(this.config.selectors.signInButton, { timeout: 10000 });
        console.log("🖱️ Clicking 'Sign In' button...");
        await this.page.click(this.config.selectors.signInButton);       

        // was the navigation successful? wait for page loading just to be sure everything has opened and loaded. 
        console.log("⏳ Waiting for navigation to login page...");
        await this.page.waitForURL('**/openid/login**', { timeout: 10000 });

        // Wait to be sure that username field has appeared so credentials can be entered and then action the login.
        console.log("🔍 Waiting for username field...");
        await this.page.waitForSelector(this.config.selectors.usernameField, { timeout: 10000 });
        console.log("✍️ Entering username...");
        await this.page.fill(this.config.selectors.usernameField, this.credentials.username);
        console.log("🔑 Entering password...");
        await this.page.fill(this.config.selectors.passwordField, this.credentials.password);

        console.log("✅ Clicking 'Log In' button...");
        await this.page.click(this.config.selectors.loginButton);

        // Handle cookie popup AFTER login / precaution.
        await handleCookiePopup(this.page);
    }

    async goToMerchantHome() { 
        // Navigate to our merchant store.
        console.log("🔍 Looking for the username dropdown...");
        let merchant = this.credentials.username;
        await this.page.waitForSelector(`span:has-text("${merchant}")`, { timeout: 10000 });
                // Logged in user, dropdown list 
        console.log("🖱️ Clicking username dropdown...");
        await this.page.click(`span:has-text("${merchant}")`);

        // My marketplace dropdown.
        console.log("🔍 Looking for 'My Marketplace'...");
        await this.page.waitForSelector(this.config.selectors.myMarketplace, { timeout: 10000 });
        console.log("🖱️ Clicking 'My Marketplace'...");
        await this.page.click(this.config.selectors.myMarketplace);

        // merchant marketplace store dropdown list. 
        console.log("🔍 Looking for 'Merchant Home'...");
        await this.page.waitForSelector(this.config.selectors.merchantHome, { timeout: 10000 });
        console.log("🖱️ Clicking 'Merchant Home'...");
        await this.page.click(this.config.selectors.merchantHome);

        console.log("✅ Successfully navigated to Merchant Home.");
    }

    async verifyMerchantHome() {
        console.log("🔍 Verifying Merchant Home page...");
        await this.page.waitForSelector(this.config.selectors.merchantHomeHeader, { timeout: 10000 });
        console.log("✅ Merchant Home verified!");       
    }

    async goToInventory() {
        console.log("🔍 Looking for 'Inventory' link...");   
        await this.page.waitForSelector(this.config.selectors.inventoryLink, { timeout: 10000 });    
        console.log("🖱️ Clicking 'Inventory'...");
        await this.page.click(this.config.selectors.inventoryLink);

        console.log("✅ Navigated to Inventory.");
    }

    async verifyManageListings() { 
        console.log("🔍 Verifying Manage Listings page...");
        await this.page.waitForSelector(this.config.selectors.manageListingsHeader, { timeout: 10000 });
        console.log("✅ Manage Listings verified!");       
    }

    async searchListing() { 
        console.log(`🔍 Searching for listing: ${this.setupWorkflow.listingName}`);

        console.log("🔍 Waiting for search box...");
        await this.page.waitForSelector(this.config.selectors.searchBox, { timeout: 10000 });

        console.log("✍️ Typing listing name...");
        await this.page.fill(this.config.selectors.searchBox, this.setupWorkflow.listingName);
        console.log("🔍 Waiting for search button...");
        await this.page.waitForSelector(this.config.selectors.searchButton, { timeout: 10000 });

        console.log("🖱️ Clicking 'Search'...");
        await this.page.click(this.config.selectors.searchButton);

        console.log("✅ Search executed successfully.");

    }

    async selectCorrectListing() {
        console.log("🔍 Extracting all search results...");
    
        // Wait for search results to appear
        await this.page.waitForSelector(this.config.selectors.listingTable, { timeout: 10000 });
    
        // Get all listing rows
        const listings = await this.page.$$(this.config.selectors.listingRow);
    
        console.log(`📜 Found ${listings.length} listings. Filtering correct one...`);
    
        for (const row of listings) {
            const titleElement = await row.$(this.config.selectors.listingTitle);
            if (!titleElement) continue;
    
            const titleText = await titleElement.innerText();
            
            if (titleText.includes(this.setupWorkflow.listingName)) {
                console.log(`✅ Selecting correct product: ${titleText}`);
    
                // Click the "Actions" dropdown in the same row
                const actionsButton = await row.$(this.config.selectors.actionsDropdown);
                if (actionsButton) {
                    console.log("🖱️ Clicking Actions dropdown...");
                    await actionsButton.click();
                } else {
                    console.error("❌ Actions button not found!");
                    return;
                }
    
                // Click "Edit" within the same row
                const editButton = await row.$(this.config.selectors.editButton);
                if (editButton) {
                    console.log("🖱️ Clicking 'Edit'...");
                    await editButton.click();
                    console.log("✅ Successfully navigated to the product edit page.");
                    return;
                } else {
                    console.error("❌ Edit button not found!");
                    return;
                }
            }
        }
    
        console.error("❌ No matching listing found.");
    }
    
}