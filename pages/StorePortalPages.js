const { expect } = require("@playwright/test");
import { delay, login_buzz, approve, redirectConsoleToFile, logFilePath, api_responses, loginAsClient, selectReactDropdowns, profile, spinner, i_icon_for_verifying_warehouses } from '../tests/helper';
import { getEleByAny, getEleByText } from './PricingPages';
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
export const getTwoPerText = (page) => { return page.locator("//html/body/div[2]/div[7]/div[1]/div[2]/div/div[1]/div[2]/div[6]/div[3]") }
export const addToCartBtn = (page) => { return page.getByRole('button', { name: 'Add to Cart' }) }
export const viewCartBtn = (page) => { return page.getByRole('link', { name: 'View Cart ' }) }
export const checkoutBtn = (page) => { return page.getByRole('link', { name: 'Checkout' }) }
export const shipping_instr_buzz = (page) => { return page.locator('//*[@id="repair-info-id"]/div[2]/div[8]/div/div') }
export const shipping_instr_portal = (page) => { return page.locator('//*[@id="repair-info-id"]/div[2]/div[6]/div/div') }
export const dashboardLink = (page) => { return page.getByRole('link', { name: 'Dashboard' }) }
export const iIcon = (page) => { return page.locator("//*[contains(@src,'infoIcon')]") }
export const statusCode = (page) => { return page.locator("//*[@class='model-ag-grid']/div/div[2]/div[2]/div[3]/div[2]/div/div/div/div[1]"); }
export const statusInfo = (page) => { return page.locator("//*[@class='model-ag-grid']/div/div[2]/div[2]/div[3]/div[2]/div/div/div/div[2]"); }
export const loginButton = (page) => { return page.locator("text=Login"); }
export const emailInput = (page) => { return page.locator("input[name='username']") }
export const passwordInput = (page) => { return page.locator("input[name='password']") }
export const signInButton = (page) => { return page.locator("//*[contains(text(),'Sign In')]").nth(1) }



