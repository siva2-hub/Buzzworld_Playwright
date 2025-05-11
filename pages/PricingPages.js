import { expect } from "@playwright/test";
import { testData } from "./TestData";
import { ANSI_GREEN, ANSI_RED, ANSI_RESET, approve, currentDateTime, delay, end_date, getAccountTypePrice, nonSPAPrice, selectReactDropdowns } from "../tests/helper";
import { addItemsToQuote, closeAtSubCustAprvl, createQuote, deleteBtnQuotes, iidmCost, proceedButton, quotePrice, reactFirstDropdown, selectRFQDateRequestedBy, selectSource, sendForCustomerApprovals } from "./QuotesPage";
import { arrowDownKey, arrowUpKey, confPopUp, enterKey, insertKeys, leftArrowKey, promisedDateField, rightArrowKey, updateSuccMsg } from "./RepairPages";
import { timeout } from "../playwright.config";
import { create } from "domain";
import { get } from "http";



//exporting locators
export const editIconAtReactGrid = (page) => { return page.locator("//*[contains(@src,'editicon')]"); }
export const pricingDropDown = (page) => { return page.getByRole('button', { name: 'Pricing' }) }
export const dcAtPricing = (page, text) => { return page.getByRole(text, { name: 'Discount Codes' }) }
export const topSearch = (page) => { return page.getByPlaceholder('Search', { exact: true }) }
export const addButton = (page) => { return page.getByText('Add', { exact: true }) }
export const multipliersFields = async (page, mplsPath, mplsValues) => {
    for (let index = 0; index < mplsPath.length; index++) { await page.getByPlaceholder(mplsPath[index]).fill(mplsValues[index]); }
}
export const dcExistValn = (page) => { return page.locator("//*[text() = 'The Discount Code already exists']") }
export const addDCButton = (page) => { return page.getByRole('button', { name: 'Add Discount Code' }) }
export const descPricing = (page) => { return page.locator("//textarea[@name='description']") }
export const mmddyyField = (page) => { return page.getByText('MM/DD/YYYY') }
export const searchSC_DC = (page) => { return page.locator("//input[contains(@placeholder,'Stock') or contains(@placeholder,'Discount')]") }
export const getEleByText = (page, text) => { return page.locator("//*[text() = '" + text + "']") }
export const dcField = (page) => { return page.getByPlaceholder('Discount Code', { exact: true }) }
export const clearDdField = (page) => { return page.locator("//*[@aria-label='clear']") }
export const updateDCButton = (page) => { return page.getByRole('button', { name: 'Update Discount Code' }) }
export const meDCButton = (page) => { return page.getByText('Multi Edit') }
export const addSCButton = (page) => { return page.getByRole('button', { name: 'Add Product' }) }
export const scField = (page) => { return page.getByPlaceholder('Enter Stock Code') }
export const lpField = (page) => { return page.getByPlaceholder('Enter List Price') }
export const updateSCButton = (page) => { return page.getByRole('button', { name: 'Update Product' }) }

