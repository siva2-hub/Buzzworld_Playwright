// import exp from 'constants';
// import { checkout_page, order_summary_page, guest_checkout_form, guest_add_products, request_payterms, login } from './helper';

const { test, expect, chromium } = require('@playwright/test');
const { retries, timeout } = require('../playwright.config');
const { websitePaddingTesting, returnResult, delay, selectReactDropdowns } = require('./helper');
const { default: AllPages } = require('./PageObjects');
const testdata = JSON.parse(JSON.stringify(require("../testdata.json")))

let page, context, allPages;

  // let pay_type = '1% 10 NET 30';
  let pay_type = 'Credit Card';
  
test.only('Credit Card Payment as Logged In', async ({ page }) => {
    let card_type = testdata.card_details.american;
    // let card_type = testdata.card_details.visa;
    let cardDetails = [
      card_type.card_number,
      card_type.exp_date,
      card_type.cvv
    ];
    let userName = await storeLogin(page);
    await cartCheckout(page, false);

    if (pay_type === 'Credit Card') {
      await page.getByLabel('Credit Card').click({timeout: 10000})
      const status = await grandTotalForCreditCard(page);
      console.log('status is: '+status);
      if (status) {
        await page.pause();
        await page.getByRole('button', { name: 'Proceed' }).click();
        await creditCardPayment(page, userName, cardDetails);
      } else {
        throw new Error("prices not matched");
      }
    } else {
      await page.getByPlaceholder('Enter PO Number').fill('TESTPO1234');
      await page.click("//*[text() = 'Approve']");
    }
});
test.only('Credit Card Payment as without Logged In', async ({ page }) => {
  let customerName = 'Chump Chnage Automation Espi 1234',fName = 'Test123',lName='ChumpEspi1234',email='testchump1234@espi123.co';
  let card_type = testdata.card_details.american;
  let url = process.env.BASE_URL_STORE;
  // let card_type = testdata.card_details.visa;
  let cardDetails = [
    card_type.card_number,
    card_type.exp_date,
    card_type.cvv
  ];
  await page.goto(url);
  await page.locator("(//*[text() = 'Manufacturers'])[1]").hover();
  await page.click("(//*[text() = 'Yaskawa'])[1]");
  await page.locator('div.product-thumb-top').first().hover();
  await page.locator('.product-action > button').first().click();
  await page.getByRole('link', { name: 'Cart' }).first().click();
  await page.getByRole('link', { name: 'Checkout' }).click();
  await selectCustomerWithoutLogin(page, customerName, fName, lName, email, true);
  //select billing address
  await selectBillingDetails(page);
  //select shipping address
  await selectShippingDetails(page);
  await page.getByRole('textbox').fill('Test\nNotes');
  if (pay_type === 'Credit Card') {
    await page.getByLabel('Credit Card').click({timeout: 10000})
    await page.pause();
    const status = await grandTotalForCreditCard(page);
    if (status) {
      await page.getByRole('button', { name: 'Proceed' }).click();
      await creditCardPayment(page, userName, cardDetails);
    } else {
      throw new Error("price not matched");
    }
  } else {
    await page.getByPlaceholder('Enter PO Number').fill('TESTPO1234');
    await page.click("//*[text() = 'Approve']");
  }
});
test('Request Quote For Price', async({page})=> {
  let customerName = 'Chump Change Automation Espi 12',fName = 'Chump',lName='ChangeEspi12',email='chumpchange@espi12.co';
  let card_type = testdata.card_details.american;
  let url = process.env.BASE_URL_STORE;
  await page.goto(url);
  const productImage = page.locator("//*[@class='product-thumb image-top']");
  const addToCart = page.locator("//*[@title='Add to Cart']");
  await productImage.nth(2).hover();
  await addToCart.nth(2).click();
  await page.getByRole('link', { name: 'Cart' }).first().click();
  await page.getByRole('link', { name: 'Checkout' }).click();
  await selectCustomerWithoutLogin(page, customerName, fName, lName, email, false);
  //select billing address
  await selectBillingDetails(page);
  //select shipping address
  await selectShippingDetails(page);
  //enter item notes
  await page.getByRole('textbox').fill('Test\nNotes');
  await page.keyboard.press('F12');
  await page.pause();
  // await page.getByRole('button', { name: 'Request Quote For Price' });.click();
  await page.pause();
});
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
      await page.getByLabel('Credit Card').click({timeout: 10000});
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

