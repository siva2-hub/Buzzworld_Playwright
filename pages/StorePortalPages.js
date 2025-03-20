const { expect } = require("@playwright/test");
import { delay, login_buzz, approve, redirectConsoleToFile, logFilePath, api_responses } from '../tests/helper';
import { getEleByText } from './PricingPages';
import { approveWonTheRepairQuote } from './RepairPages';
const { loadingText, nextButton } = require("./PartsBuyingPages");
const { createQuote, addItemsToQuote, selectRFQDateRequestedBy, selectSource, sendForCustomerApprovals, gridColumnData, quoteOrRMANumber } = require("./QuotesPage");
const { testData } = require("./TestData");
const { storeTestData } = require("./TestData_Store");
const path = require("path");
export const proceedBtn = (page) => { return page.getByRole('button', { name: 'Proceed' }) }
export const poNumber = (page) => { return page.getByPlaceholder('Enter PO Number') }
export const approveBtn = (page) => { return page.getByText('Approve') }
export const cardName = (page) => { return page.getByPlaceholder('Enter Name on the Card') }
export const cardNum = (page) => { return page.getByPlaceholder('Enter Card Number') }
export const validDate = (page) => { return page.getByPlaceholder('MM / YY') }
export const cvv = (page) => { return page.getByPlaceholder('Enter CVC') }
export const proPayBtn = (page) => { return page.getByRole('button', { name: 'Proceed To Payment' }) }
export const creditCardRadioBtn = (page) => { return page.getByLabel('Credit Card') }
export const notes = (page) => { return page.locator('textarea[name="notes"]') }
export const orderQuoteText = (page) => { return page.locator("//*[contains(@class,'order-id-container')]/div/div[2]") }
export const orderOrQuoteNum = (page) => { return page.locator("//*[contains(@class,'order-id-container')]/div/div[2]/span[2]") }
export const fileUpload = (page) => { return page.locator("//*[@type='file']") }
export const selectItemToAprCB = (page) => { return page.locator("//*[@name='checkbox0']") }

