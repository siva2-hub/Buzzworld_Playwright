const { test } = require("@playwright/test");
import { add_sc, addDiscountCodeValidations, login_buzz, returnResult, update_dc, update_sc } from "../tests/helper";
import { addDiscountCode } from '../pages/PricingPages';
import { testData } from '../pages/TestData';

let page, results;
test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await login_buzz(page, testData.app_url)
})

test('Adding Discount Code', async ({ }, testInfo) => {
    try {
        await addDiscountCode(page, '', testData.pricing.multipliers_path, testData.pricing.multipliers_data);
    } catch (error) { throw new Error(testInfo.title + ' Test has Failed' + error); }
})

test('multi edit dc', async () => {
    await multi_edit(page, testData.pricing.new_discount_code);
})

test('Add Discount Code with Validations', async ({ }, testInfo) => {
    results = await addDiscountCode(page, '', testData.pricing.multipliers_path, testData.pricing.multipliers_data);
    if (results) {
        results = await addDiscountCode(page, 'duplicate');
        if (results) {
            results = await addDiscountCodeValidations(page, 'emptyValues');
            if (results) {
                results = await addDiscountCodeValidations(page, '');
            }
        }
    }
    let testName = testInfo.title;
    await returnResult(page, testName, results);
});

test('Update Discount Code with Validations', async ({ }, testInfo) => {
    results = await update_dc(page, '');
    if (results) {
        results = await update_dc(page, 'emptyValues');
        if (results) {
            results = await update_dc(page, 'inValidMultipliers');
        }
    }
    let testName = testInfo.title;
    await returnResult(page, testName, results);
});

test('Add Products in Pricing', async ({ }, testInfo) => {
    results = await add_sc(page, testdata.dc_new);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
});

test('Update products in Pricing', async () => {
    stock_code = await update_sc(page);
});