//storing the console data into log file
// redirectConsoleToFile();
export async function storeLogin(page) {
    let url = process.env.BASE_URL_STORE,
        logEmail, logPword, userName, path;
    await page.goto(url);
    await loginButton(page).click();
    await expect(page.getByRole('img', { name: 'IIDM' }).first()).toBeVisible();
    if (url.includes('dev')) {
        logEmail = 'cathy@bigmanwashes.com', logPword = 'Enter@4321', userName = 'Cathy'
    } else {
        logEmail = storeTestData.storeLogin.multicam.email, logPword = storeTestData.storeLogin.multicam.pword,
            userName = storeTestData.storeLogin.multicam.user_name
    }
    await emailInput(page).fill(logEmail);
    await passwordInput(page).fill(logPword);
    await signInButton(page).click();
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
    await page.getByText(storeTestData.shipping_method, { exact: true }).click();
    await page.getByLabel('', { exact: true }).check();
    await page.getByPlaceholder('Enter Collect Number').fill('123456ON');
    await page.getByRole('button', { name: 'Next' }).click();
    await notes(page).fill(storeTestData.notes);
    console.log("taxable status is: " + taxable);
    return taxable;
}
export async function grandTotalForCreditCard(page, taxable) {
    let st = await page.locator("(//*[contains(@class,'Total_container')])[1]/div/div[2]").textContent();
    const subTotal = Number(Number(st.replaceAll(/[$,]/g, "")).toFixed(2));
    let exp_tax;
    if (taxable == 'Exempt') {
        exp_tax = Number(0.00).toFixed(2);
    } else {
        exp_tax = Number((subTotal * 0.085).toFixed(2));
    }
    const exp_convFee = Number((subTotal * 0.04).toFixed(2));
    const exp_grandTotal = (Number(subTotal) + Number(exp_tax) + Number(exp_convFee)).toFixed(2);
    let at = await page.locator("(//*[contains(@class,'Total_container')])[1]/div/div[4]").textContent();
    const actual_tax = Number(at.replaceAll(/[$,]/g, "")).toFixed(2);
    let ac = await page.locator("(//*[contains(@class,'Total_container')])[1]/div/div[6]").textContent();
    const actual_convFee = Number(ac.replaceAll(/[$,]/g, ""));
    // const actualGrandTotal = (Number(subTotal) + Number(actual_tax) + Number(actual_convFee)).toFixed(2);
    let actualGTotal = await page.locator('//*[@id="root"]/div/div[2]/div[2]/div[2]/div[5]/div/div[10]/h4').textContent();
    const actualGrandTotal = Number(actualGTotal.replaceAll(/[$,]/g, ""));
    console.log('actual sub total:' + subTotal + '\nexp sub total:' + subTotal);
    console.log('actual tax:' + actual_tax + '\nexp tax:' + exp_tax);
    console.log('actual con feee:' + actual_convFee + '\nexp con feee:' + exp_convFee);
    console.log('actual grand total:' + actualGrandTotal + '\nexp grand total:' + exp_grandTotal);
    let getResults = false;
    if ((exp_grandTotal == actualGrandTotal) && (exp_tax == actual_tax) && (exp_convFee == actual_convFee)) { getResults = true }
    else { getResults = false; }
    return getResults;
}
export async function grandTotalForNet30_RPayterms(page, taxable, isIncludeTax) {
    let st = await page.locator("(//*[contains(@class,'Total_container')])[1]/div/div[2]").textContent();
    const subTotal = Number(Number(st.replace("$", "").replace(",", "")).toFixed(2));
    let exp_tax;
    if (taxable === 'Exempt') {

        if (isIncludeTax) {
            exp_tax = Number((subTotal * 0.085).toFixed(2));
            await getEleByAny(page, 'name', 'taxExempt_checkbox').nth(0).click();
            await spinner(page);await delay(page, 2000);
            console.log(`customer selected the inlcude tax checkbox`);
        } else {
            console.log(`customer not selected the inlcude tax checkbox`);
            exp_tax = 0.00;
        }
    } else {
        exp_tax = Number((subTotal * 0.085).toFixed(2));
    }
    const exp_grandTotal = Number((subTotal + exp_tax).toFixed(2));
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
    if ((exp_grandTotal === actualGrandTotal) && (exp_tax === actual_tax)) { getResults = true }
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
export async function net30PaymentAtCheckout(page, poNum, taxable, isIncludeTax) {
    let grandTotalRes = await grandTotalForNet30_RPayterms(page, taxable, isIncludeTax);
    if (grandTotalRes) {
        await proceedBtn(page).click();
        await poNumber(page).fill(poNum);
        await fileUpload(page).setInputFiles('/home/enterpi/Downloads/Qc_Report_315020.pdf')
        await page.pause();
        await approveBtn(page).click();
    } else { throw new Error("prices not matched"); }
}
export async function searchProdCheckout(page, modelNumber) {
    for (let index = 0; index < modelNumber.length; index++) {
        await page.getByPlaceholder('Search Product name,').fill(modelNumber[index]);
        await verifySearchedProductIsAppearedInSearch(page, modelNumber[index]);
        await addToCartBtn(page).click();
    }
    await viewCartBtn(page).click();
    await checkoutBtn(page).click();
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
export async function net30Payment(page, modelNumber, poNum, api_path, isIncludeTax) {
    await storeLogin(page);
    let taxable = await cartCheckout(page, false, modelNumber);
    // await proceedBtn(page).click();
    // await poNumber(page).fill(poNum);
    // await fileUpload(page).setInputFiles('/home/enterpi/Downloads/Qc_Report_315020.pdf');
    // await page.pause();
    await net30PaymentAtCheckout(page, poNum, taxable, isIncludeTax);
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
    await selectShippingDetails(page, storeTestData.shipping_method);
    await notes(page).fill(storeTestData.notes);
    // await creditCardRadioBtn(page).click();
    // await proceedBtn(page).click();
    await creditCardPayment(page, (fName + lName), cardDetails, taxable)
    //checking order confirmation page
    await orderConfirmationPage(page, api_url_path);
}
export async function selectShippingDetails(page, shippingMethod) {
    await page.getByText('Select Shipping Method').click();
    await page.getByText(shippingMethod, { exact: true }).click();
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
    await approve(page, testData.quotes.cont_name); await page.pause()
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
            await selectShippingDetails(newPage, storeTestData.shipping_method);
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
    return module;
}
export async function apiReqResponses(page, apiURLPath) {
    let apiRes = false;
    for (let index = 0; index < 20; index++) {
        try {
            // Wait for a specific request
            const response = await page.waitForResponse(response =>
                response.url().includes(apiURLPath) && response.status() === 200
            );
            // Get response JSON
            const responseBody = await response.json();
            console.log(response.url(), '\nCaptured Response:\n', JSON.stringify(responseBody, null, 2));
            apiRes = true;
            return responseBody;
        } catch (error) {
            console.log('calling api not hitting')
        }
        if (apiRes) { break; }
        else { }
    }
}
export async function checkTwoPercentForRSAccounts(page, modelNumber, email, paymentType) {
    let orgsName, isReseller = [];
    const res = await api_responses(page, 'https://staging-buzzworld-api.iidm.com//v1/Contacts?page=1&perPage=25&sort=asc&sort_key=name&grid_name=Repairs&serverFilterOptions=%5Bobject+Object%5D&selectedCustomFilters=%5Bobject+Object%5D&search=' + email)
    // let response = JSON.stringify(res, null, 2)
    let primaryEmail = res.result.data.list[0].primary_email;
    //checking set email is equal to get email
    if (email === primaryEmail) {
        //if emails are macthed reading the org's name
        orgsName = res.result.data.list[0].organization;
        const res1 = await api_responses(page, 'https://staging-buzzworld-api.iidm.com//v1/Organizations?page=1&perPage=25&sort=desc&sort_key=accountnumber&grid_name=Repairs&serverFilterOptions=%5Bobject+Object%5D&selectedCustomFilters=%5Bobject+Object%5D&search=' + orgsName);
        let getOrgsName;
        for (let index = 0; index < res1.result.data.list.length; index++) {
            //checking the reading org's is exist in the orgs list or not
            getOrgsName = res1.result.data.list[index].name;
            //verifying both orgs are matched or not
            if (orgsName == getOrgsName) {
                let actType = res1.result.data.list[index].account_type;
                console.log('getting account type is: ' + actType);
                //If both orgs are matched checking the Account type is Reseller or not
                if (actType.includes('RS')) {
                    await storeLogin(page);
                    for (let i = 0; i < modelNumber.length; i++) {
                        await page.getByPlaceholder('Search Product name,').fill(modelNumber[i]);
                        await verifySearchedProductIsAppearedInSearch(page, modelNumber[i]);
                        let actLabel = await getTwoPerText(page).textContent();
                        await expect(getTwoPerText(page)).toBeVisible();
                        if (actLabel.includes('Get an Extra 2% off by placing an order online.')) {
                            await addToCartBtn(page).click();
                            isReseller.push(true);
                        } else {
                            isReseller.push(false);
                            console.log('2% discount label not visible, at item detail view')
                        }
                    }
                    // let taxable = await cartCheckout(page, false, modelNumber);
                } else {
                    // console.log('Account Types are not matched set Account Types is ' + actType);
                    throw new Error("Account Types are not matched set Account Types is " + actType);
                }
                break;
            } else {
                console.log('customers not matched set customer is ' + orgsName + ' and get customer is ' + getOrgsName);
            }
        }
    } else {
        console.log('emails not matched set email is ' + email + ' and get email is ' + primaryEmail);
    }
    //chekcing prices at checkout page
    console.log('is Reseller status : ' + isReseller);
    let taxable;
    if (isReseller.every(value => value === true)) {
        await viewCartBtn(page).click();
        await checkoutBtn(page).click();
        const response = await apiReqResponses(page, "https://staging-buzzworld-api.iidm.com/v1/getCustomerData");
        const taxable = response.result.data.customerInfo.taxable_status;
        await expect(notes(page)).toBeVisible();
        let qty = page.locator('//*[@id="root"]/div/div[2]/div[2]/div[1]/div/div[2]');
        let price = page.locator('//*[@id="root"]/div/div[2]/div[2]/div[1]/div/div[3]');
        let discount = page.locator('//*[@id="root"]/div/div[2]/div[2]/div[1]/div/div[4]');
        let total = page.locator('//*[@id="root"]/div/div[2]/div[2]/div[1]/div/div[5]');
        let actCalsSubTotal = 0.00, expTotal = 0.00;
        console.log('items length: ' + await total.count())
        for (let index = 1; index < await total.count(); index++) {
            // let itemText = await total.nth(index).textContent();
            qty = await qty.nth(index).textContent(); qty = Number(qty);
            price = await price.nth(index).textContent(); price = Number(price.replaceAll(/[$,]/g, "")).toFixed(2);
            discount = await discount.nth(index).textContent(); discount = Number(discount.replaceAll(/[%]/g, "")) / 100;
            total = ((qty * price) - ((qty * price) * discount)).toFixed(2);
            actCalsSubTotal = (Number(actCalsSubTotal) + Number(total)).toFixed(2);
            // expTotal = (Number(expTotal) + ((qty * price) - ((qty * price) * discount)).toFixed(2));
            expTotal = Number(expTotal) + Number(((qty * price) - ((qty * price) * discount)).toFixed(2));
            console.log('qty: ' + qty)
            console.log('price: ' + price)
            console.log('discount: ' + discount)
            console.log('total: ' + total)
            console.log('act sub total: ' + actCalsSubTotal);
            console.log('exp sub total: ' + expTotal);
            if ((actCalsSubTotal == expTotal)) {
                qty = page.locator('//*[@id="root"]/div/div[2]/div[2]/div[1]/div/div[2]');
                price = page.locator('//*[@id="root"]/div/div[2]/div[2]/div[1]/div/div[3]');
                discount = page.locator('//*[@id="root"]/div/div[2]/div[2]/div[1]/div/div[4]');
                total = page.locator('//*[@id="root"]/div/div[2]/div[2]/div[1]/div/div[5]');
            } else {
                console.log('Total not matched at products grid')
            }
        }
        console.log("before applying discount sub total is: " + actCalsSubTotal);
        let actSubTotal = await page.locator('//*[@id="root"]/div/div[2]/div[2]/div[2]/div[5]/div/div[2]/h4').textContent();
        console.log("actual sub total is: " + actSubTotal);
        let expSubTotal = actCalsSubTotal;
        console.log("expected sub total is: " + expSubTotal);
        let status;
        if (actSubTotal.replaceAll(/[$,]/g, "") == expSubTotal) {
            let radioBtn = 0;
            if (paymentType == 'Credit') { radioBtn = 2 }
            else { radioBtn = 1 }
            await page.locator("(//*[@name='programming_needed'])[" + radioBtn + "]").click();
            await delay(page, 1200);
            if (paymentType == 'Credit') { status = await grandTotalForCreditCard(page, taxable); }
            else { status = await grandTotalForNet30_RPayterms(page, taxable); }
            console.log('status: ' + status);
            if (status) { await proceedBtn(page).click(); }
            else { await page.pause(); }
        } else {
            console.log('sub totals are not matched..');
            await page.pause();
        }
    } else { }
}
export async function getPendingApprovalsGT(page) {
    let userName = await storeLogin(page);
    await page.getByText(userName).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.locator("//*[contains(@src,'Delivery-Outline')]").nth(1)).toBeVisible();
    let aPAV = await page.locator("//section/div[3]/div/div[2]").textContent();
    let penAprGrandTotal = await aPAV.replace("$", "").replace(",", "");
    console.log(penAprGrandTotal);
    const res = await apiReqResponses(page, 'https://buzzworlddev-iidm.enterpi.com:8446//v1/getAttentionQuotes?page=1&perPage=25&sort=desc&sort_key=quote_id&grid_name=Quotes&disableAutoSize=true&apiSource=portal');
    let pendingApprovalsCount = res.result.data.list; let gt = 0;
    console.log('pending approvals count is: ' + pendingApprovalsCount.length)
    for (let index = 0; index < pendingApprovalsCount.length; index++) {
        gt = gt + Number(pendingApprovalsCount[i].grand_total.replace("$",));
    }
    console.log('grand total is: ' + gt);
}
export async function checkShippingInstructionsAtOrders(page, modelNumber, paymentType, browser) {
    let userName = await storeLogin(page);
    // await page.goto('https://www.staging-portal.iidm.com/orders/942c61c3-94e6-440a-88bd-b072b7b8be7e')
    let taxable = await cartCheckout(page, false, modelNumber);
    if (paymentType == 'Credit Card') {
        let card_type = storeTestData.card_details.visa,//defining the card type here
            cardDetails = [
                card_type.card_number,
                card_type.exp_date,
                card_type.cvv
            ];
        await creditCardPayment(page, userName, cardDetails, taxable);
    } else {
        let poNumber = storeTestData.po_number;
        await net30PaymentAtCheckout(page, poNumber, taxable);
    }
    let module = await orderConfirmationPage(page, storeTestData.loggedIn_api_path);
    // let module = 'Order';
    if (module == 'Order') {
        await getEleByText(page, 'Go to ' + module).click();
        await expect(getEleByText(page, 'Orders Information')).toBeVisible()
        let shipInstrLabel = await shipping_instr_portal(page).nth(0).textContent();
        let shipInstrValue = await shipping_instr_portal(page).nth(1).textContent();
        if (shipInstrLabel.includes('Shipping Instructions')) {
            if (shipInstrValue.toLowerCase() == storeTestData.shipping_method.toLowerCase()) {
                console.log('Sending Shipping method displayed at portal Orders')
                let url = await page.url().replace("portal", "buzzworld").replace("orders", "orders-detail-view");
                const context = await browser.newContext();
                const newPage = await context.newPage();
                await login_buzz(newPage, testData.app_url);
                await newPage.goto(url);
                await expect(getEleByText(newPage, 'Sales Order Information')).toBeVisible()
                let shipInstrBuzzLabel = await shipping_instr_buzz(newPage).nth(0).textContent();
                let shipInstrBuzzValue = await shipping_instr_buzz(newPage).nth(1).textContent();
                if (shipInstrBuzzLabel.includes('Shipping Instructions')) {
                    if (shipInstrBuzzValue.toLowerCase() == storeTestData.shipping_method.toLowerCase()) {
                        console.log('Sending Shipping method displayed at buzzworld Orders')
                    } else {
                        console.log('ship_instruction label buzz is: ' + shipInstrBuzzLabel)
                        console.log('ship_instruction value buzz is: ' + shipInstrBuzzValue)
                    }
                } else {
                    console.log('ship_instruction label buzz is: ' + shipInstrBuzzLabel)
                    console.log('ship_instruction value buzz is: ' + shipInstrBuzzValue)
                }
            } else {
                console.log('ship_instruction label is: ' + shipInstrLabel)
                console.log('ship_instruction value is: ' + shipInstrValue)
            }
        } else {
            console.log('ship_instruction label is: ' + shipInstrLabel)
            console.log('ship_instruction value is: ' + shipInstrValue)
        }
    } else {
        console.log('Order not Created for this payment')
    }
    await page.screenshot({ path: 'testResFiles/' + module + '.png' })
}
export async function ordersGridSorting(page) {
    // await page.pause();
    let userName = await storeLogin(page);
    await getEleByText(page, ' ' + userName).click();
    await dashboardLink(page).click(); await delay(page, 2600);
    await getEleByText(page, 'Orders').click();
    await spinner(page); await delay(page, 3600);
    let headers = page.locator("//*[contains(@class,'ag-header-container')]/div/div");
    let headerColText = page.locator("//*[contains(@class,'ag-header-container')]/div/div/div[3]/div/span[1]");
    console.log('headers count is: ' + await headers.count())
    for (let index = 0; index < await headers.count(); index++) {
        await headers.nth(index).click();
        let sorting = await headers.nth(index).getAttribute('aria-sort');
        if (sorting == 'ascending' || sorting == 'descending') {
            await headers.nth(index).click();
            sorting = await headers.nth(index).getAttribute('aria-sort');
            if (sorting == 'descending' || sorting == 'ascending') {
                console.log('Sorting is working for ' + await headerColText.nth(index).textContent() + ' column at Orders grid');
            } else {
                console.log('Sorting is not working for ' + await headerColText.nth(index).textContent() + ' column at Orders grid');
            }
        } else {
            console.log('sorting on first click is: ' + sorting)
        }
    }
}
export async function checkTotalDueAtDashboard(page, customerName, url, oName, context) {
    let apiurl = 'https://staging-buzzworld-api.iidm.com//v1/PastDueInvoices?page=1&perPage=25&sort=desc&sort_key=customer&grid_name=Repairs&serverFilterOptions=%5Bobject+Object%5D&selectedCustomFilters=%5Bobject+Object%5D&search=' + customerName;
    const response = await api_responses(page, apiurl);
    let apiCustomer = response.result.data.list[0].customer_name;
    if (apiCustomer === customerName) {
        let expectedTotalDue = response.result.data.list[0].total_due;
        if (expectedTotalDue.includes('(')) {
            expectedTotalDue = expectedTotalDue.replace("(", "-").replace(")", "");
        }// Do Login as client and go to dashboard
        try { await expect(profile(page)).toBeVisible({ timeout: 3000 }); }
        catch (error) { await login_buzz(page, url) }
        await expect(profile(page)).toBeVisible(); await profile(page).click()
        await expect(page.locator("//*[text()='Login as Client']")).toBeVisible()
        await page.click("//*[text()='Login as Client']")
        await expect(page.locator("//*[contains(@class, 'login-client-icon')]")).toBeVisible()
        await page.click("//*[contains(@class, 'login-client-icon')]")
        await expect(page.locator("//*[text()='Please select Organization']")).toBeVisible()
        if (typeof oName != "string") { oName = oName.toString(); }
        await page.getByLabel('Organization*').fill(oName);
        await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden();
        await page.pause()
        try {
            await expect(getEleByText(page, 'No Organization Found')).toBeHidden({ timeout: 2000 });
            await getEleByText(page, oName).nth(1).click()
            const [page1] = await Promise.all([
                context.waitForEvent('page'),
                await page.click("//*[contains(@src, 'open-new-tab')]")
            ]);
            let portalRes = await apiReqResponses(page1, 'https://staging-buzzworld-api.iidm.com/v1/getSOCardInfo?apiSource=portal')
            let actualTotalDue = portalRes.result.data.total_due_count;
            if (expectedTotalDue === actualTotalDue) {
                console.log('Total Due at Portal is displaying properly for ' + customerName)
            } else {
                console.log('Total Due at Portal is displaying wrong for ' + customerName)
            }
            console.log('exp total due: ' + expectedTotalDue + '\nact total due: ' + actualTotalDue);
            //closing the Portal opened page
            await delay(page1, 1200); await page1.close();
        } catch (error) {
            console.log('seraching orgs not found')
            await page.getByTitle('close').getByRole('img').click()
        }
    } else {
        console.log('customers not matched set cust: ' + customerName + ' get cust: ' + apiCustomer)
    }
}
export async function navigateToPortalDashboard(page) {
    let userName = await storeLogin(page);
    await getEleByText(page, ' ' + userName).click();
    await dashboardLink(page).click();
}
export async function checkStatusIcon(page) {
    function checkStatusInfo(module, value) {
        let statuses;
        if (module == 'Quotes') { statuses = storeTestData.status_data.quotes.status_info }
        else { statuses = storeTestData.status_data.repairs.status_info }
        for (let index = 0; index < statuses.length; index++) {
            if (value == statuses[index]) {
                console.log('status codes and Information are matched ' + statuses[index])
                break;
            } else { console.log('status codes and Information are not matched ' + statuses[index]) }
        }
    }
    await navigateToPortalDashboard(page);
    await getEleByText(page, 'Quotes').nth(0).click();
    await expect(iIcon(page)).toBeVisible()
    await iIcon(page).click(); await delay(page, 2300);
    // let statusInfo = page.locator("//*[@class='model-ag-grid']/div/div[2]/div[2]/div[3]/div[2]/div/div/div/div[2]");
    for (let index = 0; index < await statusCode(page).count(); index++) {
        let status_code = await statusCode(page).nth(index).textContent()
        let status_info = await statusInfo(page).nth(index).textContent()
        if (status_code == storeTestData.status_data.quotes.status_code[index]) {
            checkStatusInfo('Quotes', status_info);
        } else {
            console.log('statuc code at grid ' + status_code + ' status code at data file ' + storeTestData.status_data.quotes.status_code[index])
        }
    }
}