const { test, expect, page, chromium } = require('@playwright/test');
const ExcelJS = require('exceljs');


import { start } from 'repl';
import { timeout } from '../playwright.config';
import { add_dc, add_sc, admin1, admin2, admin3, admin4, api_data, create_job_manually, create_job_quotes, create_job_repairs, create_parts_purchase, dcAddUpdate, fetchData, fetch_jobs_Data, fetch_jobs_Detail, fetch_jobs_list, fetch_orders_Data, fetch_orders_Detail, fetch_order_list, fetch_pp_status, filters_pricing, functional_flow, import_pricing, inventory_search, leftMenuSearch, login, login_buzz, logout, multi_edit, parts_purchase_left_menu_filter, productAddUpdate, quotesRepairs, setScreenSize, spinner, sync_jobs, update_dc, update_sc, pos_report, reports, parts_import, add_parts, past_repair_prices, edit_PO_pp, returnResult, admin_permissions, pricing_permissions, addDiscountCodeValidations, addFunctionInAdminTabs, getProductWriteIntoExecl, verifyTwoExcelData, nonSPAPrice, addSPAItemsToQuote, validationsAtCreateRMAandQuotePages, read_excel_data, addCustomerToSysPro } from './helper';
import AllPages from './PageObjects';

const testdata = JSON.parse(JSON.stringify(require("../testdata.json")));
const stage_url = testdata.urls.buzz_stage_url;

