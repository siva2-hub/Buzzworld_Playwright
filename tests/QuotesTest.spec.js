const { test } = require("@playwright/test");
const { createQuote } = require("../pages/QuotesPage");
const { login_buzz } = require("./helper");
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
test('Add Items To Quote', async () => {

})