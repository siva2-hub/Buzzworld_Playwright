const { test, expect, errors } = require("@playwright/test");
const { login_buzz, selectStartEndDates } = require("./helper");
const { throws } = require("assert");
const { error } = require("console");
const { testDir } = require("../playwright.config");

const stage_url = process.env.BASE_URL_BUZZ;
const date = new Date().toDateString(); let results = false;
const currentDate = new Date(date);
let day = currentDate.getDate();
const previuosMonth = currentDate.getMonth();
const year = currentDate.getFullYear();
const startDate = (previuosMonth + 1) + '/' + day + '/' + year;
const endDate = (previuosMonth + 1) + '/' + day + '/' + (year + 1);
let page, context;
test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  page = await context.newPage()
  await login_buzz(page, stage_url);
});

test("POS reports prefil previous month and current", async () => {
  await page.getByRole('button', { name: 'Reports expand' }).click();
  await page.getByRole('menuitem', { name: 'Point of Sales' }).click();
  await expect(page.getByText('Select Report')).toBeVisible();
  const actualMonth = await page.textContent("(//*[contains(@class,'react-select__control')])[1]");
  const actualYear = await page.textContent("(//*[contains(@class,'react-select__control')])[2]");
  if (previuosMonth === 1) {
    if (actualMonth === 12 && actualYear === (year - 1)) {
      results = true;
    } else {
      results = false;
    }
  } else {
    if (previuosMonth === actualMonth && year === actualYear) {
      results = true;
    } else {
      results = false;
    }
  }
  console.log('expected month: ' + previuosMonth + ' actual month: ' + actualMonth);
  console.log('expected year: ' + year + ' actual year: ' + actualYear);
  if (results) { } else { throw errors }
});
test("display the GP for grand total", async () => {
  const urlPath = 'all_quotes/09630d01-f674-449b-9ed6-576e27656f3f';
  await page.goto(stage_url + urlPath);
  let totalIidmCost = 0.0, totalQuotePrice = 0.0;
  await expect(page.locator("(//*[text()='IIDM Cost:'])[1]")).toBeVisible();
  const iCost = await page.locator('//*[@id="repair-items"]/div[2]/div[1]/div/div/div[2]/div[3]/div[3]/h4');
  const qPrice = await page.locator('//*[@id="repair-items"]/div[2]/div[1]/div/div/div[2]/div[3]/div[1]/h4');
  const tAGP = await page.locator('//*[@id="repair-items"]/div[3]/div/div[1]/div/h4').textContent();
  for (let index = 0; index < await iCost.count(); index++) {
    let ic = await iCost.nth(index).textContent();
    let qp = await qPrice.nth(index).textContent();
    totalIidmCost = totalIidmCost + Number((ic.replace("$", "")).replace(",", ""));
    totalQuotePrice = totalQuotePrice + Number((qp.replace("$", "")).replace(",", ""));
  }
  const totalExpectedGP = (totalIidmCost / totalQuotePrice).toFixed(2);
  const totalActualGP = Number((tAGP.replace("$", "")).replace("%", "")).toFixed(2);
  if (totalActualGP === totalExpectedGP) {
    console.log('actual gp: ' + totalActualGP + ' expected gp: ' + totalExpectedGP);
  } else {
    throw new Error('actual gp: ' + totalActualGP + ' expected gp: ' + totalExpectedGP);
  }
});
test("Revice the old version also", async () => {

});
test("display the project name at send to customer page", async () => {

});
test('sysproID, branch and email fields are editable at edit user page', async () => {
  await page.getByText('Admin').click();
  await page.locator('#root').getByText('Users').click();
  await page.getByPlaceholder('Search').fill('defaultuser');
  await expect(page.locator("(//*[@title='Default User'])[1]")).toBeVisible();
  await page.getByText('Edit').click();
  await expect(page.getByText('First Name')).toBeVisible();
  await page.pause();
})

test('verifying the vendor part number not accepting the space', async () => {
  async function addDataIntoPartsPurchase(page) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByText('Search Vendor').click();
    await page.keyboard.insertText('enterpi');
    await expect(page.locator("//*[text()='Loading...']")).toBeVisible();
    await expect(page.locator("//*[text()='Loading...']")).toBeHidden();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByPlaceholder('Enter Vendor Part Number').fill('VENDOR PART  NUMBER');
    await page.locator("//*[@id='tab-2-tab']/div/div/button").click();
  }
  try {
    await page.getByText('Parts Purchase').click();
    await page.getByText('Create Parts Purchase').click();
    await page.getByText('Select Technician').click();
    await page.keyboard.press('Enter');
    try {
      await expect(page.locator("(//*[contains(@class,'singleValue')])[2]")).toBeVisible({ timeout: 2000 });
    } catch (error) {
      await page.getByText('Select Date Requested').click();
      await page.getByRole('gridcell', { name: day }).click();
    }
    await page.getByText('Select Urgency').click();
    await page.keyboard.press('Enter');
    await addDataIntoPartsPurchase(page);
    await expect(page.locator("//*[text()='Vendor Part Number not valid']")).toBeHidden({ timeout: 2300 });
    await page.getByTitle('close').getByRole('img').click();
    await page.getByText('Repairs').click();
    await page.locator('#root').getByText('Repair in progress').click();
    const source = page.locator("//*[@class='ag-body-horizontal-scroll-viewport']")
    const target = page.locator("//*[@class='ag-horizontal-right-spacer ag-scroller-corner']")
    await source.dragTo(target);
    await page.locator("(//*[text()='In Progress'])[1]").click();
    const partsPurchaseIcon = page.locator("(//*[contains(@src,'partspurchase')])[1]");
    await expect(partsPurchaseIcon).toBeVisible();
    await partsPurchaseIcon.click();
    await addDataIntoPartsPurchase(page);
  } catch (error) {
    throw new Error("vendor part number not accepting spaces: " + error);
  }
})

