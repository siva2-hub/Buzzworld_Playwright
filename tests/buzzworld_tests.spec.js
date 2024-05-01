const { test, expect, page, chromium } = require('@playwright/test');
import { start } from 'repl';
import { timeout } from '../playwright.config';
import { add_dc, add_sc, admin1, admin2, admin3, admin4, create_job_manually, create_job_quotes, create_job_repairs, create_parts_purchase, dcAddUpdate, functional_flow, import_pricing, inventory_search, leftMenuSearch, login, login_buzz, logout, multi_edit, productAddUpdate, quotesRepairs, spinner, update_dc, update_sc } from './helper'
const testdata = JSON.parse(JSON.stringify(require("../testdata.json")))

const stage_url = testdata.urls.buzz_stage_url;

test.describe('all tests', async () => {
  let page, dc, stock_code;
  test.setTimeout(520000)
  // To Run the Tests in Serial Order un comment the below line
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({
      width: 1920,
      height: 910
      // width: 1280,
      // height: 551
    });
    await login_buzz(page, stage_url);
    // console.log("beforeAll test is executed");
  });

  test('login', async () => {
    await login(page);
  });

  test('inventory search', async () => {
    await inventory_search(page, 'FSD18-251-00-01');
  });

  test('create job and sales order from repair', async () => {
    //Repairable, Not Repairable, Repairable-Outsource
    await create_job_repairs(page, 'Y', 2);
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

  test('import pricing two files', async () => {
    await import_pricing(page);
  });

  // test('functional_flow', async () => {
  //   await functional_flow(page);
  // });

});
