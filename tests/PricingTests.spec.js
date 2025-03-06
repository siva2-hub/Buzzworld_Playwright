const { test } = require("@playwright/test");
import { add_sc, addDiscountCodeValidations, login_buzz, returnResult, update_dc, update_sc } from "../tests/helper";
import { addDCValidations, addDiscountCode, multiEditDiscountCode, updateDiscountCode } from '../pages/PricingPages';
import { testData } from '../pages/TestData';

let page, results;
test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await login_buzz(page, testData.app_url)
})
test('Add New Discount Code', async ({ }, testInfo) => {
    try {
        await addDiscountCode(
            page, '', testData.pricing.multipliers_path, testData.pricing.multipliers_data);
    } catch (error) { throw new Error(testInfo.title + ' Test has Failed' + error); }
})
test('Update Discount Code', async ({ }, testInfo) => {
    try {
        await updateDiscountCode(page, '')
    } catch (error) { throw new Error(testInfo.title + ' Test has Failed' + error); }
})
test('Multi Edit Discount Codes', async ({ }, testInfo) => {
    let testStatus = await multiEditDiscountCode(page, testData.pricing.old_discount_code);
    await returnResult(page, testInfo.title, testStatus);
})
test('Discount Code Adding with Validations', async ({ }, testInfo) => {
    results = await addDiscountCode(
        page, 'duplicate', testData.pricing.multipliers_path, testData.pricing.multipliers_data);
    if (results) {
        results = await addDCValidations(
            page, 'emptyValues', testData.pricing.multipliers_path, testData.pricing.mpls_empty_values);
        if (results) {
            results = await addDCValidations(
                page, '', testData.pricing.multipliers_path, testData.pricing.mpls_inValid_values);
        }
    }
    let testName = testInfo.title;
    await returnResult(page, testName, results);
});
test('Discount Code Update with Validations', async ({ }, testInfo) => {
    let testStatus = await updateDiscountCode(page, 'emptyValues')
    if (testStatus) {
        await updateDiscountCode(page, 'inValidMultipliers')
    } else {
    }
    await returnResult(page, testInfo.title, testStatus);
});
test('Add Products in Pricing', async ({ }, testInfo) => {
    results = await add_sc(page, testdata.dc_new);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
});
test('Update products in Pricing', async () => {
    stock_code = await update_sc(page);
});
