const testdata = JSON.parse(JSON.stringify(require('../testdata.json')));
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { test, expect, page, chromium } = require('@playwright/test');
const exp = require('constants');
const { timeout } = require('../playwright.config');
const { AsyncLocalStorage } = require('async_hooks');
const xlsx = require('xlsx');
const currentDate = new Date().toDateString();
let date = currentDate.split(" ")[2];
let vendor = testdata.vendor;
let apiKey = testdata.api_key;
const currentDateTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

// const month = parseInt(text.substring(3, 4));
// Outputs "Mon Aug 31 2020"

//store the logs 
const logFilePath = path.join(__dirname, 'logs.log');
redirectConsoleToFile(logFilePath);

async function checkout_page(page1, pay_type) {
    let sub_total = await page1.locator("(//h4[@class = 'number'])[4]").textContent({ timeout: 10000 });
    // @ts-ignore
    let st = (parseFloat(sub_total?.replace("$", "").replace(",", "")).toFixed(2));
    // @ts-ignore
    let tax = (parseFloat(sub_total?.replace("$", "").replace(",", "")) * 0.085).toFixed(2);

    let exp_total, cf;
    // @ts-ignore
    if (await page1.getByLabel(pay_type).isChecked({ timeout: 10000 }) && pay_type === 'Credit Card') {
        // @ts-ignore
        cf = (parseFloat(sub_total?.replace("$", "").replace(",", "")) * 0.03).toFixed(2);
        // @ts-ignore
        exp_total = (parseFloat(st) + parseFloat(tax) + parseFloat(cf)).toFixed(2);
        // pay_type = "credit card";
    } else {
        cf = 0.0;
        // @ts-ignore
        exp_total = (parseFloat(st) + parseFloat(tax) + parseFloat(cf)).toFixed(2);
        // pay_type = "net 30";
    }
    // @ts-ignore

    await page1.getByRole('textbox').fill('Test Notes');
    let at = await page1.locator("(//h4[@class = 'number total'])[1]").textContent();
    // @ts-ignore
    let act_total = (parseFloat(at?.replace("$", "").replace(",", ""))).toFixed(2);
    let res;
    if (act_total === exp_total) {
        console.log("pay type " + pay_type);
        console.log("total " + exp_total);
        console.log("Sub total " + st);
        console.log("tax " + tax);
        console.log("convc fee " + cf);
        console.log("act total " + act_total);
        res = true;
    } else {
        console.log("pay type " + pay_type);
        console.log("exp_total " + exp_total);
        console.log("Sub total " + st);
        console.log("tax " + tax);
        console.log("convc fee " + cf);
        console.log("act total " + act_total);
        res = false;
    }
    return res, exp_total;
}

