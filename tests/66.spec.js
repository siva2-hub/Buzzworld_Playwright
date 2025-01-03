const { test, expect, errors } = require("@playwright/test");
const ExcelJS = require('exceljs');
const { login_buzz, selectStartEndDates, createQuote, addItesms, approve, read_excel_data, api_responses, delay, selectReactDropdowns } = require("./helper");
const { throws } = require("assert");
const { error } = require("console");
const { testDir } = require("../playwright.config");
const { default: AllPages } = require("./PageObjects");
const { platform } = require("os");

const stage_url = process.env.BASE_URL_BUZZ;
let allPages;
const date = new Date().toDateString(); let results = false;
const currentDate = new Date(date);
let day = currentDate.getDate();
let previuosMonth = currentDate.getMonth();
const year = currentDate.getFullYear();
let page, context;
test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  page = await context.newPage()
  allPages = new AllPages(page);
  await login_buzz(page, stage_url);
});
async function startEndDates() {
  if (day < 10) { day = '0' + day.toString().replace("0", ""); }
  else { }
  if (previuosMonth < 10) { previuosMonth = '0' + previuosMonth.toString().replace("0", ""); }
  else { }
  const startDate = (previuosMonth + 1) + '/' + day + '/' + year;
  const endDate = (previuosMonth + 1) + '/' + day + '/' + (year + 1);
  return [startDate, endDate, day];
}
test("Prefil the previous month and current year at POS reports", async () => {
  await page.getByRole('button', { name: 'Reports expand' }).click();
  await page.getByRole('menuitem', { name: 'Point of Sales' }).click();
  await expect(page.getByText('Select Report')).toBeVisible();
  const actualMonth = await page.textContent("(//*[contains(@class,'react-select__control')])[1]");
  const actualYear = await page.textContent("(//*[contains(@class,'react-select__control')])[2]");
  if (previuosMonth === 1) {
    if (actualMonth === 12 && actualYear === (year - 1)) { results = true; }
    else { results = false; }
  } else {
    if (previuosMonth === actualMonth && year === actualYear) { results = true; }
    else { results = false; }
  }
  console.log('expected month: ' + previuosMonth + ' actual month: ' + actualMonth);
  console.log('expected year: ' + year + ' actual year: ' + actualYear);
  if (results) { } else { throw errors }
});
test("Display the GP as weighted average of sell price & IIDM cost", async () => {
  const urlPath = 'all_quotes/09630d01-f674-449b-9ed6-576e27656f3f';
  await page.goto(stage_url + urlPath);
  let totalIidmCost = 0.0, totalQuotePrice = 0.0;
  await expect(allPages.iidmCostLabel).toBeVisible();
  const iCost = allPages.iidmCost;
  const qPrice = allPages.quotePrice;
  const tAGP = await allPages.totalGP.textContent();
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
  } else { throw new Error('actual gp: ' + totalActualGP + ' expected gp: ' + totalExpectedGP); }
});
test("Revice the old version also", async () => {
  const urlPath = '991d63bd-39fc-4412-9762-2dac4c227ed0';
  await page.goto(stage_url + 'all_quotes/' + urlPath);
  const iidmCostText = allPages.iidmCostLabel;
  const reviseQuoteButton = allPages.reviseQuoteButton;
  await expect(iidmCostText).toBeVisible();
  const itemsDataInLatestVersion = await allPages.allItemsAtDetailView.textContent();
  try {
    await expect(reviseQuoteButton).toBeVisible({ timeout: 2000 });
    const versionDropdown = allPages.versionDropdown;
    await versionDropdown.click();
    await page.click("//*[text()='V2']");
    await expect(iidmCostText).toBeVisible();
    const itemsDataInOldVersion = await allPages.allItemsAtDetailView.textContent();
    if (itemsDataInLatestVersion === itemsDataInOldVersion) {
      await expect(reviseQuoteButton).toBeVisible({ timeout: 2000 });
    } else { throw new Error("items data at latest and old version are not matched."); }
  } catch (error) { throw new Error('Error is: ' + error); }
});
test("Display the project name at send to customer page", async () => {
  let accoutNumber = 'ZUMMO00', contactName = 'Austin Zummo', quoteType = 'Parts Quote', items = ['01230.9-00'];
  // await page.goto('https://www.staging-buzzworld.iidm.com/quote_for_parts/189534fb-4592-43ea-9ad9-9d468ec119a6')
  await createQuote(page, accoutNumber, quoteType);
  const quoteNumber = await allPages.quoteOrRMANumber.textContent();
  const projectName = await allPages.projectNamePartsQuote.textContent();
  await addItesms(page, items, quoteType);
  await approve(page, contactName);
  await expect(allPages.iidmCostLabel).toBeVisible();
  await allPages.sendToCustomerButton.click();
  const expectedSubject = projectName + ' - ' + 'IIDM Quote ' + quoteNumber;
  const actaualSuobject = await allPages.subject.getAttribute('value');
  if (actaualSuobject === expectedSubject) {
  } else { throw new Error("actual subject is: " + actaualSuobject + ' but expected subject is: ' + expectedSubject); }
});
test('sysproID, branch and email fields are editable at edit user page', async () => {
  await page.getByText('Admin').nth(0).click();
  await page.locator('#root').getByText('Users').click();
  await page.getByPlaceholder('Search').fill('defaultuser');
  await expect(page.locator("(//*[@title='Default User'])[1]")).toBeVisible();
  await page.getByText('Edit').click();
  await expect(page.getByText('First Name')).toBeVisible();
  const isEmailEnable = await page.locator("//*[@name='email']").isEnabled();
  const isSysproIDEnable = await page.locator("//*[@name='syspro_id']").isEnabled();
  if (isEmailEnable) {
    if (isSysproIDEnable) {
      await page.pause();
    } else { throw new Error('syspro id field is disabled at edit users page'); }
  } else { throw new Error('email filed is disabled at edit users page'); }
});
test('Verifying the vendor part number not accepting the space', async () => {
  async function addDataIntoPartsPurchase(page) {
    const vendorName = 'ENTERPI SOFTWARE SOLUTIONS';
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByText('Search Vendor').click();
    await page.keyboard.insertText(vendorName);
    await expect(allPages.loading).toBeVisible(); await expect(allPages.loading).toBeHidden();
    await selectReactDropdowns(page, vendorName);
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
      // await page.getByRole('gridcell', { name: day }).click();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
      await page.keyboard.press('ArrowLeft');
    }
    await page.getByText('Select Urgency').click();
    await selectReactDropdowns(page, 'Standard');
    await addDataIntoPartsPurchase(page);
    await expect(page.locator("//*[text()='Vendor Part Number not valid']")).toBeHidden({ timeout: 2300 });
    await page.getByTitle('close').getByRole('img').click();
    await page.getByText('Repairs').click();
    await page.locator('#root').getByText('Repair in progress').click();
    const source = allPages.horzScrollView;
    const target = allPages.horzScrollToRight;
    await source.dragTo(target);
    await page.locator("(//*[text()='In Progress'])[1]").click();
    const partsPurchaseIcon = allPages.ppIconRepairs;
    await expect(partsPurchaseIcon).toBeVisible();
    await partsPurchaseIcon.click();
    await addDataIntoPartsPurchase(page);
  } catch (error) {
    throw new Error("vendor part number not accepting spaces: " + error);
  }
});
test("Need to able to type start date and end dates at non SPA configure", async () => {
  const dates = await startEndDates();
  const startDate = dates[0]; const endDate = dates[1]; day = dates[2];
  const expectedDates = `${startDate} - ${endDate}`;
  await allPages.pricingDropDown.click();
  await allPages.nonSPAButtonAtDropDown.click();
  const configureButton = page.getByRole('button', { name: 'Configure' });
  await expect(configureButton).toBeVisible();
  await configureButton.click();
  await allPages.startDateEndDateByPlaceholder.click();
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
  const dates = await startEndDates();
  const startDate = dates[0]; const endDate = dates[1]; day = dates[2];
  const expectedDates = `${startDate} - ${endDate}`;
  await allPages.pricingDropDown.click();
  await allPages.nonSPAButtonAtDropDown.click();
  const startEndDate = page.locator("//*[@placeholder='Start & End Date']");
  await expect(startEndDate).toBeVisible();
  await startEndDate.click();
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
test('Need to type start and end date at non spa edit grids', async () => {
  const dates = await startEndDates();
  const startDate = dates[0]; const endDate = dates[1]; day = dates[2];
  const expectedDates = `${startDate} - ${endDate}`;
  // console.log(expectedDates);
  //Click on Pricing dropdown and Go to Non Standard Pricing Applier
  await allPages.pricingDropDown.click();
  await allPages.nonSPAButtonAtDropDown.click();
  const editIcon = await page.locator("(//*[@class='edit-del-divs'])[1]");
  await editIcon.scrollIntoViewIfNeeded();
  await editIcon.click();
  await page.getByLabel('Close').click();
  //Clear the existing data from some of the required field
  await page.locator('[id="pricing_rules\\.0\\.buy_side_discount"]').fill('');
  await page.locator("//*[@id='pricing_rules.0.type_value']").fill('')
  await allPages.startDateEndDateByPlaceholder.click();
  // Select and validate start and end dates
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
test('Verifying GP < 23 permission', async () => {
  //Go to Admin Section
  await page.getByText('Admin').nth(0).click();
  //Go to Users tab
  await page.locator('#root').getByText('Users').click();
  //Search for default user
  await page.getByPlaceholder('Search').fill('defaultuser');
  //Check the default user is visible in users list or not
  await expect(page.locator("(//*[@title='Default User'])[1]")).toBeVisible();
  //Go to the default user's permissions
  await page.getByRole('tab', { name: 'Permissions' }).click();
  //check the GP < 23% permissin is
  const childPermissions = await page.locator("(//*[@class='child-permissions'])");
  for (let index = 0; index < await childPermissions.count(); index++) {
    const text = await childPermissions.nth(index).textContent();
    //Check the child element contains this text GP < 23% Approval
    if (text.includes('GP < 23% Approval')) {
      await childPermissions.nth(index).scrollIntoViewIfNeeded();
      const gpYes = await page.locator("(//*[@class='child-permissions'])[" + (index + 1) + "]/span[2]/div/div/div/label[1]/input");
      //Verify the  GP < 23% Approval permission is Yes or No
      const btnStatus = await gpYes.isChecked();
      console.log('GP < 23% Approval is: ' + btnStatus);
      await page.goto("https://www.staging-buzzworld.iidm.com/all_quotes/8bd38f42-fb1d-4b35-a22a-f611cab4d86e");
      await expect(allPages.iidmCostLabel).toBeVisible();
      if (btnStatus) {
        //If yes, then verify the Approve button is Visible or not
        try { await expect(page.locator("//*[text()='Approve']")).toBeVisible({ timeout: 2000 }); }
        catch (error) { throw new Error("" + error); }
      } else {
        //If No, then verify the Approve button is Hidden or not
        try { await expect(page.locator("//*[text()='Approve']")).toBeHidden({ timeout: 2300 }); }
        catch (error) { throw new Error("" + error); }
      }
      break;
    } else { }
  }
});
test('verifying pricing', async () => {
  let yask_data = await read_excel_data('/home/enterpi/Downloads/WAGO001 2025 sample_pricing_file (26).csv', 0);// our db
  console.log('test pricing list rows count is ', yask_data.length);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('test_pricing.xlsx'); let linesCount = 1;
  for (let index = 0; index < yask_data.length; index++) {
    //test_priding file Sheet2 Data
    let code = yask_data[index]['VendorStockCode(30)'];
    if (code.length > 29) {
      const api_url = 'https://staging-buzzworld-api.iidm.com//v1/Products?page=1&perPage=25&sort=asc&sort_key=stock_code&branch_id=385411d3-ddc8-4029-9719-e89698446c24&vendor_id=6c7da9c6-5860-4b96-b1d5-ff28ba734b9c&vendor_name=WAGO+CORPORATION&serverFilterOptions=%5Bobject+Object%5D&search=' + code;
      console.log((index + 1) + " --> " + code);
      const pricingList = await api_responses(page, api_url);
      const list = await pricingList.result.data.list;
      console.log(JSON.stringify(list, null, 2));
      linesCount = +1;
      console.log('=======================================================================');
    } else { }
  }
  console.log('lines count which are >29: ' + linesCount);
  //
});
test('Allow 31 charcaters for stock code at imports', async () => {
  const vendorCode = 'WAGO001'; const vendorName = 'WAGO CORPORATION';
  await allPages.pricingDropDown.click();
  await allPages.pricingDropDown.nth(1).click();
  await page.getByPlaceholder('Search').fill(vendorCode);
  await delay(page, 5000);
  await page.getByText('Import').click();
  await page.getByLabel('Vendor').fill(vendorCode);
  await expect(allPages.loading).toBeVisible(); await expect(allPages.loading).toBeHidden();
  await selectReactDropdowns(page, (vendorName + vendorCode));
  await allPages.isAppendCheckbox.nth(1).click();
  await allPages.pricingUploader.setInputFiles('characters_check.xlsx');
  await expect(page.getByText('Pricing File Uploaded')).toBeVisible();
  await page.getByRole('button', { name: 'Import' }).click();
  await expect(page.locator("(//*[contains(text(),'Error in pricing file')])")).toBeVisible();
  await expect(allPages.sc31Limit).toBeVisible({ timeout: 2000 });
});