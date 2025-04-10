const { test, expect } = require('@playwright/test');
import { delay, getGridColumn } from './helper';
const { returnResult, approve, login_buzz } = require('./helper');
import { storeLogin, cartCheckout, grandTotalForCreditCard, creditCardPayment, searchProdCheckout, selectCustomerWithoutLogin, selectBillingDetails, selectShippingDetails, request_payterms, createQuoteSendToCustFromBuzzworld, net30Payment, ccPayment, ccPaymentLoggedIn, ccPaymentAsGuest, exemptNonExemptAtCheckout, grandTotalForNet30_RPayterms, checkTwoPercentForRSAccounts, getPendingApprovalsGT, checkShippingInstructionsAtOrders, ordersGridSorting } from '../pages/StorePortalPages';
const { loadingText } = require('../pages/PartsBuyingPages');
const { storeTestData } = require('../pages/TestData_Store');
import { reactFirstDropdown, createQuote, addItemsToQuote, selectRFQDateRequestedBy, selectSource, sendForCustomerApprovals, quoteOrRMANumber } from '../pages/QuotesPage';
const { testData } = require('../pages/TestData');
const testdata = JSON.parse(JSON.stringify(require("../testdata.json")))
let url = process.env.BASE_URL_STORE;

test('Net 30 Payment from Store logged-In User with file attachment', async ({ page }) => {
  let modelNumber = [storeTestData.price_product_1],
    poNumber = storeTestData.po_number;
  await net30Payment(page, modelNumber, poNumber, storeTestData.loggedIn_api_path)
});
test('As Logged In Credit Card Payment', async ({ page }) => {
  let card_type = storeTestData.card_details.visa,//defining the card type here
    modelNumber = [storeTestData.price_product_1],
    cardDetails = [
      card_type.card_number,
      card_type.exp_date,
      card_type.cvv
    ];
  //Make the credit card payment
  await ccPaymentLoggedIn(page, modelNumber, cardDetails, storeTestData.loggedIn_api_path);
});
test('As a Guest Credit Card Payment with Exist Customer New Email', async ({ page }) => {
  let customerName = storeTestData.exist_cust_detls.customer_name, fName = storeTestData.new_cust_detls.f_name,
    lName = storeTestData.new_cust_detls.l_name, email = storeTestData.new_cust_detls.email,
    modelNumber = [storeTestData.price_product_1], card_type = storeTestData.card_details.visa
  // let card_type = testdata.card_details.visa;
  let cardDetails = [
    card_type.card_number,
    card_type.exp_date,
    card_type.cvv
  ];
  await ccPaymentAsGuest(
    page, url, modelNumber, customerName, fName, lName, email, cardDetails, true, storeTestData.guest_api_path
  );
});
test('As a Guest Credit Card Payment with New Customer New Email', async ({ page }) => {
  let customerName = storeTestData.new_cust_detls.customer_name, fName = storeTestData.new_cust_detls.f_name,
    lName = storeTestData.new_cust_detls.l_name, email = storeTestData.new_cust_detls.email,
    modelNumber = [storeTestData.price_product], card_type = storeTestData.card_details.visa;
  // let card_type = testdata.card_details.visa;
  let cardDetails = [
    card_type.card_number,
    card_type.exp_date,
    card_type.cvv
  ];
  await ccPaymentAsGuest(
    page, url, modelNumber, customerName, fName, lName, email, cardDetails, false, storeTestData.guest_api_path
  );
});
test('Single Price-less Item Request Quote For Price Exist Customer New Email', async ({ page }) => {
  let customerName = storeTestData.exist_cust_detls.customer_name, fName = storeTestData.exist_cust_detls.f_name,
    lName = storeTestData.exist_cust_detls.l_name, email = storeTestData.new_cust_detls.email,
    modelNumber = [storeTestData.non_price_product], isCustomerAlreadyExist = true;
  let url = process.env.BASE_URL_STORE;
  await page.goto(url);
  await searchProdCheckout(page, modelNumber);
  //selecting customer details
  await selectCustomerWithoutLogin(page, customerName, fName, lName, email, isCustomerAlreadyExist);
  //select billing address
  await selectBillingDetails(page);
  //select shipping address
  await selectShippingDetails(page);
  //enter item notes
  await page.getByRole('textbox').fill('Test\nNotes'); await page.pause();
  // await page.getByRole('button', { name: 'Request Quote For Price' });.click();
});
test('Single Price-less Item Request Quote For Price New Customer New Email', async ({ page }) => {
  let customerName = storeTestData.new_cust_detls.customer_name, fName = storeTestData.new_cust_detls.f_name,
    lName = storeTestData.new_cust_detls.l_name, email = storeTestData.new_cust_detls.email,
    modelNumber = [storeTestData.non_price_product], isCustomerAlreadyExist = false;
  let url = process.env.BASE_URL_STORE;
  await page.goto(url);
  await searchProdCheckout(page, modelNumber);
  //selecting customer details
  await selectCustomerWithoutLogin(page, customerName, fName, lName, email, isCustomerAlreadyExist);
  //select billing address
  await selectBillingDetails(page);
  //select shipping address
  await selectShippingDetails(page);
  //enter item notes
  await page.getByRole('textbox').fill('Test\nNotes'); await page.pause();
  // await page.getByRole('button', { name: 'Request Quote For Price' });.click();
});
test('For Two Price-less Items Request Quote For Price Exist Customer New Email', async ({ page }) => {
  let customerName = storeTestData.exist_cust_detls.customer_name, fName = storeTestData.exist_cust_detls.f_name,
    lName = storeTestData.exist_cust_detls.l_name, email = storeTestData.new_cust_detls.email,
    modelNumber = [storeTestData.non_price_product, storeTestData.non_price_product_1],
    isCustomerAlreadyExist = true;
  // modelNumber2 = storeTestData.non_price_product_1;// 376834-1D --> No Price , 231-2706/026-000 --> Have Price;
  await page.goto(url);
  await searchProdCheckout(page, modelNumber);
  // await page.goBack(); //again back to shop and add one more item which is having price
  // await searchProdCheckout(page, modelNumber2);
  //selecting customer details
  await selectCustomerWithoutLogin(page, customerName, fName, lName, email, isCustomerAlreadyExist);
  //select billing address
  await selectBillingDetails(page);
  //select shipping address
  await selectShippingDetails(page);
  //enter item notes
  await page.getByRole('textbox').fill('Test\nNotes'); await page.pause();
  await page.getByRole('button', { name: 'Request Quote For Price' }).click();
});
test('For Two Items Price and Price-less Request Quote For Price Exist Customer New Email', async ({ page }) => {
  let customerName = storeTestData.exist_cust_detls.customer_name, fName = storeTestData.exist_cust_detls.f_name,
    lName = storeTestData.exist_cust_detls.l_name, email = storeTestData.new_cust_detls.email,
    modelNumber = [storeTestData.non_price_product, storeTestData.price_product_1]
    , isCustomerAlreadyExist = true;
  // modelNumber2 = storeTestData.price_product_1;// 376834-1D --> No Price , 231-2706/026-000 --> Have Price;
  await page.goto(url);
  await searchProdCheckout(page, modelNumber);
  // await page.goBack(); //again back to shop and add one more item which is having price
  // await searchProdCheckout(page, modelNumber2);
  //selecting customer details
  await selectCustomerWithoutLogin(page, customerName, fName, lName, email, isCustomerAlreadyExist);
  //select billing address
  await selectBillingDetails(page);
  //select shipping address
  await selectShippingDetails(page);
  //enter item notes
  await page.getByRole('textbox').fill('Test\nNotes'); await page.pause();
  await page.getByRole('button', { name: 'Request Quote For Price' }).click();
});
test('For Two Price-less Items Request Quote For Price New Customer New Email', async ({ page }) => {
  let customerName = storeTestData.new_cust_detls.customer_name, fName = storeTestData.new_cust_detls.f_name,
    lName = storeTestData.new_cust_detls.l_name, email = storeTestData.new_cust_detls.email,
    modelNumber = [storeTestData.non_price_product, storeTestData.non_price_product_1],
    isCustomerAlreadyExist = false;
  // modelNumber2 = storeTestData.non_price_product_1;
  await page.goto(url);
  await searchProdCheckout(page, modelNumber);
  // await page.goBack(); //again back to shop and add one more item which is having price
  // await searchProdCheckout(page, modelNumber2);
  //selecting customer details
  await selectCustomerWithoutLogin(page, customerName, fName, lName, email, isCustomerAlreadyExist);
  //select billing address
  await selectBillingDetails(page);
  //select shipping address
  await selectShippingDetails(page);
  //enter item notes
  await page.getByRole('textbox').fill('Test\nNotes'); await page.pause();
  await page.getByRole('button', { name: 'Request Quote For Price' }).click();
});
test('For Two Items Price and Price-less Request Quote For Price New Customer New Email', async ({ page }) => {
  let customerName = storeTestData.new_cust_detls.customer_name, fName = storeTestData.new_cust_detls.f_name,
    lName = storeTestData.new_cust_detls.l_name, email = storeTestData.new_cust_detls.email,
    modelNumber = [storeTestData.non_price_product, storeTestData.price_product_1],
    isCustomerAlreadyExist = false;
  // modelNumber2 = storeTestData.price_product_1;
  await page.goto(url);
  await searchProdCheckout(page, modelNumber);
  // await page.goBack(); //again back to shop and add one more item which is having price
  // await searchProdCheckout(page, modelNumber2);
  //selecting customer details
  await selectCustomerWithoutLogin(page, customerName, fName, lName, email, isCustomerAlreadyExist);
  //select billing address
  await selectBillingDetails(page);
  //select shipping address
  await selectShippingDetails(page);
  //enter item notes
  await page.getByRole('textbox').fill('Test\nNotes'); await page.pause();
  await page.getByRole('button', { name: 'Request Quote For Price' }).click();
});
test('Request For Pay Terms', async ({ page }) => {
  const pay_type = 'Request for Pay Terms';
  let customerName = storeTestData.new_cust_detls.customer_name, fName = storeTestData.new_cust_detls.f_name,
    lName = storeTestData.new_cust_detls.l_name, email = storeTestData.new_cust_detls.email,
    modelNumber = [storeTestData.price_product_1], isCustomerAlreadyExist = false;
  await page.goto(url);
  await searchProdCheckout(page, modelNumber);
  //selecting customer details
  let taxable = await selectCustomerWithoutLogin(page, customerName, fName, lName, email, isCustomerAlreadyExist);
  //select billing address
  await selectBillingDetails(page);
  //select shipping address
  await selectShippingDetails(page);
  //enter item notes
  await page.getByRole('textbox').fill('Test\nNotes');
  if (pay_type === 'Credit Card') {
    await page.getByLabel('Credit Card').click({ timeout: 10000 });
    await creditCardPayment(page, '', '');
  } else {
    await grandTotalForNet30_RPayterms(page, taxable);
    await request_payterms(page, storeTestData.guest_api_path);
  }
})
test('Create Quote From Buzzworld and Aprove Quote from Portal while Credit Card', async ({ page, browser }) => {
  let card_type = storeTestData.card_details.visa,//defining the card type here
    cardDetails = [
      card_type.card_number,
      card_type.exp_date,
      card_type.cvv
    ];
  //create the Quote from buzzworld and Approve the quote from Portal
  await createQuoteSendToCustFromBuzzworld(page, browser, cardDetails, 'Credit Card');
})
test('Net 30 Payment from Portal from quote detailed view logged-In User with file attachment', async ({ page, browser }) => {
  let card_type = storeTestData.card_details.visa,//defining the card type here
    cardDetails = [
      card_type.card_number,
      card_type.exp_date,
      card_type.cvv
    ];
  //create the Quote from buzzworld and Approve the quote from Portal
  await createQuoteSendToCustFromBuzzworld(page, browser, cardDetails, 'Net Payment');
})
test('Check 2 percent for Reseller Account', async ({ page }, testInfo) => {
  let email = 'chumpchange@espi.co', // chumpchange@espi.co , multicam@testuser.com
    modelNumber = ['D1000-240-50HP', 'FP65U2031AFA'], pay_type = 'Credit';
  await checkTwoPercentForRSAccounts(page, modelNumber, email, pay_type);
})
test('Total Values of Pending Approvals', async ({ page }, testInfo) => {
  await getPendingApprovalsGT(page);
})
test('Checking Shipping Instructions at Orders', async ({ page, browser }, testInfo) => {
  let modelNumber = [storeTestData.price_product], payType = 'NET 30';
  await checkShippingInstructionsAtOrders(page, modelNumber, payType, browser)
})
test('Checking Orders Grid Sorting', async ({ page }, testInfo) => {
  await ordersGridSorting(page);
})




