const { test } = require("@playwright/test");
const { itemNotesLineBreaks, verifySPAExpiryMails, returnResult, setScreenSize, login_buzz, addTerritoryToZipcodes, defaultTurnAroundTime } = require("./helper");
const testdata = JSON.parse(JSON.stringify(require("../testdata.json")));
// const stage_url = testdata.urls.buzz_dev_url;
const stage_url = process.env.BASE_URL_BUZZ;
let page, results;
test.beforeAll(async ({ browser }) => {
  // await reports('First Test', 'Passed');
  let w = 1920, h = 910;
  page = await browser.newPage();
  // await setScreenSize(page, w, h);
  await login_buzz(page, stage_url);
});
test('Item notes line breaks at Quotes', async ({ }, testInfo) => {
  results = await itemNotesLineBreaks(page, stage_url);
  let testName = testInfo.title;
  await returnResult(page, testName, results);
});

test('SPA Expiry Email before One Month', async ({ }, testInfo) => {
  results = await verifySPAExpiryMails(page);
  let testName = testInfo.title;
  await returnResult(page, testName, results);
});
test('Default Turn arround time for Repair Quotes', async ({ }, testInfo) => {
  let acc_num = 'ENGYS00', cont_name = 'Jannice Carrillo', stock_code = ['106EE', '5D56091G013', '331EAWL'];
  let tech = 'Michael Strothers'; let isCreateRMA = true
  results = await defaultTurnAroundTime(page, acc_num, cont_name, isCreateRMA, stock_code, tech, 1, stage_url)
  let testName = testInfo.title;
  await returnResult(page, testName, results);
});
test('Assign territory while Editing Zipcodes', async ({ }, testInfo) => {
  results = await addTerritoryToZipcodes(page);
  let testName = testInfo.title;
  await returnResult(page, testName, results);
});