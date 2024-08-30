const testdata = JSON.parse(JSON.stringify(require('../testdata.json')));
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { test, expect, page, chromium } = require('@playwright/test');
const exp = require('constants');
const { timeout } = require('../playwright.config');
const { AsyncLocalStorage } = require('async_hooks');
const xlsx = require('xlsx');
const { url } = require('inspector');
const { default: AllPages } = require('./PageObjects');
const { threadId } = require('worker_threads');
const currentDate = new Date().toDateString();
let date = currentDate.split(" ")[2];
let vendor = testdata.vendor;
let apiKey = testdata.api_key;
let allPages;
const currentDateTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
const ANSI_RESET = "\x1b[0m";
const ANSI_RED = "\x1b[31m";
const ANSI_GREEN = "\x1b[32m";
const ANSI_ORANGE = "\x1b[38;2;255;165;0m";
// const month = parseInt(text.substring(3, 4));
// Outputs "Mon Aug 31 2020"
//store the logs 
const logFilePath = path.join(__dirname, 'logs.log');
redirectConsoleToFile(logFilePath);
//--------------------------------------------------------------------//----------------------------------------------------------------//
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
async function login_buzz(page, stage_url) {
    allPages = new AllPages(page);
    await page.goto(stage_url);
    // if (await page.url().includes('sso')) {
    let userName, password;
    if (stage_url.includes('192.168')) {
        // userName = 'b.raghuvardhanreddy@enterpi.com', password = 'Enter@4321';
        userName = 'defaultuser@enterpi.com', password = 'Enter@4321';
    } else {
        userName = 'defaultuser@enterpi.com', password = 'Enter@4321';
    }
    await expect(allPages.userNameInput).toBeVisible();
    await allPages.userNameInput.fill(userName);
    await allPages.passwordInput.fill(password);
    await allPages.signInButton.click();
    // } else { }
    await expect(allPages.profileIconListView).toBeVisible({ timeout: 50000 });
    await page.waitForTimeout(1600);
}
async function login(page) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    //positive scenario
    let testResult;
    try {
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
            await allPages.userNameInput.fill('defaultuser@enterpi.com');
            await allPages.passwordInput.fill('Enter@4321');
            await allPages.signInButton.click();
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
        await allPages.userNameInput.fill('123defaultuser@enterpi.com');
        console.log('login is displayed logout is working');
        await allPages.passwordInput.fill('Enter@4321');
        await allPages.signInButton.click();
        let text = 'Invalid Email or Password';
        await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
        console.log('getting this ', text, ' invalid email with valid password')
        //valid email with invalid password
        await allPages.userNameInput.fill('defaultuser@enterpi.com');
        await allPages.passwordInput.fill('123Enter@4321');
        await allPages.signInButton.click();
        text = 'Invalid Email or Password';
        await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
        console.log('getting this ', text, ' valid email with invalid password')
        //invalid email with invalid password
        await allPages.userNameInput.fill('123defaultuser@enterpi.com');
        await allPages.passwordInput.fill('123Enter@4321');
        await allPages.signInButton.click();
        text = 'Invalid Email or Password';
        await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
        console.log('getting this ', text, ' Invalid email with invalid password')
        //in valid email and empty password
        await allPages.userNameInput.fill('123defaultuser.com');
        await allPages.passwordInput.fill('');
        await allPages.signInButton.click();
        text = 'Please Enter Valid Email Address';
        await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
        console.log('getting this ', text, ' in valid email format and empty password')
        text = 'Please Enter Password';
        await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
        console.log('getting this ', text, ' in valid email format and empty password')
        //empty email and empty password
        await allPages.userNameInput.fill('');
        await allPages.passwordInput.fill('');
        await allPages.signInButton.click();
        text = 'Please Enter Email Id';
        await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
        console.log('getting this ', text, ' empty email format and empty password')
        text = 'Please Enter Password';
        await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
        console.log('getting this ', text, ' empty email format and empty password')
        //reset or forgott password page
        await page.locator("//*[text() = 'Forgot Password?']").click();
        await expect(allPages.resetPasswordBtn).toBeVisible();
        //verify reset password with un registered mail
        await page.locator("//*[@placeholder = 'Enter Email ID']").fill('sivadara17@gmail.com');
        await allPages.resetPasswordBtn.click();
        text = 'We cannot find an active account linked to the email address that you entered. Please check the email address or contact your system administrator.';
        await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
        await page.waitForTimeout(1500);
        console.log('getting this ', text, ' while verifying reset password with un registered mail');
        //verify reset password with invalid mail
        await page.locator("//*[@placeholder = 'Enter Email ID']").fill('defaultuser.com');
        await allPages.resetPasswordBtn.click();
        text = 'Please Enter Valid Email Address';
        await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
        await page.waitForTimeout(1500);
        console.log('getting this ', text, ' while verifying reset password with invalid mail');
        //verify reset password with empty mail
        text = 'Please Enter Email Id';
        await page.locator("//*[@placeholder = 'Enter Email ID']").fill('');
        await allPages.resetPasswordBtn.click();
        await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
        await page.waitForTimeout(1500);
        console.log('getting this ', text, ' while verifying reset password with empty mail');
        //verify reset password with valid registered mail
        await page.locator("//*[@placeholder = 'Enter Email ID']").fill('defaultuser@enterpi.com');
        await allPages.resetPasswordBtn.click();
        await expect(page.locator("//*[text() = 'Please check your email']")).toBeVisible();
        text = 'An email with password reset instructions has been sent to your email address.';
        await expect(page.locator("//*[text() = '" + text + "']")).toBeVisible();
        await page.locator("(//*[text() = 'keyboard_backspace'])[2]").click();
        await expect(page.getByPlaceholder('Enter Email ID')).toBeVisible();
        console.log('displayed msg ', text, ' while verifying reset password with valid registered mail');
        await page.waitForTimeout(2000);
        testResult = true;
    } catch (error) {
        testResult = false;
        console.log(error);
    }
    return testResult;
}
async function logout(page) {
    await page.locator('//*[@class = "user_image"]').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page.locator('#loginform')).toContainText('Sign In');
}
async function search_user(page, user_email) {
    await allPages.clickAdmin;
    await expect(page.getByText('Users')).toBeVisible();
    await page.locator('#root').getByText('Users').click();
    await expect(page.locator('div').filter({ hasText: /^Edit$/ }).nth(1)).toBeVisible();
    await page.getByPlaceholder('Search').fill(user_email);
    await page.getByText(user_email).first().click();
    await spinner();
    await expect(page.locator("(//*[contains(@class, 'profile')])[1]")).toContainText(user_email);
    await page.getByRole('tab', { name: 'Permissions' }).click();
}
async function save_changes(page, atype, view) {
    await atype.locator("//*[text() = '" + view + "']").click();
    try {
        await page.getByRole('button', { name: 'Save' }).click({ timeout: 2500 });
        await expect(page.getByLabel('Permissions')).toContainText('Are you sure you want to update changes?');
        await page.getByLabel('Permissions').getByRole('button', { name: 'Accept' }).click();
        await expect(page.getByText('Updated Successfully').nth(1)).toBeVisible();
    } catch (error) {

    }
}
async function addCustomerPermissions(page, viewEdit) {
    let getTestResults;
    await search_user(page, 'defaultuser@enterpi.com');
    await page.locator('div').filter({ hasText: /^OrganizationsNoneViewEdit$/ }).locator('span').nth(viewEdit).click();
    try {
        await expect(page.getByRole('button', { name: 'Save' })).toBeVisible({ timeout: 2000 });
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Are you sure you want to')).toBeVisible();
        await page.getByLabel('Permissions').getByRole('button', { name: 'Accept' }).click();
        await expect(page.getByText('Updated Successfully').nth(1)).toBeVisible();
    } catch (error) { }
    await page.goto('https://www.staging-buzzworld.iidm.com/organizations');
    await spinner(page);
    try {
        if (viewEdit == 3) {
            await expect(page.locator("//*[@title = 'Add Customer']").first()).toBeVisible({ timeout: 2000 });
            getTestResults = false;
        } else {
            await delay(page, 2000);
            await expect(page.locator("//*[@title = 'Add Customer']").first()).toBeVisible();
            getTestResults = true;
        }
    } catch (error) {
        if (viewEdit == 3) {
            getTestResults = true;
        } else {
            getTestResults = false;
        }
    }
    return getTestResults;
}
async function admin_permissions(page) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    //-------------------------------------------------------------Account Types Permission----------------------------------------------------------------
    let testResult;
    try {
        await allPages.clickAdmin;
        await spinner(page);
        let urlPath;
        let menu_list = await page.locator("//*[@class = 'user_name']");
        let menu_count = await menu_list.count();
        console.log('menu list count is ' + menu_count);
        for (let index = 1; index <= menu_count; index++) {
            let tab_name = await page.locator("(//*[@class = 'user_name'])[" + index + "]").textContent();
            if (tab_name === 'User Roles' && index === 17) {
                await search_user(page, 'defaultuser@enterpi.com');
                console.log('Users Permissions Not checking');
            } else {
                // console.log('tab name is '+tab_name);
                await search_user(page, 'defaultuser@enterpi.com');
                //acc type with None Permission
                if (index === 16) {
                    tab_name = 'User Roles'
                } else { }
                let acc_type = await page.locator("(//*[@class = 'permission'])[" + index + "]");
                if (index === 9 || index === 10 || index === 11 || index === 12 || index === 13 || index === 14 || index === 15 || index === 16 ||
                    index === 17) {
                    urlPath = await acc_type.locator("(//*[@type = 'radio'][@value = '0'])[" + (index + 1) + "]").getAttribute("name");
                } else if (tab_name === 'Vendors' || tab_name === 'Warehouse' || tab_name === 'Zip Codes') {
                    if (tab_name === 'Zip Codes') {
                        urlPath = await acc_type.locator("(//*[@type = 'radio'][@value = '0'])[" + (index + 3) + "]").getAttribute("name");
                    } else {
                        urlPath = await acc_type.locator("(//*[@type = 'radio'][@value = '0'])[" + (index + 2) + "]").getAttribute("name");
                    }
                    // console.log('url is ', urlPath);
                    // console.log('url is ', index);
                } else {
                    urlPath = await acc_type.locator("(//*[@type = 'radio'][@value = '0'])[" + index + "]").getAttribute("name");
                }
                // ---------------------------------------//-------------------------------------//-----------------------------------------//-------------------------
                // console.log('url path ' + urlPath);
                await save_changes(page, acc_type, 'None');
                await page.goto('https://www.staging-buzzworld.iidm.com/' + urlPath);
                await page.waitForTimeout(2500);
                await expect(page.getByRole('paragraph')).toContainText('Sorry, you do not have permissions to access this page.');
                console.log(tab_name + ' None permission working')
                //acc type with View Permission
                await search_user(page, 'defaultuser@enterpi.com');
                await save_changes(page, acc_type, 'View');
                await page.goto('https://www.staging-buzzworld.iidm.com/' + urlPath);
                await page.waitForTimeout(2000);
                let ver_text;
                if (tab_name === 'QC Forms') {
                    ver_text = await page.locator("(//*[@class = 'qc-form-container'])[2]").textContent();
                } else if (tab_name === 'Quote Approval' || tab_name === 'Terms Conditions' || tab_name === 'User Roles') {
                } else {
                    ver_text = await page.locator("(//*[contains(@class, 'add-Icon')])[1]").textContent();
                }
                console.log('top display text is ' + ver_text);
                if (tab_name === 'Product Category') {
                    if (ver_text == '') {
                        console.log(tab_name + ' View permission working')
                    } else {
                        console.log(tab_name + ' View permission not working')
                    }
                } else if (tab_name === 'Quote Approval') {
                    let is_disable = await page.locator("//*[text() ='Approve']").isEnabled();
                    if (is_disable == false) {
                        console.log(tab_name + ' View permission working')
                    } else {
                        console.log(tab_name + ' View permission not working')
                    }
                } else if (tab_name === 'Terms Conditions') {
                    let is_disable
                    try {
                        await expect(page.locator("//*[text() ='Update']")).toBeVisible({ timeout: 2000 });
                        is_disable = false;
                    } catch (error) {
                        is_disable = true;
                    }
                    if (is_disable) {
                        console.log(tab_name + ' View permission working')
                    } else {
                        console.log(tab_name + ' View permission not working')
                    }
                } else if (tab_name === 'Product Class' || tab_name == 'Warehouse') {
                    if (ver_text.includes('Filters')) {
                        console.log(tab_name + ' View permission working')
                    } else {
                        console.log(tab_name + ' View permission not working')
                    }
                } else if (tab_name === 'QC Forms' || tab_name === 'User Roles') {
                    if (tab_name === 'User Roles') {
                        let isEnable;
                        try {
                            await expect(page.locator("//*[text() = 'Add ']")).toBeVisible({ timeout: 2000 });
                            isEnable = false;
                        } catch (error) {
                            isEnable = true;
                        }
                        if (isEnable) {
                            console.log(tab_name + ' View permission working')
                        } else {
                            console.log(tab_name + ' View permission not working')
                        }
                    } else {
                        if (!ver_text.match('Delete')) {
                            console.log(tab_name + ' View permission working')
                        } else {
                            console.log(tab_name + ' View permission not working')
                        }
                    }
                } else {
                    if (!ver_text.includes('Add')) {
                        console.log(tab_name + ' View permission working')
                    } else {
                        console.log(tab_name + ' View permission not working')
                    }
                }
                //acc type with Edit permission
                await search_user(page, 'defaultuser@enterpi.com');
                await save_changes(page, acc_type, 'Edit');
                await page.goto('https://www.staging-buzzworld.iidm.com/' + urlPath);
                await page.waitForTimeout(2000);
                if (tab_name === 'QC Forms') {
                    ver_text = await page.locator("(//*[@class = 'qc-form-container'])[2]").textContent();
                } else if (tab_name === 'Quote Approval' || tab_name === 'Terms Conditions' || tab_name === 'User Roles') {
                } else {
                    ver_text = await page.locator("(//*[contains(@class, 'add-Icon')])[1]").textContent();
                }
                console.log('top display text is ' + ver_text);
                if (tab_name == 'Product Category') {
                    if (ver_text == '') {
                        console.log(tab_name + ' Edit permission working')
                    } else {
                        console.log(tab_name + ' Edit permission not working')
                    }
                } else if (tab_name == 'Product Class' || tab_name == 'Warehouse') {
                    if (ver_text.includes('Filters')) {
                        console.log(tab_name + ' Edit permission working')
                    } else {
                        console.log(tab_name + ' Edit permission not working')
                    }
                } else if (tab_name == 'Quote Approval') {
                    let is_disable = await page.locator("//*[text() ='Approve']").isEnabled();
                    if (is_disable == true) {
                        console.log(tab_name + ' Edit permission working')
                    } else {
                        console.log(tab_name + ' Edit permission not working')
                    }
                } else if (tab_name == 'Terms Conditions') {
                    let is_disable = await page.locator("//*[text() ='Update']").isEnabled();
                    if (is_disable == true) {
                        console.log(tab_name + ' Edit permission working')
                    } else {
                        console.log(tab_name + ' Edit permission not working')
                    }
                } else if (tab_name === 'QC Forms' || tab_name === 'User Roles') {
                    if (tab_name === 'User Roles') {
                        let isEnable;
                        try {
                            await expect(page.locator("//*[text() = 'Add ']")).toBeVisible({ timeout: 2000 });
                            isEnable = true;
                        } catch (error) {
                            isEnable = false;
                        }
                        if (isEnable) {
                            console.log(tab_name + ' Edit permission working')
                        } else {
                            console.log(tab_name + ' Edit permission not working')
                        }
                    } else {
                        if (ver_text.match('Delete')) {
                            console.log(tab_name + ' Edit permission working')
                        } else {
                            console.log(tab_name + ' Edit permission not working')
                        }
                    }
                } else {
                    if (ver_text.includes('Add')) {
                        console.log(tab_name + ' Edit permission working')
                    } else {
                        console.log(tab_name + ' Edit permission not working')
                    }
                }
                //sync permissions for Product Class
                if (tab_name == 'Product Class' || tab_name == 'Warehouse') {
                    let tab_text, btn_name, btnCount;
                    if (tab_name == 'Product Class') {
                        tab_text = 'product_class';
                        btnCount = 1;
                    } else if (tab_name == 'Users') {
                        tab_text = 'users';
                        btnCount = 2;
                    } else {
                        tab_text = 'warehouse';
                        btnCount = 3;
                    }
                    for (let sync = 0; sync < 2; sync++) {
                        await search_user(page, 'defaultuser@enterpi.com');
                        if (sync == 0) {
                            btn_name = 'No';
                        } else {
                            btn_name = 'Yes';
                        }
                        let pro_cls_sync;
                        if (tab_name === 'Warehouse') {
                            pro_cls_sync = await page.locator("(//*[text() = '" + btn_name + "'])[" + btnCount + "]");
                        } else {

                            pro_cls_sync = await page.locator("(//*[text() = '" + btn_name + "'])[" + btnCount + "]");
                        }
                        await pro_cls_sync.click();
                        try {
                            await page.getByRole('button', { name: 'Save' }).click({ timeout: 2500 });
                            await expect(page.getByLabel('Permissions')).toContainText('Are you sure you want to update changes?');
                            await page.getByLabel('Permissions').getByRole('button', { name: 'Accept' }).click();
                            await expect(page.getByText('Updated Successfully').nth(1)).toBeVisible();
                        } catch (error) {

                        }
                        await page.goto('https://www.staging-buzzworld.iidm.com/' + urlPath);
                        await page.waitForTimeout(2500);
                        ver_text = await page.locator("(//*[contains(@class, 'add-Icon')])[1]").textContent();
                        let top_display_text;
                        if (sync == 1) {
                            top_display_text = 'FiltersSync';
                        } else {
                            top_display_text = 'Filters';
                        }

                        if (ver_text == top_display_text) {
                            console.log(tab_name + ' Sync ' + btn_name + ' permission working')
                        } else {
                            console.log(tab_name + ' Sync ' + btn_name + ' Permission not working')
                        }
                    }
                } else {

                }
            }
        }
        testResult = true;
    } catch (error) {
        testResult = false;
    }
    return testResult;
}
async function pricing_permissions(page) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let modules = ['Discount Codes', 'Non Standard Pricing', 'Pricing'];
    let testResult;
    try {
        let count = 0;
        for (let index = 29; index < 32; index++) {
            let btnCount, urlPath;
            await search_user(page, 'defaultuser@enterpi.com');
            //Discount Codes with None Permission
            let tab_name = modules[count];
            console.log('tab name ' + tab_name);
            if (tab_name === 'Discount Codes') {
                btnCount = 21;
                urlPath = 'discount-codes';
            } else if (tab_name === 'Non Standard Pricing') {
                btnCount = 22;
                urlPath = 'special-pricing';
            } else {
                btnCount = 23;
                urlPath = 'pricing';
            }
            let acc_type = await page.locator("(//*[@class = 'permission'])[" + index + "]");
            await save_changes(page, acc_type, 'None');
            await page.goto('https://www.staging-buzzworld.iidm.com/' + urlPath);
            await page.waitForTimeout(3000);
            await expect(page.getByRole('paragraph')).toContainText('Sorry, you do not have permissions to access this page.');
            console.log(tab_name + ' None permission working');
            //Discount Codes with View Permission
            await search_user(page, 'defaultuser@enterpi.com');
            await save_changes(page, acc_type, 'View');
            await page.goto('https://www.staging-buzzworld.iidm.com/' + urlPath);
            await page.waitForTimeout(3000);
            let ver_text, result;
            if (tab_name === 'Discount Codes') {
                ver_text = await page.locator("(//*[contains(@class, 'Button-Icon-Display')])[1]").textContent();
                try {
                    await expect(page.locator("//*[text() = 'Multi Edit']")).toBeVisible({ timeout: 2000 });
                    result = false;
                } catch (error) {
                    result = true;
                    try {
                        await expect(page.locator("//*[text() = 'Add']")).toBeVisible({ timeout: 2000 });
                        result = false;
                    } catch (error) {
                        result = true;
                    }
                }
            } else if (tab_name === 'Non Standard Pricing') {
                ver_text = await page.locator('//*[@id="root"]/div/div[3]/div[1]/div[2]').textContent();
                result = !ver_text.match('Configure');
            } else {
                ver_text = await page.locator("(//*[contains(@class, 'Button-Icon-Display')])[1]").textContent();
                try {
                    await expect(page.locator("//*[text() = 'Import']")).toBeVisible({ timeout: 2000 });
                    result = false;
                } catch (error) {
                    result = true;
                    try {
                        await expect(page.locator("//*[text() = 'Add']")).toBeVisible({ timeout: 2000 });
                        result = false;
                    } catch (error) {
                        result = true;
                    }
                }
            }
            console.log('top display text is ' + ver_text);
            if (result) {
                console.log(tab_name + ' View permission working');
            } else {
                console.log(tab_name + ' View permission not working');
            }
            //Discount Codes with Edit Permission
            await search_user(page, 'defaultuser@enterpi.com');
            await save_changes(page, acc_type, 'Edit');
            await page.goto('https://www.staging-buzzworld.iidm.com/' + urlPath);
            await page.waitForTimeout(3000);
            if (tab_name === 'Discount Codes') {
                ver_text = await page.locator("(//*[contains(@class, 'Button-Icon-Display')])[1]").textContent();
                result = ver_text.includes('Multi Edit') && ver_text.includes('Add');
            } else if (tab_name == 'Non Standard Pricing') {
                ver_text = await page.locator('//*[@id="root"]/div/div[3]/div[1]/div[2]').textContent();
                result = (ver_text == 'Configure');
            } else {
                ver_text = await page.locator("(//*[contains(@class, 'Button-Icon-Display')])[1]").textContent();
                result = ver_text.includes('Import') && ver_text.includes('Add');
            }
            console.log('top display text is ' + ver_text);
            if (result) {
                console.log(tab_name + ' Edit permission working')
            } else {
                console.log(tab_name + ' Edit permission not working')
            }
            let btn_name;
            //Export
            let exp_imp;
            for (let sync = 0; sync < 2; sync++) {
                await search_user(page, 'defaultuser@enterpi.com');
                if (sync === 0) {
                    btn_name = 'No';
                } else {
                    btn_name = 'Yes';
                }
                await page.waitForTimeout(1600);
                let pro_cls_sync = await page.locator("(//*[text() = '" + btn_name + "'])[" + btnCount + "]");
                await pro_cls_sync.click();
                try {
                    await page.getByRole('button', { name: 'Save' }).click({ timeout: 2500 });
                    await expect(page.getByLabel('Permissions')).toContainText('Are you sure you want to update changes?');
                    await page.getByLabel('Permissions').getByRole('button', { name: 'Accept' }).click();
                    await expect(page.getByText('Updated Successfully').nth(1)).toBeVisible();
                } catch (error) {

                }
                await page.goto('https://www.staging-buzzworld.iidm.com/' + urlPath);
                await page.waitForTimeout(3000);
                let result;
                if (tab_name === 'Discount Codes') {
                    exp_imp = 'Export';
                    ver_text = await page.locator("(//*[contains(@class, 'Button-Icon-Display')])[1]").textContent();
                    if (sync === 0) {
                        try {
                            await expect(page.locator("//*[text() = '" + exp_imp + "']")).toBeVisible({ timeout: 2000 });
                            result = false;
                        } catch (error) {
                            result = true;
                        }
                    } else {
                        try {
                            await expect(page.locator("//*[text() = '" + exp_imp + "']")).toBeVisible({ timeout: 2000 });
                            result = true;
                        } catch (error) {
                            result = false;
                        }
                    }
                } else if (tab_name === 'Non Standard Pricing') {
                    exp_imp = 'Export';
                    await page.locator("(//*[@class = 'card-title'])[1]").click();
                    ver_text = await page.locator("//*[contains(@class, 'sp-preview-header')]").textContent();
                    if (sync === 0) {
                        try {
                            await expect(page.locator("//*[text() = '" + exp_imp + "']")).toBeVisible({ timeout: 2000 });
                            result = false;
                        } catch (error) {
                            result = true;
                        }
                    } else {
                        try {
                            await expect(page.locator("//*[text() = '" + exp_imp + "']")).toBeVisible({ timeout: 2000 });
                            result = true;
                        } catch (error) {
                            result = false;
                        }
                    }
                    await page.goBack();
                } else {
                    exp_imp = 'Export';
                    ver_text = await page.locator("(//*[contains(@class, 'Button-Icon-Display')])[1]").textContent();
                    if (sync === 0) {
                        try {
                            await expect(page.locator("//*[text() = '" + exp_imp + "']")).toBeVisible({ timeout: 2000 });
                            result = false;
                        } catch (error) {
                            result = true;
                        }
                    } else {
                        try {
                            await expect(page.locator("//*[text() = '" + exp_imp + "']")).toBeVisible({ timeout: 2000 });
                            result = true;
                        } catch (error) {
                            result = false;
                        }
                    }
                    // Import 
                    await search_user(page, 'defaultuser@enterpi.com');
                    if (sync === 0) {
                        btn_name = 'No';
                    } else {
                        btn_name = 'Yes';
                    }
                    await page.waitForTimeout(1600);
                    let pro_cls_sync = await page.locator("(//*[text() = '" + btn_name + "'])[" + (btnCount + 1) + "]");
                    await pro_cls_sync.click();
                    try {
                        await page.getByRole('button', { name: 'Save' }).click({ timeout: 2500 });
                        await expect(page.getByLabel('Permissions')).toContainText('Are you sure you want to update changes?');
                        await page.getByLabel('Permissions').getByRole('button', { name: 'Accept' }).click();
                        await expect(page.getByText('Updated Successfully').nth(1)).toBeVisible();
                    } catch (error) {

                    }
                    await page.goto('https://www.staging-buzzworld.iidm.com/' + urlPath);
                    await page.waitForTimeout(3000);
                    let status;
                    ver_text = await page.locator("(//*[contains(@class, 'Button-Icon-Display')])[1]").textContent();
                    if (sync === 0) {
                        try {
                            await expect(page.locator("//*[text() = 'Import']")).toBeVisible({ timeout: 2000 });
                            status = false;
                        } catch (error) {
                            status = true;
                        }
                    } else {
                        try {
                            await expect(page.locator("//*[text() = 'Import']")).toBeVisible({ timeout: 2000 });
                            status = true;
                        } catch (error) {
                            status = false;
                        }
                    }
                    if (status === true) {
                        console.log(tab_name + ' Import ' + btn_name + ' permission working')
                    } else if (status === false) {
                        console.log(tab_name + ' Import ' + btn_name + ' Permission not working')
                    }
                }
                ////////////////////////////
                if (result) {
                    console.log(tab_name + ' ' + exp_imp + ' ' + btn_name + ' permission working')
                } else {
                    console.log(tab_name + ' ' + exp_imp + ' ' + btn_name + ' Permission not working')
                }
            }
            count = count + 1;
        }
        testResult = true;
    } catch (error) {
        testResult = false;
    }
    return testResult;
}
async function admin3(page) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
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
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
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
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let tabList = ['All Quotes', 'Parts Quotes', 'Repair Quotes', 'System Quotes', 'Expired Quotes', 'Archived Quotes', 'Waiting On Me', 'Quoted By Me'];
    await page.getByText('Quotes').click();
    for (let index = 0; index < 8; index++) {
        // await expect(await page.locator('#root').getByText(tabList[index])).toBeVisible();
        await expect(await page.locator("(//*[text() = '" + tabList[index] + "'])[1]")).toBeVisible();
        await page.locator("(//*[text() = '" + tabList[index] + "'])[1]").click();
        let list_status = false;
        //verify list view
        try {
            await expect(allPages.profileIconListView).toBeVisible();
            list_status = true;
        } catch (error) {
            list_status = false;
        }
        if (list_status) {
            await page.waitForTimeout(1100);
            await allPages.profileIconListView.click();
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
            await expect(allPages.profileIconListView).toBeVisible();
            list_status = true;
        } catch (error) {
            list_status = false;
        }
        if (list_status) {
            await page.waitForTimeout(1100);
            await allPages.profileIconListView.click();
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
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let res;
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
        console.log("vendor is ", vendor);
        res = true;
    } catch (error) {
        console.log('getting error while searching vendor in left menu at pricing ', error);
        await page.screenshot({ path: 'files/vendor_search_pricing_error.png', fullPage: true });
        res = false;
    }
    return res;
}
async function add_dc(page, condition) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let res;
    try {
        await expect(page.getByRole('button', { name: 'Pricing' })).toBeVisible();
        await page.getByRole('button', { name: 'Pricing' }).click();
        await page.getByRole('menuitem', { name: 'Discount Codes' }).click();
        await expect(page.getByRole('heading', { name: 'Discount Codes' })).toBeVisible();
        //getting vendor from testdat json file
        await page.getByPlaceholder('Search', { exact: true }).fill(testdata.vendor);
        await expect(page.getByText(testdata.vendor)).toBeVisible();
        await page.waitForTimeout(2500);
        await expect(page.getByLabel('open')).toBeVisible();
        await page.getByLabel('open').click();
        await page.keyboard.insertText('Default');
        await page.waitForTimeout(2000);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2300);
        await page.locator('.button-icon-text').click();
        await expect(page.getByPlaceholder('Our Price')).toBeVisible();
        let dc;
        if (condition === 'duplicate') {
            dc = 'P022';
        } else {
            //getting discount code from testdat json file
            dc = testdata.dc_new;
        }
        await page.getByPlaceholder('Discount Code', { exact: true }).fill(dc);
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
        if (condition === 'duplicate') {
            await expect(page.locator("//*[text() = 'The Discount Code already exists']")).toBeVisible();
            console.log('Displaying valiadtion for duplicate discount codes');
            await page.getByTitle('close').getByRole('img').click();
        } else {
            await expect(page.getByRole('button', { name: 'Add Discount Code' })).toBeHidden({ timeout: 5000 });
            await page.getByPlaceholder('Search By Discount Code').fill(dc);
            await expect(page.locator("//*[text() = '" + dc + "']")).toBeHidden({ timeout: 5000 });
            await page.waitForTimeout(2300);
            console.log("added discount code is ", testdata.dc_new);
        }
        res = true;
    } catch (error) {
        console.log('getting error while adding discount code ', error);
        await page.screenshot({ path: 'files/add_dc_error.png', fullPage: true });
        await page.getByTitle('close').getByRole('img').click();
        await page.waitForTimeout(1800);
        res = false;
    }
    return res;
}
async function addDiscountCodeValidations(page, condition) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let ourPrice, MRO, OEM, RS, res;
    try {
        if (condition === 'emptyValues') {
            ourPrice = '', MRO = '', OEM = '', RS = '';
        } else {
            ourPrice = 'dsfdfg', MRO = 'fgfdg', OEM = 'dfsgdg', RS = 'dfgdz';
        }
        await page.waitForTimeout(2000);
        await page.locator('.button-icon-text').click();
        await expect(page.getByPlaceholder('Our Price')).toBeVisible();
        await page.getByPlaceholder('Discount Code', { exact: true }).fill('');
        await page.getByPlaceholder('Description').fill('');
        await page.getByPlaceholder('Our Price').fill(ourPrice);
        await page.getByPlaceholder('MRO').fill(MRO);
        await page.getByPlaceholder('OEM').fill(OEM);
        await page.getByPlaceholder('RS').fill(RS);
        await page.getByRole('button', { name: 'Add Discount Code' }).click();
        await page.waitForTimeout(1800);
        if (condition === 'emptyValues') {
            await expect(page.locator("//*[text() = 'Please enter Discount Code']")).toBeVisible();
            await expect(page.locator("//*[text() = 'Please select Start Date']")).toBeVisible();
            await expect(page.locator("//*[text() = 'Please select End Date']")).toBeVisible();
            await expect(page.locator("//*[text() = 'Please select  Quantity']")).toBeVisible();
            await expect(page.locator("//*[text() = 'Please enter Our Price']")).toBeVisible();
            await expect(page.locator("//*[text() = 'Please enter MRO']")).toBeVisible();
            await expect(page.locator("//*[text() = 'Please enter OEM']")).toBeVisible();
            await expect(page.locator("//*[text() = 'Please enter RS']")).toBeVisible();
            console.log('Displaying validation for all fields are empty');
        } else {
            await expect(page.locator("(//*[text() = 'Please enter valid number'])[1]")).toBeVisible();
            await expect(page.locator("(//*[text() = 'Please enter valid number'])[2]")).toBeVisible();
            await expect(page.locator("(//*[text() = 'Please enter valid number'])[3]")).toBeVisible();
            await expect(page.locator("(//*[text() = 'Please enter valid number'])[4]")).toBeVisible();
            console.log('Displaying validation for In valid Multiplier values');
        }
        await page.getByTitle('close').getByRole('img').click();
        await page.waitForTimeout(1800);
        res = true;
    } catch (error) {
        res = false;
        console.log(error);
    }
    return res;
}
async function update_dc(page, cond) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let res;
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
        if (cond === 'emptyValues') {
            await page.getByPlaceholder('Description').click();
            await page.getByPlaceholder('Description').press('Control+a');
            await page.getByPlaceholder('Description').fill('');
            await page.getByPlaceholder('Our Price').fill('');
            await page.getByPlaceholder('MRO').fill('');
            await page.getByPlaceholder('OEM').fill('');
            await page.getByPlaceholder('RS').fill('');
            await page.getByLabel('clear').first().click();
            await page.getByLabel('clear').click();
            await page.getByRole('button', { name: 'Update Discount Code' }).click();
            await expect(page.getByText('Please select Start Date')).toBeVisible();
            await expect(page.getByText('Please select End Date')).toBeVisible();
            await expect(page.getByText('Please enter Our Price')).toBeVisible();
            await expect(page.getByText('Please enter MRO')).toBeVisible();
            await expect(page.getByText('Please enter OEM')).toBeVisible();
            await expect(page.getByText('Please enter RS')).toBeVisible();
            console.log('Displaying Validations for All Fields are Empty...');
            await page.getByTitle('close').getByRole('img').click();
            await page.waitForTimeout(1800);
            res = true;
        } else if (cond === 'inValidMultipliers') {
            await page.getByPlaceholder('Our Price').fill('test&(&((797');
            await page.getByPlaceholder('MRO').fill('heloo676&(*');
            await page.getByPlaceholder('OEM').fill('hkjhkjhk');
            await page.getByPlaceholder('RS').fill('lmnopqrstuvwxyz');
            await page.getByRole('button', { name: 'Update Discount Code' }).click();
            await expect(page.getByText('Please enter valid number').first()).toBeVisible();
            await expect(page.getByText('Please enter valid number').nth(1)).toBeVisible();
            await expect(page.getByText('Please enter valid number').nth(2)).toBeVisible();
            await expect(page.getByText('Please enter valid number').nth(3)).toBeVisible();
            console.log('Displaying Validations for In Valid Multiplier Values...');
            await page.getByTitle('close').getByRole('img').click();
            await page.waitForTimeout(1500);
            res = true;
        } else {
            let po = await page.getByPlaceholder('Our Price').getAttribute('value');
            let poValue = parseFloat(po);
            await page.getByPlaceholder('Our Price').fill(((poValue + 0.09).toFixed(2)).toString());
            await page.getByRole('button', { name: 'Update Discount Code' }).press('Enter');
            await expect(page.locator('#root')).toContainText('Updated Successfully');
            await expect(page.locator('(//*[text()= "' + ((poValue + 0.09).toFixed(2)) + '"])[1]')).toBeVisible();
            await page.waitForTimeout(1600)
            console.log("updated discount code is ", testdata.dc_new);
            res = true;
        }
    } catch (error) {
        console.log('getting error while updating discount code ', error);
        await page.screenshot({ path: 'files/update_dc_error.png', fullPage: true });
        await page.getByTitle('close').getByRole('img').click();
        await page.waitForTimeout(1800);
        res = false;
    }
    return res;
}
async function multi_edit(page, dc) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
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
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let res;
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
        res = true;
    } catch (error) {
        console.log('getting error while adding stock code ', error);
        await page.screenshot({ path: 'files/add_stock_code_error.png', fullPage: true });
        await page.getByTitle('close').getByRole('img').click();
        res = false;
    }
    return res;
}
async function update_sc(page) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
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
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
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
async function createRMA(page, acc_num, cont_name) {
    await page.locator("//*[text()='Repairs']").first().click();
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
}
async function itemsAddToEvaluation(page, stock_code, tech, repair_type) {
    for (let index = 0; index < stock_code.length; index++) {
        await page.getByText('Add Items').click();
        await page.getByPlaceholder('Search By Part Number').fill(stock_code[index]);
        await spinner(page)
        let res = false;
        try {
            await expect(page.locator('//*[text() = "? Click here to add them"]')).toBeVisible({ timeout: 4000 });
            res = true;
        } catch (error) {
            console.log(error)
            res = false;
        }
        if (res) {
            //Add New Part
            await add_new_part(page, stock_code[index]);
        } else {
            await page.locator("//*[contains(@class,'data repair_grid')]/div/div/label").click();
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
        await page.getByPlaceholder('Type here').fill('Internal Item Notes Assign Location');
        await page.getByRole('button', { name: 'Update Location' }).click();
        //Assign Technician
        await expect(page.locator('#repair-items')).toContainText('Assign Technician');
        await page.getByText('Assign Technician').click();
        await page.getByText('Select').click();
        await page.keyboard.insertText(tech);
        await page.keyboard.press('Enter');
        // await page.getByText(tech, { exact: true }).nth(1).click();
        await page.getByPlaceholder('Type here').fill('Internal Item Notes Assign Technician');
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
        await page.getByPlaceholder('Type here').fill('Internal Item Notes Item Evaluation');
        await page.getByRole('button', { name: 'Update Evaluation' }).hover();
        await page.getByRole('button', { name: 'Update Evaluation' }).click();
    }
    await page.waitForTimeout(2800);
}
async function addItemsToQuote(page) {
    // Add Items to Quote
    await page.reload();
    await page.waitForTimeout(4000);
    let checkbox = await page.locator('#repair-items label');
    let checkBoxCount = await checkbox.count();
    console.log('count is ', checkBoxCount);
    for (let i = 0; i < checkBoxCount; i++) {
        let check;
        if (checkBoxCount > 1) {
            if (i == 0) {
                check = await page.locator('#repair-items label').first();
            } else {
                check = await page.locator('#repair-items label').nth(i);
            }
        } else {
            check = await page.locator('#repair-items label').first();
        }
        if (await check.isChecked()) {
            console.log('check box already selected');
        } else {
            await check.click();
        }
    }
    await page.getByRole('button', { name: 'Add items to quote' }).click();
    await expect(page.locator('#root')).toContainText('Are you sure you want to add these item(s) to quote ?');
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.locator('#repair-items')).toContainText('Quote Items');
}
async function create_job_repairs(page, is_create_job, repair_type, acc_num, cont_name, stock_code, tech) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    // let acc_num = 'ENGYS00', cont_name = 'Jannice Carrillo', stock_code = 'EW25-104-20';
    // let tech = 'Michael Strothers';
    // await page.goto('https://www.staging-buzzworld.iidm.com/quote_for_repair/9696c583-5a0a-4096-88eb-27f835224230');
    let testResult;
    try {
        //Verifying Total Repairs Count
        await page.getByText('Repairs').first().click();
        await expect(allPages.profileIconListView).toBeVisible();
        await page.waitForTimeout(2000);
        let repCount;
        repCount = await page.textContent("//*[contains(@id, 'row-count')]");
        console.log('Before creating Repair Totals Repair count is: ', repCount);
        //RMA creation
        await createRMA(page, acc_num, cont_name);
        await expect(page.locator('#repair-items')).toContainText('Repair item(s) Not Available');
        let rep = await page.locator('(//*[@class = "id-num"])[1]').textContent();
        let repair_id = rep.replace("#", "");
        console.log('repair is created with id ', repair_id);
        console.log('repair url is ', await page.url());
        //Add items to items evaluation in repair
        await itemsAddToEvaluation(page, stock_code, tech, repair_type)
        await page.pause()
        //Add Repair Items to Quote
        await addItemsToQuote(page)
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
        await expect(page.locator('#root')).toContainText('Submit for Customer Approval');
        await page.locator('//*[@id="root"]/div/div[3]/div[1]/div[1]/div/div[2]/div[1]/div[3]/div/button').click();
        await expect(page.getByRole('menuitem')).toContainText('Delivered to Customer');
        await page.getByRole('menuitem', { name: 'Delivered to Customer' }).click();
        //Won the Quote
        await expect(page.locator('#root')).toContainText('Won');
        await page.getByRole('button', { name: 'Won' }).click();
        await expect(page.locator('#root')).toContainText('Are you sure you want to mark it as approve ?');
        await page.getByRole('button', { name: 'Proceed' }).first().click();
        let itemsCount = await page.locator("(//*[text()= 'Quote:'])").count({ timeout: 2000 });
        console.log('Items Count is ', itemsCount);
        // //Create Sales Order
        await page.pause();
        await expect(page.locator('#root')).toContainText('Create Sales Order');
        await page.getByText('Create Sales Order').click();
        await expect(page.getByPlaceholder('Enter PO Number')).toBeVisible();
        try {
            // await expect(page.locator("(//*[contains(text(), 'Item') or contains(text(), 'Stock Code')])")).toBeVisible();
            await expect(page.locator("(//*[text() = 'Create'])[2]")).toBeVisible();
        } catch (error) {
            console.log('error diplaying Item or Stock Code test at Create Sales Order Screen', error);
        }
        await page.getByPlaceholder('Enter PO Number').fill('543534534');
        let ship_text = await page.locator("(//*[contains(@class, 'react-select__value-container')])[2]").textContent();
        if (ship_text == 'Select Shipping Instructions') {
            await page.getByText('Select Shipping Instructions').click();
            await page.getByLabel('Order Date*').fill('u');
            await page.getByText('UPS GRD COLLECT', { exact: true }).click();
        } else {
        }
        let res1 = false;
        for (let w = 0; w < itemsCount; w++) {
            try {
                if (itemsCount >= 1) {
                    if (w == 0) {
                        await expect(page.locator("(//*[text() = 'Warehouse'])").first()).toBeHidden({ timeout: 3000 });
                    } else {
                        await expect(page.locator("(//*[text() = 'Warehouse'])").nth(w)).toBeHidden({ timeout: 3000 });
                    }
                } else {
                    await expect(page.locator("(//*[text() = 'Warehouse'])").first()).toBeHidden({ timeout: 3000 });
                }
                res1 = true;
            } catch (error) {
                res1 = false;
            }
            if (res1) {
                await page.locator('(//*[contains(@src, "addIcon")])[1]').click();
                await expect(page.getByRole('dialog')).toContainText('Add Stock Line Items');
                await page.getByRole('dialog').getByLabel('open').first().click();
                await page.keyboard.press('Enter');
                let desc = await page.getByPlaceholder('Enter Stock Description');
                if (await desc.getAttribute('value') == '') {
                    desc.fill('Manually Added');
                } else {
                }
                await page.getByRole('button', { name: 'Add' }).click();
                await expect(page.locator("(//*[text() = 'Create Job'])[" + (w + 1) + "]")).toBeVisible();
                await page.waitForTimeout(2000);
            } else {
            }
            if (itemsCount >= 1) {
                if (w == 0) {
                    await expect(page.getByRole('button', { name: 'Create', exact: true }).first()).toBeVisible();
                } else {
                    await expect(page.getByRole('button', { name: 'Create', exact: true }).nth(w)).toBeVisible();
                }
            } else {
                await expect(page.getByRole('button', { name: 'Create', exact: true }).first()).toBeVisible();
            }
        }
        let createJobCheck;
        let is_checked;
        await page.waitForTimeout(1500);
        let createJobCount = await await page.locator('label').filter({ hasText: 'Create Job' }).count();
        console.log('create job check box count is ', createJobCount);;
        for (let j = 0; j < createJobCount; j++) {
            if (createJobCount >= 1) {
                if (j == 0) {
                    is_checked = await page.locator('label').filter({ hasText: 'Create Job' }).first().isChecked();
                } else {
                    is_checked = await page.locator('label').filter({ hasText: 'Create Job' }).nth(j).isChecked();
                }
            } else {
                is_checked = await page.locator('label').filter({ hasText: 'Create Job' }).first().isChecked();
            }

            if (is_create_job == 'Y') {
                if (is_checked) {
                    if (createJobCount >= 1) {
                        if (j == 0) {
                            createJobCheck = await page.locator('label').filter({ hasText: 'Create Job' }).first();
                        } else {
                            createJobCheck = await page.locator('label').filter({ hasText: 'Create Job' }).nth(j);
                        }
                    } else {
                        createJobCheck = await page.locator('label').filter({ hasText: 'Create Job' }).first();
                    }
                } else {
                    if (createJobCount >= 1) {
                        if (j == 0) {
                            createJobCheck = await page.locator('label').filter({ hasText: 'Create Job' }).first();
                        } else {
                            createJobCheck = await page.locator('label').filter({ hasText: 'Create Job' }).nth(j);
                        }
                    } else {
                        createJobCheck = await page.locator('label').filter({ hasText: 'Create Job' }).first();
                    }
                    await createJobCheck.click();
                }
            } else if (is_create_job == 'N') {
                if (is_checked) {
                    if (createJobCount >= 1) {
                        if (j == 0) {
                            createJobCheck = await page.locator('label').filter({ hasText: 'Create Job' }).first();
                        } else {
                            createJobCheck = await page.locator('label').filter({ hasText: 'Create Job' }).nth(j);
                        }
                    } else {
                        createJobCheck = await page.locator('label').filter({ hasText: 'Create Job' }).first();
                    }
                    await createJobCheck.click();
                } else {
                    if (createJobCount >= 1) {
                        if (j == 0) {
                            createJobCheck = await page.locator('label').filter({ hasText: 'Create Job' }).first();
                        } else {
                            createJobCheck = await page.locator('label').filter({ hasText: 'Create Job' }).nth(j);
                        }
                    } else {
                        createJobCheck = await page.locator('label').filter({ hasText: 'Create Job' }).first();
                    }
                }
            }
            is_checked = await createJobCheck.isChecked();
        }
        await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Create', exact: true }).click();
        try {
            //update warehouse if needed
            await expect(page.locator("//*[contains(text(),  'not stocked in warehouse')]")).toBeVisible({ timeout: 6000 });
            await warehouse_update(page, stock_code);
            await page.getByRole('button', { name: 'Create', exact: true }).click();
        } catch (error) {

        }
        await expect(page.getByRole('heading', { name: 'Sales Order Information' })).toBeVisible();
        //
        let soid = await page.locator('(//*[@class = "id-num"])[1]').textContent();
        let order_id = soid.replace("#", "");
        console.log('order created with id ', order_id);
        if (is_create_job == 'Y') {
            console.log("job selection checkbox is checked ", is_checked);
            let job_id;
            if (itemsCount >= 1) {
                job_id = await page.locator('(//*[@role = "presentation"])[8]');
            } else {
                job_id = await page.locator('(//*[@role = "presentation"])[7]');
            }
            let job_num = await job_id.textContent();
            console.log('job created with id ', job_num);
            if (itemsCount >= 1) {
                let job_id2 = await page.locator('(//*[@role = "presentation"])[7]');
                let job_num2 = await job_id2.textContent();
                console.log('second job created with id ', job_num2);
            }
            await job_id.click();
            await expect(page.getByRole('heading', { name: 'Job Information' })).toBeVisible();
            let job_status = await page.locator("(//*[contains(@class, 'description')])[3]").textContent();
            let work_hours = await page.locator('//*[@id="root"]/div/div[4]/div/div[2]/div[3]/div/div[1]/h3/span').textContent();
            //create parts purchase from repair.
            let ppId = await create_parts_purchase(page, false, repair_id);
            //update parts purchase status to received and completed
            await rep_complete(page, repair_id, job_status, tech, job_num, work_hours, ppId[1]);
        } else {
            console.log("job selection checkbox is checked ", is_checked);
        }
        testResult = true;
    } catch (error) {
        testResult = false;
        console.error(error);
    }
    //Verifying Total Repairs Count
    await page.getByText('Repairs').first().click();
    await expect(allPages.profileIconListView).toBeVisible();
    await page.waitForTimeout(2000);
    let repCount;
    repCount = await page.textContent("//*[contains(@id, 'row-count')]");
    console.log('After creating Repair Totals Repair count is: ', repCount);
    return testResult;
}
async function rep_complete(page, rep_id, job_sta, tech, job_num, work_hours, ppId) {
    //updating pp status to Ordered
    await page.locator('(//*[@class = "pi-label-edit-icon"])[1]').click();
    await page.getByLabel('Open').click();
    await page.keyboard.insertText('Ordered');
    await page.keyboard.press('Enter');
    await page.getByTitle('Save Changes').click();
    await expect(page.locator("(//*[text() = 'Ordered'])[2]")).toBeVisible();
    await page.locator("(//*[text() = '" + rep_id + "'])[1]").click();
    await spinner();
    await expect(page.locator("(//*[text() = 'Parts Ordered'])[1]")).toBeVisible();
    await expect(page.locator("(//*[text() = 'Parts Ordered'])[2]")).toBeVisible();
    await page.locator("(//*[text() = '" + ppId + "'])[1]").click();
    console.log(ppId + ' is updated to Ordered');
    await spinner();
    //updating pp status to Received
    await page.locator('(//*[@class = "pi-label-edit-icon"])[1]').click();
    await page.getByLabel('Open').click();
    await page.keyboard.insertText('Partially Received');
    await page.keyboard.press('Enter');
    await page.getByTitle('Save Changes').click();
    await expect(page.locator("//*[text() = 'Items Information']")).toBeVisible();
    await page.locator("//*[text() = 'Submit']").click();
    await expect(page.locator("//*[text() = 'Received']")).toBeVisible();
    await page.locator("(//*[text() = '" + rep_id + "'])[1]").click();
    await spinner();
    await expect(page.locator("(//*[text() = 'Parts Received'])[1]")).toBeVisible();
    await expect(page.locator("(//*[text() = 'Parts Received'])[2]")).toBeVisible();
    await page.locator("(//*[text() = '" + ppId + "'])[1]").click();
    console.log(ppId + ' is updated to Partially Received');
    await spinner();
    //updating pp status to Received and Completed
    await page.locator('(//*[@class = "pi-label-edit-icon"])[1]').click();
    await page.getByLabel('Open').click();
    await page.keyboard.insertText('Received and Completed');
    await page.keyboard.press('Enter');
    await page.getByTitle('Save Changes').click();
    await expect(page.locator("(//*[text() = 'Received and Completed'])[2]")).toBeVisible();
    await page.locator("(//*[text() = '" + rep_id + "'])[1]").click();
    await spinner();
    await expect(page.locator("(//*[text() = 'Parts Received'])[1]")).toBeVisible();
    await expect(page.locator("(//*[text() = 'Parts Received'])[2]")).toBeVisible();
    console.log(ppId + ' is updated to Received and Completed.');
    let time_entry_status = false;
    try {
        //verifying time entry icon is displayed or not
        await expect(page.locator("(//*[contains(@src, 'Add_time')])[1]")).toBeVisible({ timeout: 8000 });
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
    await page.getByText('Mark as In Progress').first().click();
    await expect(page.locator('#root')).toContainText('Are you sure you want to move this item to Repair In Progress?');
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.locator('#repair-items')).toContainText('In Progress');
    console.log(rep_id + '- 1 is In Progress');
    //Repair Summary
    await page.locator("//*[contains(@src, 'repair_summary')]").click();
    await page.getByLabel('open').click();
    await page.getByText('Bench tested', { exact: true }).click();
    await page.getByText('Entered parameters', { exact: true }).click();
    await page.getByText('Extracted parameters', { exact: true }).click();
    await page.keyboard.press('Escape');
    await page.getByPlaceholder('Enter Repair Summary Notes').fill('Test Repair Summary Notes to Customer');
    await page.getByPlaceholder('Type here').fill('Test Internal Item Notes in Repair Summary Page');
    await page.getByRole('button', { name: 'Save' }).click();
    //Assign to QC
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
    //Updating QC status
    await page.locator('div:nth-child(6) > .action-item').first().click();
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
    //Changing Repair Item status to Completed
    await page.getByRole('button', { name: 'loading Change Status' }).click();
    await page.getByRole('menuitem', { name: 'Completed' }).click();
    await expect(page.locator('#root')).toContainText('Are you sure you want to mark it as Completed ?');
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.locator('#repair-items')).toContainText('Completed');
    console.log(rep_id + '- 1 is completed');
}
async function createQuote(page, acc_num, quote_type) {
    await allPages.headerQuotesTab.click();
    await expect(allPages.profileIconListView).toBeVisible();
    await allPages.createQuoteAtQuotesLV.click();
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
    await expect(page.locator('#repair-items')).toContainText('Add Items');
}
async function selectRFQDateandQuoteRequestedBy(page, cont_name) {
    await page.locator('(//*[@class = "pi-label-edit-icon"])[2]').click();
    await page.getByRole('button', { name: 'Now' }).click();
    await page.getByTitle('Save Changes').click();
    await page.locator('(//*[@class = "pi-label-edit-icon"])[4]').click();
    await page.getByLabel('open').click();
    await page.keyboard.insertText(cont_name);
    try {
        await expect(await page.locator("//*[@style = 'animation-delay: 0ms;']")).toBeVisible({ timeout: 2000 });
        await expect(await page.locator("//*[@style = 'animation-delay: 0ms;']")).toBeHidden();
    } catch (error) { }
    await page.keyboard.press("Enter");
    await page.getByTitle('Save Changes').click();
    await page.waitForTimeout(2000);
}
async function addItesms(page, stock_code, quote_type) {
    for (let index = 0; index < stock_code.length; index++) {

        await page.getByText('Add Items').click();
        await page.getByPlaceholder('Search By Part Number').click();
        await page.getByPlaceholder('Search By Part Number').fill(stock_code[index]);
        await spinner(page);
        let res = false;
        try {
            await expect(page.locator("(//*[text() = 'Items Not Available'])[1]")).toBeVisible({ timeout: 2300 });
            res = true;
        } catch (error) {
            // console.log(error);
            res = false;
        }
        if (res) {
            await page.getByRole('tab', { name: 'Add New Items' }).click();
            if (quote_type == 'Parts Quote') {
                await page.locator("//*[text() = 'Search']").click();
                await page.keyboard.insertText(testdata.parts.supplier);
                await page.keyboard.press('Enter');
            } else {

            }
            await page.getByPlaceholder('Part Number').fill(stock_code[index]);
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
            await allPages.checkBox.first().click();
            await page.getByRole('button', { name: 'Add Selected 1 Items' }).click();
        }
        await expect(page.getByText('Add Options')).toBeVisible();
    }
}
async function soucreSelection(page, stock_code) {
    let count = 1;
    for (let i = 0; i < stock_code.length; i++) {
        let xpath = "(//*[contains(@class, '-highlight check_box')])['" + count + "']/div[1]";
        await page.locator(xpath).click();
        count = count+1;
    }
    await page.waitForTimeout(1000);
    await page.click("//img[@alt='Edit-icon' and contains(@src, 'themecolorEdit')]");
    await page.waitForTimeout(1000);
    await expect(page.getByText('Select').first()).toBeVisible();
    await page.waitForTimeout(1000);
    await page.getByText('Select').first().click();
    await page.waitForTimeout(1000);
    await page.getByText('Field Service', { exact: true }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(2600);
}
async function submitForInternalApproval(page) {
    await expect(page.locator("(//*[text() = 'Submit for Internal Approval'])[1]")).toBeVisible();
    await page.locator("(//*[text() = 'Submit for Internal Approval'])[1]").click();
    try {
        await expect(page.locator("(//*[text() = 'Are you sure you want to submit this quote for approval ?'])[1]")).toBeVisible({ timeout: 2000 });
    } catch (error) {
        await expect(page.locator("(//*[text() = 'Few Quote Items are having GP less than 23%, Do you want to continue ?'])[1]")).toBeVisible({ timeout: 2000 });
    }
    await page.locator("(//*[text() = 'Proceed'])[1]").click();
}
async function approve(page, cont_name) {
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
            await expect(page.locator("(//*[text() = 'Few Quote Items are having GP less than 23%, Do you want to continue ?'])[1]")).toBeVisible();
            await page.locator("(//*[text() = 'Proceed'])[1]").click();
            await page.getByRole('button', { name: 'Approve' }).click();
            await page.getByRole('button', { name: 'Approve' }).nth(1).click();
        } else if (tqp > 25001 && 50001) {
            await page.locator("//*[text() = 'Approval Questions']").click();
            await page.locator("(//*[text() = 'Type'])[2]").click();
            await page.keyboard.press('Enter');
            await page.getByPlaceholder('Enter Competition').fill('Test Competition');
            await page.getByPlaceholder('Enter Budgetary Amount').fill('9999.01');
            await page.getByPlaceholder('Enter Key Decision Maker').fill(cont_name);
            await page.locator("(//*[text() = 'Save'])[1]").click();
            await expect(page.getByPlaceholder('Enter Decision Making Process')).toBeVisible();
            await page.getByLabel('25k+ Questions').getByLabel('open').click();
            await page.getByText('30 to 60 Days', { exact: true }).click();
            await page.getByPlaceholder('Enter Pain').click();
            await page.getByPlaceholder('Enter Pain').fill('Pain Entered');
            await page.getByPlaceholder('Enter Decision Making Process').click();
            await page.getByPlaceholder('Enter Decision Making Process').fill('Decision Making Process Entered');
            await page.locator('div').filter({ hasText: /^MM\/DD\/YYYY$/ }).nth(3).click();
            await page.locator('#react-select-6-input').press('ArrowDown');
            await page.locator('#react-select-6-input').press('ArrowUp');
            await page.locator('#react-select-6-input').press('Enter');
            await page.getByRole('button', { name: 'Save' }).click();
            await page.waitForTimeout(2500);
            await page.getByRole('button', { name: 'Approve' }).click();
            await page.getByRole('button', { name: 'Approve' }).nth(1).click();
        } else {

        }
    } else {
        await page.getByRole('button', { name: 'Approve' }).click();
        await page.getByRole('button', { name: 'Approve' }).nth(1).click();
    }
    await expect(page.locator("//*[text()='Revise Quote']")).toBeVisible();
}
async function createVersion(page, quote_id) {
    await page.locator("//*[text()='Revise Quote']").click();
    await expect(page.locator('#root')).toContainText('This will move the quote to Open, Do you want to continue ?');
    await page.getByRole('button', { name: 'Proceed' }).first().click();
    await expect(page.getByRole('heading', { name: 'Related to' })).toBeVisible();
    await expect(page.locator('#root')).toContainText('Quote has been revised #' + quote_id + '');
}
async function create_job_quotes(page, is_create_job, quoteType, acc_num, cont_name, stock_code, quote_type) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    // let acc_num = 'TESTC02', cont_name = 'Test CompanyTwo', stock_code = '832-1204',
    quote_type = quoteType;
    // await page.goto('https://www.staging-buzzworld.iidm.com/all_quotes/68c2706d-08dd-4235-93ed-dcb5287cb98d');
    let testResult; let quote_id
    try {
        await createQuote(page, acc_num, quoteType);
        let quote = await page.locator('(//*[@class = "id-num"])[1]').textContent();
        quote_id = quote.replace("#", "");
        console.log('quote is created with id ', quote_id);
        console.log('quote url is ', await page.url());
        //RFQ Received Date selection and Quote Requested By Update
        await selectRFQDateandQuoteRequestedBy(page, cont_name);
        //Add Items
        for (let index = 0; index < stock_code.length; index++) {

            await page.getByText('Add Items').click();
            await page.getByPlaceholder('Search By Part Number').click();
            await page.getByPlaceholder('Search By Part Number').fill(stock_code[index]);
            await spinner(page);
            let res = false;
            try {
                await expect(page.locator("(//*[text() = 'Items Not Available'])[1]")).toBeVisible({ timeout: 2300 });
                res = true;
            } catch (error) {
                // console.log(error);
                res = false;
            }
            if (res) {
                await page.getByRole('tab', { name: 'Add New Items' }).click();
                if (quote_type == 'Parts Quote') {
                    await page.locator("//*[text() = 'Search']").click();
                    await page.keyboard.insertText(testdata.parts.supplier);
                    await page.keyboard.press('Enter');
                } else {

                }
                await page.getByPlaceholder('Part Number').fill(stock_code[index]);
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
                await allPages.checkBox.first().click();
                await page.getByRole('button', { name: 'Add Selected 1 Items' }).click();
            }
            await expect(page.getByText('Add Options')).toBeVisible();
        }
        //Bulk Update Source
        await page.waitForTimeout(2500);
        for (let i = 0; i < stock_code.length; i++) {
            if (stock_code.length > 1) {
                if (i == 0) {
                    await page.locator('#repair-items label').first().check();
                } else {
                    await page.locator('#repair-items label').nth(i).check();
                }
            } else {
                await page.locator('#repair-items label').first().check();
            }
        }
        await page.waitForTimeout(1000);
        await page.click("//img[@alt='Edit-icon' and contains(@src, 'themecolorEdit')]");
        await page.waitForTimeout(1000);
        await expect(page.getByText('Select').first()).toBeVisible();
        await page.waitForTimeout(1000);
        await page.getByText('Select').first().click();
        await page.waitForTimeout(1000);
        await page.getByText('Field Service', { exact: true }).click();
        await page.waitForTimeout(1000);
        await page.getByRole('button', { name: 'Save' }).click();
        await page.waitForTimeout(2600);
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
            } else if (tqp > 25001 && 50001) {
                await page.locator("//*[text() = 'Approval Questions']").click();
                await page.locator("(//*[text() = 'Type'])[2]").click();
                await page.keyboard.press('Enter');
                await page.getByPlaceholder('Enter Competition').fill('Test Competition');
                await page.getByPlaceholder('Enter Budgetary Amount').fill('9999.01');
                await page.getByPlaceholder('Enter Key Decision Maker').fill(cont_name);
                await page.locator("(//*[text() = 'Save'])[1]").click();
                await expect(page.getByPlaceholder('Enter Decision Making Process')).toBeVisible();
                await page.getByLabel('25k+ Questions').getByLabel('open').click();
                await page.getByText('30 to 60 Days', { exact: true }).click();
                await page.getByPlaceholder('Enter Pain').click();
                await page.getByPlaceholder('Enter Pain').fill('Pain Entered');
                await page.getByPlaceholder('Enter Decision Making Process').click();
                await page.getByPlaceholder('Enter Decision Making Process').fill('Decision Making Process Entered');
                await page.locator('div').filter({ hasText: /^MM\/DD\/YYYY$/ }).nth(3).click();
                await page.locator('#react-select-6-input').press('ArrowDown');
                await page.locator('#react-select-6-input').press('ArrowUp');
                await page.locator('#react-select-6-input').press('Enter');
                await page.getByRole('button', { name: 'Save' }).click();
                await page.waitForTimeout(2500);
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
        await page.waitForTimeout(2000);
        let itemsCount = await page.locator("(//*[text()= 'Quote:'])").count();
        await page.pause();
        await page.getByText('Create Sales Order').click();
        await spinner(page);
        await expect(page.getByPlaceholder('Enter PO Number')).toBeVisible();
        await page.waitForTimeout(2000);
        try {
            // await expect(page.locator("(//*[text()= 'Item' or contains(text(), 'Stock Code')])")).toBeVisible();
            await expect(page.locator("(//*[(//*[text() = 'Create'])[2]])")).toBeVisible();
        } catch (error) {
        }
        await page.getByPlaceholder('Enter PO Number').fill('543534534');
        let ship_text = await page.locator("(//*[contains(@class, 'react-select__value-container')])[2]").textContent();
        if (ship_text == 'Select Shipping Instructions') {
            await page.getByText('Select Shipping Instructions').click();
            await page.getByLabel('Order Date*').fill('u');
            await page.getByText('UPS GRD COLLECT', { exact: true }).click();
        } else {

        }
        let res1 = false; let is_checked;
        for (let index = 0; index < stock_code.length; index++) {
            try {
                await expect(page.locator("(//*[text() = 'Warehouse'])[1]")).toBeHidden({ timeout: 3000 });
                res1 = true;
            } catch (error) {
                res1 = false;
            }
            if (res1) {
                await page.locator('(//*[contains(@src, "addIcon")])[1]').click();
                await expect(page.getByRole('dialog')).toContainText('Add Stock Line Items');
                await page.getByRole('dialog').getByLabel('open').first().click();
                await page.keyboard.press('Enter');
                let desc = await page.getByPlaceholder('Enter Stock Description');
                if (await desc.getAttribute('value') == '') {
                    desc.fill('Manually Added');
                } else {
                }
                await page.getByRole('button', { name: 'Add' }).first().click();
                if (quote_type == 'Parts Quote') {

                } else {
                    await expect(page.locator("(//*[text() = 'Create Job'])[1]")).toBeVisible();
                }
                await page.waitForTimeout(2000);
            } else {

            }
            await page.waitForTimeout(1500);
            await expect(page.getByRole('button', { name: 'Create', exact: true }).first()).toBeVisible();
            if (quote_type == 'Parts Quote') {
                console.log('create job option is disabled for ' + quote_type);
                is_checked = 'not display the create job option..';
            } else {
                is_checked = await page.locator('label').filter({ hasText: 'Create Job' }).first().isChecked();
                if (is_create_job == 'Y') {
                    if (is_checked) {

                    } else {
                        await page.locator('label').filter({ hasText: 'Create Job' }).first().click();
                    }
                } else if (is_create_job == 'N') {
                    if (is_checked) {
                        await page.locator('label').filter({ hasText: 'Create Job' }).first().click();
                    } else {

                    }
                }
                is_checked = await page.locator('label').filter({ hasText: 'Create Job' }).first().isChecked();
            }
        }
        await page.getByRole('button', { name: 'Create', exact: true }).first().click();
        try {
            //update warehouse if needed
            await expect(page.locator("(//*[contains(text(),  'not stocked in warehouse')])[1]")).toBeVisible({ timeout: 6000 });
            await warehouse_update(page, stock_code);
            await page.getByRole('button', { name: 'Create', exact: true }).first().click();
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
                try {
                    await expect(page.locator('(//*[@role = "presentation"])[6]')).toBeVisible({ timeout: 3000 })
                    let job_id = await page.locator('(//*[@role = "presentation"])[6]');
                    console.log('job created with id ', await job_id.textContent());
                    await job_id.click();
                    await expect(page.getByRole('heading', { name: 'Job Information' })).toBeVisible();
                } catch (error) {
                    console.log("error while creating job ", error);
                    await page.screenshot({ path: 'files/job_error.png', fullPage: true });
                    await page.getByTitle('close').getByRole('img').click();
                    await page.waitForTimeout(1800);
                }
            }
        } else {
            console.log("Job selection checkbox status is: ", is_checked);
        }
        testResult = true;
    } catch (error) {
        testResult = false;
        console.log(error);
    }
    return testResult;
}
async function add_new_part(page, stock_code) {
    await page.getByRole('button', { name: '? Click here to add them' }).click();
    await expect(page.getByPlaceholder('Part Number')).toBeVisible();
    await page.getByPlaceholder('Part Number').fill(stock_code);
    await page.getByLabel('open').click();
    await page.getByLabel('Manufacturer*').fill('omro001');
    // await this.delay(2000);
    await page.getByText('OMRON ELECTRONICS LLCOMRO001').first().click();
    await page.getByPlaceholder('Serial No').fill('SN797444');
    await page.getByPlaceholder('Description').fill('manually added');
    await page.getByRole('button', { name: 'Add New Part' }).click();
}
async function create_parts_purchase(page, is_manually, repair_id) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let results; let pp_id
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
            await expect(page.locator("(//*[contains(@src, 'partspurchase')])[1]")).toBeVisible();
            job_id = await page.locator("(//*[contains(@class, 'm-0 item-value')])[6]").textContent();
            await page.locator("(//*[contains(@src, 'partspurchase')])[1]").click();
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
        pp_id = pp.replace("#", "");
        console.log('used job id is ', job_id);
        console.log('parts purchase created with id ', pp_id);
        await page.waitForTimeout(2000);
        results = true;
    } catch (error) {
        console.log("getting Error while creating parts purchase ", error);
        await page.screenshot({ path: 'files/create_pp_error.png', fullPage: true });
        await page.getByTitle('close').getByRole('img').click();
        results = false;
    }
    return [results, pp_id];
}
async function validationsAtCreateRMAandQuotePages(page) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let testResults;
    try {
        //RMA Creation page
        await page.getByText('Repairs').first().click();
        await page.getByText('Create RMA').click();
        await expect(allPages.customerDropdown).toBeVisible();
        await allPages.createButton.click();
        await expect(page.getByText('Please select Company Name')).toBeVisible();
        await expect(page.getByText('Please select Contact Name')).toBeVisible();
        await allPages.customerDropdown.fill('766872testhello');
        await expect(page.getByText('Create Account')).toBeVisible();
        await page.locator('div').filter({ hasText: /^Select$/ }).nth(2).click();
        await page.keyboard.insertText('virat kohli');
        await expect(page.getByRole('button', { name: 'loading Create Contact' })).toBeVisible();
        console.log('Validations are Displayed at Create RMA Page');
        //Quote Creation Page
        await page.getByTitle('close').getByRole('img').click();
        await page.getByText('Quotes').click();
        await page.getByText('Create Quote').click();
        await expect(allPages.customerDropdown).toBeVisible();
        await page.getByRole('button', { name: 'Create Quote' }).click();
        await expect(page.getByText('Please select Company Name')).toBeVisible();
        await expect(page.getByText('Please select Quote Type')).toBeVisible();
        await allPages.customerDropdown.fill('766872testhello');
        await expect(page.getByText('Create Account')).toBeVisible();
        await page.getByTitle('close').getByRole('img').click();
        console.log('Validations are Displayed at Create Quotes Page');
        testResults = true;

    } catch (error) {
        testResults = false;
        console.log(error);
    }
    return testResults;
}
async function create_job_manually(page, orderId) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let testResult;
    try {
        await page.waitForTimeout(2100)
        await page.getByText('Jobs').click();
        // await page.goto('https://www.staging-buzzworld.iidm.com/jobs/9b0970e6-b539-44d5-a118-ebde9631d1a5');
        await expect(allPages.profileIconListView).toBeVisible();
        await page.getByText('Create Job').click();
        await expect(page.getByPlaceholder('Enter Job Description')).toBeVisible();
        await page.getByLabel('open').first().click();
        await page.getByLabel('Order ID').fill(orderId.toString());
        await expect(page.getByText(orderId.toString(), { exact: true }).nth(1)).toBeVisible();
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
        console.log('used order id is ', orderId)
        console.log('job created with id ', job_id);
        await page.waitForTimeout(1800);
        testResult = true;
    } catch (error) {
        console.log("getting Error while creating job ", error);
        await page.screenshot({ path: 'files/create_job_error.png', fullPage: true });
        await page.getByTitle('close').getByRole('img').click();
        testResult = false;
    }
    return testResult;
}
async function import_pricing(page, import_to) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
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
    await expect(allPages.profileIconListView).toBeVisible();
    await page.getByText('Admin').click();
    await admin1(page);
    await admin2(page);
    await admin3(page);
    await admin4(page);
    await quotesRepairs(page)
}
async function inventory_search(page, stock_code, stage_url) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    // await login_buzz(page, stage_url);
    // try {
    //     await expect(allPages.profileIconListView).toBeVisible();
    // } catch (error) {

    // }
    let testResult;
    try {
        let warehouse;
        await page.getByText('Inventory').click();
        await page.getByLabel('open').click();
        await page.keyboard.insertText(stock_code.toString());
        await page.waitForTimeout(4000);
        let search_data = await page.locator("//*[contains(@class, 'css-4mp3pp-menu')]");
        let div = await search_data.locator("//div");
        let div_count = await div.count();
        // console.log('div count ' + div_count);
        for (let i = 1; i <= div_count; i++) {
            let div_data = await div.nth(i).textContent();
            console.log(' data is ' + div_data);
            if (div_count == 2) {
                await page.keyboard.press('Enter');
                await expect(page.locator("//*[text() = 'Stock Code Information']")).toBeVisible();
                console.log(stock_code + ' is in the Inventory');
                await expect(page.getByRole('heading', { name: 'Stock Code Information' })).toBeVisible();
                await expect(page.getByRole('heading', { name: 'Ware House Information' })).toBeVisible();
                let count = await page.locator('//*[contains(@title, "warehouse")]').count();
                console.log('warehouse is ');
                for (let index = 1; index <= count; index++) {
                    warehouse = await page.locator('(//*[contains(@title, "warehouse")])[' + count + ']').textContent();
                    console.log('            ', warehouse);
                }
                testResult = true;
                break;
            } else {
                if (stock_code == div_data) {
                    await div.nth(i).click();
                    await page.getByText(stock_code, { exact: true }).click();
                    await expect(page.locator("//*[text() = 'Stock Code Information']")).toBeVisible();
                    console.log(stock_code + ' is in the Inventory');
                    await expect(page.getByRole('heading', { name: 'Stock Code Information' })).toBeVisible();
                    await expect(page.getByRole('heading', { name: 'Ware House Information' })).toBeVisible();
                    let count = await page.locator('//*[contains(@title, "warehouse")]').count();
                    console.log('warehouse is ');
                    for (let index = 1; index <= count; index++) {
                        warehouse = await page.locator('(//*[contains(@title, "warehouse")])[' + count + ']').textContent();
                        console.log('            ', warehouse);
                    }
                    testResult = true;
                    break;
                } else {
                    console.log(stock_code + ' is not in the Inventory');
                    testResult = false;
                }
            }
        }
    } catch (error) {
        testResult = false;
        console.error(error);
    }
    return testResult;
}
async function parts_purchase_left_menu_filter(page) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
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
async function addCustomerToSysProValidations(page, serachCompany) {
    let getResults;
    try {
        await page.getByRole('button', { name: 'Organizations expand' }).click();
        await page.getByRole('menuitem', { name: 'Organizations' }).click();
        await spinner(page);
        await page.locator("//*[@placeholder = 'Name / Company Name / Account Number / Owner']").fill(serachCompany);
        await spinner(page);
        await page.locator("//*[@title = 'Add Customer']").first().click();
        await expect(page.getByPlaceholder('Contact')).toBeVisible();
        await page.getByRole('button', { name: 'Create' }).click();
        for (let index = 5; index < 7; index++) {
            let reqValue = await page.locator("(//*[@class = 'select-label'])[" + index + "]").textContent();
            if (reqValue.includes('*')) {
                console.log(reqValue, ' is Mandatory');
            } else {
                console.log(reqValue, ' Field is Non Mandatory');
            }
        }
        await page.getByPlaceholder('Contact').fill('Test 12343');
        await expect(page.getByText('Please Enter Valid Contact')).toBeHidden();
        await page.getByPlaceholder('Contact').fill('');
        await expect(page.getByText('Contact is required')).toBeVisible();
        await page.getByPlaceholder('Contact').fill('Test 12343 ^*^');
        await expect(page.getByText('Please Enter Valid Contact')).toBeVisible();
        await page.getByPlaceholder('Enter New SysPro Id').fill('');
        await expect(page.getByText('New SysPro Id is required')).toBeVisible();
        await page.getByPlaceholder('Enter New SysPro Id').fill('Test34%&^');
        await expect(page.getByText('New SysPro Id must be alphanumeric')).toBeVisible();
        await page.getByPlaceholder('Enter Primary Phone').fill('');
        await expect(page.getByText('Primary Phone is required')).toBeVisible();
        await page.getByPlaceholder('Enter Primary Phone').fill('567');
        await expect(page.getByText('Please Enter Valid Primary')).toBeVisible();
        await expect(page.getByText('Email Address is required')).toBeVisible();
        await page.getByPlaceholder('Enter Email Address').fill('4535435');
        await expect(page.getByText('Please Enter Valid Email Address')).toBeVisible();
        await page.getByPlaceholder('Enter Credit Limit').fill('');
        await expect(page.getByText('Credit Limit required')).toBeVisible();
        await page.getByPlaceholder('Enter Credit Limit').fill('12345678');
        let credLen = await page.getByPlaceholder('Enter Credit Limit').getAttribute('value');
        let creditLimitLemght = credLen.length;
        console.log('credit limit lenght is ', creditLimitLemght);
        await page.getByPlaceholder('Enter Bill to Address').click();
        await page.getByPlaceholder('Enter Bill to Address').fill('');
        await expect(page.getByText('Bill to Address is required')).toBeVisible();
        await page.getByPlaceholder('Enter Bill to City').fill('');
        await expect(page.getByText('Bill to City required')).toBeVisible();
        await expect(page.getByText('Bill to State required')).toBeVisible();
        await expect(page.getByText('Bill to Zip required')).toBeVisible();
        await page.getByPlaceholder('Enter Ship to Address').fill('');
        await page.getByPlaceholder('Enter Ship to Address').click({
            modifiers: ['Control']
        });
        await expect(page.getByText('Ship to Address is required')).toBeVisible();
        await page.getByRole('button', { name: 'Create' }).click();
        await page.getByPlaceholder('Enter Ship to City').click();
        await page.getByPlaceholder('Enter Ship to City').fill('');
        await expect(page.getByText('Ship To City required')).toBeVisible();
        await expect(page.getByText('Ship to State required')).toBeVisible();
        await expect(page.getByText('Ship to Zip required')).toBeVisible();
        await page.getByRole('button', { name: 'Create' }).click();
        await page.getByLabel('Bill to Zip*').fill('45435');
        await expect(page.getByText('Add Bill to Zip')).toBeVisible();
        await page.getByText('Add Bill to Zip').click();
        await page.getByLabel('clear').click();
        await page.locator('#ship_to_zip').getByLabel('open').click();
        await page.keyboard.insertText('54654');
        await expect(page.getByText('Add Ship to Zip')).toBeVisible();
        await page.getByText('Add Ship to Zip').click();
        await page.getByLabel('clear').click();
        await expect(page.getByText('Bill to Zip required')).toBeVisible();
        await expect(page.getByText('Ship to Zip required')).toBeVisible();
        await page.locator('div').filter({ hasText: /^Houston$/ }).nth(2).click();
        await page.getByText('Centrifuge', { exact: true }).click();
        await page.getByRole('button', { name: 'Create' }).click();
        await expect(page.getByText('Territory required')).toBeVisible();
        await expect(page.getByText('Sales Person required')).toBeVisible();
        await page.getByTitle('close').getByRole('img').click();
        console.log('Displaying all validations');
        await page.waitForTimeout(2000);
        getResults = true;
    } catch (error) {
        getResults = false;
        console.log('Not Display all validations');
        console.log(error);
    }
    return getResults;
}
async function addCustomerToSyspro(page, serachCompany, sysProId) {
    let getResults;
    async function fieldNames(page) {
        let contact = await page.getByPlaceholder('Contact').getAttribute('value');
        let email = await page.getByPlaceholder('Enter Email Address').getAttribute('value');
        await page.fill("//*[@name='bill_to_address']", 'test bill to adres 1234');
        await page.fill("//*[@name='bill_to_city']", 'columbia');
        await page.fill("//*[@name='ship_to_address']", 'test bill to adres 1234');
        await page.fill("//*[@name='ship_to_city']", 'texas');
        let billToAdrs = await page.locator("//*[@name='bill_to_address']").textContent();
        let billToCity = await page.locator("//*[@name='bill_to_city']").getAttribute('value');
        let shipToAdrs = await page.locator("//*[@name='ship_to_address']").textContent();
        let shipToCity = await page.locator("//*[@name='ship_to_city']").getAttribute('value');

    }
    try {
        await page.getByRole('button', { name: 'Organizations expand' }).click();
        await page.getByRole('menuitem', { name: 'Organizations' }).click();
        await spinner(page);
        await page.locator("//*[@placeholder = 'Name / Company Name / Account Number / Owner']").fill(serachCompany);
        await spinner(page);
        await page.locator("//*[@title = 'Add Customer']").first().click();
        await expect(page.getByPlaceholder('Contact')).toBeVisible();
        await page.getByPlaceholder('Contact').fill('Test1234');
        await page.getByPlaceholder('Enter New SysPro Id').fill(sysProId);
        await page.getByPlaceholder('Enter Email Address').fill('test@user.co');
        if (testCount == 1) {
            await page.getByRole('button', { name: 'Create' }).click();
            await expect(page.getByText('Syspro ID already exists')).toBeVisible();
            await page.getByTitle('close').getByRole('img').click();
            console.log('Displaying validations for existing syspro id');
            await page.waitForTimeout(2000);
            getResults = true;
        } else {
            getResults = await fieldNames(page);
            await page.waitForTimeout(2000);
        }
    } catch (error) {
        getResults = false;
        console.log('Not Display validations for existing syspro id');
        console.log(error);
    }
    return getResults;
}
async function pos_report(page) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let testResults;
    try {
        let vendor_name = [
            'ABB', 'Omron', 'Omron STI', 'Parker', 'Rethink Robotics', 'Schmersal', 'SMC', 'Wago', 'Wago Rebate', 'Yaskawa Motion', 'Yaskawa VFD', 'Omron SFSAC', 'ABB SFSAC'
        ];
        let dates = [];
        await page.waitForTimeout(600);
        await page.locator("(//*[text() = 'Reports'])[1]").click();
        await page.locator("(//*[text() = 'Point of Sales'])[1]").click();
        await expect(page.locator("(//*[text() = 'Please Select Filters'])[1]")).toBeVisible();
        for (let index = 0; index < vendor_name.length; index++) {
            if (vendor_name[index] == 'Rethink Robotics') {
                dates = []
                dates.push('06'), dates.push('2017')
            } else {
                dates = []
                dates.push('07'), dates.push('2024')
            }
            //selecting month
            await page.locator("(//*[contains(@class, 'react-select__indicator')])[1]").click();
            await page.keyboard.insertText(dates[0]);
            await page.keyboard.press('Enter');
            //selecting year
            await page.locator("(//*[contains(@class, 'react-select__indicator')])[3]").click();
            await page.keyboard.insertText(dates[1]);
            await page.keyboard.press('Enter');
            //selecting vendor
            await page.locator("(//*[contains(@class, 'react-select__indicator')])[5]").click();
            await page.keyboard.insertText(vendor_name[index]);
            await page.keyboard.press('Enter');
            await page.locator("(//*[text() = 'Apply'])[1]").click();
            await spinner(page);
            try {
                await expect(page.locator("(//*[text() = 'more'])[1]")).toBeHidden({ timeout: 10000 });
                let grid_text = await page.locator("//*[@class = 'ag-center-cols-viewport']").textContent();
                let totalRowsCount = await page.locator("//*[@ref = 'lbRecordCount']").textContent();
                // console.log(vendor_name[index] + ' grid data length is ', grid_text.length);
                if (grid_text.length > 38) {
                    console.log(ANSI_GREEN + vendor_name[index] + ' POS report list is displayed' + ANSI_RESET + " for " + dates[0] + '/' + dates[1]);
                    console.log(ANSI_GREEN + vendor_name[index] + ' POS reports Count is ' + totalRowsCount + ANSI_RESET);
                    await page.click("//*[text()='Export']");
                    await delay(page, 1500);
                } else {
                    console.log(ANSI_RED + vendor_name[index] + ' POS report list is Empty at selected dates.' + ANSI_RESET);
                    await page.screenshot({ path: 'files/' + vendor_name[index] + '_POS_report.png', fullPage: true });
                }
            } catch (error) {
                console.log(ANSI_RED + vendor_name[index] + ' POS report list is not displayed' + ANSI_RESET + " for " + dates[0] + '/' + dates[1]);
                console.log(error)
            }
        }
        testResults = true;

    } catch (error) {
        testResults = false;
        console.log(error)
    }
    return testResults;
}
async function past_repair_prices(page) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let quote_types = ['Repair Quotes', 'Parts Quotes', 'System Quotes'];
    let getTestResults;
    try {
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
        getTestResults = true;
    } catch (error) {

        getTestResults = false;
    }
    return getTestResults;
}
async function edit_PO_pp(page) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
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
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
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
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let file; let getTestResults;
    try {
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
                        let excel_data = await read_excel_data('parts_import.xlsx');
                        // console.log('rows count is ', excel_data.length);
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
                                // console.log('div count ' + div_count);
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
        getTestResults = true;
    } catch (error) {
        getTestResults = false;
    }
    return getTestResults;
}
async function add_parts(page, cond2, cond3) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let getTestResults;
    try {
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
        if (search_data === 'For the searched stock code, inventory is not available ') {
            if (cond2 === 'duplicates' || cond3 === 'empty') {
                console.log('this test will run without Search');
            } else {
                console.log('Before add part Search result is "' + search_data + '"');
            }
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
                        await expect(page.getByText('Order UOM is required')).toBeHidden({ timeout: 3000 });
                        await expect(page.getByText('Please Select Warehouse')).toBeVisible({ timeout: 3000 });
                        console.log('display all required fields validation');
                    } else {
                        await spinner(page);
                        // await page.getByLabel('open').click();
                        // await page.keyboard.insertText(part);
                        // await spinner(page);
                        // await page.waitForTimeout(1500);
                        // search_data = await page.locator("//*[contains(@class, 'css-4mp3pp-menu')]").textContent();
                        let result;
                        try {

                            await expect(page.locator("//*[text() = 'Stock Code Information']")).toBeVisible();
                            result = true;
                        } catch (error) {
                            result = false;
                        }
                        if (result) {
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
        getTestResults = true;
    } catch (error) {
        getTestResults = false;
    }
    return getTestResults;
}
async function bomImporter(page, parentPart, childPart, qty, sequence, warehouse, testCount) {
    let testResult;
    try {
        if (testCount == 1) {
            await page.getByText('Inventory').first().click();
        }
        await page.getByRole('button', { name: 'Add Stock Code expand' }).click();
        await page.getByRole('menuitem', { name: 'BOM Import' }).click();
        await expect(page.getByPlaceholder('Enter Stock Code')).toBeVisible();
        await page.getByLabel('open').nth(1).click();
        await page.keyboard.insertText(parentPart);
        await spinner(page);
        try {
            await expect(page.getByText('No Parent Part Number Found')).toBeVisible({ timeout: 3000 });
            console.log('Parent Part not exist in our Pricing');
            if (testCount == 1) {
                testResult = true;
            } else if (testCount == 3) {
                testResult = true;
            } else {
                testResult = false;
            }
        } catch (error) {
            let firstSearch = await page.locator('#react-select-3-option-0').textContent();
            console.log('first result is ', firstSearch);
            if (firstSearch == parentPart) {
                await page.locator('#react-select-3-option-0').click();
                await page.getByPlaceholder('Enter Stock Code').fill(childPart);
                await page.getByPlaceholder('Enter Qty').fill(qty);
                await page.locator('div').filter({ hasText: /^Select Warehouse$/ }).nth(2).click();
                await page.locator('#react-select-4-input').fill(warehouse);
                await page.locator('#react-select-4-input').press('Enter');
                await page.getByRole('button', { name: 'Upload' }).click();
                let expText;
                if (testCount == 1) {
                    expText = page.getByText('No Parent Part Number Found');
                } else if (testCount == 2) {
                    expText = page.getByText('Stockcode(s) not found in Warehouse' + childPart + '');
                } else if (testCount == 4) {
                    expText = page.getByText('Updated Stockcode(s)' + childPart + '');
                } else {
                    expText = page.getByText('Inserted Stockcode(s)' + childPart + '');
                }
                console.log('Displaying validation is ', await expText.textContent());
                await expect(expText).toBeVisible();
                testResult = true;
            } else {
                console.log('searched part not displayed in first search');
                testResult = false;
            }
        }
    } catch (error) {
        testResult = false;
    }
    await page.reload();
    return testResult;
}
async function uploadBOMFiles(page, parentPart, testCount, file, testName) {
    let testResult = false;
    async function isVisibleScrollable(page, element) {
        try { await expect(element).toBeVisible({ timeout: 3000 }); await element.scrollIntoViewIfNeeded(); await delay(page, 1200); return true; }
        catch (error) { return false; }
    }
    try {
        if (testCount == 1) { await page.getByText('Inventory').first().click(); }
        // else { await page.getByText('Inventory').first().click(); }
        await page.getByRole('button', { name: 'Add Stock Code expand' }).click();
        await page.getByRole('menuitem', { name: 'BOM Import' }).click();
        await expect(page.getByPlaceholder('Enter Stock Code')).toBeVisible();
        await page.click("//*[text()='Upload']");
        await page.getByLabel('Upload').getByLabel('open').click();
        await page.keyboard.insertText(parentPart);
        await expect(page.getByText('Loading...')).toBeHidden();
        try {
            await expect(page.getByText('No Parent Part Number Found')).toBeVisible({ timeout: 1500 });
            console.log('Parent Part not exist in our Pricing');
        } catch (error) {
            await page.getByText(parentPart, { exact: true }).nth(1).click();
            await page.setInputFiles("//*[@type = 'file']", file);
            let fileUploaded = page.locator("//*[text()='File Uploaded']");
            if (testCount == 1) {

            } else {
                await isVisibleScrollable(page, fileUploaded);
                await allPages.proceed;
            }
            if (testCount == 1) {
                await expect(page.getByLabel('Upload').getByText('Invalid File')).toBeVisible({ timeout: 3000 });
                testResult = true;
            } else if (testCount == 2) {
                let uploadedHeaders;
                let tableItems = await page.locator('//*[@id="table-items"]/div[2]').textContent();
                let data = await readExcelHeaders('BOM_Files/in_valid_headers_file.csv', 0);
                let val = []; val.push(data[0]); let strarray = val.join(',');
                uploadedHeaders = strarray.replace(",", "").replace(",", "");
                console.log('headres is ', uploadedHeaders);
                await isVisibleScrollable(page, tableItems);
                let text = "Excel file headers doesn't match Sample format.Sample FormatStockcodeQuantityWarehouseUploaded Format" + uploadedHeaders;
                if (tableItems == text) {
                    testResult = true;
                } else {
                    testResult = false;
                }
            } else if (testCount == 3) {
                await expect(page.getByLabel('Upload').getByText('Headers information missing')).toBeVisible({ timeout: 3000 });
                testResult = true;
            } else if (testCount == 4 || testCount == 6) {
                await expect(page.getByLabel('Upload').getByText('Stockcode(s) not found in the given file.')).toBeVisible({ timeout: 3000 });
                testResult = true;
            } else if (testCount == 5 || testCount == 8) {
                await expect(page.getByLabel('Upload').getByText('1 row(s) have invalid cell value for headers')).toBeVisible({ timeout: 3000 });
                let tableItems = await page.textContent("//*[@class='ag-center-cols-container']");
                let data = await read_excel_data(file, 0); let val = [];
                for (let index = 0; index < data.length; index++) {
                    let childStock = data[index]['Quantity'];
                    val.push(childStock);
                }
                let checkValue; if (testCount == 5) { checkValue = '2Quantity' + val.join(',') + 'numericstring'; }
                else { checkValue = '2Quantity' + val.join(',') + 'numericstring'; }
                if (tableItems == checkValue) { testResult = true; } else { testResult = false; }
            } else if (testCount == 7 || testCount == 11) {
                let data = await read_excel_data(file, 0); let val = [];
                for (let index = 0; index < data.length; index++) {
                    let childStock = data[index]['Stockcode'];
                    val.push(childStock);
                }
                let errors = page.getByText('Stockcode(s) not found in Warehouse' + val.join(', '));
                await isVisibleScrollable(page, errors);
                testResult = true;
            } else if (testCount == 9) {
                let data = await read_excel_data(file, 0); let val = [];
                for (let index = 0; index < data.length; index++) {
                    let childStock = data[index]['Stockcode'];
                    val.push(childStock);
                }
                let errors = page.getByLabel('Upload').getByText('Following Stockcode(s) having quantity more than 999999. ' + val.join(', '))
                await isVisibleScrollable(page, errors);
                testResult = true;
            } else if (testCount == 10) {
                let errors = page.getByLabel('Upload').getByText('Following Stockcode(s) are invalid. ' + val.join(', '))
                await isVisibleScrollable(page, errors);
                testResult = true;
            } else {

            }
        }
    } catch (error) {
        console.log('error is ', error);
        testResult = false;
    }
    await page.screenshot({ path: 'testResFiles/' + testName + '.png' });
    await page.reload();
    return testResult;
}
async function allValidationsBOMImporter(page, parentPart) {
    let testResult;
    let data = [
        //Stockcode(s) warehouse not found
        { childPart: 'Test7222', qty: '2', seq: '673839', whouse: '01' },
        //updated
        { childPart: '+UTC000037-2', qty: '1', seq: '673839', whouse: '90' },
        //inserted
        // { childPart: '+5D56091G012', qty: '1', seq: '454354', whouse: '90' }
    ];
    try {
        await page.getByText('Inventory').first().click();
        await page.getByRole('button', { name: 'Add Stock Code expand' }).click();
        await page.getByRole('menuitem', { name: 'BOM Import' }).click();
        await expect(page.getByPlaceholder('Enter Stock Code')).toBeVisible();
        await page.getByLabel('open').nth(1).click();
        await page.keyboard.insertText(parentPart);
        await spinner(page);
        try {
            await expect(page.getByText('No Parent Part Number Found')).toBeVisible({ timeout: 3000 });
            console.log('Parent Part not exist in our Pricing');
            if (testCount == 3) {
                testResult = true;
            } else {
                testResult = false;
            }
        } catch (error) {
            let firstSearch = await page.locator('#react-select-3-option-0').textContent();
            console.log('first result is ', firstSearch);
            if (firstSearch == parentPart) {
                await page.locator('#react-select-3-option-0').click();
                for (let index = 0; index < data.length; index++) {
                    await page.fill("(//*[contains(@placeholder,'Enter Stock Code')])[" + (index + 1) + "]", data[index].childPart);
                    await page.fill("(//*[contains(@placeholder,'Enter Qty')])[" + (index + 1) + "]", data[index].qty);
                    await page.locator('div').filter({ hasText: /^Select Warehouse$/ }).nth(2).click();
                    await page.keyboard.insertText(data[index].whouse);
                    await delay(page, 1000);
                    await page.keyboard.press('Enter');
                    if (index !== (data.length - 1)) {
                        await page.click("//*[contains(@src,'addIcon')]");
                    }
                }
                await page.getByRole('button', { name: 'Upload' }).click();
                await expect(page.getByText('Stockcode(s) not found in Warehouse' + data[0].childPart + '')).toBeVisible();
                await expect(page.getByText('Updated Stockcode(s)' + data[1].childPart + '')).toBeVisible();
                // await expect(page.getByText('Inserted Stockcode(s)' + data[2].childPart + '')).toBeVisible();
                let validsTable = await page.locator("//form/div[2]").textContent();
                console.log(validsTable);
                testResult = true;
            } else {
                console.log('searched part not displayed in first search');
                testResult = false;
            }
        }
    } catch (error) {
        testResult = false;
        console.log(error);
    }
    return testResult;
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
async function read_excel_data(file, sheetIndex) {
    const workbook = xlsx.readFile(file);
    // Choose the first sheet (you can specify the sheet name or index)
    const sheetName = workbook.SheetNames[sheetIndex];
    const sheet = workbook.Sheets[sheetName];
    // Parse the sheet to JSON format
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    return jsonData;
}
async function readExcelHeaders(file, sheetIndex) {
    const workbook = xlsx.readFile(file);
    // Choose the first sheet (you can specify the sheet name or index)
    const sheetName = workbook.SheetNames[sheetIndex];
    const sheet = workbook.Sheets[sheetName];
    // Parse the sheet to JSON format
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
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
async function getProductWriteIntoExecl(page) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    const apiUrl = 'https://staging-buzzworld-api.iidm.com//v1/Products?page=1&perPage=12107&sort=asc&sort_key=stock_code&branch_id=d9e293cd-34f6-4224-8fb3-e75a99ccb2e2&vendor_id=759a4e48-cd67-4e2e-8a5a-f703466bb3b4&vendor_name=YASKAWA&serverFilterOptions=[object%20Object]';
    // Make a GET request to the API endpoint
    let vendor = 'YASK001';
    const response = await page.evaluate(async (url) => {
        const fetchData = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4IiwianRpIjoiMDEwMzQ3YWY5ODA4ZDI3MWM3ZTkwNzI3MmEwNjNiYTliNjA3NzExMWY3MDYyZGI0YzA0NzBmMjFmODcyNGI0MWY5ZGQ3YWExNmM4ZTdhYzQiLCJpYXQiOjE3MTcxMzEyOTQuNTMxMDI2LCJuYmYiOjE3MTcxMzEyOTQuNTMxMDMsImV4cCI6MTcxODQyNzI5NC41MTYyMTUsInN1YiI6IjY3MTRhOTI0LTdiZmEtNDk2OS04NTM4LWJmODQxOTViNTQxYSIsInNjb3BlcyI6W119.Oo3lrY3uyh3RBEsyUDOapHGTzIDrwzVZoOzoTJj_CbxA585PuM81CbUt_92mTBfjJAzIb0Bj5RJshPIm2vnYWTllXeMwkWHDGjjs1BLh8R-tOSYCcxIoW_a7dZ70kWqvSTtQtFyiQwqdo2q0avem5gbmIdH-endlBgzoFtcMBlT_daF4lSPdBUpkZmjPwUoR-2sEEqvwmHtxiKEJYIfLKe2Dlrphfke14stmfvRaCi4yPGT_NkiDfiiDhthRvfBUkWalGsBAGRLJ_epKLGh3ZYKjMr8m6lEBdAA-tm3PXcXNmqlrNay6BwijxB9z2-7BVn1aTztOwSV7XseSTpEbwsIJj_9RAhx9-X_rn7v-O_zUgVkZrGTkn4u1pUPiP7Gdo0_j0hxZNerOuGKV7CrybOIHcpXeLpIPbhQLBcm0NYV8gQYCYw-McM4r-E2URgUEMS1r3BWtvejzurcPGGIpc4n9rLptNTk9Kp8WQZlvp_63hzfusVisQi11C4uP6Mq_31Tis8iySvR4YRSeUXFTZbY2Xsg7HRNV6xmBSh9TB7Hb1_WE7xEPVBtRpWY5UzEatKV4R1llUcZJsb6PZqqRPxIacBzp0IN60FqqGEqlMU7THlyw8cF9-iY-NumnwQDQN9bwLI0bOV9Ac7RqgexJjRCWlsO056wHHZr1E21FtDc'}` // Replace 'Bearer' with the appropriate authentication scheme (e.g., 'Bearer', 'Basic')
            }
        });
        return fetchData.json();
    }, apiUrl);
    // Output the API response
    console.log("Row count is ", response.result.data.list.length);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('test_pricing.xlsx');
    // Get the first worksheet
    const worksheet = workbook.getWorksheet('Sheet2');
    for (let index = 0; index < response.result.data.list.length; index++) {
        let st_code = response.result.data.list[index].stock_code;
        let desc = response.result.data.list[index].description;
        let list = response.result.data.list[index].list_price;
        let discount = response.result.data.list[index].discount_code;
        let prod = response.result.data.list[index].product_class;
        let suppl = vendor; let UOM = ''; let POPrice = ''; let MinPOQty = '';
        // console.log(st_code, desc, list, discount, prod);
        // Add data
        const data = [
            [suppl, st_code, desc, UOM, list, POPrice, discount, MinPOQty, prod]
        ];
        data.forEach(row => {
            worksheet.addRow(row);
        });
        // Write the workbook to a file
        console.log('Row ' + (index + 1));
    }
    await workbook.xlsx.writeFile('test_pricing.xlsx');
    // return response;
    //
    //
}
async function verifyTwoExcelData(page) {
    let excel_data = await read_excel_data('test_pricing.xlsx', 1);
    let yask_data = await read_excel_data('Yaskawa 2024 Pricelist Import.xlsx', 0);
    console.log('yaskawa price list rows count is ', yask_data.length);
    console.log('test pricing list rows count is ', excel_data.length);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('test_pricing.xlsx');
    for (let index = 0; index < excel_data.length; index++) {
        //test_priding file Sheet2 Data
        let supplT = excel_data[index]['Supplier(7)'];
        let stockT = excel_data[index]['VendorStockCode(30)'];
        let descT = excel_data[index]['VendorDescription(30)'];
        let lpT = excel_data[index].ListPrice;
        let dcT = excel_data[index].DiscountCode;
        let prodT = excel_data[index]['ProductClass(4)'];
        for (let index1 = 0; index1 < yask_data.length; index1++) {
            //YASKAWA Pricing 2024 file Sheet1 Data
            let supplY = yask_data[index1]['Supplier(7)'];
            let stockY = yask_data[index1]['VendorStockCode(30)'];
            let descY = yask_data[index1]['VendorDescription(30)'];
            let lpY = yask_data[index1].ListPrice;
            let dcY = yask_data[index1].DiscountCode;
            let prodY = yask_data[index1]['ProductClass(4)'];
            if (stockT === stockY) {
                console.log(stockT, ' ', stockY);
                console.log('test file row no ', (index + 1));
                console.log('yeskawa original file row no ', (index1 + 1));
                // Get the first worksheet
                const worksheet = workbook.getWorksheet('Sheet3');
                const data = [
                    [supplT, supplY, stockT, stockY, descT, descY, lpT, lpY, dcT, dcY, prodT, prodY]
                ];
                data.forEach(row => {
                    worksheet.addRow(row);
                });
                break;
            } else {

            }
        }
    }
    // Write the workbook to a file
    await workbook.xlsx.writeFile('test_pricing.xlsx');
}
async function nonSPAPrice(page, customer, item, purchaseDiscount, buyPrice, discountType, discountValue, testCount, qurl, fp) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let vendor = testdata.vendor, testResults, quoteURL;
    await page.getByRole('button', { name: 'Pricing expand' }).click();
    await page.getByRole('menuitem', { name: 'Non Standard Pricing' }).click();
    await page.getByRole('button', { name: 'Configure' }).click();
    await page.locator('div').filter({ hasText: /^Company Name\*Search$/ }).getByLabel('open').click();
    await page.keyboard.insertText(customer);
    await page.locator("(//*[text() = '" + customer + "'])[2]").click();
    await page.getByPlaceholder('MM/DD/YYYY-MM/DD/YYYY').click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    let sDate = await page.getByPlaceholder('MM/DD/YYYY-MM/DD/YYYY').getAttribute('value');
    let startDate = sDate.replace(" - ", "");
    let eDate = startDate.substring(3, 5);
    for (let index = 0; index < 12; index++) {
        await page.getByLabel('Next Month').click();
    }
    await page.locator("(//*[text() = '" + eDate + "'])[1]").click();
    await page.getByPlaceholder('Enter Client Quote Number').fill('TEST123434');
    await page.locator('div').filter({ hasText: /^Supplier\*Search$/ }).getByLabel('open').click();
    await page.keyboard.insertText(vendor);
    await page.locator("(//*[text() = '" + vendor + "'])[2]").click();
    await page.locator("(//*[text() = 'Select '])[1]").click();
    await page.keyboard.insertText('Specific Item');
    await page.keyboard.press('Enter');
    await page.locator('div').filter({ hasText: /^ItemsSearch$/ }).getByLabel('open').click();
    await page.keyboard.insertText(item);
    await page.locator("(//*[text() = '" + item + "'])[2]").click();
    await page.locator('[id="pricing_rules\\.0\\.buy_side_discount"]').fill(purchaseDiscount);
    await page.getByPlaceholder('Enter Buy Price').fill(buyPrice);
    await page.locator('div').filter({ hasText: /^Select%$/ }).getByLabel('open').click();
    await page.getByText(discountType, { exact: true }).click();
    await page.locator('[id="pricing_rules\\.0\\.type_value"]').fill(discountValue);
    await page.locator('//*[@id = "pricing_rules.0.fixed_value"]').fill(fp);
    await page.getByRole('button', { name: 'Preview Items' }).click();
    await expect(page.locator("//*[text() = 'more']")).toBeHidden();
    let icp = await page.locator("//*[@style = 'left: 891px; width: 120px;']").textContent();
    let listIIDMCost = icp.replace(",", "").replace("$", "");
    let lBP = await page.locator("//*[@style = 'left: 751px; width: 140px;']").textContent();
    let listBuyPrice = lBP.replace(",", "").replace("$", "");
    let lp = await page.locator("//*[@style = 'left: 611px; width: 140px;']").textContent();
    let listPrice = lp.replace(",", "").replace("$", "");
    let lSP = await page.locator("//*[@style = 'left: 1718px; width: 117px;']").textContent();
    let listSellPrice = lSP.replace(",", "").replace("$", "");
    let buyPriceInListViewCalc; let sellPriceInListViewCalc;
    console.log(ANSI_ORANGE, 'Pricing Rule Applied Item is ', item, ANSI_RESET);
    console.log('buy price ', listBuyPrice);
    console.log('sell price ', listSellPrice);
    console.log('list price ', listPrice);
    console.log('IIDM Cost ', listIIDMCost);
    if (buyPrice == '' && purchaseDiscount != '') {
        buyPriceInListViewCalc = (parseFloat(listPrice)) - ((parseFloat(listPrice)) * parseInt(purchaseDiscount) / 100).toFixed("2");
        console.log('buy price is ', buyPriceInListViewCalc, ' is calculated from purchase discount on list price.');

    } else {
        buyPriceInListViewCalc = buyPrice;
        console.log('buy price is ', buyPriceInListViewCalc, ' is directly given as buy price.');
        if (listBuyPrice == NaN) {
            buyPriceInListViewCalc = NaN;
        }
    }
    if (buyPriceInListViewCalc == listBuyPrice) {
        console.log('calculated buy price ', buyPriceInListViewCalc);
        console.log('buyprice calculation passed, at preview items page');
        if (discountType === 'Markup') {
            if (buyPrice == '' && purchaseDiscount == '') {
                sellPriceInListViewCalc = ((parseFloat(listIIDMCost)) + ((parseFloat(listIIDMCost)) * parseInt(discountValue) / 100)).toFixed("2");;
            } else {
                sellPriceInListViewCalc = ((buyPriceInListViewCalc + (buyPriceInListViewCalc * parseInt(discountValue) / 100))).toFixed("2");
                buyPrice = buyPriceInListViewCalc;
            }
        } else {
            sellPriceInListViewCalc = ((parseFloat(listPrice)) - ((parseFloat(listPrice)) * parseInt(discountValue) / 100)).toFixed("2");
        }
        if (sellPriceInListViewCalc == listSellPrice) {
            console.log('calculated sell price ', sellPriceInListViewCalc);
            console.log('sell price calculation passed, at preview items page and type is ', discountType);
            await page.locator('div').filter({ hasText: /^Apply Rule$/ }).getByRole('button').click();
            await page.getByRole('tab', { name: 'Items' }).click();
            await expect(page.getByRole('gridcell', { name: 'loading', exact: true }).getByRole('img')).toBeVisible();
            let bpil = await page.locator("//*[@style = 'left: 720px; width: 140px;']").textContent();
            let buyPriceItemList = bpil.replace("$", "").replace(",", "");
            let spil = await page.locator("//*[@style = 'left: 1580px; width: 100px;']").textContent();
            let sellPriceItemList = spil.replace("$", "").replace(",", "");
            if (buyPriceItemList == buyPriceInListViewCalc && sellPriceItemList == sellPriceInListViewCalc) {
                console.log('sell price and buy price calculation passed, at items list page');
                await page.getByRole('tab', { name: 'SPA Logs' }).click();
                await page.getByTitle(item).click();
                await expect(page.locator("(//*[text() = 'more'])[2]")).toBeHidden();
                let lBP = await page.locator("//*[@style = 'left: 751px; width: 140px;']").textContent();
                let cardBuyPrice = lBP.replace(",", "").replace("$", "");
                let clp = await page.locator("//*[@style = 'left: 611px; width: 140px;']").textContent();
                let cardListPrice = clp.replace("$", "").replace(",", "");
                spil = await page.locator("//*[@style = 'left: 1718px; width: 117px;']").textContent();
                let cardSellPrice = spil.replace("$", "").replace(",", "");
                if (buyPriceItemList == cardBuyPrice && sellPriceItemList == cardSellPrice && cardListPrice == listPrice) {
                    console.log('sell price, buy price and list price calculation passed, at spa logs card view');
                    testResults = true;
                } else {
                    console.log('sell price, buy price and list price calculation Failed, at spa logs card view');
                    testResults = false;
                }
            } else {
                console.log('sell price and buy price calculation failed, at items list page');
                testResults = false;
            }
        } else {
            console.log('calculated sell price ', sellPriceInListViewCalc);
            console.log('sell price calculation failed, at preview items page and type is ', discountType);
            testResults = false;
        }
    } else {
        console.log('calculated buy price ', buyPriceInListViewCalc);
        console.log('buyprice calculation failed, at preview items page');
        testResults = false;
    }
    await page.goBack();
    if (testResults) {
        //Create quote for these items
        quoteURL = await addSPAItemsToQuote(page, customer, 'Parts Quote', item, testCount, qurl, fp, sellPriceInListViewCalc, purchaseDiscount, buyPrice, listIIDMCost);
        console.log('status at quotes is ', quoteURL[1]);
        if (quoteURL[1]) {
            testResults = true;
        } else {
            testResults = false;
        }
    } else {

    }
    return [testResults, quoteURL[0]];
}
async function itemNotesLineBreaks(page, stage_url) {
    let quoteIds = [
        '3399173b-9bb2-44f4-a0f5-18ed6210db49',
        'd3c8a32f-d9be-4ba1-9dca-9471130ee105',
        '2979c2d7-d5dd-4eb1-8578-d153e65fac4c'
    ]; let status; let testResults = [];
    for (let index = 0; index < quoteIds.length; index++) {
        await page.goto(stage_url + 'all_quotes/' + quoteIds[index]);
        await delay(page, 2000);
        let loopCount; let verText; let ltextCount;
        if (index == 2) {
            loopCount = 2
            verText = 'Serial Number: 1234LIC1.testitemnotes'
            ltextCount = 4
        } else {
            if (index == 1) {
                loopCount = 2
            } else {
                loopCount = 1
            }
            verText = 'testitemnotes', ltextCount = 3
        }
        let text = await page.locator("(//h4[contains(@class, 'line-clamp two-lines')])[" + loopCount + "]").textContent();
        let textCount = await page.locator("(//h4[contains(@class, 'line-clamp two-lines')])[" + loopCount + "]/span/p").count();
        // console.log('text count is ', textCount);
        if ((text == verText) && (textCount == ltextCount)) {
            console.log('line breaks working... at item notes for', await page.textContent("(//*[@class='description'])[2]"))
            // console.log('displaying text is ' + text)
            // console.log('expected text is\n' + verText)
            testResults.push(true)
            console.log('status is: ', testResults[index])
        } else {
            console.log('line breaks are not working... at item notes for', await page.textContent("(//*[@class='description'])[2]"))
            console.log('displaying text is ' + text)
            console.log('expected text is\n' + verText)
            testResults.push(false)
            console.log('status is: ', testResults[index])
        }
    }
    if ((testResults[0] && testResults[1] && testResults[2] == true)) {
        status = true
    } else {
        status = false
    }
    return status;
}
async function defaultTurnAroundTime(page, acc_num, cont_name, isCreateNew, stock_code, tech, repair_type, stage_url) {
    if (isCreateNew) {
        await createRMA(page, acc_num, cont_name)
        // await page.goto(stage_url + 'repair-request/724c34b8-fa4c-42bb-b89a-b6fec622bf26')
        await itemsAddToEvaluation(page, stock_code, tech, repair_type)
        await addItemsToQuote(page)
    } else {
        await page.goto(stage_url + 'all_quotes/22bcca0f-d6a1-45f2-b194-7fea2a13346b')
    } let getResults;
    await expect(page.locator("(//*[text()='Item Notes:'])[1]")).toBeVisible()
    await delay(page, 1500)
    let itemsCount = await page.locator("//*[text()='Item Notes:']").count();
    for (let index = 0; index < itemsCount; index++) {
        let turnArroundTime = await page.locator("//*[@id='repair-items']/div[2]/div[1]/div[" + (index + 1) + "]/div/div[2]/div[3]/div[4]").textContent()
        if (turnArroundTime == 'Turn around time:2-3 Week(s)') {
            getResults = true
        } else {
            getResults = false
            break
        }
        console.log(stock_code[index] + ' default ' + turnArroundTime + ' status is: ' + getResults)
    }
    return getResults;
}
async function websitePaddingTesting(browser) {
    const context = await browser.newContext();

    // Open first tab (page)
    const page = await context.newPage();

    let w = 1920, h = 910; let getResults;
    // let w = 1280, h = 551;
    await page.setViewportSize({
        width: w,
        height: h
    });
    const page2 = await context.newPage();
    await page2.setViewportSize({
        width: w,
        height: h
    });
    await page.keyboard.press('Control+Tab');
    try {
        await page.waitForTimeout(1500);
        //Tracing started
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('Website_Padding.xlsx');
        const worksheet = workbook.getWorksheet('Sheet1');
        let test_data = await read_excel_data('Website_Padding.xlsx', 0);
        console.log('Total URLs Count is ', test_data.length);
        for (let index = 0; index < test_data.length; index++) {
            console.log('====================================================== page ', (index + 1), '=============================================');
            //test_priding file Sheet2 Data
            let pageName = test_data[index]['Page Name'];
            let pageURL = test_data[index]['URL'];
            let status = test_data[index]['Results'];
            await page.goto(pageURL);
            let warpper = await page.locator("(//*[@class = 'bt_bb_row_wrapper'])");
            let rowsCountInPage = 'count of rows in ' + pageName + ': ' + await warpper.count();
            console.log(rowsCountInPage);
            let data;
            for (let i = 0; i < await warpper.count(); i++) {
                let eles = await page.locator("(//*[@class = 'bt_bb_row_wrapper'])[" + (i + 1) + "]");
                // console.log(await eles.textContent());
                const styles = await eles.evaluate(element => {
                    const computedStyle = window.getComputedStyle(element);
                    return {
                        width: computedStyle.width,
                        height: computedStyle.height,
                        backgroundColor: computedStyle.backgroundColor,
                    };
                });
                // console.log(i + 1, ' wrapper Element styles:', styles);
                let width = styles['width'];
                console.log(i + 1, ' row width: ', width);
                let w = parseFloat(width.replace("px", ""));
                if (w < 1321) {
                    // console.log(ANSI_GREEN, 'Padding is Working', ANSI_RESET);
                    worksheet.getCell(`C` + (index + 2)).value = 'Passed';
                } else {
                    // console.log(ANSI_RED, 'Padding is not Working', ANSI_RESET);
                    worksheet.getCell(`C` + (index + 2)).value = 'Failed';
                    await workbook.xlsx.writeFile('Website_Padding.xlsx');
                    break;
                }
                data = [rowsCountInPage, i + ' row width: ' + width];
                await page.keyboard.press('Control+Tab');
                await page2.goto('https://pagespeed.web.dev/');
                await page2.fill("//*[@placeholder = 'Enter a web page URL']", pageURL);
                await page2.click('//*[text() = "Analyze"]');
                let list = ['Performance', 'Accessibility', 'Best Practices', 'SEO'];
                let cln = ['E', 'F', 'G', 'H'];
                let rws = ['I', 'J', 'K', 'L'];
                for (let tabs = 2; tabs <= 4; tabs = tabs + 2) {
                    console.log('outer loop');
                    for (let pl = 0; pl < list.length; pl++) {
                        console.log('inner loop');
                        let xpath = "(//*[@href='#" + list[pl].toLowerCase().replace(" ", "-") + "'])[" + tabs + "]";
                        await expect(page2.locator(xpath)).toBeVisible({ timeout: 120000 });
                        await page2.waitForTimeout(2000);
                        let mobile = await page2.textContent(xpath);
                        // console.log(mobile);
                        let value;
                        if (list[pl] == 'Performance' || list[pl] == 'Accessibility' || list[pl] == 'Best Practices' || list[pl] == 'SEO') {
                            value = await mobile.replace(list[pl], "").replace(" ", "");
                        }
                        console.log(list[pl], ' is: ', value);
                        if (tabs == 2) {
                            worksheet.getCell(cln[pl] + (index + 2)).value = value;
                        } else {
                            worksheet.getCell(rws[pl] + (index + 2)).value = value;
                        }
                    }
                    await page2.click('//*[text()="Desktop"]');
                    consolel.log('desktop-----------------------');
                }
            }
        }
        await workbook.xlsx.writeFile('Website_Padding.xlsx');
        getResults = true;
    } catch (error) {
        console.log(error);
        getResults = false;
    }
    return getResults;
}
async function verifySPAExpiryMails(page) {
    console.log('------------------------.--------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let testResults;
    let customer = ['MULTI00', 'ZUMMO00', 'MADIX00'];
    let supplier = ['WAGO001', 'WEIN001', 'SWIV001'];
    let item = ['2000-115', 'CMT2108X2', 'AFC-1002-75-OR'];
    // let oneMonth = 1;
    let oneMonth = 3;
    try {
        for (let i = 0; i < customer.length; i++) {
            await page.getByRole('button', { name: 'Pricing expand' }).click();
            await page.getByRole('menuitem', { name: 'Non Standard Pricing' }).click();
            await page.getByRole('button', { name: 'Configure' }).click();
            await page.locator('div').filter({ hasText: /^Company Name\*Search$/ }).getByLabel('open').click();
            await page.keyboard.insertText(customer[i]);
            await page.locator("(//*[text() = '" + customer[i] + "'])[2]").click();
            await page.getByPlaceholder('MM/DD/YYYY-MM/DD/YYYY').click();
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowUp');
            await page.keyboard.press('Enter');
            let sDate = await page.getByPlaceholder('MM/DD/YYYY-MM/DD/YYYY').getAttribute('value');
            let startDate = sDate.replace(" - ", "");
            let eDate = startDate.substring(3, 5);
            for (let index = 0; index < oneMonth; index++) {
                await page.getByLabel('Next Month').click();
            }
            if (parseInt(eDate) < 10) {
                await page.locator("(//*[text() = '" + eDate.replace('0', '') + "'])[1]").click();
            } else {
                await page.locator("(//*[text() = '" + eDate + "'])[1]").click();
            }
            await page.getByPlaceholder('Enter Client Quote Number').fill('FORTEST00', (i + 1));
            await page.locator('div').filter({ hasText: /^Supplier\*Search$/ }).getByLabel('open').click();
            await page.keyboard.insertText(supplier[i]);
            await page.locator("(//*[text() = '" + supplier[i] + "'])[2]").click();
            await page.locator("(//*[text() = 'Select '])[1]").click();
            await page.keyboard.insertText('Specific Item');
            await page.keyboard.press('Enter');
            await page.locator('div').filter({ hasText: /^ItemsSearch$/ }).getByLabel('open').click();
            await page.keyboard.insertText(item[i]);
            await page.locator("(//*[text() = '" + item[i] + "'])[2]").click();
            await page.locator('[id="pricing_rules\\.0\\.buy_side_discount"]').fill('26');
            await page.getByPlaceholder('Enter Buy Price').fill('256.25');
            await page.locator('div').filter({ hasText: /^Select%$/ }).getByLabel('open').click();
            await page.getByText('Markup', { exact: true }).click();
            await page.locator('[id="pricing_rules\\.0\\.type_value"]').fill('54');
            await page.locator('//*[@id = "pricing_rules.0.fixed_value"]').fill('25.23');
            await page.locator("//*[text()='Apply Rule']").click();
            await expect(page.getByRole('button', { name: 'Configure' })).toBeVisible();
        }
        testResults = true;
    } catch (error) {
        testResults = false;
        console.log(error)
    }
    return testResults;
}
async function addSPAItemsToQuote(page, customer, quoteType, items, testCount, qurl, fixedSalesPrice, sellPrice, purchaseDiscount, buyPrice, listIIDMCost) {
    let quoteURL, testResults;
    try {
        await page.getByText('Quotes', { exact: true }).first().click();
        await expect(allPages.profileIconListView).toBeVisible();
        if (testCount == 1) {
            await page.locator('div').filter({ hasText: /^Create Quote$/ }).nth(1).click();
            await expect(page.getByText('Search By Account ID or')).toBeVisible();
            await page.locator('div').filter({ hasText: /^Company Name\*Search By Account ID or Company Name$/ }).getByLabel('open').click();
            await page.getByLabel('Company Name*').fill(customer);
            await expect(page.getByText(customer, { exact: true }).nth(1)).toBeVisible();
            await page.getByText(customer, { exact: true }).nth(1).click();
            await page.getByText('Quote Type').nth(1).click();
            await page.getByText(quoteType, { exact: true }).click();
            await page.getByPlaceholder('Enter Project Name').fill('for testing spa Items');
            await page.locator('div').filter({ hasText: /^Create Quote$/ }).nth(4).click();
            await page.getByRole('button', { name: 'Create Quote' }).click();
            await expect(page.locator('#repair-items')).toContainText('Quote item(s) Not Available');
            let quote = await page.locator('(//*[@class = "id-num"])[1]').textContent();
            let quote_id = quote.replace("#", "");
            quoteURL = await page.url();
            console.log('quote is created with id ', quote_id);
            console.log('quote url is ', quoteURL);
        } else {
            quoteURL = qurl;
            await page.goto(quoteURL);
        }
        await page.getByText('Add Items').click();
        await page.getByPlaceholder('Search By Part Number').fill(items);
        await page.locator('(//*[@id="tab-0-tab"]/div[1]/div[2]/div/div[1]/div)[1]').click();
        await page.getByRole('button', { name: 'Add Selected 1 Items' }).click();
        await spinner(page);
        let qp = await page.locator('//*[@id="repair-items"]/div[2]/div[1]/div[' + testCount + ']/div/div[2]/div[3]/div[1]/h4').textContent();
        let quotePrice = qp.replace(",", "").replace("$", "");
        let ic = await page.locator('//*[@id="repair-items"]/div[2]/div[1]/div[' + testCount + ']/div/div[2]/div[3]/div[3]/h4').textContent();
        let iidmCost = ic.replace(",", "").replace("$", "");
        if (fixedSalesPrice == '') {
            if (quotePrice == sellPrice) {
                console.log('Quote price is ', quotePrice);
                console.log('sell price is ', sellPrice);
                console.log('displaying sell price as quote price in quote detailed view, is passed.');
                if (purchaseDiscount == '' && buyPrice == '') {
                    if (iidmCost.includes(listIIDMCost)) {
                        console.log('iidm cost in quotes is ', iidmCost);
                        console.log('iidm cost in SPA is ', listIIDMCost);
                        console.log('displaying SPA iidm cost as a IIDM cost in quote detailed view, is passed.');
                    } else {
                        console.log('iidm cost in quotes is ', iidmCost);
                        console.log('iidm cost in SPA is ', listIIDMCost);
                        console.log('displaying SPA iidm cost as a IIDM cost in quote detailed view, is failed.');
                    }
                } else {
                    if (iidmCost.includes(buyPrice)) {
                        console.log('iidm cost in quotes is ', iidmCost);
                        console.log('buy price is ', buyPrice);
                        console.log('displaying buy price as a IIDM cost in quote detailed view, is passed.');
                    } else {
                        console.log('iidm cost in quotes is ', iidmCost);
                        console.log('buy price is ', buyPrice);
                        console.log('displaying buy price as a IIDM cost in quote detailed view, is failed.');
                    }
                }
            } else {
                console.log('Quote price is ', quotePrice);
                console.log('sell price is ', sellPrice);
                console.log('displaying sell price as quote price in quote detailed view, is failed');
            }
        } else {
            if (quotePrice == fixedSalesPrice) {
                console.log('Quote price is ', quotePrice);
                console.log('fixed sales price is ', fixedSalesPrice);
                console.log('displaying fixed sales price as a quote price in quote detailed view, is passed.');
            } else {
                console.log('Quote price is ', quotePrice);
                console.log('fixed sales price is ', fixedSalesPrice);
                console.log('displaying fixed sales price as a quote price in quote detailed view, is failed');
            }
        }
        testResults = true;
    } catch (error) {
        testResults = false;
    }
    return [quoteURL, testResults];
}
async function addFunctionInAdminTabs(page) {
    await page.getByText('Admin').click();
    await page.getByRole('gridcell', { name: 'H20' }).click();
    await page.getByRole('gridcell', { name: 'H20' }).press('Control+c');
    await page.getByText('Add', { exact: true }).click();
    await page.getByPlaceholder('Name').fill('H20');
    await page.locator('div').filter({ hasText: /^Select$/ }).nth(2).click();
    await page.keyboard.insertText('PO');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('The Name is already taken')).toBeVisible();
    await page.getByTitle('close').getByRole('img').click();
    await page.locator('#root').getByText('Branches').click();
    await page.getByRole('gridcell', { name: 'Baton Rouge' }).click();
    await page.getByRole('gridcell', { name: 'Baton Rouge' }).press('Control+c');
    await page.getByText('Add', { exact: true }).click();
    await page.getByPlaceholder('Enter Name').fill('Baton Rouge');
    await page.getByPlaceholder('Enter Email ID').fill('test@epi.com');
    await page.getByPlaceholder('Enter Branch ID').fill('12test');
    await page.getByText('Select').first().click();
    await page.getByText('Aaron Hanning', { exact: true }).click();
    await page.getByText('Select', { exact: true }).click();
    await page.keyboard.insertText('Region1');
    await page.keyboard.press('Enter');
    await page.getByPlaceholder('Enter State').fill('TXS');
    await page.getByPlaceholder('Enter City').fill('columbia');
    await page.getByPlaceholder('Enter Zip Code').fill('12345');
    await page.getByPlaceholder('Enter Fax').fill('121.123.1234');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('The Name is already taken')).toBeVisible();
    await page.getByTitle('close').getByRole('img').click();
    await page.locator('#root').getByText('Classifications').click();
    await page.getByRole('gridcell', { name: 'Competitor' }).click();
    await page.getByRole('gridcell', { name: 'Competitor' }).press('Control+c');
    await page.getByText('Add', { exact: true }).click();
    await page.getByPlaceholder('Name').fill('Competitor');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('The Name is already taken')).toBeVisible();
    await page.getByTitle('close').getByRole('img').click();
    await page.locator('#root div').filter({ hasText: /^Contact Types$/ }).first().click();
    await page.getByRole('gridcell', { name: 'Engineering' }).click();
    await page.getByRole('gridcell', { name: 'Engineering' }).press('Control+c');
    await page.getByText('Add', { exact: true }).click();
    await page.getByPlaceholder('Name').fill('Engineering');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('The Name is already taken')).toBeVisible();
    await page.getByTitle('close').getByRole('img').click();
    await page.locator('#root div').filter({ hasText: /^Industries$/ }).first().click();
    await page.getByRole('gridcell', { name: 'Agriculture' }).click();
    await page.getByRole('gridcell', { name: 'Agriculture' }).press('Control+c');
    await page.getByText('Add', { exact: true }).click();
    await page.getByPlaceholder('Name').fill('Agriculture');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('dialog')).toContainText('The Name is already taken');
    await page.getByTitle('close').getByRole('img').click();
    await page.locator('#root div').filter({ hasText: /^PO Min Qty$/ }).first().click();
    await page.getByRole('gridcell', { name: '1000' }).click();
    await page.getByText('Add', { exact: true }).click();
    await page.getByPlaceholder('Enter Quantity').fill('1000');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('The Quantity already exists')).toBeVisible();
    await page.getByTitle('close').getByRole('img').click();
    await page.locator('#root div').filter({ hasText: /^Product Category$/ }).first().click();
    await page.locator('#root div').filter({ hasText: /^Product Class$/ }).first().click();
    await page.locator('#root div').filter({ hasText: /^QC Forms$/ }).first().click();
    await page.getByPlaceholder('Enter Name').click();
    await page.getByPlaceholder('Enter Name').press('Control+a');
    await page.getByPlaceholder('Enter Name').press('Control+c');
    await page.getByText('Add').first().click();
    await page.locator('input[name="name"]').fill('Drive QC');
    await page.getByRole('button', { name: 'Add QC Form' }).click();
    await expect(page.getByText('The Name is already taken')).toBeVisible();
    await page.getByTitle('close').getByRole('img').click();
    await page.locator('#root div').filter({ hasText: /^Quote Approval$/ }).first().click();
    await page.getByRole('button', { name: 'Approve' }).click();
    await expect(page.locator('div').filter({ hasText: /^Updated Successfully$/ }).nth(2)).toBeVisible();
    await page.locator('#root div').filter({ hasText: /^Quote Types$/ }).first().click();
    await page.getByRole('gridcell', { name: 'Parts Quote' }).first().click();
    await page.getByText('Add', { exact: true }).click();
    await page.getByPlaceholder('Name').fill('Parts Quote');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('The Name is already taken')).toBeVisible();
    await page.getByTitle('close').getByRole('img').click();
    await page.locator('#root div').filter({ hasText: /^Regions$/ }).first().click();
    await page.getByRole('gridcell', { name: 'Region1' }).click();
    await page.getByText('Add', { exact: true }).click();
    await page.getByPlaceholder('Enter Name').fill('Region1');
    await page.locator('.react-select__value-container').click();
    await page.getByText('Aaron Hanning', { exact: true }).click();
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('The Name is already taken')).toBeVisible();
    await page.getByTitle('close').getByRole('img').click();
    await page.locator('div').filter({ hasText: /^Sales Potential$/ }).first().click();
    await page.getByRole('gridcell', { name: 'Test_SP1' }).click();
    await page.getByText('Add', { exact: true }).click();
    await page.locator('div').filter({ hasText: /^Name\*StatusActiveDescription$/ }).nth(1).click();
    await page.getByPlaceholder('Name').fill('Test_SP1');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('The Name is already taken')).toBeVisible();
    await page.getByTitle('close').getByRole('img').click();
    await page.locator('#root div').filter({ hasText: /^Terms Conditions$/ }).first().click();
    await page.locator('div').filter({ hasText: /^Territories$/ }).first().click();
    await page.getByRole('gridcell', { name: 'Test Territory3' }).click();
    await page.getByText('Add', { exact: true }).click();
    await page.getByPlaceholder('Enter Name').fill('Test Territory3');
    await page.locator('.react-select__value-container').first().click();
    await page.keyboard.insertText('Region1');
    await page.keyboard.press('Enter');
    await page.getByPlaceholder('Enter Territory Code').fill('123411');
    await page.locator("(//*[text() = 'Select '])[1]").click();
    await page.keyboard.insertText('Dallas');
    await page.keyboard.press('Enter');
    await page.locator("(//*[text() = 'Select '])[1]").click();
    await page.keyboard.insertText('Aaron Hanning');
    await page.keyboard.press('Enter');
    await page.locator("(//*[text() = 'Select '])[1]").click();
    await page.keyboard.insertText('Aaron Hanning');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('The Name is already taken')).toBeVisible();
    await page.getByTitle('close').getByRole('img').click();
    await page.locator('div').filter({ hasText: /^Users$/ }).first().click();
    await page.getByText('Aaron Hanning').first().click();
    await page.getByTitle('Aaron Hanning').click({
        clickCount: 3
    });
    await page.getByTitle('Aaron Hanning').click();
    await page.locator('body').press('Control+c');
    await page.getByText('Add', { exact: true }).click();
    await page.getByPlaceholder('Enter First Name').fill('Aaron Hanning');
    await page.getByPlaceholder('Enter First Name').press('Control+Shift+ArrowLeft');
    await page.getByPlaceholder('Enter First Name').press('Shift+ArrowLeft');
    await page.getByPlaceholder('Enter First Name').press('Control+x');
    await page.getByPlaceholder('Enter Last Name').fill(' Hanning');
    await page.getByRole('button', { name: 'Add User' }).click();
    await page.getByPlaceholder('Enter Last Name').fill('Hanning');
    await page.getByTitle('close').getByRole('img').click();
    await page.locator('#root div').filter({ hasText: /^User Roles$/ }).first().click();
    await page.getByText('Add', { exact: true }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByText('Add', { exact: true }).click();
    await page.getByPlaceholder('Name', { exact: true }).click();
    await page.getByPlaceholder('Name', { exact: true }).fill('Test User Role');
    await page.getByRole('button', { name: 'Add User Role' }).click();
    await expect(page.getByText('The Name already exists')).toBeVisible();
    await page.getByTitle('close').getByRole('img').click();
    await page.locator('#root div').filter({ hasText: /^Vendors$/ }).first().click();
    await page.getByRole('gridcell', { name: '-00' }).click();
    await page.getByText('Add', { exact: true }).click();
    await page.getByLabel('Vendor Code (Syspro ID)*').fill('051356-00');
    await page.getByRole('button', { name: 'Reset' }).click();
    await page.getByTitle('close').getByRole('img').click();
    await page.locator('div').filter({ hasText: /^Warehouse$/ }).first().click();
    await page.getByRole('gridcell', { name: 'INNOVATIVE IDM-DALLAS' }).click();
    await page.locator('div').filter({ hasText: /^Zip Codes$/ }).first().click();
    await page.getByText('Add', { exact: true }).click();
    await page.getByPlaceholder('Enter Zip Code').fill('10091');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('The zip code is already taken')).toBeVisible();
    await page.getByTitle('close').getByRole('img').click();
    await page.waitForTimeout(2000);
}
async function addStockInventorySearch(page, testCount) {
    let getResults = []; let vals = ['No', 'Yes']; let btns = ['View', 'Edit'];
    for (let index = 0; index < vals.length; index++) {
        await search_user(page, 'defaultuser@enterpi.com'); let yesBtn;
        if (testCount == 1) {
            yesBtn = page.locator("(//*[text()='" + vals[index] + "'])[4]");
        } else {
            let count; if (index == 0) { count = 21; } else { count = 22; }
            yesBtn = page.locator("(//*[text()='" + btns[index] + "'])[" + count + "]");
        }
        await yesBtn.scrollIntoViewIfNeeded();
        await delay(page, 2000);
        await yesBtn.click();
        try {
            await page.getByRole('button', { name: 'Save' }).click({ timeout: 2500 });
            await expect(page.getByLabel('Permissions')).toContainText('Are you sure you want to update changes?');
            await page.getByLabel('Permissions').getByRole('button', { name: 'Accept' }).click();
            await expect(page.getByText('Updated Successfully').nth(1)).toBeVisible();
            await page.reload();
        } catch (error) { await page.reload(); }
        await page.getByText('Inventory').first().click();
        await page.getByText('Search by Stock Code').click();
        await page.keyboard.insertText('4567438576385testing');
        await expect(page.getByText('Loading...')).toBeHidden();
        let addStockButton = page.locator("//*[@class='button-icon-text' and text()='Add Stock Code']");
        try {
            if (testCount == 1) {
                await expect(addStockButton).toBeVisible();
                await addStockButton.click();
                await expect(page.locator("//*[text()='Add Stock Line Items']")).toBeVisible();
                await delay(page, 2000);
                let res = true;
                getResults.push(res);
            } else {
                await page.pause()
                await expect(page.getByText('For the searched stock code,')).toBeVisible();
                await delay(page, 2000);
                let res = true;
                getResults.push(res);
            }
        }
        catch (error) { console.log('errors ', error); getResults = false; let res = false; getResults.push(res); }
        if (testCount == 1) {
            await page.click("//*[@title='close']");
        } else { }
    }
    let res = false;
    if ((getResults[0] == true) && (getResults[1] == true)) {
        res = true;
    } else {
        res = false;
    }
    return res;
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
async function returnResult(page, testName, results) {
    try {
        expect(results).toBe(true);
        console.log(ANSI_GREEN + testName + ' Test Passed!' + ANSI_RESET);
    } catch (error) {
        console.error(ANSI_RED + testName + ' Test Failed:' + ANSI_RESET);
        // You can handle the failure here, for example, throwing an error
        // throw error;
    }
}
async function verifyingCharacterLenght(page, condition, quoteType) {
    let stockCode = testdata.stock_character;
    let getTestResults;
    if (condition == 'inventory') {
        //Inventory
        await page.getByText('Inventory').first().click();
        await page.getByText('Add Stock Code').click();
        let stCode = await page.getByPlaceholder('Stock Code');
        await stCode.fill(stockCode);
        await page.click("//*[text() = 'Add']");
        let sLenght = await stCode.getAttribute('value');
        let stockLenght = await sLenght.length;
        if (stockLenght == 30) {
            getTestResults = true;
            console.log('Stock code at ', condition, ' accepting 30 characters');
        } else {
            console.log('Stock code at ', condition, ' accepting above 30 characters');
            getTestResults = false;
        }
        await page.getByTitle('close').getByRole('img').click();
    } else if (condition == 'pricing') {
        //Pricing
        await page.getByRole('button', { name: 'Pricing expand' }).click();
        await page.getByRole('menuitem', { name: 'Pricing', exact: true }).click();
        await page.locator('div').filter({ hasText: /^Add$/ }).click();
        let pst = await page.getByPlaceholder('Enter Stock Code');
        await pst.fill(stockCode);
        await page.getByRole('button', { name: 'Add Product' }).click();
        let stlen = await pst.getAttribute('value');
        // console.log('want to fill val ', stockCode);
        // console.log('filled value ', stlen);
        let stLenght = await stlen.length;
        // console.log('filled value lenght', stLenght);
        if (stLenght == 29) {
            getTestResults = true;
            console.log('Stock code at ', condition, ' accepting 29 characters');
        } else {
            console.log('Stock code at ', condition, ' accepting above 29 characters');
            getTestResults = false;
        }
        await page.getByTitle('close').getByRole('img').click();
    } else if (condition == 'quotes') {
        //Quotes
        try {
            await page.getByText('Quotes', { exact: true }).first().click();
            await spinner(page);
            await page.getByText(quoteType, { exact: true }).first().click();
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
            await page.click("(//*[@class = 'ag-react-container'])[1]");
            await page.getByText('Add Items').click();
            await page.click("//*[text() = 'Add New Items']");
            let part = await page.getByPlaceholder('Part Number');
            await part.fill(stockCode);
            await page.click("//*[text() = 'Add']");
            let partValue = await part.getAttribute('value');
            // console.log(quoteType);
            // console.log('want to fill val ', stockCode);
            // console.log('filled value ', partValue);
            let partLen = await partValue.length;
            console.log('filled value lenght', partLen);
            if (partLen == 29) {
                console.log('Stock code at ', quoteType, ' accepting 29 characters');
                getTestResults = true;
            } else {
                console.log('Stock code at ', quoteType, ' accepting above 29 characters');
                getTestResults = false;
            }
            await page.getByTitle('close').getByRole('img').click();
        } catch (error) {
            getTestResults = false;
        }
    } else if (condition == 'repairs') {
        await page.getByText('Repairs').first().click();
        await spinner(page);
        try {
            await expect(page.getByText('Clear')).toBeVisible({ timeout: 1200 });
            await page.getByText('Clear').click();
            await spinner(page);
        } catch (error) { }
        await expect(allPages.profileIconListView).toBeVisible();
        await page.waitForTimeout(2000);
        await page.getByText('Filters').click();
        await page.getByLabel('open').nth(2).click();
        await page.keyboard.insertText('Receiving');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.keyboard.press('Escape');
        await page.getByRole('button', { name: 'Apply' }).click();
        await spinner(page);
        await page.click("(//*[@class = 'ag-react-container'])[1]");
        await page.getByText('Add Items').click();
        await page.click("//*[text() = 'Add New Items']");
        let part = await page.getByPlaceholder('Part Number');
        await part.fill(stockCode);
        await page.click("//*[text() = 'Add New Part']");
        let partValue = await part.getAttribute('value');
        // console.log(quoteType);
        // console.log('want to fill val ', stockCode);
        // console.log('filled value ', partValue);
        let partLen = await partValue.length;
        console.log('filled value lenght', partLen);
        if (partLen == 29) {
            console.log('Stock code at Repairs accepting 29 characters');
            getTestResults = true;
        } else {
            console.log('Stock code at Repairs accepting above 29 characters');
            getTestResults = false;
        }
        await page.getByTitle('close').getByRole('img').click();
    } else {
        await page.goto('https://www.staging-buzzworld.iidm.com/system_quotes/508fcf08-7fbb-4407-8df5-12f3faec2fd9');
        await expect(page.locator('#root')).toContainText('Create Sales Order');
        await page.getByText('Create Sales Order').click();
        await spinner(page);
        await expect(page.getByPlaceholder('Enter PO Number')).toBeVisible();
        try {
            await expect(page.locator("//*[contains(@src, 'addIcon')]")).toBeEnabled();
        } catch (error) {
            throw error;
        }
        await page.locator("//*[contains(@src, 'addIcon')]").click();
        await spinner(page);
        let part = await page.getByPlaceholder('Stock Code');
        let befPartValue = await part.getAttribute('value');
        await part.fill(befPartValue + 'TEST');
        let aftPartValue = await part.getAttribute('value');
        if (befPartValue.length == 29 && aftPartValue.length == 30) {
            console.log('Stock code at Sales order accepting 30 characters');
            getTestResults = true;
        } else {
            console.log('Stock code at Sales order accepting above 30 characters');
            getTestResults = false;
        }
        await page.click("(//*[contains(@src, 'cross')])[2]");
        await page.getByTitle('close').getByRole('img').click();
    }
    return getTestResults;
}
async function addTerritoryToZipcodes(page) {
    try {
        await allPages.clickAdmin;
        await page.locator("//*[text()='Zip Codes']").scrollIntoViewIfNeeded();
        await page.locator("//*[text()='Zip Codes']").click();
        await expect(page.locator("(//*[contains(@src,'editicon')])[1]")).toBeVisible();
        try {
            await page.expect(page.locator("(//*[@clip-path='url(#clip0_26540_594794)'])[2]")).toBeVisible();
            await page.locator("(//*[@clip-path='url(#clip0_26540_594794)'])[2]").click();
        } catch (error) { console.log(error) }
        await page.getByPlaceholder('Search By Zip Code').fill('00001');
        await spinner(page);
        await expect(page.getByRole('gridcell', { name: '00001' })).toBeVisible();
        await page.click("(//*[contains(@src,'editicon')])[1]");
        await expect(page.locator('h3')).toContainText('Update Zip Code');
    } catch (error) {
        console.log(error);
    }
}
async function fetchZipcodes(page) {
    // let zipcodes = await getZips();
    let zipcodes = await read_excel_data('/home/enterpi/Downloads/Omron_Deleted_Products.csv', 0);
    console.log('len is ', zipcodes.length);
    // await page.pause();
    let acc_num = []; let count = 1;
    let zip_live = await read_excel_data('/home/enterpi/Desktop/OMRO001_pricelist (1)/pricing_Omron001_qty1_products.csv', 0);
    for (let index = 0; index < zipcodes.length; index++) {
        // let sheet = zipcodes[index];
        let sheet = zipcodes[index]['model'];
        let res = false; let live;
        for (let j = 0; j < zip_live.length; j++) {
            live = zip_live[j]['Stock Code'];
            if (sheet == live) {
                res = true;
                break;
            } else {
                res = false;
            }
        }
        if (res) {
            count++;
            // console.log(sheet, ' found', ' from sheet is ' + sheet + ' from live is ' + live);
        } else {
            // console.log(sheet, ' not found', ' from sheet is ' + sheet + ' from live is ' + live);
            // acc_num.push(zipcodes[index]['accountnumber'])
            console.log(sheet + " not found in deleted data");
        }
    }
    // const uniqueArray = acc_num.filter((value, index, self) => self.indexOf(value) === index);
    console.log("founded item count is " + count);
    // console.log('total count of zip codes ', zipcodes.length);
    // for (let index = 0; index < zipcodes.length; index++) {
    //     console.log('iteration ' + (index + 1))
    //     const apiUrl = 'https://staging-buzzworld-api.iidm.com//v1/Zipcode?page=1&perPage=25&sort=asc&sort_key=zipcode&grid_name=Repairs&serverFilterOptions=%5Bobject+Object%5D&selectedCustomFilters=%5Bobject+Object%5D&search=' + zipcodes[index];
    //     // Make a GET request to the API endpoint
    //     const response = await page.evaluate(async (url) => {
    //         const fetchData = await fetch(url, {
    //             headers: {
    //                 'Authorization': `Bearer ${'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4IiwianRpIjoiYzhlNDc0MjM2ZjFjZTE2OGYwODRjNDc0YjM3MmEzZDU3YThmZDJhOTc5NmZlMjVkM2VkMWI3YjE3NzEzODdhNTYyNTljZWMzYWM0YzJkOWEiLCJpYXQiOjE3MjE5NjkwMjguNzgzMjkxLCJuYmYiOjE3MjE5NjkwMjguNzgzMjk2LCJleHAiOjE3MjMyNjUwMjguNzU4NzY0LCJzdWIiOiI2NzE0YTkyNC03YmZhLTQ5NjktODUzOC1iZjg0MTk1YjU0MWEiLCJzY29wZXMiOltdfQ.ATDdSG4zwYSroxlaqnP3PbxcJbAh-HvBSTU72Tj03CwFaJw6CiBzlMTwnIUsRH3ILDTOMW8Naz_ZbKJsHRcfPWQgjn6UwLE9wVHyRVBlA0Q1yaln0CZdOphRbqy4vYlRb9Yhhon4_jCUdQD4qfeT2FcBiZ5Na-vsiYkfsX2cxUNWA4dIm39lXjNdImBVc9acm603QNIVMcQPg0SgFZOYodebzL8Pn8BcsvxXjRx1vQqves1xXi80MjDdmUOPjvQjJ9nMXdNSXNM3xghE9CCHlTkS8RL1D-FpXHUB7ty1FoXraj8vBJIC5Q6zB-vkbLl5NefNRpf7kBklEShJfp2vWj210Nc9mdtNz5PIJrOZ5fjtXuauMz3f_8OpFfh-nTdaZ-c3DXHWkSrzf95ozs6R5QTyuXHQpe49De7Lp0DaaIUhM2ZUoyUOaWnW-4WV5b9B4t8vtQEJ4PfvVoP6a_0Bq4K6JlkQEAUAPWiICO89YA2zeJ3Hw2V5NKaCGeTOcg9hlQtbMHSfOKyr272VqkGFF0JJisMPRI0Ge7Wuw3WE9rP7dm5SoP7bj-Hrt4OpxZCZc7WcRgYBMuSlJsts6ImI5p1YDdzHkA5_ypaR44uiGXGTcTE2lSrqkeBswIGZDlscev4GQB6qT64HfiyilBKwhMUaX0Cb-C-LXRjDh9fn3xU'}` // Replace 'Bearer' with the appropriate authentication scheme (e.g., 'Bearer', 'Basic')
    //             }
    //         });
    //         return fetchData.json();
    //     }, apiUrl);
    //     let totalCount = response.result.data['total_count'];
    //     if (totalCount != '0') {
    //         let zip = response.result.data.list[0].zipcode;
    //         console.log('zip in array is ' + zipcodes[index]);
    //         console.log('zip in buzzworld is ' + zip);
    //         if (zip == zipcodes[index]) {
    //             console.log(zipcodes[index] + ' found');
    //         } else {
    //             console.log(zipcodes[index] + ' not found');
    //         }
    //     } else {
    //         console.log(zipcodes[index] + ' not found');
    //     }
    // }
}
async function delay(page, time) {
    await page.waitForTimeout(time);
}
async function getZips() {
    let zipcodes = ['16849',
        '12045',
        '98666',
        '76623',
        '24576',
        '8543',
        '93406',
        '78651',
        '78691',
        '16910',
        '14539',
        '35402',
        '90099',
        '96931',
        '28404',
        '91189',
        '19331',
        '52499',
        '33424',
        '25859',
        '62840',
        '36123',
        '20229',
        '29346',
        '11819',
        '92850',
        '79923',
        '20435',
        '21741',
        '6350',
        '37822',
        '97494',
        '68438',
        '94011',
        '4211',
        '7846',
        '14474',
        '20033',
        '90888',
        '85720',
        '97831',
        '90294',
        '46251',
        '15130',
        '55782',
        '57116',
        '95487',
        '19182',
        '92877',
        '28755',
        '22412',
        '44490',
        '72451',
        '85318',
        '25631',
        '38377',
        '54211',
        '60454',
        '54221',
        '10521',
        '47938',
        '80006',
        '29329',
        '8348',
        '783',
        '45164',
        '75368',
        '6432',
        '27427',
        '4228',
        '33081',
        '63198',
        '48764',
        '47902',
        '5451',
        '46244',
        '40512',
        '24896',
        '11202',
        '55580',
        '72353',
        '93717',
        '40999',
        '75355',
        '6701',
        '10311',
        '19730',
        '19710',
        '32121',
        '738',
        '80453',
        '33447',
        '88241',
        '87551',
        '35631',
        '47941',
        '27425',
        '95867',
        '10101',
        '35807',
        '3815',
        '16654',
        '70143',
        '72575',
        '28041',
        '92846',
        '32878',
        '60049',
        '96911',
        '45864',
        '17739',
        '17705',
        '29319',
        '42063',
        '90080',
        '78779',
        '45479',
        '33685',
        '85216',
        '20076',
        '8231',
        '35742',
        '55988',
        '18601',
        '33090',
        '40251',
        '35999',
        '19399',
        '14786',
        '36510',
        '12510',
        '86443',
        '81502',
        '97732',
        '78789',
        '42287',
        '2159',
        '15615',
        '21282',
        '35502',
        '61299',
        '19451',
        '74602',
        '24878',
        '93381',
        '77299',
        '94527',
        '56084',
        '21542',
        '87072',
        '26633',
        '25623',
        '5863',
        '38628',
        '16515',
        '40743',
        '75286',
        '12227',
        '98412',
        '19058',
        '85547',
        '49922',
        '85232',
        '21556',
        '30109',
        '29912',
        '54305',
        '28656',
        '70513',
        '39595',
        '93464',
        '3575',
        '23279',
        '33114',
        '40268',
        '40492',
        '26806',
        '48753',
        '45114',
        '27261',
        '37054',
        '84409',
        '14038',
        '47728',
        '94976',
        '12841',
        '14107',
        '48805',
        '17122',
        '43271',
        '69220',
        '27710',
        '29171',
        '45435',
        '23304',
        '43505',
        '24888',
        '45713',
        '79958',
        '82002',
        '89153',
        '46965',
        '56679',
        '29228',
        '13123',
        '40587',
        '70404',
        '10080',
        '14135',
        '32889',
        '82837',
        '78467',
        '47335',
        '70459',
        '81042',
        '85626',
        '87569',
        '8870',
        '44222',
        '48143',
        '29304',
        '25612',
        '784',
        '20439',
        '2177',
        '65808',
        '46898',
        '19429',
        '11478',
        '25647',
        '19092',
        '96152',
        '87305',
        '49903',
        '2205',
        '87594',
        '24892',
        '95229',
        '20065',
        '21870',
        '33923',
        '29850',
        '66620',
        '71452',
        '27438',
        '45469',
        '25247',
        '78206',
        '24037',
        '88590',
        '70612',
        '50631',
        '41022',
        '19181',
        '72312',
        '93384',
        '45448',
        '36741',
        '41444',
        '20080',
        '40536',
        '16843',
        '940',
        '70707',
        '85073',
        '60939',
        '39080',
        '81138',
        '89007',
        '6101',
        '29665',
        '24177',
        '44036',
        '15253',
        '97472',
        '39296',
        '33218',
        '20997',
        '12233',
        '18063',
        '99678',
        '30278',
        '90411',
        '50381',
        '18814',
        '46546',
        '12089',
        '21690',
        '60179',
        '25611',
        '38820',
        '41849',
        '79708',
        '39225',
        '33302',
        '42201',
        '8561',
        '20207',
        '13677',
        '35662',
        '20897',
        '25988',
        '66426',
        '15698',
        '95103',
        '45228',
        '79224',
        '6246',
        '43836',
        '2902',
        '27838',
        '78772',
        '19495',
        '94497',
        '89721',
        '71273',
        '74152',
        '43272',
        '29901',
        '20849',
        '20580',
        '11249',
        '21714',
        '32041',
        '60144',
        '48366',
        '21287',
        '30199',
        '45310',
        '19450',
        '92255',
        '4286',
        '8329',
        '676',
        '8320',
        '11002',
        '28471',
        '98286',
        '20892',
        '11969',
        '938',
        '88221',
        '78783',
        '96848',
        '4028',
        '96951',
        '37744',
        '80041',
        '21284',
        '92072',
        '55576',
        '6507',
        '28342',
        '86028',
        '23358',
        '55583',
        '28285',
        '21505',
        '99550',
        '767',
        '44487',
        '48633',
        '50330',
        '28688',
        '45470',
        '28554',
        '30613',
        '27859',
        '56712',
        '4940',
        '51591',
        '85077',
        '98544',
        '37603',
        '16416',
        '55164',
        '33481',
        '20188',
        '41125',
        '96824',
        '53263',
        '45876',
        '40357',
        '59624',
        '54912',
        '40295',
        '18761',
        '80473',
        '15930',
        '84316',
        '7878',
        '70178',
        '88568',
        '60974',
        '25836',
        '22721',
        '26145',
        '87195',
        '85046',
        '40334',
        '86402',
        '98243',
        '47144',
        '22129',
        '93118',
        '84138',
        '30219',
        '87032',
        '10082',
        '31752',
        '34777',
        '74444',
        '59841',
        '19009',
        '1086',
        '22739',
        '41619',
        '786',
        '40825',
        '55789',
        '30239',
        '24880',
        '91987',
        '29808',
        '34954',
        '73140',
        '96914',
        '91896',
        '34620',
        '92546',
        '49845',
        '92680',
        '94299',
        '57101',
        '12239',
        '91760',
        '10098',
        '42059',
        '76385',
        '91310',
        '24831',
        '38503',
        '45329',
        '15907',
        '42759',
        '34295',
        '24942',
        '33684',
        '42711',
        '47965',
        '34281',
        '28258',
        '34991',
        '70571',
        '16136',
        '94537',
        '45271',
        '6075',
        '54307',
        '22171',
        '33943',
        '29826',
        '28229',
        '15020',
        '41142',
        '6143',
        '92859',
        '17949',
        '45717',
        '10113',
        '21688',
        '30247',
        '60679',
        '39298',
        '43565',
        '71138',
        '75458',
        '85241',
        '76686',
        '63163',
        '87515',
        '97110',
        '732',
        '30390',
        '53591',
        '44661',
        '24209',
        '55701',
        '31165',
        '7653',
        '17861',
        '11353',
        '34101',
        '91305',
        '29504',
        '17840',
        '68902',
        '98071',
        '54760',
        '13692',
        '22183',
        '55716',
        '631',
        '88528',
        '30226',
        '53026',
        '77574',
        '51009',
        '20441',
        '59333',
        '16826',
        '87193',
        '49320',
        '25150',
        '80553',
        '4124',
        '80028',
        '60079',
        '7963',
        '46612',
        '89132',
        '777',
        '28542',
        '40063',
        '715',
        '62855',
        '47855',
        '29222',
        '46285',
        '30302',
        '31740',
        '25054',
        '70033',
        '99329',
        '59927',
        '11054',
        '16245',
        '915',
        '22909',
        '45307',
        '92628',
        '43299',
        '25135',
        '94268',
        '65433',
        '83721',
        '38854',
        '40041',
        '85932',
        '21606',
        '8677',
        '22090',
        '76795',
        '20542',
        '76007',
        '31739',
        '10114',
        '33307',
        '30370',
        '80932',
        '83630',
        '95656',
        '60182',
        '24847',
        '48297',
        '48175',
        '32906',
        '38166',
        '97272',
        '22604',
        '27419',
        '29336',
        '45263',
        '36198',
        '80291',
        '24738',
        '19485',
        '64141',
        '21275',
        '91393',
        '28814',
        '17120',
        '12527',
        '3804',
        '62713',
        '91426',
        '23488',
        '92193',
        '20913',
        '37995',
        '82422',
        '14844',
        '42304',
        '90053',
        '28309',
        '38150',
        '50269',
        '40049',
        '96721',
        '61110',
        '45675',
        '14549',
        '79985',
        '15756',
        '40951',
        '21930',
        '25912',
        '99512',
        '45316',
        '15368',
        '40622',
        '76545',
        '67233',
        '72657',
        '1937',
        '26229',
        '55592',
        '96970',
        '40298',
        '44415',
        '5823',
        '45165',
        '1654',
        '43291',
        '80273',
        '22002',
        '23297',
        '45944',
        '23691',
        '64777',
        '50573',
        '54344',
        '2239',
        '70054',
        '32857',
        '87735',
        '88540',
        '24853',
        '16427',
        '8606',
        '77989',
        '54816',
        '6502',
        '20824',
        '25011',
        '36469',
        '14449',
        '84180',
        '64680',
        '94712',
        '72439',
        '77850',
        '86023',
        '29422',
        '21027',
        '27968',
        '70467',
        '89042',
        '49793',
        '94160',
        '18962',
        '92393',
        '8603',
        '25326',
        '94623',
        '41062',
        '10185',
        '6881',
        '56430',
        '28024',
        '44424',
        '75636',
        '83606',
        '52319',
        '14893',
        '45254',
        '18065',
        '87578',
        '75685',
        '7602',
        '85933',
        '21682',
        '28720',
        '94249',
        '38686',
        '1114',
        '36195',
        '10212',
        '92414',
        '92685',
        '20082',
        '70751',
        '988',
        '50221',
        '92856',
        '26259',
        '8370',
        '99210',
        '93772',
        '612',
        '87174',
        '90671',
        '2254',
        '32859',
        '76468',
        '42558',
        '28545',
        '52226',
        '48724',
        '4332',
        '15564',
        '75326',
        '55488',
        '22428',
        '83403',
        '31995',
        '23326',
        '39760',
        '47035',
        '33697',
        '39200',
        '8214',
        '32050',
        '38101',
        '26823',
        '84752',
        '42761',
        '63776',
        '81077',
        '4070',
        '85732',
        '13688',
        '27699',
        '39288',
        '87712',
        '15134',
        '97294',
        '16603',
        '95373',
        '16230',
        '17828',
        '97905',
        '52652',
        '18763',
        '46376',
        '86439',
        '19488',
        '17506',
        '4116',
        '82427',
        '70898',
        '54980',
        '28375',
        '92633',
        '17843',
        '32954',
        '91399',
        '49434',
        '7926',
        '14169',
        '25324',
        '13401',
        '40452',
        '30249',
        '5479',
        '57196',
        '84667',
        '19398',
        '33574',
        '54532',
        '74353',
        '6141',
        '46945',
        '80037',
        '33339',
        '14704',
        '38188',
        '83701',
        '20045',
        '1931',
        '30128',
        '6411',
        '94289',
        '39303',
        '86341',
        '11470',
        '604',
        '70717',
        '23293',
        '48627',
        '91793',
        '77233',
        '10138',
        '49599',
        '60672',
        '48804',
        '11052',
        '75397',
        '84518',
        '34640',
        '49204',
        '25690',
        '24635',
        '15781',
        '18081',
        '11750',
        '728',
        '6337',
        '28408',
        '63753',
        '80646',
        '94096',
        '50706',
        '91226',
        '90835',
        '94978',
        '87319',
        '98191',
        '48434',
        '92837',
        '46983',
        '85639',
        '33044',
        '80544',
        '20402',
        '33933',
        '49257',
        '29616',
        '20373',
        '20227',
        '59707',
        '47719',
        '3746',
        '44033',
        '83353',
        '43027',
        '24379',
        '70569',
        '50137',
        '38622',
        '88572',
        '48099',
        '46977',
        '80437',
        '16851',
        '77881',
        '79955',
        '76797',
        '31902',
        '20703',
        '20433',
        '14151',
        '16802',
        '2211',
        '77452',
        '16367',
        '11931',
        '63465',
        '44856',
        '11593',
        '94211',
        '34204',
        '8001',
        '41452',
        '20576',
        '61656',
        '83757',
        '26572',
        '47701',
        '93448',
        '24895',
        '83862',
        '29260',
        '75364',
        '34648',
        '36802',
        '62318',
        '72323',
        '89016',
        '2349',
        '25036',
        '92143',
        '29177',
        '6879',
        '57193',
        '20070',
        '23127',
        '99791',
        '7193',
        '25387',
        '42128',
        '25323',
        '70179',
        '27895',
        '43740',
        '92171',
        '48361',
        '54123',
        '89714',
        '50360',
        '99039',
        '46861',
        '92878',
        '48531',
        '93774',
        '28728',
        '20593',
        '14601',
        '27340',
        '1539',
        '72231',
        '98395',
        '22094',
        '39403',
        '43047',
        '27985',
        '25778',
        '30232',
        '54240',
        '6859',
        '73344',
        '92815',
        '7961',
        '6530',
        '79999',
        '30356',
        '18320',
        '83735',
        '32239',
        '44334',
        '95309',
        '48551',
        '20527',
        '49634',
        '19536',
        '28710',
        '55758',
        '48913',
        '49429',
        '32335',
        '97296',
        '72913',
        '32581',
        '17831',
        '33949',
        '75834',
        '22530',
        '62721',
        '8605',
        '22402',
        '17982',
        '12212',
        '32861',
        '92179',
        '55568',
        '21852',
        '42783',
        '19493',
        '66760',
        '15339',
        '653',
        '84136',
        '33188',
        '97428',
        '951',
        '80244',
        '22456',
        '10286',
        '89112',
        '40020',
        '25396',
        '822',
        '94163',
        '15290',
        '81030',
        '80502',
        '22929',
        '17699',
        '38803',
        '53408',
        '20990',
        '57777',
        '90721',
        '785',
        '81066',
        '72716',
        '20875',
        '1227',
        '80942',
        '35230',
        '25250',
        '81032',
        '32183',
        '18979',
        '40970',
        '15472',
        '62991',
        '89828',
        '10094',
        '53031',
        '29542',
        '10047',
        '91383',
        '33846',
        '58452',
        '80256',
        '59620',
        '32886',
        '17944',
        '83230',
        '46372',
        '2564',
        '25625',
        '98455',
        '46801',
        '71634',
        '20209',
        '68103',
        '90074',
        '45043',
        '58213',
        '89126',
        '32326',
        '68109',
        '14588',
        '45062',
        '37136',
        '60701',
        '49282',
        '96765',
        '50227',
        '48090',
        '32598',
        '92329',
        '63963',
        '55002',
        '96927',
        '47845',
        '80290',
        '8625',
        '6123',
        '29373',
        '38768',
        '94119',
        '53280',
        '6781',
        '33728',
        '88573',
        '50259',
        '85285',
        '83405',
        '85289',
        '36102',
        '17927',
        '29386',
        '23899',
        '35296',
        '6467',
        '99666',
        '15738',
        '49796',
        '20310',
        '1097',
        '44315',
        '52538',
        '2174',
        '85726',
        '92195',
        '33775',
        '8218',
        '31717',
        '41127',
        '65104',
        '48553',
        '98583',
        '46713',
        '43284',
        '88513',
        '98130',
        '20539',
        '70302',
        '93542',
        '11041',
        '2574',
        '70457',
        '84135',
        '3215',
        '80444',
        '54969',
        '45441',
        '63006',
        '33651',
        '33256',
        '90312',
        '2561',
        '28261',
        '4485',
        '71477',
        '53295',
        '17577',
        '98154',
        '80265',
        '12724',
        '33419',
        '88532',
        '15127',
        '20749',
        '79982',
        '58359',
        '18910',
        '80474',
        '47671',
        '24841',
        '89028',
        '99020',
        '20908',
        '21720',
        '17833',
        '49003',
        '32790',
        '19893',
        '28246',
        '20299',
        '40488',
        '6493',
        '70172',
        '49422',
        '48812',
        '27711',
        '83233',
        '3897',
        '99609',
        '3866',
        '44619',
        '52158',
        '49081',
        '79221',
        '85065',
        '16856',
        '45781',
        '93707',
        '80862',
        '28072',
        '17564',
        '70534',
        '6152',
        '12224',
        '46885',
        '41626',
        '88584',
        '20571',
        '94625',
        '20524',
        '94171',
        '97312',
        '60627',
        '38609',
        '22017',
        '90651',
        '52230',
        '76461',
        '962',
        '94914',
        '94296',
        '41413',
        '24923',
        '96859',
        '65111',
        '34745',
        '44630',
        '59273',
        '58505',
        '41743',
        '97336',
        '65801',
        '78208',
        '15712',
        '56459',
        '29647',
        '15921',
        '20102',
        '92168',
        '33310',
        '92502',
        '78568',
        '78713',
        '35617',
        '84144',
        '79949',
        '88530',
        '53931',
        '75313',
        '10272',
        '16620',
        '95799',
        '13221',
        '23458',
        '1144',
        '22021',
        '42002',
        '18416',
        '63158',
        '77344',
        '20686',
        '52250',
        '40911',
        '26424',
        '43972',
        '5449',
        '94147',
        '43439',
        '50307',
        '93844',
        '56561',
        '48908',
        '26618',
        '44073',
        '14520',
        '16533',
        '26612',
        '41264',
        '737',
        '75373',
        '17343',
        '68072',
        '47132',
        '32149',
        '24887',
        '37155',
        '32614',
        '93708',
        '13845',
        '59036',
        '48859',
        '71221',
        '7199',
        '99663',
        '77229',
        '36431',
        '1004',
        '85934',
        '49960',
        '6094',
        '74149',
        '19397',
        '43083',
        '37320',
        '77203',
        '67259',
        '38825',
        '69103',
        '41730',
        '15629',
        '39167',
        '94245',
        '6020',
        '84126',
        '55588',
        '15262',
        '85744',
        '68183',
        '19717',
        '25332',
        '93761',
        '50043',
        '25152',
        '75947',
        '79931',
        '93941',
        '36331',
        '69363',
        '30383',
        '73154',
        '62683',
        '72319',
        '79929',
        '29519',
        '47721',
        '43267',
        '55166',
        '21055',
        '685',
        '98836',
        '49666',
        '98384',
        '65636',
        '54152',
        '98068',
        '901',
        '24402',
        '24819',
        '37063',
        '54492',
        '1079',
        '4122',
        '26531',
        '38731',
        '4775',
        '43163',
        '95314',
        '85775',
        '53547',
        '60168',
        '22011',
        '46851',
        '18827',
        '10150',
        '99605',
        '16855',
        '98853',
        '92556',
        '28002',
        '16221',
        '43036',
        '10213',
        '2216',
        '55133',
        '5544',
        '93005',
        '23290',
        '33454',
        '98009',
        '6332',
        '90311',
        '90081',
        '24009',
        '92153',
        '61638',
        '58236',
        '1910',
        '68772',
        '98174',
        '20579',
        '49791',
        '70181',
        '820',
        '36045',
        '669',
        '45802',
        '43624',
        '20244',
        '81602',
        '20219',
        '3754',
        '71728',
        '5838',
        '40595',
        '21816',
        '67755',
        '56740',
        '95056',
        '45063',
        '20544',
        '72702',
        '1903',
        '30371',
        '55486',
        '50197',
        '18963',
        '40259',
        '25026',
        '17054',
        '47445',
        '81128',
        '60055',
        '15621',
        '33688',
        '92728',
        '41668',
        '12511',
        '52235',
        '38958',
        '41427',
        '85099',
        '13404',
        '27690',
        '33266',
        '31713',
        '28725',
        '52595',
        '21775',
        '45444',
        '75372',
        '13150',
        '8871',
        '76000',
        '25713',
        '35448',
        '71966',
        '86031',
        '25329',
        '54903',
        '36061',
        '31760',
        '20066',
        '78111',
        '12228',
        '10115',
        '80266',
        '89314',
        '16103',
        '77967',
        '1805',
        '27650',
        '25122',
        '8890',
        '91785',
        '70831',
        '74702',
        '44317',
        '50364',
        '54764',
        '28219',
        '55786',
        '908',
        '19478',
        '7978',
        '15633',
        '72914',
        '48106',
        '25333',
        '28284',
        '33962',
        '15746',
        '11026',
        '55172',
        '6233',
        '66110',
        '16244',
        '97280',
        '14302',
        '26056',
        '43750',
        '66279',
        '17773',
        '24928',
        '89507',
        '22222',
        '28265',
        '45501',
        '13609',
        '28272',
        '48411',
        '38088',
        '31296',
        '79168',
        '92666',
        '47545',
        '90661',
        '57742',
        '33238',
        '96812',
        '31418',
        '94162',
        '33840',
        '92413',
        '2107',
        '1229',
        '20799',
        '46864',
        '12222',
        '25810',
        '81015',
        '47875',
        '43659',
        '22910',
        '2741',
        '22321',
        '26285',
        '89595',
        '27676',
        '8541',
        '17075',
        '29240',
        '81012',
        '84130',
        '6722',
        '46916',
        '1302',
        '20203',
        '4782',
        '17858',
        '43905',
        '46904',
        '93773',
        '77337',
        '92375',
        '31299',
        '43007',
        '34605',
        '2883',
        '45221',
        '3305',
        '92030',
        '11484',
        '14265',
        '20062',
        '22217',
        '30603',
        '53082',
        '44488',
        '55478',
        '21203',
        '70361',
        '35292',
        '60680',
        '23147',
        '20429',
        '11405',
        '72612',
        '12769',
        '50623',
        '39235',
        '97130',
        '15635',
        '20238',
        '20220',
        '15240',
        '14280',
        '8803',
        '84640',
        '50831',
        '99149',
        '45838',
        '77711',
        '38142',
        '46899',
        '92166',
        '94615',
        '42022',
        '40366',
        '99841',
        '65299',
        '48608',
        '5047',
        '81131',
        '83538',
        '39236',
        '24830',
        '37933',
        '32513',
        '15741',
        '18230',
        '50981',
        '98398',
        '28589',
        '10503',
        '65776',
        '50102',
        '47131',
        '17974',
        '30664',
        '77281',
        '54617',
        '16751',
        '17952',
        '88558',
        '93581',
        '11352',
        '4341',
        '60945',
        '14413',
        '70606',
        '11960',
        '3040',
        '2164',
        '28329',
        '15075',
        '89550',
        '19559',
        '18356',
        '85313',
        '55713',
        '93130',
        '91308',
        '68634',
        '29074',
        '46170',
        '21762',
        '91395',
        '28274',
        '53009',
        '78054',
        '85220',
        '92589',
        '42758',
        '25634',
        '44678',
        '36015',
        '88557',
        '23515',
        '22225',
        '54834',
        '73094',
        '30059',
        '7477',
        '79457',
        '45815',
        '96775',
        '19442',
        '49430',
        '65402',
        '52771',
        '1260',
        '27115',
        '17130',
        '14267',
        '47881',
        '75694',
        '99522',
        '46352',
        '40596',
        '20549',
        '44416',
        '18839',
        '1509',
        '939',
        '2647',
        '36449',
        '75239',
        '830',
        '45855',
        '45787',
        '93718',
        '39088',
        '93607',
        '97440',
        '66225',
        '18030',
        '33672',
        '53401',
        '28250',
        '95038',
        '86304',
        '50255',
        '47732',
        '2669',
        '65890',
        '67836',
        '95812',
        '70550',
        '20530',
        '91909',
        '5485',
        '87194',
        '93639',
        '11588',
        '71156',
        '60075',
        '44080',
        '21290',
        '7877',
        '27256',
        '80448',
        '22723',
        '15348',
        '55578',
        '99513',
        '15454',
        '21092',
        '6104',
        '70463',
        '35486',
        '20521',
        '78475',
        '40523',
        '22161',
        '36103',
        '46102',
        '97861',
        '85366',
        '85275',
        '98566',
        '24031',
        '85646',
        '20226',
        '73163',
        '96078',
        '36118',
        '20301',
        '12537',
        '52056',
        '30212',
        '15634',
        '35232',
        '15751',
        '13138',
        '20577',
        '43985',
        '30229',
        '25672',
        '28633',
        '26375',
        '40874',
        '59116',
        '47556',
        '40384',
        '48918',
        '37089',
        '70195',
        '18653',
        '20914',
        '37111',
        '75245',
        '60009',
        '17735',
        '28287',
        '18957',
        '6857',
        '2272',
        '16151',
        '95061',
        '97147',
        '27150',
        '86433',
        '20044',
        '32893',
        '2791',
        '73402',
        '98921',
        '7097',
        '41713',
        '48980',
        '5861',
        '63182',
        '44061',
        '11476',
        '92176',
        '93140',
        '45234',
        '20505',
        '88518',
        '70728',
        '72133',
        '91341',
        '70142',
        '33662',
        '60114',
        '98184',
        '60132',
        '39753',
        '90406',
        '43030',
        '77332',
        '60522',
        '3847',
        '33121',
        '23058',
        '33197',
        '91778',
        '71329',
        '97253',
        '33915',
        '10979',
        '49041',
        '92817',
        '83723',
        '21836',
        '75380',
        '30364',
        '47457',
        '91404',
        '33530',
        '85703',
        '81628',
        '59231',
        '46253',
        '76202',
        '30732',
        '26586',
        '20235',
        '45720',
        '40592',
        '27120',
        '2175',
        '50936',
        '16670',
        '95347',
        '92712',
        '37162',
        '45897',
        '60001',
        '93515',
        '21747',
        '71440',
        '792',
        '33153',
        '82335',
        '95860',
        '33963',
        '11407',
        '4004',
        '5254',
        '36691',
        '46298',
        '22471',
        '44045',
        '70823',
        '72474',
        '46856',
        '18935',
        '25942',
        '92159',
        '2802',
        '50521',
        '6431',
        '19891',
        '88254',
        '33660',
        '95644',
        '43268',
        '33077',
        '21802',
        '44874',
        '45351',
        '12722',
        '38152',
        '13352',
        '30367',
        '52568',
        '10103',
        '42365',
        '45105',
        '80425',
        '23398',
        '74603',
        '20523',
        '94581',
        '37939',
        '27323',
        '90507',
        '11739',
        '60138',
        '99584',
        '11592',
        '902',
        '92693',
        '53259',
        '47019',
        '20788',
        '43552',
        '79946',
        '95696',
        '42235',
        '84512',
        '20103',
        '27331',
        '19850',
        '12242',
        '18231',
        '2117',
        '24810',
        '15420',
        '78782',
        '43666',
        '50350',
        '75084',
        '84732',
        '3805',
        '77097',
        '6244',
        '96049',
        '59772',
        '24894',
        '32582',
        '49877',
        '82010',
        '12107',
        '33349',
        '94911',
        '52130',
        '2206',
        '70190',
        '96929',
        '29698',
        '34477',
        '99624',
        '27594',
        '89711',
        '914',
        '71330',
        '43531',
        '51110',
        '18342',
        '81013',
        '39148',
        '30398',
        '20643',
        '21709',
        '31726',
        '83826',
        '95290',
        '19172',
        '37928',
        '47614',
        '55764',
        '24006',
        '59638',
        '85010',
        '92163',
        '25283',
        '20307',
        '18625',
        '39460',
        '30006',
        '14856',
        '24848',
        '85940',
        '33932',
        '28362',
        '89446',
        '20709',
        '45262',
        '49790',
        '1831',
        '83303',
        '27656',
        '55145',
        '4056',
        '29338',
        '92863',
        '95191',
        '24737',
        '62709',
        '56541',
        '57736',
        '40446',
        '39737',
        '93007',
        '38146',
        '30351',
        '91714',
        '28225',
        '95021',
        '37707',
        '29423',
        '43989',
        '49674',
        '2040',
        '17371',
        '59936',
        '93457',
        '46206',
        '43285',
        '95741',
        '56112',
        '43926',
        '64188',
        '71844',
        '49737',
        '33999',
        '48937',
        '15695',
        '46301',
        '3293',
        '75029',
        '10164',
        '20896',
        '65205',
        '29921',
        '20535',
        '59855',
        '60902',
        '31782',
        '60499',
        '99711',
        '43699',
        '28765',
        '39163',
        '34618',
        '83256',
        '55586',
        '85662',
        '13119',
        '94205',
        '48086',
        '1111',
        '659',
        '24601',
        '85605',
        '60572',
        '6723',
        '94283',
        '926',
        '49797',
        '32719',
        '20159',
        '43433',
        '12884',
        '85025',
        '7870',
        '62525',
        '57563',
        '57652',
        '29813',
        '80539',
        '21021',
        '19490',
        '5009',
        '8342',
        '36062',
        '43109',
        '52808',
        '22218',
        '50335',
        '18949',
        '10587',
        '22067',
        '19936',
        '85722',
        '17762',
        '10106',
        '48916',
        '85279',
        '46857',
        '17124',
        '49311',
        '92641',
        '43218',
        '11555',
        '17508',
        '89435',
        '90398',
        '8011',
        '646',
        '25716',
        '22009',
        '41659',
        '16677',
        '53599',
        '32007',
        '34280',
        '91409',
        '12225',
        '6133',
        '74013',
        '96830',
        '1508',
        '95743',
        '28070',
        '27533',
        '45687',
        '87511',
        '13851',
        '63839',
        '33084',
        '64789',
        '10133',
        '70524',
        '47199',
        '70792',
        '29318',
        '16563',
        '60080',
        '91718',
        '62847',
        '91841',
        '6725',
        '48620',
        '13410',
        '43287',
        '34643',
        '41805',
        '64173',
        '46869',
        '1807',
        '39304',
        '15565',
        '29377',
        '98046',
        '74183',
        '2212',
        '84030',
        '57115',
        '74141',
        '99754',
        '49416',
        '64148',
        '60434',
        '64189',
        '20208',
        '35082',
        '25274',
        '18223',
        '93504',
        '8316',
        '27854',
        '63156',
        '916',
        '34674',
        '41338',
        '50301',
        '24212',
        '47704',
        '6921',
        '2258',
        '79184',
        '91017',
        '24438',
        '79993',
        '19640',
        '91043',
        '12252',
        '53780',
        '89826',
        '37248',
        '2178',
        '43786',
        '48950',
        '40603',
        '10285',
        '33677',
        '952',
        '51602',
        '61518',
        '89155',
        '49121',
        '16413',
        '85242',
        '10270',
        '17041',
        '47306',
        '20437',
        '18105',
        '47864',
        '20266',
        '18767',
        '39058',
        '2162',
        '91221',
        '70078',
        '13627',
        '8906',
        '84133',
        '91050',
        '13220',
        '32710',
        '959',
        '92812',
        '24647',
        '25645',
        '47702',
        '61237',
        '10105',
        '11695',
        '55591',
        '84643',
        '45437',
        '94137',
        '43305',
        '76803',
        '76192',
        '61131',
        '37382',
        '92197',
        '34742',
        '47988',
        '59485',
        '8240',
        '48121',
        '30007',
        '23424',
        '38338',
        '27623',
        '38336',
        '28424',
        '93729',
        '60507',
        '41053',
        '48552',
        '53192',
        '57326',
        '37699',
        '24628',
        '86342',
        '24821',
        '34451',
        '52725',
        '10995',
        '34447',
        '48254',
        '17738',
        '96703',
        '48896',
        '42150',
        '10997',
        '85074',
        '32722',
        '32595',
        '84603',
        '30164',
        '99511',
        '11853',
        '43981',
        '57245',
        '92634',
        '32924',
        '923',
        '98293',
        '64185',
        '2123',
        '36872',
        '36868',
        '8018',
        '86302',
        '32978',
        '54439',
        '91507',
        '40018',
        '16029',
        '2823',
        '55171',
        '48833',
        '18921',
        '81414',
        '38638',
        '90847',
        '16058',
        '48288',
        '46513',
        '4212',
        '70391',
        '23450',
        '45350',
        '31994',
        '91482',
        '59806',
        '99566',
        '54934',
        '33283',
        '60301',
        '66019',
        '34265',
        '17720',
        '87061',
        '48476',
        '87558',
        '13043',
        '13022',
        '43916',
        '39463',
        '24619',
        '62791',
        '23653',
        '25569',
        '83806',
        '31119',
        '33163',
        '84620',
        '27982',
        '82944',
        '71415',
        '70836',
        '84723',
        '1074',
        '87140',
        '18473',
        '60092',
        '95172',
        '25158',
        '5044',
        '33261',
        '22215',
        '32762',
        '43234',
        '29320',
        '73725',
        '98599',
        '23804',
        '34623',
        '68364',
        '60693',
        '84141',
        '59403',
        '78053',
        '28130',
        '6126',
        '96739',
        '88538',
        '61710',
        '55394',
        '22001',
        '28784',
        '29415',
        '77225',
        '48007',
        '77256',
        '89116',
        '20718',
        '41377',
        '82450',
        '25775',
        '30057',
        '40256',
        '49748',
        '63651',
        '33858',
        '44809',
        '725',
        '13504',
        '4770',
        '64013',
        '60537',
        '23520',
        '70159',
        '89712',
        '16868',
        '16113',
        '22545',
        '20182',
        '14692',
        '13847',
        '24724',
        '20554',
        '28093',
        '26135',
        '80438',
        '87009',
        '29839',
        '34664',
        '55581',
        '28402',
        '26816',
        '73656',
        '10116',
        '93062',
        '29923',
        '24457',
        '45642',
        '18764',
        '5702',
        '14144',
        '27622',
        '62336',
        '87525',
        '674',
        '29597',
        '92842',
        '19487',
        '75504',
        '55566',
        '71153',
        '24514',
        '14166',
        '79114',
        '86506',
        '97314',
        '17125',
        '87519',
        '8006',
        '4082',
        '1029',
        '15032',
        '51244',
        '94232',
        '6699',
        '10914',
        '20048',
        '59316',
        '98343',
        '29614',
        '28288',
        '1037',
        '91358',
        '45269',
        '91990',
        '95156',
        '17008',
        '80248',
        '79185',
        '29804',
        '38393',
        '28111',
        '5768',
        '16538',
        '47228',
        '54620',
        '34973',
        '92169',
        '70465',
        '44901',
        '80860',
        '40844',
        '18448',
        '91470',
        '45423',
        '26503',
        '94168',
        '44322',
        '49516',
        '33842',
        '92366',
        '15866',
        '2643',
        '4223',
        '30914',
        '56076',
        '84711',
        '26634',
        '15358',
        '19897',
        '5460',
        '15502',
        '49610',
        '70884',
        '43931',
        '39736',
        '20318',
        '1525',
        '2499',
        '53157',
        '32795',
        '48266',
        '11441',
        '14664',
        '67128',
        '65110',
        '20217',
        '14130',
        '10124',
        '25350',
        '67476',
        '87364',
        '623',
        '80541',
        '84012',
        '98411',
        '72822',
        '50427',
        '17415',
        '80250',
        '20046',
        '40261',
        '79951',
        '26350',
        '57557',
        '69135',
        '83468',
        '52624',
        '75310',
        '1526',
        '99107',
        '30330',
        '31646',
        '45131',
        '20500',
        '33119',
        '23941',
        '45624',
        '33675',
        '89004',
        '60039',
        '72918',
        '60086',
        '50368',
        '61826',
        '53744',
        '17770',
        '18003',
        '46859',
        '929',
        '95155',
        '2404',
        '33734',
        '32956',
        '27611',
        '12085',
        '45119',
        '20375',
        '84749',
        '1813',
        '56538',
        '42270',
        '1009',
        '24843',
        '70189',
        '11956',
        '7061',
        '33902',
        '20731',
        '93776',
        '98934',
        '45837',
        '19354',
        '49819',
        '63001',
        '84132',
        '45853',
        '17010',
        '2277',
        '11254',
        '22186',
        '21270',
        '29348',
        '19065',
        '32522',
        '18083',
        '19019',
        '51459',
        '84652',
        '31180',
        '37358',
        '3302',
        '14515',
        '37802',
        '25728',
        '731',
        '20565',
        '82008',
        '34789',
        '36193',
        '4359',
        '34635',
        '87125',
        '96099',
        '83437',
        '28616',
        '84638',
        '29938',
        '94262',
        '24010',
        '47033',
        '2101',
        '19109',
        '11388',
        '43321',
        '25392',
        '75388',
        '5750',
        '83229',
        '63160',
        '55563',
        '7533',
        '40348',
        '28378',
        '93190',
        '49761',
        '11044',
        '59623',
        '97821',
        '15959',
        '47731',
        '58747',
        '27621',
        '31040',
        '96918',
        '78294',
        '34645',
        '12588',
        '14785',
        '84185',
        '48921',
        '20013',
        '49005',
        '33784',
        '43253',
        '90239',
        '85531',
        '13056',
        '44670',
        '25126',
        '11775',
        '17323',
        '50667',
        '45201',
        '85075',
        '6028',
        '73031',
        '45861',
        '44671',
        '53537',
        '16108',
        '2887',
        '87561',
        '25686',
        '84665',
        '85912',
        '19885',
        '15334',
        '20604',
        '73403',
        '1021',
        '70505',
        '27199',
        '841',
        '17247',
        '18239',
        '71242',
        '75250',
        '660',
        '91947',
        '84402',
        '79948',
        '24043',
        '25826',
        '16250',
        '22132',
        '94575',
        '89564',
        '52149',
        '34278',
        '38271',
        '72216',
        '24618',
        '97251',
        '54464',
        '13313',
        '35762',
        '92684',
        '4855',
        '24042',
        '49555',
        '17580',
        '13137',
        '85066',
        '25719',
        '1889',
        '76267',
        '33336',
        '55587',
        '15467',
        '16804',
        '71272',
        '33220',
        '14429',
        '70551',
        '12162',
        '17140',
        '80746',
        '87101',
        '75099',
        '88567',
        '48554',
        '31310',
        '20134',
        '80131',
        '7544',
        '99599',
        '55815',
        '50844',
        '48852',
        '45166',
        '32613',
        '42786',
        '92196',
        '49901',
        '95173',
        '87357',
        '59083',
        '35812',
        '48870',
        '49929',
        '23506',
        '16541',
        '90409',
        '23178',
        '45777',
        '17012',
        '13055',
        '44197',
        '3272',
        '30051',
        '18502',
        '20531',
        '94017',
        '13664',
        '31073',
        '15361',
        '4784',
        '93777',
        '47735',
        '47964',
        '20069',
        '30357',
        '26578',
        '15254',
        '8101',
        '34619',
        '18243',
        '49560',
        '22024',
        '16003',
        '64194',
        '96154',
        '795',
        '25429',
        '83841',
        '27624',
        '42403',
        '74542',
        '15316',
        '53787',
        '28583',
        '94666',
        '41344',
        '40588',
        '30123',
        '1138',
        '96843',
        '48844',
        '22230',
        '85670',
        '28102',
        '90202',
        '38779',
        '38014',
        '85364',
        '15429',
        '2801',
        '85740',
        '3233',
        '6383',
        '37227',
        '44185',
        '95036',
        '3832',
        '47705',
        '77201',
        '80274',
        '24820',
        '15242',
        '90084',
        '37990',
        '707',
        '51057',
        '16027',
        '75151',
        '59435',
        '17354',
        '91719',
        '27498',
        '20546',
        '65573',
        '83421',
        '6267',
        '18079',
        '40574',
        '85060',
        '16638',
        '97118',
        '83715',
        '26103',
        '61633',
        '20138',
        '38744',
        '4458',
        '4788',
        '2742',
        '6836',
        '32957',
        '87022',
        '22012',
        '10981',
        '90734',
        '70009',
        '79171',
        '87051',
        '59773',
        '94307',
        '78785',
        '38879',
        '30130',
        '88512',
        '18627',
        '38880',
        '95296',
        '88543',
        '28662',
        '74947',
        '64172',
        '77862',
        '15937',
        '95267',
        '32559',
        '6538',
        '52331',
        '48555',
        '5657',
        '36004',
        '13134',
        '28221',
        '824',
        '46047',
        '85030',
        '47976',
        '25685',
        '70184',
        '33806',
        '98431',
        '47969',
        '4536',
        '80047',
        '88521',
        '91009',
        '745',
        '92514',
        '86549',
        '721',
        '20051',
        '84539',
        '4992',
        '30396',
        '76628',
        '68035',
        '38145',
        '33906',
        '10123',
        '93020',
        '90295',
        '36624',
        '6540',
        '27251',
        '79850',
        '6466',
        '7754',
        '34276',
        '32099',
        '32728',
        '71151',
        '13251',
        '55747',
        '6388',
        '43446',
        '35181',
        '25770',
        '17862',
        '16699',
        '62259',
        '98235',
        '93779',
        '4567',
        '13442',
        '28026',
        '18912',
        '10173',
        '15354',
        '89151',
        '33265',
        '48264',
        '49961',
        '71951',
        '47351',
        '36515',
        '22403',
        '62834',
        '43667',
        '32959',
        '33926',
        '26030',
        '53710',
        '93780',
        '60969',
        '75315',
        '59066',
        '79991',
        '57192',
        '97293',
        '20543',
        '75687',
        '662',
        '78715',
        '83652',
        '11402',
        '29913',
        '38912',
        '39407',
        '76505',
        '80420',
        '33686',
        '70527',
        '88579',
        '81655',
        '38074',
        '19889',
        '28222',
        '22229',
        '15035',
        '2327',
        '77260',
        '54951',
        '86011',
        '15252',
        '15460',
        '75284',
        '58001',
        '7309',
        '45025',
        '59018',
        '20436',
        '49942',
        '54743',
        '16263',
        '39500',
        '88255',
        '93438',
        '49955',
        '803',
        '43752',
        '49069',
        '15641',
        '82648',
        '1822',
        '98824',
        '50362',
        '49413',
        '60065',
        '20099',
        '42374',
        '723',
        '97311',
        '15761',
        '37161',
        '67201',
        '39098',
        '638',
        '90608',
        '5469',
        '71920',
        '25828',
        '949',
        '91497',
        '91394',
        '94039',
        '21867',
        '12195',
        '49355',
        '13643',
        '44181',
        '90707',
        '98227',
        '20210',
        '80936',
        '98206',
        '23471',
        '7880',
        '12915',
        '10572',
        '96921',
        '10120',
        '13157',
        '17128',
        '20522',
        '79945',
        '57439',
        '39284',
        '48956',
        '50332',
        '22241',
        '13151',
        '27640',
        '17573',
        '73185',
        '42219',
        '85245',
        '6922',
        '13657',
        '12441',
        '71135',
        '94035',
        '55399',
        '84646',
        '43770',
        '10166',
        '5603',
        '61076',
        '21024',
        '39087',
        '966',
        '24178',
        '40742',
        '62852',
        '734',
        '88536',
        '30158',
        '18710',
        '91799',
        '97078',
        '51341',
        '38007',
        '4672',
        '87326',
        '17606',
        '8821',
        '61125',
        '24044',
        '27969',
        '20396',
        '62256',
        '60105',
        '74043',
        '19340',
        '31003',
        '38324',
        '17177',
        '6537',
        '92513',
        '25046',
        '94297',
        '91066',
        '43157',
        '24856',
        '98231',
        '19456',
        '32644',
        '49458',
        '99215',
        '90224',
        '97286',
        '75258',
        '32247',
        '91313',
        '80429',
        '34995',
        '12504',
        '76540',
        '26641',
        '21278',
        '15715',
        '62283',
        '28051',
        '73561',
        '20412',
        '15072',
        '26074',
        '26366',
        '5481',
        '91209',
        '25682',
        '13645',
        '94624',
        '27049',
        '18953',
        '91025',
        '32122',
        '68419',
        '34649',
        '27708',
        '88058',
        '82713',
        '37621',
        '12541',
        '16553',
        '15267',
        '32115',
        '10571',
        '7806',
        '30466',
        '46572',
        '22194',
        '55561',
        '22128',
        '80025',
        '936',
        '2059',
        '23003',
        '12220',
        '32560',
        '99690',
        '16018',
        '21233',
        '2876',
        '63661',
        '79187',
        '74866',
        '87191',
        '37077',
        '4243',
        '85620',
        '38083',
        '65036',
        '18244',
        '30374',
        '98622',
        '12493',
        '23514',
        '44816',
        '53284',
        '25040',
        '37316',
        '28575',
        '78293',
        '69355',
        '89496',
        '95115',
        '20813',
        '25321',
        '38738',
        '47966',
        '39566',
        '15948',
        '17966',
        '44653',
        '10249',
        '45115',
        '84636',
        '80150',
        '66653',
        '47716',
        '30388',
        '25708',
        '15448',
        '55010',
        '75118',
        '32538',
        '25927',
        '20918',
        '80046',
        '20627',
        '89180',
        '80160',
        '84304',
        '80280',
        '32781',
        '76383',
        '91495',
        '91388',
        '24038',
        '35277',
        '27294',
        '55383',
        '27964',
        '79123',
        '78778',
        '20550',
        '906',
        '52166',
        '71130',
        '20557',
        '6050',
        '54402',
        '54866',
        '14261',
        '47878',
        '40253',
        '42288',
        '14231',
        '58106',
        '53187',
        '24867',
        '31734',
        '43602',
        '10132',
        '21656',
        '6509',
        '30049',
        '7802',
        '54127',
        '17882',
        '85734',
        '742',
        '80946',
        '99509',
        '94409',
        '13290',
        '67488',
        '70786',
        '8875',
        '43441',
        '79994',
        '6404',
        '99335',
        '24866',
        '97271',
        '28641',
        '66282',
        '58379',
        '2358',
        '46355',
        '37501',
        '38955',
        '46129',
        '39400',
        '66024',
        '56341',
        '38928',
        '96801',
        '1472',
        '85911',
        '40578',
        '907',
        '7543',
        '1101',
        '91720',
        '79453',
        '91412',
        '99832',
        '32524',
        '28653',
        '55090',
        '15047',
        '850',
        '46853',
        '89070',
        '25727',
        '55571',
        '28666',
        '94282',
        '25729',
        '4575',
        '85926',
        '58337',
        '29814',
        '5470',
        '84649',
        '34979',
        '88325',
        '81038',
        '95250',
        '94942',
        '28367',
        '79163',
        '42720',
        '20428',
        '25004',
        '92191',
        '62723',
        '12226',
        '14602',
        '55575',
        '49335',
        '53141',
        '91333',
        '26707',
        '49314',
        '11773',
        '14241',
        '19550',
        '97228',
        '59477',
        '92522',
        '97533',
        '24008',
        '24033',
        '22131',
        '32151',
        '30111',
        '21501',
        '97602',
        '40423',
        '25849',
        '45482',
        '4638',
        '90508',
        '87504',
        '16847',
        '23441',
        '32170',
        '49062',
        '13737',
        '90637',
        '19091',
        '17106',
        '60568',
        '24824',
        '4629',
        '85055',
        '4857',
        '10559',
        '4271',
        '55609',
        '84717',
        '45848',
        '59830',
        '71496',
        '20068',
        '81232',
        '30081',
        '8754',
        '29598',
        '71348',
        '976',
        '45870',
        '14240',
        '60944',
        '83708',
        '15630',
        '4467',
        '35231',
        '33807',
        '56731',
        '37250',
        '19101',
        '88211',
        '74031',
        '55175',
        '53790',
        '34729',
        '54432',
        '55393',
        '90296',
        '40724',
        '95208',
        '12429',
        '64760',
        '17272',
        '73558',
        '14751',
        '26332',
        '55573',
        '42370',
        '25643',
        '72735',
        '99514',
        '29214',
        '20682',
        '77298',
        '24640',
        '27877',
        '27216',
        '38174',
        '29904',
        '22010',
        '40702',
        '44184',
        '71497',
        '55777',
        '7938',
        '27247',
        '83116',
        '53407',
        '40269',
        '20504',
        '98644',
        '88549',
        '11425',
        '99738',
        '90309',
        '74529',
        '87365',
        '16672',
        '33475',
        '7688',
        '86015',
        '93302',
        '47434',
        '46782',
        '54946',
        '32123',
        '22965',
        '89159',
        '94244',
        '15087',
        '12133',
        '97309',
        '29503',
        '45018',
        '20380',
        '33159',
        '28228',
        '28244',
        '23670',
        '33124',
        '47870',
        '7195',
        '67627',
        '61278',
        '59082',
        '30379',
        '45826',
        '40201',
        '39121',
        '43555',
        '44328',
        '45677',
        '937',
        '29220',
        '23316',
        '33052',
        '77250',
        '99523',
        '44799',
        '38147',
        '86313',
        '61266',
        '24048',
        '41378',
        '66629',
        '48233',
        '80427',
        '53268',
        '61650',
        '13217',
        '99124',
        '88004',
        '43279',
        '25715',
        '24036',
        '63467',
        '45020',
        '71377',
        '6183',
        '94018',
        '47226',
        '72503',
        '77290',
        '55168',
        '20880',
        '22118',
        '20635',
        '20081',
        '13312',
        '25910',
        '56344',
        '27568',
        '23541',
        '92668',
        '16530',
        '94031',
        '34615',
        '24859',
        '68063',
        '73039',
        '38161',
        '84740',
        '71281',
        '85237',
        '81247',
        '32867',
        '26219',
        '49902',
        '39165',
        '49023',
        '48110',
        '29612',
        '83337',
        '22210',
        '97269',
        '91322',
        '704',
        '14827',
        '14511',
        '80945',
        '38839',
        '1264',
        '96837',
        '88527',
        '25134',
        '31598',
        '33416',
        '71460',
        '2362',
        '84764',
        '34992',
        '98345',
        '28359',
        '24215',
        '5344',
        '27582',
        '3468',
        '35290',
        '23184',
        '94614',
        '29378',
        '50241',
        '80299',
        '99363',
        '91012',
        '35246',
        '5604',
        '61803',
        '25919',
        '61204',
        '15731',
        '44258',
        '90055',
        '46971',
        '25183',
        '92811',
        '66931',
        '31294',
        '8224',
        '13472',
        '1842',
        '55177',
        '99776',
        '55599',
        '97134',
        '85036',
        '95887',
        '36670',
        '90088',
        '96862',
        '97373',
        '50306',
        '24808',
        '85217',
        '39049',
        '36641',
        '8602',
        '35612',
        '42251',
        '19903',
        '97299',
        '52004',
        '693',
        '82840',
        '10170',
        '47851',
        '88524',
        '34460',
        '50481',
        '20791',
        '20388',
        '92519',
        '62794',
        '85609',
        '45378',
        '84656',
        '20414',
        '8072',
        '32395',
        '68702',
        '27099',
        '23519',
        '45888',
        '22240',
        '14652',
        '22214',
        '23667',
        '63032',
        '92318',
        '10110',
        '20768',
        '71932',
        '62552',
        '93590',
        '22103',
        '20540',
        '57357',
        '47308',
        '16211',
        '1014',
        '984',
        '33929',
        '92226',
        '35287',
        '13611',
        '87049',
        '64196',
        '54841',
        '98396',
        '98637',
        '14021',
        '96158',
        '40270',
        '85011',
        '46866',
        '6504',
        '92112',
        '52312',
        '45156',
        '23419',
        '93282',
        '11410',
        '70874',
        '48151',
        '44640',
        '17127',
        '85636',
        '27620',
        '18774',
        '95473',
        '33008',
        '31403',
        '97491',
        '20204',
        '4665',
        '97902',
        '58124',
        '61702',
        '82942',
        '31703',
        '19339',
        '39060',
        '43032',
        '37644',
        '17943',
        '28816',
        '44803',
        '20397',
        '92319',
        '28802',
        '18241',
        '80217',
        '6245',
        '64868',
        '94912',
        '88535',
        '957',
        '34143',
        '10081',
        '90307',
        '87536',
        '18958',
        '33650',
        '74721',
        '87316',
        '43618',
        '24716',
        '30237',
        '30903',
        '85002',
        '39043',
        '44397',
        '95654',
        '95481',
        '13153',
        '94294',
        '18946',
        '71474',
        '8647',
        '16853',
        '30384',
        '38926',
        '40290',
        '95158',
        '62786',
        '31013',
        '76196',
        '46968',
        '55562',
        '18971',
        '49074',
        '98819',
        '18016',
        '25709',
        '90652',
        '14831',
        '42402',
        '1704',
        '93150',
        '92607',
        '40546',
        '18515',
        '13632',
        '34492',
        '68101',
        '32511',
        '20168',
        '3859',
        '19955',
        '31729',
        '30202',
        '28503',
        '61949',
        '20403',
        '60161',
        '31797',
        '47261',
        '15734',
        '44188',
        '78295',
        '50850',
        '94172',
        '55323',
        '27635',
        '36142',
        '98238',
        '55468',
        '10988',
        '48391',
        '88542',
        '30037',
        '63838',
        '72844',
        '99637',
        '77670',
        '14776',
        '94135',
        '14463',
        '40339',
        '92687',
        '73706',
        '58122',
        '19357',
        '66077',
        '50637',
        '30386',
        '18251',
        '10273',
        '16422',
        '94309',
        '48641',
        '52759',
        '31761',
        '24448',
        '15616',
        '48376',
        '58108',
        '60121',
        '29623',
        '22513',
        '54160',
        '17570',
        '42102',
        '93912',
        '21627',
        '21749',
        '925',
        '20409',
        '29573',
        '85231',
        '91131',
        '96805',
        '1653',
        '80161',
        '62776',
        '99643',
        '94298',
        '18522',
        '24027',
        '38764',
        '6749',
        '63179',
        '25652',
        '55348',
        '47430',
        '43547',
        '18820',
        '30358',
        '87499',
        '97622',
        '43437',
        '49258',
        '95894',
        '13062',
        '88580',
        '90075',
        '27626',
        '89452',
        '32596',
        '19345',
        '99209',
        '96839',
        '27586',
        '87300',
        '26446',
        '98508',
        '32794',
        '33425',
        '32329',
        '30203',
        '18410',
        '44326',
        '3238',
        '59636',
        '54957',
        '27802',
        '10265',
        '74148',
        '10041',
        '99252',
        '60303',
        '40386',
        '50165',
        '80295',
        '92033',
        '31095',
        '93715',
        '49239',
        '29391',
        '55753',
        '19612',
        '97388',
        '27342',
        '7752',
        '38739',
        '84143',
        '43073',
        '75395',
        '21721',
        '4926',
        '24007',
        '45032',
        '27420',
        '71656',
        '23668',
        '49872',
        '96808',
        '84322',
        '6534',
        '27887',
        '18221',
        '29290',
        '16918',
        '23313',
        '73136',
        '23628',
        '30001',
        '94170',
        '13774',
        '80935',
        '21767',
        '98385',
        '55593',
        '39635',
        '17604',
        '90848',
        '92658',
        '28750',
        '58206',
        '84639',
        '23911',
        '14694',
        '67278',
        '31917',
        '27155',
        '34421',
        '32854',
        '20370',
        '17825',
        '70161',
        '60186',
        '70575',
        '17085',
        '71914',
        '33738',
        '986',
        '83215',
        '45071',
        '20140',
        '19441',
        '25725',
        '22117',
        '70541',
        '720',
        '36136',
        '28223',
        '11707',
        '3843',
        '45779',
        '83866',
        '23001',
        '50369',
        '40250',
        '32120',
        '956',
        '31107',
        '54404',
        '33779',
        '44492',
        '76094',
        '47983',
        '53788',
        '57253',
        '6927',
        '40410',
        '19155',
        '12739',
        '8038',
        '86431',
        '51432',
        '25878',
        '24045',
        '58702',
        '25931',
        '97077',
        '35182',
        '34629',
        '30138',
        '76533',
        '20472',
        '6860',
        '85273',
        '15720',
        '32747',
        '29413',
        '91225',
        '94257',
        '43925',
        '22110',
        '913',
        '16694',
        '79997',
        '20118',
        '20058',
        '55169',
        '81242',
        '95418',
        '14857',
        '4033',
        '16161',
        '14852',
        '92720',
        '917',
        '12749',
        '45783',
        '94288',
        '43266',
        '95534',
        '70470',
        '15625',
        '85738',
        '2201',
        '46626',
        '48260',
        '11482',
        '30399',
        '18256',
        '16725',
        '89033',
        '46858',
        '17346',
        '71471',
        '83460',
        '54231',
        '50465',
        '96944',
        '73502',
        '5085',
        '50947',
        '26162',
        '10292',
        '12434',
        '74946',
        '44068',
        '55188',
        '10129',
        '7101',
        '85371',
        '70833',
        '88516',
        '28388',
        '8878',
        '30279',
        '59703',
        '53281',
        '18602',
        '16675',
        '80208',
        '20830',
        '20442',
        '28646',
        '2041',
        '26589',
        '41728',
        '62651',
        '96807',
        '99333',
        '53782',
        '40591',
        '89318',
        '73022',
        '7962',
        '28108',
        '48816',
        '33743',
        '48139',
        '20107',
        '46125',
        '87517',
        '45268',
        '38782',
        '96079',
        '24506',
        '79406',
        '25710',
        '73198',
        '27868',
        '14110',
        '17261',
        '14683',
        '52774',
        '28509',
        '40297',
        '26186',
        '66652',
        '98530',
        '53102',
        '20697',
        '84152',
        '37395',
        '2208',
        '32201',
        '70163',
        '31205',
        '12241',
        '92424',
        '6925',
        '35299',
        '25563',
        '19197',
        '16021',
        '62764',
        '25109',
        '85064',
        '33938',
        '40577',
        '67231',
        '48190',
        '19358',
        '6154',
        '35285',
        '4123',
        '2344',
        '13457',
        '31741',
        '20578',
        '20423',
        '71247',
        '8739',
        '77863',
        '17253',
        '91129',
        '2565',
        '934',
        '29227',
        '20113',
        '3910',
        '49717',
        '91526',
        '94088',
        '22159',
        '47852',
        '92412',
        '26461',
        '92838',
        '31106',
        '43759',
        '28561',
        '94256',
        '35288',
        '20193',
        '22907',
        '49523',
        '26214',
        '47811',
        '70081',
        '21411',
        '15378',
        '67585',
        '59432',
        '17251',
        '71324',
        '19098',
        '46325',
        '34487',
        '25360',
        '80866',
        '44396',
        '14720',
        '55796',
        '60141',
        '76824',
        '20390',
        '92068',
        '38557',
        '15617',
        '20416',
        '67905',
        '94125',
        '38010',
        '34617',
        '55584',
        '87749',
        '82423',
        '72009',
        '24832',
        '38402',
        '3273',
        '6920',
        '44650',
        '88583',
        '55377',
        '11736',
        '85942',
        '39283',
        '27588',
        '41228',
        '79978',
        '87302',
        '47747',
        '20440',
        '2192',
        '53167',
        '27108',
        '31141',
        '74192',
        '664',
        '5620',
        '78471',
        '24857',
        '6842',
        '692',
        '26886',
        '84762',
        '48222',
        '17521',
        '22748',
        '86430',
        '52168',
        '58335',
        '8607',
        '88554',
        '22833',
        '17326',
        '14266',
        '6127',
        '19896',
        '62224',
        '43158',
        '1066',
        '78585',
        '20538',
        '11027',
        '17829',
        '909',
        '20233',
        '10912',
        '99830',
        '83867',
        '90853',
        '805',
        '39286',
        '30917',
        '48068',
        '48667',
        '52055',
        '51460',
        '41173',
        '49943',
        '32932',
        '28010',
        '84735',
        '71802',
        '35279',
        '36803',
        '44198',
        '10130',
        '28724',
        '62767',
        '50031',
        '6832',
        '29802',
        '10099',
        '60198',
        '84170',
        '94948',
        '93034',
        '51452',
        '86512',
        '33093',
        '5439',
        '91337',
        '66601',
        '21803',
        '13426',
        '2940',
        '10008',
        '21652',
        '14603',
        '22987',
        '43434',
        '88562',
        '50127',
        '10177',
        '23347',
        '35815',
        '27819',
        '82945',
        '72089',
        '29419',
        '78284',
        '47262',
        '36626',
        '18247',
        '19353',
        '92158',
        '84184',
        '25688',
        '88574',
        '20172',
        '6436',
        '97626',
        '94291',
        '40594',
        '33111',
        '46998',
        '40581',
        '80477',
        '20424',
        '62660',
        '72182',
        '91747',
        '46937',
        '29457',
        '45353',
        '25102',
        '79988',
        '2651',
        '41351',
        '88268',
        '45427',
        '96823',
        '40544',
        '43967',
        '80940',
        '84730',
        '70158',
        '24889',
        '93793',
        '35256',
        '50334',
        '25281',
        '44660',
        '30246',
        '911',
        '93303',
        '34755',
        '73301',
        '15822',
        '99521',
        '28126',
        '92312',
        '97464',
        '30916',
        '25906',
        '19481',
        '912',
        '35261',
        '43458',
        '77870',
        '29292',
        '85280',
        '33630',
        '91903',
        '54861',
        '15510',
        '5740',
        '24829',
        '71213',
        '94166',
        '99256',
        '32160',
        '27201',
        '87753',
        '93231',
        '20559',
        '48907',
        '54643',
        '7182',
        '8557',
        '42322',
        '19039',
        '794',
        '75339',
        '83441',
        '44767',
        '85380',
        '27972',
        '29342',
        '14061',
        '93279',
        '33504',
        '20610',
        '30638',
        '95063',
        '56321',
        '30347',
        '94169',
        '23272',
        '6151',
        '17237',
        '80036',
        '30913',
        '23278',
        '8988',
        '39632',
        '62866',
        '26533',
        '71767',
        '39289',
        '15258',
        '55191',
        '26290',
        '17306',
        '29216',
        '2295',
        '24050',
        '78553',
        '59867',
        '5074',
        '70139',
        '60675',
        '76203',
        '80038',
        '66505',
        '57526',
        '15783',
        '97307',
        '79704',
        '48924',
        '15660',
        '87548',
        '88053',
        '92049',
        '10915',
        '99710',
        '778',
        '19443',
        '32872',
        '65105',
        '84742',
        '90251',
        '37414',
        '32663',
        '71080',
        '98246',
        '92266',
        '7197',
        '2193',
        '60094',
        '96803',
        '81636',
        '10197',
        '15268',
        '48930',
        '50394',
        '80307',
        '77209',
        '8604',
        '94240',
        '45275',
        '65055',
        '41810',
        '38758',
        '82515',
        '75359',
        '85551',
        '24836',
        '935',
        '84746',
        '95026',
        '45490',
        '85939',
        '94153',
        '81222',
        '23459',
        '28661',
        '89533',
        '25421',
        '29324',
        '37147',
        '23327',
        '29333',
        '92427',
        '54453',
        '50426',
        '38168',
        '95016',
        '54450',
        '62719',
        '26824',
        '85627',
        '54744',
        '57367',
        '83438',
        '19890',
        '15555',
        '23291',
        '37997',
        '89505',
        '7198',
        '38946',
        '35225',
        '56046',
        '53812',
        '92669',
        '80949',
        '25606',
        '33152',
        '18373',
        '63947',
        '64198',
        '89041',
        '48398',
        '52736',
        '14759',
        '96960',
        '41368',
        '79464',
        '88437',
        '57570',
        '24585',
        '45636',
        '93942',
        '19110',
        '94998',
        '46274',
        '28406',
        '84644',
        '87533',
        '2661',
        '34625',
        '45999',
        '98195',
        '13738',
        '71451',
        '23479',
        '2102',
        '22071',
        '48318',
        '76564',
        '88541',
        '89702',
        '1961',
        '93786',
        '85548',
        '94310',
        '62306',
        '38140',
        '15278',
        '39250',
        '55596',
        '31099',
        '20797',
        '12402',
        '33631',
        '83680',
        '22472',
        '46045',
        '41072',
        '12811',
        '23269',
        '38875',
        '55550',
        '66699',
        '94661',
        '75312',
        '14035',
        '37131',
        '82602',
        '78426',
        '14452',
        '17722',
        '2065',
        '59710',
        '30647',
        '26434',
        '11802',
        '84140',
        '14732',
        '80633',
        '34622',
        '79975',
        '29151',
        '39207',
        '62857',
        '80488',
        '16140',
        '15230',
        '41739',
        '85067',
        '53540',
        '12436',
        '43927',
        '56272',
        '33845',
        '24474',
        '25325',
        '72387',
        '75403',
        '13647',
        '27619',
        '30352',
        '27697',
        '36199',
        '24040',
        '88054',
        '92650',
        '87502',
        '85222',
        '40421',
        '65108',
        '21528',
        '19474',
        '19371',
        '41128',
        '72659',
        '91749',
        '8933',
        '85532',
        '98415',
        '12939',
        '6080',
        '45349',
        '61799',
        '739',
        '80419',
        '34284',
        '97020',
        '19184',
        '75323',
        '59111',
        '77639',
        '55144',
        '80251',
        '13117',
        '14788',
        '22246',
        '54919',
        '70540',
        '90083',
        '29733',
        '12235',
        '29176',
        '8219',
        '27593',
        '54429',
        '62659',
        '47903',
        '57765',
        '6506',
        '39568',
        '94090',
        '25772',
        '72924',
        '41342',
        '37940',
        '29017',
        '36644',
        '88581',
        '48012',
        '79178',
        '53062',
        '60204',
        '35220',
        '23955',
        '41054',
        '10104',
        '20425',
        '36851',
        '11472',
        '26671',
        '92138',
        '21683',
        '99732',
        '95866',
        '11970',
        '22140',
        '43005',
        '18690',
        '15544',
        '54203',
        '27836',
        '12141',
        '48882',
        '54936',
        '55754',
        '43048',
        '43520',
        '90665',
        '24825',
        '55729',
        '98207',
        '17549',
        '15069',
        '4266',
        '29578',
        '20205',
        '23255',
        '60682',
        '15492',
        '40159',
        '11595',
        '58207',
        '40755',
        '36275',
        '96923',
        '2634',
        '34230',
        '88439',
        '28355',
        '14003',
        '25694',
        '20827',
        '650',
        '49808',
        '20548',
        '17317',
        '33243',
        '89127',
        '43093',
        '54444',
        '30026',
        '52562',
        '94408',
        '24993',
        '26438',
        '25280',
        '10276',
        '8074',
        '20075',
        '40061',
        '53077',
        '602',
        '4241',
        '88009',
        '31754',
        '26423',
        '88901',
        '55556',
        '31298',
        '15929',
        '44192',
        '49865',
        '86405',
        '52648',
        '11597',
        '45481',
        '31725',
        '48919',
        '1888',
        '48758',
        '88323',
        '719',
        '52733',
        '25774',
        '99174',
        '81246',
        '55473',
        '43974',
        '74466',
        '62861',
        '71345',
        '76552',
        '33474',
        '60663',
        '25712',
        '16681',
        '58065',
        '46987',
        '19346',
        '52557',
        '45051',
        '17081',
        '92572',
        '70176',
        '6814',
        '49909',
        '53584',
        '73085',
        '82711',
        '10279',
        '56177',
        '32452',
        '36570',
        '93386',
        '20410',
        '29062',
        '28109',
        '66642',
        '14774',
        '16522',
        '80432',
        '51693',
        '8222',
        '622',
        '69349',
        '33918',
        '41561',
        '14647',
        '37245',
        '70060',
        '84137',
        '96926',
        '57661',
        '25258',
        '72867',
        '7188',
        '34260',
        '15255',
        '50398',
        '10203',
        '16728',
        '43265',
        '13102',
        '87832',
        '4415',
        '90051',
        '38877',
        '70059',
        '77411',
        '71434',
        '46018',
        '85336',
        '30129',
        '42375',
        '32799',
        '7979',
        '10154',
        '44372',
        '45099',
        '17884',
        '19080',
        '11854',
        '99104',
        '32042',
        '3247',
        '82931',
        '48557',
        '43099',
        '96941',
        '10055',
        '84244',
        '12111',
        '54215',
        '14703',
        '89832',
        '91410',
        '95154',
        '42209',
        '85359',
        '80469',
        '49063',
        '15740',
        '29447',
        '95190',
        '80436',
        '20558',
        '43761',
        '49075',
        '977',
        '90714',
        '20277',
        '20071',
        '930',
        '703',
        '59112',
        '49406',
        '53288',
        '47740',
        '15619',
        '12288',
        '20404',
        '63772',
        '61634',
        '25860',
        '80323',
        '15336',
        '83551',
        '95852',
        '38194',
        '92418',
        '25722',
        '4850',
        '40849',
        '20590',
        '25231',
        '47370',
        '19188',
        '17528',
        '802',
        '24624',
        '20537',
        '68058',
        '10277',
        '23681',
        '40501',
        '92864',
        '53234',
        '59717',
        '40830',
        '88311',
        '91186',
        '94974',
        '23512',
        '48177',
        '71946',
        '95992',
        '36455',
        '71650',
        '87038',
        '45358',
        '94099',
        '13641',
        '76555',
        '81626',
        '53064',
        '88585',
        '36913',
        '19969',
        '30146',
        '72183',
        '965',
        '32774',
        '99155',
        '88586',
        '18401',
        '82006',
        '29442',
        '72222',
        '50329',
        '31412',
        '15553',
        '71309',
        '36731',
        '11480',
        '84151',
        '89158',
        '2768',
        '32574',
        '11242',
        '23260',
        '37068',
        '53278',
        '8732',
        '4014',
        '47245',
        '98064',
        '2722',
        '3073',
        '42334',
        '88511',
        '15925',
        '32105',
        '38945',
        '92261',
        '20406',
        '63847',
        '97018',
        '8220',
        '13762',
        '71769',
        '17730',
        '75053',
        '24845',
        '71339',
        '33882',
        '92616',
        '92632',
        '30811',
        '45270',
        '30514',
        '19408',
        '29224',
        '85671',
        '91407',
        '17504',
        '25034',
        '33192',
        '36192',
        '57426',
        '80960',
        '29695',
        '94234',
        '19721',
        '14745',
        '67277',
        '32245',
        '61653',
        '70738',
        '32704',
        '79914',
        '12600',
        '15435',
        '34778',
        '95298',
        '71864',
        '99811',
        '55472',
        '6161',
        '20228',
        '27668',
        '92202',
        '29846',
        '98442',
        '79181',
        '62676',
        '76098',
        '6503',
        '59902',
        '38550',
        '6487',
        '64180',
        '10951',
        '54906',
        '20038',
        '84522',
        '6439',
        '45222',
        '19187',
        '23483',
        '82003',
        '52244',
        '6911',
        '54927',
        '86329',
        '24852',
        '23873',
        '91346',
        '45719',
        '92149',
        '53928',
        '28243',
        '95390',
        '11247',
        '15664',
        '20332',
        '47324',
        '2293',
        '8899',
        '83730',
        '17583',
        '94236',
        '28368',
        '38148',
        '18010',
        '49917',
        '15315',
        '19714',
        '2584',
        '87011',
        '30287',
        '8601',
        '20061',
        '20177',
        '42632',
        '64051',
        '75666',
        '20426',
        '49813',
        '30671',
        '43791',
        '46255',
        '714',
        '29218',
        '68542',
        '27629',
        '45422',
        '17503',
        '28727',
        '25172',
        '61132',
        '4016',
        '25507',
        '35478',
        '55380',
        '23468',
        '96153',
        '87322',
        '24002',
        '97135',
        '59445',
        '32777',
        '32961',
        '32655',
        '12240',
        '96157',
        '85291',
        '4075',
        '33537',
        '88550',
        '24961',
        '21150',
        '53785',
        '15321',
        '53138',
        '16322',
        '23465',
        '10112',
        '62718',
        '89193',
        '75008',
        '25777',
        '19880',
        '23276',
        '25519',
        '44693',
        '34644',
        '18970',
        '80441',
        '49261',
        '23115',
        '28749',
        '65673',
        '12128',
        '93765',
        '47366',
        '88531',
        '53003',
        '31564',
        '90743',
        '88545',
        '28760',
        '90102',
        '82724',
        '92652',
        '63938',
        '94927',
        '35245',
        '94250',
        '64168',
        '46744',
        '72381',
        '61824',
        '32516',
        '20391',
        '16837',
        '23261',
        '71050',
        '28810',
        '4972',
        '20149',
        '27228',
        '36194',
        '29002',
        '97242',
        '30155',
        '35895',
        '60691',
        '44639',
        '61640',
        '21609',
        '87190',
        '81148',
        '5144',
        '88534',
        '79499',
        '88006',
        '18768',
        '47549',
        '43510',
        '24919',
        '47263',
        '20239',
        '30369',
        '85655',
        '31777',
        '73001',
        '25853',
        '22080',
        '22185',
        '29719',
        '58506',
        '15082',
        '47134',
        '17585',
        '30726',
        '53779',
        '47617',
        '88202',
        '74159',
        '41009',
        '30201',
        '17294',
        '33623',
        '84199',
        '89036',
        '10153',
        '53056',
        '70784',
        '20241',
        '21404',
        '76906',
        '34611',
        '48663',
        '13484',
        '6061',
        '8313',
        '24011',
        '27031',
        '30159',
        '94106',
        '68951',
        '45061',
        '32297',
        '27351',
        '20392',
        '47437',
        '33318',
        '31786',
        '25186',
        '54012',
        '25389',
        '39552',
        '50396',
        '1582',
        '38124',
        '45475',
        '57194',
        '39521',
        '83729',
        '82717',
        '25833',
        '23705',
        '20090',
        '43656',
        '6083',
        '30172',
        '21916',
        '29226',
        '6167',
        '6491',
        '80201',
        '61105',
        '16825',
        '2712',
        '987',
        '94207',
        '70464',
        '98378',
        '91102',
        '98539',
        '59240',
        '15841',
        '88515',
        '64073',
        '18357',
        '45884',
        '15710',
        '98138',
        '73091',
        '15282',
        '92018',
        '91771',
        '73046',
        '35123',
        '48606',
        '84153',
        '85717',
        '18323',
        '31724',
        '92702',
        '35237',
        '88520',
        '49263',
        '49018',
        '6064',
        '12257',
        '19049',
        '59732',
        '19316',
        '39457',
        '75394',
        '29071',
        '769',
        '77265',
        '90030',
        '10158',
        '33593',
        '66636',
        '71458',
        '50318',
        '6414',
        '48277',
        '16550',
        '38136',
        '30133',
        '4954',
        '81290',
        '1133',
        '85069',
        '17568',
        '25237',
        '49785',
        '91123',
        '28738',
        '33466',
        '20185',
        '2880',
        '90711',
        '94098',
        '40867',
        '52030',
        '55551',
        '44687',
        '82638',
        '78350',
        '79944',
        '27906',
        '22014',
        '79161',
        '96915',
        '7881',
        '53792',
        '30414',
        '10163',
        '21412',
        '22013',
        '36254',
        '70069',
        '83454',
        '87057',
        '18351',
        '10172',
        '51015',
        '31723',
        '27907',
        '55555',
        '28614',
        '30271',
        '96841',
        '86052',
        '11582',
        '2195',
        '34464',
        '97010',
        '97254',
        '79489',
        '42216',
        '36101',
        '23630',
        '64621',
        '53512',
        '10271',
        '94209',
        '45721',
        '75350',
        '6521',
        '34218',
        '27361',
        '50339',
        '20506',
        '29424',
        '19942',
        '20407',
        '35560',
        '29452',
        '64144',
        '21288',
        '12016',
        '12229',
        '22552',
        '70421',
        '45264',
        '71768',
        '26435',
        '71649',
        '88587',
        '3911',
        '70186',
        '40448',
        '25624',
        '84715',
        '38033',
        '44177',
        '8352',
        '82631',
        '78289',
        '34641',
        '18981',
        '32175',
        '58002',
        '92836',
        '46863',
        '6041',
        '32067',
        '20146',
        '627',
        '2173',
        '45352',
        '90801',
        '41459',
        '48559',
        '19108',
        '16036',
        '92599',
        '53060',
        '70064',
        '33937',
        '7096',
        '94252',
        '11240',
        '34616',
        '39112',
        '6263',
        '10629',
        '32590',
        '61652',
        '33465',
        '59020',
        '49427',
        '48707',
        '17263',
        '33164',
        '40604',
        '47225',
        '28652',
        '88533',
        '91618',
        '20453',
        '91499',
        '92369',
        '97208',
        '26544',
        '32604',
        '22638',
        '48258',
        '75958',
        '98907',
        '13623',
        '37867',
        '28459',
        '53152',
        '81248',
        '20195',
        '25279',
        '22501',
        '62973',
        '87568',
        '39506',
        '34673',
        '33499',
        '10168',
        '48268',
        '83635',
        '91933',
        '91114',
        '70055',
        '36270',
        '18773',
        '61317',
        '91802',
        '25943',
        '40931',
        '17217',
        '21715',
        '20160',
        '60670',
        '94522',
        '21868',
        '71931',
        '24114',
        '7970',
        '96809',
        '72053',
        '48909',
        '36141',
        '28647',
        '51593',
        '23427',
        '33061',
        '59856',
        '5054',
        '89154',
        '13631',
        '2901',
        '84724',
        '7507',
        '92198',
        '36119',
        '49119',
        '22548',
        '19457',
        '12593',
        '79989',
        '71279',
        '55189',
        '98083',
        '42607',
        '70183',
        '27264',
        '25335',
        '77212',
        '73167',
        '2672',
        '14646',
        '45138',
        '96943',
        '20040',
        '78468',
        '36120',
        '35804',
        '7308',
        '8905',
        '25639',
        '26574',
        '15624',
        '36628',
        '84110',
        '5501',
        '41137',
        '24003',
        '24469',
        '11745',
        '94926',
        '2207',
        '7451',
        '31202',
        '26334',
        '15347',
        '3111',
        '46868',
        '41536',
        '5402',
        '47629',
        '92640',
        '47984',
        '61130',
        '67257',
        '6144',
        '16107',
        '87184',
        '83124',
        '35440',
        '92090',
        '81649',
        '53293',
        '40730',
        '41268',
        '16698',
        '91386',
        '29602',
        '56333',
        '96922',
        '30645',
        '23155',
        '37901',
        '60658',
        '17312',
        '38704',
        '71613',
        '43960',
        '31297',
        '25866',
        '6160',
        '59728',
        '92781',
        '32417',
        '1041',
        '56369',
        '79980',
        '53917',
        '58208',
        '7099',
        '70593',
        '33338',
        '40233',
        '8720',
        '37346',
        '58320',
        '29652',
        '94045',
        '78765',
        '83206',
        '49312',
        '49934',
        '20890',
        '82430',
        '47222',
        '38314',
        '55801',
        '92857',
        '12234',
        '81330',
        '99788',
        '6816',
        '83722',
        '17750',
        '5745',
        '70170',
        '55564',
        '43682',
        '38634',
        '95622',
        '49971',
        '38630',
        '49628',
        '42702',
        '22558',
        '92735',
        '8650',
        '44798',
        '27658',
        '58553',
        '78764',
        '71480',
        '16225',
        '65031',
        '21524',
        '46527',
        '84134',
        '773',
        '94293',
        '48769',
        '31742',
        '6753',
        '27827',
        '90410',
        '20245',
        '76204',
        '39502',
        '24373',
        '38183',
        '1467',
        '80937',
        '78952',
        '71481',
        '92160',
        '41012',
        '91908',
        '31759',
        '31753',
        '17031',
        '70509',
        '2020',
        '43657',
        '62805',
        '98507',
        '91729',
        '89407',
        '45428',
        '44760',
        '40619',
        '30377',
        '95269',
        '72190',
        '76191',
        '72610',
        '8808',
        '26344',
        '86338',
        '92174',
        '23530',
        '18968',
        '79405',
        '27415',
        '28603',
        '25338',
        '18926',
        '44861',
        '77726',
        '29425',
        '33420',
        '94235',
        '25086',
        '46291',
        '2106',
        '48278',
        '19544',
        '20915',
        '43111',
        '88577',
        '23431',
        '72613',
        '98401',
        '33863',
        '29390',
        '30999',
        '53953',
        '5731',
        '6372',
        '48922',
        '29416',
        '27116',
        '95798',
        '91976',
        '97268',
        '20599',
        '75429',
        '72557',
        '25776',
        '47871',
        '73199',
        '20541',
        '15739',
        '73184',
        '49530',
        '51102',
        '71171',
        '32521',
        '53786',
        '970',
        '92619',
        '92052',
        '92051',
        '70576',
        '10610',
        '40944',
        '1947',
        '70716',
        '40231',
        '25692',
        '75294',
        '20077',
        '7511',
        '39193',
        '57795',
        '95159',
        '15483',
        '32540',
        '44881',
        '94248',
        '20043',
        '34948',
        '48321',
        '20894',
        '48275',
        '28407',
        '98041',
        '93782',
        '20515',
        '27198',
        '2209',
        '24032',
        '22121',
        '33340',
        '72403',
        '74169',
        '44838',
        '59073',
        '98565',
        '78763',
        '47361',
        '72767',
        '8315',
        '59760',
        '20268',
        '46680',
        '14721',
        '95406',
        '624',
        '47939',
        '19395',
        '50673',
        '94975',
        '42241',
        '62705',
        '54214',
        '78292',
        '3589',
        '44190',
        '94138',
        '17731',
        '87154',
        '86331',
        '57214',
        '45253',
        '64183',
        '3232',
        '37239',
        '25855',
        '76096',
        '22848',
        '96940',
        '2366',
        '77315',
        '54176',
        '88038',
        '92642',
        '89195',
        '98111',
        '60147',
        '33509',
        '51008',
        '79170',
        '70151',
        '86544',
        '29211',
        '46780',
        '46995',
        '25630',
        '18514',
        '55585',
        '49020',
        '29679',
        '59743',
        '70042',
        '19554',
        '12262',
        '30077',
        '25687',
        '16660',
        '7509',
        '39477',
        '77266',
        '7763',
        '45041',
        '6601',
        '84529',
        '69190',
        '6006',
        '95343',
        '72052',
        '71365',
        '85244',
        '87117',
        '20456',
        '10152',
        '70096',
        '48825',
        '19884',
        '12249',
        '55190',
        '50328',
        '63177',
        '21734',
        '27429',
        '17250',
        '47034',
        '652',
        '70585',
        '85082',
        '59631',
        '17039',
        '1203',
        '47733',
        '29217',
        '80163',
        '88571',
        '32610',
        '81227',
        '16848',
        '49357',
        '80281',
        '15485',
        '92654',
        '31702',
        '24535',
        '56591',
        '40495',
        '70167',
        '27010',
        '41422',
        '43934',
        '31185',
        '24973',
        '94141',
        '6888',
        '68819',
        '43970',
        '19484',
        '76198',
        '10119',
        '25856',
        '28667',
        '84055',
        '71133',
        '1477',
        '65042',
        '90086',
        '21759',
        '18043',
        '43117',
        '43805',
        '70879',
        '30502',
        '27259',
        '15351',
        '19545',
        '73076',
        '94159',
        '34634',
        '10281',
        '14650',
        '94003',
        '71253',
        '64195',
        '66628',
        '73436',
        '48674',
        '15685',
        '20660',
        '43681',
        '93214',
        '13163',
        '80941',
        '13814',
        '62929',
        '13305',
        '60209',
        '45384',
        '45235',
        '50652',
        '75014',
        '77343',
        '92816',
        '2204',
        '98287',
        '75320',
        '91051',
        '4675',
        '87538',
        '94023',
        '22924',
        '6531',
        '37864',
        '71865',
        '49502',
        '86412',
        '4738',
        '8858',
        '17232',
        '17932',
        '59406',
        '12784',
        '22954',
        '22524',
        '19892',
        '76526',
        '19470',
        '45372',
        '17303',
        '44682',
        '55361',
        '27825',
        '91046',
        '31198',
        '63371',
        '30911',
        '80997',
        '11255',
        '89450',
        '12544',
        '32235',
        '43127',
        '12432',
        '13087',
        '99146',
        '74170',
        '47458',
        '40405',
        '86515',
        '90308',
        '93006',
        '84127',
        '99152',
        '780',
        '40476',
        '910',
        '93724',
        '26734',
        '46183',
        '2401',
        '97076',
        '5049',
        '30018',
        '60697',
        '28042',
        '87034',
        '38902',
        '93116',
        '41170',
        '54434',
        '2405',
        '68042',
        '25773',
        '70580',
        '10079',
        '88510',
        '43101',
        '66222',
        '41065',
        '15331',
        '23275',
        '7051',
        '98950',
        '98434',
        '68026',
        '95142',
        '30919',
        '53725',
        '62796',
        '63196',
        '93385',
        '95967',
        '22451',
        '21861',
        '15863',
        '35407',
        '15680',
        '55722',
        '92665',
        '31420',
        '30475',
        '29250',
        '63338',
        '20315',
        '38043',
        '61057',
        '15455',
        '84090',
        '19424',
        '20314',
        '23282',
        '33022',
        '5666',
        '77249',
        '16730',
        '26522',
        '22529',
        '2027',
        '80520',
        '32910',
        '28361',
        '72525',
        '37773',
        '29925',
        '93784',
        '27894',
        '43635',
        '21020',
        '63066',
        '1263',
        '7498',
        '28231',
        '19178',
        '55470',
        '12568',
        '94286',
        '10176',
        '62726',
        '46508',
        '86339',
        '68501',
        '21810',
        '27417',
        '32411',
        '82939',
        '71134',
        '22565',
        '68179',
        '45172',
        '40584',
        '28055',
        '24917',
        '23396',
        '4489',
        '18931',
        '4552',
        '99299',
        '87582',
        '43226',
        '63022',
        '57628',
        '67414',
        '50333',
        '70185',
        '22517',
        '25649',
        '89125',
        '50361',
        '10581',
        '65805',
        '96919',
        '81421',
        '40555',
        '47683',
        '23439',
        '77268',
        '91380',
        '32313',
        '99520',
        '21273',
        '43940',
        '55067',
        '15754',
        '59807',
        '55903',
        '50363',
        '98497',
        '65765',
        '6721',
        '34277',
        '41150',
        '36196',
        '34264',
        '23183',
        '30244',
        '98807',
        '20570',
        '2552',
        '91614',
        '80044',
        '16733',
        '48232',
        '24327',
        '20597',
        '16246',
        '76178',
        '24068',
        '17880',
        '43126',
        '46595',
        '91109',
        '27625',
        '45267',
        '71218',
        '20581',
        '80328',
        '57202',
        '12223',
        '2541',
        '15696',
        'NULL',
        '37605',
        '63180',
        '95114',
        '85228',
        '29077',
        '705',
        '89449',
        '30321',
        '2202',
        '32589',
        '47730',
        '74465',
        '39535',
        '50110',
        '7715',
        '22038',
        '63378',
        '97143',
        '3803',
        '50587',
        '14537',
        '80306',
        '63171',
        '92038',
        '96950',
        '43463',
        '75376',
        '22555',
        '37815',
        '22130',
        '58107',
        '24872',
        '20292',
        '97240',
        '6650',
        '79493',
        '43317',
        '49317',
        '43937',
        '27014',
        '12848',
        '24029',
        '16876',
        '94016',
        '75485',
        '18002',
        '70521',
        '17839',
        '85252',
        '96854',
        '27570',
        '12949',
        '15365',
        '96788',
        '35468',
        '11245',
        '39173',
        '62765',
        '27861',
        '25707',
        '42719',
        '53099',
        '7015',
        '32178',
        '32296',
        '14269',
        '45839',
        '35295',
        '33571',
        '20719',
        '47724',
        '90607',
        '63820',
        '46634',
        '97335',
        '55577',
        '17318',
        '25934',
        '33107',
        '77245',
        '81302',
        '29046',
        '46604',
        '88546',
        '61639',
        '42033',
        '28275',
        '1061',
        '58319',
        '92162',
        '93586',
        '8358',
        '82605',
        '20738',
        '56485',
        '48347',
        '79974',
        '33694',
        '17748',
        '98161',
        '56075',
        '83707',
        '20552',
        '2411',
        '58402',
        '65607',
        '27412',
        '47857',
        '94285',
        '90509',
        '63779',
        '65615',
        '20532',
        '14271',
        '19196',
        '32897',
        '23289',
        '36501',
        '93744',
        '95015',
        '83277',
        '98494',
        '40533',
        '36427',
        '47830',
        '33345',
        '23031',
        '85608',
        '33429',
        '76150',
        '83720',
        '36859',
        '97709',
        '92531',
        '20042',
        '41362',
        '95201',
        '30085',
        '14518',
        '29724',
        '33002',
        '30325',
        '7019',
        '30376',
        '98129',
        '17123',
        '19898',
        '29439',
        '99619',
        '38962',
        '76677',
        '94254',
        '53285',
        '19430',
        '13503',
        '641',
        '28332',
        '70154',
        '21130',
        '94261',
        '19432',
        '89152',
        '28370',
        '97427',
        '24607',
        '87199',
        '11696',
        '95108',
        '15257',
        '34270',
        '69353',
        '85230',
        '27102',
        '77491',
        '982',
        '92133',
        '33482',
        '14276',
        '61037',
        '13761',
        '22040',
        '10045',
        '20350',
        '14270',
        '48037',
        '2185',
        '93216',
        '7175',
        '25162',
        '50431',
        '47703',
        '90510',
        '41410',
        '12459',
        '20063',
        '6914',
        '19183',
        '82929',
        '10043',
        '97075',
        '32752',
        '32936',
        '11774',
        '96942',
        '95044',
        '80527',
        '5671',
        '80165',
        '98504',
        '14112',
        '33092',
        '43803',
        '70004',
        '31706',
        '96952',
        '35286',
        '95171',
        '6145',
        '1244',
        '99790',
        '95433',
        '96916',
        '70504',
        '42084',
        '40363',
        '17064',
        '18916',
        '94616',
        '56398',
        '15547',
        '43738',
        '42060',
        '6912',
        '62720',
        '16253',
        '6459',
        '24463',
        '31728',
        '85312',
        '23170',
        '70894',
        '66637',
        '26535',
        '85357',
        '24475',
        '76193',
        '32353',
        '71678',
        '98393',
        '99918',
        '11474',
        '37241',
        '1470',
        '95865',
        '11805',
        '4964',
        '698',
        '25693',
        '82615',
        '68176',
        '31221',
        '89557',
        '29688',
        '28674',
        '19351',
        '91191',
        '41061',
        '43269',
        '39161',
        '50243',
        '56179',
        '25255',
        '80522',
        '37371',
        '89164',
        '54851',
        '50305',
        '17734',
        '31908',
        '48269',
        '52150',
        '28234',
        '24658',
        '41408',
        '95102',
        '25967',
        '94203',
        '16361',
        '37999',
        '90834',
        '12069',
        '44665',
        '78427',
        '80293',
        '82640',
        '81074',
        '23631',
        '92420',
        '49356',
        '18044',
        '18001',
        '46867',
        '92885',
        '11930',
        '33940',
        '31766',
        '20401',
        '44493',
        '41736',
        '57774',
        '78502',
        '53201',
        '25149',
        '94142',
        '10117',
        '12977',
        '79320',
        '7765',
        '729',
        '91610',
        '92292',
        '13435',
        '98639',
        '38959',
        '24899',
        '49627',
        '38227',
        '75505',
        '87529',
        '95958',
        '71731',
        '54890',
        '61017',
        '75608',
        '94146',
        '2350',
        '91804',
        '87563',
        '98667',
        '85728',
        '48550',
        '38130',
        '11690',
        '33927',
        '53942',
        '89319',
        '20084',
        '79984',
        '20470',
        '58310',
        '43768',
        '56478',
        '35293',
        '81124',
        '71230',
        '92681',
        '67251',
        '36457',
        '2168',
        '53237',
        '81612',
        '39158',
        '45055',
        '33733',
        '46769',
        '76867',
        '15520',
        '25873',
        '83656',
        '22115',
        '46704',
        '26323',
        '25907',
        '84725',
        '97740',
        '637',
        '41702',
        '8885',
        '74155',
        '57074',
        '2363',
        '84657',
        '37222',
        '12261',
        '33964',
        '28563',
        '87503',
        '13107',
        '53793',
        '33335',
        '57102',
        '38802',
        '24886',
        '85219',
        '49463',
        '89520',
        '45210',
        '14410',
        '72615',
        '25568',
        '45698',
        '73172',
        '97290',
        '38056',
        '24627',
        '10258',
        '5490',
        '78780',
        '92403',
        '33583',
        '98493',
        '73177',
        '86438',
        '73088',
        '73081',
        '80426',
        '70011',
        '33741',
        '31208',
        '16834',
        '19480',
        '39182',
        '87583',
        '35021',
        '83877',
        '95813',
        '39555',
        '66276',
        '46015',
        '52406',
        '76304',
        '22216',
        '84091',
        '65701',
        '88213',
        '77297',
        '28815',
        '17953',
        '66063',
        '43660',
        '47202',
        '1083',
        '1615',
        '24854',
        '12231',
        '16035',
        '67276',
        '10959',
        '10802',
        '28629',
        '17254',
        '99694',
        '91376',
        '44186',
        '79987',
        '24062',
        '20060',
        '70556',
        '98860',
        '93102',
        '33821',
        '89438',
        '44101',
        '13024',
        '33742',
        '12124',
        '70895',
        '98364',
        '55601',
        '24468',
        '55814',
        '44331',
        '8213',
        '91943',
        '46896',
        '823',
        '20047',
        '25916',
        '43529',
        '30163',
        '975',
        '39505',
        '87198',
        '8888',
        '90233',
        '70562',
        '48830',
        '93745',
        '20847',
        '4054',
        '26369',
        '70893',
        '20415',
        '44848',
        '60116',
        '88036',
        '79917',
        '92686',
        '27322',
        '33622',
        '48299',
        '71172',
        '46046',
        '46581',
        '42135',
        '21685',
        '40602',
        '56371',
        '99695',
        '1601',
        '57483',
        '47426',
        '72217',
        '38502',
        '10108',
        '23017',
        '40362',
        '27943',
        '87158',
        '27220',
        '57729',
        '41614',
        '78286',
        '96840',
        '64478',
        '29230',
        '96151',
        '24936',
        '6444',
        '8076',
        '23081',
        '34666',
        '86018',
        '8922',
        '29364',
        '22184',
        '47925',
        '71164',
        '14010',
        '33736',
        '17946',
        '15053',
        '41651',
        '6049',
        '92142',
        '6813',
        '43216',
        '44399',
        '48862',
        '48437',
        '48802',
        '14888',
        '70892',
        '60667',
        '19171',
        '52809',
        '93423',
        '79769',
        '95152',
        '57776',
        '41663',
        '20232',
        '62071',
        '46380',
        '92621',
        '77349',
        '26209',
        '24732',
        '83849',
        '38644',
        '85325',
        '96838',
        '10095',
        '8073',
        '30378',
        '92039',
        '606',
        '23292',
        '13089',
        '751',
        '47737',
        '97102',
        '6258',
        '12975',
        '24129',
        '29731',
        '90213',
        '85329',
        '47547',
        '23891',
        '99014',
        '93596',
        '49468',
        '64751',
        '83433',
        '53701',
        '99102',
        '1139',
        '88349',
        '45463',
        '54602',
        '6034',
        '62310',
        '49104',
        '46865',
        '75391',
        '32899',
        '84016',
        '45070',
        '45374',
        '19161',
        '60699',
        '10169',
        '2754',
        '60474',
        '63199',
        '93024',
        '80841',
        '82943',
        '88589',
        '7303',
        '32898',
        '19482',
        '77238',
        '34712',
        '25211',
        '37304',
        '31175',
        '87153',
        '84776',
        '2018',
        '19407',
        '40252',
        '81024',
        '53008',
        '27404',
        '20041',
        '20372',
        '13362',
        '52407',
        '38745',
        '4225',
        '49778',
        '50852',
        '24146',
        '63882',
        '16343',
        '979',
        '63346',
        '19048',
        '64853',
        '99652',
        '87545',
        '10159',
        '43601',
        '22461',
        '82061',
        '1538',
        '57195',
        '79960',
        '94145',
        '43909',
        '71428',
        '5678',
        '81009',
        '57420',
        '71410',
        '44631',
        '27289',
        '98561',
        '80262',
        '73153',
        '2348',
        '24851',
        '15682',
        '31307',
        '3601',
        '96737',
        '31203',
        '98035',
        '3107',
        '39171',
        '43525',
        '2557',
        '44195',
        '29608',
        '36533',
        '2836',
        '10633',
        '33459',
        '33910',
        '25079',
        '33550',
        '32135',
        '14876',
        '40981',
        '91612',
        '27374',
        '25972',
        '60006',
        '25002',
        '8646',
        '19718',
        '72066',
        '11959',
        '97819',
        '70141',
        '76715',
        '72164',
        '8526',
        '84650',
        '19052',
        '44088',
        '14095',
        '46515',
        '46860',
        '23131',
        '31126',
        '47249',
        '92165',
        '50338',
        '70451',
        '18577',
        '38960',
        '63157',
        '55594',
        '92581',
        '14902',
        '95643',
        '12073',
        '40854',
        '16558',
        '36663',
        '24710',
        '80162',
        '46855',
        '25205',
        '39569',
        '53159',
        '28230',
        '75389',
        '28053',
        '17358',
        '35809',
        '50380',
        '83447',
        '14126',
        '16544',
        '25816',
        '67504',
        '10943',
        '71036',
        '57229',
        '92023',
        '66551',
        '60685',
        '33017',
        '85223',
        '6532',
        '62845',
        '43057',
        '91319',
        '96844',
        '14558',
        '85079',
        '4077',
        '85777',
        '18611',
        '2194',
        '27599',
        '38780',
        '50078',
        '1806',
        '8818',
        '70160',
        '49550',
        '45407',
        '30063',
        '57402',
        '78961',
        '96845',
        '6720',
        '28294',
        '21922',
        '71113',
        '92175',
        '63364',
        '35482',
        '37119',
        '26361',
        '79996',
        '45147',
        '24022',
        '690',
        '62761',
        '93764',
        '22577',
        '46629',
        '6535',
        '30610',
        '53824',
        '47402',
        '20260',
        '13599',
        '66119',
        '52548',
        '95378',
        '71448',
        '28813',
        '25914',
        '29430',
        '33674',
        '92187',
        '84011',
        '47884',
        '4278',
        '22212',
        '19175',
        '17550',
        '95502',
        '39704',
        '7530',
        '26102',
        '34489',
        '93099',
        '1152',
        '13610',
        '30596',
        '21252',
        '7191',
        '98940',
        '16017',
        '46967',
        '76185',
        '95161',
        '88122',
        '84131',
        '93032',
        '98063',
        '75461',
        '2357',
        '2179',
        '47139',
        '47236',
        '83620',
        '57709',
        '85724',
        '7215',
        '88547',
        '22446',
        '89439',
        '32238',
        '16644',
        '63053',
        '89421',
        '36586',
        '92552',
        '45401',
        '20566',
        '33608',
        '47367',
        '36547',
        '16160',
        '34958',
        '84008',
        '918',
        '94269',
        '65022',
        '24285',
        '45274',
        '11486',
        '61632',
        '47982',
        '10160',
        '60159',
        '83865',
        '4112',
        '7184',
        '45716',
        '17333',
        '11488',
        '81658',
        '7399',
        '57109',
        '62715',
        '98909',
        '57056',
        '96842',
        '70519',
        '17072',
        '33439',
        '6132',
        '26275',
        '83744',
        '96811',
        '34740',
        '39754',
        '10922',
        '53052',
        '32562',
        '38025',
        '8740',
        '92862',
        '23068',
        '44282',
        '29603',
        '21263',
        '5405',
        '97282',
        '29734',
        '22020',
        '11452',
        '28007',
        '88115',
        '95077',
        '24950',
        '4094',
        '33959',
        '11975',
        '72028',
        '21298',
        '11450',
        '33661',
        '26422',
        '7890',
        '2104',
        '90231',
        '83816',
        '20167',
        '88429',
        '28017',
        '13260',
        '98609',
        '14029',
        '31416',
        '52498',
        '84327',
        '20116',
        '95344',
        '54735',
        '20073',
        '60128',
        '28319',
        '985',
        '88553',
        '4737',
        '53596',
        '14140',
        '28282',
        '32597',
        '43966',
        '44999',
        '48887',
        '80035',
        '24817',
        '40589',
        '93750',
        '75367',
        '75444',
        '47996',
        '95031',
        '91611',
        '40745',
        '12483',
        '86540',
        '19564',
        '78788',
        '91328',
        '90846',
        '48231',
        '5088',
        '92423',
        '39151',
        '14644',
        '47814',
        '19244',
        '6889',
        '49501',
        '32733',
        '49409',
        '30544',
        '55950',
        '13674',
        '37071',
        '47869',
        '38163',
        '955',
        '26527',
        '1252',
        '24606',
        '84301',
        '89009',
        '17027',
        '63302',
        '19905',
        '29368',
        '65302',
        '92593',
        '24604',
        '7855',
        '38675',
        '80532',
        '66624',
        '63850',
        '2217',
        '10196',
        '85274',
        '89513',
        '24024',
        '2181',
        '30819',
        '79164',
        '28235',
        '25361',
        '31710',
        '30449',
        '20765',
        '88560',
        '29484',
        '63632',
        '83844',
        '12778',
        '81134',
        '20221',
        '20222',
        '96726',
        '32267',
        '88055',
        '50799',
        '4690',
        '2047',
        '23422',
        '41457',
        '96709',
        '30065',
        '2238',
        '37717',
        '60694',
        '11499',
        '46277',
        '61058',
        '68180',
        '32887',
        '18924',
        '46155',
        '24058',
        '55004',
        '32337',
        '82524',
        '47880',
        '4262',
        '19548',
        '12113',
        '18991',
        '28009',
        '26173',
        '58125',
        '25614',
        '64171',
        '20757',
        '84334',
        '26576',
        '12250',
        '16054',
        '23284',
        '1586',
        '15736',
        '43346',
        '33942',
        '79941',
        '75037',
        '12417',
        '96070',
        '53962',
        '60673',
        '32877',
        '79973',
        '85372',
        '43330',
        '89570',
        '670',
        '83025',
        '93107',
        '53101',
        '56356',
        '72757',
        '23612',
        '23107',
        '98093',
        '83312',
        '60684',
        '92601',
        '41156',
        '78074',
        '27499',
        '60170',
        '91382',
        '18934',
        '44690',
        '64191',
        '88065',
        '75396',
        '42564',
        '40576',
        '82218',
        '91508',
        '12245',
        '88350',
        '25921',
        '95253',
        '92177',
        '33443',
        '62252',
        '1546',
        '85633',
        '678',
        '24023',
        '35260',
        '19423',
        '17607',
        '11855',
        '20128',
        '15752',
        '11535',
        '10596',
        '92199',
        '16805',
        '22091',
        '44189',
        '26769',
        '94308',
        '48736',
        '18348',
        '76121',
        '37224',
        '611',
        '76439',
        '62527',
        '35038',
        '20911',
        '88517',
        '4420',
        '49864',
        '43530',
        '96910',
        '84521',
        '32138',
        '28628',
        '99850',
        '18234',
        '99332',
        '19489',
        '16352',
        '24025',
        '43144',
        '59473',
        '41131',
        '52344',
        '88433',
        '50304',
        '78463',
        '23521',
        '12236',
        '85352',
        '97468',
        '27495',
        '51107',
        '39558',
        '87523',
        '8233',
        '61629',
        '51017',
        '1899',
        '94177',
        '71307',
        '33836',
        '25076',
        '55931',
        '20242',
        '44251',
        '68139',
        '90306',
        '801',
        '56513',
        '30639',
        '70558',
        '79943',
        '11947',
        '32294',
        '71120',
        '88548',
        '28737',
        '41542',
        '59461',
        '98291',
        '88578',
        '49518',
        '25272',
        '29219',
        '25156',
        '70718',
        '70153',
        '37424',
        '67517',
        '84632',
        '601',
        '27237',
        '27811',
        '84142',
        '17093',
        '20289',
        '47750',
        '6230',
        '12050',
        '45899',
        '40232',
        '41307',
        '32523',
        '99725',
        '72303',
        '31318',
        '3265',
        '46114',
        '13837',
        '3587',
        '30270',
        '11051',
        '68664',
        '34749',
        '92716',
        '46850',
        '55598',
        '10260',
        '71233',
        '12512',
        '11547',
        '96912',
        '61126',
        '24415',
        '66727',
        '44888',
        '98344',
        '71208',
        '16614',
        '36023',
        '99707',
        '94204',
        '32231',
        '90633',
        '20547',
        '71152',
        '77972',
        '79174',
        '13505',
        '84623',
        '43058',
        '2051',
        '39081',
        '60566',
        '25818',
        '4288',
        '17311',
        '41546',
        '14851',
        '27411',
        '20629',
        '29636',
        '29648',
        '84412',
        '81070',
        '80933',
        '37389',
        '7799',
        '39174',
        '89025',
        '971',
        '24111',
        '57188',
        '63931',
        '63705',
        '667',
        '726',
        '25201',
        '62332',
        '59013',
        '47744',
        '24881',
        '36747',
        '59114',
        '74184',
        '36764',
        '92871',
        '48874',
        '52071',
        '6724',
        '3595',
        '32853',
        '12552',
        '27584',
        '77869',
        '44238',
        '22034',
        '53940',
        '40287',
        '26729',
        '18254',
        '681',
        '7902',
        '6140',
        '17930',
        '94140',
        '21705',
        '17537',
        '54654',
        '62706',
        '2403',
        '6072',
        '30142',
        '19160',
        '16312',
        '96806',
        '11099',
        '57399',
        '35573',
        '47618',
        '53267',
        '50033',
        '48123',
        '17749',
        '919',
        '94151',
        '92678',
        '71009',
        '51045',
        '28330',
        '6533',
        '21088',
        '43018',
        '94290',
        '27515',
        '922',
        '15676',
        '71161',
        '30136',
        '79238',
        '70804',
        '47997',
        '41215',
        '87201',
        '36685',
        '3896',
        '28757',
        '66634',
        '38143',
        '88595',
        '85005',
        '94064',
        '83724',
        '12879',
        '94287',
        '49924',
        '11440',
        '46930',
        '48136',
        '95416',
        '60570',
        '47322',
        '94999',
        '91222',
        '39436',
        '38195',
        '53277',
        '25721',
        '33969',
        '56372',
        '20196',
        '16665',
        '24751',
        '23609',
        '47455',
        '80970',
        '17760',
        '29147',
        '88056',
        '70642',
        '24130',
        '70066',
        '48267',
        '89026',
        '33299',
        '99015',
        '62722',
        '37024',
        '59640',
        '59904',
        '31295',
        '6011',
        '98357',
        '6386',
        '99697',
        '12864',
        '92406',
        '70825',
        '82630',
        '70727',
        '91616',
        '55574',
        '45618',
        '12438',
        '40434',
        '38378',
        '49626',
        '70743',
        '22404',
        '68737',
        '11120',
        '83788',
        '81333',
        '28687',
        '83825',
        '57629',
        '95164',
        '19376',
        '18711',
        '37602',
        '7710',
        '8217',
        '19037',
        '22120',
        '20859',
        '2553',
        '53171',
        '62762',
        '3061',
        '50704',
        '82324',
        '54226',
        '38835',
        '15915',
        '31799',
        '25926',
        '20551',
        '6389',
        '30387',
        '60598',
        '98160',
        '16388',
        '32142',
        '43653',
        '31521',
        '66625',
        '31197',
        '48325',
        '40224',
        '89448',
        '24218',
        '43151',
        '7777',
        '20555',
        '24094',
        '97292',
        '1380',
        '47536',
        '91334',
        '8245',
        '25070',
        '41538',
        '58657',
        '55485',
        '15055',
        '25697',
        '29677',
        '13051',
        '36831',
        '84779',
        '28232',
        '77293',
        '5840',
        '71750',
        '87176',
        '35041',
        '13860',
        '3769',
        '36197',
        '74187',
        '91365',
        '30389',
        '48330',
        '18335',
        '3772',
        '74720',
        '15263',
        '32593',
        '30353',
        '6926',
        '23090',
        '44862',
        '96715',
        '80275',
        '43711',
        '12174',
        '10545',
        '30608',
        '45820',
        '29433',
        '46957',
        '22320',
        '32782',
        '11972',
        '688',
        '79165',
        '33072',
        '95853',
        '77227',
        '62757',
        '47813',
        '44648',
        '2161',
        '19016',
        '42460',
        '72630',
        '29594',
        '30910',
        '18540',
        '26298',
        '23482',
        '33422',
        '28533',
        '72336',
        '23389',
        '23067',
        '74150',
        '93762',
        '23397',
        '28758',
        '92613',
        '87512',
        '33247',
        '84767',
        '25402',
        '89133',
        '87037',
        '94979',
        '27967',
        '12237',
        '78270',
        '5406',
        '52163',
        '25779',
        '1965',
        '5662',
        '71306',
        '31010',
        '98222',
        '94273',
        '2156',
        '25724',
        '3469',
        '88588',
        '53784',
        '96156',
        '97384',
        '53778',
        '32727',
        '92670',
        '55161',
        '15416',
        '80962',
        '23341',
        '66667',
        '29744',
        '1561',
        '15277',
        '40526',
        '51011',
        '46922',
        '35491',
        '28290',
        '80622',
        '25336',
        '85751',
        '87562',
        '16432',
        '55483',
        '33835',
        '8321',
        '3289',
        '33911',
        '27564',
        '98623',
        '47863',
        '55078',
        '694',
        '54543',
        '17979',
        '32715',
        '12256',
        '81046',
        '31332',
        '27402',
        '88040',
        '25067',
        '54926',
        '25904',
        '58602',
        '54417',
        '18099',
        '79180',
        '84626',
        '1369',
        '94029',
        '50397',
        '32594',
        '91116',
        '30385',
        '72313',
        '91184',
        '14975',
        '87939',
        '25665',
        '1815',
        '96930',
        '23486',
        '55730',
        '96759',
        '35275',
        '33681',
        '89504',
        '99641',
        '59913',
        '62944',
        '95671',
        '94246',
        '13201',
        '40281',
        '17129',
        '29132',
        '5670',
        '48107',
        '98386',
        '68802',
        '17256',
        '82644',
        '69171',
        '90833',
        '24132',
        '70883',
        '2158',
        '85247',
        '84407',
        '54774',
        '14639',
        '11451',
        '5453',
        '31732',
        '15560',
        '68120',
        '14479',
        '19177',
        '93258',
        '79160',
        '7820',
        '18626',
        '80255',
        '94259',
        '7837',
        '78477',
        '14730',
        '41269',
        '73849',
        '40751',
        '63742',
        '97722',
        '33000',
        '90264',
        '99775',
        '30235',
        '22646',
        '5664',
        '15283',
        '56436',
        '96917',
        '14673',
        '25182',
        '74345',
        '4098',
        '91603',
        '47344',
        '20884',
        '1614',
        '90702',
        '50608',
        '3105',
        '14542',
        '85290',
        '92235',
        '49871',
        '22957',
        '98929',
        '98811',
        '27230',
        '92730',
        '46854',
        '24115',
        '8032',
        '45866',
        '63466',
        '25966',
        '30284',
        '33820',
        '27543',
        '29822',
        '15054',
        '14205',
        '63871',
        '32634',
        '37229',
        '63875',
        '93011',
        '91788',
        '49019',
        '46852',
        '75283',
        '45250',
        '24001',
        '95424',
        '6387',
        '74067',
        '30073',
        '68861',
        '47151',
        '22075',
        '93791',
        '40066',
        '6373',
        '86330',
        '17945',
        '28266',
        '40329',
        '92645',
        '21268',
        '49035',
        '59026',
        '15251',
        '87576',
        '20725',
        '52204',
        '37326',
        '31997',
        '83732',
        '40582',
        '80279',
        '78474',
        '25330',
        '27480',
        '38947',
        '32813',
        '77839',
        '75425',
        '79947',
        '38669',
        '45301',
        '3260',
        '27532',
        '32432',
        '11043',
        '51603',
        '46942',
        '7189',
        '28283',
        '92184',
        '6602',
        '45360',
        '98297',
        '92194',
        '14887',
        '15324',
        '81010',
        '1202',
        '94237',
        '83733',
        '46699',
        '14645',
        '65038',
        '91912',
        '39061',
        '61541',
        '71828',
        '19404',
        '28776',
        '61628',
        '10060',
        '60597',
        '17883',
        '15489',
        '30210',
        '80024',
        '30719',
        '50198',
        '63197',
        '2133',
        '65817',
        '79176',
        '25014',
        '19887',
        '15274',
        '92150',
        '81028',
        '90093',
        '16850',
        '20223',
        '22018',
        '54640',
        '25052',
        '50160',
        '89824',
        '31160',
        '87311',
        '85221',
        '11564',
        '10256',
        '91795',
        '62736',
        '18195',
        '11381',
        '31727',
        '71414',
        '32573',
        '3821',
        '13218',
        '70434',
        '4402',
        '31196',
        '75363',
        '23943',
        '44199',
        '92825',
        '94562',
        '10499',
        '43962',
        '24533',
        '25265',
        '36631',
        '24595',
        '75658',
        '87070',
        '98205',
        '95071',
        '81244',
        '73455',
        '8405',
        '98397',
        '47337',
        '35255',
        '92515',
        '11241',
        '97634',
        '93421',
        '51578',
        '33539',
        '53707',
        '44482',
        '48901',
        '2862',
        '10261',
        '44845',
        '25851',
        '27881',
        '93389',
        '80257',
        '61644',
        '33690',
        '61955',
        '19511',
        '2826',
        '72215',
        '29632',
        '68963',
        '28082',
        '5741',
        '25875',
        '91003',
        '16223',
        '14643',
        '41114',
        '98492',
        '48929',
        '2103',
        '7833',
        '18084',
        '64508',
        '31758',
        '38966',
        '27094',
        '10122',
        '85071',
        '97917',
        '30174',
        '57621',
        '3252',
        '10602',
        '20408',
        '86032',
        '30343',
        '19162',
        '4933',
        '58355',
        '12862',
        '98145',
        '78545',
        '4279',
        '32230',
        '91126',
        '92178',
        '924',
        '89137',
        '21560',
        '14557',
        '38177',
        '1580',
        '75902',
        '76675',
        '95001',
        '19733',
        '28770',
        '47741',
        '99254',
        '42221',
        '25909',
        '95873',
        '91031',
        '20230',
        '5302',
        '23345',
        '51451',
        '3597',
        '21106',
        '28236',
        '43156',
        '91946',
        '49784',
        '33245',
        '16132',
        '15758',
        '24871',
        '18459',
        '98668',
        '22547',
        '11760',
        '58802',
        '59926',
        '88342',
        '15325',
        '49351',
        '2187',
        '24157',
        '30089',
        '14173',
        '97708',
        '97298',
        '55553',
        '36779',
        '20889',
        '1971',
        '16663',
        '16216',
        '30359',
        '32891',
        '98829',
        '14273',
        '48630',
        '12453',
        '35015',
        '6910',
        '920',
        '24877',
        '31421',
        '18922',
        '73146',
        '31209',
        '6474',
        '72820',
        '23399',
        '72189',
        '53542',
        '77462',
        '25357',
        '14563',
        '677',
        '72737',
        '94302',
        '14027',
        '60019',
        '22568',
        '51651',
        '13129',
        '98151',
        '54990',
        '32793',
        '25322',
        '37372',
        '33739',
        '8855',
        '90844',
        '80402',
        '83343',
        '17887',
        '84145',
        '85628',
        '49863',
        '55552',
        '27715',
        '16682',
        '40340',
        '78262',
        '19886',
        '87518',
        '87736',
        '89883',
        '19486',
        '22463',
        '17405',
        '31499',
        '92659',
        '10542',
        '28564',
        '38957',
        '49869',
        '26561',
        '91117',
        '70150',
        '36745',
        '48274',
        '92416',
        '96810',
        '19726',
        '18956',
        '16344',
        '45740',
        '13449',
        '84114',
        '17933',
        '45854',
        '46282',
        '50308',
        '11815',
        '28019',
        '93443',
        '5304',
        '24289',
        '94157',
        '89422',
        '41160',
        '76716',
        '25256',
        '96767',
        '27675',
        '30023',
        '47375',
        '94143',
        '94263',
        '32549',
        '2112',
        '25364',
        '35185',
        '30255',
        '43350',
        '45023',
        '42555',
        '32890',
        '20444',
        '77237',
        '14758',
        '15363',
        '39703',
        '49515',
        '25331',
        '43603',
        '94955',
        '52243',
        '2070',
        '30151',
        '94617',
        '17936',
        '27373',
        '17575',
        '60567',
        '17016',
        '62708',
        '26075',
        '20394',
        '13683',
        '75378',
        '89710',
        '7977',
        '14702',
        '42037',
        '38182',
        '98925',
        '81127',
        '32116',
        '66285',
        '4637',
        '31762',
        '81420',
        '7983',
        '70152',
        '44398',
        '49963',
        '53501',
        '20131',
        '6087',
        '91735',
        '80001',
        '17865',
        '71058',
        '78241',
        '15640',
        '32125',
        '31195',
        '45816',
        '93888',
        '30365',
        '27813',
        '70044',
        '27556',
        '47860',
        '83239',
        '20586',
        '10953',
        '4013',
        '46720',
        '63880',
        '33110',
        '19369',
        '10171',
        '85062',
        '38047',
        '25206',
        '6508',
        '55165',
        '20202',
        '99160',
        '42356',
        '31422',
        '40955',
        '14453',
        '16671',
        '2824',
        '22022',
        '10111',
        '10517',
        '95611',
        '43697',
        '68572',
        '71361',
        '58074',
        '98131',
        '20463',
        '27416',
        '13064',
        '15779',
        '12132',
        '4227',
        '37247',
        '94850',
        '10118',
        '89010',
        '80483',
        '91510',
        '32545',
        '98181',
        '48295',
        '18816',
        '48556',
        '18039',
        '99219',
        '68155',
        '92715',
        '36623',
        '92631',
        '99680',
        '44178',
        '10109',
        '98073',
        '75659',
        '29225',
        '2381',
        '41549',
        '22119',
        '20405',
        '28680',
        '87516',
        '6349',
        '31131',
        '31170',
        '15745',
        '25375',
        '33296',
        '4267',
        '29409',
        '26328',
        '38781',
        '94154',
        '30090',
        '55182',
        '62511',
        '29221',
        '20053',
        '91224',
        '99519',
        '36675',
        '7091',
        '75342',
        '89830',
        '59702',
        '5601',
        '62202',
        '49275',
        '20898',
        '28671',
        '80457',
        '54649',
        '62279',
        '83727',
        '85227',
        '26322',
        '87375',
        '16024',
        '38702',
        '77986',
        '86545',
        '55487',
        '64687',
        '46249',
        '42302',
        '49443',
        '12345',
        '30031',
        '88582',
        '24826',
        '40941',
        '13455',
        '79182',
        '26529',
        '1655',
        '78470',
        '27879',
        '19519',
        '21717',
        '20270',
        '32453',
        '50059',
        '90223',
        '18349',
        '94295',
        '50664',
        '31199',
        '85334',
        '38602',
        '32902',
        '84323',
        '27151',
        '44285',
        '4078',
        '97207',
        '92137',
        '11973',
        '55557',
        '80155',
        '13671',
        '36257',
        '17108',
        '25879',
        '78769',
        '74156',
        '76097',
        '92605',
        '10046',
        '88052',
        '4549',
        '39072',
        '62777',
        '50303',
        '14660',
        '40590',
        '37011',
        '25720',
        '45412',
        '89039',
        '78710',
        '28136',
        '59245',
        '21023',
        '31212',
        '33233',
        '2222',
        '5357',
        '62913',
        '12201',
        '93755',
        '37669',
        '79710',
        '10519',
        '8695',
        '10178',
        '15449',
        '12933',
        '13065',
        '11053',
        '95763',
        '46921',
        '45699',
        '21022',
        '77263',
        '11408',
        '84148',
        '13252',
        '4962',
        '49764',
        '24813',
        '35477',
        '72071',
        '87710',
        '76206',
        '33151',
        '44237',
        '47584',
        '25648',
        '78771',
        '29116',
        '85502',
        '47853',
        '3822',
        '90610',
        '25031',
        '63470',
        '45258',
        '85267',
        '29716',
        '15081',
        '18843',
        '79173',
        '59004',
        '10161',
        '68172',
        '10165',
        '91077',
        '27878',
        '94977',
        '6456',
        '39054',
        '48501',
        '93383',
        '57079',
        '12177',
        '26524',
        '97880',
        '43033',
        '40585',
        '25814',
        '37133',
        '23408',
        '25717',
        '86547',
        '87455',
        '91797',
        '44610',
        '4944',
        '4336',
        '48112',
        '4644',
        '87118',
        '15693',
        '59626',
        '7831',
        '24980',
        '47307',
        '29502',
        '19409',
        '49514',
        '43661',
        '97409',
        '54976',
        '57361',
        '28123',
        '26675',
        '15662',
        '15270',
        '88556',
        '35048',
        '22070',
        '19192',
        '26674',
        '12407',
        '821',
        '6858',
        '41502',
        '37244',
        '730',
        '77243',
        '16368',
        '19017',
        '17089',
        '22092',
        '19542',
        '33934',
        '15259',
        '12782',
        '18457',
        '740',
        '741',
        '62435',
        '90101',
        '14233',
        '8877',
        '99675',
        '37824',
        '32543',
        '32276',
        '91951',
        '75392',
        '16257',
        '80995',
        '20139',
        '71162',
        '94284',
        '79175',
        '14649',
        '92263',
        '15678',
        '33320',
        '4361',
        '75285',
        '75097',
        '96745',
        '25718',
        '78299',
        '87185',
        '85261',
        '73197',
        '47962',
        '46242',
        '47739',
        '78296',
        '12214',
        '47986',
        '85320',
        '85752',
        '85654',
        '26713',
        '37950',
        '64197',
        '98185',
        '48440',
        '1242',
        '97736',
        '51444',
        '30195',
        '31914',
        '47573',
        '33329',
        '84165',
        '89402',
        '28256',
        '16619',
        '2196',
        '46381',
        '5633',
        '969',
        '47812',
        '66117',
        '953',
        '44453',
        '74194',
        '2402',
        '61654',
        '28038',
        '50302',
        '30027',
        '77852',
        '94208',
        '36625',
        '83671',
        '55565',
        '29589',
        '75336',
        '1059',
        '47856',
        '17375',
        '77709',
        '25328',
        '47467',
        '33900',
        '7845',
        '85235',
        '78658',
        '94662',
        '85346',
        '13848',
        '26543',
        '22160',
        '18025',
        '43467',
        '14896',
        '29905',
        '50391',
        '56328',
        '54842',
        '59084',
        '99764',
        '60664',
        '76467',
        '28220',
        '67479',
        '98263',
        '53777',
        '93771',
        '94042',
        '15028',
        '26302',
        '605',
        '12055',
        '37056',
        '17767',
        '73035',
        '19028',
        '31498',
        '40586',
        '68374',
        '85038',
        '45389',
        '42377',
        '88244',
        '97256',
        '43735',
        '95067',
        '11460',
        '2345',
        '51340',
        '81033',
        '41310',
        '93582',
        '22245',
        '25636',
        '88034',
        '28297',
        '24203',
        '4659',
        '95899',
        '79166',
        '36177',
        '92643',
        '12260',
        '26765',
        '87064',
        '53290',
        '48333',
        '20848',
        '33568',
        '56302',
        '31502',
        '19375',
        '32868',
        '23018',
        '57198',
        '22078',
        '6150',
        '33732',
        '33280',
        '11244',
        '50032',
        '60665',
        '11583',
        '56396',
        '44679',
        '21546',
        '70782',
        '36504',
        '81215',
        '85076',
        '95011',
        '20214',
        '27285',
        '72545',
        '64184',
        '12232',
        '54182',
        '93403',
        '99251',
        '39077',
        '76268',
        '32126',
        '28224',
        '19731',
        '80151',
        '64179',
        '7999',
        '97313',
        '6155',
        '20413',
        '12555',
        '41433',
        '51502',
        '46048',
        '656',
        '90662',
        '31715',
        '82845',
        '23285',
        '15466',
        '94126',
        '90050',
        '49588',
        '20231',
        '4333',
        '23064',
        '60011',
        '75030',
        '91185',
        '45319',
        '87592',
        '91408',
        '41534',
        '81402',
        '26555',
        '39115',
        '2044',
        '2137',
        '44735',
        '22093',
        '19535',
        '65056',
        '45343',
        '87103',
        '61331',
        '46912',
        '85239',
        '12172',
        '32575',
        '75637',
        '19059',
        '55772',
        '12551',
        '59851',
        '73194',
        '59835',
        '6137',
        '22242',
        '46384',
        '79172',
        '20337',
        '29375',
        '93275',
        '18911',
        '10910',
        '70340',
        '34985',
        '27717',
        '85536',
        '20330',
        '10048',
        '99327',
        '42332',
        '32592',
        '44871',
        '36503',
        '17769',
        '98460',
        '80252',
        '83726',
        '8989',
        '91312',
        '46266',
        '47596',
        '52757',
        '8039',
        '90624',
        '30207',
        '1840',
        '30756',
        '18765',
        '26504',
        '44191',
        '92088',
        '46223',
        '80614',
        '94161',
        '44501',
        '4060',
        '26207',
        '69219',
        '3606',
        '86508',
        '15922',
        '20411',
        '22199',
        '86312',
        '13250',
        '15250',
        '71444',
        '10121',
        '10313',
        '65675',
        '87461',
        '20469',
        '23466',
        '79983',
        '28541',
        '57190',
        '84718',
        '20520',
        '87180',
        '50661',
        '6494',
        '44607',
        '87115',
        '73802',
        '91385',
        '93709',
        '35219',
        '92814',
        '18632',
        '19523',
        '99345',
        '23870',
        '43070',
        '91758',
        '26563',
        '54206',
        '59771',
        '23423',
        '6138',
        '41419',
        '98324',
        '89150',
        '71315',
        '7192',
        '10278',
        '30394',
        '29417',
        '84516',
        '60117',
        '20780',
        '81014',
        '94280',
        '12301',
        '64502',
        '36133',
        '45110',
        '37384',
        '84122',
        '45712',
        '15095',
        '37930',
        '36621',
        '79491',
        '55085',
        '28242',
        '24861',
        '30267',
        '84733',
        '75393',
        '10125',
        '14584',
        '94660',
        '79779',
        '32260',
        '60125',
        '43468',
        '7428',
        '70177',
        '60519',
        '38722',
        '84158',
        '12785',
        '25203',
        '18501',
        '21748',
        '85358',
        '5466',
        '86002',
        '82440',
        '38760',
        '25337',
        '8862',
        '28247',
        '46771',
        '28286',
        '51349',
        '32591',
        '12244',
        '57643',
        '91175',
        '6129',
        '84157',
        '840',
        '8504',
        '85078',
        '70720',
        '23288',
        '27098',
        '36721',
        '71136',
        '98171',
        '47937',
        '26040',
        '80263',
        '21686',
        '29215',
        '44486',
        '26566',
        '23014',
        '98259',
        '98082',
        '40522',
        '20122',
        '63169',
        '36361',
        '2662',
        '72389',
        '90185',
        '94067',
        '76799',
        '72075',
        '52752',
        '95931',
        '30050',
        '25973',
        '10126',
        '31737',
        '33075',
        '75263',
        '12040',
        '66742',
        '78279',
        '91115',
        '18943',
        '24608',
        '56346',
        '20773',
        '43948',
        '42554',
        '28237',
        '22125',
        '37778',
        '91392',
        '20800',
        '15674',
        '1115',
        '34621',
        '82060',
        '14707',
        '70165',
        '91716',
        '18449',
        '95408',
        '59035',
        '94529',
        '45296',
        '23467',
        '33148',
        '26507',
        '28255',
        '38045',
        '17920',
        '55570',
        '44179',
        '15465',
        '19494',
        '5609',
        '33633',
        '85733',
        '960',
        '99228',
        '61106',
        '4104',
        '36906',
        '30348',
        '17939',
        '43408',
        '20098',
        '95497',
        '27321',
        '17069',
        '41550',
        '43789',
        '96925',
        '56380',
        '93217',
        '80732',
        '40320',
        '41333',
        '73144',
        '21866',
        '33888',
        '35897',
        '91021',
        '25726',
        '18050',
        '43349',
        '29622',
        '7194',
        '88529',
        '76246',
        '75903',
        '60122',
        '17534',
        '6147',
        '79383',
        '70502',
        '63702',
        '54306',
        '40289',
        '28331',
        '54975',
        '94258',
        '94540',
        '85553',
        '77287',
        '44701',
        '52409',
        '45859',
        '45004',
        '6497',
        '16532',
        '41451',
        '50393',
        '10650',
        '13364',
        '17355',
        '62909',
        '4053',
        '18762',
        '32406',
        '14742',
        '46946',
        '24035',
        '65898',
        '87935',
        '32716',
        '94278',
        '46660',
        '11571',
        '78298',
        '32633',
        '14749',
        '29124',
        '29721',
        '94155',
        '22019',
        '92340',
        '10155',
        '36622',
        '84024',
        '89163',
        '58039',
        '48265',
        '24544',
        '2266',
        '32537',
        '34680',
        '30355',
        '94808',
        '33655',
        '12230',
        '29933',
        '28522',
        '33941',
        '92167',
        '93922',
        '7510',
        '90733',
        '93915',
        '70765',
        '13615',
        '8645',
        '19725',
        '70598',
        '52252',
        '70050',
        '27293',
        '80243',
        '7839',
        '81150',
        '70376',
        '88523',
        '94012',
        '87543',
        '40110',
        '24846',
        '44828',
        '31998',
        '20418',
        '88441',
        '32447',
        '45273',
        '48153',
        '32085',
        '42070',
        '80454',
        '78667',
        '57778',
        '41105',
        '20265',
        '31785',
        '71021',
        '49843',
        '23274',
        '20254',
        '80944',
        '18980',
        '21641',
        '19557',
        '23242',
        '99346',
        '83465',
        '71240',
        '72119',
        '60690',
        '92667',
        '26436',
        '33864',
        '735',
        '20211',
        '85725',
        '25965',
        '15422',
        '33421',
        '18413',
        '782',
        '50218',
        '99928',
        '72766',
        '31770',
        '23480',
        '11055',
        '53789',
        '49084',
        '39215',
        '81429',
        '64142',
        '25334',
        '88559',
        '41181',
        '21280',
        '32739',
        '11446',
        '6079',
        '87824',
        '17759',
        '25620',
        '85923',
        '33524',
        '4482',
        '63365',
        '28302',
        '65645',
        '88051',
        '32721',
        '41641',
        '94277',
        '92714',
        '97339',
        '18012',
        '40550',
        '28074',
        '55170',
        '31993',
        '25691',
        '59863',
        '24005',
        '79002',
        '40319',
        '98450',
        '92899',
        '83874',
        '13020',
        '24811',
        '4918',
        '79709',
        '79786',
        '19185',
        '94620',
        '27636',
        '81075',
        '78523',
        '88033',
        '89170',
        '68848',
        '55150',
        '20789',
        '42364',
        '63824',
        '84034',
        '44636',
        '55460',
        '93502',
        '27920',
        '15088',
        '84784',
        '89599',
        '91359',
        '22065',
        '8099',
        '50432',
        '40164',
        '50347',
        '927',
        '45617',
        '72221',
        '32362',
        '60671',
        '44860',
        '93778',
        '46502',
        '85072',
        '41520',
        '48303',
        '13794',
        '29610',
        '958',
        '23266',
        '55579',
        '66686',
        '29331',
        '87196',
        '38763',
        '45674',
        '83002',
        '99359',
        '17703',
        '44005',
        '16048',
        '35280',
        '6077',
        '46103',
        '10257',
        '89022',
        '83653',
        '17726',
        '19093',
        '14592',
        '22243',
        '98481',
        '40473',
        '25846',
        '74189',
        '19712',
        '62415',
        '95150',
        '98817',
        '610',
        '24113',
        '63853',
        '74559',
        '25562',
        '25911',
        '23108',
        '56687',
        '30211',
        '13763',
        '56682',
        '35253',
        '17743',
        '33255',
        '35291',
        '21687',
        '85941',
        '47392',
        '57041',
        '78297',
        '35699',
        '6176',
        '42284',
        '85554',
        '97308',
        '28145',
        '47916',
        '60674',
        '31190',
        '34274',
        '33687',
        '53794',
        '80292',
        '11447',
        '20533',
        '80912',
        '15281',
        '10211',
        '40620',
        '20213',
        '74121',
        '80322',
        '80259',
        '40404',
        '45073',
        '99706',
        '81645',
        '37927',
        '43301',
        '57191',
        '70837',
        '15379',
        '2663',
        '4686',
        '93556',
        '88028',
        '22336',
        '79186',
        '72208',
        '92334',
        '7311',
        '20201',
        '3850',
        '88544',
        '1094',
        '54458',
        '3604',
        '63151',
        '20447',
        '16155',
        '32965',
        '30227',
        '20595',
        '46895',
        '85098',
        '94229',
        '92822',
        '30020',
        '70046',
        '98322',
        '33269',
        '22581',
        '12452',
        '93120',
        '87347',
        '14651',
        '71363',
        '1433',
        '21274',
        '88561',
        '18242',
        '744',
        '47734',
        '8756',
        '24515',
        '1705',
        '58123',
        '80943',
        '32509',
        '23443',
        '93716',
        '76241',
        '69031',
        '24476',
        '33355',
        '44316',
        '43828',
        '29041',
        '75027',
        '95319',
        '83260',
        '17507',
        '49959',
        '12243',
        '78049',
        '58489',
        '80270',
        '28296',
        '97872',
        '18420',
        '34646',
        '91609',
        '99635',
        '72733',
        '17342',
        '59933',
        '80806',
        '98060',
        '80476',
        '96160',
        '717',
        '21653',
        '13162',
        '91023',
        '15004',
        '22141',
        '56140',
        '29122',
        '85652',
        '37249',
        '2153',
        '93911',
        '44422',
        '25112',
        '47935',
        '15934',
        '58705',
        '6454',
        '79452',
        '98150',
        '70787',
        '75346',
        '2534',
        '15733',
        '40575',
        '29606',
        '616',
        '75456',
        '82902',
        '79940',
        '28353',
        '93387',
        '94966',
        '75357',
        '28519',
        '10149',
        '46789',
        '44232',
        '983',
        '92170',
        '33497',
        '88526',
        '19193',
        '98015',
        '15439',
        '57773',
        '59348',
        '10107',
        '29305',
        '8834',
        '99302',
        '2203',
        '28691',
        '45132',
        '73575',
        '14264',
        '92244',
        '95840',
        '24739',
        '24883',
        '55365',
        '65107',
        '32576',
        '961',
        '79990',
        '67236',
        '19894',
        '84027',
        '42502',
        '29106',
        '40027',
        '32718',
        '25057',
        '51554',
        '4234',
        '5059',
        '37893',
        '47706',
        '78773',
        '92554',
        '56460',
        '88905',
        '79767',
        '63188',
        '25644',
        '68509',
        '23241',
        '57364',
        '21764',
        '2154',
        '72728',
        '20199',
        '29844',
        '13834',
        '17337',
        '14056',
        '96828',
        '84189',
        '50041',
        '57653',
        '56397',
        '25546',
        '22106',
        '92713',
        '84201',
        '78288',
        '23232',
        '33885',
        '17077',
        '64160',
        '20091',
        '24543',
        '12420',
        '96751',
        '24028',
        '15631',
        '94059',
        '46247',
        '13628',
        '94820',
        '62756',
        '6928',
        '45145',
        '46959',
        '6265',
        '94649',
        '49711',
        '81157',
        '57757',
        '50395',
        '85068',
        '51574',
        '93760',
        '44193',
        '96924',
        '43961',
        '83280',
        '29587',
        '79338',
        '97460',
        '46943',
        '73164',
        '45354',
        '25305',
        '68529',
        '23105',
        '6376',
        '10096',
        '85360',
        '10174',
        '64864',
        '62686',
        '27867',
        '20206',
        '10157',
        '21283',
        '11424',
        '42203',
        '65572',
        '78603',
        '17822',
        '19895',
        '72385',
        '45408',
        '1885',
        '47280',
        '47490',
        '85246',
        '80475',
        '32855',
        '57542',
        '24004',
        '8250',
        '19899',
        '30261',
        '6430',
        '99803',
        '43270',
        '95297',
        '98132',
        '19421',
        '34647',
        '33731',
        '19516',
        '22082',
        '80034',
        '22507',
        '2355',
        '94120',
        '79950',
        '98280',
        '84774',
        '80308',
        '1347',
        '59108',
        '32802',
        '25105',
        '99127',
        '35485',
        '88262',
        '19088',
        '50336',
        '46401',
        '60650',
        '99220',
        '39107',
        '93642',
        '775',
        '27552',
        '82646',
        '38749',
        '12181',
        '78291',
        '4975',
        '18341',
        '22523',
        '98673',
        '66450',
        '98554',
        '18928',
        '96847',
        '14263',
        '25867',
        '94144',
        '30061',
        '64199',
        '20594',
        '47435',
        '33074',
        '85061',
        '47464',
        '36131',
        '7939',
        '20261',
        '23403',
        '33802',
        '58644',
        '12927',
        '40048',
        '59217',
        '83223',
        '90845',
        '18766',
        '62464',
        '38223',
        '26520',
        '97372',
        '18813',
        '32302',
        '87723',
        '54010',
        '23694',
        '60017',
        '22626',
        '51344',
        '75303',
        '4612',
        '31156',
        '31604',
        '60199',
        '14133',
        '49611',
        '928',
        '25667',
        '62662',
        '43325',
        '4656',
        '54931',
        '20224',
        '754',
        '20704',
        '46283',
        '36253',
        '23218',
        '20393',
        '70175',
        '33468',
        '71840',
        '48605',
        '15476',
        '16633',
        '24156',
        '92664',
        '36462',
        '98228',
        '68056',
        '40296',
        '4291',
        '79116',
        '50940',
        '11256',
        '40618',
        '53808',
        '5849',
        '72397',
        '53927',
        '10090',
        '85080',
        '28076',
        '57044',
        '55597',
        '43523',
        '70827',
        '81221',
        '89803',
        '38723',
        '43010',
        '47876',
        '45277',
        '10558',
        '17270',
        '18175',
        '12574',
        '75443',
        '39109',
        '62971',
        '18454',
        '44439',
        '54662',
        '98556',
        '80947',
        '85931',
        '54308',
        '43116',
        '15723',
        '89199',
        '93613',
        '25362',
        '70157',
        '35240',
        '95609',
        '35011',
        '58109',
        '2331',
        '25147',
        '94643',
        '83531',
        '40930',
        '91353',
        '81026',
        '11962',
        '31145',
        '2361',
        '90054',
        '96089',
        '92709',
        '54207',
        '33303',
        '71207',
        '61791',
        '80623',
        '53047',
        '35282',
        '11536',
        '46961',
        '21139',
        '83731',
        '53571',
        '71066',
        '6536',
        '45633',
        '29683',
        '24126',
        '22332',
        '20056',
        '30131',
        '17266',
        '48410',
        '27873',
        '30162',
        '60082',
        '12490',
        '10702',
        '62766',
        '22570',
        '65546',
        '20340',
        '20215',
        '77838',
        '41762',
        '56502',
        '43251',
        '90313',
        '35281',
        '57346',
        '29903',
        '22442',
        '71249',
        '50592',
        '20460',
        '13225',
        '65899',
        '65103',
        '84530',
        '31534',
        '17249',
        '90832',
        '94164',
        '4063',
        '68181',
        '20427',
        '99524',
        '20306',
        '25120',
        '31736',
        '97258',
        '98540',
        '91363',
        '96820',
        '93539',
        '53194',
        '81002',
        '49723',
        '21890',
        '10156',
        '44711',
        '6146',
        '16531',
        '98527',
        '32627',
        '36640',
        '19437',
        '20899',
        '47407',
        '92164',
        '33682',
        '77202',
        '79189',
        '84068',
        '78360',
        '37364',
        '687',
        '43286',
        '13121',
        '18098',
        '72317',
        '19105',
        '36419',
        '55582',
        '24902',
        '95042',
        '96928',
        '20104',
        '46935',
        '98413',
        '55083',
        '96835',
        '84125',
        '78786',
        '49915',
        '72078',
        '6852',
        '15691',
        '83354',
        '39522',
        '50359',
        '22122',
        '85026',
        '30392',
        '84637',
        '43260',
        '22016',
        '55905',
        '7007',
        '32772',
        '21101',
        '71284',
        '16039',
        '94167',
        '15366',
        '21681',
        '27930',
        '89114',
        '22135',
        '1102',
        '57462',
        '36134',
        '88514',
        '26360',
        '72178',
        '28241',
        '37499',
        '16565',
        '80271',
        '21857',
        '25163',
        '72145',
        '62329',
        '94206',
        '2031',
        '7844',
        '92799',
        '44393',
        '5303',
        '33871',
        '59604',
        '39190',
        '44513',
        '24411',
        '47808',
        '63150',
        '20398',
        '27435',
        '79976',
        '22244',
        '71154',
        '21902',
        '7098',
        '80901',
        '31751',
        '87509',
        '14508',
        '60599',
        '85369',
        '91617',
        '96836',
        '68068',
        '35894',
        '94271',
        '12530',
        '92022',
        '27848',
        '20502',
        '95024',
        '90632',
        '10087',
        '38048',
        '89023',
        '70140',
        '88570',
        '81656',
        '69365',
        '6901',
        '36132',
        '24897',
        '12506',
        '71166',
        '25714',
        '91187',
        '48387',
        '59746',
        '8411',
        '34665',
        '5050',
        '23280',
        '32602',
        '75277',
        '20419',
        '78604',
        '23101',
        '20074',
        '78714',
        '21289',
        '83218',
        '6510',
        '3435',
        '90072',
        '2105',
        '80826',
        '92172',
        '20508',
        '72516',
        '29641',
        '20108',
        '94405',
        '70511',
        '39122',
        '33083',
        '48332',
        '80934',
        '77516',
        '13419',
        '27117',
        '93390',
        '42444',
        '716',
        '10015',
        '44750',
        '27375',
        '17210',
        '12063',
        '54324',
        '64187',
        '58121',
        '84633',
        '21041',
        '94239',
        '19173',
        '41096',
        '93584',
        '10269',
        '71748',
        '79961',
        '1093',
        '98941',
        '48046',
        '94701',
        '78847',
        '27936',
        '71149',
        '79402',
        '44250',
        '733',
        '99802',
        '64193',
        '37868',
        '55791',
        '26349',
        '14778',
        '22334',
        '61612',
        '12246',
        '20585',
        '20421',
        '39302',
        '1613',
        '76546',
        '83205',
        '95196',
        '45298',
        '19496',
        '16370',
        '24924',
        '8025',
        '55558',
        '92674',
        '72465',
        '31718',
        '32662',
        '34642',
        '80329',
        '10259',
        '32158',
        '15231',
        '90082',
        '66675',
        '16369',
        '98350',
        '31999',
        '43652',
        '97291',
        '57354',
        '31767',
        '32706',
        '55484',
        '98352',
        '66051',
        '48255',
        '73087',
        '24855',
        '7829',
        '27413',
        '50013',
        '15532',
        '27602',
        '20039',
        '91110',
        '43928',
        '71210',
        '33680',
        '54933',
        '98509',
        '15430',
        '92718',
        '14444',
        '46302',
        '61655',
        '28233',
        '8868',
        '56395',
        '77216',
        '87197',
        '60536',
        '90842',
        '71212',
        '2147',
        '40280',
        '3231',
        '62746',
        '90076',
        '96799',
        '50037',
        '41313',
        '47924',
        '42257',
        '15673',
        '36204',
        '33195',
        '61558',
        '32971',
        '43553',
        '74477',
        '46897',
        '20790',
        '79608',
        '29402',
        '91396',
        '50340',
        '48311',
        '22219',
        '85349',
        '6102',
        '15421',
        '22905',
        '50012',
        '19360',
        '46411',
        '25723',
        '73847',
        '20212',
        '13758',
        '48279',
        '39442',
        '91327',
        '64170',
        '2055',
        '74335',
        '3756',
        '39269',
        '32035',
        '55745',
        '16236',
        '22622',
        '75353',
        '98054',
        '36630',
        '89006',
        '40932',
        '7842',
        '27157',
        '71148',
        '35449',
        '16016',
        '81646',
        '34133',
        '11248',
        '33097',
        '31034',
        '17605',
        '85702',
        '22123',
        '55559',
        '38649',
        '1441',
        '92402',
        '98353',
        '77236',
        '17567',
        '12995',
        '45299',
        '16220',
        '63195',
        '24143',
        '97482',
        '22953',
        '22156',
        '16261',
        '53088',
        '33595',
        '47146',
        '57639',
        '18654',
        '14854',
        '30272',
        '27109',
        '84763',
        '57118',
        '12179',
        '52308',
        '766',
        '38173',
        '97283',
        '63881',
        '66626',
        '60251',
        '6030',
        '24063',
        '718',
        '36429',
        '90070',
        '25440',
        '56056',
        '27111',
        '93044',
        '57244',
        '79986',
        '95170',
        '85271',
        '43041',
        '45361',
        '37235',
        '97604',
        '94626',
        '90408',
        '52642',
        '76796',
        '1703',
        '20336',
        '94913',
        '25185',
        '6156',
        '24958',
        '20885',
        '88575',
        '48863',
        '57189',
        '15264',
        '96827',
        '7216',
        '26106',
        '82833',
        '99510',
        '64802',
        '13649',
        '4935',
        '67670',
        '38869',
        '38935',
        '88565',
        '20262',
        '772',
        '28253',
        '46209',
        '67856',
        '86017',
        '70781',
        '56246',
        '45033',
        '4565',
        '91503',
        '34656',
        '48686',
        '20178',
        '37349',
        '28335',
        '59903',
        '73156',
        '55029',
        '22331',
        '94570',
        '89713',
        '8095',
        '19517',
        '71359',
        '613',
        '85930',
        '19255',
        '98471',
        '15689',
        '38071',
        '40032',
        '20507',
        '75371',
        '99255',
        '53817',
        '55392',
        '87187',
        '70187',
        '33526',
        '25061',
        '54985',
        '43519',
        '94071',
        '93382',
        '44329',
        '63646',
        '21297',
        '31414',
        '22333',
        '34630',
        '71025',
        '22047',
        '62328',
        '64190',
        '32345',
        '25706',
        '41081',
        '23054',
        '94083',
        '55036',
        '85927',
        '50145',
        '29656',
        '4057',
        '56030',
        '68009',
        '24612',
        '39217',
        '60678',
        '19381',
        '91041',
        '29899',
        '99151',
        '20536',
        '41517',
        '25847',
        '53783',
        '2146',
        '19179',
        '32454',
        '84736',
        '19732',
        '62222',
        '18046',
        '28903',
        '26559',
        '75301',
        '38874',
        '96802',
        '20857',
        '96850',
        '54472',
        '60920',
        '86511',
        '46146',
        '25010',
        '40058',
        '94627',
        '23939',
        '98904',
        '44652',
        '20787',
        '44801',
        '94807',
        '931',
        '64999',
        '71475',
        '61402',
        '20752',
        '93002',
        '45328',
        '46958',
        '19980',
        '6876',
        '18225',
        '55567',
        '3749',
        '55560',
        '15606',
        '23401',
        '20389',
        '64665',
        '19483',
        '7207',
        '10982',
        '54415',
        '56335',
        '11022',
        '24729',
        '30503',
        '93792',
        '70371',
        '49289',
        '42755',
        '89411',
        '42631',
        '90310',
        '29914',
        '73155',
        '2269',
        '85272',
        '34106',
        '2172',
        '50526',
        '24026',
        '35289',
        '43336',
        '22430',
        '14556',
        '1471',
        '92190',
        '31191',
        '10199',
        '59842',
        '1812',
        '20907',
        '15443',
        '20218',
        '33101',
        '46796',
        '683',
        '85644',
        '81034',
        '45112',
        '68403',
        '68544',
        '37065',
        '19370',
        '34682',
        '36536',
        '42440',
        '42046',
        '22227',
        '40579',
        '17332',
        '23186',
        '60038',
        '46566',
        '56002',
        '51655',
        '21670',
        '79167',
        '71163',
        '54131',
        '28169',
        '19715',
        '6856',
        '99214',
        '20050',
        '15036',
        '92192',
        '12325',
        '26502',
        '63746',
        '8246',
        '34624',
        '20501',
        '26639',
        '59918',
        '33116',
        '93061',
        '80511',
        '20431',
        '65659',
        '37237',
        '54645',
        '46207',
        '42152',
        '66638',
        '56092',
        '24412',
        '39533',
        '1438',
        '30722',
        '93380',
        '93237',
        '43842',
        '11599',
        '20395',
        '32241',
        '22111',
        '89802',
        '97859',
        '70162',
        '99548',
        '87040',
        '32923',
        '43307',
        '60196',
        '34478',
        '72115',
        '30086',
        '80166',
        '28350',
        '48308',
        '22526',
        '6726',
        '21503',
        '20717',
        '53096',
        '26407',
        '52350',
        '46275',
        '22036',
        '78674',
        '56053',
        '95157',
        '23501',
        '18637',
        '39404',
        '30599',
        '41426',
        '28101',
        '24407',
        '28201',
        '30447',
        '46154',
        '21281',
        '4662',
        '40593',
        '84326',
        '29551',
        '93629',
        '4744',
        '80950',
        '70704',
        '10625',
        '84515',
        '1853',
        '53270',
        '29703',
        '58502',
        '14529',
        '18440',
        '46361',
        '32791',
        '93016',
        '93759',
        '56317',
        '70381',
        '31319',
        '17608',
        '20156',
        '21765',
        '21105',
        '49786',
        '70073',
        '43655',
        '83326',
        '75295',
        '53176',
        '2166',
        '12976',
        '16835',
        '20216',
        '40524',
        '79188',
        '32860',
        '96162',
        '33601',
        '81129',
        '16945',
        '21820',
        '44712',
        '11243',
        '41477',
        '82420',
        '5030',
        '88566',
        '20753',
        '99687',
        '22081',
        '43236',
        '13902',
        '54702',
        '98140',
        '47727',
        '40583',
        '42457',
        '13139',
        '15561',
        '38776',
        '73193',
        '15548',
        '95976',
        '8896',
        '98061',
        '47801',
        '84527',
        '13840',
        '95153',
        '46903',
        '52631',
        '85754',
        '7875',
        '99693',
        '98062',
        '34423',
        '20420',
        '28151',
        '1116',
        '25771',
        '40221',
        '93712',
        '950',
        '50177',
        '39205',
        '24816',
        '86520',
        '2637',
        '20101',
        '16215',
        '33695',
        '96898',
        '17056',
        '8252',
        '25646',
        '6045',
        '74461',
        '80638',
        '94650',
        '614',
        '63342',
        '22116',
        '84171',
        '94091',
        '23884',
        '31146',
        '28664',
        '30209',
        '15415',
        '52410',
        '12471',
        '95851',
        '43654',
        '49722',
        '83128',
        '22176',
        '16475',
        '66555',
        '45158',
        '96714',
        '41778',
        '45809',
        '99213',
        '49039',
        '75387',
        '22234',
        '39181',
        '14461',
        '10072',
        '56393',
        '60095',
        '21241',
        '21264',
        '70182',
        '45630',
        '52758',
        '28260',
        '94274',
        '11406',
        '29861',
        '24581',
        '95518',
        '80314',
        '30262',
        '99644',
        '29633',
        '617',
        '20035',
        '72105',
        '91734',
        '13321',
        '31745',
        '80261',
        '57358',
        '98025',
        '6501',
        '15285',
        '38159',
        '71431',
        '6703',
        '8064',
        '6153',
        '20049',
        '34430',
        '4608',
        '47865',
        '44617',
        '30150',
        '16512',
        '20573',
        '86003',
        '47958',
        '31769',
        '33239',
        '13465',
        '80434',
        '22035',
        '20560',
        '60669',
        '2337',
        '40257',
        '87574',
        '60078',
        '33737',
        '2573',
        '75091',
        '72225',
        '25018',
        '13261',
        '76197',
        '72352',
        '757',
        '48826',
        '33862',
        '62763',
        '33041',
        '88263',
        '16629',
        '43322',
        '87554',
        '6875',
        '20163',
        '23154',
        '85063',
        '25432',
        '1517',
        '75483',
        '96849',
        '40266',
        '43984',
        '48113',
        '25711',
        '91615',
        '18212',
        '46067',
        '70082',
        '47104',
        '29476',
        '59547',
        '20029',
        '21664',
        '22906',
        '17533',
        '76352',
        '1936',
        '3274',
        '4615',
        '80977',
        '25423',
        '14783',
        '32834',
        '27835',
        '6131',
        '91413',
        '29939',
        '88519',
        '22544',
        '20750',
        '14443',
        '963',
        '90659',
        '86029',
        '6520',
        '12929',
        '91118',
        '20775',
        '59716',
        '49077',
        '851',
        '47463',
        '34770',
        '43335',
        '736',
        '79222',
        '4343',
        '22226',
        '12161',
        '33883',
        '6829',
        '72159',
        '13115',
        '70145',
        '29816',
        '4007',
        '28254',
        '20726',
        '82635',
        '74193',
        '98348',
        '46786',
        '19318',
        '33925',
        '93388',
        '98164',
        '2334',
        '44598',
        '91979',
        '22746',
        '52767',
        '17868',
        '50593',
        '48244',
        '93649',
        '12584',
        '6490',
        '34146',
        '40310',
        '94150',
        '30323',
        '21052',
        '64447',
        '22528',
        '34282',
        '44210',
        '80321',
        '99821',
        '20251',
        '22549',
        '47107',
        '36762',
        '53709',
        '46915',
        '60183',
        '8404',
        '33011',
        '37314',
        '75267',
        '22096',
        '46984',
        '28299',
        '14752',
        '35144',
        '1199',
        '23407',
        '45739',
        '95106',
        '2854',
        '21080',
        '13749',
        '20661',
        '45336',
        '39062',
        '4759',
        '75015',
        '19538',
        '92564',
        '13130',
        '80471',
        '78781',
        '21920',
        '14925',
        '44825',
        '61206',
        '32056',
        '93740',
        '23412',
        '30424',
        '94407',
        '40309',
        '76576',
        '19191',
        '98821',
        '41747',
        '29143',
        '19735',
        '39130',
        '44309',
        '45367',
        '43717',
        '14547',
        '78478',
        '4230',
        '32756',
        '15727',
        '48272',
        '40580',
        '32588',
        '11932',
        '99165',
        '21094',
        '48061',
        '99211',
        '66201',
        '19708',
        '55590',
        '57578',
        '67256',
        '49027',
        '98013',
        '14430',
        '36349',
        '70146',
        '97641',
        '36614',
        '15286',
        '54818',
        '53595',
        '74747',
        '32314',
        '56376',
        '64766',
        '91899',
        '53708',
        '97238',
        '20591',
        '80294',
        '43914',
        '33740',
        '43722',
        '25022',
        '6134',
        '72402',
        '98276',
        '3108',
        '21684',
        '43736',
        '23551',
        '20553',
        '33257',
        '90267',
        '12874',
        '18950',
        '12781',
        '96932',
        '42061',
        '46377',
        '46144',
        '32941',
        '954',
        '30539',
        '46399',
        '43142',
        '57545',
        '99716',
        '20572',
        '15244',
        '39282',
        '26383',
        '11380',
        '16631',
        '6505',
        '21792',
        '32240',
        '12475',
        '15484',
        '15266',
        '92286',
        '92516',
        '45012',
        '79952',
        '11531',
        '73180',
        '60353',
        '92092',
        '20510',
        '81141',
        '27833',
        '47021',
        '79516',
        '29202',
        '38765',
        '80533',
        '91756',
        '38054',
        '94156',
        '2641',
        '84605',
        '37842',
        '27506',
        '6128',
        '20434',
        '96733',
        '20468',
        '43086',
        '97331',
        '66658',
        '87060',
        '25637',
        '76547',
        '27113',
        '14272',
        '23162',
        '95137',
        '22158',
        '68738',
        '54232',
        '99258',
        '80254',
        '85327',
        '27202',
        '8903',
        '32461',
        '90097',
        '68382',
        '28324',
        '95759',
        '50367',
        '55595',
        '28699',
        '16546',
        '77431',
        '2157',
        '93121',
        '6025',
        '85731',
        '27114',
        '32341',
        '74440',
        '36778',
        '15091',
        '30612',
        '28218',
        '86504',
        '96846',
        '60197',
        '20525',
        '20612',
        '73178',
        '40621',
        '93661',
        '47133',
        '57636',
        '7538',
        '17942',
        '47439',
        '4081',
        '27213',
        '66113',
        '13784',
        '62524',
        '13859',
        '28446',
        '93790',
        '10175',
        '83756',
        '83281',
        '15737',
        '48670',
        '11386',
        '11569',
        '31708',
        '84744',
        '71320',
        '44049',
        '45330',
        '47420',
        '76883',
        '43414',
        '84662',
        '15549',
        '35161',
        '48243',
        '13341',
        '72124',
        '3802',
        '14638',
        '50950',
        '26058',
        '4283',
        '91944',
        '831',
        '51059',
        '33804',
        '21543',
        '11551',
        '95538',
        '84771',
        '35298',
        '98114',
        '50402',
        '42142',
        '53148',
        '6115',
        '46799',
        '98522',
        '32229',
        '11351',
        '94659',
        '67275',
        '25365',
        '74004',
        '75564',
        '55572',
        '20825',
        '22945',
        '16375',
        '89111',
        '98920',
        '32237',
        '21285',
        '30366',
        '95101',
        '63164',
        '34206',
        '13154',
        '91772',
        '93031',
        '45413',
        '11252',
        '81153',
        '52805',
        '35278',
        '55942',
        '47388',
        '15261',
        '25628',
        '48343',
        '63145',
        '53535',
        '59117',
        '47247',
        '45683',
        '55459',
        '77985',
        '85311',
        '8666',
        '44659',
        '96053',
        '82934',
        '26534',
        '30074',
        '12238',
        '52075',
        '89428',
        '47654',
        '15265',
        '95342',
        '95055',
        '93232',
        '37116',
        '17126',
        '11594',
        '19452',
        '26306',
        '82412',
        '6180',
        '41639',
        '55384',
        '93775',
        '55569',
        '88031',
        '14538',
        '97407',
        '25095',
        '32654',
        '978',
        '10131',
        '71102',
        '88569',
        '35964',
        '80040',
        '53016',
        '59054',
        '4903',
        '25441',
        '28289',
        '94802',
        '18068',
        '28280',
        '82071',
        '20026',
        '25358',
        '12247',
        '92326',
        '59081',
        '59115',
        '75386',
        '32964',
        '17083',
        '20503',
        '33679',
        '53935',
        '76855',
        '94253',
        '77844',
        '43757',
        '1808',
        '12255',
        '30812',
        '25327',
        '92517',
        '58014',
        '93747',
        '72295',
        '92644',
        '36261',
        '15831',
        '50467',
        '19420',
        '90096',
        '66433',
        '86427',
        '72711',
        '14442',
        '32869',
        '27661',
        '59713',
        '40803',
        '28793',
        '20250',
        '25871',
        '38639',
        '81126',
        '85278',
        '44850',
        '45454',
        '21504',
        '46620',
        '66647',
        '5159',
        '71165',
        '31139',
        '19347',
        '32512',
        '70826',
        '55766',
        '31150',
        '85211',
        '48115',
        '84079',
        '16554',
        '90749',
        '98256',
        '98943',
        '46230',
        '79966',
        '80551',
        '43702',
        '32004',
        '53957',
        '96804',
        '36191',
        '80546',
        '60351',
        '60668',
        '24061',
        '47039',
        '23270',
        '64869',
        '49510',
        '10268',
        '58507',
        '94406',
        '70352',
        '22989',
        '84147',
        '67858',
        '86340',
        '89515',
        '22069',
        '32315',
        '55589',
        '97359',
        '45155',
        '43951',
        '83728',
        '44815',
        '8042',
        '8212',
        '80264',
        '33826',
        '34988',
        '54857',
        '63155',
        '17310',
        '40506',
        '95402',
        '46778',
        '28039',
        '52647',
        '4423',
        '19170',
        '32215',
        '52701',
        '10162',
        '2297',
        '20741',
        '83311',
        '28619',
        '55978',
        '50331',
        '30505',
        '24842',
        '3041',
        '6673',
        '90612',
        '85376',
        '72314',
        '48787',
        '89160',
        '53969',
        '49739',
        '71211',
        '65540',
        '70149',
        '20534',
        '65106',
        '71942',
        '50552',
        '59104',
        '24513',
        '10275',
        '20916',
        '30221',
        '98477',
        '98558',
        '23273',
        '43306',
        '19099',
        '46862',
        '52131',
        '23191',
        '680',
        '14585',
        '4338',
        '36125',
        '25317',
        '6251',
        '35813',
        '70896',
        '75865',
        '76303',
        '22109',
        '62247',
        '6817',
        '22068',
        '27706',
        '61059',
        '30264',
        '60967',
        '15276',
        '57647',
        '16684',
        '33951',
        '80819',
        '29493',
        '603',
        '36072',
        '10932',
        '32030',
        '61324',
        '57061',
        '55146',
        '13747',
        '23414',
        '49280',
        '80632',
        '44599',
        '98614',
        '27130',
        '14766',
        '22313',
        '29465',
        '39771',
        '15279',
        '35297',
        '40294',
        '8023',
        '38165',
        '25572',
        '46379',
        '69160',
        '70835',
        '94136',
        '32862',
        '41037',
        '27702',
        '27627',
        '981',
        '53702',
        '22223',
        '1866',
        '31192',
        '92710',
        '18815',
        '98124',
        '8570',
        '10242',
        '45621',
        '12082',
        '97036',
        '39901',
        '12872',
        '33961',
        '33970',
        '33663',
        '60681',
        '79942',
        '16534',
        '41443',
        '95109',
        '95221',
        '56631',
        '68602',
        '42463',
        '47535',
        '93093',
        '42735',
        '40255',
        '42780',
        '27722',
        '17001',
        '47936',
        '89315',
        '79232',
        '30243',
        '80310',
        '29931',
        '33939',
        '61630',
        '30245',
        '70429',
        '61641',
        '47736',
        '15038',
        '46537',
        '29604',
        '29079',
        '12248',
        '10540',
        '91798',
        '21862',
        '94152',
        '94915',
        '97259',
        '78275',
        '95617',
        '13651',
        '20153',
        '49673',
        '81332',
        '17231',
        '28502',
        '58432',
        '25339',
        '70522',
        '95213',
        '87317',
        '53127',
        '39441',
        '25653',
        '93399',
        '40754',
        '27156',
        '18060',
        '13093',
        '27634',
        '83719',
        '16328',
        '59319',
        '91357',
        '81011',
        '32612',
        '92232',
        '49278',
        '50657',
        '15638',
        '12565',
        '20526',
        '44697',
        '79954',
        '37383',
        '59934',
        '63153',
        '32856',
        '32783',
        '24719',
        '29675',
        '94953',
        '2558',
        '1090',
        '55440',
        '1865',
        '61709',
        '88539',
        '28744',
        '94139',
        '80042',
        '87192',
        '14722',
        '36760',
        '93456',
        '49918',
        '59740',
        '61651',
        '81329',
        '63902',
        '47934',
        '78268',
        '7474',
        '59919',
        '76299',
        '46014',
        '30208',
        '58126',
        '76130',
        '21018',
        '38772',
        '87577',
        '19367',
        '19089',
        '34636',
        '25110',
        '75599',
        '2636',
        '85240',
        '89024',
        '16366',
        '55479',
        '95924',
        '56658',
        '20891',
        '20317',
        '89185',
        '2167',
        '15764',
        '23190',
        '94557',
        '44242',
        '19455',
        '28089',
        '92046',
        '15189',
        '37625',
        '84602',
        '27359',
        '16514',
        '20067',
        '83415',
        '44265',
        '66961',
        '77228',
        '91309',
        '15962',
        '60063',
        '17121',
        '27841',
        '86437',
        '30335',
        '13113',
        '41622',
        '791',
        '49115',
        '59921',
        '92635',
        '36135',
        '48853',
        '765',
        '24512',
        '92717',
        '88563',
        '23822',
        '78472',
        '75264',
        '32203',
        '33673',
        '70822',
        '98050',
        '27628',
        '36140',
        '51330',
        '99836',
        '60158',
        '35263',
        '14863',
        '92222',
        '15847',
        '94243',
        '28077',
        '34272',
        '84510',
        '94543',
        '4865',
        '90087',
        '28410',
        '45782',
        '61555',
        '60113',
        '2165',
        '33045',
        '4431',
        '41019',
        '20240',
        '20078',
        '35767',
        '56064',
        '15413',
        '97432',
        '19366',
        '99779',
        '94101',
        '56006',
        '28380',
        '87500',
        '32198',
        '968',
        '17235',
        '33082',
        '73648',
        '36690',
        '46063',
        '78762',
        '71137',
        '31776',
        '3751',
        '2241',
        '30381',
        '16624',
        '33348',
        '93483',
        '12820',
        '14756',
        '37041',
        '84513',
        '92615',
        '75413',
        '15123',
        '15096',
        '53109',
        '84059',
        '45026',
        '79977',
        '11556',
        '59107',
        '71443',
        '1784',
        '34267',
        '99608',
        '6913',
        '16911',
        '95604',
        '33975',
        '82926',
        '94230',
        '88062',
        '88102',
        '53802',
        '56325',
        '42283',
        '17088',
        '57708',
        '88525',
        '94279',
        '28325',
        '43941',
        '55816',
        '11390',
        '90078',
        '78461',
        '39172',
        '89177',
        '15272',
        '41347',
        '21265',
        '31746',
        '6142',
        '96155',
        '85269',
        '71910',
        '15350',
        '25090',
        '14488',
        '27152',
        '79712',
        '61233',
        '41569',
        '18918',
        '17885',
        '55458',
        '79953',
        '70469',
        '26462',
        '13678',
        '39271',
        '921',
        '2761',
        '18769',
        '10167',
        '61825',
        '33730',
        '75915',
        '93412',
        '63065',
        '5665',
        '33350',
        '50392',
        '35236',
        '26463',
        '33994',
        '7495',
        '7879',
        '38346',
        '57117',
        '64944',
        '15605',
        '38767',
        '22190',
        '21279',
        '19603',
        '70156',
        '94175',
        '70164',
        '42731',
        '23328',
        '94267',
        '45893',
        '30380',
        '40153',
        '83119',
        '48004',
        '92698',
        '93227',
        '49964',
        '25410',
        '2160',
        '21098',
        '70063',
        '20088',
        '68880',
        '94247',
        '86016',
        '647',
        '27698',
        '57764',
        '18703',
        '40106',
        '29722',
        '72369',
        '21062',
        '68016',
        '49281',
        '50015',
        '2714',
        '94165',
        '93199',
        '24505',
        '12856',
        '43733',
        '2829',
        '20097',
        '10551',
        '20142',
        '25961',
        '79992',
        '36008',
        '43077',
        '11737',
        '33242',
        '66036',
        '22037',
        '27555',
        '20338',
        '46211',
        '17951',
        '52408',
        '21529',
        '85001',
        '59836',
        '59103',
        '13479',
        '53939',
        '66692',
        '28281',
        '38365',
        '38175',
        '44194',
        '22480',
        '30036',
        '28788',
        '80931',
        '88576',
        '22908',
        '58202',
        '6440',
        '49792',
        '20451',
        '22481',
        '78285',
        '28524',
        '46931',
        '95712',
        '17107',
        '38679',
        '53195',
        '19472',
        '20055',
        '23249',
        '46061',
        '636',
        '78711',
        '21736',
        '62739',
        '90809',
        '90060',
        '6904',
        '38623',
        '23286',
        '23240',
        '98939',
        '81135',
        '78283',
        '99677',
        '40225',
        '85292',
        '83840',
        '60687',
        '11025',
        '74186',
        '32717',
        '40293',
        '10102',
        '20575',
        '68054',
        '98334',
        '32185',
        '6199',
        '87131',
        '78787',
        '38167',
        '10557',
        '25802',
        '92085',
        '72158',
        '76199',
        '28106',
        '46980',
        '46295',
        '85214',
        '23429',
        '98559',
        '15750',
        '2060',
        '12753',
        '80154',
        '68119',
        '52351',
        '95397',
        '92074',
        '12489',
        '45418',
        '5407',
        '30362',
        '43721',
        '97255',
        '25696',
        '10274',
        '4846',
        '21781',
        '22095',
        '68175',
        '24034',
        '96913',
        '99708',
        '42267',
        '95009',
        '85377',
        '97281',
        '56619',
        '11431',
        '85299',
        '88032',
        '18086',
        '41526',
        '66683',
        '70166',
        '21235',
        '7709',
        '50980',
        '15006',
        '14168',
        '25356',
        '29834',
        '60635',
        '16873',
        '13745',
        '15447',
        '84537',
        '77262',
        '40285',
        '24246',
        '87119',
        '21123',
        '99260',
        '96784',
        '88555',
        '27204',
        '32316',
        '21746',
        '45643',
        '17105',
        '40317',
        '32572',
        '85277',
        '49016',
        '44211',
        '8347',
        '19961',
        '84190',
        '44274',
        '74009',
        '83121',
        '76162',
        '90397',
        '39324',
        '52220',
        '43199',
        '40392',
        '86020',
        '54525',
        '98464',
        '38110',
        '771',
        '43550',
        '64192',
        '93794',
        '70310',
        '83711',
        '75398',
        '5848',
        '92623',
        '55480',
        '89432',
        '98641',
        '33427',
        '38331',
        '51242',
        '43939',
        '20422',
        '33780',
        '27512',
        '20030',
        '5031',
        '27915',
        '84139',
        '46624',
        '98255',
        '12767',
        '30198',
        '53791',
        '97425',
        '12602',
        '10151',
        '10184',
        '48397',
        '14653',
        '40467',
        '85039',
        '804',
        '8227',
        '95194',
        '95857',
        '29528',
        '24030']
    return zipcodes;
}
async function orgSearchLoginAsClient(page, url) {
    let orgName = await read_excel_data('organization.xlsx', 0);
    console.log('organizations count is ' + orgName.length); let results = [];
    let profile = page.locator("//*[@class='user_image']");
    await page.goto(url + 'inventory');
    await expect(profile).toBeVisible(); await profile.click()
    await expect(page.locator("//*[text()='Login as Client']")).toBeVisible()
    await page.click("//*[text()='Login as Client']")
    for (let index = 0; index < orgName.length; index++) {
        let oName = orgName[index]['Name']
        let owner = orgName[index]['Owner']
        let orgStatus = orgName[index]['Status']
        await expect(page.locator("//*[contains(@class, 'login-client-icon')]")).toBeVisible()
        await page.click("//*[contains(@class, 'login-client-icon')]")
        await expect(page.locator("//*[text()='Please select Organization']")).toBeVisible()
        if (typeof oName != "string") { oName = oName.toString(); }
        await page.getByLabel('Organization*').fill(oName)
        await expect(page.locator("//*[text()='Loading...']")).toBeHidden()
        try {
            await expect(page.getByText(oName, { exact: true }).nth(1)).toBeVisible({ timeout: 1000 })
            let text = await page.locator("(//*[contains(@class, 'css-4mp3pp-menu')])[1]").textContent()
            await page.getByText(oName, { exact: true }).nth(1).click()
            // console.log(text)
            results.push(true); await page.click("//*[@aria-label='clear']")
        } catch (error) {
            // console.log(error)
            let text = await page.locator("(//*[contains(@class, 'css-4mp3pp-menu')])[1]").textContent()
            if (orgStatus == 'InActive') {
                results.push(true)
            } else {
                results.push(false)
                console.log(ANSI_RED + oName + ' --> ' + text + ' Owner is ' + owner + ANSI_RESET)
            }
        }
    }
    console.log('results ' + results)
    let status
    for (let j = 0; j < results.length; j++) {
        if (results[j] == true) { status = results[j] }
        else { status = results[j]; break }
    }
    return status;
}
async function quoteTotalDisplaysZero(page, acc_num, cont_name, quoteType, stockCode) {
    async function searchQuoteID() {
        await page.getByText('Quotes').click();
        await expect(allPages.profileIconListView).toBeVisible({ timeout: 50000 });
        await page.getByPlaceholder('Quote ID / Company Name / Sales Person Name / Email').fill(quote_id);
        await delay(page, 2000);
        await expect(allPages.profileIconListView).toBeVisible({ timeout: 50000 });
        await expect(page.locator("//*[text()='" + quote_id + "']")).toBeVisible();
    }
    await createQuote(page, acc_num, quoteType);
    // await page.goto("https://www.staging-buzzworld.iidm.com/quote_for_parts/364b2f47-d6e7-4d1b-81cf-a372d26e1746")
    let quote = await page.locator('(//*[@class = "id-num"])[1]').textContent();
    let quote_id = quote.replace("#", "");
    console.log('quote is created with number: ', quote_id);
    console.log('quote url is: ', await page.url());
    await selectRFQDateandQuoteRequestedBy(page, cont_name);
    await addItesms(page, stockCode, quoteType);
    await soucreSelection(page, stockCode);
    await submitForInternalApproval(page);
    await createVersion(page, quote_id);
    await expect(page.getByRole('button', { name: 'delet-icon' }).first()).toBeVisible();
    //Option deleting
    await page.getByRole('button', { name: 'delet-icon' }).first().click();
    await expect(page.locator('#root')).toContainText('Are you sure you want to delete this option ?');
    await page.getByRole('button', { name: 'Yes' }).nth(1).click();
    await delay(page, 1200);
    await searchQuoteID(); let res;
    await delay(page, 1200);
    let grandTotalInList = await page.locator("//*[@class='ag-center-cols-container']/div/div[9]").textContent();
    if (grandTotalInList == '$0.00') {
        await allPages.gridFirstRow.click();
        await addItesms(page, ["GA80U2211ABM"], quoteType);
        let grandTotalInDet = await page.locator("(//*[contains(@class, 'total-price-ellipsis')])[3]").textContent();
        await searchQuoteID();
        let grandTotalInList = await page.locator("//*[@class='ag-center-cols-container']/div/div[9]").textContent();
        if (grandTotalInList == grandTotalInDet) {
            res = true;
            console.log('in list view grand total: ' + grandTotalInList);
            console.log('in detail view grand total: ' + grandTotalInDet);
        } else {
            res = false;
            console.log('in list view grand total: ' + grandTotalInList);
            console.log('in detail view grand total: ' + grandTotalInDet);
        }
    } else {
        res = false;
        console.log('in list view grand total: ' + grandTotalInList);
    }
    return res;
}
async function loginAsClient(page, url, context) {
    let oName = 'ZUMMO00'
    let profile = page.locator("//*[@class='user_image']");
    await page.goto(url + 'inventory');
    await expect(profile).toBeVisible(); await profile.click()
    await expect(page.locator("//*[text()='Login as Client']")).toBeVisible()
    await page.click("//*[text()='Login as Client']")
    await expect(page.locator("//*[contains(@class, 'login-client-icon')]")).toBeVisible()
    await page.click("//*[contains(@class, 'login-client-icon')]")
    await expect(page.locator("//*[text()='Please select Organization']")).toBeVisible()
    if (typeof oName != "string") { oName = oName.toString(); }
    await page.getByLabel('Organization*').fill(oName)
    await expect(page.locator("//*[text()='Loading...']")).toBeHidden()
    try {
        await expect(page.getByText(oName, { exact: true }).nth(1)).toBeVisible({ timeout: 1000 })
        let text = await page.locator("(//*[contains(@class, 'css-4mp3pp-menu')])[1]").textContent()
        await page.getByText(oName, { exact: true }).nth(1).click()
        // console.log(text)
        const [page1] = await Promise.all([
            context.waitForEvent('page'),
            await page.click("//*[contains(@src, 'open-new-tab')]")
        ]);
        await expect(page1.locator("//*[text()='Need Your Attention ']")).toBeVisible();
        await expect(page1.getByText('ZUMMO MEAT CO INC', { exact: true })).toBeVisible();
        await expect(page1.getByText('ST JAMES BLVD, BEAUMONT, TX, 77705')).toBeVisible();
        await page1.getByText('Repairs', { exact: true }).click();
        await expect(page1.getByText('Repairs').nth(1)).toBeVisible();
        await page1.click("//*[contains(@class,'ag-center-cols-container')]/div/div")
        await expect(page1.locator("//*[contains(text(),'Repair Items')]")).toBeVisible()
        await delay(page, 2000)
        let upload = await page1.locator("//*[text()='Upload']");
        let uplStatus = await upload.isEnabled();
        console.log('upload button status: ' + uplStatus)
        if (uplStatus) {
            console.log('upload button is enabled')
        } else {
            await page1.getByText('Quotes').click();
            await expect(page1.getByText('Quote Requests')).toBeVisible();
            await expect(page1.getByText('Pending Approval').first()).toBeVisible();
            await page1.click("(//*[text()='Pending Approval'])[1]");
            let approve = await page1.locator("//*[text()='Approve']");
            let reject = await page1.locator("//*[text()='Reject']");
            let print = await page1.locator("//*[contains(@src,'print')]")
            let dnload = await page1.locator("//*[contains(@src,'download')]")
            let aprStatus = await approve.isEnabled(); let rejStatus = await reject.isEnabled();
            let prnStatus = await print.isEnabled(); let dnStatus = await dnload.isEnabled();
            if (prnStatus) {
                if (dnStatus) {
                    if (aprStatus) {
                        console.log('approve button is enabled')
                    } else {
                        if (rejStatus) {
                            console.log('reject button is enabled')
                        } else {
                            // await page1.pause()
                            await page1.getByText('Orders').click();
                            await page1.getByText('Orders').nth(1).click();
                            await expect(page1.getByText('Orders').nth(1)).toBeVisible();
                            await page1.getByText('Company Profile').click();
                            await expect(page1.getByText('ZUMMO MEAT CO INC')).toBeVisible();
                            await expect(page1.getByText('ST JAMES BLVD, BEAUMONT, TX, 77705').first()).toBeVisible();
                            await expect(page1.getByRole('heading', { name: 'Default Shipping Method,' })).toBeVisible();
                            await expect(page1.getByText('Shipping Address')).toBeVisible();
                            await expect(page1.getByText('3705 SAINT JAMES BLVD,')).toBeVisible();
                            await expect(page1.getByText('Billing Address')).toBeVisible();
                            await expect(page1.getByTitle('3705 ST JAMES BLVD, BEAUMONT')).toBeVisible();
                            await page1.getByText('Invoices').click();
                            await page1.pause()
                        }
                    }
                } else {
                    console.log('download icon is disabled')
                }
            } else {
                console.log('pirnt icon is disabled')
            }
        }
    } catch (error) {
        console.log(error)
        let text = await page.locator("(//*[contains(@class, 'css-4mp3pp-menu')])[1]").textContent()
        console.log(ANSI_RED + oName + ' -->  Owner is ' + ANSI_RESET)
    }
}
async function getImages(page) {
    let models = await read_excel_data('Models.xlsx', 0);
    console.log('count is ', models.length)
    // await page.pause();
    await page.goto('https://cloud.ihmi.net/photo/#!Albums/')
    await expect(page.locator("(//*[text()='Accessories'])[1]")).toBeVisible();
    let categories = [];
    let categ = await page.locator("(//ul[@class='x-tree-node-ct' and @style=''])[1]/li").count();
    console.log('categories count is ' + categ); let findCount = 1;
    for (let index = 0; index < categ; index++) {
        let cat1 = await page.locator("(//ul[@class='x-tree-node-ct' and @style=''])[1]/li[" + (index + 1) + "]").textContent();
        categories.push('category ' + cat1);
        if (cat1 != 'cMT X series') {
            if (cat1 != 'XE series') {
                await page.locator("(//*[text()='" + cat1 + "'])[1]").click();
                await expect(page.locator("(//*[@class='album-info'])[1]")).toBeVisible();
                await delay(page, 1200);
                let itemCount = await page.locator("//*[@class='album-info']").count();
                console.log('items count in ' + cat1 + ' is ' + itemCount);
                let res;
                for (let j = 0; j < itemCount; j++) {
                    let itemText = await page.locator("(//*[@class='album-info'])[" + (j + 1) + "]").textContent();
                    for (let c = 0; c < models.length; c++) {
                        let model = models[c]['Model #'];
                        if (itemText == model) {
                            // console.log('item from site is ' + itemText);
                            // console.log('model from sheet is ' + model);
                            findCount = findCount + 1;
                            await page.locator("(//*[@class='thumb-border '])[" + (j + 1) + "]").click();
                            await expect(page.locator("(//*[text()='Slideshow'])[1]")).toBeVisible();
                            await delay(page, 2000)
                            let imagesCount = await page.locator("(//*[@class='thumb-check'])").count();
                            console.log('images count in ' + cat1 + ' / ' + itemText + ' is ' + imagesCount);
                            await page.goBack(); await expect(page.locator("(//*[@class='album-info'])[1]")).toBeVisible();
                            await delay(page, 1200);
                            //one image selection
                            // await page.locator("(//*[@class='thumb-check'])[1]").click();
                            //All images selection
                            // await page.locator("(//*[text()='Select the entire album'])[1]").click();
                            // // await page.pause();
                            // await page.locator("(//*[text()='Download'])[1]").click();
                            res = true;
                            break;
                        } else {
                            res = false;
                        }
                    }
                    if (res) {

                    } else {
                        console.log('Item not found in sheet / model ' + itemText);
                    }
                }
            } else {
                console.log('items not found in ' + cat1);
            }
        } else {
            await page.locator("(//*[text()='" + cat1 + "'])[1]").click();
            await expect(page.locator("(//*[@class='album-info'])[1]")).toBeVisible();
            await delay(page, 1200);
            let catCount = await page.locator("//*[@class='album-info']").count();
            for (let s = 0; s < catCount; s++) {
                let subCat = await page.locator("(//*[@class='album-info'])[" + (s + 1) + "]").textContent();
                await page.locator("(//*[@class='thumb-border '])[" + (s + 1) + "]").click();
                await expect(page.locator("(//*[@class='album-info'])[1]")).toBeVisible();
                await delay(page, 1200);
                let itemCount = await page.locator("//*[@class='album-info']").count();
                console.log('items count in ' + cat1 + ' / ' + subCat + ' is ' + itemCount);
                let res;
                for (let j = 0; j < itemCount; j++) {
                    let itemText = await page.locator("(//*[@class='album-info'])[" + (j + 1) + "]").textContent();
                    for (let c = 0; c < models.length; c++) {
                        let model = models[c]['Model #'];
                        if (itemText == model) {
                            // console.log('item from site is ' + itemText);
                            // console.log('model from sheet is ' + model);
                            findCount = findCount + 1;
                            await page.locator("(//*[@class='thumb-border '])[" + (j + 1) + "]").click();
                            await expect(page.locator("(//*[text()='Slideshow'])[1]")).toBeVisible();
                            await delay(page, 2000)
                            let imagesCount = await page.locator("(//*[@class='thumb-check'])").count();
                            console.log('images count in ' + cat1 + ' / ' + subCat + ' / ' + itemText + ' is ' + imagesCount);
                            await page.goBack(); await expect(page.locator("(//*[@class='album-info'])[1]")).toBeVisible();
                            await delay(page, 1200);
                            res = true;
                            break;
                        } else {
                            res = false;
                        }
                    }
                    if (res) {

                    } else {
                        console.log('Item not found in sheet / model ' + itemText);
                    }
                }
                await page.goBack();
                await expect(page.locator("(//*[@class='album-info'])[1]")).toBeVisible();
            }
        }

    }
    console.log('items match count is ' + findCount);
    console.log(categories);
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
    admin_permissions,
    pricing_permissions,
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
    createRMA,
    itemsAddToEvaluation,
    addItemsToQuote,
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
    read_excel_data,
    getProductWriteIntoExecl,
    verifyTwoExcelData,
    addDiscountCodeValidations,
    addFunctionInAdminTabs,
    returnResult,
    nonSPAPrice,
    addSPAItemsToQuote,
    validationsAtCreateRMAandQuotePages,
    addCustomerToSysProValidations,
    websitePaddingTesting,
    verifyingCharacterLenght,
    addCustomerToSyspro,
    addCustomerPermissions,
    delay,
    bomImporter,
    allValidationsBOMImporter,
    verifySPAExpiryMails,
    itemNotesLineBreaks,
    uploadBOMFiles,
    readExcelHeaders,
    fetchZipcodes,
    getZips,
    addStockInventorySearch,
    addTerritoryToZipcodes,
    defaultTurnAroundTime,
    getImages,
    orgSearchLoginAsClient,
    loginAsClient,
    quoteTotalDisplaysZero
};