async function order_summary_page(check_total, check_st, check_tax, check_cf) {
    const browser = await chromium.launch();
    const cont = await browser.newContext();
    const page1 = await cont.newPage();
    let sub_total = await page1.locator("(//h4[@class = 'number'])[4]").textContent({ timeout: 10000 });
    // @ts-ignore
    let st = (parseFloat(sub_total?.replace("$", "").replace(",", "")).toFixed(2));
    // @ts-ignore
    let tax = (parseFloat(await page1.locator("(//h4[@class = 'number'])[5]").textContent()?.replace("$", "").replace(",", "")) * 0.085).toFixed(2);

    let exp_total, cf;
    // @ts-ignore
    if (await page1.getByLabel(pay_type).isChecked({ timeout: 10000 }) && pay_type === 'Credit Card') {
        // @ts-ignore
        cf = (parseFloat(await page1.locator("(//h4[@class = 'number'])[6]").textContent()?.replace("$", "").replace(",", "")) * 0.03).toFixed(2);
        // @ts-ignore
        exp_total = (parseFloat(st) + parseFloat(tax) + parseFloat(cf)).toFixed(2);
        // pay_type = "credit card";
    } else {
        cf = 0.0;
        // @ts-ignore
        exp_total = (parseFloat(st) + parseFloat(tax) + parseFloat(cf)).toFixed(2);
        // pay_type = "net 30";
    }
    console.log("total in checkout page " + check_total);
    console.log("st in checkout page " + check_st);
    console.log("tax in checkout page " + check_tax);
    console.log("cf in checkout page " + check_cf);
    console.log("total in order summary page " + exp_total);
    console.log("st in order summary page " + st);
    console.log("tax in order summary page " + tax);
    console.log("cf in order summary page " + cf);
}
async function guest_checkout_form(page) {
    await page.getByLabel('Company Name*').fill(testdata.guest_customer.comp_name);
    await page.getByRole('option', { name: testdata.guest_customer.comp_name }).click();
    await page.getByPlaceholder('Enter First Name').fill(testdata.guest_customer.f_name);
    await page.getByPlaceholder('Enter Last Name').fill(testdata.guest_customer.l_name);
    await page.getByPlaceholder('Enter Email ID').fill(testdata.guest_customer.email);
    await page.getByText('Company Name*Chump Change AutomationFirst Name*Last Name*Email ID*Phone Number*').click();
    await page.getByPlaceholder('Enter Phone Number').click();
    await page.getByPlaceholder('Enter Phone Number').fill(testdata.guest_customer.phone);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByPlaceholder('Enter Address1').fill('Test Address 1');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByPlaceholder('Enter City').fill('columbia');
    await page.locator('div').filter({ hasText: /^Select State$/ }).nth(2).click();
    await page.locator('#react-select-2-input').fill('dis');
    await page.getByText('District of Columbia', { exact: true }).click();
    await page.locator('.react-select__input-container').click();
    await page.getByLabel('Postal Code*').fill('77706');
    await page.getByText('77706', { exact: true }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByPlaceholder('Enter Ship To Name').fill('test ship to name');
    await page.getByText('Select Shipping Method').click();
    await page.getByText('Over Night', { exact: true }).click();
    await page.getByLabel('', { exact: true }).check();
    await page.getByPlaceholder('Enter Collect Number').fill('CN37463746');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('textbox').fill('Test notes req payterms');
}
async function guest_add_products(page, product1, product2, count) {
    await page.goto(testdata.urls.store_url);
    await page.getByRole('link', { name: 'See all products' }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await page.getByRole('link', { name: product1 }).first().hover();
    await page.getByRole('button', { name: '' }).nth(1).click();
    await page.waitForTimeout(2000);
    await page.getByRole('link', { name: product2 }).first().hover();
    await page.getByRole('button', { name: '' }).nth(count).click();
    await page.goto(testdata.urls.cart_page_url);
    await page.getByRole('link', { name: 'Checkout' }).click();
}
async function request_payterms(page) {
    await page.getByLabel('Request for Pay Terms').click();
    await page.getByRole('button', { name: 'Proceed' }).click();
    await page.getByPlaceholder('Enter Legal Name of Company').fill('Test legal company');
    await page.getByPlaceholder('Enter Federal Tax ID').fill('test federal tax');
    await page.getByPlaceholder('Enter Years in Business').fill('17');
    await page.getByPlaceholder('Enter Main Number').fill('(354) 832-64834');
    await page.locator('input[name="fax"]').fill('testfax123');
    await page.getByPlaceholder('Enter Shipping Agency').click();
    await page.getByPlaceholder('Enter Shipping Agency').fill('shipping agency');
    await page.getByPlaceholder('Enter Billing Address....').click();
    await page.getByPlaceholder('Enter Billing Address....').fill('billing adrs');
    await page.getByPlaceholder('Enter Shipping Address... ').click();
    await page.getByPlaceholder('Enter Shipping Address... ').fill('shipping adrs');
    await page.locator('input[name="blling_address1"]').fill('bill city');
    await page.locator('input[name="blling_address2"]').fill('bill state');
    await page.locator('input[name="billing_zip_code"]').fill('322323');
    await page.locator('input[name="shipping_address1"]').fill('ship city');
    await page.locator('input[name="shipping_address2"]').fill('ship state');
    await page.locator('input[name="shipping_zip_code"]').fill('343754');
    await page.getByPlaceholder('Enter All DBA\'s').fill('all dba are here');
    await page.locator('input[name="name"]').scrollIntoViewIfNeeded()
    await page.locator('input[name="name"]').fill('name1');
    await page.waitForTimeout(1500);
    await page.locator('(//*[@placeholder = "Enter Phone Number"])[1]').fill('(473) 856-34785');
    await page.waitForTimeout(1400);
    await page.getByText('Select Invoice delivery method').click();
    await page.waitForTimeout(1400);
    await page.getByText('Select Invoice delivery method').press('Enter');
    // await page.getByText('Email').click();
    await page.getByPlaceholder('Email address or Fax Number').fill('test@test.com');
    await page.locator("//*[@name = 'name_of_company1']").fill('name1');
    await page.locator('input[name="contact_name1"]').fill('tc1');
    await page.locator('input[name="trade_ref_contact1"]').fill('(478) 538-34855');
    await page.locator('input[name="trade_ref_email1"]').fill('test@test1.com');
    await page.locator('input[name="trade_ref_city1"]').fill('cityone');
    await page.locator('input[name="trade_ref_state1"]').fill('stateone');
    await page.locator('input[name="trade_ref_zip_code1"]').fill('675654');
    await page.locator('textarea[name="trade_ref_address1"]').fill('adrs 1');
    await page.locator('input[name="name_of_company2"]').fill('name2');
    await page.locator('input[name="contact_name2"]').fill('tc2');
    await page.locator('input[name="trade_ref_contact2"]').fill('(658) 687-67787');
    await page.locator('input[name="trade_ref_email2"]').fill('test@test2.com');
    await page.locator('input[name="trade_ref_city2"]').fill('citytwo');
    await page.locator('input[name="trade_ref_state2"]').fill('statetwo');
    await page.locator('input[name="trade_ref_zip_code2"]').fill('673356');
    await page.locator('textarea[name="trade_ref_address2"]').fill('adrs2');
    await page.locator('input[name="name_of_company3"]').fill('name3');
    await page.locator('input[name="contact_name3"]').fill('tc3');
    await page.locator('input[name="trade_ref_contact3"]').fill('(437) 583-45835');
    await page.locator('input[name="trade_ref_email3"]').fill('test@test3.com');
    await page.locator('input[name="trade_ref_city3"]').fill('citythree');
    await page.locator('input[name="trade_ref_state3"]').fill('statethree');
    await page.locator('input[name="trade_ref_zip_code3"]').fill('768678');
    await page.locator('textarea[name="trade_ref_address3"]').fill('adrs3');
    await page.getByPlaceholder('Enter Name of Bank').fill('nameb');
    await page.locator('input[name="bank_ref_contact"]').fill('tcb');
    await page.locator('input[name="bank_ref_email"]').fill('test@testb.com');
    // await page.locator('div:nth-child(25) > div > .css-1p1fgsa > .css-1s25hsw').first().click();
    await page.getByPlaceholder('Enter Street Address').fill('street adrs');
    await page.locator('input[name="bank_ref_phone"]').fill('(485) 475-98735');
    await page.locator('input[name="bank_ref_fax"]').fill('test fac bank');
    await page.locator('input[name="bank_ref_city"]').fill('citybank');
    await page.locator('input[name="bank_ref_state"]').fill('statebank');
    await page.locator('input[name="bank_ref_zip_code"]').fill('768768');
    await page.getByLabel('', { exact: true }).check();
    await page.locator('input[name="authorization_name"]').click();
    await page.getByRole('button', { name: 'Request' }).click();
    await page.pause();
}
async function login(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    //positive scenario
    await page.locator('//*[@class = "user_image"]').click();
    await page.waitForTimeout(1700);
    let is_check = false;
    try {
        await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();
        is_check = true;
    } catch (error) {
        is_check = false;
    }
    //veryfying logout is displayed or not
    if (is_check) {
        await page.getByRole('menuitem', { name: 'Logout' }).click();
        //valid email with valid password
        await page.getByPlaceholder('Enter Email ID').fill('defaultuser@enterpi.com');
        await page.getByPlaceholder('Enter Password').fill('Enter@4321');
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    } else {

    }
    await page.waitForTimeout(2000);
    await page.locator('//*[@class = "user_image"]').click();
    console.log(await page.getByRole('menuitem', { name: 'Logout' }).textContent(), 'is displayed, login working')
    await page.locator('//*[@class = "user_image"]').click();
    await page.waitForTimeout(1200);
    //verify logout
    await page.locator('//*[@class = "user_image"]').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    //nagative scenarios
    //invalid email with valid password
    await page.getByPlaceholder('Enter Email ID').fill('123defaultuser@enterpi.com');
    console.log('login id displayed logout is working');
    await page.getByPlaceholder('Enter Password').fill('Enter@4321');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    let text = 'Invalid Email or Password';
    await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
    console.log('getting this ', text, ' invalid email with valid password')
    //valid email with invalid password
    await page.getByPlaceholder('Enter Email ID').fill('defaultuser@enterpi.com');
    await page.getByPlaceholder('Enter Password').fill('123Enter@4321');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    text = 'Invalid Email or Password';
    await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
    console.log('getting this ', text, ' valid email with invalid password')
    //invalid email with invalid password
    await page.getByPlaceholder('Enter Email ID').fill('123defaultuser@enterpi.com');
    await page.getByPlaceholder('Enter Password').fill('123Enter@4321');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    text = 'Invalid Email or Password';
    await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
    console.log('getting this ', text, ' Invalid email with invalid password')
    //in valid email and empty password
    await page.getByPlaceholder('Enter Email ID').fill('123defaultuser.com');
    await page.getByPlaceholder('Enter Password').fill('');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    text = 'Please Enter Valid Email Address';
    await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
    console.log('getting this ', text, ' in valid email format and empty password')
    text = 'Please Enter Password';
    await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
    console.log('getting this ', text, ' in valid email format and empty password')
    //empty email and empty password
    await page.getByPlaceholder('Enter Email ID').fill('');
    await page.getByPlaceholder('Enter Password').fill('');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    text = 'Please Enter Email Id';
    await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
    console.log('getting this ', text, ' empty email format and empty password')
    text = 'Please Enter Password';
    await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
    console.log('getting this ', text, ' empty email format and empty password')
    //reset or forgott password page
    await page.locator("//*[text() = 'Forgot Password?']").click();
    await expect(page.locator("//*[text() = 'Reset Password']")).toBeVisible();
    //verify reset password with un registered mail
    await page.locator("//*[@placeholder = 'Enter Email ID']").fill('sivadara17@gmail.com');
    await page.locator("//*[text() = 'Reset Password']").click();
    text = 'We cannot find an active account linked to the email address that you entered. Please check the email address or contact your system administrator.';
    await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
    await page.waitForTimeout(1500);
    console.log('getting this ', text, ' while verifying reset password with un registered mail');
    //verify reset password with invalid mail
    await page.locator("//*[@placeholder = 'Enter Email ID']").fill('defaultuser.com');
    await page.locator("//*[text() = 'Reset Password']").click();
    text = 'Please Enter Valid Email Address';
    await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
    await page.waitForTimeout(1500);
    console.log('getting this ', text, ' while verifying reset password with invalid mail');
    //verify reset password with empty mail
    text = 'Please Enter Email Id';
    await page.locator("//*[@placeholder = 'Enter Email ID']").fill('');
    await page.locator("//*[text() = 'Reset Password']").click();
    await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
    await page.waitForTimeout(1500);
    console.log('getting this ', text, ' while verifying reset password with empty mail');
    //verify reset password with valid registered mail
    await page.locator("//*[@placeholder = 'Enter Email ID']").fill('defaultuser@enterpi.com');
    await page.locator("//*[text() = 'Reset Password']").click();
    await expect(page.locator("//*[text() = 'Please check your email']")).toBeVisible();
    text = 'An email with password reset instructions has been sent to your email address.';
    await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
    await page.locator("(//*[text() = 'keyboard_backspace'])[2]").click();
    await expect(page.getByPlaceholder('Enter Email ID')).toBeVisible();
    console.log('displayed msg ', text, ' while verifying reset password with valid registered mail');
    await page.waitForTimeout(2000);
}
async function login_buzz(page, stage_url) {
    await page.goto(stage_url);
    await page.waitForTimeout(1300);
    if (await page.url().includes('sso')) {
        await page.getByLabel('Email').fill('defaultuser@enterpi.com');
        await page.getByPlaceholder('Enter Password').fill('Enter@4321');
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    } else {
    }
    await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible({ timeout: 30000 });
    await page.waitForTimeout(1600);
}
async function logout(page) {
    await page.locator('//*[@class = "user_image"]').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page.locator('#loginform')).toContainText('Sign In');
}
async function admin1(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    await page.locator('#root').getByText('Branches').click();
    await expect(page.locator('span > img').first()).toBeVisible();
    await page.locator('#root').getByText('Account Types').click();
    await expect(page.getByRole('gridcell', { name: 'PO' }).first()).toBeVisible();
    await page.locator('#root').getByText('Classifications').click();
    await expect(page.getByRole('gridcell', { name: 'Competitor' })).toBeVisible();
    await page.locator('#root').getByText('Contact Types').click();
    await expect(page.locator('span > img').first()).toBeVisible();
    await page.locator('#root').getByText('Industries').click();
    await expect(page.getByRole('gridcell', { name: 'Agriculture' })).toBeVisible();
    await page.locator('#root').getByText('PO Min Qty').click();
    await expect(page.locator('span > img').first()).toBeVisible();
    await page.locator('#root').getByText('Product Category').click();
    await expect(page.getByRole('gridcell', { name: 'Made in' })).toBeVisible();

}
async function admin2(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    await page.locator("(//*[text() = 'Product Class'])[1]").click();
    await expect(page.getByRole('heading', { name: 'Product Class' })).toBeVisible();
    await page.locator("(//*[@class = 'ag-react-container'])[1]").waitFor()
    await expect(page.locator("(//*[@class = 'ag-react-container'])[1]")).toBeVisible({ timeout: 7000 });
    await page.locator('#root').getByText('QC Forms').click();
    await expect(page.getByPlaceholder('Enter Description')).toBeVisible();
    await page.locator('#root').getByText('Quote Approval').click();
    await expect(page.getByPlaceholder('Enter Budgetary Amount')).toBeVisible();
    await page.locator('#root').getByText('$25k').click();
    await page.getByPlaceholder('Enter Decision Making Process').click();
    await page.locator('#root').getByText('$50k').click();
    await page.getByPlaceholder('Enter Reasons').click();
    await expect(page.getByPlaceholder('Enter Reasons')).toBeVisible();
    await page.locator('#root').getByText('Quote Types').click();
    await expect(page.locator('(//*[text() = "Parts Quote"])[1]')).toBeVisible();
    await page.locator('#root').getByText('Regions').click();
    await expect(page.getByRole('gridcell', { name: 'Region1' })).toBeVisible();
    await page.locator('#root').getByText('Sales Potential').click();
    await expect(page.locator('span > img').first()).toBeVisible();
}
async function admin3(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    await page.locator('#root').getByText('Terms Conditions').click();
    await expect(page.getByText('Shipping Instructions')).toBeVisible();
    await page.locator('#root').getByText('Territories').click();
    await expect(page.locator('span > img').first()).toBeVisible();
    await page.locator('#root').getByText('Users').click();
    await expect(page.getByText('Permissions')).toBeVisible();
    await page.getByText('Edit').click();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Permissions')).toBeVisible();
    await page.getByText('Permissions').click();
    await expect(page.getByText('Add to Quote')).toBeVisible();
}
async function admin4(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    await expect(page.getByText('Permissions')).toBeVisible();
    await page.getByText('Add', { exact: true }).click();
    await expect(page.getByRole('button', { name: 'Add User' })).toBeVisible();
    await page.getByRole('button', { name: 'Add User' }).click();
    await expect(page.getByText('Please Enter Email ID')).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await page.getByText('User Roles').first().click();
    await expect(page.getByText('Repair Manager')).toBeVisible();
    await expect(page.getByText('Repair Technician')).toBeVisible();
    await page.getByText('Vendors').first().click();
    await expect(page.locator('span > img').first()).toBeVisible();
    await page.locator('#root').getByText('Warehouse').click();
    await expect(page.getByRole('heading', { name: 'Warehouse' })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: '01' })).toBeVisible();
    await page.locator('#root').getByText('Zip Codes').click();
    await expect(page.getByRole('heading', { name: 'Zip Codes' })).toBeVisible();
    await expect(page.locator('span > img').first()).toBeVisible();
}
async function quotesRepairs(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    let tabList = ['All Quotes', 'Parts Quotes', 'Repair Quotes', 'System Quotes', 'Expired Quotes', 'Archived Quotes', 'Waiting On Me', 'Quoted By Me'];
    await page.getByText('Quotes').click();
    for (let index = 0; index < 8; index++) {
        // await expect(await page.locator('#root').getByText(tabList[index])).toBeVisible();
        await expect(await page.locator("(//*[text() = '" + tabList[index] + "'])[1]")).toBeVisible();
        await page.locator("(//*[text() = '" + tabList[index] + "'])[1]").click();
        let list_status = false;
        //verify list view
        try {
            await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible();
            list_status = true;
        } catch (error) {
            list_status = false;
        }
        if (list_status) {
            await page.waitForTimeout(1100);
            await page.locator('(//*[contains(@src, "vendor_logo")])[1]').click();
            console.log('list view is displayed for ', tabList[index])
            //verify detailed view
            try {
                await expect(page.locator('#repair-items')).toContainText('Quote Items')
                list_status = true;
            } catch (error) {
                list_status = false;
            }
            if (list_status) {
                await page.locator('(//*[contains(text(), "Quote Items")])[1]').scrollIntoViewIfNeeded();
                await page.waitForTimeout(1200);
                console.log('detailed view is displayed for ', tabList[index])
            } else {
                console.log('detailed view not display for ', tabList[index])
            }
        } else {
            console.log('list view not display for ', tabList[index])
        }
        await page.getByText('Quotes').first().click();
    }
    //Repairs
    await page.getByText('Repairs').click();
    tabList = ['All Repairs Requests', 'Receiving', 'Check In', 'Evaluation', 'Pending Quote', 'Pending Approval', 'Repair in progress', 'QC', 'Billing'];
    for (let index = 0; index < 9; index++) {
        await expect(await page.locator('#root').getByText(tabList[index])).toBeVisible();
        await page.locator('#root').getByText(tabList[index]).click();
        //verify list view
        try {
            await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible();
            list_status = true;
        } catch (error) {
            list_status = false;
        }
        if (list_status) {
            await page.waitForTimeout(1100);
            await page.locator('(//*[contains(@src, "vendor_logo")])[1]').click();
            console.log('list view is displayed for ', tabList[index])
            //verify detailed view
            try {
                await expect(page.locator('#repair-items')).toContainText('Repair Items');
                list_status = true;
            } catch (error) {
                list_status = false;
            }
            if (list_status) {
                await page.locator('(//*[text() = "Upload"])[1]').scrollIntoViewIfNeeded();
                await page.waitForTimeout(1200);
                console.log('detailed view is displayed for ', tabList[index])
            } else {
                console.log('detailed view not display for ', tabList[index])
            }
        } else {
            console.log('list view not display for ', tabList[index]);
        }
        await page.getByText('Repairs').first().click();
    }
}
async function leftMenuSearch(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    try {
        await expect(page.getByRole('button', { name: 'Pricing' })).toBeVisible();
        await page.getByRole('button', { name: 'Pricing' }).click();
        await page.getByRole('menuitem', { name: 'Discount Codes' }).click();
        await expect(page.getByRole('heading', { name: 'Discount Codes' })).toBeVisible();
        await page.waitForTimeout(2300)
        await page.getByPlaceholder('Search', { exact: true }).fill(vendor);
        await expect(page.getByText(vendor)).toBeVisible();
        await page.locator('.react-select__value-container').click();
        await page.keyboard.insertText('Default');
        await page.waitForTimeout(2000);
        await page.keyboard.press('Enter');
        // }
        await expect(page.locator('#root').getByText(vendor)).toBeVisible();
        await page.waitForTimeout(1300)
        console.log("vendor is ", vendor)
    } catch (error) {
        console.log('getting error while searching vendor in left menu at pricing ', error);
        await page.screenshot({ path: 'files/vendor_search_pricing_error.png', fullPage: true });
    }

}
async function add_dc(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    try {
        await expect(page.getByRole('button', { name: 'Pricing' })).toBeVisible();
        await page.getByRole('button', { name: 'Pricing' }).click();
        await page.getByRole('menuitem', { name: 'Discount Codes' }).click();
        await expect(page.getByRole('heading', { name: 'Discount Codes' })).toBeVisible();
        await page.getByPlaceholder('Search', { exact: true }).fill(testdata.vendor);
        await expect(page.getByText(testdata.vendor)).toBeVisible();
        await page.waitForTimeout(2500);
        await expect(page.getByLabel('open')).toBeVisible();
        await page.getByLabel('open').click();
        await page.keyboard.insertText('Default');
        await page.waitForTimeout(2000);
        await page.keyboard.press('Enter');
        await page.getByText('Add').click();
        await expect(page.getByPlaceholder('Our Price')).toBeVisible();
        await page.getByPlaceholder('Discount Code', { exact: true }).fill(testdata.dc_new);
        await page.getByText('MM/DD/YYYY').first().click();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowUp');
        await page.keyboard.press('Enter');
        let start_date = await page.locator("(//*[contains(@class, 'singleValue')])[2]").textContent();
        await page.getByText('MM/DD/YYYY').click();
        let e_date = await end_date(start_date);
        await page.keyboard.insertText(e_date);
        await page.keyboard.press('Enter');
        await page.getByText('Quantity').nth(2).click()
        await page.getByText('Quantity').nth(2).press('ArrowUp');
        await page.getByText('Quantity').nth(2).press('Enter');
        await page.getByPlaceholder('Description').click();
        await page.getByPlaceholder('Description').fill('Manually Added Discount Code');
        await page.getByPlaceholder('Our Price').fill('0.2');
        await page.getByPlaceholder('MRO').fill('0.4');
        await page.getByPlaceholder('OEM').fill('0.6');
        await page.getByPlaceholder('RS').fill('0.6');
        await page.getByRole('button', { name: 'Add Discount Code' }).click();
        await page.waitForTimeout(1800);
        await expect(page.getByRole('button', { name: 'Add Discount Code' })).toBeHidden();
        await page.waitForTimeout(2300)
        console.log("added discount code is ", testdata.dc_new)
    } catch (error) {
        console.log('getting error while adding discount code ', error);
        await page.screenshot({ path: 'files/add_dc_error.png', fullPage: true });
        await page.getByTitle('close').getByRole('img').click();
        await page.waitForTimeout(1800);
    }
    return testdata.dc_new
}
async function update_dc(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    try {
        await expect(page.getByRole('button', { name: 'Pricing' })).toBeVisible();
        await page.getByRole('button', { name: 'Pricing' }).click();
        await page.getByRole('menuitem', { name: 'Discount Codes' }).click();
        await expect(page.getByRole('heading', { name: 'Discount Codes' })).toBeVisible();
        await page.getByPlaceholder('Search', { exact: true }).fill(testdata.vendor);
        await expect(page.getByText(testdata.vendor)).toBeVisible();
        await page.waitForTimeout(2500);
        await expect(page.getByLabel('open')).toBeVisible();
        await page.getByLabel('open').click();
        await page.keyboard.insertText('Default');
        await page.waitForTimeout(2000);
        await page.keyboard.press('Enter');
        await page.getByPlaceholder('Search By Discount Code').fill(testdata.dc_new);
        await page.waitForTimeout(2300)
        await expect(page.locator('(//*[text()= "' + testdata.dc_new + '"])[1]')).toBeVisible();
        await page.locator('(//*[contains(@src, "editicon")])[1]').first().click();
        await page.getByPlaceholder('Our Price').fill(testdata.PO);
        await page.getByRole('button', { name: 'Update Discount Code' }).press('Enter');
        await expect(page.locator('#root')).toContainText('Updated Successfully');
        await expect(page.locator('(//*[text()= "' + testdata.PO + '"])[1]')).toBeVisible();
        // await expect(page.locator('(//*[@style = "left: 660px; width: 180px;"])[1]')).toContainText(testdata.PO);
        await page.waitForTimeout(1600)
        console.log("updated discount code is ", testdata.dc_new)
    } catch (error) {
        console.log('getting error while updating discount code ', error);
        await page.screenshot({ path: 'files/update_dc_error.png', fullPage: true });
        await page.getByTitle('close').getByRole('img').click();
        await page.waitForTimeout(1800);
    }
}
async function multi_edit(page, dc) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    try {
        await expect(page.getByRole('button', { name: 'Pricing' })).toBeVisible();
        await page.getByRole('button', { name: 'Pricing' }).click();
        await page.getByRole('menuitem', { name: 'Discount Codes' }).click();
        await expect(page.getByRole('heading', { name: 'Discount Codes' })).toBeVisible();
        await page.getByPlaceholder('Search', { exact: true }).fill(vendor);
        await expect(page.getByText(vendor)).toBeVisible();
        await page.waitForTimeout(2500)
        await expect(page.getByLabel('open')).toBeVisible();
        await page.getByLabel('open').click();
        // await page.getByText('Default', { exact: true }).click();
        // if (await page.url().includes('staging')) {
        //     await page.getByText('Default').click();
        // } else {

        await page.keyboard.insertText('Default');
        await page.waitForTimeout(2000);
        await page.keyboard.press('Enter');
        // }
        await expect(page.locator('#root')).toContainText('Multi Edit');
        await page.getByText('Multi Edit').click();
        await page.getByText('Select').first().click();
        // let dc1 = dc.toString();
        await page.keyboard.insertText(dc);
        await page.keyboard.press('Enter')
        await page.getByText('MM/DD/YYYY').first().click();
        // await page.getByText(date, { exact: true }).click();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowUp');
        await page.keyboard.press('Enter');
        let start_date = await page.locator("(//*[contains(@class, 'singleValue')])[2]").textContent();
        await page.getByText('MM/DD/YYYY').click();
        let e_date = await end_date(start_date);
        await page.keyboard.insertText(e_date);
        await page.keyboard.press('Enter');
        await page.getByText('Select', { exact: true }).click();
        await page.keyboard.insertText('1');
        await page.keyboard.press('Enter');
        let po = '2.8';
        await page.getByPlaceholder('Enter Our Price').fill(po);
        await page.getByPlaceholder('Enter MRO').fill('1.4');
        await page.getByPlaceholder('Enter OEM').fill('1.6');
        await page.getByPlaceholder('Enter RS').fill('1.8');
        await page.getByRole('button', { name: 'Proceed' }).click();
        await expect(page.locator('#root')).toContainText('Saved Succesfully');
        await page.getByPlaceholder('Search By Discount Code').click();
        await page.getByPlaceholder('Search By Discount Code').fill(dc);
        await expect(page.getByRole('gridcell', { name: po })).toBeVisible();
        console.log('multi edited discount code is ', dc)
    } catch (error) {
        console.log('getting error while multi editing discount code', error);
        await page.screenshot({ path: 'files/multi_edit_dc_error.png', fullPage: true });
        await page.getByTitle('close').getByRole('img').click();
        await page.waitForTimeout(1800);
    }
}
async function add_sc(page, dc) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    try {

        await page.getByRole('button', { name: 'Pricing' }).click();
        await page.getByRole('menuitem', { name: 'Pricing', exact: true }).click();
        await page.getByPlaceholder('Search', { exact: true }).fill(vendor);
        await expect(page.getByText(vendor)).toBeVisible();
        await expect(page.getByLabel('open')).toBeVisible();
        await page.getByLabel('open').click();
        await page.keyboard.insertText('Default');
        await page.waitForTimeout(2000);
        await page.keyboard.press('Enter');
        await page.getByText('Add').click();
        await page.getByPlaceholder('Enter Stock Code').fill(testdata.stock_code_new);
        await page.locator("(//*[text() = 'Select'])[1]").click();
        await page.getByText(dc, { exact: true }).click();
        await page.getByPlaceholder('Enter List Price').click();
        await page.getByPlaceholder('Enter List Price').fill('112.21');
        await page.locator('div').filter({ hasText: /^Select$/ }).nth(2).click();
        await page.keyboard.insertText('BA05');
        await page.keyboard.press('Enter')
        await page.getByPlaceholder('Enter Description').click();
        await page.getByPlaceholder('Enter Description').fill('Manually Added Item');
        await page.getByRole('button', { name: 'Add Product' }).click();
        await page.waitForTimeout(1800);
        await expect(page.getByRole('button', { name: 'Add Product' })).toBeHidden();
        console.log("added stock code is ", testdata.stock_code_new)
        await page.waitForTimeout(1800);
    } catch (error) {
        console.log('getting error while adding stock code ', error);
        await page.screenshot({ path: 'files/add_stock_code_error.png', fullPage: true });
        await page.getByTitle('close').getByRole('img').click();
    }
    return testdata.stock_code_new;
}
async function update_sc(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    try {
        await page.getByRole('button', { name: 'Pricing' }).click();
        await page.getByRole('menuitem', { name: 'Pricing', exact: true }).click();
        await page.getByPlaceholder('Search', { exact: true }).fill(vendor);
        await expect(page.getByText(vendor)).toBeVisible();
        await expect(page.getByLabel('open')).toBeVisible();
        await page.getByLabel('open').click();
        await page.keyboard.insertText('Default');
        await page.waitForTimeout(2000);
        await page.keyboard.press('Enter');
        await page.getByPlaceholder('Stock Code / Description').fill(testdata.stock_code_new);
        await expect(page.getByRole('grid')).toContainText(testdata.stock_code_new);
        await page.waitForTimeout(2400);
        await page.getByRole('gridcell', { name: 'loading', exact: true }).getByRole('img').click();
        await expect(await page.getByPlaceholder('Enter Description')).toBeVisible();
        await page.getByPlaceholder('Enter Description').fill('Manually Added Item After Update');
        await page.getByRole('button', { name: 'Update Product' }).click();
        await page.waitForTimeout(2000)
        await expect(page.getByRole('grid')).toContainText('Manually Added Item After Update');
        await page.waitForTimeout(1600);
        console.log('updated stock code is ', testdata.stock_code_new);
    } catch (error) {
        console.log('getting error while updating stock code ', error);
        await page.screenshot({ path: 'files/update_stock_code_error.png', fullPage: true });
        await page.getByTitle('close').getByRole('img').click();
    }
}
async function filters_pricing(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Pricing' }).click();
    await page.getByRole('menuitem', { name: 'Pricing', exact: true }).click();
    await page.getByPlaceholder('Search', { exact: true }).fill(testdata.vendor);
    await expect(page.getByText(testdata.vendor)).toBeVisible();
    await expect(page.getByLabel('open')).toBeVisible();
    await page.getByLabel('open').click();
    await page.keyboard.insertText('Default');
    await page.waitForTimeout(2000);
    await page.keyboard.press('Enter');
    await expect(page.getByText('Filters')).toBeVisible();
    await page.getByText('Filters').click();
    await expect(page.getByText('Discount Codes')).toBeVisible();
    await page.getByLabel('open').nth(1).click();
    await page.keyboard.insertText(testdata.dc_new);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator("//*[text() = '" + testdata.dc_new + "']")).toBeVisible();
    await page.waitForTimeout(1500);
    console.log('filter is applied for ', testdata.dc_new);
}

