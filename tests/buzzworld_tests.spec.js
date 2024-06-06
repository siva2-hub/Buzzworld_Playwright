const { test, expect, page, chromium } = require('@playwright/test');
const ExcelJS = require('exceljs');
import { start } from 'repl';
import { timeout } from '../playwright.config';
import { add_dc, add_sc, admin1, admin2, admin3, admin4, api_data, create_job_manually, create_job_quotes, create_job_repairs, create_parts_purchase, dcAddUpdate, fetchData, fetch_jobs_Data, fetch_jobs_Detail, fetch_jobs_list, fetch_orders_Data, fetch_orders_Detail, fetch_order_list, fetch_pp_status, filters_pricing, functional_flow, import_pricing, inventory_search, leftMenuSearch, login, login_buzz, logout, multi_edit, parts_purchase_left_menu_filter, productAddUpdate, quotesRepairs, setScreenSize, spinner, sync_jobs, update_dc, update_sc, pos_report, reports, parts_import, add_parts, past_repair_prices, edit_PO_pp, returnResult, admin_permissions, pricing_permissions, addDiscountCodeValidations, addFunctionInAdminTabs, getProductWriteIntoExecl, verifyTwoExcelData } from './helper';

const testdata = JSON.parse(JSON.stringify(require("../testdata.json")));
const stage_url = testdata.urls.buzz_stage_url;
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

  test('Create Job and Sales Order From Repair Quotes', async ({ }, testInfo) => {
    //Repairable = 1, Not Repairable = 2, Repairable-Outsource = 3
    results = await create_job_repairs(page, 'Y', 1);
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  })

  test('System Quote Creation with Sales Order and Job', async ({ }, testInfo) => {
    //create system quote
    results = await create_job_quotes(page, 'Y', 'System Quote');
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  });

  test('Parts Quote Creation with Sales Order', async ({ }, testInfo) => {
    //create parts quote
    results = await create_job_quotes(page, 'Y', 'Parts Quote');
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  })

  test.skip('Create Job Manually', async ({ }, testInfo) => {
    results = await create_job_manually(page)
    let testName = testInfo.title;
    await returnResult(page, testName, results);
  })

  test.skip('Create Parts Purchase Manually', async ({ }, testInfo) => {
    results = await create_parts_purchase(page, true, '');
    let testName = testInfo.title;
    await returnResult(page, testName, results);
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

  test('add functions in admin', async () => {
    await addFunctionInAdminTabs(page);
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