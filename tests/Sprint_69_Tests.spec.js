import test, { browser, BrowserContext, chromium, expect, Page, TestInfo } from "@playwright/test";
import { delay, login_buzz, selectReactDropdowns } from "./helper";
import { checkLongDescriptonField } from "../pages/InventoryPage";
import { getEleByText, getTestResults } from "../pages/PricingPages";
import { reactFirstDropdown } from "../pages/PartsBuyingPages";
import { iidmCostLabel } from "../pages/QuotesPage";
import { storeLogin } from "../pages/StorePortalPages";
let context,
    page,
    results;

test.beforeAll(async () => {
    context = await browser.newContext();
    page = await context.newPage();
    await login_buzz(page, process.env.BASE_URL_BUZZ);
})
//----------------------------Check Long Description Field-----------------------------------------------------
test.describe('Check the Long Description At All Places', async () => {
    test('Check the Long Description At Inventory', async ({ }, testInfo) => {
        const testDataLD = ['inventory_search', '080CP-V', 'Won'];
        results = await checkLongDescriptonField(page, testDataLD);
        await getTestResults(results, testInfo);
    })
    test('Check the Long Description At Creates SO Screen', async ({ }, testInfo) => {
        const testDataLD = ['create_so', '080CP-V', 'Won'];
        results = await checkLongDescriptonField(page, testDataLD);
        await getTestResults(results, testInfo);
    })
    test('Check the Long Description At Add Stock Code from Inventory', async ({ }, testInfo) => {
        const testDataLD = ['stock_line_items_page', '080CP-V', 'Won'];
        results = await checkLongDescriptonField(page, testDataLD);
        await getTestResults(results, testInfo);
    })
})
test('Check Re-Order button', async ({ }, testInfo) => {
    let status = 'Won';
    await getEleByText(page, 'Quotes').nth(0).click();
    try {
        await expect(getEleByText(page, 'Clear').nth(0)).toBeVisible({ timeout: 2000 });
        await getEleByText(page, 'Clear').nth(0).click();
    } catch (error) { }
    await getEleByText(page, 'Filters').nth(0).click();
    await reactFirstDropdown(page).nth(2).click();
    await selectReactDropdowns(page, status);
    await page.getByRole('button', { name: 'Apply' }).click();
    let wonStatus = getEleByText(page, status).nth(0);
    await expect(wonStatus).toBeVisible();
    await wonStatus.click();
    // await page.goto('https://www.staging-buzzworld.iidm.com/all_quotes/adf75994-b679-489d-ae3f-867d686be2d8');
    await expect(iidmCostLabel(page).nth(0)).toBeVisible();
    let url = await page.url();
    let order_id = url.split('/').pop();
    // Creating one more page for Portal
    const context = await browser.newContext();
    const newPage = await context.newPage();
    let userName = await storeLogin(newPage);
    await newPage.getByText(userName).click();
    await newPage.getByRole('link', { name: 'Dashboard' }).click();
    await expect(newPage.getByText('Need Your Attention')).toBeVisible(); await delay(page, 2000);
    await newPage.goto(await newPage.url().replace('dashboard', order_id));
})
