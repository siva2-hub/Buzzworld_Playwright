const { test, devices, expect } = require("@playwright/test");
const { itemNotesLineBreaks, verifySPAExpiryMails, returnResult, setScreenSize, login_buzz, addTerritoryToZipcodes, defaultTurnAroundTime, getImages, orgSearchLoginAsClient, loginAsClient, quoteTotalDisplaysZero, displayNCNRatItemsPage, salesOrderVerification, addMultipleItems } = require("./helper");
const exp = require("constants");
const testdata = JSON.parse(JSON.stringify(require("../testdata.json")));
// const stage_url = testdata.urls.buzz_dev_url;
const stage_url = process.env.BASE_URL_BUZZ;
let page, results, context;
// test.beforeAll(async ({ browser }) => {
//   // await reports('First Test', 'Passed');
//   let w = 1920, h = 910;
//   context = await browser.newContext()
//   page = await context.newPage()
//   // await setScreenSize(page, w, h);
//   await login_buzz(page, stage_url);
// });
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
test('add multiple items to RMA', async ({ }, testInfo) => {
  let stock_codes = ['NS15-TX01B-V2', 'S4K2U3000-5C', 'BARRACUDASA-19', 'BARRACUDASA-19', 'BARRACUDASA-19', '6016T-MTHF', '6016T-MTHF', '6016T-MTHF', '6016T-MTHF', 'S4K4U6000W0BATC'];
  results = await addMultipleItems(page, stock_codes,);
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
  await page.goto('https://stagingiidm.wpengine.com/');
  try {
    await expect(page.getByText('Accept All', { exact: true })).toBeVisible()
    await page.getByText('Accept All', { exact: true }).click()
  } catch (error) {}
  await page.getByRole('link', { name: 'Pneumatics' }).scrollIntoViewIfNeeded()
  await expect(page.getByRole('link', { name: 'Pneumatics' })).toBeVisible();
  await page.getByLabel('Back To Top').click()
  await page.getByRole('textbox', { name: 'Search Product name,' }).fill('1234')
  await expect(page.getByRole('img', { name: 'Searching...' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Searching...' })).toBeHidden()
  await page.locator("//*[text()='NCA1X250-1234']").click()
  await page.pause()
});
