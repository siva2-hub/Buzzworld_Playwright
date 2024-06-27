// import exp from 'constants';
// import { checkout_page, order_summary_page, guest_checkout_form, guest_add_products, request_payterms, login } from './helper';

const { test, expect, chromium } = require('@playwright/test');
const { websitePaddingTesting, returnResult } = require('./helper');
const testdata = JSON.parse(JSON.stringify(require("../testdata.json")))

// let page, page1, context;
// test.describe('Groupped into all tests', ()=>{
//   test.only('by default credit card and net 30 as login', async ({ browser }) => {
//     test.setTimeout(60000);
//     context = await browser.newContext();
//     page = await context.newPage();
//     // login page
//     await login(page);
//     [page1] = await Promise.all([
//       context.waitForEvent("page"),
//       page.getByRole('button', { name: 'Shop Now' }).click(),
//     ])
//     await page1.waitForTimeout(2000);
//     await page1.locator("//*[text() ='See all products']").scrollIntoViewIfNeeded();
//     await page1.locator("//*[text() ='See all products']").hover();
//     await page1.getByRole('link', { name: '231-642 - Male connector; 12-' }).first().hover();
//     await page1.waitForTimeout(2000);
//     // await page1.getByRole('button', { name: '' }).nth(1).hover({timeout:1200});
//     await page1.getByRole('button', { name: '' }).nth(1).click();
//     await page1.getByRole('link', { name: '231-2706/026-000 - 2-' }).first().hover();
//     await page1.getByRole('button', { name: '' }).nth(3).click();
//     await page1.goto(testdata.urls.cart_page_url);
//     // await guest_add_products(page, '231-642 - Male connector; 12-', '-4T', 2);
//     await page.waitForTimeout(2000);
//     //updating the items quantity
//     for (let index = 0; index < 2; index++) {
//       await page1.getByRole('button', { name: '' }).first().click();
//       await page1.getByRole('button', { name: '' }).nth(1).click();
//     }
//     //clicking on the update icon
//     await page1.getByRole('button', { name: 'Refresh Cart' }).first().click();
//     await page1.getByRole('button', { name: 'Refresh Cart' }).nth(1).click();
//     await page1.getByRole('link', { name: 'Checkout' }).click();
//     if (await page1.getByPlaceholder('Enter Phone Number').getAttribute('value') === "") {
//       await page1.getByPlaceholder('Enter Phone Number').fill('(676) 476-57464');
//     } else {
//       console.log("executed the else blox");
//     }
//     await page1.getByRole('button', { name: 'Next' }).click();
//     await page1.getByRole('button', { name: 'Next' }).click();
//     await page1.locator('div').filter({ hasText: /^Select Shipping Method$/ }).nth(2).click();
//     await page1.getByText('2 Day', { exact: true }).click();
//     await page1.getByLabel('', { exact: true }).check();
//     await page1.waitForTimeout(2000);
//     await page1.getByPlaceholder('Enter Collect Number').fill('test_clct_number117');
//     await page1.getByRole('button', { name: 'Next' }).click();
//     //selecting the payment type
//     let pay_type = '1% 10 NET 30';
//     // let pay_type = 'Credit Card';
//     if (pay_type === 'Credit Card') {
//       await page1.getByLabel('Credit Card').click({timeout: 10000});
//     } else {
      
