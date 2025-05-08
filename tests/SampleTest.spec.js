const { test, expect, chromium } = require("@playwright/test");
const { ANSI_GREEN, ANSI_RESET, ANSI_RED } = require("./helper");
const { signInButton, loginButton } = require("../pages/StorePortalPages");

let page, testResult, login_button, emailInput, passwordInput;
test.beforeAll(async () => {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 50,
        args: ["--start-maximized"],
    });
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto("https://staging-store.iidm.com/");
});
test.describe("Regression Test Suite", () => {
    test("Verify Sign In Visibility", async ({ }, testInfo) => {
        testResult = false;
        login_button = loginButton(page);
        try {
            await expect(loginButton).toBeVisible({ timeout: 5000 });
            await login_button.click();
            testResult = true;  
        } catch (error) { }
        await getTestResults(testResult, testInfo);
    });

    test("Verify Email and Password Visibilty", async ({ }, testInfo) => {
        testResult = false;
        emailInput = emailInput(page);
        passwordInput = passwordInput(page);
        try {
            await expect(emailInput).toBeVisible({ timeout: 5000 });
            await expect(passwordInput).toBeVisible({ timeout: 5000 });
            testResult = true;
        } catch (error) { }
        await getTestResults(testResult, testInfo);

    });
    test("Verify Login Functionality", async ({ }, testInfo) => {
        testResult = false;
        await emailInput.fill("multicam@testuser.com");
        await passwordInput.fill("Enter@4321");
        await signInButton(page).click();
        try {
            await expect(page).toHaveURL(/.*dashboard/);
            testResult = true;
        } catch (error) { }
        await getTestResults(testResult, testInfo);

    });
});
async function getTestResults(testResult, testInfo) {
    if (testResult) {
        console.log(`${ANSI_GREEN}Test Passed: ${testInfo.title} ${ANSI_RESET}`);
    } else {
        throw new Error(`${ANSI_RED}Test Failed: ${testInfo.title} ${ANSI_RESET}`);
    }
}