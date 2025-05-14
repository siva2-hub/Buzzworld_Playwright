import test, { chromium } from "@playwright/test";
import { login_buzz } from "./helper";
import { testData } from "../pages/TestData";
import { checkYTDSalesTarget } from "../pages/SalesdashboardPage";
import { getTestResults } from "../pages/PricingPages";

let page, results, browser;
test.beforeAll(async () => {
    browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
    const context = await browser.newContext();
    page = await context.newPage();
    await login_buzz(page, testData.app_url)
})
const months = testData.months;
test('check YTD Sales Target', async ({ }, testInfo) => {
    let salesPerson = ['Brandon Ormuz', 'Michael Smith', 'Braden Morris'];
    results = await checkYTDSalesTarget(page, months, salesPerson, 102222.561);
    await getTestResults(results, testInfo);
})