test("Need to able to type start date and end dates at non SPA configure", async () => {
  const expectedDates = startDate + ' - ' + endDate;
  await page.getByRole('button', { name: 'Pricing expand' }).click();
  await page.getByRole('menuitem', { name: 'Non Standard Pricing' }).click();
  const configureButton = page.getByRole('button', { name: 'Configure' });
  await expect(configureButton).toBeVisible();
  await configureButton.click();
  await page.getByPlaceholder('MM/DD/YYYY-MM/DD/YYYY').click();
  const actualDates = await selectStartEndDates(page, startDate, '-', endDate, day, true);
  if (actualDates[1].backgroundColor === 'rgb(25, 118, 210)') {
    try {
      await expect(page.locator("//*[text()='Please select Date Range']")).toBeHidden({ timeout: 2000 });
      if (actualDates[0] === expectedDates) {
        await page.getByLabel('Close').click();
        const actualDates = await selectStartEndDates(page, startDate, ' - ', endDate, day, true);
        if (actualDates[1].backgroundColor === 'rgb(25, 118, 210)') {
          if (actualDates[0] === expectedDates) { await page.getByLabel('Close').click(); }
          else { throw new Error("keyboard typing not accepting for start and end dates at SPA"); }
        } else { throw new Error("displaying background colour is: " + actualDates[1].backgroundColor + ' but expected is: rgb(25, 118, 210)'); }
      } else { throw new Error("keyboard typing not accepting for start and end dates at SPA"); }
    } catch (error) {
      throw new Error("keyboard typing not accepting for start and end dates at SPA: " + error);
    }
  } else { throw new Error("displaying background colour is: " + actualDates[1].backgroundColor + ' but expected is: rgb(25, 118, 210)'); }
});
test("Need to able to type start date and end dates at non SPA Filters", async () => {
  const expectedDates = startDate + ' - ' + endDate;
  await page.getByRole('button', { name: 'Pricing expand' }).click();
  await page.getByRole('menuitem', { name: 'Non Standard Pricing' }).click();
  const startEndDates = page.locator("//*[@placeholder='Start & End Date']");
  await expect(startEndDates).toBeVisible();
  await startEndDates.click();
  const actualDates = await selectStartEndDates(page, startDate, '-', endDate, day, false);
  if (actualDates[1].backgroundColor === 'rgb(25, 118, 210)') {
    try {
      await expect(page.locator("//*[text()='Please select Date Range']")).toBeHidden({ timeout: 2000 });
      if (actualDates[0] === expectedDates) {
        await page.getByLabel('Close').click();
        const actualDates = await selectStartEndDates(page, startDate, ' - ', endDate, day, true);
        if (actualDates[1].backgroundColor === 'rgb(25, 118, 210)') {
          if (actualDates[0] === expectedDates) { await page.getByLabel('Close').click(); }
          else { throw new Error("keyboard typing not accepting for start and end dates at SPA"); }
        } else { throw new Error("displaying background colour is: " + actualDates[1].backgroundColor + ' but expected is: rgb(25, 118, 210)'); }
      } else { throw new Error("keyboard typing not accepting for start and end dates at SPA"); }
    } catch (error) {
      throw new Error("keyboard typing not accepting for start and end dates at SPA: " + error);
    }
  } else { throw new Error("displaying background colour is: " + actualDates[1].backgroundColor + ' but expected is: rgb(25, 118, 210)'); }
});
test('need to type start and end date at non spa edit grids', async () => {
  const expectedDates = startDate + ' - ' + endDate;
  await page.getByRole('button', { name: 'Pricing expand' }).click();
  await page.getByRole('menuitem', { name: 'Non Standard Pricing' }).click();
  const editIcon = await page.locator("(//*[@class='edit-del-divs'])[1]");
  await editIcon.scrollIntoViewIfNeeded();
  await editIcon.click();
  await page.getByLabel('Close').click();
  await page.locator('[id="pricing_rules\\.0\\.buy_side_discount"]').fill('');
  await page.getByLabel('clear').click();
  await page.getByPlaceholder('MM/DD/YYYY-MM/DD/YYYY').click();
  const actualDates = await selectStartEndDates(page, startDate, '-', endDate, day, true);
  if (actualDates[1].backgroundColor === 'rgb(25, 118, 210)') {
    try {
      await expect(page.locator("//*[text()='Please select Date Range']")).toBeHidden({ timeout: 2000 });
      if (actualDates[0] === expectedDates) {
        await page.getByLabel('Close').click();
        const actualDates = await selectStartEndDates(page, startDate, ' - ', endDate, day, true);
        if (actualDates[1].backgroundColor === 'rgb(25, 118, 210)') {
          if (actualDates[0] === expectedDates) { await page.getByLabel('Close').click(); }
          else { throw new Error("keyboard typing not accepting for start and end dates at SPA"); }
        } else { throw new Error("displaying background colour is: " + actualDates[1].backgroundColor + ' but expected is: rgb(25, 118, 210)'); }
      } else { throw new Error("keyboard typing not accepting for start and end dates at SPA"); }
    } catch (error) {
      throw new Error("keyboard typing not accepting for start and end dates at SPA: " + error);
    }
  } else { throw new Error("displaying background colour is: " + actualDates[1].backgroundColor + ' but expected is: rgb(25, 118, 210)'); }
  await page.pause();
})