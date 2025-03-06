export async function handleCookiePopup(page) {
    const acceptButtonSelector = 'text="Accept All"';

    // Check if the popup exists
    const popupExists = await page.locator(acceptButtonSelector).count();

    if (popupExists) {
        console.log("🍪 Cookie popup detected! Clicking 'Accept All'...");
        await page.click(acceptButtonSelector);
    } else {
        console.log("✅ No cookie popup detected.");
    }
}