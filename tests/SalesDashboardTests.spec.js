import test, { chromium } from "@playwright/test";
import { login_buzz } from "./helper";
import { testData } from "../pages/TestData";
import { checkBranchesForSuperUserInSalesDashboard, checkYTDSalesTarget } from "../pages/SalesdashboardPage";
import { getTestResults } from "../pages/PricingPages";
import { stage_url } from "../pages/QuotesPage";

let page, results, browser;
test.beforeAll(async () => {
    browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
    const context = await browser.newContext();
    page = await context.newPage();
    await login_buzz(page, testData.app_url)
})
const months = testData.months;
test('check YTD Sales Target', async ({ }, testInfo) => {
    // /, 'Michael Smith', 'Braden Morris'
    let salesPerson = ['Michael Smith', 'Will Gray'];
    results = await checkYTDSalesTarget(page, months, salesPerson, 200001.17);
    await getTestResults(results, testInfo);
})
test.describe('Check the Branches in Dashboard for Different User Roles', async () => {
    let userData = [
        process.env.BASE_URL_BUZZ, 'testdefault@epi.com', 'Enter@4321', 'Super User', 'Dallas', 1
    ];
    test('Check the Branches in Dashboard for Super User', async ({ }, testInfo) => {
        // let userData = [secondPageURL, userEmail, pWord, 'Super User', 'Dallas', count];
        // let [url, userEmail, pWord, userRole, branchName] = userData;
        userData.splice(5, 1, 0);
        results = await checkBranchesForSuperUserInSalesDashboard(page, browser, userData, results);
        await getTestResults(results[0], testInfo)
    })
    test('Check the Branches in Dashboard for Sales Manager', async ({ }, testInfo) => {
        // let userData = [secondPageURL, userEmail, pWord, 'Sales Manager', 'San Antonio', 1];
        // let [url, userEmail, pWord, userRole, branchName] = userData;
        userData.splice(3, 1, 'Sales Manager'); userData.splice(4, 1, 'San Antonio'); userData.splice(5, 1, 1);
        results = await checkBranchesForSuperUserInSalesDashboard(page, browser, userData, results[1]);
        await getTestResults(results[0], testInfo)
    })
    test('Check the Branches in Dashboard for Sales', async ({ }, testInfo) => {
        // let userData = [secondPageURL, userEmail, pWord, 'Sales', 'Chicago', 1];
        // let [url, userEmail, pWord, userRole, branchName] = userData;
        userData.splice(3, 1, 'Sales'); userData.splice(4, 1, 'Chicago');
        results = await checkBranchesForSuperUserInSalesDashboard(page, browser, userData, results[1]);
        await getTestResults(results[0], testInfo)
    })
})