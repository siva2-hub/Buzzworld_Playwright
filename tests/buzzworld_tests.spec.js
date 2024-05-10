const { test, expect, page, chromium } = require('@playwright/test');

import { start } from 'repl';
import { timeout } from '../playwright.config';
import { add_dc, add_sc, admin1, admin2, admin3, admin4, api_data, create_job_manually, create_job_quotes, create_job_repairs, create_parts_purchase, dcAddUpdate, fetchData, fetch_jobs_Data, fetch_jobs_Detail, fetch_jobs_list, fetch_orders_Data, fetch_orders_Detail, fetch_order_list, fetch_pp_status, filters_pricing, functional_flow, import_pricing, inventory_search, leftMenuSearch, login, login_buzz, logout, multi_edit, parts_purchase_left_menu_filter, productAddUpdate, quotesRepairs, setScreenSize, spinner, sync_jobs, update_dc, update_sc, pos_report } from './helper';

const testdata = JSON.parse(JSON.stringify(require("../testdata.json")));
const stage_url = testdata.urls.buzz_stage_url;
test.skip('sync jobs', async ({ page }) => {
  test.setTimeout(990000000);
  await sync_jobs(page);

});
test.describe('all tests', async () => {
  let page, dc, stock_code;
  // To Run the Tests in Serial Order un comment the below line
  test.describe.configure({ mode: 'serial' });
  // let w = 1920, h = 910;
  let w = 1280, h = 551;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await setScreenSize(page, w, h);
    await login_buzz(page, stage_url);
  });

  test('login', async () => {
    await login(page);
  });

  test('inventory search', async () => {
    await inventory_search(page, 'FSD18-251-00-01', stage_url);
  });

  test('create job and sales order from repair', async () => {
    //Repairable = 1, Not Repairable = 2, Repairable-Outsource = 3
    await create_job_repairs(page, 'Y', 1);
  })

  test('create job and sales order from quote', async () => {
    await create_job_quotes(page, 'Y');
  })

  test('create job manually', async () => {
    await create_job_manually(page)
  })

  test('create parts purchase manually', async () => {
    await create_parts_purchase(page, true, '');
  })

  test('left menu search', async () => {
    await leftMenuSearch(page);
  });

  test('Add Discount Code', async () => {
    dc = await add_dc(page);
  });

  test('Update Discount Code', async () => {
    dc = await update_dc(page);
  });

  test('Add products', async () => {
    stock_code = await add_sc(page, testdata.dc_new);
  });

  test('Update products', async () => {
    stock_code = await update_sc(page);
  });

  test('multi edit dc', async () => {
    await multi_edit(page, testdata.dc_new);
  });

  test('verify filters in pricing', async () => {
    await filters_pricing(page);
  });

  test('verify filters in parts purchase', async () => {
    await parts_purchase_left_menu_filter(page);
  });
  test('pos reports list', async () => {
    await pos_report(page);
  });
  test('import pricing two files', async () => {
    //if i pass 'pricing' as second param, pricing file will be imported with append
    //if i pass 'discount code' as second param, discount code file will be imported with append
    //if i pass 'both' as second param, pricing and discount code files will be imported with append
    await import_pricing(page, 'pricing');
  });

  test('functional_flow', async () => {
    await functional_flow(page);
  });
});