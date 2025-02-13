const { test } = require("@playwright/test");
const { createRepair, addItemsToRepairs, assignLocationFun, assignTech, itemEvaluation, repItemAddedToQuote, createSORepQuote, markAsRepairInProgress, createPartsPurchase } = require("../pages/RepairPages");
const { login_buzz } = require("./helper");
const { testData } = require("../pages/TestData");
let page, testStatus, testTitle;
const testMsg = (currentTestTitle, previousTestTitle) => {
    console.log(currentTestTitle + ' Test has skipped, beacsue of ' + previousTestTitle + ' Test is Failed')
}
test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await login_buzz(page, testData.app_url);
})
test('Create Repair', async ({ }, testInfo) => {
    try {
        await createRepair(page, testData.repairs.acc_num, testData.repairs.cont_name);
        testStatus = true;
    } catch (error) {
        testStatus = false; //throw new Error(error);
    } testTitle = testInfo.title
})
test.skip('Add Items To RMA', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await addItemsToRepairs(
                page, testData.repairs.suppl_name, testData.repairs.suppl_code,
                testData.repairs.stock_code, testData.repairs.part_desc, testData.repairs.serial_number
            ); testStatus = true;
        } catch (error) {
            testStatus = false; //throw new Error(error);
        }
    } else { testMsg(testInfo.title, testTitle); testStatus = false }
    testTitle = testInfo.title
})
test.skip('Assign Location', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await assignLocationFun(
                page, testData.repairs.serial_number, testData.repairs.storage_loc,
                testData.repairs.item_internal_notes + testInfo.title
            ); testStatus = true;
        } catch (error) {
            testStatus = false; //throw new Error(error);
        }
    } else { testMsg(testInfo.title, testTitle); testStatus = false }
    testTitle = testInfo.title
})
test.skip('Assign Technician', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await assignTech(
                page, testData.repairs.rep_tech, testData.repairs.item_internal_notes + testInfo.title
            ); testStatus = true;
        } catch (error) {
            testStatus = false; //throw new Error(error);
        }
    } else { testMsg(testInfo.title, testTitle); testStatus = false }
    testTitle = testInfo.title
})
test.skip('Item Evaluation', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await itemEvaluation(
                page, testData.repairs.rep_type, testData.repairs.tech_sugg_price,
                testData.repairs.item_internal_notes + testInfo.title
            ); testStatus = true;
        } catch (error) {
            testStatus = false; //throw new Error(error);
        }
    } else { testMsg(testInfo.title, testTitle); testStatus = false }
    testTitle = testInfo.title
})
test.skip('Add Items To Quote', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await repItemAddedToQuote(page); testStatus = true;
        } catch (error) {
            testStatus = false; //throw new Error(error);
        }
    } else { testMsg(testInfo.title, testTitle); testStatus = false }
    testTitle = testInfo.title
})
test.skip('Create Sales Order Repair Quote', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await createSORepQuote(
                page, testData.repairs.cont_name, testData.repairs.suppl_name,
                testData.repairs.is_create_job, testData.repairs.quote_type
            ); testStatus = true;
        } catch (error) {
            testStatus = false; //throw new Error(error);
        }
    } else { testMsg(testInfo.title, testTitle); testStatus = false }
    testTitle = testInfo.title
})
test('Repair Item Marked As In Progress or Create Parts Purchase From RMA', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            if (testData.repairs.is_marked_as_in_progress) {
                await markAsRepairInProgress(page); testStatus = true;
            } else {
                await createPartsPurchase(page, testData.parts_buy_detls.ven_part_num, testData.repairs.suppl_name); testStatus = true;
            }
        } catch (error) {
            testStatus = false; throw new Error(error);
        }
    } else { testMsg(testInfo.title, testTitle); testStatus = false }
    testTitle = testInfo.title
})