test('Data Driven Tests', async ({ browser }) => {
    //Logic
    let page; let results;
    let w = 1920, h = 910;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('TestCasesSheet.xlsx');
    const worksheet = workbook.getWorksheet('Sheet1');

    let test_data = await read_excel_data('TestCasesSheet.xlsx', 0);
    console.log('Total Tests Count is ', test_data.length);
    for (let index = 0; index < test_data.length; index++) {
        //test_priding file Sheet2 Data
        let testCase = test_data[index]['Test Name'];
        let isExecution = test_data[index]['Is Execution'];
        let status = test_data[index]['Results'];
        let data1 = test_data[index]['TestData1'];
        let data2 = test_data[index]['TestData2'];
        let data3 = test_data[index]['TestData3'];
        let data4 = test_data[index]['TestData4'];
        // await write_excel_data('TestCasesSheet.xlsx', 0, test_data);
        if (isExecution == 'Yes') {
            page = await browser.newPage();
            await setScreenSize(page, w, h);
            await login_buzz(page, stage_url);
        } else {

        }
        let testName;
        let condition = testCase + ' ' + isExecution;
        // console.log(condition);
        switch (condition) {
            case 'Login Yes':
                results = await login(page);
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'Add Customer to Syspro':
                results = await addCustomerToSysPro(page);
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'Admin Permissions Yes':
                results = await admin_permissions(page);
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'Pricing Permissions Yes':
                results = await pricing_permissions(page);
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'Inventory Search Yes':
                results = await inventory_search(page, 'FSD18-251-00-01', stage_url);
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'Verify validations at Create RMA and Quotes Pages Yes':
                results = await validationsAtCreateRMAandQuotePages(page);
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'Create Job and Sales Order From Repair Quotes Yes':
                //Repairable = 1, Not Repairable = 2, Repairable-Outsource = 3
                results = await create_job_repairs(page, 'Y', 1, data1, data2, data3, data4);
                testName = testCase;
                await returnResult(page, testName, results);

                break;
            case 'System Quote Creation with Sales Order and Job Yes':
                //create system quote
                results = await create_job_quotes(page, 'Y', 'System Quote', data1, data2, data3, data4);
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'Parts Quote Creation with Sales Order Yes':
                //create parts quote
                results = await create_job_quotes(page, 'Y', 'Parts Quote', data1, data2, data3, data4);
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'Create Job Manually Yes':
                results = await create_job_manually(page, data1)
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'Create Parts Purchase Manually Yes':
                results = await create_parts_purchase(page, true, '');
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'Pricing Left Menu Vendors Search Yes':
                results = await leftMenuSearch(page);
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'Add Discount Code with Validations Yes':
                results = await add_dc(page, '');
                if (results) {
                    results = await add_dc(page, 'duplicate');
                    if (results) {
                        results = await addDiscountCodeValidations(page, 'emptyValues');
                        if (results) {
                            results = await addDiscountCodeValidations(page, '');
                        }
                    }
                }
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'Update Discount Code with Validations Yes':
                results = await update_dc(page, '');
                if (results) {
                    results = await update_dc(page, 'emptyValues');
                    if (results) {
                        results = await update_dc(page, 'inValidMultipliers');
                    }
                }
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'Add Products in Pricing Yes':
                results = await add_sc(page, testdata.dc_new);
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'Update products in Pricing Yes':
                results = await update_sc(page);
                break;
            case 'multi edit dc Yes':
                await multi_edit(page, testdata.dc_new);
                break;
            case 'Verifying Buy Price and Sell Price values at Non SPA Yes':
                //Buy price value getting from purchase discount on list price
                let items = ['A081004', 'A151506', 'A151804', 'A121606', 'A121204NK'];
                let customer = 'FLOWP00';
                testName = 'Verifying Buy Price, Sell Price(Type is Markup) and IIDM Cost with buyprice as Purchase Discount';
                results = await nonSPAPrice(page, customer, items[0], '26', '', 'Markup', '78', 1, '', '');
                await returnResult(page, testName, results[0]);
                let quoteURL = results[1];

                //Buy price is given directly as buy price
                testName = 'Verifying Buy Price, Sell Price(Type is Discount) and IIDM Cost with buyprice as directly given';
                results = await nonSPAPrice(page, customer, items[1], '26', '256.56', 'Discount', '58', 2, quoteURL, '');
                await returnResult(page, testName, results[0]);

                //Buy price and purchase discount is given empty and type is Discount
                testName = 'Verifying Buy Price, Sell Price (Type is Discount) and IIDM Cost with buyprice && Purchase Discount as NaN';
                results = await nonSPAPrice(page, customer, items[2], '', '', 'Discount', '32', 3, quoteURL, '');
                await returnResult(page, testName, results[0]);

                //Buy price and purchase discount is given empty and type is Markup
                testName = 'Verifying Buy Price, Sell Price (Type is Markup) and IIDM Cost with buyprice && Purchase Discount as NaN';
                results = await nonSPAPrice(page, customer, items[3], '', '', 'Markup', '39', 4, quoteURL, '');
                await returnResult(page, testName, results[0]);

                //Buy price and purchase discount is given empty and type is Markup
                testName = 'Verifying Buy Price, Fixed Sales Price and IIDM Cost with buyprice && Purchase Discount as NaN';
                results = await nonSPAPrice(page, customer, items[4], '', '', 'Markup', '69', 5, quoteURL, '129.26');
                await returnResult(page, testName, results[0]);
                break;
            case 'verify filters in pricing Yes':
                await filters_pricing(page);
                break;
            case 'verify filters in parts purchase Yes':
                await parts_purchase_left_menu_filter(page);
                break;
            case 'POS Reports Lists Yes':
                results = await pos_report(page);
                testName = testCase;
                await returnResult(page, testName, results);
                break;
            case 'parts import Yes':
                await parts_import(page);
                break;
            case 'first add parts Yes':
                await add_parts(page, '', '');
                break;
            case 'second add parts with duplicates Yes':
                await add_parts(page, 'duplicates', '');
                break;
            case 'third add parts with all are empty Yes':
                await add_parts(page, '', 'empty');
                break;
            case 'verify past repair pricing icons Yes':
                await past_repair_prices(page);
                break;
            case 'edit PO partially received Yes':
                await edit_PO_pp(page);
                break;
            case 'import pricing two files Yes':
                //if i pass 'pricing' as second param, pricing file will be imported with append
                //if i pass 'discount code' as second param, discount code file will be imported with append
                //if i pass 'both' as second param, pricing and discount code files will be imported with append
                await import_pricing(page, 'pricing');
                break;
            case 'add functions validations in admin Yes':
                await addFunctionInAdminTabs(page);
                break;
            default:
                worksheet.getCell(`C` + (index + 2)).value = 'Not Executed';
                // console.log(testCase, ' is not selected for execution.');
                break;
        }
        if (isExecution == 'Yes') {
            if (results) {
                worksheet.getCell(`C` + (index + 2)).value = 'Passed';
            } else {
                worksheet.getCell(`C` + (index + 2)).value = 'Failed';
            }
        } else {
            worksheet.getCell(`C` + (index + 2)).value = 'Not Executed';
        }
        await workbook.xlsx.writeFile('TestCasesSheet.xlsx');
    }
});