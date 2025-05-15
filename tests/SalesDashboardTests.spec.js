import test, { chromium } from "@playwright/test";
import { login_buzz } from "./helper";
import { testData } from "../pages/TestData";
import { checkYTDSalesTarget } from "../pages/SalesdashboardPage";

let page, results, browser;
test.beforeAll(async () => {
    browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
    const context = await browser.newContext();
    page = await context.newPage();
    await login_buzz(page, testData.app_url)
})
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
test('check YTD Sales Target', async () => {
    let salesPerson = ['Ed Hyer', 'Brandt King'];
    await checkYTDSalesTarget(page, months, salesPerson);
})