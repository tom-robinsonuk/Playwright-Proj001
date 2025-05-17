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
        // Handle cookie popup AFTER login / precaution.
        await handleCookiePopup(this.page);
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
    
    async extractListings() {
        console.log("🔍 Extracting all search results...");   

        // Wait for search results
        await this.page.waitForSelector(this.config.selectors.listingTable, { timeout: 10000 });

        // Get all the listing rows
        const listings = await this.page.$$eval(this.config.selectors.listingRow, rows =>
            rows.map(row => {
                const titleElement = row.querySelector('td.title a');
                const quantityElement = row.querySelector('td.qty-on-hand');

                return {
                    name: titleElement ? titleElement.innerText.trim() : "",
                    url: titleElement ? titleElement.href : "",
                    quantity: quantityElement ? quantityElement.innerText.trim() : "0",
                    rowSelector: row.querySelector('td.title a') ? `a:has-text('${titleElement.innerText.trim()}')` : null
                };
            })
        );

        // Store the extracted listings
        this.extractedListings = listings;
        console.log(`📜 Stored ${listings.length} listings...`);
    }

    async selectCorrectListing() {
        console.log("🔍 Checking stored listings...");

        // Fallback check: Ensure that we have extracted all the listings for the product Listing name.
        if (this.extractedListings.length === 0) {
            console.error("❌ No listings stored! Running search again...");
            await this.searchListing();
            await this.extractListings();
        }
        for (const listing of this.extractedListings) {
            if (listing.name.includes(this.setupWorkflow.listingName)) {
                console.log(`✅ Selecting: ${listing.name}`);

                // Find the correct row that contains this listing name
                const row = await this.page.locator(`table.inventory tbody tr:has-text("${listing.name}")`).first();
                await row.waitFor({ state: 'visible' });

                const actionsButton = await row.locator(this.config.selectors.actionsDropdown);
                await actionsButton.click();

                const editButton = await row.locator(this.config.selectors.editButton);
                await editButton.click();

                console.log("✅ Successfully navigated to the product edit page.");
                return;
            }
        }
            console.error("❌ No matching listing found in stored data.");
    }

    async processAllListings() {
        console.log("🔄 Processing all extracted listings...");       

        // Fallback check: Ensure that we have extracted all the listings for the product Listing name.
        if (this.extractedListings.length === 0) {
            console.error("❌ No listings stored! Running search again...");
            await this.searchListing();
            await this.extractListings();
        }

        for (const listing of this.extractedListings) {
            console.log(`✅ Processing: ${listing.name}`);
    
            // Find the correct row that contains this listing name
            const row = await this.page.locator(`table.inventory tbody tr:has-text("${listing.name}")`).first();
            await row.waitFor({ state: 'visible' });
    
            // Find the Actions button within this specific row
            const actionsButton = await row.locator(this.config.selectors.actionsDropdown);
            await actionsButton.waitFor({ state: 'visible' });
    
            console.log("🖱️ Clicking Actions dropdown...");
            await actionsButton.click();
    
            // Wait for Edit button to appear
            const editButton = await row.locator(this.config.selectors.editButton);
            await editButton.waitFor({ state: 'visible' });
    
            console.log("🖱️ Clicking 'Edit'...");
            await editButton.click();
    
            console.log(`✅ Navigated to edit page for: ${listing.name}`);
    
            // ⏳ Here, we will later add code to modify product details
    
            console.log("🔙 Returning to Manage Listings...");
            await this.page.goBack();
    
            console.log("🔄 Re-extracting listings before next iteration...");
            await this.extractListings();
        }
    
        console.log("✅ All listings processed!");
    }

    async addProductListing() {
        const page = this.page;
        const sel = this.config.selectors;
        const data = this.setupWorkflow.productData;

        console.log("📝 Filling out product listing form...");

        // Set maturity level
        const maturity = data.maturityLevel?.toLowerCase();
        if (maturity === 'general') await page.check(sel.maturityGeneral);
        else if (maturity === 'moderate') await page.check(sel.maturityModerate);
        else if (maturity === 'adult') await page.check(sel.maturityAdult);

        // Set Mesh Type
        const mesh = data.mesh?.toLowerCase();
        if (mesh === 'no mesh') await page.check(sel.meshNone);
        else if (mesh === 'partial mesh') await page.check(sel.meshPartial);
        else if (mesh === '100% mesh') await page.check(sel.meshFull);

        // Permission checking... only check if true
        const perms = data.permissions || {};
        if (perms.copy) await page.check(sel.permCopy);
        if (perms.modify) await page.check(sel.permModify);
        if (perms.transfer) await page.check(sel.permTransfer);
        if (perms.seeDescription) await page.check(sel.permSeeDescription);
        if (perms.userLicensed) await page.check(sel.permUserLicensed);

        // Usage Requirements
        const usage = data.usage?.toLowerCase();
        if (usage === 'none') await page.check(sel.usageNone);
        else if (usage === 'unpacking') await page.check(sel.usageUnpacking);
        else if (usage === 'land') await page.check(sel.usageLand);
        if (usage === 'wearable') await page.check(sel.usageWearable);

        // Basic Fields.
        if (data.itemTitle) await page.fill(sel.itemTitle, data.itemTitle);

        for (let i = 1; i <= 5; i++) {
            const val = data['Product features']?.[i.toString()];
            if (val) {
                await page.fill(sel[`feature${i}`], val);
            }
        }

        if (data.extendedDescription) await page.fill(sel.description, data.extendedDescription);
        if (data.keywords) await page.fill(sel.keywords, data.keywords);
        if (data.itemPrice) await page.fill(sel.itemPrice, data.itemPrice.toString());
        if (data.slurl) await page.fill(sel.slurl, data.slurl);

        console.log("✅ Form filled out successfully.");
    }

    async addRelatedItems() {
        const page = this.page;
        const sel = this.config.selectors;
        const relatedItems = this.setupWorkflow.productData?.relatedItems || [];

        for (const itemName of relatedItems) {
            console.log(`🔗 Adding related item: ${itemName}`);

            // ❗ SAFETY: If modal is still open, wait for it to close first
            const stillOpen = await page.isVisible(sel.relatedModal);
            if (stillOpen) {
                console.warn("⚠️ Related modal still open from last item — waiting...");
                await page.waitForSelector(sel.relatedModal, { state: 'hidden', timeout: 5000 });
            }

            // Open the modal fresh
            await page.click(sel.relatedAddButton);
            await page.waitForSelector(sel.relatedModal, { state: 'visible', timeout: 5000 });


            // Type into search box
            await page.fill(sel.relatedSearchBox, itemName);
            await page.click(sel.relatedSearchSubmit);
            await page.waitForSelector(sel.relatedSearchResults, { timeout: 5000 });

            // Select the first matching result
            const result = page.locator(`${sel.relatedResultByName}:has-text("${itemName}")`).first();
            await result.waitFor({ state: 'visible', timeout: 5000 });
            await result.click();

            // Wait for EITHER popup to close or error to appear
            try {
                await Promise.race([
                    page.waitForSelector(sel.relatedModal, { state: 'hidden', timeout: 5000 }),
                    page.waitForSelector('.errors .error', { timeout: 5000 })
                ]);

                const errorVisible = await page.isVisible('.errors .error');
                if (errorVisible) {
                    const errorText = await page.textContent('.errors .error');
                    if (errorText.includes('related_product_already_associated')) {
                        console.warn(`⚠️ Already associated: ${itemName}, skipping.`);
                    } else {
                        console.error(`❌ Unexpected error while adding related item: ${errorText}`);
                    }

                    // Always close popup manually if error appears
                    await page.click(`${sel.relatedModal} .close`);
                    await page.waitForSelector(sel.relatedModal, { state: 'hidden', timeout: 5000 });
                } else {
                    console.log(`✅ Related item added: ${itemName}`);
                }
            } catch (e) {
                console.error(`❌ Timeout or unknown error adding related item: ${itemName}`);
                // Failsafe: force-close the popup if it's still stuck open
                const stillOpen = await page.isVisible(sel.relatedModal);
                if (stillOpen) {
                    console.warn("⚠️ popup still open — force-closing...");
                    await page.click(`${sel.relatedModal} .close`);
                    await page.waitForSelector(sel.relatedModal, { state: 'hidden', timeout: 5000 });
                }
            }

            // Short pause between items to avoid racing ahead
            await page.waitForTimeout(500);
        }

        console.log("🎯 Related item processing complete.");
    }



    async addRevenueDistributions() {
        const page = this.page;
        const sel = this.config.selectors;
        const distributions = this.setupWorkflow.productData?.revenueDistributions || [];

        for (const entry of distributions) {
            const username = entry.username.trim();
            const percentage = entry.percentage.trim();

            // Check if a distribution is already listed
            const existingSelector = `.distribution-id:has-text("${username}")`;
            const exists = await page.$(existingSelector);

            if (exists) {
                const parent = await exists.evaluateHandle(el => el.closest('.distributions-form'));
                const text = await parent.evaluate(el => el.innerText);

                if (text.includes(`Percentage: ${percentage}%`)) {
                    console.log(`✅ Distribution already correct for: ${username}`);
                    continue; // Skip — it's correct
                } else {
                    console.log(`♻️ Distribution exists but has wrong percentage. Removing...`);
                    const deleteButton = await parent.$('.distributions-delete');
                    if (deleteButton) await deleteButton.click();
                    await page.waitForTimeout(500);
                }
            }

            console.log(`➕ Adding revenue share: ${username} - ${percentage}%`);

            // Click to open modal
            const buttonExists = await page.$(sel.distributionAddButton);
            if (!buttonExists) {
                console.warn("❌ Distribution add button not found — skipping this entry.");
                continue;
            }

            await page.click(sel.distributionAddButton);
            await page.waitForSelector(sel.distributionModal, { state: 'visible', timeout: 5000 });

            // Fill and submit
            await page.fill(sel.distributionUsername, username);
            await page.fill(sel.distributionPercentage, percentage);
            await page.click(sel.distributionSubmit);
            await page.waitForTimeout(500); // short delay

            console.log(`✅ Distribution added: ${username}`);
        }

        console.log("🎯 Revenue distribution section completed.");
    }

    async saveListing() {
        const sel = this.config.selectors;
        console.log("💾 Saving listing changes...");
        await this.page.click(sel.saveButton);
        await this.page.waitForTimeout(2000); // optional pause after saving
        console.log("✅ Listing saved.");
    }

    async quickFillListing() {
        const page = this.page;
        const sel = this.config.selectors;

        const sourceProduct = this.setupWorkflow.productData?.quickFillSource || "[POIZN] Jacket - FATPACK";

        console.log(`⚡ Performing Quick Fill from: ${sourceProduct}`);

        // Open the Quick Fill modal
        await page.click(sel.quickFillButton);
        await page.waitForSelector('#copy-product-chooser', { state: 'visible', timeout: 5000 });

        // Target the correct field inside the modal (with visibility check)
        const inputSelector = '#copy-product-chooser input#related_product_search_terms';
        await page.waitForSelector(inputSelector, { state: 'visible', timeout: 5000 });

        // Type and search
        await page.fill(inputSelector, sourceProduct);
        await page.click('#copy-product-chooser input[type="submit"][value="Search Products"]');

        // Wait for results to appear
        const resultSelector = '#copy-product-search-results a.select-product';
        await page.waitForSelector(resultSelector, { timeout: 5000 });

        const match = page.locator(resultSelector).first();
        await match.click();

        // Wait for modal to close
        await page.waitForSelector('#copy-product-chooser', { state: 'hidden', timeout: 5000 });

        console.log("✅ Quick Fill completed.");
    }

}