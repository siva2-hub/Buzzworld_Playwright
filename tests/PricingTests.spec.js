const { test } = require("@playwright/test");
import { login_buzz, returnResult, update_sc } from "../tests/helper";
import { addDCValidations, addDiscountCode, addStockCode, multiEditDiscountCode, updateDiscountCode, updateProduct, updateProductValiadtions } from '../pages/PricingPages';
import { testData } from '../pages/TestData';
import { title } from "process";

let page, results;
test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await login_buzz(page, testData.app_url)
})
test('Test 1: Add New Discount Code', async ({ }, testInfo) => {
    let testStatus = await addDiscountCode(
        page, '', testData.pricing.multipliers_path, testData.pricing.multipliers_data);
    await returnResult(page, testInfo.title, testStatus)
})
test('Test 2: Update Discount Code', async ({ }, testInfo) => {
    let testStatus = await updateDiscountCode(page, '')
    await returnResult(page, testInfo.title, testStatus)
})
test('Test 3: Multi Edit Discount Codes', async ({ }, testInfo) => {
    let testStatus = await multiEditDiscountCode(page, testData.pricing.old_discount_code);
    await returnResult(page, testInfo.title, testStatus);
})
test('Test 4: Discount Code Adding with Validations', async ({ }, testInfo) => {
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
test('Test 5: Discount Code Update with Validations', async ({ }, testInfo) => {
    let testStatus = await updateDiscountCode(page, 'emptyValues')
    if (testStatus) {
        await updateDiscountCode(page, 'inValidMultipliers')
    } else {
    }
    await returnResult(page, testInfo.title, testStatus);
});
test('Test 6: Manually Add Product in Pricing', async ({ }, testInfo) => {
    results = await addStockCode(page, testData.pricing.new_stock_code, testData.pricing.old_discount_code[0],
        testData.pricing.lp, 'valid'); let testName = testInfo.title;
    await returnResult(page, testName, results);
});
test('Test 7: Update product in Pricing', async ({ }, testInfo) => {
    results = await updateProduct(page, testData.pricing.new_stock_code);
    await returnResult(page, testInfo.title, results);
});
test('Test 8: Checking Empty values Validations while Add Product in Pricing', async ({ }, testInfo) => {
    results = await addStockCode(page, '', '', '', 'empty');
    let testName = testInfo.title;
    await returnResult(page, testName, results);
});
test('Test 9: Checking In-Valid values Validations while Add Product in Pricing', async ({ }, testInfo) => {
    results = await addStockCode(page, '*&^%$', testData.pricing.old_discount_code[0],
        testData.pricing.lp, 'InValid'); let testName = testInfo.title;
    await returnResult(page, testName, results);
});
test('Test 10: Validating the Update Stock code at pricing', async ({ }, testInfo) => {
    let testResults = await updateProductValiadtions(page, testData.pricing.old_stock_code, 'empty', '', testData.pricing.empty_sc_valns[2]);
    console.log('test status at first test is: ' + testResults);
    if (testResults) {
        testResults = await updateProductValiadtions(page, testData.pricing.old_stock_code, 'InValid', '^&&^&*', testData.pricing.inValid_sc_valns[1]);
        console.log('test status at second test is: ' + testResults);
    } else {
        testResults = false;
    }; await returnResult(page, testInfo.title, testResults);
})
test('Test 11: Duplicate StockCode validation while Add Product in Pricing', async ({ }, testInfo) => {
    results = await addStockCode(page, testData.pricing.old_stock_code, testData.pricing.old_discount_code[1], testData.pricing.lp, 'duplicate');
    let testName = testInfo.title;
    await returnResult(page, testName, results);
});