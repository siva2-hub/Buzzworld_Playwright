const { test, expect, page, chromium } = require('@playwright/test');
const ExcelJS = require('exceljs');

import { start } from 'repl';
import { timeout } from '../playwright.config';
import { add_dc, add_sc, admin1, admin2, admin3, admin4, api_data, create_job_manually, create_job_quotes, create_job_repairs, create_parts_purchase, dcAddUpdate, fetchData, fetch_jobs_Data, fetch_jobs_Detail, fetch_jobs_list, fetch_orders_Data, fetch_orders_Detail, fetch_order_list, fetch_pp_status, filters_pricing, functional_flow, import_pricing, inventory_search, leftMenuSearch, login, login_buzz, logout, multi_edit, parts_purchase_left_menu_filter, productAddUpdate, quotesRepairs, setScreenSize, spinner, sync_jobs, update_dc, update_sc, pos_report, reports, parts_import, add_parts, past_repair_prices, edit_PO_pp, returnResult, admin_permissions, pricing_permissions, addDiscountCodeValidations, addFunctionInAdminTabs, getProductWriteIntoExecl, verifyTwoExcelData, nonSPAPrice, addSPAItemsToQuote, validationsAtCreateRMAandQuotePages, read_excel_data, addCustomerToSysPro, websitePaddingTesting, verifyingCharacterLenght, addCustomerToSyspro, addCustomerToSysProValidations, addCustomerPermissions } from './helper';
import AllPages from './PageObjects';

