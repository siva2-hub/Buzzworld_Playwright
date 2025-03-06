import { expect } from "@playwright/test";
import { testData } from "./TestData";
import { ANSI_RED, ANSI_RESET, currentDateTime, delay, end_date, selectReactDropdowns } from "../tests/helper";
import { closeAtSubCustAprvl, proceedButton, reactFirstDropdown } from "./QuotesPage";
import { arrowDownKey, arrowUpKey, enterKey, insertKeys, leftArrowKey, promisedDateField, rightArrowKey, updateSuccMsg } from "./RepairPages";
import { timeout } from "../playwright.config";



//exporting locators
export const editIconAtReactGrid = (page) => { return page.locator("//*[contains(@src,'editicon')]"); }
export const pricingDropDown = (page) => { return page.getByRole('button', { name: 'Pricing' }) }
export const dcAtPricing = (page, text) => { return page.getByRole(text, { name: 'Discount Codes' }) }
export const topSearch = (page) => { return page.getByPlaceholder('Search', { exact: true }) }
export const addButton = (page) => { return page.locator("//*[contains(text(),'Add')]") }
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
        await goToDiscountCodes(page);
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
        await goToDiscountCodes(page);
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
            await multipliersFields(page, [testData.pricing.multipliers_path[0]], [testData.pricing.multipliers_data[0]]);
            await updateDCButton(page).click();
            await expect(updateSuccMsg(page)).toBeVisible();
            // await expect(page.locator('#root')).toContainText('Updated Successfully');
            await searchSC_DC(page).fill(testData.pricing.new_discount_code); await enterKey(page);
            await expect(editIconAtReactGrid(page).nth(0)).toBeHidden(); await expect(editIconAtReactGrid(page).nth(0)).toBeVisible();
            await editIconAtReactGrid(page).nth(0).click();
            await page.waitForTimeout(1600);
            opValue = await page.getByPlaceholder(testData.pricing.multipliers_path[0]).getAttribute('value');
            console.log('our price value after update: ' + opValue);
            await page.pause();
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