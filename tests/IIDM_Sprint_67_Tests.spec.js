import test, { expect } from "@playwright/test";
import { delay, getRMAItemStatus, login, login_buzz, selectReactDropdowns } from "./helper";
import AllPages from "./PageObjects";
import { allowedNodeEnvironmentFlags } from "process";

let page, pob;
const stage_url = process.env.BASE_URL_BUZZ;
test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
    pob = new AllPages(page);
    await login_buzz(page, stage_url);
});
test('Verify the Due Date label to be Promised Date and Prefill the same', async () => {
    const expText = 'Date Promised';
    await page.getByText('Repairs').click();
    await page.locator('#root').getByText('Receiving').click();
    await expect(pob.profileIconListView).toBeVisible();
    await pob.profileIconListView.click();
    await expect(pob.serialNumaberLabel.first()).toBeVisible();
    const actText = await pob.datePromisedLabel.textContent();
    // const actText = 'Promised Date';
    if (actText === expText) {
        console.log('labels are matched');
        console.log('displaying label: ' + actText + ' expecetd label: ' + expText);
        const datePromisedValue = await getRMAItemStatus(page);
        console.log('before update date promised value: ' + await datePromisedValue.textContent());
        let dateValue = await page.locator("//*[contains(@class,'control')]").nth(3).textContent();
        if (dateValue === 'MM/DD/YYYY') {
            await page.locator("//*[contains(@class,'control')]").nth(3).click();
            await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter');
            dateValue = await page.locator("//*[contains(@class,'control')]").nth(3).textContent();
            await page.locator("//*[@name='serial_number']").fill('SN9378945');
            await page.locator("//*[text()='Save']").click(); await delay(page, 2000);
        } else {
            dateValue = await page.locator("//*[contains(@class,'control')]").nth(3).textContent();
            await page.locator("//*[@title='close']").click();
        }
        const expDatePromisedValue = dateValue.replaceAll('/', '-');
        const actDatePromisedValue = await datePromisedValue.textContent()
        console.log('after update date promised value: ' + actDatePromisedValue);
        if (expDatePromisedValue === actDatePromisedValue) {
            console.log('date promised value macthed...');
            console.log('actual Date Promised: ' + actDatePromisedValue + ' expected Date Promised: ' + expDatePromisedValue);
        } else {
            console.log('date promised value not macthed...');
            console.log('actual Date Promised: ' + actDatePromisedValue + ' expected Date Promised: ' + expDatePromisedValue);
        }
    } else {
        console.log("labels are't matched");
        console.log('displaying label: ' + actText + ' expecetd label: ' + expText);
    }
});
test('Verifying Show Line Ship Date in Customer Portal', async () => {
    let customer = 'Multicam Inc', actNum = 'MULTI00';
    await page.getByRole('button', { name: 'loading' }).click();
    await page.getByRole('menuitem', { name: 'Login as Client' }).click();
    await page.getByLabel('Organization*').fill(customer);
    await expect(pob.loading).toBeVisible(); await expect(pob.loading).toBeHidden();
    await selectReactDropdowns(page, (customer + actNum));
    const page1Promise = page.waitForEvent('popup');
    await page.getByText('Login', { exact: true }).click();
    const page1 = await page1Promise;
    await page1.getByText('Orders', { exact: true }).click();
    // await delay(page1, 5000);
    const gridStatus = page1.locator("//*[@class='ag-react-container']");;
    await expect(gridStatus.nth(0)).toBeVisible();
    await gridStatus.nth(0).click();
    await expect(page1.locator("//*[text()='Customer Request Date : ']")).toBeVisible();
    await expect(page1.locator("//*[text()='Line Ship Date : ']").first()).toBeVisible({ timeout: 2400 });
});