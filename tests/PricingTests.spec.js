const { test, chromium } = require("@playwright/test");
import { login_buzz, nonSPAPrice, returnResult, update_sc } from "../tests/helper";
import { addDCValidations, addDiscountCode, addStockCode, checkSPAPriceAfterQuoteClone, deleteQuoteOptSPAFirstLog, getTestResults, multiEditDiscountCode, updateDiscountCode, updateProduct, updateProductValiadtions } from '../pages/PricingPages';
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
    let venId = 'c256d67f-f65e-46c1-be92-a1a666340ce8',
        venName = 'WEINTEK USA INC',
        venCode = 'WEIN001',
        items = ['CMT3162X', 'A151506', 'A151804', 'A121606', 'A121204NK'],
        customer = 'CHUMP03', contactName = 'Chump ChangeEspi',
        quoteURL = 'https://www.staging-buzzworld.iidm.com/all_quotes/316790cb-6666-4038-8f88-9e5b907389ad';

    test.describe('All SPA Tests', () => {
        test('Test 12: Verifying Non SPA rule for all products at Configure with Markup and Purchase Discount', async ({ }, testInfo) => {
            // Verifying Non SPA rule for all products at Configure
            results = await nonSPAPrice(page, customer, '', '19', '', 'Markup', '38', 2, quoteURL, '', false, browser, venId, venName, venCode, false);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        });
        test('Test 13: Verifying Non SPA rule for all products at Configure with Discount and Purchase Discount', async ({ }, testInfo) => {
            // Verifying Non SPA rule for all products at Configure
            results = await nonSPAPrice(page, customer, '', '19', '', 'Discount', '38', 2, quoteURL, '', false, browser, venId, venName, venCode, false);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        });
        test('Test 14: Verifying Non SPA rule for all products at Configure with only Markup', async ({ }, testInfo) => {
            //Buy price value getting from purchase discount on list price
            results = await nonSPAPrice(page, customer, '', '', '', 'Markup', '78', 2, quoteURL, '', false, browser, venId, venName, venCode, false);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        })
        test('Test 15: Verifying Non SPA rule for all products at Configure with only Discount', async ({ }, testInfo) => {
            //Buy price value getting from purchase discount on list price
            results = await nonSPAPrice(page, customer, '', '', '', 'Discount', '38', 2, quoteURL, '', false, browser, venId, venName, venCode, false);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        })
        test('Test 16: Verifying Non SPA rule for all products at Configure with only Purchase Discount', async ({ }, testInfo) => {
            //Buy price value getting from purchase discount on list price
            results = await nonSPAPrice(page, customer, '', '9', '', '', '', 2, quoteURL, '', false, browser, venId, venName, venCode, false);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        })
        test('Test 17: Verifying Non SPA rule for specific item at Configure with Fixed Sale Price', async ({ }, testInfo) => {
            //Buy price value getting from purchase discount on list price
            results = await nonSPAPrice(page, customer, items[0], '26', '193.34', 'Markup', '65', 2, quoteURL, '99.89', false, browser, venId, venName, venCode, false);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        })
        test('Test 18: Verifying Non SPA rule for specific item at Configure with Sell Price in Type Discount', async ({ }, testInfo) => {
            //Buy price value getting from purchase discount on list price
            results = await nonSPAPrice(page, customer, items[0], '26', '193.34', 'Discount', '65', 2, quoteURL, '199.89', false, browser, venId, venName, venCode, false);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        })
        test('Test 19: Verifying Non SPA rule for specific item at Configure with only Purchase Discount', async ({ }, testInfo) => {
            //Buy price value getting from purchase discount on list price
            results = await nonSPAPrice(page, customer, items[0], '16', '', '', '', 2, quoteURL, '', false, browser, venId, venName, venCode, false);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        })
        test('Test 20: Verifying Non SPA rule for specific item at Configure with only Markup on IIDM Cost', async ({ }, testInfo) => {
            //Buy price value getting from purchase discount on list price
            results = await nonSPAPrice(page, customer, items[0], '', '', 'Markup', '37', 2, quoteURL, '', false, browser, venId, venName, venCode, false);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        })
        test('Test 21: Verifying Non SPA rule for specific item at Configure with only Markup on List Price', async ({ }, testInfo) => {
            //Buy price value getting from purchase discount on list price
            let ven_Id = '759a4e48-cd67-4e2e-8a5a-f703466bb3b4', ven_Name = 'YASKAWA', ven_Code = 'YASK001';
            results = await nonSPAPrice(page, customer, '007-0AA00', '', '', 'Markup', '37', 2, quoteURL, '', false, browser, ven_Id, ven_Name, ven_Code, false);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        })
        test('Test 22: Verifying Non SPA rule for specific item at Configure with only Discount', async ({ }, testInfo) => {
            //Buy price value getting from purchase discount on list price
            results = await nonSPAPrice(page, customer, items[0], '', '', 'Discount', '51', 2, quoteURL, '', false, browser, venId, venName, venCode, false);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        })
        test('Test 23: Verifying Non SPA rule for specific item at Configure with only Markup on Buy Price', async ({ }, testInfo) => {
            //Buy price value getting from purchase discount on list price
            results = await nonSPAPrice(page, customer, items[0], '32', '', 'Markup', '27', 2, quoteURL, '', false, browser, venId, venName, venCode, false);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        })
        test('Test 24: Verifying Non SPA rule for specific item at Configure with only markup on buy price after the quote clone', async ({ }, testInfo) => {
            //Buy price value getting from purchase discount on list price
            const quoteData = [customer, 'Parts Quote', items[0], venName, venCode, testData.quotes.source_text, contactName];
            const SPA_Data = [customer, '32', '', 'Markup', '27', 2, '', browser, venId];
            results = await checkSPAPriceAfterQuoteClone(page, quoteData, SPA_Data);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        })
        test('Test 25: Verifying Non SPA rule for specific item at Configure with only discount the quote clone', async ({ }, testInfo) => {
            //Buy price value getting from purchase discount on list price
            const quoteData = [customer, 'Parts Quote', items[0], venName, venCode, testData.quotes.source_text, contactName];
            const SPA_Data = [customer, '32', '', 'Discount', '27', 2, '', browser, venId];
            results = await checkSPAPriceAfterQuoteClone(page, quoteData, SPA_Data);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        })
        test('Test 26: Verifying Non SPA rule for all producst at Configure with only markup on the buy price the quote clone', async ({ }, testInfo) => {
            //Buy price value getting from purchase discount on list price
            const quoteData = [customer, 'Parts Quote', '', venName, venCode, testData.quotes.source_text, contactName];
            const SPA_Data = [customer, '62', '', 'Markup', '17', 2, '', browser, venId];
            results = await checkSPAPriceAfterQuoteClone(page, quoteData, SPA_Data);
            await getTestResults(results, testInfo);
            await deleteQuoteOptSPAFirstLog(page);
        })
    })
});