const { test, expect, errors, request } = require("@playwright/test");
const ExcelJS = require('exceljs');
const { login_buzz, selectStartEndDates, createQuote, addItesms, approve, read_excel_data, api_responses, delay, selectReactDropdowns, selectRFQDateandQuoteRequestedBy, soucreSelection, filters_quotes_sales_person, listenAPIResponsed } = require("./helper");
const { throws } = require("assert");
const { error } = require("console");
const { testDir, timeout } = require("../playwright.config");
const { default: AllPages } = require("./PageObjects");
const { platform } = require("os");
const { populate } = require("dotenv");

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
  if (previuosMonth === 0) {
    previuosMonth = '0';
  }
  let results = false;
  if (previuosMonth.toString().length < 2) {
    previuosMonth = '0' + previuosMonth;
  }
  console.log('previous month: ' + previuosMonth);
  await page.locator("//*[text()='Reports']").click();
  await page.getByRole('menuitem', { name: 'Point of Sales' }).click();
  await expect(page.getByText('Select Report')).toBeVisible();
  const actualMonth = await page.textContent("(//*[contains(@class,'react-select__control')])[1]");
  const actualYear = await page.textContent("(//*[contains(@class,'react-select__control')])[2]");
  if (previuosMonth === '0') {
    if ((actualMonth === '12') && (Number(actualYear) === (year - 1))) {
      console.log('this is first month of the year so we displaying last year last month');
      results = true;
    }
    else { results = false; }
  } else {
    if (previuosMonth === actualMonth && year === Number(actualYear)) { results = true; }
    else { results = false; }
  }
  console.log('expected month: ' + previuosMonth + ' actual month: ' + actualMonth);
  console.log('expected year: ' + year + ' actual year: ' + actualYear);
  if (results) { } else { throw new Error("getting error while prefilling the POS dates"); }
});
test("Display the GP as weighted average of sell price & IIDM cost", async () => {
  const quoteId = '9b31c9d9-661e-4314-b41d-c2cdae3ab124'; const urlPath = 'all_quotes/' + quoteId;
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
  const totalExpectedGP = ((((totalQuotePrice - totalIidmCost) / totalQuotePrice) * 100).toFixed(2)) + ' %';
  const totalActualGP = (Number((tAGP.replace("$", "")).replace("%", "")).toFixed(2)) + ' %';
  if (totalActualGP === totalExpectedGP) {
    console.log('actual gp: ' + totalActualGP + ' expected gp: ' + totalExpectedGP);
  } else { throw new Error('actual gp: ' + totalActualGP + ' expected gp: ' + totalExpectedGP); }
  console.log('Quote Number: ' + await allPages.quoteOrRMANumber.textContent());
});
test("Revice the old version also", async () => {
  async function reviseQuote(page) {
    const reviseQuoteButton = allPages.reviseQuoteButton;
    await expect(reviseQuoteButton).toBeVisible({ timeout: 2000 });
    await reviseQuoteButton.click();
    await expect(page.locator("(//*[text()='This will move the quote to Open, Do you want to continue ?'])[1]")).toBeVisible();
    await page.locator("(//*[text()='Proceed'])[1]").click();
    await expect(iidmCostText).toBeVisible();
  }
  const urlPath = '92b89a84-4058-417b-9676-e2d0c1af6494'; let isCreateNew = false;
  let accoutNumber = 'ZUMMO00', contactName = 'James K', quoteType = 'System Quote', items = ['01230.9-00'];
  if (isCreateNew) {
    await createQuote(page, accoutNumber, quoteType);
    await addItesms(page, items, quoteType);
    await selectRFQDateandQuoteRequestedBy(page, contactName);
    await soucreSelection(page, items);
    await approve(page, contactName);
  } else { await page.goto(stage_url + 'all_quotes/' + urlPath); }
  const iidmCostText = allPages.iidmCostLabel;
  await expect(iidmCostText).toBeVisible();
  const itemsDataInLatestVersion = await allPages.allItemsAtDetailView.textContent();
  try {
    await expect(allPages.reviseQuoteButton).toBeVisible({ timeout: 2000 });
    try {
      await expect(allPages.versionDropdown).toBeVisible({ timeout: 2000 });
    } catch (error) { await reviseQuote(page); }
    const versionDropdown = allPages.versionDropdown;
    await versionDropdown.click();
    await page.locator("//*[text()='V1']").click();
    await expect(iidmCostText).toBeVisible();
    const itemsDataInOldVersion = await allPages.allItemsAtDetailView.textContent();
    if (itemsDataInLatestVersion === itemsDataInOldVersion) {
      await expect(allPages.reviseQuoteButton).toBeVisible({ timeout: 2000 });
      const itemsDataInLatestVersion = await allPages.allItemsAtDetailView.textContent();
      await reviseQuote(page);
      await allPages.versionDropdown.click();
      await page.locator("//*[text()='V1']").click();
      await expect(iidmCostText).toBeVisible();
      await allPages.allItemsAtDetailView.scrollIntoViewIfNeeded();
      const itemsDataInOldVersion = await allPages.allItemsAtDetailView.textContent();
      if (itemsDataInLatestVersion === itemsDataInOldVersion) {
        await expect(allPages.reviseQuoteButton).toBeVisible({ timeout: 2000 });
      } else { }
    } else { throw new Error("items data at latest and old version are not matched."); }
  } catch (error) { throw new Error('Error is: ' + error); }
});
test("Display the project name at send to customer page", async () => {
  let isCreateNew = false;
  let accoutNumber = 'ZUMMO00', contactName = 'Austin Zummo', quoteType = 'System Quote', items = ['1234-T1234'];//01230.9-00
  if (isCreateNew) {
    await createQuote(page, accoutNumber, quoteType);
    await addItesms(page, items, quoteType);
    await selectRFQDateandQuoteRequestedBy(page, contactName);
    await soucreSelection(page, items[0]);
  } else { await page.goto(stage_url + 'all_quotes/f3d6f549-185a-4efe-8c6e-99bddce76175') }
  const quoteNumber = await allPages.quoteOrRMANumber.textContent();
  let projectName = await allPages.projectNamePartsQuote.textContent();
  // await approve(page, contactName);
  await expect(allPages.iidmCostLabel).toBeVisible();
  await allPages.sendToCustomerButton.click();
  let expectedSubject;
  if (projectName === '-') {
    expectedSubject = 'IIDM Quote - ' + quoteNumber;
  } else {
    projectName = projectName.charAt(0).toUpperCase() + projectName.slice(1);
    expectedSubject = projectName + ' - ' + 'IIDM Quote - ' + quoteNumber;
  }
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
  const isEmailEnable = await allPages.emailAtUserEdit.isEnabled();
  const isSysproIDEnable = await allPages.sysproIdAtUserEdit.isEnabled();
  if (isEmailEnable) {
    if (isSysproIDEnable) {
      await allPages.emailAtUserEdit.fill('');
      await allPages.sysproIdAtUserEdit.fill('');
      await page.getByRole('button', { name: 'Update' }).click();
      await expect(page.getByText('Please Enter Email ID')).toBeVisible();
      await expect(page.getByText('Syspro ID can\'t be empty')).toBeVisible();
      await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
      //checking syspro ID with existing syspro ID
      await page.getByText('Edit').click();
      await expect(page.getByText('First Name')).toBeVisible();
      await allPages.sysproIdAtUserEdit.fill('AHH');
      await page.getByRole('button', { name: 'Update' }).click();
      await expect(page.getByText('Syspro Id already exists.')).toBeVisible();
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
    await expect(allPages.profileIconListView).toBeVisible();
    const source = allPages.horzScrollView;
    const target = allPages.horzScrollToRight;
    try {
      await expect(page.locator("(//*[text()='In Progress'])[1]")).toBeVisible({ timeout: 2000 })
    } catch (error) {
      await source.dragTo(target);
    }
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
  // await page.pause();
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
  let quoteId = '8bd38f42-fb1d-4b35-a22a-f611cab4d86e';
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
      await page.goto(stage_url + "all_quotes/" + quoteId);
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
test('Verifying pricing', async () => {
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
test('api response items search', async () => {
  const apiURL = 'https://buzzworldqa-iidm.enterpi.com:8446/v1/QuoteSearchItems?page=1&perPage=25&search=331EABH&quote_id=f64f36e2-e952-4f05-b830-35a85b5f5e61';
  const bearerToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4IiwianRpIjoiOTBlNWM2NTExYTE5ZTZkOTQ2ZjI3NmZlMzFkM2ZlY2RkYzUxNGEyNWRhNDhjMmNjZWVlYzExNTMzZDdkZDcwNDBiMTAxOWI4M2I3OWFhZjQiLCJpYXQiOjE3MzYxNTk2NTIuMzQ4MTE1LCJuYmYiOjE3MzYxNTk2NTIuMzQ4MTIxLCJleHAiOjE3Mzc0NTU2NTIuMzM2MDg1LCJzdWIiOiI5MWEzNWI0ZC0wMGZhLTQ5NGYtOTNjYS02NDZkYjJmY2I2MWMiLCJzY29wZXMiOltdfQ.kz4rt9oGEqDl3m8VyvFK4YcTKhlXwHvRy8-bND85uR_qVjaF-Zc8RL0_mdTQ0-4BI2eQjQVqSAg8R0en0UUYor9V6aMSorFm961dRvxrOmBIiPG30GVgtbw0Ph8RfVevyxsyo-tSm892TmLpXfrL-6nxd_Ng1FD9C3Zu-74nvyXr8fJL-oJR8r4m5fmbcvqJ91EZIOSXiL_rSNpigGH5oVaxilABO3kUnnsM__BUAAQZYY0YAXozu680c-naepp7x0c2Ikd1htdnlIoN25Zv1B0i0CEzPF7k6H7hMIk0RjIMU7qLxuNxrNAvzrQ00fDQAw25KtTMuWITxIecFDXONWLh-EH6H6GTwWiCx1O0hCVr5ubEPKwysNgj0FOCqzHKbBumWiKJ3sCwLDMTLxUlRkK2dpZWAKBpRXaMtDu0PpQuPUi1I7NTj6TxzCRVPzFGH-BDQX1s7Qun1MrdvBfBS0ENkfBmKSbNmvMXxhX6RXA1WcOPIG3h6b5P63NW7FHpV74WjYon0DeX8PS4FXrEaF491G9sQr_md_n-xOHxFPruOB66LmhLdkaFCDrx-7ji-W_nOQsPlI2EtT8swA9U5H2qcYyctuOBVnzWSPS9lSRdxdQFIk9FKGVhY0ICSNmp2BCt05TKvvPW-04ZB2P4g9b5anqsKDmKcoxiJxOn-WM';
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    }
  });
  const apiResponse = await (await apiContext.get(apiURL)).json();
  console.log(await apiResponse.result.data);
});
test('Verifying the warehouse for new part at Inventory', async () => {
  let newPart = '002-2123-01';
  await page.getByText('Inventory').click();
  await page.locator("//*[text()='Add Stock Code']").click();
  await page.getByRole('menuitem', { name: 'Single Stock Code' }).click();
  await page.getByText('Search By Stock Code', { exact: true }).click();
  await page.keyboard.insertText(newPart);
  await expect(allPages.loading).toBeVisible(); await expect(allPages.loading).toBeHidden();
  await selectReactDropdowns(page, newPart);
  await page.getByRole('dialog').getByLabel('open').nth(4).scrollIntoViewIfNeeded();
  const apiResponse = await api_responses(page, 'https://staging-buzzworld-api.iidm.com/v1/getInventoryQuery?stockCode=' + newPart + '&stockCodeId=' + newPart);
  const warehouseData = apiResponse.result.data.stockItemInfo.warehouse;
  let displayingWarehouse = [];
  for (let index = 0; index < warehouseData.length; index++) {
    displayingWarehouse.push(warehouseData[index]['warehouse']);
  }
  const actualDisplayingInfo = await page.locator("//*[@class='info']").textContent();
  const expDisplayingInfo = newPart + ' exists in warehouse ' + displayingWarehouse.join(', ');
  if (expDisplayingInfo === actualDisplayingInfo) {
    await page.getByRole('dialog').getByLabel('open').nth(4).click();
    await page.keyboard.insertText(warehouseData[0]['warehouse'])
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    try {
      await expect(page.getByText('Please Select Product Class')).toBeVisible({ timeout: 2000 });
      await page.getByRole('dialog').getByLabel('open').nth(1).click();
      await page.getByText('AB01', { exact: true }).click();
    } catch (error) { }
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.getByText('stock code exists')).toBeVisible();
  } else {
    console.log('expected displaying warehouse info: ' + expDisplayingInfo);
    console.log('actual displaying warehouse info: ' + actualDisplayingInfo);
  }
  // await page.pause();
});
test('Revise Quote button displaying statuses', async () => {
  async function selectStatusAtQuoteFilters(page, status) {
    try {
      const filterClear = allPages.clearFilters;
      await expect(filterClear).toBeVisible({ timeout: 2000 }); await filterClear.click();
    } catch (error) {
    }
    await page.locator("//*[text()='Filters']").click();
    await page.getByText('Select').nth(1).click();
    await selectReactDropdowns(page, status);
    await page.getByRole('button', { name: 'Apply' }).click();
    await delay(page, 1400);
  }
  async function verifyReviseQuoteButton(page, isBeVisible) {
    await expect(allPages.profileIconListView).toBeVisible();
    await allPages.profileIconListView.click();
    await expect(allPages.iidmCostLabel).toBeVisible();
    if (isBeVisible) { await expect(allPages.reviseQuoteButton).toBeVisible({ timeout: 2000 }); }
    else { await expect(allPages.reviseQuoteButton).toBeHidden({ timeout: 2000 }); }
    await allPages.leftBack.click();
  }
  await page.locator('#root').getByText('Expired Quotes').click();
  await verifyReviseQuoteButton(page, true);
  await page.locator('#root').getByText('Archived Quotes').click();
  await verifyReviseQuoteButton(page, false);
  await allPages.headerQuotesTab.click();
  await expect(allPages.profileIconListView).toBeVisible();
  await selectStatusAtQuoteFilters(page, 'Open');
  await verifyReviseQuoteButton(page, false);
  await selectStatusAtQuoteFilters(page, 'Pending Approval');
  await verifyReviseQuoteButton(page, true);
  await selectStatusAtQuoteFilters(page, 'Approved');
  await verifyReviseQuoteButton(page, true);
  await selectStatusAtQuoteFilters(page, 'Delivered to Customer');
  await verifyReviseQuoteButton(page, true);
  await selectStatusAtQuoteFilters(page, 'Won');
  await verifyReviseQuoteButton(page, false);
  await selectStatusAtQuoteFilters(page, 'Lost');
  await verifyReviseQuoteButton(page, false);
  await selectStatusAtQuoteFilters(page, 'Won SO created');
  await verifyReviseQuoteButton(page, false);
  await selectStatusAtQuoteFilters(page, 'Closed');
  await verifyReviseQuoteButton(page, false);
})