//storing the console data into log file
// redirectConsoleToFile();
export async function storeLogin(page) {
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
export async function cartCheckout(page, isDecline, modelNumber) {
    //search product go to checkout page
    await searchProdCheckout(page, modelNumber);
    const response = await apiReqResponses(page, "https://staging-buzzworld-api.iidm.com/v1/getCustomerData");
    let taxable = response.result.data.customerInfo.taxable_status;
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
    await notes(page).fill(storeTestData.notes);
    console.log("taxable status is: " + taxable);
    return taxable;
}
export async function grandTotalForCreditCard(page, taxable) {
    let st = await page.locator("(//*[contains(@class,'Total_container')])[1]/div/div[2]").textContent();
    const subTotal = Number(Number(st.replace("$", "").replace(",", "")).toFixed(2));
    let exp_tax;
    if (taxable == 'Exempt') {
        exp_tax = Number(0.00).toFixed(2);
    } else {
        exp_tax = Number((subTotal * 0.085).toFixed(2));
    }
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
export async function grandTotalForNet30_RPayterms(page, taxable) {
    let st = await page.locator("(//*[contains(@class,'Total_container')])[1]/div/div[2]").textContent();
    const subTotal = Number(Number(st.replace("$", "").replace(",", "")).toFixed(2));
    let exp_tax;
    if (taxable == 'Exempt') {
        exp_tax = Number(0.00).toFixed(2);
    } else {
        exp_tax = Number((subTotal * 0.085).toFixed(2));
    }
    const exp_grandTotal = subTotal + exp_tax;
    // console.log('exp sub total: '+subTotal);
    // console.log('exp tax: '+exp_tax);
    // console.log('exp grand total: '+exp_grandTotal);
    let at = await page.locator("(//*[contains(@class,'Total_container')])[1]/div/div[4]").textContent();
    const actual_tax = Number(at.replace("$", "").replace(",", ""));
    const actualGrandTotal = (subTotal + actual_tax);
    console.log('actual sub total: ' + subTotal + '\nexp sub total: ' + subTotal);
    console.log('actual tax: ' + actual_tax + '\nexp tax: ' + exp_tax);
    console.log('actual grand total: ' + actualGrandTotal + '\nexp grand total: ' + exp_grandTotal);
    let getResults = false;
    if (exp_grandTotal === actualGrandTotal && exp_tax === actual_tax) { getResults = true }
    else { getResults = false; }
    return getResults;
}
export async function creditCardPayment(page, userName, cardDetails, taxable) {
    await creditCardRadioBtn(page).click({ timeout: 10000 });
    // console.log(taxable); await page.pause();
    const status = await grandTotalForCreditCard(page, taxable);
    console.log('status is: ' + status);
    if (status) {
        // await page.pause();
        await proceedBtn(page).click();
        //enter name on the card
        await cardName(page).fill(userName);
        //enter the card number
        await cardNum(page).fill(cardDetails[0]);
        //enter valid date
        await validDate(page).fill(cardDetails[1]);
        //enter CVV
        await cvv(page).fill(cardDetails[2]); await page.pause();
        //click on the Proceed  to Payment button
        await proPayBtn(page).click();
    } else {
        throw new Error("prices not matched");
    }
}
export async function net30PaymentAtCheckout(page, poNum, taxable) {
    let grandTotalRes = await grandTotalForNet30_RPayterms(page, taxable);
    if (grandTotalRes) {
        await proceedBtn(page).click();
        await poNumber(page).fill(poNum);
        await fileUpload(page).setInputFiles('/home/enterpi/Downloads/Qc_Report_315020.pdf')
        await page.pause();
        await approveBtn(page).click();
    } else { throw new Error("prices not matched"); }
}
export async function searchProdCheckout(page, modelNumber) {
    await page.getByPlaceholder('Search Product name,').fill(modelNumber);
    // await apiReqResponses(page, 'index.php?route=extension/module/search_plus&search=' + modelNumber); await page.pause();
    await verifySearchedProductIsAppearedInSearch(page, modelNumber);
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByRole('link', { name: 'View Cart ' }).click();
    await page.getByRole('link', { name: 'Checkout' }).click();
}
export async function verifySearchedProductIsAppearedInSearch(page, modelNumber) {
    let searchText = await page.locator("//*[text()='Searching...']");
    let searchResult = false;
    await expect(searchText.first()).toBeVisible(); await expect(searchText.first()).toBeHidden();
    let search_prod_name = await page.locator('//*[@id="search"]/div[1]/div[1]/div/div[2]/ul/li/a/div[2]/p[1]');
    console.log('prods count at search is: ' + await search_prod_name.count())
    for (let index = 0; index < await search_prod_name.count(); index++) {
        const dis_prod_name = await search_prod_name.nth(index).textContent();
        if (dis_prod_name == modelNumber) {
            await search_prod_name.nth(index).click(); searchResult = true; break;
        } else {
            searchResult = false;
        }
    }
    if (searchResult) { } else {
        throw new Error("getting error while search or item not found");
    }
}
export async function selectCustomerWithoutLogin(page, customerName, fName, lName, email, isExist) {
    await page.getByLabel('open').click(); let response, taxable;
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
    if (isExist) {
        response = await apiReqResponses(page, "https://staging-buzzworld-api.iidm.com/v1/getCustomerData");
        taxable = response.result.data.customerInfo.taxable_status;
    } else { taxable = "Non-Exempt"; }
    // console.log(response); await page.pause()
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
    console.log("taxable status is: " + taxable);
    return taxable;
}
export async function selectBillingDetails(page) {
    //checking Billing Adrress is prefilled or not
    const billAddress = page.locator('input[name="billing_address1"]');
    if (await billAddress.getAttribute('value') == '') {
        await page.getByPlaceholder('Enter Address1').fill('Test Address');
    } else { }
    await fillCityStatePostal(page);
    await nextButton(page).click();
    //Enter Shipping Details
    const shipToName = page.getByPlaceholder('Enter Ship To Name');
    if (await shipToName.getAttribute('value') == '') { await shipToName.fill('Test Ship To Name'); }
    else { } await nextButton(page).click();
}
export async function net30Payment(page, modelNumber, poNum, api_path) {
    await storeLogin(page);
    let taxable = await cartCheckout(page, false, modelNumber);
    // await proceedBtn(page).click();
    // await poNumber(page).fill(poNum);
    // await fileUpload(page).setInputFiles('/home/enterpi/Downloads/Qc_Report_315020.pdf');
    // await page.pause();
    await net30PaymentAtCheckout(page, poNum, taxable);
    // await approveBtn(page).click();
    await orderConfirmationPage(page, api_path);
}
export async function ccPaymentLoggedIn(page, modelNumber, cardDetails, api_url_path) {
    let userName = await storeLogin(page);
    let taxable = await cartCheckout(page, false, modelNumber);
    // await creditCardRadioBtn(page).click({ timeout: 10000 })
    // const status = await grandTotalForCreditCard(page);
    // console.log('status is: ' + status);
    // if (status) {
    //     // await page.pause();
    //     await proceedBtn(page).click();
    await creditCardPayment(page, userName, cardDetails, taxable);
    // } else {
    //     throw new Error("prices not matched");
    // }
    await orderConfirmationPage(page, api_url_path);
}
export async function ccPaymentAsGuest(
    page, url, modelNumber, customerName, fName, lName, email, cardDetails, isExist, api_url_path
) {
    await page.goto(url);
    await searchProdCheckout(page, modelNumber);
    let taxable = await selectCustomerWithoutLogin(page, customerName, fName, lName, email, isExist);
    //select billing address
    await selectBillingDetails(page);
    //select shipping address
    await selectShippingDetails(page);
    await notes(page).fill(storeTestData.notes);
    // await creditCardRadioBtn(page).click();
    // await proceedBtn(page).click();
    await creditCardPayment(page, (fName + lName), cardDetails, taxable)
    //checking order confirmation page
    await orderConfirmationPage(page, api_url_path);
}
export async function selectShippingDetails(page) {
    await page.getByText('Select Shipping Method').click();
    await page.getByText('Over Night', { exact: true }).click();
    await page.getByLabel('', { exact: true }).check();
    await page.getByPlaceholder('Enter Collect Number').fill('123456ON');
    await page.getByRole('button', { name: 'Next' }).click();
}
export async function request_payterms(page, apiURLPath, taxable) {
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
    await page.getByRole('button', { name: 'Request' }).click();
    await page.pause();
    await page.locator('input[name="authorization_name"]').fill('test user 1234')
    await page.getByRole('button', { name: 'Request' }).click();
    await orderConfirmationPage(page, apiURLPath);
}
export async function createQuoteSendToCustFromBuzzworld(page, browser, cardDetails, paymentType) {
    //login into buzzworld
    await login_buzz(page, testData.app_url);
    // //create Quote from buzzworld
    let quoteNumber = await createQuote(page, testData.quotes.acc_num, testData.quotes.quote_type, testData.quotes.project_name);
    //Add Items to Quote
    await addItemsToQuote(
        page, [storeTestData.price_product_1], testData.quotes.quote_type, testData.quotes.suppl_name,
        testData.quotes.suppl_code, testData.quotes.source_text, testData.quotes.part_desc, testData.quotes.quote_price
    );
    //Selecting the RFDate and QuotedBy
    await selectRFQDateRequestedBy(page, testData.quotes.cont_name);
    //Selecting the Source
    await selectSource(page, testData.quotes.stock_code, testData.quotes.source_text, testData.quotes.item_notes);
    //Approve the Quote
    await approve(page, testData.quotes.cont_name);
    // Send to Customer 
    await sendForCustomerApprovals(page);
    // Creating one more page for Portal
    const context = await browser.newContext();
    const newPage = await context.newPage();
    let userName = await storeLogin(newPage);
    await newPage.getByText(userName).click();
    await newPage.getByRole('link', { name: 'Dashboard' }).click();
    await expect(newPage.getByText('Need Your Attention')).toBeVisible(); await delay(page, 2000);
    let recentQuoteId = await gridColumnData(newPage, 1);
    console.log('recent tabs quote id :' + await recentQuoteId.first().textContent());
    if (await recentQuoteId.first().textContent() == quoteNumber.replace('#', '')) {
        await recentQuoteId.first().click();
        await expect(newPage.locator("//*[text()='Unit Price:']").first()).toBeVisible();
        let portalQuoteNum = await quoteOrRMANumber(newPage).textContent();
        if (quoteNumber == portalQuoteNum.replace('#', '')) {
            await newPage.getByRole('button', { name: 'Approve' }).first().click();
            try {
                await expect(getEleByText(newPage, 'Please select atleast one item')).toBeVisible({ timeout: 2000 });
                await getEleByText(newPage, 'Cancel').nth(1).click();
                await selectItemToAprCB(newPage).click();
                await newPage.getByRole('button', { name: 'Approve' }).first().click();
            } catch (error) {
            }
            //get customer data
            const response = await apiReqResponses(newPage, "https://staging-buzzworld-api.iidm.com/v1/getCustomerData");
            const taxable = response.result.data.customerInfo.taxable_status;
            console.log('Taxable status is: ' + taxable);
            await expect(newPage.getByText('Company Information')).toBeVisible();
            await nextButton(newPage).click();
            try {
                await expect(newPage.getByText('Please Enter Phone Number')).toBeVisible({ timeout: 2000 });
                await newPage.getByPlaceholder('Enter Phone Number').fill('(565) 465-46544')
            } catch (error) {
            }
            //click on Next button at Customer information page
            await nextButton(newPage).click();
            //selecting the Billing information
            await selectBillingDetails(newPage);
            //selecting the Shipping infornation
            await selectShippingDetails(newPage);
            await notes(newPage).fill(storeTestData.notes);
            //selecting the payment options
            if (paymentType == 'Credit Card') {
                let userName = storeTestData.exist_cust_detls.f_name + storeTestData.exist_cust_detls.l_name;
                await creditCardPayment(newPage, userName, cardDetails, taxable);
            } else {
                let poNum = storeTestData.po_number;
                await net30PaymentAtCheckout(newPage, poNum, taxable);
            }
            //checking the order confimation page
            await orderConfirmationPage(newPage, storeTestData.loggedIn_api_path);
        } else {
            console.log('buzzworld quote: ' + quoteNumber + '\nPorta Quote: ' + portalQuoteNum);
        }
    } else {
        console.log('Recent quotes not having the required quote');
    }
}
export async function fillCityStatePostal(page) {
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
export async function exemptNonExemptAtCheckout(page, url, modelNumber, isGuest) {
    if (isGuest) { await page.goto(url); }
    else { await storeLogin(page); }//Login into store
    //search product
    await searchProdCheckout(page, modelNumber);
    let response = await selectCustomerWithoutLogin(page, storeTestData.exist_cust_detls.customer_name, '', '', '', true);
    // const getCustomerData = JSON.stringify(cd, null, 2)
    const taxable = response.result.data.customerInfo.taxable_status;
    console.log(taxable);
}
export async function orderConfirmationPage(page, api_url_path) {
    await apiReqResponses(page, api_url_path);
    await expect(page.getByRole('heading', { name: 'Thanks for your order!' })).toBeVisible();
    const order_quote_text = await orderQuoteText(page).textContent();
    const id = await orderOrQuoteNum(page).textContent(); let module;
    if (order_quote_text.includes('Order Id')) { module = 'Quote'; }
    else { module = 'Order'; }
    console.log(module + ' is created with: ' + id);
    await page.screenshot({ path: 'testResFiles/' + module + 'Id_' + id + '.png' });//await page.pause();
}
export async function apiReqResponses(page, apiURLPath) {
    // Wait for a specific request
    const response = await page.waitForResponse(response =>
        response.url().includes(apiURLPath) && response.status() === 200
    );
    // Get response JSON
    const responseBody = await response.json();
    console.log(response.url(), '\nCaptured Response:\n', JSON.stringify(responseBody, null, 2));
    return responseBody;
}