async function spinner(page) {
    try {
        await page.waitForTimeout(1500);
        await expect(await page.locator("//*[@style = 'animation-delay: 0ms;']")).toBeVisible();
        await page.waitForTimeout(1200)
        await expect(await page.locator("//*[@style = 'animation-delay: 0ms;']")).toBeHidden();
    } catch (error) { }
}
async function create_job_repairs(page, is_create_job, repair_type) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    let acc_num = 'NEWPR02', cont_name = 'Romeo Murillo', stock_code = 'CIMR-AU4A0165FAA';
    let tech = 'Michael Strothers';
    // await page.goto('https://www.staging-buzzworld.iidm.com/parts-purchase-detail-view/a423c218-998e-41b8-836f-efcb5261bf30');
    await page.getByText('Repairs').first().click();
    await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible();
    await page.waitForTimeout(2000);
    await page.getByText('Create RMA').click();
    await expect(page.locator('#root')).toContainText('Search By Company Name');
    await page.getByText('Search By Company Name').click();
    await page.getByLabel('Company Name*').fill(acc_num);
    await expect(page.getByText(acc_num, { exact: true }).nth(1)).toBeVisible();
    await page.getByText(acc_num, { exact: true }).nth(1).click();
    await page.getByText('Select', { exact: true }).click();
    await page.keyboard.insertText(cont_name);
    await page.getByText(cont_name, { exact: true }).nth(1).click();
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(page.locator('#repair-items')).toContainText('Repair item(s) Not Available');
    let rep = await page.locator('(//*[@class = "id-num"])[1]').textContent();
    let repair_id = rep.replace("#", "");
    console.log('repair is created with id ', repair_id);
    console.log('repair url is ', await page.url());
    await page.getByText('Add Items').click();
    await page.getByPlaceholder('Search By Part Number').fill(stock_code);
    let res = false;
    try {
        await expect(page.locator('//*[text() = "? Click here to add them"]')).toBeVisible();
        res = true;
    } catch (error) {
        console.log(error)
        res = false;
    }
    if (res) {
        await add_new_part(page, stock_code);
    } else {
        await page.locator('g > rect').click();
        await page.getByRole('button', { name: 'Add Selected 1 Parts' }).click();
    }
    //Assign Location
    await expect(page.locator('#repair-items')).toContainText('Assign Location');
    await page.getByText('Assign Location').click();
    if (res) {
    } else {
        await page.locator('(//*[@class = "pi-label-edit-icon"])[1]').click();
        await page.getByPlaceholder('Serial No').fill('TestSN7934');
        await page.getByTitle('Save Changes').getByRole('img').click();
    }
    await page.getByPlaceholder('Storage Location').fill('SL001');
    await page.getByPlaceholder('Type here').fill('Test Internal Item Notes');
    await page.getByRole('button', { name: 'Update Location' }).click();
    //Assign Technician
    await expect(page.locator('#repair-items')).toContainText('Assign Technician');
    await page.getByText('Assign Technician').click();
    await page.getByText('Select').click();
    await page.keyboard.insertText(tech);
    await page.getByText(tech, { exact: true }).nth(1).click();
    await page.getByRole('button', { name: 'Assign' }).click();
    //Item Evaluation
    await expect(page.locator('#repair-items')).toContainText('Evaluate Item');
    await page.getByText('Evaluate Item').click();
    //select repair type
    await page.locator("(//*[@class = 'radio'])[" + repair_type + "]").click();
    if (repair_type == 1) {
        await page.getByPlaceholder('Estimated Repair Hrs').fill('2');
        await page.getByPlaceholder('Estimated Parts Cost').fill('123.53');
        await page.getByPlaceholder('Technician Suggested Price').fill('568.56');
    } else if (repair_type == 2) {

    } else {
        await page.getByPlaceholder('Technician Suggested Price').fill('568.56');
    }
    await page.waitForTimeout(1500);
    await page.getByText('Select').click();
    for (let index = 0; index < 3; index++) {
        await page.keyboard.press('Space');
        await page.keyboard.press('ArrowDown');
    }
    await page.getByRole('button', { name: 'Update Evaluation' }).hover();
    await page.getByRole('button', { name: 'Update Evaluation' }).click();
    //Add Items to Quote
    await page.locator('#repair-items label').click();
    await page.getByRole('button', { name: 'Add items to quote' }).click();
    await expect(page.locator('#root')).toContainText('Are you sure you want to add these item(s) to quote ?');
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.locator('#repair-items')).toContainText('Quote Items (1)');
    let quote = await page.locator('(//*[@class = "id-num"])[1]').textContent();
    let quote_id = quote.replace("#", "");
    console.log('quote is created with id ', quote_id);
    let quote_url = await page.url();
    console.log('quote url is ', quote_url);
    let total_price = await page.locator("(//*[contains(@class, 'total-price-ellipsis')])[3]").textContent();
    let tqp = parseInt(total_price.replace("$", "").replace(",", ""));
    if (tqp > 10000) {
        if (tqp > 10000 && tqp < 25001) {
            await page.locator("//*[text() = 'Approval Questions']").click();
            await page.locator("(//*[text() = 'Type'])[2]").click();
            await page.keyboard.press('Enter');
            await page.getByPlaceholder('Enter Competition').fill('Test Competition');
            await page.getByPlaceholder('Enter Budgetary Amount').fill('9999.01');
            await page.getByPlaceholder('Enter Key Decision Maker').fill(cont_name);
            await page.locator("(//*[text() = 'Save'])[1]").click();
            await page.locator("(//*[text() = 'Submit for Internal Approval'])[1]").click();
            await expect(page.locator("(//*[text() = 'Are you sure you want to submit this quote for approval ?'])[1]")).toBeVisible();
            await page.locator("(//*[text() = 'Proceed'])[1]").click();
            await page.getByRole('button', { name: 'Approve' }).click();
            await page.getByRole('button', { name: 'Approve' }).nth(1).click();
        } else {

        }
    } else {
        await page.getByRole('button', { name: 'Approve' }).click();
        await page.getByRole('button', { name: 'Approve' }).nth(1).click();
    }
    //Approve the Quote
    // await page.getByRole('button', { name: 'Approve' }).click();
    // await page.getByRole('button', { name: 'Approve' }).nth(1).click();
    await expect(page.locator('#root')).toContainText('Submit for Customer Approval');
    await page.locator('//*[@id="root"]/div/div[3]/div[1]/div[1]/div/div[2]/div[1]/div[3]/div/button').click();
    await expect(page.getByRole('menuitem')).toContainText('Delivered to Customer');
    await page.getByRole('menuitem', { name: 'Delivered to Customer' }).click();
    //Won the Quote
    await expect(page.locator('#root')).toContainText('Won');
    await page.getByRole('button', { name: 'Won' }).click();
    await expect(page.locator('#root')).toContainText('Are you sure you want to mark it as approve ?');
    await page.getByRole('button', { name: 'Proceed' }).first().click();
    //Create Sales Order
    await expect(page.locator('#root')).toContainText('Create Sales Order');
    await page.getByText('Create Sales Order').click();
    await expect(page.getByPlaceholder('Enter PO Number')).toBeVisible();
    await page.getByPlaceholder('Enter PO Number').fill('543534534');
    await page.waitForTimeout(17000);
    await page.getByText('Select Shipping Instructions').click();
    await page.getByLabel('Order Date*').fill('u');
    await page.getByText('UPS GRD COLLECT', { exact: true }).click();
    await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeVisible();
    let res1 = false;
    try {
        await expect(page.locator('#root')).toContainText('does not exist');
        res1 = true;
    } catch (error) {
        res1 = false;
    }
    if (res1) {
        await page.locator('(//*[contains(@src, "addIcon")])[1]').click();
        await expect(page.getByRole('dialog')).toContainText('Add Stock Line Items');
        let prod_class_text = await page.locator("(//*[contains(@class, 'react-select__value-container')])[3]").textContent();
        if (prod_class_text == 'Select') {
            await page.locator("(//*[contains(@class, 'react-select__value-container')])[3]").click();
            await page.keyboard.press('Enter');
        } else {
        }
        await page.getByRole('button', { name: 'Add' }).click();
        await expect(page.locator("//*[text() = 'Create Job']")).toBeVisible();
        await page.waitForTimeout(2000);
    } else {

    }
    let is_checked = await page.locator('label').filter({ hasText: 'Create Job' }).isChecked();
    await page.waitForTimeout(1500);
    if (is_create_job == 'Y') {
        if (is_checked) {

        } else {
            await page.locator('label').filter({ hasText: 'Create Job' }).click();
        }
    } else if (is_create_job == 'N') {
        if (is_checked) {
            await page.locator('label').filter({ hasText: 'Create Job' }).click();
        } else {

        }
    }
    is_checked = await page.locator('label').filter({ hasText: 'Create Job' }).isChecked();
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    try {
        //update warehouse if needed
        await expect(page.locator("//*[contains(text(),  'not stocked in warehouse')]")).toBeVisible({ timeout: 6000 });
        await warehouse_update(page, stock_code);
        await page.getByRole('button', { name: 'Create', exact: true }).click();
    } catch (error) {

    }
    await expect(page.getByRole('heading', { name: 'Sales Order Information' })).toBeVisible();
    let soid = await page.locator('(//*[@class = "id-num"])[1]').textContent();
    let order_id = soid.replace("#", "");
    console.log('order created with id ', order_id);
    if (is_create_job == 'Y') {
        console.log("job selection checkbox is checked ", is_checked);
        let job_id = await page.locator('(//*[@role = "presentation"])[7]');
        let job_num = await job_id.textContent();
        console.log('job created with id ', job_num);
        await job_id.click();
        await expect(page.getByRole('heading', { name: 'Job Information' })).toBeVisible();
        let job_status = await page.locator("(//*[contains(@class, 'description')])[3]").textContent();
        let work_hours = await page.locator('//*[@id="root"]/div/div[4]/div/div[2]/div[3]/div/div[1]/h3/span').textContent();
        //create parts purchase from repair.
        await create_parts_purchase(page, false, repair_id);
        //update parts purchase status to received and completed
        await rep_complete(page, repair_id, job_status, tech, job_num, work_hours);
    } else {
        console.log("job selection checkbox is checked ", is_checked);
    }
    // await rep_complete(page, '314844', 'Confirmed', tech, '86769');
}
async function rep_complete(page, rep_id, job_sta, tech, job_num, work_hours) {
    //updating pp status to Received and Completed
    await page.locator('(//*[@class = "pi-label-edit-icon"])[1]').click();
    await page.locator('(//*[text() = "Requested"])[2]').click();
    await page.keyboard.insertText('Received and Completed');
    await page.keyboard.press('Enter');
    await page.getByTitle('Save Changes').click();
    await spinner(page);
    await page.waitForTimeout(2000);
    await page.getByText(rep_id).click();
    await expect(page.locator('#repair-items')).toContainText('Parts Received');
    let time_entry_status = false;
    try {
        //verifying time entry icon is displayed or not
        await expect(page.locator("(//*[contains(@src, 'Add_time')])[1]")).toBeVisible({ timeout: 5000 });
        console.log('Job status is ' + job_sta + ' time entry icon is displayed');
        time_entry_status = true;
    } catch (error) {
        console.log('Job status is ' + job_sta + ' So, time entry icon is not displayed..!');
    }
    if (time_entry_status) {
        await page.locator("(//*[contains(@src, 'Add_time')])[1]").click();
        await expect(page.locator('//*[text() = "Employee Name"]')).toBeVisible();
        await page.getByLabel('open').click();
        await page.keyboard.insertText(tech);
        await page.keyboard.press('Enter');
        await page.locator('//*[@placeholder = "Spent Time (Hours)"]').fill('12.17');
        await page.locator('//*[text() = "Add"]').click();
        await page.waitForTimeout(2000);
        try {
            await expect(page.locator('//*[text() = "Employee Name"]')).toBeHidden();
            await page.locator('(//*[text() = "' + job_num + '"])[2]').click();
            await expect(page.getByRole('heading', { name: 'Job Information' })).toBeVisible();
            await expect(page.locator('(//*[text() = "' + tech.toUpperCase() + '"])[1]')).toBeVisible();
            await expect(page.locator('(//*[text() = "' + '12.17'.replace(".", ":") + '"])[1]')).toBeVisible();
            let wh = await page.locator('//*[@id="root"]/div/div[4]/div/div[2]/div[3]/div/div[1]/h3/span').textContent();
            if (work_hours != wh) {
                console.log('Add time entry working');
                console.log('Before Add time entry Total hours in job is ' + work_hours);
                console.log('After Add time entry Total hours in job is ' + wh);
            } else {

            }
        } catch (error) {
            console.log('Add time entry not working', error);
            await page.screenshot({ path: 'files/add_time_entry.png', fullPage: true });
            await page.getByTitle('close').getByRole('img').click();
            await page.waitForTimeout(1800);
        }
        await page.locator('(//*[text() = "' + rep_id + '"])[1]').click();
    } else {

    }
    //marked as In Progress
    await expect(page.locator('#repair-items')).toContainText('Mark as In Progress');
    await page.getByText('Mark as In Progress').click();
    await expect(page.locator('#root')).toContainText('Are you sure you want to move this item to Repair In Progress?');
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.locator('#repair-items')).toContainText('In Progress');
    console.log(rep_id + '- 1 is In Progress');
    await page.locator("//*[contains(@src, 'repair_summary')]").click();
    await page.getByLabel('open').click();
    await page.getByText('Bench tested', { exact: true }).click();
    await page.getByText('Entered parameters', { exact: true }).click();
    await page.getByText('Extracted parameters', { exact: true }).click();
    await page.keyboard.press('Escape');
    await page.getByPlaceholder('Enter Repair Summary Notes').fill('Test Repair Summary Notes to Customer');
    await page.getByPlaceholder('Type here').fill('Test Internal Item Notes in Repair Summary Page');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('#repair-items')).toContainText('Assign to QC');
    await page.getByText('Assign to QC').click();
    await expect(page.getByRole('dialog')).toContainText('Assign QC');
    await page.getByLabel('open').click();
    await page.keyboard.insertText(tech);
    await page.keyboard.press('Enter');
    await page.getByPlaceholder('Type here').fill('Test Internal Item Notes in Assign to QC Page');
    await page.getByRole('button', { name: 'Assign' }).click();
    await expect(page.locator('#repair-items')).toContainText('Pending QC');
    console.log(rep_id + '- 1 is Assign to QC');
    await page.locator('div:nth-child(6) > .action-item').click();
    await expect(page.locator('#root')).toContainText('QC Comments to Customer');
    await page.getByLabel('open').first().click();
    await page.locator('.sc-fytwQQ').click();
    await page.getByLabel('open').first().click();
    await page.getByText('Drive QC', { exact: true }).click();
    await page.getByLabel('Yes').first().check();
    await page.getByLabel('No').nth(2).check();
    await page.getByLabel('N/A').nth(2).check();
    await page.getByLabel('Yes').nth(3).check();
    await page.getByText('Status').nth(1).click();
    await page.getByText('Pass', { exact: true }).click();
    await page.locator('textarea[name="part_notes"]').fill('Test Part Notes');
    await page.locator('textarea[name="qc_comments"]').fill('Test QC Comments to Customer');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('#repair-items')).toContainText('Pending Invoice');
    console.log(rep_id + '- 1 is Pending Invoice');
    await page.getByRole('button', { name: 'loading Change Status' }).click();
    await page.getByRole('menuitem', { name: 'Completed' }).click();
    await expect(page.locator('#root')).toContainText('Are you sure you want to mark it as Completed ?');
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.locator('#repair-items')).toContainText('Completed');
    console.log(rep_id + '- 1 is completed');
}
async function create_job_quotes(page, is_create_job) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    let acc_num = 'SKYCA00', cont_name = 'Tim Demers', stock_code = '46012504001', quote_type = 'System Quote';
    // await page.goto('https://www.staging-buzzworld.iidm.com/system_quotes/0da487d0-dc5b-4fef-8b9a-9f21f019f129');
    await page.getByText('Quotes', { exact: true }).first().click();
    await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible();
    await page.locator('div').filter({ hasText: /^Create Quote$/ }).nth(1).click();
    await expect(page.getByText('Search By Account ID or')).toBeVisible();
    await page.locator('div').filter({ hasText: /^Company Name\*Search By Account ID or Company Name$/ }).getByLabel('open').click();
    await page.getByLabel('Company Name*').fill(acc_num);
    await expect(page.getByText(acc_num, { exact: true }).nth(1)).toBeVisible();
    await page.getByText(acc_num, { exact: true }).nth(1).click();
    await page.getByText('Quote Type').nth(1).click();
    await page.getByText(quote_type, { exact: true }).click();
    await page.getByPlaceholder('Enter Project Name').click();
    await page.getByPlaceholder('Enter Project Name').fill('for testing');
    await page.locator('div').filter({ hasText: /^Create Quote$/ }).nth(4).click();
    await page.getByRole('button', { name: 'Create Quote' }).click();
    await expect(page.locator('#repair-items')).toContainText('Quote item(s) Not Available');
    let quote = await page.locator('(//*[@class = "id-num"])[1]').textContent();
    let quote_id = quote.replace("#", "");
    console.log('quote is created with id ', quote_id);
    console.log('quote url is ', await page.url());
    await page.locator('(//*[@class = "pi-label-edit-icon"])[2]').click();

    await page.getByRole('button', { name: 'Now' }).click();
    await page.getByTitle('Save Changes').click();
    await page.locator('(//*[@class = "pi-label-edit-icon"])[4]').click();
    await page.getByLabel('open').click();
    await page.keyboard.insertText(cont_name);
    await page.keyboard.press("Enter");
    await page.getByTitle('Save Changes').click();
    await page.waitForTimeout(2000);
    await page.getByText('Add Items').click();
    await page.getByPlaceholder('Search By Part Number').click();
    await page.getByPlaceholder('Search By Part Number').fill(stock_code);
    let res = false;
    try {
        await expect(page.locator('//*[text() = ' + stock_code + ']')).toBeVisible();
        res = false;
    } catch (error) {
        console.log(error)
        res = true;
    }
    if (res) {
        await page.getByRole('tab', { name: 'Add New Items' }).click();
        if (quote_type == 'Parts Quote') {
            await page.locator("//*[text() = 'Search']").click();
            await page.keyboard.insertText(testdata.parts.supplier);
            await page.keyboard.press('Enter');
        } else {

        }
        await page.getByPlaceholder('Part Number').fill(stock_code);
        await page.getByPlaceholder('Quantity').fill('1');
        await page.getByPlaceholder('Quote Price').fill('20123.56');
        await page.getByPlaceholder('List Price').fill('256.36');
        await page.getByPlaceholder('IIDM Cost').fill('2549.256984');
        await page.getByText('Select').nth(1).click();
        await page.getByText('Field Service', { exact: true }).click();
        await page.getByText('Select', { exact: true }).click();
        await page.getByText('Day(s)', { exact: true }).click();
        await page.getByPlaceholder('Day(s)').click();
        await page.getByPlaceholder('Day(s)').fill('12-16');
        await page.getByPlaceholder('Description').click();
        await page.getByPlaceholder('Description').fill('Manually Added Items');
        await page.getByRole('button', { name: 'Add', exact: true }).click();
    } else {
        await page.locator('g > rect').click();
        await page.getByRole('button', { name: 'Add Selected 1 Items' }).click();
    }

    await expect(page.getByText('Add Options')).toBeVisible();
    await page.waitForTimeout(1500);
    let check = await page.locator('#repair-items label').isChecked();
    if (check) {

    } else {
        await page.waitForTimeout(1000);
        await page.locator('#repair-items label').check();
    }
    await page.getByRole('button', { name: 'Edit-icon' }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('Select').first()).toBeVisible();
    await page.waitForTimeout(1000);
    await page.getByText('Select').first().click();
    await page.waitForTimeout(1000);
    await page.getByText('Field Service', { exact: true }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(2000);
    let total_price = await page.locator("(//*[contains(@class, 'total-price-ellipsis')])[3]").textContent();
    let tqp = parseInt(total_price.replace("$", "").replace(",", ""));
    if (tqp > 10000) {
        if (tqp > 10000 && tqp < 25001) {
            await page.locator("//*[text() = 'Approval Questions']").click();
            await page.locator("(//*[text() = 'Type'])[2]").click();
            await page.keyboard.press('Enter');
            await page.getByPlaceholder('Enter Competition').fill('Test Competition');
            await page.getByPlaceholder('Enter Budgetary Amount').fill('9999.01');
            await page.getByPlaceholder('Enter Key Decision Maker').fill(cont_name);
            await page.locator("(//*[text() = 'Save'])[1]").click();
            await page.locator("(//*[text() = 'Submit for Internal Approval'])[1]").click();
            await expect(page.locator("(//*[text() = 'Are you sure you want to submit this quote for approval ?'])[1]")).toBeVisible();
            await page.locator("(//*[text() = 'Proceed'])[1]").click();
            await page.getByRole('button', { name: 'Approve' }).click();
            await page.getByRole('button', { name: 'Approve' }).nth(1).click();
        } else {

        }
    } else {
        await page.getByRole('button', { name: 'Approve' }).click();
        await page.getByRole('button', { name: 'Approve' }).nth(1).click();
    }
    await expect(page.locator('#root')).toContainText('Submit for Customer Approval');
    await page.locator('//*[@id="root"]/div/div[3]/div[1]/div[1]/div/div[2]/div[1]/div[3]/div/button').click();
    await expect(page.getByRole('menuitem')).toContainText('Delivered to Customer');
    await page.getByRole('menuitem', { name: 'Delivered to Customer' }).click();
    await expect(page.locator('#root')).toContainText('Won');
    await page.getByRole('button', { name: 'Won' }).click();
    await expect(page.locator('#root')).toContainText('Are you sure you want to mark it as approve ?');
    await page.getByRole('button', { name: 'Proceed' }).first().click();

    await expect(page.locator('#root')).toContainText('Create Sales Order');
    await page.getByText('Create Sales Order').click();
    await expect(page.getByPlaceholder('Enter PO Number')).toBeVisible();
    await page.waitForTimeout(2000);
    await page.getByPlaceholder('Enter PO Number').fill('543534534');
    await page.waitForTimeout(17000);
    let ship_text = await page.locator("(//*[contains(@class, 'react-select__value-container')])[2]").textContent();
    if (ship_text == 'Select Shipping Instructions') {
        await page.getByText('Select Shipping Instructions').click();
        await page.getByLabel('Order Date*').fill('u');
        await page.getByText('UPS GRD COLLECT', { exact: true }).click();
    } else {

    }
    await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeVisible();
    let res1 = false;
    try {
        await expect(page.locator('#root')).toContainText('does not exist');
        res1 = true;
    } catch (error) {
        res1 = false;
    }
    if (res1) {
        await page.locator('(//*[contains(@src, "addIcon")])[1]').click();
        await expect(page.getByRole('dialog')).toContainText('Add Stock Line Items');
        let prod_class_text = await page.locator("(//*[contains(@class, 'react-select__value-container')])[3]").textContent();
        if (prod_class_text == 'Select') {
            await page.locator("(//*[contains(@class, 'react-select__value-container')])[3]").click();
            await page.keyboard.press('Enter');
        } else {
        }
        await page.getByRole('button', { name: 'Add' }).click();
        await expect(page.locator("//*[text() = 'Create Job']")).toBeVisible();
        await page.waitForTimeout(2000);
    } else {

    }

    let is_checked;
    await page.waitForTimeout(1500);
    if (quote_type == 'Parts Quote') {
        console.log('create job option is disabled for ' + quote_type);
        is_checked = 'not display the create job option..';
    } else {
        is_checked = await page.locator('label').filter({ hasText: 'Create Job' }).isChecked();
        if (is_create_job == 'Y') {
            if (is_checked) {

            } else {
                await page.locator('label').filter({ hasText: 'Create Job' }).click();
            }
        } else if (is_create_job == 'N') {
            if (is_checked) {
                await page.locator('label').filter({ hasText: 'Create Job' }).click();
            } else {

            }
        }
        is_checked = await page.locator('label').filter({ hasText: 'Create Job' }).isChecked();
    }
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    try {
        //update warehouse if needed
        await expect(page.locator("//*[contains(text(),  'not stocked in warehouse')]")).toBeVisible({ timeout: 6000 });
        await warehouse_update(page, stock_code);
        await page.getByRole('button', { name: 'Create', exact: true }).click();
    } catch (error) {

    }
    await expect(page.getByRole('heading', { name: 'Sales Order Information' })).toBeVisible();
    let soid = await page.locator('(//*[@class = "id-num"])[1]').textContent();
    let order_id = soid.replace("#", "");
    console.log('order created with id ', order_id);
    if (is_create_job == 'Y') {
        console.log("job selection checkbox is checked ", is_checked);
        if (quote_type == 'Parts Quote') {

        } else {
            let job_id = await page.locator('(//*[@role = "presentation"])[6]');
            console.log('job created with id ', await job_id.textContent());
            await job_id.click();
            await expect(page.getByRole('heading', { name: 'Job Information' })).toBeVisible();
        }
    } else {
        console.log("job selection checkbox is checked ", is_checked);
    }
}
async function add_new_part(page, stock_code) {
    await page.getByRole('button', { name: '? Click here to add them' }).click();
    await expect(page.getByPlaceholder('Part Number')).toBeVisible();
    await page.getByPlaceholder('Part Number').fill(stock_code);
    await page.getByLabel('open').click();
    await page.getByLabel('Manufacturer*').fill('omro001');
    await page.getByText('OMRON ELECTRONICS LLC').click();
    await page.getByPlaceholder('Serial No').fill('SN797444');
    await page.getByPlaceholder('Description').fill('manually added');
    await page.getByRole('button', { name: 'Add New Part' }).click();
}
async function create_parts_purchase(page, is_manually, repair_id) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    try {
        let job_id = testdata.job_id; let tech = testdata.tech; let urgency = testdata.urgency;
        // await page.goto('https://www.staging-buzzworld.iidm.com/jobs/5bac8fae-41b4-42c5-9344-99e94d13325a');
        if (is_manually) {
            await page.getByText('Parts Purchase').click();
            await expect(page.locator("(//*[contains(@src, 'new_avatar')])[1]")).toBeVisible();
            await page.getByText('Create Parts Purchase').click();
            await page.getByLabel('open').first().click();
            await page.keyboard.insertText(tech);
            await page.getByText(tech, { exact: true }).nth(1).click();
            await page.getByText('Select Urgency').click();
            await page.getByLabel('Requestor information').getByText(urgency, { exact: true }).click();
        } else {
            await page.locator("//*[text() = '" + repair_id + "']").click();
            await expect(page.locator("//*[contains(@src, 'partspurchase')]")).toBeVisible();
            job_id = await page.locator("(//*[contains(@class, 'm-0 item-value')])[6]").textContent();
            await page.locator("//*[contains(@src, 'partspurchase')]").click();
        }
        await page.waitForTimeout(2000);
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await expect(page.locator("//*[contains(text(), 'Vendor Website')]")).toBeVisible();
        await page.getByText('Search Vendor').click();
        await page.getByLabel('Date Requested*').fill('enterpi');
        await page.waitForTimeout(3000);
        await page.keyboard.press('Enter');
        // await page.getByText('ENTERPI SOFTWARE SOLUTIONS', { exact: true }).click();
        await page.getByPlaceholder('Enter Vendor Contact Name').press('CapsLock');
        await page.getByPlaceholder('Enter Vendor Contact Name').fill('VENDORCONTACTNAME');
        await page.getByPlaceholder('Enter Vendor Website').press('CapsLock');
        await page.getByPlaceholder('Enter Vendor Website').fill('vendorwebsite.com');
        await page.getByPlaceholder('Enter Vendor Quote Number').fill('VENDORQUOTENUMBER');
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await expect(page.locator('form')).toContainText('Vendor Part Number');
        if (is_manually) {
            await page.getByText('Search Job Number').click();
            await page.locator('#async-select-example').nth(1).fill(job_id);
            await page.getByText(job_id, { exact: true }).nth(1).click();
        } else {

        }
        await page.getByText('Search Manufacturer').click();
        await page.locator('#async-select-example').nth(2).fill('OMRON ELECTRONICS LLC');
        await page.waitForTimeout(3000);
        await page.keyboard.press('Enter');
        // await page.getByText('OMRON ELECTRONICS LLC', { exact: true }).click();
        await page.getByPlaceholder('Enter Quantity').fill('2');
        await page.getByPlaceholder('Enter Cost').fill('1234.987456');
        await page.getByPlaceholder('Enter Vendor Part Number').fill('VENDORPARTNUMBER');
        await page.getByPlaceholder('Enter Description').fill('T');
        await page.getByPlaceholder('Enter Description').fill('TEST DESCRIPTION');
        await page.getByPlaceholder('Enter Item Special Notes').fill('TEST ITEM SPECIAL NOTES');
        await page.getByPlaceholder('Enter Item Notes').fill('TEST ITEM NOTES');
        await page.getByRole('button', { name: 'Create', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Purchase Order Information' })).toBeVisible();
        let pp = await page.locator('(//*[@class = "id-num"])[1]').textContent();
        let pp_id = pp.replace("#", "");
        console.log('used job id is ', job_id);
        console.log('parts purchase created with id ', pp_id);
        await page.waitForTimeout(2000);
    } catch (error) {
        console.log("getting Error while creating parts purchase ", error);
        await page.screenshot({ path: 'files/create_pp_error.png', fullPage: true });
        await page.getByTitle('close').getByRole('img').click();
    }
}
async function create_job_manually(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    try {
        await page.waitForTimeout(2000)
        // await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible();
        await page.getByText('Jobs').click();
        // await page.goto('https://www.staging-buzzworld.iidm.com/jobs/9b0970e6-b539-44d5-a118-ebde9631d1a5');
        await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible();
        await page.getByText('Create Job').click();
        await expect(page.getByPlaceholder('Enter Job Description')).toBeVisible();
        await page.getByLabel('open').first().click();
        await page.getByLabel('Order ID').fill(testdata.order_id);
        await expect(page.getByText(testdata.order_id, { exact: true }).nth(1)).toBeVisible();
        await page.waitForTimeout(1800);
        await page.keyboard.press('Enter');
        await page.getByLabel('open').nth(1).click();
        await page.waitForTimeout(1500);
        await page.keyboard.press('Enter');
        await page.getByPlaceholder('Enter Job Description').click();
        await page.getByPlaceholder('Enter Job Description').fill('Manually Added Through');
        await page.getByText('MM/DD/YYYY').click();
        for (let index = 0; index < 4; index++) {
            await page.keyboard.press('ArrowDown');
        }
        await page.keyboard.press('Enter');
        await page.getByRole('button', { name: 'Create Job' }).click();
        await expect(page.getByRole('heading', { name: 'Job Information' })).toBeVisible();
        let job = await page.locator('//*[@class = "id-num"]').textContent();
        let job_id = await job.replace("#", "");
        console.log('used order id is ', testdata.order_id)
        console.log('job created with id ', job_id);
        await page.waitForTimeout(1800);
    } catch (error) {
        console.log("getting Error while creating job ", error);
        await page.screenshot({ path: 'files/create_job_error.png', fullPage: true });
        await page.getByTitle('close').getByRole('img').click();
    }

}
async function import_pricing(page, import_to) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    try {
        let ven_code = 'WEIN001';
        let vendor = 'WEINTEK USA INC';
        await expect(page.getByRole('button', { name: 'Pricing' })).toBeVisible();
        await page.getByRole('button', { name: 'Pricing' }).click();
        await page.getByRole('menuitem', { name: 'Pricing', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Pricing' })).toBeVisible();
        await page.getByPlaceholder('Search', { exact: true }).fill(ven_code);
        await expect(page.getByText(ven_code)).toBeVisible();
        await page.waitForTimeout(2500)
        await expect(page.getByLabel('open')).toBeVisible();
        await page.getByLabel('open').click();
        await page.keyboard.insertText('Default');
        await page.waitForTimeout(2000);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(4000);
        try {
            await expect(page.locator("//*[text() = 'Clear']")).toBeVisible({ timeout: 10000 });
            await page.locator("//*[text() = 'Clear']").click();
            await spinner(page);
        } catch (error) {

        }
        await expect(page.locator("(//*[contains(@src, 'editicon')])[1]")).toBeVisible();
        let product_count = await page.locator("//*[@ref = 'lbRecordCount']").textContent();
        console.log('before import ', ven_code, ' products count is ', product_count);
        await page.getByText('Import').click();
        await page.getByText('Search').click();
        await page.getByLabel('Vendor').fill(vendor);
        await expect(page.locator("//*[contains(@class, 'css-4mp3pp-menu')]")).toBeVisible();
        await page.waitForTimeout(2000);
        let drop_count = await page.locator("//*[contains(@class, 'css-4mp3pp-menu')]");
        let dcount = await drop_count.locator('div').count();
        console.log('count of div tags are ', dcount);
        for (let index = 1; index <= dcount; index++) {
            let exp_sc = await drop_count.locator('div').nth(index).textContent();
            if (exp_sc == vendor + ven_code) {
                console.log(exp_sc);
                await drop_count.locator('div').nth(index).click();
                break;
            } else {
                console.log(exp_sc);
            }
        }
        if (import_to == 'pricing') {
            await page.locator("(//*[text() = 'Append to Existing List'])[2]").click();
            //pricing file
            await page.locator("(//*[@type = 'file'])[2]").setInputFiles('files/WEINTEK PriceList-Import-2023_Aug_31_2023.csv');
            await page.getByRole('button', { name: 'Import' }).click();
        } else if (import_to == 'discount code') {
            await page.locator("(//*[text() = 'Append to Existing List'])[1]").click();
            //discount code file
            await page.locator("(//*[@type = 'file'])[1]").setInputFiles('files/sample_discount_code_file.csv');
            await page.getByRole('button', { name: 'Import' }).click();
        } else if (import_to == 'both') {
            await page.locator("(//*[text() = 'Append to Existing List'])[1]").click();
            await page.locator("(//*[text() = 'Append to Existing List'])[2]").click();
            //discount code file
            await page.locator("(//*[@type = 'file'])[1]").setInputFiles('files/sample_discount_code_file.csv');
            //pricing file
            await page.locator("(//*[@type = 'file'])[2]").setInputFiles('files/WEINTEK PriceList-Import-2023_Aug_31_2023.csv');
            await page.getByRole('button', { name: 'Import' }).click();
        }
        let status = false
        try {
            await expect(await page.locator("//*[text() = 'Summary']")).toBeVisible()
            status = true
        } catch (error) {
            console.log("Summary text is not visible.!")
        }
        if (status) {
            console.log("Summary text is visible.!")
            await page.getByText('MM/DD/YYYY').first().click();
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowUp');
            await page.keyboard.press('Enter');
            let start_date = await page.locator("(//*[contains(@class, 'singleValue')])[2]").textContent();
            await page.getByText('MM/DD/YYYY').click();
            let e_date = await end_date(start_date);
            await page.keyboard.insertText(e_date);
            await page.keyboard.press('Enter');
            // await page.getByRole('button', { name: 'Proceed' }).click();
        } else {
            console.log("Summary text is not visible.!");
            await page.screenshot({ path: 'files/pricing_import.png', fullPage: true });
            // await page.getByRole('heading', { name: 'Error in pricing file' }).click();
            await page.getByTitle('close').getByRole('img').click();
        }
    } catch (error) {
        console.log("getting error while importing ", import_to, ' file(s)', error);
        await page.screenshot({ path: 'files/' + import_to + '_import.png', fullPage: true });
        await page.getByTitle('close').getByRole('img').click();
    }
    console.log('imported file(s) is ', import_to);
}
async function functional_flow(page) {
    await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible();
    await page.getByText('Admin').click();
    await admin1(page);
    await admin2(page);
    await admin3(page);
    await admin4(page);
    await quotesRepairs(page)
}
async function inventory_search(page, stock_code, stage_url) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    await login_buzz(page, stage_url);
    let warehouse;
    try {
        await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible();
    } catch (error) {

    }
    await page.getByText('Inventory').click();
    await expect(page.locator("//*[contains(@src, 'search_stock')]")).toBeVisible();
    await page.getByText('Search by Stock Code').click();
    await page.locator('#async-select-example').fill(stock_code);
    await spinner(page);
    let drop_count = await page.locator("//*[contains(@class, 'css-4mp3pp-menu')]");
    let dcount = await drop_count.locator('div').count();
    console.log('count of div tags are ', dcount);
    for (let index = 1; index <= dcount; index++) {
        let exp_sc = await drop_count.locator('div').nth(index).textContent();
        if (exp_sc == stock_code) {
            console.log(exp_sc);
            await drop_count.locator('div').nth(index).click();
            break;
        } else {
            console.log(exp_sc);
        }
    }
    await page.getByText(stock_code, { exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Stock Code Information' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ware House Information' })).toBeVisible();
    let count = await page.locator('//*[contains(@title, "warehouse")]').count();
    console.log('warehouse is ');
    for (let index = 1; index <= count; index++) {
        warehouse = await page.locator('(//*[contains(@title, "warehouse")])[' + count + ']').textContent();
        console.log('            ', warehouse);
    }
    return warehouse;
}
async function parts_purchase_left_menu_filter(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    await page.getByText('Parts Purchase').click();
    await page.waitForTimeout(2000);
    await page.getByText('Parts Purchase').first().click();
    let stats = ['Requested', 'Ordered', 'Partially Received', 'Received and Completed', 'Cancelled'];
    for (let index = 0; index < 5; index++) {
        await expect(page.locator("(//*[contains(@src, 'new_avatar')])[1]")).toBeVisible();
        await page.locator('(//*[text() = "' + stats[index] + '"])').first().click();
        try {
            await expect(page.locator("(//*[contains(@src, 'new_avatar')])[1]")).toBeVisible();
        } catch (error) {
            console.log('getting error while loading data');
            await page.screenshot({ path: 'files/pp_' + stats[index] + '_list.png', fullPage: true });
        }
        await page.waitForTimeout(1000);
        let status_count = await page.locator('(//*[text() = "' + stats[index] + '"])').count();
        await page.waitForTimeout(1000);
        let page_count = await page.locator("//*[contains(@id, 'last-row')]").textContent();
        console.log('page count is ', page_count);
        console.log('statuses count is ', status_count);
        if (page_count <= status_count) {
            console.log('left menu parts ' + stats[index] + ' filter working.');
        } else {
            console.log('left menu parts filter not working..!');
        }
        await expect(page.locator("(//*[contains(@src, 'new_avatar')])[1]")).toBeVisible();
        try {
            await expect(page.locator("(//*[text() = 'Clear'])[1]")).toBeVisible({ timeout: 3000 });
            await page.locator("(//*[text() = 'Clear'])[1]").click();
        } catch (error) { }
        await expect(page.locator("(//*[contains(@src, 'new_avatar')])[1]")).toBeVisible();
        await page.getByText('Filters').click();
        //select technician
        await page.getByText('Select').first().click();
        await page.keyboard.insertText('Michael Strothers');
        await page.keyboard.press('Enter');
        await page.keyboard.press('Escape');
        //select priority
        await page.getByText('Select').nth(2).click();
        await page.keyboard.insertText('Warranty Repair');
        await page.keyboard.press('Enter');
        await page.getByRole('button', { name: 'Apply' }).click();
        try {
            await expect(page.locator("(//*[contains(@src, 'new_avatar')])[1]")).toBeVisible();
            try {
                await expect(page.locator("(//*[text() = 'Michael Strothers'])[1]")).toBeVisible();
                await expect(page.locator("(//*[text() = 'Warranty Repair'])[1]")).toBeVisible();
                console.log('top applied filter is working');
                try {
                    await expect(page.locator("(//*[text() = 'Clear'])[1]")).toBeVisible({ timeout: 3000 });
                    await page.locator("(//*[text() = 'Clear'])[1]").click();
                } catch (error) { }
            } catch (error) {
                console.log('top applied filter is not working..!');
                await page.getByText('Filters').click();
                await page.screenshot({ path: 'files/pp_' + stats[index] + '_list.png', fullPage: true });
                await page.getByTitle('close').getByRole('img').click();
                try {
                    await expect(page.locator("(//*[text() = 'Clear'])[1]")).toBeVisible({ timeout: 3000 });
                    await page.locator("(//*[text() = 'Clear'])[1]").click();
                } catch (error) { }
            }
        } catch (error) {
            console.log('error : ' + error);
        }
    }
}
async function pos_report(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    let vendor_name = [
        'ABB', 'Omron', 'Omron STI', 'Parker', 'Rethink Robotics', 'Schmersal', 'SMC', 'Wago', 'Yaskawa Motion', 'Yaskawa VFD', 'Omron SFSAC', 'ABB SFSAC'
    ];


    await page.waitForTimeout(600);
    await page.locator("(//*[text() = 'Reports'])[1]").click();
    await page.locator("(//*[text() = 'Point of Sales'])[1]").click();
    await expect(page.locator("(//*[text() = 'Please Select Filters'])[1]")).toBeVisible();
    for (let index = 0; index < vendor_name.length; index++) {
        //selecting month
        await page.locator("(//*[contains(@class, 'react-select__indicator')])[1]").click();
        await page.keyboard.insertText('2');
        await page.keyboard.press('Enter');
        //selecting year
        await page.locator("(//*[contains(@class, 'react-select__indicator')])[3]").click();
        await page.keyboard.insertText('2024');
        await page.keyboard.press('Enter');
        //selecting vendor
        await page.locator("(//*[contains(@class, 'react-select__indicator')])[5]").click();
        await page.keyboard.insertText(vendor_name[index]);
        await page.keyboard.press('Enter');
        await page.locator("(//*[text() = 'Apply'])[1]").click();
        await spinner(page);
        if (vendor_name[index] == 'SMC') {
            await page.waitForTimeout(7000);
        } else {
            await page.waitForTimeout(5000);
        }
        let grid_text = await page.locator("//*[@class = 'ag-center-cols-viewport']").textContent();
        console.log(vendor_name[index] + ' grid data length is ', grid_text.length);
        if (grid_text.length > 38) {
            console.log(vendor_name[index] + ' POS report list is displayed');
        } else {
            await page.screenshot({ path: 'files/' + vendor_name[index] + '_POS_report.png', fullPage: true });
        }
    }
}
async function past_repair_prices(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    let quote_types = ['Repair Quotes', 'Parts Quotes', 'System Quotes'];
    await page.getByText('Quotes', { exact: true }).first().click();
    for (let qt = 0; qt < quote_types.length; qt++) {
        await spinner(page);
        await page.getByText(quote_types[qt], { exact: true }).first().click();
        await spinner(page);
        try {
            await expect(page.getByText('Clear')).toBeVisible({ timeout: 1200 });
            await page.getByText('Clear').click();
        } catch (error) { }
        await page.getByText('Filters').click();
        await page.getByLabel('open').nth(2).click();
        await page.keyboard.insertText('Open');
        await page.keyboard.press('Enter');
        await page.getByRole('button', { name: 'Apply' }).click();
        await spinner(page);
        let gt = await page.locator("//*[@style = 'left: 1424px; width: 174px;']").count();
        for (let index = 1; index <= gt; index++) {
            let price = await page.locator("(//*[@style = 'left: 1424px; width: 174px;'])[" + index + "]").textContent();
            if (price == '$0.00') {

            } else {
                await page.locator("(//*[@style = 'left: 1424px; width: 174px;'])[" + index + "]").click();
                break;
            }
        }
        await expect(page.locator("(//*[contains(@src, 'themecolorEdit')][@alt = 'chevron-right'])[1]")).toBeVisible();
        let itemsCount = await page.locator("//*[contains(@src, 'themecolorEdit')][@alt = 'chevron-right']").count();
        for (let index = 1; index <= itemsCount; index++) {
            await page.locator("(//*[contains(@src, 'themecolorEdit')][@alt = 'chevron-right'])[" + index + "]").click();
            let part_num = await page.locator("(//*[contains(@placeholder, 'Part Number')])[1]").getAttribute('value');
            await expect(page.locator("//*[contains(@placeholder, 'Quote Price')]")).toBeVisible();
            if (quote_types[qt] == 'System Quotes') {
                await page.waitForTimeout(1200);
                await expect(page.locator("//*[contains(@src, 'email_invoices')]")).toBeHidden({ timeout: 5000 });
                await spinner(page);
                console.log('past repair price is not displayed for ' + quote_types[qt] + ' ' + part_num + ' - ' + index);
                await page.locator("(//*[contains(@title, 'close')])[1]").click();
            } else {
                await page.waitForTimeout(1200);
                await expect(page.locator("//*[contains(@src, 'email_invoices')]")).toBeVisible({ timeout: 5000 });
                await page.locator("//*[contains(@src, 'email_invoices')]").click();
                await spinner(page);
                console.log('past repair price is displayed for ' + quote_types[qt] + ' ' + part_num + ' - ' + index);
                await page.locator("(//*[contains(@title, 'close')])[2]").click();
                await page.locator("(//*[contains(@title, 'close')])[1]").click();
            }
        }
        await page.goBack();
    }
}
async function edit_PO_pp(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    await page.getByText('Parts Purchase').click();
    await spinner(page);
    await page.getByText('Partially Received').first().click();
    await spinner(page);
    await page.getByRole('gridcell', { name: 'testpon1243' }).click();
    await page.getByText('testpon1243').click();
    await page.getByRole('button', { name: 'Save' }).click();
    try {
        await expect(page.getByText('Saved Successfully')).toBeVisible();
        console.log('We able to edit the PO at partially received status..');
    } catch (error) {
        console.log('un able to edit PO at parts purchase in Partially Received status', error);
        await page.screenshot({ path: 'files/edit_PO_pp.png', fullPage: true });
    }
    await spinner(page);
    await page.waitForTimeout(1200);
}
async function sync_jobs(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    let row = 1;
    for (let list = 1; list <= 109; list++) {
        const response_job_list = await fetch_jobs_list(page, list);
        const job_res_count = response_job_list.result.data.list.length;
        console.log('page -----: ', list);
        // console.log('totals jobs count is ', job_res_count);
        let col0, col1, col2, col3, col4, col5, col6;
        for (let index = 0; index < job_res_count; index++) {
            console.log('row ', row);
            const job_id = response_job_list.result.data.list[index].id;
            const job_num = response_job_list.result.data.list[index].job_id;
            const order_num = response_job_list.result.data.list[index].sales_order;
            let st_code = response_job_list.result.data.list[index].stock_code;
            const cust_name = response_job_list.result.data.list[index].customer_name;
            const cust_code = response_job_list.result.data.list[index].customer;
            // console.log('stock code ', st_code);
            if (order_num == '') {
                col1 = job_num;
                col2 = 'order not found for ' + job_num + ' in jobs list';
                col3 = st_code;
                col4 = cust_code + ' - ' + cust_name;
                // console.log(col1);
                col5 = '';
                col6 = '';
            } else {
                const job_result = await fetch_jobs_Detail(page, job_id);
                const rel_job_data = job_result.result.data;
                const status_code = job_result.result.status_code;
                // console.log('rel data in job is ', rel_job_data);
                if (rel_job_data == '') {
                    col1 = job_num;
                    col2 = 'job is ready to sync';
                    col3 = st_code;
                    col4 = cust_code + ' - ' + cust_name;
                    // col1 = job_num + ' this job is ready to sync and, stock code is ' + st_code + ' customer is ' + cust_code + ' - ' + cust_name;
                    // console.log(col1);
                    const order_list = await fetch_order_list(page, order_num);
                    // console.log('order list is ', order_list.result.data.list[0].sales_order);
                    if (order_list.result.data.total_count == 0) {
                        col5 = order_num;
                        col6 = 'order not found for ' + job_num + ' in order list';
                        // col2 = 'order not found for ' + job_num + ' in order list';
                        // console.log(col2);
                    } else {
                        if (order_num == order_list.result.data.list[0].sales_order) {

                            const order_id = order_list.result.data.list[0].id;
                            const order_res = await fetch_orders_Detail(page, order_id);
                            const rel_order_data = order_res.result.data;
                            const status_code_ord = order_res.result.status_code;
                            // console.log('rel data in orders is ', rel_order_data);
                            if (rel_order_data == '') {
                                col5 = order_num;
                                col6 = 'order is ready to sync';
                                // col2 = order_num + ' this order is ready to sync and, stock code is ' + st_code;
                                // console.log(col2);
                            } else {
                                col5 = order_num;
                                col6 = 'order is already synced';
                                // col2 = order_num + ' this order is already synced and,stock code is ' + st_code;
                                // console.log(col2);
                            }
                        } else {
                            col5 = order_num;
                            col6 = 'order not found for ' + job_num + ' in order list';
                            // col2 = 'order not found for ' + job_num + ' in order list';
                            // console.log(col2);
                        }
                    }
                } else {
                    col1 = job_num;
                    col2 = 'job is already synced';
                    col3 = st_code;
                    col4 = cust_code + ' - ' + cust_name;
                    col5 = order_num;
                    col6 = '';
                    // col1 = job_num + ' this job is already synced and, stock code is ' + st_code;
                    // console.log(col1);
                }
            }
            // console.log('col1 ', col1);
            // console.log('col2 ', col2);
            col0 = row;
            const data = [
                [col0, col1, col2, col3, col4, col5, col6]
            ];
            await write_data_into_excel(data);
            if (index >= 250) {
                index = 0;
            } else {

            }
            row = row + 1;
        }
        // await page.pause();
    }
    await page.close();
}
async function parts_import(page) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    let file;
    let test_data = ['positive', 'duplicate', 'empty', 'invalid_category', 'invalid_OUM', 'invalid_list_unit_prices'];
    await page.waitForTimeout(600);
    for (let index = 0; index < test_data.length; index++) {
        if (test_data[index] == 'positive') {
            file = 'parts_import.xlsx';
        } else if (test_data[index] == 'duplicate') {
            file = 'duplicate_parts.xlsx';
        } else if (test_data[index] == 'empty') {
            file = 'empty_parts.xlsx';
        } else if (test_data[index] == 'invalid_category') {
            file = 'invalid_category_parts.xlsx';
        } else if (test_data[index] == 'invalid_OUM') {
            file = 'invalid_OUM_parts.xlsx';
        } else if (test_data[index] == 'invalid_list_unit_prices') {
            file = 'invalid_list_unit_prices.xlsx';
        }
        await page.locator("(//*[text() = 'Inventory'])[1]").click();
        await page.getByText('Import').click();
        await expect(page.getByRole('heading', { name: 'Parts Import' })).toBeVisible();
        try {
            await page.waitForTimeout(1200);
            await page.locator("//*[@type = 'file']").setInputFiles(file);
        } catch (error) {
            console.log(error);
        }
        await expect(page.locator("//*[text() = 'File Uploaded']")).toBeVisible();
        try {
            await page.getByRole('button', { name: 'Proceed' }).click();
            if (test_data[index] == 'positive') {
                try {
                    await expect(page.locator('#root')).toContainText('The import process will be running in the background. Once complete, a mail will be sent to your registered email');
                    await page.getByRole('button', { name: 'Okay' }).click();
                    console.log('Bulk Import Wroking, Imported parts are Added to syspro');
                } catch (error) {
                    await page.screenshot({ path: 'files/add_bulk_parts_error.png', fullPage: true });
                    await page.getByTitle('close').getByRole('img').click();
                    console.log('Bulk Import Failed Importing parts are exit in syspro');
                    let excel_data = await read_excel_data();
                    console.log('rows count is ', excel_data.length);
                    for (let index = 0; index < excel_data.length; index++) {
                        try {
                            let part = excel_data[index].Stockcode;
                            console.log('parts from excel is ' + part);
                            await page.getByLabel('open').click();
                            await page.keyboard.insertText(part.toString());
                            await page.waitForTimeout(4000);
                            let search_data = await page.locator("//*[contains(@class, 'css-4mp3pp-menu')]");
                            let div = await search_data.locator("//div");
                            let div_count = await div.count();
                            console.log('div count ' + div_count);
                            for (let i = 1; i <= div_count; i++) {
                                let div_data = await div.nth(i).textContent();
                                console.log(' data is ' + div_data);
                                if (div_count == 2) {
                                    await page.keyboard.press('Enter');
                                    await expect(page.locator("//*[text() = 'Stock Code Information']")).toBeVisible();
                                    console.log(part + ' is in the Inventory');
                                    break;
                                } else {

                                    if (part == div_data) {
                                        await div.nth(i).click();
                                        await page.getByText(part, { exact: true }).click();
                                        await expect(page.locator("//*[text() = 'Stock Code Information']")).toBeVisible();
                                        console.log(part + ' is in the Inventory');
                                        break;
                                    } else {
                                        console.log(part + ' is not in the Inventory');
                                    }
                                }
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
            } else if (test_data[index] == 'duplicate') {
                await page.pause();
                await expect(page.locator("//*[text() = 'Error Log']")).toBeVisible();
                await expect(page.locator("//*[text() = 'Following Parts found in the Syspro. 12343-000, 46012504001']")).toBeVisible();
                console.log('validation display for ' + test_data[index] + ' parts');
                await page.getByTitle('close').getByRole('img').click();
            } else if (test_data[index] == 'empty') {
                await expect(page.locator("//*[text() = 'Error Log']")).toBeVisible();
                await expect(page.locator("//*[text() = 'Following Parts found in the Syspro. ']")).toBeVisible();
                console.log('validation display for ' + test_data[index] + ' parts');
                await page.getByTitle('close').getByRole('img').click();
            } else if (test_data[index] == 'invalid_category') {
                await expect(page.locator("//*[text() = 'Error Log']")).toBeVisible();
                await expect(page.locator("//*[contains(text(), 'Following Parts Product Category are invalid. 26012504000, 46012504001, 12343-000')]")).toBeVisible();
                console.log('validation display for ' + test_data[index] + ' parts');
                await page.getByTitle('close').getByRole('img').click();
            } else if (test_data[index] == 'invalid_OUM') {
                await expect(page.locator("//*[text() = 'Error Log']")).toBeVisible();
                await expect(page.locator("//*[contains(text(), 'Following Parts has invalid UOM. 26012504000, 46012504001, 12343-000')]")).toBeVisible();
                console.log('validation display for ' + test_data[index] + ' parts');
                await page.getByTitle('close').getByRole('img').click();
            } else {
                await expect(page.locator("//*[text() = 'Error Log']")).toBeVisible();
                await expect(page.locator("//*[contains(text(), '6 row(s) have invalid cell value for headers')]")).toBeVisible();
                await expect(page.locator("//*[contains(text(), 'View-More')]")).toBeVisible();
                await expect(page.locator("//*[contains(text(), 'Export')]")).toBeVisible();
                console.log('validation display for ' + test_data[index] + ' parts');
                await page.getByTitle('close').getByRole('img').click();
            }
        } catch (error) {
            console.log(error);
            let error_text = await page.locator("//*[contains(@class, 'error-msg')]").textContent();
            console.log('Bulk Import Failed ' + error_text);
            await page.screenshot({ path: 'files/add_bulk_parts_error.png', fullPage: true });
            await page.getByTitle('close').getByRole('img').click();
        }
    }
}
async function add_parts(page, cond2, cond3) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    await page.locator("(//*[text() = 'Inventory'])[1]").click();
    let search_data, part;
    if (cond2 == 'duplicates' || cond3 == 'empty') {
        await page.waitForTimeout(600);
        part = '010-205201';
        search_data = 'For the searched stock code, inventory is not available ';
    } else {
        await page.waitForTimeout(600);
        part = testdata.parts.part_name;
        await page.getByLabel('open').click();
        await page.keyboard.insertText(part);
        await spinner(page);
        await page.waitForTimeout(1500);
        search_data = await page.locator("//*[contains(@class, 'css-4mp3pp-menu')]").textContent();
    }
    if (search_data == 'For the searched stock code, inventory is not available ') {
        console.log('search result is "' + search_data + '"');
        await page.getByText('Add Stock Code').click();
        await expect(page.getByPlaceholder('Stock Code')).toBeVisible();
        if (cond3 == 'empty') {

        } else {
            await page.getByPlaceholder('Stock Code').fill(part);
            await page.getByPlaceholder('Enter Unit Cost').fill(testdata.parts.unit_cost);
            await page.getByPlaceholder('Enter List Price').fill(testdata.parts.list_price);
            await page.getByPlaceholder('Enter Stock Description').fill(testdata.parts.part_descr);
            await page.getByLabel('open').nth(1).click();
            await page.getByText(testdata.parts.prod_class, { exact: true }).click();
            await page.getByLabel('open').nth(2).click();
            await page.getByText(testdata.parts.prod_category, { exact: true }).click();
            await page.getByLabel('open').nth(3).click();
            await page.keyboard.insertText(testdata.parts.supplier);
            await page.getByText(testdata.parts.supplier, { exact: true }).nth(1).click();
            await page.getByPlaceholder('Enter Order UOM').fill(testdata.parts.stock_OUM);
            await page.getByLabel('open').nth(4).click();
            await page.keyboard.insertText(testdata.parts.warehouse);
            await page.keyboard.press('Enter');
        }
        await page.getByRole('button', { name: 'Add' }).click();
        await page.waitForTimeout(1200);
        try {
            if (cond2 == 'duplicates') {
                await expect(page.locator("//*[contains(text(), 'stock code exists')]")).toBeVisible();
                console.log(part + ' is already added to stocks');
            } else {
                if (cond3 == 'empty') {
                    await expect(page.getByText('Stock Code is required')).toBeVisible({ timeout: 3000 });
                    await expect(page.getByText('Please Enter Unit Cost')).toBeVisible({ timeout: 3000 });
                    await expect(page.getByText('Please Enter List Price')).toBeVisible({ timeout: 3000 });
                    await expect(page.getByText('Stock Description is required')).toBeVisible({ timeout: 3000 });
                    await expect(page.getByText('Please Select Product Class')).toBeVisible({ timeout: 3000 });
                    await expect(page.getByText('Please Select Category')).toBeVisible({ timeout: 3000 });
                    await expect(page.getByText('supplier required')).toBeVisible({ timeout: 3000 });
                    await expect(page.getByText('Order UOM is required')).toBeVisible({ timeout: 3000 });
                    await expect(page.getByText('Please Select Warehouse')).toBeVisible({ timeout: 3000 });
                    console.log('display all required fields validation');
                } else {
                    await spinner(page);
                    await page.getByLabel('open').click();
                    await page.keyboard.insertText(part);
                    await spinner(page);
                    await page.waitForTimeout(1500);
                    search_data = await page.locator("//*[contains(@class, 'css-4mp3pp-menu')]").textContent();
                    if (search_data.includes(part)) {
                        console.log(part + ' is added to syspro');
                    } else {
                        console.log(part + ' is not added to syspro');
                    }
                }
            }
        } catch (error) {
            console.log(error);
            await page.screenshot({ path: 'files/add_part_error.png', fullPage: true });
            await page.getByTitle('close').getByRole('img').click();
        }
    } else {
        if (search_data.includes(part)) {
            console.log('search result is "' + search_data + '"');
            console.log(part + ' is Exist In Inventory.');
        } else {

        }
    }
    await page.reload();
}
async function fetch_jobs_list(page, page_num) {
    const apiUrl = 'https://staging-buzzworld-api.iidm.com//v1/getSysproJobs?page=' + page_num + '&perPage=250&sort=asc&sort_key=job_id&grid_name=Jobs';
    // Make a GET request to the API endpoint
    const response = await page.evaluate(async (url) => {
        const fetchData = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4IiwianRpIjoiODY5N2I4NTFjZTBjYTE5MDc5NzM1NGY5MmM3MDBmOTk3N2YxM2E3MGQ0ODRjMWNhYWU1ZGY5NjJkNThiMjY0NzNkZTNmY2RiZGE1YWJlNmMiLCJpYXQiOjE3MTUxNjU2MjkuMzY4MzUzLCJuYmYiOjE3MTUxNjU2MjkuMzY4MzU3LCJleHAiOjE3MTY0NjE2MjkuMzUyNzM2LCJzdWIiOiI2NzE0YTkyNC03YmZhLTQ5NjktODUzOC1iZjg0MTk1YjU0MWEiLCJzY29wZXMiOltdfQ.ZUvw0p-uc3XBghUPXKIiwfJ3bEgix8YXINm-ln5xlcW-JvClzl99W1qf-UWlGl3vS4znHlLJ_MAx_WTKyPTUUUxD5JoJe_C9cARfu-sgiv-b7h8E8WWAZfooguaQBH5_FCTOCnhLQJ_G4_5PUdDrR2yPSwTNecZsoC9mXK19CtINMZKO3NlzJ8KFZNKK6dBNgGvnDownm90M2XFJk8pr3J-0oq1rvGtRvn8fcYmDAoLuvJJgH39vdbaqF8zi9645mTUPifenCXtn2bD-GVpEFwV6lHo3mqEtxlDLsntzebVlY-M5JAwdBqPcboOwsAQBKDuHGHkJVP60ci5RllcyDa7wPWIFmG56zllPwhlrc_rWS4EBlfK_DAx8PQ0j4PuAkUbyWmuojwpldv84Sgpz5-41aKJR84Fy_GqPVrl4r-OmXL-zLETahASTQBDG1V9o9UJ5Ne-FbHVgIfrat7M-WcodBbdJ9z5yfVDyJnKVP5IHwit_J0O6w5ssvdMnr1nOIl36pvfNcUZ0LQb2MZ09HA1KBQpoUQgfglku0owd8wAWhI_8sS2m0fYsELy5Wstay0fxsbuODW2hz8A20f-zoutuSBrnDgFI7JO8fky1HAHmlqlgyvcQ_BkvO9YKRfwaDjUozDdwQTsnMNhT565GMdeTbzxaTkGNy74qFgXpR-Q'}` // Replace 'Bearer' with the appropriate authentication scheme (e.g., 'Bearer', 'Basic')
            }
        });
        return fetchData.json();
    }, apiUrl);
    // Output the API response
    return response;
}
async function fetch_jobs_Detail(page, job_id) {
    const apiUrl = 'https://staging-buzzworld-api.iidm.com/v1/RelatedData?job_id=' + job_id;
    // Make a GET request to the API endpoint
    const response = await page.evaluate(async (url) => {
        const fetchData = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4IiwianRpIjoiODY5N2I4NTFjZTBjYTE5MDc5NzM1NGY5MmM3MDBmOTk3N2YxM2E3MGQ0ODRjMWNhYWU1ZGY5NjJkNThiMjY0NzNkZTNmY2RiZGE1YWJlNmMiLCJpYXQiOjE3MTUxNjU2MjkuMzY4MzUzLCJuYmYiOjE3MTUxNjU2MjkuMzY4MzU3LCJleHAiOjE3MTY0NjE2MjkuMzUyNzM2LCJzdWIiOiI2NzE0YTkyNC03YmZhLTQ5NjktODUzOC1iZjg0MTk1YjU0MWEiLCJzY29wZXMiOltdfQ.ZUvw0p-uc3XBghUPXKIiwfJ3bEgix8YXINm-ln5xlcW-JvClzl99W1qf-UWlGl3vS4znHlLJ_MAx_WTKyPTUUUxD5JoJe_C9cARfu-sgiv-b7h8E8WWAZfooguaQBH5_FCTOCnhLQJ_G4_5PUdDrR2yPSwTNecZsoC9mXK19CtINMZKO3NlzJ8KFZNKK6dBNgGvnDownm90M2XFJk8pr3J-0oq1rvGtRvn8fcYmDAoLuvJJgH39vdbaqF8zi9645mTUPifenCXtn2bD-GVpEFwV6lHo3mqEtxlDLsntzebVlY-M5JAwdBqPcboOwsAQBKDuHGHkJVP60ci5RllcyDa7wPWIFmG56zllPwhlrc_rWS4EBlfK_DAx8PQ0j4PuAkUbyWmuojwpldv84Sgpz5-41aKJR84Fy_GqPVrl4r-OmXL-zLETahASTQBDG1V9o9UJ5Ne-FbHVgIfrat7M-WcodBbdJ9z5yfVDyJnKVP5IHwit_J0O6w5ssvdMnr1nOIl36pvfNcUZ0LQb2MZ09HA1KBQpoUQgfglku0owd8wAWhI_8sS2m0fYsELy5Wstay0fxsbuODW2hz8A20f-zoutuSBrnDgFI7JO8fky1HAHmlqlgyvcQ_BkvO9YKRfwaDjUozDdwQTsnMNhT565GMdeTbzxaTkGNy74qFgXpR-Q'}` // Replace 'Bearer' with the appropriate authentication scheme (e.g., 'Bearer', 'Basic')
            }
        });
        return fetchData.json();
    }, apiUrl);
    // Output the API response
    return response;

}
async function fetch_order_list(page, order_num) {
    const apiUrl = 'https://staging-buzzworld-api.iidm.com//v1/getSalesOrder?page=1&perPage=25&sort=desc&sort_key=sales_order&grid_name=Orders&search=' + order_num;
    // Make a GET request to the API endpoint
    const response = await page.evaluate(async (url) => {
        const fetchData = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4IiwianRpIjoiODY5N2I4NTFjZTBjYTE5MDc5NzM1NGY5MmM3MDBmOTk3N2YxM2E3MGQ0ODRjMWNhYWU1ZGY5NjJkNThiMjY0NzNkZTNmY2RiZGE1YWJlNmMiLCJpYXQiOjE3MTUxNjU2MjkuMzY4MzUzLCJuYmYiOjE3MTUxNjU2MjkuMzY4MzU3LCJleHAiOjE3MTY0NjE2MjkuMzUyNzM2LCJzdWIiOiI2NzE0YTkyNC03YmZhLTQ5NjktODUzOC1iZjg0MTk1YjU0MWEiLCJzY29wZXMiOltdfQ.ZUvw0p-uc3XBghUPXKIiwfJ3bEgix8YXINm-ln5xlcW-JvClzl99W1qf-UWlGl3vS4znHlLJ_MAx_WTKyPTUUUxD5JoJe_C9cARfu-sgiv-b7h8E8WWAZfooguaQBH5_FCTOCnhLQJ_G4_5PUdDrR2yPSwTNecZsoC9mXK19CtINMZKO3NlzJ8KFZNKK6dBNgGvnDownm90M2XFJk8pr3J-0oq1rvGtRvn8fcYmDAoLuvJJgH39vdbaqF8zi9645mTUPifenCXtn2bD-GVpEFwV6lHo3mqEtxlDLsntzebVlY-M5JAwdBqPcboOwsAQBKDuHGHkJVP60ci5RllcyDa7wPWIFmG56zllPwhlrc_rWS4EBlfK_DAx8PQ0j4PuAkUbyWmuojwpldv84Sgpz5-41aKJR84Fy_GqPVrl4r-OmXL-zLETahASTQBDG1V9o9UJ5Ne-FbHVgIfrat7M-WcodBbdJ9z5yfVDyJnKVP5IHwit_J0O6w5ssvdMnr1nOIl36pvfNcUZ0LQb2MZ09HA1KBQpoUQgfglku0owd8wAWhI_8sS2m0fYsELy5Wstay0fxsbuODW2hz8A20f-zoutuSBrnDgFI7JO8fky1HAHmlqlgyvcQ_BkvO9YKRfwaDjUozDdwQTsnMNhT565GMdeTbzxaTkGNy74qFgXpR-Q'}` // Replace 'Bearer' with the appropriate authentication scheme (e.g., 'Bearer', 'Basic')
            }
        });
        return fetchData.json();
    }, apiUrl);
    // Output the API response
    return response;
}
async function fetch_orders_Detail(page, order_id) {
    const apiUrl = 'https://staging-buzzworld-api.iidm.com/v1/RelatedData?sales_order_id=' + order_id;
    // Make a GET request to the API endpoint
    const response = await page.evaluate(async (url) => {
        const fetchData = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4IiwianRpIjoiODY5N2I4NTFjZTBjYTE5MDc5NzM1NGY5MmM3MDBmOTk3N2YxM2E3MGQ0ODRjMWNhYWU1ZGY5NjJkNThiMjY0NzNkZTNmY2RiZGE1YWJlNmMiLCJpYXQiOjE3MTUxNjU2MjkuMzY4MzUzLCJuYmYiOjE3MTUxNjU2MjkuMzY4MzU3LCJleHAiOjE3MTY0NjE2MjkuMzUyNzM2LCJzdWIiOiI2NzE0YTkyNC03YmZhLTQ5NjktODUzOC1iZjg0MTk1YjU0MWEiLCJzY29wZXMiOltdfQ.ZUvw0p-uc3XBghUPXKIiwfJ3bEgix8YXINm-ln5xlcW-JvClzl99W1qf-UWlGl3vS4znHlLJ_MAx_WTKyPTUUUxD5JoJe_C9cARfu-sgiv-b7h8E8WWAZfooguaQBH5_FCTOCnhLQJ_G4_5PUdDrR2yPSwTNecZsoC9mXK19CtINMZKO3NlzJ8KFZNKK6dBNgGvnDownm90M2XFJk8pr3J-0oq1rvGtRvn8fcYmDAoLuvJJgH39vdbaqF8zi9645mTUPifenCXtn2bD-GVpEFwV6lHo3mqEtxlDLsntzebVlY-M5JAwdBqPcboOwsAQBKDuHGHkJVP60ci5RllcyDa7wPWIFmG56zllPwhlrc_rWS4EBlfK_DAx8PQ0j4PuAkUbyWmuojwpldv84Sgpz5-41aKJR84Fy_GqPVrl4r-OmXL-zLETahASTQBDG1V9o9UJ5Ne-FbHVgIfrat7M-WcodBbdJ9z5yfVDyJnKVP5IHwit_J0O6w5ssvdMnr1nOIl36pvfNcUZ0LQb2MZ09HA1KBQpoUQgfglku0owd8wAWhI_8sS2m0fYsELy5Wstay0fxsbuODW2hz8A20f-zoutuSBrnDgFI7JO8fky1HAHmlqlgyvcQ_BkvO9YKRfwaDjUozDdwQTsnMNhT565GMdeTbzxaTkGNy74qFgXpR-Q'}` // Replace 'Bearer' with the appropriate authentication scheme (e.g., 'Bearer', 'Basic')
            }
        });
        return fetchData.json();
    }, apiUrl);
    // Output the API response
    return response;
}
async function fetch_pp_status(page, status) {
    const apiUrl = 'https://staging-buzzworld-api.iidm.com/v1/getPartPurchase?page=1&perPage=25&sort=&sort_key=&grid_name=Repairs&serverFilterOptions=[object%20Object]&selectedCustomFilters=[object%20Object]&part_purchase_type=' + status;
    // Make a GET request to the API endpoint
    const response = await page.evaluate(async (url) => {
        const fetchData = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4IiwianRpIjoiOTc4NzU2OGU2OTE1OWMxZTE3ZTcxY2QzZTA0NTI4ZDg0OWNmODFiOGYyMDI4M2VhZTI1M2VlMWY2NTkyMmUxZTZiODMwODExZmQ2YjM4ZDMiLCJpYXQiOjE3MTUyMzg1ODkuOTA2OTM4LCJuYmYiOjE3MTUyMzg1ODkuOTA2OTQzLCJleHAiOjE3MTY1MzQ1ODkuODk1MzQ5LCJzdWIiOiI2NzE0YTkyNC03YmZhLTQ5NjktODUzOC1iZjg0MTk1YjU0MWEiLCJzY29wZXMiOltdfQ.L7sVDK-Jc89TKjkSuFWLKP0ka_kXNBGba-ittCenBF-6PB0GnruN9hj3dIxCC6j4RTcYZ40_NkfNfaxqOQyFP9lmuUg_2vky26D6cAo4Ognp7RlDyBeHoUjJdxu0pAWJFJUDTehRCAdnPjMy_3EfWyEPhqq_6IML_RlP-X2W5rg4PZyXbO-8_VbQkj8srH9Xy54qTpjmZTtCY54k5LANjxdmheiTAuGWv9dju4_sZWlbVzfblTfgKeZKHnnQjJxvz0snAG22rrne_hB4wuIOGlLCRVzPsl3zj2oQ6VcZXS2qQ0vXHLRKqIXSZzHk7wJv3zkqteDmyuUjNfbantnAE5VMvtWk893r3bt5VEa0cEXNoLtTirT9UnxDY_n7zWuziEDneFnUqTiWN57wRItZRpSECgsS5B3ZOhkEfB3x4RvKhFkajjhWf-Cv_uNU1FogrxmdSW6BhV_kJsLWy5khEiW4A_hfoHIBlCSDZZNUNW-wiB3Q9AZW2C7SpHq1AmVytozp-uL8CST6FfgN6xpfOhpfFgEWtw199I7SwyK1g4EXYbSH5z4Zxpuh_gixaanNS5Ch-5cTSGn-o-FlarBQsrReFkGzNNJRW0YDBP7NUTfaJNJ9xaKnToe2IoMeMb_EbssRxbBQfDgfFvilVURrA6TqDUYCHYOLJKMV01XkA60'}` // Replace 'Bearer' with the appropriate authentication scheme (e.g., 'Bearer', 'Basic')
            }
        });
        return fetchData.json();
    }, apiUrl);
    // Output the API response
    return response;
}
async function write_data_into_excel(data) {
    // Create a new workbook
    // const workbook = new ExcelJS.Workbook();
    // Add a worksheet
    // const worksheet = workbook.addWorksheet('logs');
    // Add headers
    // worksheet.addRow(['Column 1', 'Column 2', 'Column 3']);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('logs.xlsx');
    // Get the first worksheet
    const worksheet = workbook.getWorksheet('logs');
    // Add data
    data.forEach(row => {
        worksheet.addRow(row);
    });
    // Write the workbook to a file
    await workbook.xlsx.writeFile('logs.xlsx');
}
async function read_excel_data() {
    const workbook = xlsx.readFile('parts_import.xlsx');

    // Choose the first sheet (you can specify the sheet name or index)
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Parse the sheet to JSON format
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    // Log the parsed data
    // console.log(jsonData);
    return jsonData;
}
async function reports(test_name, status) {
    const fs = require('fs');

    // Sample data to be included in the HTML report
    const testData = {

        testName: test_name,
        testResult: status,
        timestamp: new Date().toLocaleString()
    };

    const resultStyle = testData.testResult === 'Passed' ? 'color: green;' : 'color: red;';
    // Format the data into HTML markup
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>All Tests Reports</title>
        </head>
        <body>
            <table>
                <tr>
                    <td><h1>Test Name</h1></td>
                    <td><h1>Test Status</h1></td>
                    <td><h1>Test Executed Time</h1></td>
                </tr>
                <tr>
                    <td>${testData.testName}</td>
                    <td style="${resultStyle}">Result: ${testData.testResult}</td>
                    <td>Timestamp: ${testData.timestamp}</td>
                </tr>
            </table>
        </body>
        </html>
        `;

    // Write the HTML content to a file
    const fileName = 'files/test-report.html';
    fs.writeFile(fileName, htmlContent, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log(`HTML report saved to ${fileName}`);
        }
    });
}
async function warehouse_update(page, stock_code) {
    await page.waitForTimeout(1600);
    await page.locator("(//*[contains(@src,  'themecolorEdit')])[2]").click();
    await page.locator("(//*[contains(@aria-label,  'open')])[3]").click();
    await page.keyboard.insertText('90');
    await page.waitForTimeout(1300);
    await page.keyboard.press('Enter');
    await page.locator("(//*[contains(@class,  'tick-icon')])[3]").click();
    await page.waitForTimeout(1200);
}
function redirectConsoleToFile(filePath) {
    const originalConsoleLog = console.log;
    const logStream = fs.createWriteStream(filePath, { flags: 'a' }); // Open file in append mode
    console.log = function (...args) {
        originalConsoleLog.apply(console, args); // Log to console as usual
        logStream.write(`${args.join(' ')}\n`); // Write to log file
    };
}
async function end_date(startDate) {
    let text = startDate;
    let len = text.length;
    let next_year = parseInt(text.substring(len - 1, len)) + 1;
    let end_date = text.substring(0, len - 1) + next_year;
    return end_date;
}
async function setScreenSize(page, w, h) {
    // Get the monitor screen width
    await page.setViewportSize({
        width: w,
        height: h
    });
}

module.exports = {
    checkout_page,
    order_summary_page,
    guest_checkout_form,
    guest_add_products,
    request_payterms,
    login,
    login_buzz,
    logout,
    admin1,
    admin2,
    admin3,
    admin4,
    spinner,
    quotesRepairs,
    add_dc,
    update_dc,
    add_sc,
    update_sc,
    multi_edit,
    leftMenuSearch,
    create_job_repairs,
    create_job_quotes,
    create_job_manually,
    create_parts_purchase,
    import_pricing,
    functional_flow,
    inventory_search,
    filters_pricing,
    setScreenSize,
    sync_jobs,
    fetch_jobs_list,
    fetch_jobs_Detail,
    fetch_order_list,
    fetch_orders_Detail,
    fetch_pp_status,
    parts_purchase_left_menu_filter,
    pos_report,
    reports,
    parts_import,
    add_parts,
    past_repair_prices,
    edit_PO_pp,
    read_excel_data
};