//Logics
async function selectCustomerWithoutLogin(page, customerName, fName, lName, email, isExist) {
  await page.getByLabel('open').click();
  await page.getByLabel('Company Name*').fill(customerName);
  if (isExist) {
    await page.getByRole('option', { name: customerName, exact: true }).click();
  } else {
    try {
      allPages = new AllPages(page);
      await expect(allPages.loading).toBeVisible();
      await expect(allPages.loading).toBeHidden();
      await page.locator("//*[text()='Add Company Name']").toBeVisible();
      await page.getByRole('option', { name: customerName, exact: true }).toBeVisible({timeout:2000});
    } catch (error) {await page.locator("//*[text()='Add Company Name']").click();}
  }
  await page.getByPlaceholder('Enter First Name').fill(fName);
  await page.getByPlaceholder('Enter Last Name').fill(lName);
  await page.getByPlaceholder('Enter Email ID').fill(email);
  await delay(page, 2000); await page.getByPlaceholder('Enter Phone Number').fill('');
  await page.getByPlaceholder('Enter Phone Number').fill('(565) 465-46544');
  await page.getByRole('button', { name: 'Next' }).click();
}
async function selectBillingDetails(page) {
  await page.getByPlaceholder('Enter Address1').fill('Test Address');
  await page.getByPlaceholder('Enter City').fill('Test City');
  await page.getByText('Select State').click();
  await page.getByText('Arizona', { exact: true }).click();
  await page.getByLabel('Postal Code').click();
  await page.keyboard.insertText('75067');
  await page.getByRole('option', { name: '75067' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByPlaceholder('Enter Ship To Name').fill('Test Ship To Name');
  await page.getByRole('button', { name: 'Next' }).click();
}
async function selectShippingDetails(page) {
  await page.getByText('Select Shipping Method').click();
  await page.getByText('Over Night', { exact: true }).click();
  await page.getByLabel('', { exact: true }).check();
  await page.getByPlaceholder('Enter Collect Number').fill('123456ON');
  await page.getByRole('button', { name: 'Next' }).click();
}
async function storeLogin(page) {
  
  let w = 1920, h = 910;
  // let w = 1280, h = 551;
  await page.setViewportSize({
    width: w,
    height: h
  });
  let url = process.env.BASE_URL_STORE,
  logEmail, logPword, userName, path;
  await page.goto(url);
  await page.getByRole('link', { name: ' Login' }).click();
  await expect(page.getByRole('img', { name: 'IIDM' }).first()).toBeVisible();
  if (url.includes('dev')) {
    logEmail='cathy@bigmanwashes.com', logPword='Enter@4321', userName='Cathy'
  } else {
    logEmail='multicam@testuser.com', logPword='Enter@4321', userName='test'
  }
  await page.getByPlaceholder('Enter Email ID').fill(logEmail);
  await page.getByPlaceholder('Enter Password').fill(logPword);
  await page.click("(//*[@type='submit'])[1]");
  await expect(page.locator('#main-header')).toContainText(userName);
  return userName;
}
async function cartCheckout(page, isDecline) {
  await page.locator("(//*[text() = 'Manufacturers'])[1]").hover();
  await page.click("(//*[text() = 'Yaskawa'])[1]");
  await page.locator('div.product-thumb-top').first().hover();
  await page.locator('.product-action > button').first().click();
  await page.getByRole('link', { name: 'Cart' }).first().click();
  await page.getByRole('link', { name: 'Checkout' }).click();
  await page.getByPlaceholder('Enter Phone Number').fill('(565) 465-46544');
  await page.getByRole('button', { name: 'Next' }).click();
  if (isDecline) {
    for (let index = 0; index < 2; index++) {
      await page.getByLabel('Postal Code').click();
      await page.keyboard.insertText('46282');
      await expect(page.locator("//*[contains(text(),'Add Postal Code')]")).toBeVisible();
      await page.click("//*[contains(text(),'Add Postal Code')]");
      await page.getByRole('button', { name: 'Next' }).click();
    }
  } else {
    await page.getByRole('button', { name: 'Next' }).click();
  }
  await page.getByText('Select Shipping Method').click();
  await page.getByText('Over Night', { exact: true }).click();
  await page.getByLabel('', { exact: true }).check();
  await page.getByPlaceholder('Enter Collect Number').fill('123456ON');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('textbox').fill('Test\nNotes');
}
async function creditCardPayment(page, userName, cardDetails) {
  await page.pause();
  await page.getByPlaceholder('Enter Name on the Card').fill(userName);
  await page.getByPlaceholder('Enter Card Number').fill(cardDetails[0]);
  await page.getByPlaceholder('MM / YY').fill(cardDetails[1]);
  await page.getByPlaceholder('Enter CVC').fill(cardDetails[2]);
  await page.getByRole('button', { name: 'Proceed To Payment' }).click();
}
async function grandTotalForCreditCard(page) {
  let st = await page.locator("(//*[contains(@class,'Total_container')])[1]/div/div[2]").textContent();
  const subTotal = Number(Number(st.replace("$","").replace(",","")).toFixed(2));
  const exp_tax = Number((subTotal*0.085).toFixed(2));
  const exp_convFee = Number((subTotal*0.04).toFixed(2));
  const exp_grandTotal = subTotal+exp_tax+exp_convFee;
  console.log('exp sub total: '+subTotal);
  console.log('exp tax: '+exp_tax);
  console.log('exp con feee: '+exp_convFee);
  console.log('exp grand total: '+exp_grandTotal);
  let at = await page.locator("(//*[contains(@class,'Total_container')])[1]/div/div[4]").textContent();
  const actual_tax = Number(at.replace("$","").replace(",",""));
  let ac = await page.locator("(//*[contains(@class,'Total_container')])[1]/div/div[6]").textContent();
  const actual_convFee = Number(ac.replace("$","").replace(",",""));
  const actualGrandTotal = (subTotal+actual_tax+actual_convFee);
  console.log('actual sub total: '+subTotal);
  console.log('actual tax: '+actual_tax);
  console.log('actual con feee: '+actual_convFee);
  console.log('actual grand total: '+actualGrandTotal);
   let getResults = false;
  if (exp_grandTotal===actualGrandTotal && exp_tax===actual_tax && exp_convFee===actual_convFee) {getResults=true}
   else {getResults=false;}
   return getResults;
}
//   test('request payterms', async () => {
//     const browser = await chromium.launch();
//     const cont = await browser.newContext();
//     const page = await cont.newPage();
//     test.setTimeout(90000);
//     await page.goto(testdata.urls.store_url);
//     //count  is the priced item
//     await guest_add_products(page, '231-642 - Male connector; 12-', '231-2706/026-000 - 2-', 3);
//     await guest_checkout_form(page);
//     //select pay type
//     // const pay_type = 'Credit Card';
//     const pay_type = 'Request for Pay Terms';
//     if (pay_type === 'Credit Card') {
//       await page.getByLabel('Credit Card').click({timeout: 10000});
//     } else {
      
//     }
//     await checkout_page(page, pay_type);
//     if (pay_type === 'Request for Pay Terms') {
//       await request_payterms(page);
//     } else {
//       await creditCard(page);
//     }
//   })
  
//   test('verify add zipcode button', async () => {
//     const browser = await chromium.launch();
//     const cont = await browser.newContext();
//     const page = await cont.newPage();
//     test.setTimeout(160000);
//     //at guest chckout page
//     await page.goto(testdata.urls.store_url);
//     await page.getByRole('link', { name: 'See all manufacturers' }).scrollIntoViewIfNeeded();
//     await page.getByRole('link', { name: '231-642 - Male connector; 12-' }).first().hover();
//     await page.waitForTimeout(2000);
//     await page.getByRole('button', { name: '' }).nth(1).click();
//     await page.getByRole('link', { name: '231-2706/026-000 - 2-' }).first().hover();
//     await page.getByRole('button', { name: '' }).nth(3).click();
//     await page.goto(testdata.urls.cart_page_url);
//     await page.getByRole('link', { name: 'Checkout' }).click();
//     await page.getByText('Billing Information').click();
//     await page.getByText('Shipping Information', { exact: true }).click();
//     await page.locator('#async-select-example').nth(1).fill('00009');
//     try {
//       await page.getByText('Add Postal Code').hover();
//       await page.screenshot({ path: "files/Add Postal Code at guest_c billing.png" })
//       await page.getByText('Add Postal Code').click();
//     } catch (error) {
//       console.log("add postal code button not displayed at guest checkout page billing information");
//     }
  
//     await page.locator('#async-select-example').nth(2).fill('00009');
//     try {
//       await page.getByText('Add Postal Code').hover();
//       await page.getByText('Add Postal Code').scrollIntoViewIfNeeded();
//       await page.screenshot({ path: "files/Add Postal Code at guest_c shipping.png" })
//       await page.getByText('Add Postal Code').click();
//     } catch (error) {
//       console.log("add postal code button not displayed at guest checkout page shipping information");
//     }
//     //at registration page
//     await page.goto(testdata.urls.portal_url);
//     await page.getByRole('button', { name: 'Register' }).click();
//     await page.locator('#async-select-example').nth(1).fill('00009');
//     try {
//       await page.getByText('Add Postal Code').hover();
//       await page.screenshot({ path: "files/Add Postal Code at registration.png" })
//       await page.getByText('Add Postal Code').click();
//     } catch (error) {
//       console.log("add postal code button not displayed at guest checkout page shipping information");
//     }
//     //at logged checkout page
//     await page.locator("//*[@alt = 'back-arrow']").click();
//     await page.getByPlaceholder('Enter Email ID').fill(testdata.helme_customer.email);
//     await page.waitForTimeout(1200);
//     await page.getByPlaceholder('Enter Password').fill(testdata.helme_customer.pwd);
//     await page.getByRole('button', { name: 'Sign In' }).click();
//     await page.waitForTimeout(10000);
//     await expect(await page.locator('//*[text() = "Shop Now"]')).toBeVisible({ timeout: 10000 });
//     const pagePeromise = cont.waitForEvent("page");
//     page.getByRole('button', { name: 'Shop Now' }).click();
//     const page = await pagePeromise;
//     await page.getByRole('link', { name: 'See all manufacturers' }).scrollIntoViewIfNeeded();
//     await page.getByRole('link', { name: '231-642 - Male connector; 12-' }).first().hover();
//     await page.waitForTimeout(2000);
//     await page.getByRole('button', { name: '' }).nth(1).click();
//     await page.getByRole('link', { name: '231-2706/026-000 - 2-' }).first().hover();
//     await page.getByRole('button', { name: '' }).nth(3).click();
//     await page.goto(testdata.urls.cart_page_url);
//     await page.getByRole('link', { name: 'Checkout' }).click();
//     if (await page.getByPlaceholder('Enter Phone Number').getAttribute('value') === "") {
//       await page.getByPlaceholder('Enter Phone Number').fill('(676) 476-57464');
//     } else {
//       console.log("executed the else blox");
//     }
//     await page.getByText('Billing Information').click();
//     await page.getByText('Shipping Information', { exact: true }).click();
//     await page.locator('#async-select-example').nth(1).fill('00009');
//     try {
//       await page.getByText('Add Postal Code').hover();
//       await page.screenshot({ path: "files/Add Postal Code at logged_c billing.png" })
//       await page.getByText('Add Postal Code').click();
//     } catch (error) {
//       console.log("add postal code button not displayed at loggedIn checkout page shipping information");
//     }
//     await page.locator('#async-select-example').nth(2).fill('00009');
//     try {
//       await page.getByText('Add Postal Code').hover();
//       await page.getByText('Add Postal Code').scrollIntoViewIfNeeded();
//       await page.screenshot({ path: "files/Add Postal Code at logged_c shipping.png" })
//       await page.getByText('Add Postal Code').click();
//     } catch (error) {
//       console.log("add postal code button not displayed at loggedIn checkout page shipping information");
//     }
//   })
//   test('request quote for price as guest', async()=>{
//     const browser = await chromium.launch();
//     const cont = await browser.newContext();
//     const page = await cont.newPage();
//     test.setTimeout(90000);
//     await page.goto(testdata.urls.store_url);
//     //count 2 is the priceless item
//     await guest_add_products(page, '231-642 - Male connector; 12-', '-4T', 2);
//     await guest_checkout_form(page);
//     await page.waitForTimeout(1000);
//     await expect(await page.locator("//*[text() = 'Request Quote For Price']")).toHaveText('Request Quote For Price');
//     await page.screenshot({path: "files/Request for Price.png"})
//     await page.pause();
//   })
//   test('registration with existing email', async({page}) =>{
//     await page.goto(testdata.urls.portal_url);
//     await page.pause();
//     await page.getByRole('button', { name: 'Register' }).click();
//     await page.locator('.react-select__input-container').first().click();
//     await page.getByLabel('Company Name*').fill('chump change automation');
//     await page.getByRole('option', { name: 'Chump Change Automation' }).click();
//     await page.getByPlaceholder('Enter First Name').fill('chump');
//     await page.getByPlaceholder('Enter Last Name').fill('test');
//     await page.getByPlaceholder('Enter Email ID').fill('chump@test.com');
//     await page.getByPlaceholder('Enter Phone Number').fill('(764) 723-64833');
//     await page.getByPlaceholder('Enter Address1').fill('Test Adrs Colm');
//     await page.getByPlaceholder('Enter City').click();
//     await page.getByPlaceholder('Enter City').fill('Columbia');
//     await page.locator('div').filter({ hasText: /^Select State$/ }).nth(2).click();
//     await page.locator('#react-select-2-input').fill('dis');
//     await page.getByText('District of Columbia', { exact: true }).click();
//     await page.locator('#async-select-example').nth(1).fill('77707');
//     await page.getByRole('option', { name: '77707' }).click();
//     await page.locator("//*[text() = 'Register']").click();
//     await expect(page.locator("//*[text() = 'Yes']")).toHaveText('Yes');
//     await page.locator("//*[text() = 'Yes']").click();
//   })
  // test('new customer registration', async({page}) =>{
  //   await page.goto(testdata.urls.portal_url);
  //   await page.getByRole('button', { name: 'Register' }).click();
  //   await page.locator('.react-select__input-container').first().click();
  //   await page.getByLabel('Company Name*').fill('Test CompanyTwo');
  //   await expect(page.locator("//*[contains(text(), 'Add Company Name')]")).toBeVisible();
  //   await page.locator("//*[contains(text(), 'Add Company Name')]").click();
  //   await page.getByPlaceholder('Enter First Name').fill('Test');
  //   await page.getByPlaceholder('Enter Last Name').fill('CompanyTwo');
  //   await page.getByPlaceholder('Enter Email ID').fill('test@two.co');
  //   await page.getByPlaceholder('Enter Phone Number').fill('(764) 723-64833');
  //   await page.getByPlaceholder('Enter Address1').fill('1620 E. State Highway 121');
  //   await page.getByPlaceholder('Enter City').fill('Lewisville');
  //   await page.locator('div').filter({ hasText: /^Select State$/ }).nth(2).click();
  //   await page.keyboard.insertText('Texas');
  //   await page.keyboard.press('Enter');
  //   await page.locator("//*[text() = 'Search By Postal Code']").click();
  //   await page.keyboard.insertText('75001');
  //   await page.getByRole('option', { name: '75001' }).first().click();
  //   await page.pause();
  //   await page.locator("//*[text() = 'Register']").click();
  // })
  
//   test('quote approve', async({page})=>{
//   await page.goto('https://www.staging-buzzworld.iidm.com/');
//   await page.getByPlaceholder('Enter Email ID').fill('defaultuser@enterpi.com');
//   await page.getByPlaceholder('Enter Password').click();
//   await page.getByPlaceholder('Enter Password').fill('Enter@4321');
//   await page.getByRole('button', { name: 'Sign In', exact: true }).click();
//   // await page.getByText('Create Quote').click();
//   // await page.getByText('Search By Account ID or').click();
//   // await page.getByLabel('Company Name*').fill('zummo00');
//   // await page.getByText('ZUMMO00', { exact: true }).click();
//   // await page.getByPlaceholder('Enter Project Name').click();
//   // await page.getByPlaceholder('Enter Project Name').fill('for testing stage');
//   // await page.getByText('Quote Type').nth(1).click();
//   // await page.getByText('Parts Quote', { exact: true }).click();
//   // await page.getByRole('button', { name: 'Create Quote' }).click();
//   await page.goto('https://www.staging-buzzworld.iidm.com/quote_for_parts/d82e2c52-9dd3-4547-a93f-a155ac6a79d7');
//   await page.locator('div').filter({ hasText: /^RFQ Received Date\*$/ }).first().click();
//   await page.locator('.pilabel-star > .css-uyo27s > .label-text-div > .pi-label-edit-icon > svg').first().click();
//   await page.getByRole('button', { name: 'Now' }).click();
//   await page.getByTitle('Save Changes').getByRole('img').click();
//   await page.locator("(//*[contains(@title, 'Edit')])[4]").click();
//   await page.locator("//*[contains(@class, 'container--has-value')]").fill('test ssss');
//   await page.locator("//*[text()= 'test ssss')]").click();
//   await page.getByTitle('Save Changes').getByRole('img').click();
//   await page.locator('p').filter({ hasText: 'RFQ Received Date*' }).getByRole('img').first().click();
  
//   // await page.locator('div:nth-child(7) > .pilabel-star > .css-uyo27s > .label-text-div > .pi-label-edit-icon > svg > path').click();
//   // await page.locator('.react-select__value-container').click();
//   // await page.locator('#react-select-7-input').fill('test ssss');
//   // await page.locator('#react-select-7-option-50').click();
//   // await page.getByTitle('Save Changes').getByRole('img').click();
//   // await page.getByText('Add Items').click();
//   // await page.getByPlaceholder('Search By Part Number').click();
//   // await page.getByPlaceholder('Search By Part Number').fill('1234');
//   // await page.getByText('12343-').click();
//   // await page.locator('div').filter({ hasText: /^12343-000OMRON USB 3 CABLE 4M LOCK\/LOCKOMRON ELECTRONICS LLC$/ }).locator('rect').click();
//   // await page.getByRole('button', { name: 'Add Selected 1 Items' }).click();
//   // await page.getByRole('img', { name: 'chevron-right' }).click();
//   // await page.locator('div').filter({ hasText: /^Select$/ }).nth(2).click();
//   // await page.getByText('Factory Stock', { exact: true }).click();
//   // await page.getByRole('button', { name: 'Save' }).click();
//   // await page.getByRole('button', { name: 'Approve' }).click();
//   // await page.getByRole('button', { name: 'Approve' }).nth(1).click();
//   // await page.getByRole('button', { name: 'expand', exact: true }).click();
//   // await page.getByRole('menuitem', { name: 'Delivered to Customer' }).click();
//   // await page.getByRole('button', { name: 'loading' }).click();
//   // await page.locator('.sc-dkdnUF').click();
//   // await page.getByRole('button', { name: 'loading' }).click();
//   // await page.getByRole('menuitem', { name: 'Logout' }).click();
//   // await page.goto('https://www.staging-portal.iidm.com/');
//   // await page.getByPlaceholder('Enter Email ID').fill('yyy@gmail.com');
//   // await page.getByPlaceholder('Enter Password').click();
//   // await page.getByPlaceholder('Enter Password').fill('Enter@4321');
//   // await page.getByRole('button', { name: 'Sign In' }).click();
//   // await page.getByRole('gridcell', { name: '2024022000030' }).click();
//   // await page.locator('input[name="checkbox"]').check();
//   // await page.getByRole('button', { name: 'Approve' }).first().click();
//   // await page.getByPlaceholder('Enter Phone Number').click();
//   // await page.getByPlaceholder('Enter Phone Number').fill('(798) 988-98979');
//   // await page.getByRole('button', { name: 'Next' }).click();
//   // await page.getByRole('button', { name: 'Next' }).click();
//   // await page.getByText('Select Shipping Method').click();
//   // await page.getByText('Over Night', { exact: true }).click();
//   // await page.getByRole('button', { name: 'Next' }).click();
//   // await page.getByRole('textbox').click();
//   // await page.getByRole('textbox').fill('Test Notes');
//   // await page.getByRole('button', { name: 'Proceed' }).click();
//   })
// });

// //--------------------------------------Payment Type Methods--------------------------------
// async function creditCard(page) {
//   await page.getByLabel('Credit Card').click({timeout: 10000});
//   await page.getByRole('button', { name: 'Proceed' }).click();
//   await page.getByPlaceholder('Enter Name on the Card').fill('test zummo');
//   await page.getByPlaceholder('Enter Card Number').fill('4111 1111 1111 1111');
//   await page.getByPlaceholder('MM / YY').fill('12/29');
//   await page.getByPlaceholder('Enter CVC').fill('123');
//   // await page.pause()
// }
// async function net30() {

//   await page.getByLabel('1% 10 NET 30').check();
//   await page.getByRole('button', { name: 'Proceed' }).click();
//   await page.getByPlaceholder('Enter PO Number').fill('TestPO1234');
//   await page.pause()
// }
// test('Website Padding Tests', async ({ browser}, testInfo) => {
//     let results = await websitePaddingTesting(browser);
//     let testName = testInfo.title;
//     await returnResult(page, testName, results);
//   });