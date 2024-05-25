const { test, expect, page, chromium } = require('@playwright/test');

import { start } from 'repl';
import { timeout } from '../playwright.config';
import { add_dc, add_sc, admin1, admin2, admin3, admin4, api_data, create_job_manually, create_job_quotes, create_job_repairs, create_parts_purchase, dcAddUpdate, fetchData, fetch_jobs_Data, fetch_jobs_Detail, fetch_jobs_list, fetch_orders_Data, fetch_orders_Detail, fetch_order_list, fetch_pp_status, filters_pricing, functional_flow, import_pricing, inventory_search, leftMenuSearch, login, login_buzz, logout, multi_edit, parts_purchase_left_menu_filter, productAddUpdate, quotesRepairs, setScreenSize, spinner, sync_jobs, update_dc, update_sc, pos_report, reports, parts_import, add_parts, past_repair_prices, edit_PO_pp } from './helper';

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
  // let w = 1920, h = 910;
  let w = 1280, h = 551;

  test.beforeAll(async ({ browser }) => {
    // await reports('First Test', 'Passed');
    page = await browser.newPage();
    await setScreenSize(page, w, h);
    await login_buzz(page, stage_url);
  });

  test.skip('login', async () => {
    results = await login(page);
  });

  test.skip('inventory search', async () => {
    await inventory_search(page, 'FSD18-251-00-01', stage_url);
  });

  test('create job and sales order from repair', async () => {
    //Repairable = 1, Not Repairable = 2, Repairable-Outsource = 3
    await create_job_repairs(page, 'Y', 1);
  })

  test('create job and sales order from quote', async () => {
    await create_job_quotes(page, 'Y');
  })

  test.skip('create job manually', async () => {
    await create_job_manually(page)
  })

  test.skip('create parts purchase manually', async () => {
    await create_parts_purchase(page, true, '');
  })

  test.skip('left menu search', async () => {
    await leftMenuSearch(page);
  });

  test.skip('Add Discount Code', async () => {
    dc = await add_dc(page);
  });

  test.skip('Update Discount Code', async () => {
    dc = await update_dc(page);
  });

  test.skip('Add products', async () => {
    stock_code = await add_sc(page, testdata.dc_new);
  });

  test.skip('Update products', async () => {
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

  test.skip('pos reports list', async () => {
    await pos_report(page);
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

  test.skip('functional_flow', async () => {
    await functional_flow(page);
  });

});