import { chromium } from 'playwright';
import fs from 'fs';

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

    console.log("🔍 Looking for 'Sign In' button...");
    await page.waitForSelector(config.selectors.signInButton, { timeout: 10000 });

    console.log("🖱️ Clicking 'Sign In' button...");
    await page.click(config.selectors.signInButton);

    console.log("⏳ Waiting for navigation to login page...");
    await page.waitForURL('**/openid/login**', { timeout: 10000 });

    console.log("🔍 Waiting for username field...");
    await page.waitForSelector(config.selectors.usernameField, { timeout: 10000 });

    console.log("✍️ Focusing and typing username...");
    await page.focus(config.selectors.usernameField);
    await page.fill(config.selectors.usernameField, credentials.username);

    console.log("🔍 Waiting for password field...");
    await page.waitForSelector(config.selectors.passwordField, { timeout: 10000 });

    console.log("🔑 Focusing and typing password...");
    await page.focus(config.selectors.passwordField);
    await page.fill(config.selectors.passwordField, credentials.password);

    console.log("✅ Clicking 'Log In' button...");
    await page.click(config.selectors.loginButton);

    console.log("⌛ Waiting before closing browser...");
    await page.waitForTimeout(5000);
    
    console.log("❌ Closing browser...");
 //   await browser.close();

    console.log("✅ Test completed successfully.");
})();