//Actions Components
export async function goToDiscountCodes(page) {
    await expect(pricingDropDown(page)).toBeVisible();
    await pricingDropDown(page).click();
    await dcAtPricing(page, 'menuitem').click();
    await expect(dcAtPricing(page, 'heading')).toBeVisible();
}
export async function fillDCData(page, dc, dcDesc, qty) {
    await expect(dcField(page)).toBeVisible();
    await dcField(page).fill(dc);
    await mmddyyField(page).first().click();
    await rightArrowKey(page);
    await leftArrowKey(page);
    await enterKey(page);
    //reading the start date value into variable
    let start_date = await promisedDateField(page).nth(1).textContent();
    await mmddyyField(page).click();
    let e_date = await end_date(start_date);
    await insertKeys(page, e_date); await enterKey(page);
    await reactFirstDropdown(page).nth(1).click();
    await selectReactDropdowns(page, qty);
    await descPricing(page).fill(dcDesc + ' ' + dc);
}
export async function fillSCData(page, stock_code, dc, lp, prodClass) {
    //fill data into stock code field
    await scField(page).fill(stock_code);
    //select discount code
    await reactFirstDropdown(page).nth(1).click();
    await selectReactDropdowns(page, dc);
    //fill data into list price
    await lpField(page).fill(lp);
    //select product class
    await reactFirstDropdown(page).nth(2).click();
    await selectReactDropdowns(page, prodClass);
    //fill data into description
    await descPricing(page).fill(testData.pricing.dcDesc + ' ' + stock_code);
}
export async function selectVendorBranch(page) {
    await topSearch(page).fill(testData.pricing.vendor_code);
    await expect(page.getByText(testData.pricing.vendor_code)).toBeVisible();
    await page.waitForTimeout(2500);
    await expect(reactFirstDropdown(page).first()).toBeVisible();
    await reactFirstDropdown(page).first().click();
    await insertKeys(page, 'Default');
    await enterKey(page);
    // await expect(await editIconAtReactGrid(page).nth(0)).toBeHidden(); await expect(await editIconAtReactGrid(page).nth(0)).toBeVisible();
}
export async function addDiscountCode(page, condition, mplsPath, mplsData) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let res;
    try {
        if (await page.url().includes('discount-codes')) {
        } else { await goToDiscountCodes(page); }
        //getting vendor from testdat json file
        await selectVendorBranch(page);
        //click on Add button
        await addButton(page).click();
        //verify the discode code field is visible 
        let dc;
        if (condition === 'duplicate') { dc = 'P022'; }
        else { dc = testData.pricing.new_discount_code; }
        //fill discoude code, dates, qty and description
        await fillDCData(page, dc, testData.pricing.dcDesc, '1');
        await multipliersFields(page, mplsPath, mplsData);
        await addDCButton(page).click();
        await page.waitForTimeout(1800);
        if (condition === 'duplicate') {
            await expect(dcExistValn(page)).toBeVisible();
            console.log('Displaying valiadtion for duplicate discount codes');
            await closeAtSubCustAprvl(page).click();
        } else {
            await expect(addDCButton(page)).toBeHidden({ timeout: 5000 });
            await searchSC_DC(page).fill(dc);
            await enterKey(page);
            await expect(await editIconAtReactGrid(page).nth(0)).toBeHidden(); await expect(await editIconAtReactGrid(page).nth(0)).toBeVisible();
            await expect(getEleByText(page, dc).first()).toBeVisible({ timeout: 5000 });
            console.log("added discount code is ", dc);
        }
        res = true;
    } catch (error) {
        console.log('getting error while adding discount code ', error);
        await page.screenshot({ path: 'files/add_dc_error.png', fullPage: true });
        await closeAtSubCustAprvl(page).click();
        await page.waitForTimeout(1800);
        res = false;
    }
    return res;
}
export async function updateDiscountCode(page, condition) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let res;
    try {
        if (await page.url().includes('discount-codes')) {
        } else { await goToDiscountCodes(page); }
        await selectVendorBranch(page);
        await searchSC_DC(page).fill(testData.pricing.new_discount_code);
        await enterKey(page); await page.waitForTimeout(2300);
        await expect(getEleByText(page, testData.pricing.new_discount_code)).toBeVisible();
        await editIconAtReactGrid(page).first().click();
        await expect(descPricing(page)).toBeVisible();
        if (condition === 'emptyValues') {
            await descPricing(page).fill('')
            await multipliersFields(page, testData.pricing.multipliers_path, testData.pricing.mpls_empty_values)
            await clearDdField(page).first().click(); await clearDdField(page).click();
            await updateDCButton(page).click();
            for (let index = 0; index < testData.pricing.upt_dc_empty_valns.length; index++) {
                await expect(getEleByText(page, testData.pricing.upt_dc_empty_valns[index])).toBeVisible();
            }
            console.log('Displaying Validations for All Fields are Empty...');
            await closeAtSubCustAprvl(page).click();
            await page.waitForTimeout(1800);
            res = true;
        } else if (condition === 'inValidMultipliers') {
            await multipliersFields(page, testData.pricing.multipliers_path, testData.pricing.mpls_inValid_values)
            await updateDCButton(page).click();
            for (let index = 0; index < testData.pricing.multipliers_path.length; index++) {
                await expect(getEleByText(page, testData.pricing.mpls_inValid_vals_valdn).nth(index)).toBeVisible();
            }
            console.log('Displaying Validations for In Valid Multiplier Values...');
            await closeAtSubCustAprvl(page).click();
            await page.waitForTimeout(1500);
            res = true;
        } else {
            let opValue = await page.getByPlaceholder(testData.pricing.multipliers_path[0]).getAttribute('value');
            console.log('our price value before update: ' + opValue);
            await multipliersFields(page, [testData.pricing.multipliers_path[0]], [testData.pricing.multipliers_data[3]]);
            await updateDCButton(page).click();
            await expect(updateSuccMsg(page)).toBeVisible();
            // await expect(page.locator('#root')).toContainText('Updated Successfully');
            await searchSC_DC(page).first().fill(testData.pricing.new_discount_code); await enterKey(page);
            try {
                await expect(editIconAtReactGrid(page).nth(0)).toBeHidden({ timeout: 4000 }); await expect(editIconAtReactGrid(page).nth(0)).toBeVisible();
            } catch (error) {
            }
            await editIconAtReactGrid(page).nth(0).click();
            await page.waitForTimeout(1600);
            opValue = await page.getByPlaceholder(testData.pricing.multipliers_path[0]).getAttribute('value');
            console.log('our price value after update: ' + opValue);
            await closeAtSubCustAprvl(page).click();
            console.log("updated discount code is ", testData.pricing.new_discount_code);
            res = true;
        }
    } catch (error) {
        console.log('getting error while updating discount code ', error);
        await page.screenshot({ path: 'files/update_dc_error.png', fullPage: true });
        await closeAtSubCustAprvl(page).click();
        await page.waitForTimeout(1800);
        res = false;
    }
    return res;
}
export async function addDCValidations(page, condition, mplsPath, mplsData) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let dc, qty, dcDesc, ourPrice, MRO, OEM, RS, res, emptyVals;
    try {
        if (condition === 'emptyValues') {
            emptyVals = testData.pricing.mpls_empty_values, dc = '', dcDesc = '', qty = '';
        } else {
            emptyVals = testData.pricing.mpls_inValid_values, dc = testData.pricing.new_discount_code,
                dcDesc = testData.pricing.dcDesc, qty = testData.pricing.dcQty;
        }
        ourPrice = emptyVals[0], MRO = emptyVals[1], OEM = emptyVals[2], RS = emptyVals[3];
        await page.waitForTimeout(2000);
        await addButton(page).click();
        await fillDCData(page, dc, dcDesc, qty);
        await multipliersFields(page, mplsPath, mplsData);
        await addDCButton(page).click();
        await page.waitForTimeout(1800);
        if (condition === 'emptyValues') {
            await clearDdField(page).first().click(); await clearDdField(page).first().click();
            const empyValsValdns = testData.pricing.mpls_empty_values_valn;
            for (let index = 0; index < empyValsValdns.length; index++) {
                await expect(getEleByText(page, empyValsValdns[index])).toBeVisible();
            }
            console.log('Displaying validation for all fields are empty');
        } else {
            for (let index = 0; index < mplsPath.length; index++) {
                await expect(getEleByText(page, testData.pricing.mpls_inValid_vals_valdn).nth(index)).toBeVisible();
            }
            console.log('Displaying validation for In valid Multiplier values');
        }
        await closeAtSubCustAprvl(page).click();
        await page.waitForTimeout(1800);
        res = true;
    } catch (error) {
        res = false;
        console.log(error);
    }
    return res;
}
export async function multiEditDiscountCode(page, dc) {
    console.log('---------------', ANSI_RED + currentDateTime + ANSI_RESET, '---------------');
    let testStatus = false;
    try {
        let po = page.getByPlaceholder(testData.pricing.multipliers_path[0]);
        await goToDiscountCodes(page); await selectVendorBranch(page);
        //click multi edit button
        await meDCButton(page).click();
        await expect(page.getByPlaceholder(testData.pricing.multipliers_path[0])).toBeVisible();
        for (let index = 0; index < dc.length; index++) {
            await reactFirstDropdown(page).nth(1).click();
            await insertKeys(page, dc[index]); await enterKey(page);
        }
        await mmddyyField(page).first().click();
        await arrowDownKey(page); await arrowUpKey(page); await enterKey(page);
        let start_date = await promisedDateField(page).nth(2).textContent();
        await mmddyyField(page).click();
        let e_date = await end_date(start_date);
        await insertKeys(page, e_date); await enterKey(page);
        await reactFirstDropdown(page).nth(2).click();
        await selectReactDropdowns(page, '1');
        await multipliersFields(page, testData.pricing.multipliers_path, testData.pricing.multipliers_data);
        await proceedButton(page).click();
        await expect(getEleByText(page, 'Saved Succesfully')).toBeVisible();
        for (let index = 0; index < dc.length; index++) {
            await searchSC_DC(page).nth(0).fill(dc[index]); await enterKey(page);
            await expect(editIconAtReactGrid(page).nth(0)).toBeHidden();
            await expect(editIconAtReactGrid(page).nth(0)).toBeVisible();
            await editIconAtReactGrid(page).nth(0).click();
            await expect(po).toBeVisible();
            if (await po.getAttribute('value') == testData.pricing.multipliers_data[0]) {
                console.log('DC --> ' + dc[index], 'PO --> ' + testData.pricing.multipliers_data[0])
                testStatus = true; await closeAtSubCustAprvl(page).click();
            } else { testStatus = false; break; }
        }
        if (testStatus) {
            console.log('multi edited discount code(s) is ', dc); testStatus = true;
        } else {
            throw new Error("getting error while multi editing discount code");
        }
    } catch (error) {
        console.log('getting error while multi editing discount code', error);
        await page.screenshot({ path: 'files/multi_edit_dc_error.png', fullPage: true });
        await closeAtSubCustAprvl(page).click();
        await page.waitForTimeout(1800);
    }
    return testStatus;
}
export async function addStockCode(page, stock_code, dc, lPrice, condition) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let res, productClass;
    try {
        //go to pricing
        await pricingDropDown(page).click();
        await getEleByText(page, 'Pricing').nth(1).click();
        //selecting vendor and branch
        await selectVendorBranch(page);
        // click on Add button at pricing
        await addButton(page).click()
        //enter all required data into add stock code page
        switch (condition) {
            case 'valid':
                productClass = testData.pricing.vendor_code[0] + testData.pricing.vendor_code[1] + '01';
                await fillSCData(page, stock_code, dc, lPrice, productClass);
                break;
            case 'empty': //productClass = ''; await fillSCData(page, stock_code, dc, lPrice, productClass);
                break;
            case 'InValid':
                productClass = testData.pricing.vendor_code[0] + testData.pricing.vendor_code[1] + '01';
                await fillSCData(page, stock_code, dc, lPrice, productClass);
                break;
            case 'duplicate':
                productClass = testData.pricing.vendor_code[0] + testData.pricing.vendor_code[1] + '01';
                await fillSCData(page, stock_code, dc, lPrice, productClass);
                break;
        }
        //click on add stock code button
        await addSCButton(page).click();
        await page.waitForTimeout(1800);
        if (condition == 'valid') {
            await expect(addSCButton(page)).toBeHidden();
            //verify the stock code is added or not
            await searchSC_DC(page).fill(stock_code);
            await enterKey(page);
            await expect(await editIconAtReactGrid(page).nth(0)).toBeHidden(); await expect(await editIconAtReactGrid(page).nth(0)).toBeVisible();
            await expect(getEleByText(page, stock_code)).toBeVisible()
            console.log("added stock code is ", stock_code)
        } else if (condition == 'empty') {
            for (let index = 0; index < testData.pricing.empty_sc_valns.length; index++) {
                await expect(getEleByText(page, testData.pricing.empty_sc_valns[index])).toBeVisible();
            }; await closeAtSubCustAprvl(page).click();
            console.log('displaying validations for emoty values while adding product')
        } else if (condition == 'duplicate') {
            await expect(getEleByText(page, testData.pricing.duplicate_sc_valns)).toBeVisible({ timeout: 3000 });
            await closeAtSubCustAprvl(page).click();
        } else {
            await lpField(page).fill('sivs');
            for (let index = 0; index < testData.pricing.inValid_sc_valns.length; index++) {
                await expect(getEleByText(page, testData.pricing.inValid_sc_valns[index])).toBeVisible()
            }
            console.log('displaying validations for in-valid values while adding product');
            await closeAtSubCustAprvl(page).click();
        }
        await page.waitForTimeout(1800);
        res = true;
    } catch (error) {
        console.log('getting error while adding stock code ', error);
        await page.screenshot({ path: 'files/add_stock_code_error.png', fullPage: true });
        await closeAtSubCustAprvl(page).click();
        res = false;
    }
    return res;
}
export async function updateProduct(page, stock_code) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let testStatus = false;
    try {
        //go to pricing
        if (await page.url().includes('pricing')) {
        } else {
            await pricingDropDown(page).click();
            await getEleByText(page, 'Pricing').nth(1).click();
        }
        //selecting vendor and branch
        await selectVendorBranch(page);
        await searchSC_DC(page).fill(stock_code);
        await enterKey(page); await page.waitForTimeout(2300);
        await expect(editIconAtReactGrid(page).first()).toBeVisible();
        await editIconAtReactGrid(page).first().click()
        await expect(descPricing(page)).toBeVisible();
        let descFieldValue = await descPricing(page).textContent();
        console.log('Description before update: ' + descFieldValue)
        let updatedDesc = testData.pricing.dcDesc + ' After Update';
        await descPricing(page).fill(updatedDesc);
        await updateSCButton(page).click();
        await expect(updateSuccMsg(page)).toBeVisible()
        await searchSC_DC(page).first().fill(stock_code);
        await enterKey(page); await page.waitForTimeout(2300);
        await expect(editIconAtReactGrid(page).first()).toBeVisible();
        await editIconAtReactGrid(page).first().click()
        await expect(descPricing(page)).toBeVisible();
        descFieldValue = await descPricing(page).textContent();
        console.log(updatedDesc + '\n' + descFieldValue);
        console.log('Description after update: ' + descFieldValue)
        if (descFieldValue == updatedDesc) {
            console.log('updated stock code is ', stock_code); testStatus = true;
        } else {
            console.log('product update is failed');
        }
        await closeAtSubCustAprvl(page).click();
    } catch (error) {
        console.log('getting error while updating stock code ', error);
        await page.screenshot({ path: 'files/update_stock_code_error.png', fullPage: true });
        await closeAtSubCustAprvl(page).click();
    }
    return testStatus;
}
export async function updateProductValiadtions(page, stockCode, condition, lpData, validationMessage) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let testStatus = false;
    try {
        //go to pricing
        if (await page.url().includes('pricing')) {
        } else {
            await pricingDropDown(page).click();
            await getEleByText(page, 'Pricing').nth(1).click();
        }
        //selecting vendor and branch
        await selectVendorBranch(page);
        await searchSC_DC(page).fill(stockCode);
        await enterKey(page); await page.waitForTimeout(2300);
        await expect(editIconAtReactGrid(page).first()).toBeVisible();
        await editIconAtReactGrid(page).first().click()
        await expect(descPricing(page)).toBeVisible();
        if (condition == 'empty') { await lpField(page).fill(lpData); }
        else { await lpField(page).fill(lpData); }
        await updateSCButton(page).click();
        // await page.pause();
        if (condition == 'empty') {
            await expect(getEleByText(page, validationMessage)).toBeVisible();
            console.log('validating update product with ' + condition + ' list price'); testStatus = true;
        } else {
            await expect(getEleByText(page, validationMessage)).toBeVisible();
            console.log('validating update product with ' + condition + ' list price'); testStatus = true;
        }
        await closeAtSubCustAprvl(page).click();
    } catch (error) {
        await closeAtSubCustAprvl(page).click();
        await page.screenshot({ path: 'files/update_stock_code_error.png', fullPage: true });
        throw new Error("getting error, while validating the update product");
    }
    return testStatus;
}
export async function checkStartEndDatesAreExipred(start_Date, end_Date) {
    const startDate = new Date(start_Date);
    const endDate = new Date(end_Date);
    const today = new Date();
    let result;
    // // Set time to 00:00:00 to avoid issues with time comparisons
    // startDate.setHours(0, 0, 0, 0);
    // endDate.setHours(0, 0, 0, 0);
    // today.setHours(0, 0, 0, 0);
    if (today >= startDate && today <= endDate) {
        console.log("Today's date is within the range.");
        result = true;
    } else {
        console.log("Today's date is NOT within the range.");
        result = false;
    }
    return result;
}
export async function getTestResults(testResult, testInfo) {
    if (testResult) {
        console.log(`${ANSI_GREEN}Test Passed: ${testInfo.title} ${ANSI_RESET}`);
    } else {
        throw new Error(`${ANSI_RED}Test Failed: ${testInfo.title} ${ANSI_RESET}`);
    }
}
export async function getAccountTypePriceValue(account_type, actPrice, response, index, accountTypePrice) {
    switch (account_type) {
        case 'PO':
            actPrice = response.result.data.list[index].PO;
            break;
        case 'MRO':
            actPrice = response.result.data.list[index].MRO;
            break;
        case 'OEM':
            actPrice = response.result.data.list[index].OEM;
            break;
        case 'RS':
            actPrice = response.result.data.list[index].RS;
            break;
    }
    accountTypePrice = actPrice.replaceAll(/[$,]/g, "");
    console.log(`account type price is ${accountTypePrice}`);
    return accountTypePrice;
}
export async function deleteQuoteOptSPAFirstLog(page) {
    await page.waitForTimeout(2000);
    await deleteBtnQuotes(page, 0).click();
    await getEleByText(page, 'Are you sure you want to delete this option ?').click();
    await getEleByText(page, 'Yes').nth(1).click();
    await expect(getEleByText(page, 'Option deleted Successfully')).toBeVisible();
    await pricingDropDown(page).click();
    await getEleByText(page, 'Non Standard Pricing').nth(0).click();
    await page.locator("//*[contains(@class,'spa-delete')]").nth(0).click();
    await getEleByText(page, 'Are you sure you want to delete this item ?').click();
    await proceedButton(page).click();
    await expect(getEleByText(page, 'Deleted Successfully')).toBeVisible();
}
export async function checkSPAPriceAfterQuoteClone(page, quoteData, SPA_Data) {
    let [actNumber, quoteType, item, venName, venCode, sourceText, contactName] = quoteData;
    await page.goto('https://www.staging-buzzworld.iidm.com/all_quotes/e55ccacf-4885-444c-9cad-358f18e849ed');
    if (item = '') { item = 'CMT3162X'; }
    // await createQuote(page, actNumber, quoteType, 'FORTESTING_SPA_AFTER_CLONE');
    // await addItemsToQuote(page, [item], quoteType, venName, venCode, sourceText, '', '');
    // await selectRFQDateRequestedBy(page, contactName);
    // await selectSource(page, [item], sourceText, 'Manually Added Notes for testing');
    // await approve(page, contactName);
    // await sendForCustomerApprovals(page);
    let quotePriceBefApplySPA = await quotePrice(page).nth(0).textContent();
    quotePriceBefApplySPA = quotePriceBefApplySPA.replaceAll(/[$,]/g, "");
    let iidmCostBefApplySPA = await iidmCost(page).nth(0).textContent();;
    iidmCostBefApplySPA = iidmCostBefApplySPA.replaceAll(/[$,]/g, "");
    console.log('Quote Price before applying SPA is ' + quotePriceBefApplySPA);
    console.log('Iidm Cost before applying SPA is ' + iidmCostBefApplySPA);
    let quoteURL = await page.url();
    let [customer, purchaseDiscount, buyPrice, discountType, discountValue, testCount, fp, browser, venId] = SPA_Data;
    if (item == '') { item = ''; }
    let testResults = await nonSPAPrice(page, customer, item, purchaseDiscount, buyPrice, discountType, discountValue, testCount, quoteURL, fp, false, browser, venId, venName, venCode, true);
    return testResults;
}
