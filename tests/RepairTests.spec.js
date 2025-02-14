const { test } = require("@playwright/test");
const { createRepair, addItemsToRepairs, assignLocationFun, assignTech, itemEvaluation, repItemAddedToQuote, createSORepQuote, markAsRepairInProgress, createPartsPurchase } = require("../pages/RepairPages");
const { login_buzz } = require("./helper");
const { testData } = require("../pages/TestData");
const { changePartsPurchaseStatus, changePartsPurchaseStatusToPartiallyReceived } = require("../pages/PartsBuyingPages");
const { testIgnore } = require("../playwright.config");
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
test('Add Items To RMA', async ({ }, testInfo) => {
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
test('Assign Location', async ({ }, testInfo) => {
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
test('Assign Technician', async ({ }, testInfo) => {
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
test('Item Evaluation', async ({ }, testInfo) => {
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
test('Add Items To Quote', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await repItemAddedToQuote(page); testStatus = true;
        } catch (error) {
            testStatus = false; //throw new Error(error);
        }
    } else { testMsg(testInfo.title, testTitle); testStatus = false }
    testTitle = testInfo.title
})
test('Create Sales Order Repair Quote', async ({ }, testInfo) => {
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
test('Create Parts Purchase From RMA', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await createPartsPurchase(
                page, testData.parts_buy_detls.ven_part_num, testData.repairs.suppl_name, testData.parts_buy_detls.pp_item_qty,
                testData.parts_buy_detls.pp_item_cost, testData.parts_buy_detls.pp_item_desc, testData.parts_buy_detls.pp_item_spcl_notes,
                testData.parts_buy_detls.pp_item_item_notes
            ); testStatus = true;

        } catch (error) {
            testStatus = false; //throw new Error(error);
        }
    } else { testMsg(testInfo.title, testTitle); testStatus = false }
    testTitle = testInfo.title
})
test('Change Parts Purchase Status to Partially Recevied', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await changePartsPurchaseStatusToPartiallyReceived(page); testStatus = true;
        } catch (error) {
            testStatus = false; //throw new Error(error);
        }
    } else {
        testMsg(testInfo.title, testTitle); testStatus = false
    } testTitle = testInfo.title;
})
test('Repair Item Marked As In Progress', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await markAsRepairInProgress(page); testStatus = true;
        } catch (error) {
            testStatus = false; //throw new Error(error);
        }
    } else { testMsg(testInfo.title, testTitle); testStatus = false }
    testTitle = testInfo.title
})
test('Repair Summary', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await repSummary(page);
        } catch (error) {
            testStatus = false; //throw new Error(error);
        }
    } else { testMsg(testInfo.title, testTitle); testStatus = false }
    testTitle = testInfo.title
})
test.skip('Assign To QC', async ({ }, testInfo) => {
    if (testStatus) {
        try {

        } catch (error) {
            testStatus = false; //throw new Error(error);
        }
    } else { testMsg(testInfo.title, testTitle); testStatus = false }
    testTitle = testInfo.title
})

