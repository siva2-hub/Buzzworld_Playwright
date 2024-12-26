const { test, expect, errors } = require("@playwright/test");
const { login_buzz } = require("./helper");

const stage_url = process.env.BASE_URL_BUZZ;
const date = new Date().toDateString(); let results = false;
const currentDate = new Date(date);
const day = currentDate.getDate();
const previuosMonth = currentDate.getMonth();
const year = currentDate.getFullYear();
let page, context;
test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  page = await context.newPage()
  await login_buzz(page, stage_url);
});

test("POS reports prefil previous month and current", async () => {
  await page.getByRole('button', { name: 'Reports expand' }).click();
  await page.getByRole('menuitem', { name: 'Point of Sales' }).click();
  await expect(page.getByText('Select Report')).toBeVisible();
  const actualMonth = await page.textContent("(//*[contains(@class,'react-select__control')])[1]");
  const actualYear = await page.textContent("(//*[contains(@class,'react-select__control')])[2]");
  if (previuosMonth === 1) {
    if (actualMonth === 12 && actualYear === (year - 1)) {
      results = true;
    } else {
      results = false;
    }
  } else {
    if (previuosMonth === actualMonth && year === actualYear) {
      results = true;
    } else {
      results = false;
    }
  }
  console.log('expected month: ' + previuosMonth + ' actual month: ' + actualMonth);
  console.log('expected year: ' + year + ' actual year: ' + actualYear);
  if (results) { } else { throw errors }
});
test("display the project name at send to customer page", async () => {
  const urlPath = 'all_quotes/a18057a7-04aa-426a-a494-7c76e0a243a5';
  await page.goto(stage_url + urlPath);
  let iidmCost = 0;
  await expect(page.locator("(//*[text()='IIDM Cost:'])[1]")).toBeVisible();
  const iCost = await page.locator('//*[@id="repair-items"]/div[2]/div[1]/div/div/div[2]/div[3]/div[3]/h4');
  console.log("count is: " + await iCost.count());
  for (let index = 0; index < await iCost.count(); index++) {
    let ic = await iCost.nth(index).textContent();
    iidmCost = iidmCost + (ic.replace("$", "")).replace(",","");
  }
  console.log(iidmCost);
  await page.pause();
});
test("Revice the old version also", async () => {

});
test("display the GP for grand total", async () => {

});
test("need to able to type start date and end dates at non spa", async () => {
  const startDate = (previuosMonth + 1) + '/' + day + '/' + year;
  const endDate = (previuosMonth + 1) + '/' + day + '/' + (year + 1);
  await page.getByRole('button', { name: 'Pricing expand' }).click();
  await page.getByRole('menuitem', { name: 'Non Standard Pricing' }).click();
  const configureButton = page.getByRole('button', { name: 'Configure' });
  await expect(configureButton).toBeVisible();
  await configureButton.click();
  await page.getByPlaceholder('MM/DD/YYYY-MM/DD/YYYY').fill(startDate + '-' + endDate);
  await page.locator("//*[contains(@class,'day--0" + (day) + "')]")
  await page.pause();
});