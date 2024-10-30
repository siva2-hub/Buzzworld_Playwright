const { test, devices, expect } = require("@playwright/test");
const { itemNotesLineBreaks, verifySPAExpiryMails, returnResult, setScreenSize, login_buzz, addTerritoryToZipcodes, defaultTurnAroundTime, getImages, orgSearchLoginAsClient, loginAsClient, quoteTotalDisplaysZero, displayNCNRatItemsPage, salesOrderVerification, cloneRepairQuote, spaNewItemImport } = require("./helper");
const exp = require("constants");
const testdata = JSON.parse(JSON.stringify(require("../testdata.json")));
// const stage_url = testdata.urls.buzz_dev_url;
const stage_url = process.env.BASE_URL_BUZZ;
let page, results, context;
test.beforeAll(async ({ browser }) => {
  // await reports('First Test', 'Passed');
  let w = 1920, h = 910;
  context = await browser.newContext()
  page = await context.newPage()
  // await setScreenSize(page, w, h);
  await login_buzz(page, stage_url);
});
test('Quote Total display zero', async ({ }, testInfo) => {
  let acc_num = 'MULTI00', cont_name = 'Garret Luppino', stock_code = ['GA80U4103ABM'];
  results = await quoteTotalDisplaysZero(page, acc_num, cont_name, 'Parts Quote', stock_code);
  let testName = testInfo.title;
  await returnResult(page, testName, results);
});
test('Display NCNR at Items Details', async ({ }, testInfo) => {
  results = await displayNCNRatItemsPage(page);
  let testName = testInfo.title;
  await returnResult(page, testName, results);
});
test('8 series sales order verification', async ({ }, testInfo) => {
  results = await salesOrderVerification(page);
  let testName = testInfo.title;
  await returnResult(page, testName, results);
});
test('Repair Quote Clone', async ({ }, testInfo) => {
  let acc_num = 'MULTI00', cont_name = 'Garret Luppino', tech = 'Michael Strothers';
  results = await cloneRepairQuote(page, acc_num, cont_name, tech);
  let testName = testInfo.title;
  await returnResult(page, testName, results);
});
test('SPA New Item Import', async ({ }, testInfo) => {
  // BUYSIDE.xlsx,  SELLSIDE.xlsx, Buy, Sell
  let fileName = 'sample_buy_side_file_new_item.csv', s_b_Side = 'Sell';
  results = await spaNewItemImport(page, fileName, s_b_Side, context);
  let testName = testInfo.title;
  await returnResult(page, testName, results);
});
test('mobile testing', async ({ browser }) => {
  const context = await browser.newContext({
    ...devices['iPhone 14 Pro Max'],
    // Optionally specify other context options here
  });
  // Create a new page in the context
  const page = await context.newPage();
  // Navigate to the URL
  await page.goto('https://staging-store.iidm.com/');
  await page.pause()
});
