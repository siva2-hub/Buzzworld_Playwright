import test, { chromium, expect } from "@playwright/test";
import xlsx from "xlsx";
import { login_buzz } from "./helper";
import { testData } from "../pages/TestData";
import { changeUserRole_Branch, checkAcctsOutSideFrequency, checkBranchesForSuperUserInSalesDashboard, checkSalesManagersViewingInTheirOwnBranch, checkYTDSalesTarget, linkForAccountsOFrq, linkForAccountsOSFrq, openNewWebPage } from "../pages/SalesdashboardPage";
import { getTestResults } from "../pages/PricingPages";
import { stage_url } from "../pages/QuotesPage";
import { addStockCode, checkLongDescriptonField, naviageToInventory } from "../pages/InventoryPage";

let page, results, browser, context;
test.beforeAll(async () => {
    browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
    context = await browser.newContext();
    page = await context.newPage();
    await login_buzz(page, testData.app_url)
})
// const months = testData.months;
test('Check YTD Sales Target', async ({ }, testInfo) => {
    const months = new Map(); let goalValue = 2010003.12;
    for (let index = 0; index < testData.months.length; index++) {
        months.set(testData.months[index], (goalValue))
        goalValue = goalValue + index + 250000;
    }
    // /, 'Michael Smith', 'Braden Morris'
    let salesPerson = ['Will Gray'];
    results = await checkYTDSalesTarget(page, months, salesPerson);
    await getTestResults(results, testInfo);
})
//-------------------------------Branches List for Different User Roles--------------------------
test.describe('Check the Branches in Dashboard for Different User Roles', async () => {
    let userData = [
        process.env.BASE_URL_BUZZ, 'testdefault@epi.com', 'Enter@4321', 'Super User', 'Dallas', 1
    ];
    test('Check the Branches in Dashboard for Super User', async ({ }, testInfo) => {
        //in userData array, deleted the 5th index value and add 0 to the 5th position
        userData.splice(5, 1, 0);
        results = await checkBranchesForSuperUserInSalesDashboard(page, browser, userData, results);
        await getTestResults(results[0], testInfo)
    })
    test('Check the Branches in Dashboard for Sales Manager', async ({ }, testInfo) => {
        //in userData array, deleted the 3rd,5th index value and add new value to the 3rd,5th positions
        userData.splice(3, 1, 'Sales Manager'); userData.splice(4, 1, 'San Antonio'); userData.splice(5, 1, 1);
        results = await checkBranchesForSuperUserInSalesDashboard(page, browser, userData, results[1]);
        await getTestResults(results[0], testInfo)
    })
    test('Check the Branches in Dashboard for Sales', async ({ }, testInfo) => {
        //in userData array, deleted the 3rd,4th index value and add new value to the 3rd,4th positions
        userData.splice(3, 1, 'Sales'); userData.splice(4, 1, 'Chicago');
        results = await checkBranchesForSuperUserInSalesDashboard(page, browser, userData, results[1]);
        await getTestResults(results[0], testInfo)
    })
    test('Check the Branches in Dashboard for Sales VP', async ({ }, testInfo) => {
        //in userData array, deleted the 3rd,4th index value and add new value to the 3rd,4th positions
        userData.splice(3, 1, 'Sales VP'); userData.splice(4, 1, 'Dallas');
        results = await checkBranchesForSuperUserInSalesDashboard(page, browser, userData, results[1]);
        //After testcase done, change user role to Super User
        await changeUserRole_Branch(page, userData[1], 'Super User', 'Default');
        await getTestResults(results[0], testInfo)
    })
})
//----------------------------Accounts Outside Appointment Frequency-----------------------------------------------------
test('Check Accounts Outside Appointment Frequency', async ({ }, testInfo) => {
    results = await checkAcctsOutSideFrequency(page, ['Gene Gray']);
    await getTestResults(results, testInfo);
})
//----------------------------check the manager exist in branch users list or not------------------------------
test('Check the Sales Manager exist in own branch or not', async ({ }, testInfo) => {
    // testdefault@epi.com [Test Default], klent.prewitt@iidm.com [Klent Prewitt]
    const userData = [process.env.BASE_URL_BUZZ, 'Test Default', 'testdefault@epi.com', 'Enter@4321', 'Sales Manager', 'Dallas', 0, false, true];
    let data = await checkSalesManagersViewingInTheirOwnBranch(page, browser, userData);
    await getTestResults(data[0], testInfo);
})
//-------------------------- check the Link for Accounts Outside Appointment Frequency-----------------
test('Check the Link for Accounts Outside Appointment Frequency for Different User Roles', async ({ }, testInfo) => {
    const userData = [process.env.BASE_URL_BUZZ, 'Test Default', 'testdefault@epi.com', 'Enter@4321', 'Sales Manager', 'Dallas', 0, true, false];
    results = await linkForAccountsOSFrq(page, browser, userData);
})
//----------------------------Long Description Field-----------------------------------------------------
test('Check the Long Description At Inventory and Creates SO Screen', async ({ }, testInfo) => {
    const testDataLD = ['create_so', '080CP-V', 'Won'];
    test.setTimeout(120 * 1000);
    results = await checkLongDescriptonField(page, testDataLD);
    await getTestResults(results, testInfo);
})