import { handleCookiePopup } from '../../utils/helpers.js';

export class SLMarketplaceWorkflow {
    constructor(page, config, credentials) {
        this.page = page;
        this.config = config;
        this.credentials = credentials;
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

    async navigateTo(url) {
        console.log(`🔗 Navigating to: ${url}`);
        await this.page.goto(url);
    }
}