const testdata = JSON.parse(JSON.stringify(require("../testdata.json")));
const stage_url = testdata.urls.buzz_stage_url;
let allPages;
test.skip('sync jobs', async ({ page }) => {
  test.setTimeout(990000000);
  await sync_jobs(page);
});
test.describe('all tests', async () => {
  let page, dc, stock_code, results;
  // To Run the Tests in Serial Order un comment the below line
  test.describe.configure({ mode: 'serial' });
  let w = 1920, h = 910;
  // let w = 1280, h = 551;

  test.beforeAll(async ({ browser }) => {
    // await reports('First Test', 'Passed');
    page = await browser.newPage();
    await setScreenSize(page, w, h);
    await login_buzz(page, stage_url);
  });

  test('Login', async ({ }, testInfo) => {
    results = await login(page);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  });

  test('Add Customer to Syspro Validations', async ({ }, testInfo) => {
    let searchCompany = 'Sulzer Electro-Mechanical Services';
    results = await addCustomerToSysProValidations(page, searchCompany);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  });

  test('Exist Syspro Id to Add Customer', async ({ }, testInfo) => {
    let searchCompany = 'Niagara Bottling LLC';
    results = await addCustomerToSyspro(page, searchCompany, 'ZUMMO00');
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  });

  test.describe('Add Customer Permissions', async () => {
    test('Verify View Permissions for Add Customer', async ({ }, testInfo) => {
      results = await addCustomerPermissions(page, 3);
      let testName = testInfo.title;
      await returnResult(page, testName, results);
    });
    test('Verify Edit Permissions for Add Customer', async ({ }, testInfo) => {
      results = await addCustomerPermissions(page, 4);
      let testName = testInfo.title;
      await returnResult(page, testName, results);
    });
  });

  test('Admin Permissions', async ({ }, testInfo) => {
    results = await admin_permissions(page);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  });

  test('Pricing Permissions', async ({ }, testInfo) => {
    results = await pricing_permissions(page);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  });

  test('Inventory Search', async ({ }, testInfo) => {
    results = await inventory_search(page, 'FSD18-251-00-01', stage_url);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  });

  test('Verify validations at Create RMA and Quotes Pages', async ({ }, testInfo) => {
    results = await validationsAtCreateRMAandQuotePages(page);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  });

  test('Create Job and Sales Order From Repair Quotes', async ({ }, testInfo) => {
    //Repairable = 1, Not Repairable = 2, Repairable-Outsource = 3
    let acc_num = 'SKYCA00', cont_name = 'Denny Graham', stock_code = ['5D56091G012', '5D56091G013'];
    let tech = 'Michael Strothers';
    results = await create_job_repairs(page, 'Y', 1, acc_num, cont_name, stock_code, tech);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  })

  test('System Quote Creation with Sales Order and Job', async ({ }, testInfo) => {
    //create system quote
    let acc_num = 'TESTC02', cont_name = 'Test CompanyTwo', stock_code = '331ED01234';
    results = await create_job_quotes(page, 'Y', 'System Quote', acc_num, cont_name, stock_code);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  });

  test('Parts Quote Creation with Sales Order', async ({ }, testInfo) => {
    //create parts quote
    let acc_num = 'HILAN00', cont_name = 'Jeff Lister', stock_code = '331ED012';
    results = await create_job_quotes(page, 'Y', 'Parts Quote', acc_num, cont_name, stock_code);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  })

  test('Create Job Manually', async ({ }, testInfo) => {
    results = await create_job_manually(page, testdata.order_id)
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  })

  test('Create Parts Purchase Manually', async ({ }, testInfo) => {
    results = await create_parts_purchase(page, true, '');
    let testName = testInfo.title;
    await returnResult(page, testName, results[0]);
  })

  test.skip('Pricing Left Menu Vendors Search', async ({ }, testInfo) => {
    results = await leftMenuSearch(page);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  });

  test('Add Discount Code with Validations', async ({ }, testInfo) => {
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

  test.skip('Update products in Pricing', async () => {
    stock_code = await update_sc(page);
  });

  test.skip('multi edit dc', async () => {
    await multi_edit(page, testdata.dc_new);
  });

  test('Verifying Buy Price and Sell Price values at Non SPA', async ({ }, testInfo) => {
    //Buy price value getting from purchase discount on list price
    let items = ['A081004', 'A151506', 'A151804', 'A121606', 'A121204NK'];
    let customer = 'FLOWP00';
    let testName = 'Verifying Buy Price, Sell Price(Type is Markup) and IIDM Cost with buyprice as Purchase Discount';
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
  });

  test.skip('verify filters in pricing', async () => {
    await filters_pricing(page);
  });

  test.skip('verify filters in parts purchase', async () => {
    await parts_purchase_left_menu_filter(page);
  });

  test('POS Reports Lists', async ({ }, testInfo) => {
    results = await pos_report(page);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  });

  test('parts import', async () => {
    await parts_import(page);
  });

  test('first add parts', async () => {
    await add_parts(page, '', '');
  });

  test('second add parts with duplicates', async () => {
    await add_parts(page, 'duplicates', '');
  });

  test('third add parts with all are empty', async () => {
    await add_parts(page, '', 'empty');
  });

  test('verify past repair pricing icons', async () => {
    await past_repair_prices(page);
  });

  test('edit PO partially received', async () => {
    await edit_PO_pp(page);
  });

  test.skip('import pricing two files', async () => {
    //if i pass 'pricing' as second param, pricing file will be imported with append
    //if i pass 'discount code' as second param, discount code file will be imported with append
    //if i pass 'both' as second param, pricing and discount code files will be imported with append
    await import_pricing(page, 'pricing');
  });

  test('add functions validations in admin', async () => {
    await addFunctionInAdminTabs(page);
  });
  test.describe('stock codes characters test', async () => {
    //Inventory
    test('Inventory stock code character limit', async ({ }, testInfo) => {
      results = await verifyingCharacterLenght(page, 'inventory');
      let testName = testInfo.title;
      await returnResult(page, testName, results);
    });
    //Pricing
    test('Pricing stock code character limit', async ({ }, testInfo) => {
      results = await verifyingCharacterLenght(page, 'pricing');
      let testName = testInfo.title;
      await returnResult(page, testName, results);
    });
    //Quotes
    test('Repair Quotes stock code character limit', async ({ }, testInfo) => {
      results = await verifyingCharacterLenght(page, 'quotes', 'Repair Quotes');
      let testName = testInfo.title;
      await returnResult(page, testName, results);
    });

    test('Parts Quotes stock code character limit', async ({ }, testInfo) => {
      results = await verifyingCharacterLenght(page, 'quotes', 'Parts Quotes');
      let testName = testInfo.title;
      await returnResult(page, testName, results);
    });

    test('System Quotes stock code character limit', async ({ }, testInfo) => {
      results = await verifyingCharacterLenght(page, 'quotes', 'System Quotes');
      let testName = testInfo.title;
      await returnResult(page, testName, results);
    });
    //Repairs
    test('Repairs stock code character limit', async ({ }, testInfo) => {
      results = await verifyingCharacterLenght(page, 'repairs');
      let testName = testInfo.title;
      await returnResult(page, testName, results);
    });
    //Repairs
    test('Sales order stock code character limit', async ({ }, testInfo) => {
      results = await verifyingCharacterLenght(page, 'sales_order');
      let testName = testInfo.title;
      await returnResult(page, testName, results);
    });
  });

  test.skip('functional_flow', async () => {
    await functional_flow(page);
  });


  test.skip('get pricing data', async () => {
    await getProductWriteIntoExecl(page);
  });

  test.skip('verifying two excel files data', async () => {
    await verifyTwoExcelData(page);
  });

});