import { expect } from "@playwright/test";
import { testData } from "./TestData";
import { ANSI_RED, ANSI_RESET, currentDateTime, delay, end_date, selectReactDropdowns } from "../tests/helper";
import { reactFirstDropdown } from "./QuotesPage";
import { enterKey, insertKeys, leftArrowKey, rightArrowKey } from "./RepairPages";
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

//Actions Components
export async function goToDiscountCodes(page) {
    await expect(pricingDropDown(page)).toBeVisible();
    await pricingDropDown(page).click();
    await dcAtPricing(page, 'menuitem').click();
    await expect(dcAtPricing(page, 'heading')).toBeVisible();
}
export async function addDiscountCode(page, condition, mplsPath, mplsData) {
    console.log('--------------------------------------------------', ANSI_RED + currentDateTime + ANSI_RESET, '--------------------------------------------------------');
    let res;
    try {
        await goToDiscountCodes(page);
        //getting vendor from testdat json file
        await topSearch(page).fill(testData.pricing.vendor_code);
        await expect(page.getByText(testData.pricing.vendor_code)).toBeVisible();
        await page.waitForTimeout(2500);
        await expect(reactFirstDropdown(page).first()).toBeVisible();
        await reactFirstDropdown(page).first().click();
        await insertKeys(page, 'Default');
        await page.waitForTimeout(2000);
        await enterKey(page);
        await page.waitForTimeout(2300);
        await addButton(page).click();
        await expect(page.getByPlaceholder('Our Price')).toBeVisible();
        let dc;
        if (condition === 'duplicate') { dc = 'P022'; }
        else {
            //getting discount code from testdat json file
            dc = testData.pricing.new_discount_code;
        }
        await page.getByPlaceholder('Discount Code', { exact: true }).fill(dc);
        await page.getByText('MM/DD/YYYY').first().click();
        await rightArrowKey(page); //await page.keyboard.press('ArrowDown');
        await leftArrowKey(page);//await page.keyboard.press('ArrowUp');
        await enterKey(page);//await page.keyboard.press('Enter');
        let start_date = await page.locator("(//*[contains(@class, 'singleValue')])[2]").textContent();
        await page.getByText('MM/DD/YYYY').click();
        let e_date = await end_date(start_date);
        await insertKeys(page, e_date); await enterKey(page);
        await reactFirstDropdown(page).nth(1).click();
        await selectReactDropdowns(page, '1');
        await page.getByPlaceholder('Description').fill('Manually Added Discount Code');
        await multipliersFields(page, mplsPath, mplsData);
        await page.getByRole('button', { name: 'Add Discount Code' }).click();
        await page.waitForTimeout(1800);
        if (condition === 'duplicate') {
            await expect(page.locator("//*[text() = 'The Discount Code already exists']")).toBeVisible();
            console.log('Displaying valiadtion for duplicate discount codes');
            await page.getByTitle('close').getByRole('img').click();
        } else {
            await expect(page.getByRole('button', { name: 'Add Discount Code' })).toBeHidden({ timeout: 5000 });
            await page.getByPlaceholder('Search By Discount Code').fill(dc);
            await enterKey(page);
            await expect(await editIconAtReactGrid(page).nth(0)).toBeHidden(); await expect(await editIconAtReactGrid(page).nth(0)).toBeVisible();
            await expect(page.locator("//*[text() = '" + dc + "']").first()).toBeVisible({ timeout: 5000 });
            await page.waitForTimeout(2300);
            console.log("added discount code is ", dc);
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