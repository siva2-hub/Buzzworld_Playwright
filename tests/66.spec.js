const { test, expect, errors, request } = require("@playwright/test");
const ExcelJS = require('exceljs');
const { login_buzz, selectStartEndDates, createQuote, addItesms, approve, read_excel_data, api_responses, delay, selectReactDropdowns, selectRFQDateandQuoteRequestedBy, soucreSelection, filters_quotes_sales_person, listenAPIResponsed } = require("./helper");
const { throws } = require("assert");
const { error } = require("console");
const { testDir, timeout } = require("../playwright.config");
const { default: AllPages } = require("./PageObjects");
const { platform, userInfo } = require("os");
const { populate } = require("dotenv");
const { navigateToPOSReports, checkPrviousMonthandCurrentYearPrefil } = require("../pages/POSReportsPages");
const { checkGPGrandTotalAtQuoteDetails, checkReviseForOldVersions, displayProjectNameAtSendToCustomerApprovals } = require("../pages/QuotesPage");
const { checkEmailSysProEditStatus } = require("../pages/UsersPage");
const { checkVendorPartNumberAcceptingSpacesOrNot } = require("../pages/PartsBuyingPages");
const { testData } = require("../pages/TestData");
const { checkWarehouseInfoAtAddNewPart } = require("../pages/InventoryPage");

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
test.skip("Prefil the previous month and current year at POS reports", async () => {
  await checkPrviousMonthandCurrentYearPrefil(page);
});
test("Display the GP as weighted average of sell price & IIDM cost", async () => {
  await checkGPGrandTotalAtQuoteDetails(page, testData.totalGP.quote_id);
});
test.skip("Revice the old version also", async () => {
  let quote_id = testData.revOldVer.quote_id;
  let isCreateNew = testData.revOldVer.isCreateNew;
  let accoutNumber = testData.revOldVer.accout_num, contactName = testData.revOldVer.contact_name,
    quoteType = testData.revOldVer.quote_type, items = testData.revOldVer.items;
  await checkReviseForOldVersions(
    page, quote_id, isCreateNew, accoutNumber, contactName, quoteType, items
  );
});
test("Display the project name at send to customer page", async () => {
  let isCreateNew = testData.pro_name_send_cust.isCreateNew, quoteId = testData.pro_name_send_cust.quote_id,
    accoutNumber = testData.pro_name_send_cust.accout_num, contactName = testData.pro_name_send_cust.contact_name,
    quoteType = testData.pro_name_send_cust.quote_type, items = testData.pro_name_send_cust.items;
  await displayProjectNameAtSendToCustomerApprovals(
    page, quoteId, isCreateNew, accoutNumber, contactName, quoteType, items
  );
});
test.skip('sysproID, branch and email fields are editable at edit user page', async () => {
  let userFullName = testData.userDetails.user_full_name, sys_pro_id = testData.userDetails.sys_pro_id;
  await checkEmailSysProEditStatus(page, userFullName, sys_pro_id);
});
test.skip('Verifying the vendor part number not accepting the space', async () => {
  await checkVendorPartNumberAcceptingSpacesOrNot(page, testData.parts_buy_detls.ven_part_num);
});
test.skip('Verifying the warehouse for new part at Inventory', async () => {
  await checkWarehouseInfoAtAddNewPart(page, testData.inventory.new_part)
});
test.skip('Revise Quote button displaying statuses', async () => {
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
test.skip("Need to able to type start date and end dates at non SPA configure", async () => {
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
test.skip("Need to able to type start date and end dates at non SPA Filters", async () => {
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
test.skip('Need to type start and end date at non spa edit grids', async () => {
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
test.skip('Verifying GP < 23 permission', async () => {
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
test.skip('Verifying pricing', async () => {
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
test.skip('Allow 31 charcaters for stock code at imports', async () => {
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
test.skip('api response items search', async () => {
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
