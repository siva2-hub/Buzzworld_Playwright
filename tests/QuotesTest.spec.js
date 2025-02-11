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

test('Create Quote', async () => {
    await createQuote(page, testData.quotes.acc_num, testData.quotes.quote_type, testData.quotes.project_name);
})
test.skip('Add Items To Quote', async () => {
    await addItemsToQuote(
        page, testData.quotes.stock_code, testData.quotes.quote_type, testData.quotes.suppl_name,
        testData.quotes.suppl_code, testData.quotes.source_text, testData.quotes.part_desc, testData.quotes.quote_price
    )
})
test('Select RFQ Received Date and Requested By', async () => {
    await selectRFQDateRequestedBy(page, testData.quotes.cont_name);
})
test('Select Source For Existing Item', async () => {
    await selectSource(page, testData.quotes.stock_code, testData.quotes.source_text, testData.quotes.item_notes);
})
test('Submit for Internal Approval or Approve Quote', async () => {
    await approve(page, testData.quotes.cont_name)
})
test('Display Project Name at Submit for Customer Approval', async () => {
    await displayProjectNameAtSendToCustomerApprovals(page, testData.pro_name_send_cust.quote_id)
})
test('Deliver To Customer or Submit for Customer Approval', async () => {
    if (testData.quotes.send_email_to_cust) { await submitForCustAproval(page, testData.userDetails.user_email) }
    else { await sendForCustomerApprovals(page); }
})
test('Quote Won', async () => {
    await quoteWon(page);
})
test('Create Sales Order From Quotes', async () => {
    await createSO(page, testData.quotes.suppl_name, testData.quotes.is_create_job, testData.quotes.quote_type);
})
test('Print Quote PDF', async () => {
    await printQuotePDF(page);
})
test('Gross Profit Grand Total', async () => {
    await checkGPGrandTotalAtQuoteDetails(page, testData.totalGP.quote_id);
})