test.skip('Declined the Credit Card Payment as Logged In', async ({ page }, testInfo) => {
  let card_type = testdata.card_details.american;
  // let card_type = testdata.card_details.visa;
  let cardDetails = [
    card_type.card_number,
    card_type.exp_date,
    card_type.cvv
  ];
  // let pay_type = '1% 10 NET 30';
  let pay_type = 'Credit Card';
  let userName = await storeLogin(page);
  await cartCheckout(page, true);
  if (pay_type === 'Credit Card') {
    await page.getByLabel('Credit Card').click({ timeout: 10000 });
    await page.getByRole('button', { name: 'Proceed' }).click();
    await creditCardPayment(page, userName, cardDetails);
  } else {
    await page.getByPlaceholder('Enter PO Number').fill('TESTPO1234');
    await page.click("//*[text() = 'Approve']");
  }
  let testResult;
  try {
    await expect(page.getByRole('dialog')).toContainText('This transaction has been declined.');
    testResult = true;
  } catch (error) {
    testResult = false;
  }
  await returnResult(page, testInfo.title, testResult);
  await page.waitForTimeout(2000);
});
test('verify add zipcode button', async () => {
  //at guest chckout page
  await page.goto(testdata.urls.store_url);
  await page.getByRole('link', { name: 'See all manufacturers' }).scrollIntoViewIfNeeded();
  await page.getByRole('link', { name: '231-642 - Male connector; 12-' }).first().hover();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: '' }).nth(1).click();
  await page.getByRole('link', { name: '231-2706/026-000 - 2-' }).first().hover();
  await page.getByRole('button', { name: '' }).nth(3).click();
  await page.goto(testdata.urls.cart_page_url);
  await page.getByRole('link', { name: 'Checkout' }).click();
  await page.getByText('Billing Information').click();
  await page.getByText('Shipping Information', { exact: true }).click();
  await page.locator('#async-select-example').nth(1).fill('00009');
  try {
    await page.getByText('Add Postal Code').hover();
    await page.screenshot({ path: "files/Add Postal Code at guest_c billing.png" })
    await page.getByText('Add Postal Code').click();
  } catch (error) {
    console.log("add postal code button not displayed at guest checkout page billing information");
  }

  await page.locator('#async-select-example').nth(2).fill('00009');
  try {
    await page.getByText('Add Postal Code').hover();
    await page.getByText('Add Postal Code').scrollIntoViewIfNeeded();
    await page.screenshot({ path: "files/Add Postal Code at guest_c shipping.png" })
    await page.getByText('Add Postal Code').click();
  } catch (error) {
    console.log("add postal code button not displayed at guest checkout page shipping information");
  }
  //at registration page
  await page.goto(testdata.urls.portal_url);
  await page.getByRole('button', { name: 'Register' }).click();
  await page.locator('#async-select-example').nth(1).fill('00009');
  try {
    await page.getByText('Add Postal Code').hover();
    await page.screenshot({ path: "files/Add Postal Code at registration.png" })
    await page.getByText('Add Postal Code').click();
  } catch (error) {
    console.log("add postal code button not displayed at guest checkout page shipping information");
  }
  //at logged checkout page
  await page.locator("//*[@alt = 'back-arrow']").click();
  await page.getByPlaceholder('Enter Email ID').fill(testdata.helme_customer.email);
  await page.waitForTimeout(1200);
  await page.getByPlaceholder('Enter Password').fill(testdata.helme_customer.pwd);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForTimeout(10000);
  await expect(await page.locator('//*[text() = "Shop Now"]')).toBeVisible({ timeout: 10000 });
  const pagePeromise = cont.waitForEvent("page");
  page.getByRole('button', { name: 'Shop Now' }).click();
  const page = await pagePeromise;
  await page.getByRole('link', { name: 'See all manufacturers' }).scrollIntoViewIfNeeded();
  await page.getByRole('link', { name: '231-642 - Male connector; 12-' }).first().hover();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: '' }).nth(1).click();
  await page.getByRole('link', { name: '231-2706/026-000 - 2-' }).first().hover();
  await page.getByRole('button', { name: '' }).nth(3).click();
  await page.goto(testdata.urls.cart_page_url);
  await page.getByRole('link', { name: 'Checkout' }).click();
  if (await page.getByPlaceholder('Enter Phone Number').getAttribute('value') === "") {
    await page.getByPlaceholder('Enter Phone Number').fill('(676) 476-57464');
  } else {
    console.log("executed the else blox");
  }
  await page.getByText('Billing Information').click();
  await page.getByText('Shipping Information', { exact: true }).click();
  await page.locator('#async-select-example').nth(1).fill('00009');
  try {
    await page.getByText('Add Postal Code').hover();
    await page.screenshot({ path: "files/Add Postal Code at logged_c billing.png" })
    await page.getByText('Add Postal Code').click();
  } catch (error) {
    console.log("add postal code button not displayed at loggedIn checkout page shipping information");
  }
  await page.locator('#async-select-example').nth(2).fill('00009');
  try {
    await page.getByText('Add Postal Code').hover();
    await page.getByText('Add Postal Code').scrollIntoViewIfNeeded();
    await page.screenshot({ path: "files/Add Postal Code at logged_c shipping.png" })
    await page.getByText('Add Postal Code').click();
  } catch (error) {
    console.log("add postal code button not displayed at loggedIn checkout page shipping information");
  }
})
test('registration with existing email', async ({ page }) => {
  await page.goto(testdata.urls.portal_url);
  await page.pause();
  await page.getByRole('button', { name: 'Register' }).click();
  await page.locator('.react-select__input-container').first().click();
  await page.getByLabel('Company Name*').fill('chump change automation');
  await page.getByRole('option', { name: 'Chump Change Automation' }).click();
  await page.getByPlaceholder('Enter First Name').fill('chump');
  await page.getByPlaceholder('Enter Last Name').fill('test');
  await page.getByPlaceholder('Enter Email ID').fill('chump@test.com');
  await page.getByPlaceholder('Enter Phone Number').fill('(764) 723-64833');
  await page.getByPlaceholder('Enter Address1').fill('Test Adrs Colm');
  await page.getByPlaceholder('Enter City').click();
  await page.getByPlaceholder('Enter City').fill('Columbia');
  await page.locator('div').filter({ hasText: /^Select State$/ }).nth(2).click();
  await page.locator('#react-select-2-input').fill('dis');
  await page.getByText('District of Columbia', { exact: true }).click();
  await page.locator('#async-select-example').nth(1).fill('77707');
  await page.getByRole('option', { name: '77707' }).click();
  await page.locator("//*[text() = 'Register']").click();
  await expect(page.locator("//*[text() = 'Yes']")).toHaveText('Yes');
  await page.locator("//*[text() = 'Yes']").click();
})
test('New Customer Registration', async ({ page }) => {
  await page.goto(url);
  await page.getByRole('link', { name: ' Login' }).click();
  await expect(page.getByRole('img', { name: 'IIDM' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Register' }).click();
  await page.locator('.react-select__input-container').first().click();
  await page.getByLabel('Company Name*').fill(storeTestData.new_cust_detls.customer_name);
  try {
    await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden();
    await expect(page.locator("//*[contains(text(), 'Add Company Name')]")).toBeVisible({ timeout: 2400 });
  } catch (error) {
    throw new Error("Customer Already Exist" + error);
  }
  await page.locator("//*[contains(text(), 'Add Company Name')]").click();
  await page.getByPlaceholder('Enter First Name').fill(storeTestData.new_cust_detls.f_name);
  await page.getByPlaceholder('Enter Last Name').fill(storeTestData.new_cust_detls.l_name);
  await page.getByPlaceholder('Enter Email ID').fill(storeTestData.new_cust_detls.email);
  await page.getByPlaceholder('Enter Phone Number').fill('(764) 723-64833');
  await page.getByPlaceholder('Enter Address1').fill('1620 E. State Highway 121');
  await page.getByPlaceholder('Enter City').fill('Lewisville');
  await page.locator('div').filter({ hasText: /^Select State$/ }).nth(2).click();
  await page.keyboard.insertText('Texas');
  await page.keyboard.press('Enter');
  await reactFirstDropdown(page).nth(2).click();
  await page.keyboard.insertText('75001');
  await page.getByRole('option', { name: '75001' }).first().click(); await page.pause();
  await page.locator("//*[text() = 'Register']").click();
})

test('quote approve', async ({ page }) => {
  await page.goto('https://www.staging-buzzworld.iidm.com/');
  await page.getByPlaceholder('Enter Email ID').fill('defaultuser@enterpi.com');
  await page.getByPlaceholder('Enter Password').click();
  await page.getByPlaceholder('Enter Password').fill('Enter@4321');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  // await page.getByText('Create Quote').click();
  // await page.getByText('Search By Account ID or').click();
  // await page.getByLabel('Company Name*').fill('zummo00');
  // await page.getByText('ZUMMO00', { exact: true }).click();
  // await page.getByPlaceholder('Enter Project Name').click();
  // await page.getByPlaceholder('Enter Project Name').fill('for testing stage');
  // await page.getByText('Quote Type').nth(1).click();
  // await page.getByText('Parts Quote', { exact: true }).click();
  // await page.getByRole('button', { name: 'Create Quote' }).click();
  await page.goto('https://www.staging-buzzworld.iidm.com/quote_for_parts/d82e2c52-9dd3-4547-a93f-a155ac6a79d7');
  await page.locator('div').filter({ hasText: /^RFQ Received Date\*$/ }).first().click();
  await page.locator('.pilabel-star > .css-uyo27s > .label-text-div > .pi-label-edit-icon > svg').first().click();
  await page.getByRole('button', { name: 'Now' }).click();
  await page.getByTitle('Save Changes').getByRole('img').click();
  await page.locator("(//*[contains(@title, 'Edit')])[4]").click();
  await page.locator("//*[contains(@class, 'container--has-value')]").fill('test ssss');
  await page.locator("//*[text()= 'test ssss')]").click();
  await page.getByTitle('Save Changes').getByRole('img').click();
  await page.locator('p').filter({ hasText: 'RFQ Received Date*' }).getByRole('img').first().click();

  // await page.locator('div:nth-child(7) > .pilabel-star > .css-uyo27s > .label-text-div > .pi-label-edit-icon > svg > path').click();
  // await page.locator('.react-select__value-container').click();
  // await page.locator('#react-select-7-input').fill('test ssss');
  // await page.locator('#react-select-7-option-50').click();
  // await page.getByTitle('Save Changes').getByRole('img').click();
  // await page.getByText('Add Items').click();
  // await page.getByPlaceholder('Search By Part Number').click();
  // await page.getByPlaceholder('Search By Part Number').fill('1234');
  // await page.getByText('12343-').click();
  // await page.locator('div').filter({ hasText: /^12343-000OMRON USB 3 CABLE 4M LOCK\/LOCKOMRON ELECTRONICS LLC$/ }).locator('rect').click();
  // await page.getByRole('button', { name: 'Add Selected 1 Items' }).click();
  // await page.getByRole('img', { name: 'chevron-right' }).click();
  // await page.locator('div').filter({ hasText: /^Select$/ }).nth(2).click();
  // await page.getByText('Factory Stock', { exact: true }).click();
  // await page.getByRole('button', { name: 'Save' }).click();
  // await page.getByRole('button', { name: 'Approve' }).click();
  // await page.getByRole('button', { name: 'Approve' }).nth(1).click();
  // await page.getByRole('button', { name: 'expand', exact: true }).click();
  // await page.getByRole('menuitem', { name: 'Delivered to Customer' }).click();
  // await page.getByRole('button', { name: 'loading' }).click();
  // await page.locator('.sc-dkdnUF').click();
  // await page.getByRole('button', { name: 'loading' }).click();
  // await page.getByRole('menuitem', { name: 'Logout' }).click();
  // await page.goto('https://www.staging-portal.iidm.com/');
  // await page.getByPlaceholder('Enter Email ID').fill('yyy@gmail.com');
  // await page.getByPlaceholder('Enter Password').click();
  // await page.getByPlaceholder('Enter Password').fill('Enter@4321');
  // await page.getByRole('button', { name: 'Sign In' }).click();
  // await page.getByRole('gridcell', { name: '2024022000030' }).click();
  // await page.locator('input[name="checkbox"]').check();
  // await page.getByRole('button', { name: 'Approve' }).first().click();
  // await page.getByPlaceholder('Enter Phone Number').click();
  // await page.getByPlaceholder('Enter Phone Number').fill('(798) 988-98979');
  // await page.getByRole('button', { name: 'Next' }).click();
  // await page.getByRole('button', { name: 'Next' }).click();
  // await page.getByText('Select Shipping Method').click();
  // await page.getByText('Over Night', { exact: true }).click();
  // await page.getByRole('button', { name: 'Next' }).click();
  // await page.getByRole('textbox').click();
  // await page.getByRole('textbox').fill('Test Notes');
  // await page.getByRole('button', { name: 'Proceed' }).click();
})

//--------------------------------------Payment Type Methods--------------------------------
async function creditCard(page) {
  await page.getByLabel('Credit Card').click({ timeout: 10000 });
  await page.getByRole('button', { name: 'Proceed' }).click();
  await page.getByPlaceholder('Enter Name on the Card').fill('test zummo');
  await page.getByPlaceholder('Enter Card Number').fill('4111 1111 1111 1111');
  await page.getByPlaceholder('MM / YY').fill('12/29');
  await page.getByPlaceholder('Enter CVC').fill('123');
}
async function net30() {

  await page.getByLabel('1% 10 NET 30').check();
  await page.getByRole('button', { name: 'Proceed' }).click();
  await page.getByPlaceholder('Enter PO Number').fill('TestPO1234');
  await page.pause()
}
test('Website Padding Tests', async ({ browser }, testInfo) => {
  let results = await websitePaddingTesting(browser);
  let testName = testInfo.title;
  await returnResult(page, testName, results);
});