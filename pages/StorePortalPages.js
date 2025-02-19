const { expect } = require("@playwright/test");
const { delay, selectReactDropdowns } = require("../tests/helper");
const { loadingText } = require("./PartsBuyingPages");


async function storeLogin(page) {
    let url = process.env.BASE_URL_STORE,
        logEmail, logPword, userName, path;
    await page.goto(url);
    await page.getByRole('link', { name: ' Login' }).click();
    await expect(page.getByRole('img', { name: 'IIDM' }).first()).toBeVisible();
    if (url.includes('dev')) {
        logEmail = 'cathy@bigmanwashes.com', logPword = 'Enter@4321', userName = 'Cathy'
    } else {
        logEmail = 'multicam@testuser.com', logPword = 'Enter@4321', userName = 'test'
    }
    await page.getByPlaceholder('Enter Email ID').fill(logEmail);
    await page.getByPlaceholder('Enter Password').fill(logPword);
    await page.click("(//*[@type='submit'])[1]");
    await expect(page.locator('#main-header')).toContainText(userName);
    return userName;
}
async function cartCheckout(page, isDecline, modelNumber) {
    //search product go to checkout page
    await searchProdCheckout(page, modelNumber);
    await page.getByPlaceholder('Enter Phone Number').fill('(565) 465-46544');
    await page.getByRole('button', { name: 'Next' }).click();
    if (isDecline) {
        for (let index = 0; index < 2; index++) {
            if (await page.getByLabel('Postal Code').textContent() == '') {
                await page.getByLabel('Postal Code').click();
                await page.keyboard.insertText('46282');
                await expect(page.locator("//*[contains(text(),'Add Postal Code')]")).toBeVisible();
                await page.click("//*[contains(text(),'Add Postal Code')]");
            } else {

            }
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
async function grandTotalForCreditCard(page) {
    let st = await page.locator("(//*[contains(@class,'Total_container')])[1]/div/div[2]").textContent();
    const subTotal = Number(Number(st.replace("$", "").replace(",", "")).toFixed(2));
    const exp_tax = Number((subTotal * 0.085).toFixed(2));
    const exp_convFee = Number((subTotal * 0.04).toFixed(2));
    const exp_grandTotal = subTotal + exp_tax + exp_convFee;
    // console.log('exp sub total: '+subTotal);
    // console.log('exp tax: '+exp_tax);
    // console.log('exp con feee: '+exp_convFee);
    // console.log('exp grand total: '+exp_grandTotal);
    let at = await page.locator("(//*[contains(@class,'Total_container')])[1]/div/div[4]").textContent();
    const actual_tax = Number(at.replace("$", "").replace(",", ""));
    let ac = await page.locator("(//*[contains(@class,'Total_container')])[1]/div/div[6]").textContent();
    const actual_convFee = Number(ac.replace("$", "").replace(",", ""));
    const actualGrandTotal = (subTotal + actual_tax + actual_convFee);
    console.log('actual sub total: ' + subTotal + '\nexp sub total: ' + subTotal);
    console.log('actual tax: ' + actual_tax + '\nexp tax: ' + exp_tax);
    console.log('actual con feee: ' + actual_convFee + '\nexp con feee: ' + exp_convFee);
    console.log('actual grand total: ' + actualGrandTotal + '\nexp grand total: ' + exp_grandTotal);
    let getResults = false;
    if (exp_grandTotal === actualGrandTotal && exp_tax === actual_tax && exp_convFee === actual_convFee) { getResults = true }
    else { getResults = false; }
    return getResults;
}
async function creditCardPayment(page, userName, cardDetails) {
    await page.getByPlaceholder('Enter Name on the Card').fill(userName);
    await page.getByPlaceholder('Enter Card Number').fill(cardDetails[0]);
    await page.getByPlaceholder('MM / YY').fill(cardDetails[1]);
    await page.getByPlaceholder('Enter CVC').fill(cardDetails[2]);
    await page.pause();
    await page.getByRole('button', { name: 'Proceed To Payment' }).click();
    await expect(page.locator("//*[@viewBox='0 0 16 16']").nth(1)).toBeVisible();
    await expect(page.locator("//*[@viewBox='0 0 16 16']").nth(1)).toBeHidden();
    try {
        await page.locator("//*[text()='Something went wrong!!']").toBeHidden({ timeout: 2000 });
        await page.screenshot({ path: 'pages/screenshot' + (index + 1) + '.png', fullPage: true });
    } catch (error) {

    }
}
async function searchProdCheckout(page, modelNumber) {
    await page.getByPlaceholder('Search Product name,').fill(modelNumber);
    await verifySearchedProductIsAppearedInSearch(page, modelNumber);
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByRole('link', { name: 'View Cart ' }).click();
    await page.getByRole('link', { name: 'Checkout' }).click();
}
async function verifySearchedProductIsAppearedInSearch(page, modelNumber) {
    let searchText = await page.locator("//*[text()='Searching...']");
    await expect(searchText.first()).toBeVisible(); await expect(searchText.first()).toBeHidden();
    let search_prod_name = await page.locator('//*[@id="search"]/div[1]/div[1]/div/div[2]/ul/li/a/div[2]/p[1]');
    console.log('prods count at search is: ' + await search_prod_name.count())
    for (let index = 0; index < await search_prod_name.count(); index++) {
        const dis_prod_name = await search_prod_name.nth(index).textContent();
        if (dis_prod_name == modelNumber) {
            await search_prod_name.nth(index).click(); break;
        } else {

        }
    }
}
async function selectCustomerWithoutLogin(page, customerName, fName, lName, email, isExist) {
    await page.getByLabel('open').click();
    await page.getByLabel('Company Name*').fill(customerName);
    if (isExist) {
        await page.getByRole('option', { name: customerName, exact: true }).click();
    } else {
        try {
            await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden();
            await page.locator("//*[text()='Add Company Name']").toBeVisible();
            await page.getByRole('option', { name: customerName, exact: true }).toBeVisible({ timeout: 2000 });
        } catch (error) { await page.locator("//*[text()='Add Company Name']").click(); }
    }
    await page.getByPlaceholder('Enter First Name').fill(fName);
    await page.getByPlaceholder('Enter Last Name').fill(lName);
    await page.getByPlaceholder('Enter Email ID').fill(email);
    await delay(page, 2000); await page.getByPlaceholder('Enter Phone Number').fill('');
    await page.getByPlaceholder('Enter Phone Number').fill('(565) 465-46544');
    await page.getByRole('button', { name: 'Next' }).click();
    try {
        await expect(page.getByText('Please Enter Company Name')).toBeHidden({ timeout: 3000 });
    } catch (error) {
        throw new Error("Customer details are not filled or selected..." + error);
    }
}
async function selectBillingDetails(page) {
    //checking Billing Adrress is prefilled or not
    const billAddress = page.locator('input[name="billing_address1"]');
    if (await billAddress.getAttribute('value') == '') {
        await page.getByPlaceholder('Enter Address1').fill('Test Address');
    } else { }
    await fillCityStatePostal(page);
    await page.getByRole('button', { name: 'Next' }).click();
    //Enter Shipping Details
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
async function fillCityStatePostal(page) {
    //checking city is prefilled or not
    const cityAtBillAdrs = page.getByPlaceholder('Enter City');
    if (await cityAtBillAdrs.getAttribute('value') == '') {
        await cityAtBillAdrs.fill('Test City');
    } else { }
    //checking state is prefilled or not
    const reactDropValue = page.locator("//*[contains(@class,'react-select__value-container')]");
    if (await reactDropValue.first().textContent() == 'Select State') {
        await page.getByText('Select State').click();
        await page.getByText('Arizona', { exact: true }).click();
    } else { }
    //chekcing postal zipcode is prefilled or not
    const postalCode = '75067'; // 75067 , 58954
    if (await reactDropValue.nth(1).textContent() == 'Search By Postal Code') {
        await reactDropValue.nth(1).click();
        await page.keyboard.insertText(postalCode);
        try {
            await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden();
            await expect(page.locator("//*[contains(text(),'Add Postal Code')]")).toBeVisible({ timeout: 2400 });
            await page.click("//*[contains(text(),'Add Postal Code')]");
        } catch (error) {
            await page.getByText(postalCode).nth(1).click();
        }
    } else { }
}
module.exports = {
    storeLogin,
    cartCheckout,
    grandTotalForCreditCard,
    creditCardPayment,
    searchProdCheckout,
    verifySearchedProductIsAppearedInSearch,
    selectCustomerWithoutLogin,
    selectBillingDetails,
    selectShippingDetails,
    request_payterms,
    fillCityStatePostal
}