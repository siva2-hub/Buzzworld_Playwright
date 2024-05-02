const { test, expect, page, chromium } = require('@playwright/test');

import { start } from 'repl';
import { timeout } from '../playwright.config';
import { add_dc, add_sc, admin1, admin2, admin3, admin4, create_job_manually, create_job_quotes, create_job_repairs, create_parts_purchase, dcAddUpdate, filters_pricing, functional_flow, import_pricing, inventory_search, leftMenuSearch, login, login_buzz, logout, multi_edit, productAddUpdate, quotesRepairs, setScreenSize, spinner, update_dc, update_sc } from './helper';

const testdata = JSON.parse(JSON.stringify(require("../testdata.json")));
const stage_url = testdata.urls.buzz_stage_url;

test.describe('all tests', async () => {
  let page, dc, stock_code;
  test.setTimeout(520000)
  // To Run the Tests in Serial Order un comment the below line
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await setScreenSize(page);
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
  test('import pricing two files', async () => {
    await import_pricing(page, 'pricing');
  });

  test.skip('functional_flow', async () => {
    await functional_flow(page);
  });

  // test('', async () => {
  //   await page.goto('https://www.staging-buzzworld.iidm.com/jobs');
  //   await expect(page.locator('(//*[contains(@src, "vendor_logo")])[1]')).toBeVisible();
  //   let cs = await page.locator("(//*[contains(@src, 'vendor_logo')])").count();
  //   for (let index = 1; index <= array.length; index++) {
  //     let order_d = await page.locator('//*[@id="myGrid"]/div/div/div[2]/div[2]/div[3]/div[2]/div/div/div[' + cs + ']/div[1]').textContext();
  //     await page.locator("(//*[contains(@src, 'vendor_logo')])[" + cs + "]").click();
  //     await expect(page.getByRole('heading', { name: 'Job Information' })).toBeVisible();
  //     let related_text = await page.locator('(//*[contains(@class, "border-bottom")])').textContext();
  //     if (related_text == 'Unable to relate to quotes, repairs, orders or partpurchase') {
  //       //*[@id="myGrid"]/div/div/div[2]/div[2]/div[3]/div[2]/div/div/div[1]/div[1]
  //       //*[@id="myGrid"]/div/div/div[2]/div[2]/div[3]/div[2]/div/div/div[2]/div[1]
  //       await page.goto('https://www.staging-buzzworld.iidm.com/jobs');
  //       try {
  //         await expect(page.locator('(//*[contains(@text(), ' + order_d + ')])[1]')).toBeVisible({ timeout: 6000 });
  //         await page.locator('(//*[contains(@text(), ' + order_d + ')])[1]').click();
  //         await expect(page.getByRole('heading', { name: 'Sales Order Information' })).toBeVisible();
  //         let related_text = await page.locator('(//*[contains(@class, "border-bottom")])').textContext();
  //         if (related_text == 'Unable to relate to quotes, repairs , jobs or partpurchase') {
  //           console.log('order id ', order_d);
            
  //         } else {

  //         }
  //       } catch (error) {

  //       }
  //     } else {

  //     }
  //   }
  // });
});