//     }
//     let vals = await checkout_page(page1, pay_type);
//     if (pay_type === 'Credit Card') {
//       creditCard(page1);
//     } else {
//       net30(page1);
//     }
//     await page1.pause();
//     if (vals[0]) {
//       // order_summary_page(res[1], res[2], res[3], res[4])
//       console.log("executed the if block and return status is ", vals[0])
//     } else {
//       console.log("else block after checking total " + res);
//     }
//     await page1.pause();
//   });
  
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
//     const page1 = await pagePeromise;
//     await page1.getByRole('link', { name: 'See all manufacturers' }).scrollIntoViewIfNeeded();
//     await page1.getByRole('link', { name: '231-642 - Male connector; 12-' }).first().hover();
//     await page1.waitForTimeout(2000);
//     await page1.getByRole('button', { name: '' }).nth(1).click();
//     await page1.getByRole('link', { name: '231-2706/026-000 - 2-' }).first().hover();
//     await page1.getByRole('button', { name: '' }).nth(3).click();
//     await page1.goto(testdata.urls.cart_page_url);
//     await page1.getByRole('link', { name: 'Checkout' }).click();
//     if (await page1.getByPlaceholder('Enter Phone Number').getAttribute('value') === "") {
//       await page1.getByPlaceholder('Enter Phone Number').fill('(676) 476-57464');
//     } else {
//       console.log("executed the else blox");
//     }
//     await page1.getByText('Billing Information').click();
//     await page1.getByText('Shipping Information', { exact: true }).click();
//     await page1.locator('#async-select-example').nth(1).fill('00009');
//     try {
//       await page1.getByText('Add Postal Code').hover();
//       await page1.screenshot({ path: "files/Add Postal Code at logged_c billing.png" })
//       await page1.getByText('Add Postal Code').click();
//     } catch (error) {
//       console.log("add postal code button not displayed at loggedIn checkout page shipping information");
//     }
//     await page1.locator('#async-select-example').nth(2).fill('00009');
//     try {
//       await page1.getByText('Add Postal Code').hover();
//       await page1.getByText('Add Postal Code').scrollIntoViewIfNeeded();
//       await page1.screenshot({ path: "files/Add Postal Code at logged_c shipping.png" })
//       await page1.getByText('Add Postal Code').click();
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
  test('new customer registration', async({page}) =>{
    await page.goto(testdata.urls.portal_url);
    await page.getByRole('button', { name: 'Register' }).click();
    await page.locator('.react-select__input-container').first().click();
    await page.getByLabel('Company Name*').fill('Test CompanyTwo');
    await expect(page.locator("//*[contains(text(), 'Add Company Name')]")).toBeVisible();
    await page.locator("//*[contains(text(), 'Add Company Name')]").click();
    await page.getByPlaceholder('Enter First Name').fill('Test');
    await page.getByPlaceholder('Enter Last Name').fill('CompanyTwo');
    await page.getByPlaceholder('Enter Email ID').fill('test@two.co');
    await page.getByPlaceholder('Enter Phone Number').fill('(764) 723-64833');
    await page.getByPlaceholder('Enter Address1').fill('1620 E. State Highway 121');
    await page.getByPlaceholder('Enter City').fill('Lewisville');
    await page.locator('div').filter({ hasText: /^Select State$/ }).nth(2).click();
    await page.keyboard.insertText('Texas');
    await page.keyboard.press('Enter');
    await page.locator("//*[text() = 'Search By Postal Code']").click();
    await page.keyboard.insertText('75001');
    await page.getByRole('option', { name: '75001' }).first().click();
    await page.pause();
    await page.locator("//*[text() = 'Register']").click();
  })
  
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
// async function creditCard(page1) {
//   await page1.getByLabel('Credit Card').click({timeout: 10000});
//   await page1.getByRole('button', { name: 'Proceed' }).click();
//   await page1.getByPlaceholder('Enter Name on the Card').fill('test zummo');
//   await page1.getByPlaceholder('Enter Card Number').fill('4111 1111 1111 1111');
//   await page1.getByPlaceholder('MM / YY').fill('12/29');
//   await page1.getByPlaceholder('Enter CVC').fill('123');
//   // await page1.pause()
// }
// async function net30() {

//   await page1.getByLabel('1% 10 NET 30').check();
//   await page1.getByRole('button', { name: 'Proceed' }).click();
//   await page1.getByPlaceholder('Enter PO Number').fill('TestPO1234');
//   await page1.pause()
// }
test('Website Padding Tests', async ({ browser}, testInfo) => {
    let results = await websitePaddingTesting(browser);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  });