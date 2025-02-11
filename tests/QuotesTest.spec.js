const { test } = require("@playwright/test");
const { createQuote, addItemsToQuote, selectRFQDateRequestedBy, selectSource, sendForCustomerApprovals, quoteWon, printQuotePDF, checkGPGrandTotalAtQuoteDetails, displayProjectNameAtSendToCustomerApprovals, submitForCustAproval } = require("../pages/QuotesPage");
const { login_buzz, approve, createSO } = require("./helper");
const { testData } = require("../pages/TestData");
let page;
test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await login_buzz(page, testData.app_url);
})
let quoteNumber, testStatus, testTitle;
test('Create Quote', async ({ }, testInfo) => {
    try {
        quoteNumber = await createQuote(page, testData.quotes.acc_num, testData.quotes.quote_type, testData.quotes.project_name);
        testStatus = true;
    } catch (error) { testStatus = false; }
    testTitle = testInfo.title;
})
test('Add Items To Quote', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await addItemsToQuote(
                page, testData.quotes.stock_code, testData.quotes.quote_type, testData.quotes.suppl_name,
                testData.quotes.suppl_code, testData.quotes.source_text, testData.quotes.part_desc, testData.quotes.quote_price
            ); testStatus = true;
        } catch (error) {
            testStatus = false
        }
    } else {
        console.log('Skipped the ' + testInfo.title + ' test because of ' + testTitle + ' test has Failed')
    } testTitle = testInfo.title;
})
test('Select RFQ Received Date and Requested By', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await selectRFQDateRequestedBy(page, testData.quotes.cont_name);
            testStatus = true;
        } catch (error) {
            testStatus = false;
        }
    } else {
        console.log('Skipped the ' + testInfo.title + ' test because of ' + testTitle + ' test has Failed')
    } testTitle = testInfo.title;
})
test('Select Source For Existing Item', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await selectSource(page, testData.quotes.stock_code, testData.quotes.source_text, testData.quotes.item_notes);
            testStatus = true;
        } catch (error) {
            testStatus = false;
        }
    } else {
        console.log('Skipped the ' + testInfo.title + ' test because of ' + testTitle + ' test has Failed')
    } testTitle = testInfo.title;
})
test('Submit for Internal Approval or Approve Quote', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await approve(page, testData.quotes.cont_name);
            testStatus = true;
        } catch (error) {
            testStatus = false;
        }
    } else {
        console.log('Skipped the ' + testInfo.title + ' test because of ' + testTitle + ' test has Failed')
    } testTitle = testInfo.title;
})
test('Display Project Name at Submit for Customer Approval', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await displayProjectNameAtSendToCustomerApprovals(page, testData.pro_name_send_cust.quote_id)
            testStatus = true;
        } catch (error) {
            testStatus = false;
        }
    } else {
        console.log('Skipped the ' + testInfo.title + ' test because of ' + testTitle + ' test has Failed')
    } testTitle = testInfo.title;
})
test('Deliver To Customer or Submit for Customer Approval', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            if (testData.quotes.send_email_to_cust) {
                await submitForCustAproval(page, testData.userDetails.user_email);
            }
            else { await sendForCustomerApprovals(page); }; testStatus = true;
        } catch (error) {
            testStatus = false;
        }
    } else {
        console.log('Skipped the ' + testInfo.title + ' test because of ' + testTitle + ' test has Failed')
    } testTitle = testInfo.title;
})
test('Quote Won', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await quoteWon(page);
            testStatus = true;
        } catch (error) {
            testStatus = false;
        }
    } else {
        console.log('Skipped the ' + testInfo.title + ' test because of ' + testTitle + ' test has Failed')
    } testTitle = testInfo.title;
})
test('Create Sales Order From Quotes', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await createSO(page, testData.quotes.suppl_name, testData.quotes.is_create_job, testData.quotes.quote_type);
            testStatus = true;
        } catch (error) {
            testStatus = false;
        }
    } else {
        console.log('Skipped the ' + testInfo.title + ' test because of ' + testTitle + ' test has Failed')
    } testTitle = testInfo.title;
})
test('Print Quote PDF', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await printQuotePDF(page, quoteNumber);
            testStatus = true;
        } catch (error) {
            testStatus = false;
        }
    } else {
        console.log('Skipped the ' + testInfo.title + ' test because of ' + testTitle + ' test has Failed')
    } testTitle = testInfo.title;
})
test('Gross Profit Grand Total', async ({ }, testInfo) => {
    if (testStatus) {
        try {
            await checkGPGrandTotalAtQuoteDetails(page, testData.totalGP.quote_id);
            testStatus = true;
        } catch (error) {
            testStatus = false;
        }
    } else {
        console.log('Skipped the ' + testInfo.title + ' test because of ' + testTitle + ' test has Failed')
    } testTitle = testInfo.title;
})