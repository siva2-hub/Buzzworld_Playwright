const testdata = JSON.parse(JSON.stringify(require('../testdata.json')));
const fs = require('fs');
const path = require('path');
const { test, expect, page, chromium } = require('@playwright/test');
const exp = require('constants');
const currentDate = new Date().toDateString();
let date = currentDate.split(" ")[2];
let vendor = testdata.vendor;

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
}
async function login_buzz(page, stage_url) {
    await page.goto(stage_url);
    await page.waitForTimeout(1300);
    if (await page.url().includes('sso')) {
        await page.getByPlaceholder('Enter Email ID').fill('defaultuser@enterpi.com');
        await page.getByPlaceholder('Enter Password').fill('Enter@4321');
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    } else {
    }
    await page.waitForTimeout(1200);
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
        // if (await page.url().includes('staging')) {
        //     await page.getByText('Default').click();
        // } else {

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
        await page.getByText('Add').click();
        await expect(page.getByPlaceholder('Our Price')).toBeVisible();
        await page.getByPlaceholder('Discount Code', { exact: true }).fill(testdata.dc_new);
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
        // await page.getByText('Default').click();
        // if (await page.url().includes('staging')) {
        //     await page.getByText('Default').click();
        // } else {

        await page.keyboard.insertText('Default');
        await page.waitForTimeout(2000);
        await page.keyboard.press('Enter');
        // }
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
async function spinner(page) {
    await expect(await page.locator("//*[@style = 'animation-delay: 0ms;']")).toBeVisible();
    await page.waitForTimeout(1200)
    await expect(await page.locator("//*[@style = 'animation-delay: 0ms;']")).toBeHidden();
}
async function create_job_repairs(page, is_create_job) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    let acc_num = 'ZUMMO00', cont_name = 'Austin Zummo', stock_code = '2026012504';
    let tech = 'Michael Strothers';
    // await page.goto('https://www.staging-buzzworld.iidm.com/repair-request/14a8572a-f174-4445-9da4-5b4cb700b15c');
    await page.getByText('Repairs').first().click();
    await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible();
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
    await page.getByPlaceholder('Search By Part Number').click();
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
    await expect(page.locator('#repair-items')).toContainText('Assign Technician');
    await page.getByText('Assign Technician').click();
    await page.getByText('Select').click();
    await page.keyboard.insertText(tech);
    await page.getByText(tech, { exact: true }).nth(1).click();
    await page.getByRole('button', { name: 'Assign' }).click();
    await expect(page.locator('#repair-items')).toContainText('Evaluate Item');
    await page.getByText('Evaluate Item').click();
    await page.getByText('Select').click();
    for (let index = 0; index < 3; index++) {
        await page.keyboard.press('Space');
        await page.keyboard.press('ArrowDown');
    }
    await page.getByPlaceholder('Estimated Repair Hrs').fill('2');

    await page.getByPlaceholder('Estimated Parts Cost').fill('123.53');

    await page.getByPlaceholder('Technician Suggested Price').fill('568.56');
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Update Evaluation' }).hover();
    await page.getByRole('button', { name: 'Update Evaluation' }).click();
    await page.locator('#repair-items label').click();
    await page.getByRole('button', { name: 'Add items to quote' }).click();
    await expect(page.locator('#root')).toContainText('Are you sure you want to add these item(s) to quote ?');
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.locator('#repair-items')).toContainText('Quote Items (1)');
    let quote = await page.locator('(//*[@class = "id-num"])[1]').textContent();
    let quote_id = quote.replace("#", "");
    console.log('quote is created with id ', quote_id);
    console.log('quote url is ', await page.url());
    await page.getByRole('button', { name: 'Approve' }).click();
    await page.getByRole('button', { name: 'Approve' }).nth(1).click();

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
    await expect(page.getByRole('heading', { name: 'Sales Order Information' })).toBeVisible();
    let soid = await page.locator('(//*[@class = "id-num"])[1]').textContent();
    let order_id = soid.replace("#", "");
    console.log('order created with id ', order_id);
    if (is_create_job == 'Y') {
        console.log("job selection checkbox is checked ", is_checked);
        let job_id = await page.locator('(//*[@role = "presentation"])[7]');
        console.log('job created with id ', await job_id.textContent());
        await job_id.click();
        await expect(page.getByRole('heading', { name: 'Job Information' })).toBeVisible();
        //create parts purchase from repair.
        await create_parts_purchase(page, false);
    } else {
        console.log("job selection checkbox is checked ", is_checked);
    }

}
async function create_job_quotes(page, is_create_job) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    let acc_num = 'SKYCA00', cont_name = 'Tim Demers', stock_code = '46012504001';
    // await page.goto('https://www.staging-buzzworld.iidm.com/system_quotes/df2e1b91-098b-48c9-8fab-ecebc8d3d6bb');
    await page.getByText('Quotes', { exact: true }).first().click();
    await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible();
    await page.locator('div').filter({ hasText: /^Create Quote$/ }).nth(1).click();
    await expect(page.getByText('Search By Account ID or')).toBeVisible();
    await page.locator('div').filter({ hasText: /^Company Name\*Search By Account ID or Company Name$/ }).getByLabel('open').click();
    await page.getByLabel('Company Name*').fill(acc_num);
    await expect(page.getByText(acc_num, { exact: true }).nth(1)).toBeVisible();
    await page.getByText(acc_num, { exact: true }).nth(1).click();
    await page.getByText('Quote Type').nth(1).click();
    await page.getByText('System Quote', { exact: true }).click();
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
        await page.getByPlaceholder('Part Number').click();
        await page.getByPlaceholder('Part Number').fill(stock_code);
        await page.getByPlaceholder('Quantity').click();
        await page.getByPlaceholder('Quantity').fill('1');
        await page.getByPlaceholder('Quote Price').click();
        await page.getByPlaceholder('Quote Price').fill('123.56');
        await page.getByPlaceholder('List Price').click();
        await page.getByPlaceholder('List Price').fill('256.36');
        await page.getByPlaceholder('IIDM Cost').click();
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
    await page.getByRole('button', { name: 'Approve' }).click();
    await page.getByRole('button', { name: 'Approve' }).nth(1).click();

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
    await expect(page.getByRole('heading', { name: 'Sales Order Information' })).toBeVisible();
    let soid = await page.locator('(//*[@class = "id-num"])[1]').textContent();
    let order_id = soid.replace("#", "");
    console.log('order created with id ', order_id);
    if (is_create_job == 'Y') {
        console.log("job selection checkbox is checked ", is_checked);
        let job_id = await page.locator('(//*[@role = "presentation"])[6]');
        console.log('job created with id ', await job_id.textContent());
        await job_id.click();
        await expect(page.getByRole('heading', { name: 'Job Information' })).toBeVisible();
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
async function create_parts_purchase(page, is_manually) {
    console.log('--------------------------------------------------', currentDateTime, '--------------------------------------------------------');
    try {
        let job_id = testdata.job_id; let tech = testdata.tech; let urgency = testdata.urgency;
        await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible();
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
            await page.locator('(//*[@role = "presentation"])[5]').click();
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
        await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible();
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
async function import_pricing(page) {
    await login_buzz(page, stage_url)

    await page.getByRole('button', { name: 'Pricing' }).click();
    await page.getByRole('menuitem', { name: 'Pricing', exact: true }).click();
    await page.getByText('Import').click();
    await page.getByLabel('Append to Existing List').first().check();
    await page.getByLabel('Append to Existing List').nth(1).check();
    await page.getByText('Search').click();
    await page.getByLabel('Vendor').fill('WEIN001');
    await page.locator('#react-select-3-option-1').getByText('WEIN001').click();
    //discount code file
    await page.locator("(//*[@type = 'file'])[1]").setInputFiles('files/sample_discount_code_file.csv');
    //pricing file
    await page.locator("(//*[@type = 'file'])[2]").setInputFiles('files/sample_pricing_file.csv');
    await page.getByRole('button', { name: 'Import' }).click();
    let status = false
    try {
        await expect(await page.locator("//*[text() = 'Summary']")).toBeVisible()
        status = true
    } catch (error) {
        console.log("Summary text is not visible.!")
    }
    if (status) {
        console.log("Summary text is visible.!")
        await page.pause()
        await page.getByText('MM/DD/YYYY').first().click();
        await page.locator('#react-select-5-input').press('ArrowRight');
        await page.locator('#react-select-5-input').press('ArrowLeft');
        await page.locator('#react-select-5-input').press('Enter');
        // await page.getByText('MM/DD/YYYY').click();
        // for (let index = 0; index < 15; index++) {
        //   await page.locator('#react-select-6-input').press('ArrowDown');
        // }
        // await page.locator('#react-select-6-input').press('Enter');
        await page.getByRole('button', { name: 'Proceed' }).click();
    } else {
        console.log("Summary text is not visible.!")
        // await page.getByRole('heading', { name: 'Error in pricing file' }).click();
        // await page.pause()
        // await page.getByTitle('close').getByRole('img').click();
    }
}
async function functional_flow(page) {
    await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible();
    await page.getByText('Admin').click();
    // await admin1(page);
    // await admin2(page);
    // await admin3(page);
    // await admin4(page);
    await quotesRepairs(page)
}
async function inventory_search(page){
    await expect(page.locator('(//*[@class = "ag-react-container"])[1]')).toBeVisible();
    let stock_code = '12340-255F'
    await page.getByText('Inventory').click();
    await expect(page.locator("//*[contains(@src, 'search_stock')]")).toBeVisible();
    await page.getByText('Search by Stock Code').click();
    await page.locator('#async-select-example').fill(stock_code);
    await spinner(page);
    let drop_count = await page.locator("//*[contains(@id, 'react-select-2-option')]").count();
    for (let index = 1; index <= drop_count; index++) {
      if (await page.locator("(//*[contains(@id, 'react-select-2-option')])["+drop_count+"]").textContent()==stock_code) {
        await page.locator("(//*[contains(@id, 'react-select-2-option')])["+drop_count+"]").click();
        break;
      } else {
        
      }
    }
    await page.getByText(stock_code, { exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Stock Code Information' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ware House Information' })).toBeVisible();
    let count = await page.locator('//*[contains(@title, "warehouse")]').count();
    console.log('warehouse is ');
    for (let index = 1; index <= count; index++) {
      let warehouse = await page.locator('(//*[contains(@title, "warehouse")])['+count+']').textContent();
      console.log('            ',warehouse);
    }
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
    inventory_search
};