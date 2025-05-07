const { test, chromium } = require("@playwright/test");
import { login_buzz, nonSPAPrice, returnResult, update_sc } from "../tests/helper";
import { addDCValidations, addDiscountCode, addStockCode, getTestResults, multiEditDiscountCode, updateDiscountCode, updateProduct, updateProductValiadtions } from '../pages/PricingPages';
import { testData } from '../pages/TestData';
import { title } from "process";

let page, results, browser;
test.beforeAll(async () => {
    browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
    const context = await browser.newContext();
    page = await context.newPage();
    await login_buzz(page, testData.app_url)
})
test.describe("Pricing Test Suite", () => {
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
    //Special Pricing Test Cases ===================================================================================
    let items = ['05P00620-0042', 'A151506', 'A151804', 'A121606', 'A121204NK'],
        customer = 'MULTI00',
        quoteURL = 'https://www.staging-buzzworld.iidm.com/all_quotes/70d130d5-0b90-4caa-bac7-9a60b1e47564';

    test('Test 12: Verifying Non SPA rule for all products at Configure with Markup and Purchase Discount', async ({ }, testInfo) => {
        // Verifying Non SPA rule for all products at Configure
        results = await nonSPAPrice(page, customer, '', '19', '', 'Markup', '38', 2, quoteURL, '', true, browser);
        await getTestResults(results, testInfo);
    });
    test('Test 13: Verifying Non SPA rule for all products at Configure with Discount and Purchase Discount', async ({ }, testInfo) => {
        // Verifying Non SPA rule for all products at Configure
        results = await nonSPAPrice(page, customer, '', '19', '', 'Discount', '38', 2, quoteURL, '', true, browser);
        await getTestResults(results, testInfo);
    });
    test('Test 14: Verifying Non SPA rule for all products at Configure with only Markup', async ({ }, testInfo) => {
        //Buy price value getting from purchase discount on list price
        results = await nonSPAPrice(page, customer, '', '', '', 'Markup', '78', 2, quoteURL, '', true, browser);
        await getTestResults(results, testInfo);
    })
    test('Test 15: Verifying Non SPA rule for all products at Configure with only Discount', async ({ }, testInfo) => {
        //Buy price value getting from purchase discount on list price
        results = await nonSPAPrice(page, customer, '', '', '', 'Discount', '38', 2, quoteURL, '', true, browser);
        await getTestResults(results, testInfo);
    })
    test('Test 16: Verifying Non SPA rule for all products at Configure with only Purchase Discount', async ({ }, testInfo) => {
        //Buy price value getting from purchase discount on list price
        results = await nonSPAPrice(page, customer, '', '9', '', '', '', 2, quoteURL, '', true, browser);
        await getTestResults(results, testInfo);
    })
    test('Test 17: Verifying Non SPA rule for specific item at Configure with Fixed Sale Price', async ({ }, testInfo) => {
        //Buy price value getting from purchase discount on list price
        results = await nonSPAPrice(page, customer, items[0], '26', '193.34', 'Markup', '65', 2, quoteURL, '99.89', true, browser);
        await getTestResults(results, testInfo);
    })
    test('Test 18: Verifying Non SPA rule for specific item at Configure with Sell Price in Type Discount', async ({ }, testInfo) => {
        //Buy price value getting from purchase discount on list price
        results = await nonSPAPrice(page, customer, items[0], '26', '193.34', 'Discount', '65', 2, quoteURL, '199.89', true, browser);
        await getTestResults(results, testInfo);
    })
    test('Test 19: Verifying Non SPA rule for specific item at Configure with only Purchase Discount', async ({ }, testInfo) => {
        //Buy price value getting from purchase discount on list price
        results = await nonSPAPrice(page, customer, items[0], '16', '', '', '', 2, quoteURL, '', true, browser);
        await getTestResults(results, testInfo);
    })
    test('Test 20: Verifying Non SPA rule for specific item at Configure with only Markup on IIDM Cost', async ({ }, testInfo) => {
        //Buy price value getting from purchase discount on list price
        results = await nonSPAPrice(page, customer, items[0], '', '', 'Markup', '37', 2, quoteURL, '', true, browser);
        await getTestResults(results, testInfo);
    })
    test('Test 21: Verifying Non SPA rule for specific item at Configure with only Markup on List Price', async ({ }, testInfo) => {
        //Buy price value getting from purchase discount on list price
        results = await nonSPAPrice(page, customer, '007-0AA00', '', '', 'Markup', '37', 2, quoteURL, '', false, browser);
        await getTestResults(results, testInfo);
    })
    test('Test 22: Verifying Non SPA rule for specific item at Configure with only Discount', async ({ }, testInfo) => {
        //Buy price value getting from purchase discount on list price
        results = await nonSPAPrice(page, customer, items[0], '', '', 'Discount', '51', 2, quoteURL, '', true, browser);
        await getTestResults(results, testInfo);
    })
    test('Test 23: Verifying Non SPA rule for specific item at Configure with only Markup on Buy Price', async ({ }, testInfo) => {
        //Buy price value getting from purchase discount on list price
        results = await nonSPAPrice(page, customer, items[0], '32', '', 'Markup', '27', 2, quoteURL, '', true, browser);
        await getTestResults(results, testInfo);
    })
});