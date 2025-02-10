const { expect } = require("@playwright/test")
const { customerIconAtGrid } = require("./QuotesPage")
const { getRMAItemStatus } = require("../tests/helper")

const repairsLink = (page) => { return page.getByText('Repairs') }
const receivingLink = (page) => { return page.locator('#root').getByText('Receiving') }
const repairInProgressLink = (page) => { return page.locator('#root').getByText('Repair in progress') }
const horzScrollView = (page) => { return page.locator("//*[@class='ag-body-horizontal-scroll-viewport']"); }
const horzScrollToRight = (page) => { return page.locator("//*[@class='ag-horizontal-right-spacer ag-scroller-corner']"); }
const inProgressStatus = (page) => { return page.locator("(//*[text()='In Progress'])[1]") }
const ppIconRepairs = (page) => { return page.locator("(//*[contains(@src,'partspurchase')])[1]"); }
const serialNumaberLabel = (page) => { return page.locator("//*[text()='Serial No:']"); }
const datePromisedLabel = (page) => { return page.locator("//*[@id='repair-items']/div[2]/div[1]/div/div[2]/div[4]/div[3]/span"); }
const promisedDateField = (page) => { return page.locator("//*[contains(@class,'control')]") }
const serialNumField = (page) => { return page.locator("//*[@name='serial_number']") }
const saveAtRepItemEdit = (page) => { return page.locator("//*[text()='Save']") }
const closeAtRepItemEdit = (page) => { return page.locator("//*[@title='close']") }

async function naviagateToRepairs(page) {
    await repairsLink(page).click();
    await expect(customerIconAtGrid(page)).toBeVisible();
}
async function navigateToRepairInProgressTab(page) {
    await naviagateToRepairs(page);
    await repairInProgressLink(page).click();
    try {
        await expect(inProgressStatus(page)).toBeVisible({ timeout: 2000 })
    } catch (error) {
        await horzScrollView(page).dragTo(horzScrollToRight(page));
    }
    await inProgressStatus(page).click();
    const partsPurchaseIcon = ppIconRepairs(page);
    return partsPurchaseIcon;
}
async function checkDueLabelChangeToPromisedDate(page, expText) {
    try {
        //navigate to repairs
        await repairsLink(page).click();
        //go to receiving tab
        await receivingLink(page).click();
        //checking customer icon displaying or not
        await expect(customerIconAtGrid(page)).toBeVisible();
        //click on customer icon
        await customerIconAtGrid(page).click();
        //checking serial number text displaying or not
        await expect(serialNumaberLabel(page).first()).toBeVisible();
        //retreiving the Date Promised text displaying or not
        const actText = await datePromisedLabel(page).textContent();
        // const actText = 'Promised Date';
        if (actText === expText) {
            console.log('labels are matched');
            console.log('displaying label: ' + actText + ' expecetd label: ' + expText);
            const datePromisedValue = await getRMAItemStatus(page);
            console.log('before update date promised value: ' + await datePromisedValue.textContent());
            let dateValue = await promisedDateField(page).nth(3).textContent();
            if (dateValue === 'MM/DD/YYYY') {
                // await page.locator("//*[contains(@class,'control')]").nth(3).click();
                await promisedDateField(page).nth(3).click();
                await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter');
                dateValue = await promisedDateField(page).nth(3).textContent();
                await serialNumField(page).fill('SN9378945');
                await saveAtRepItemEdit(page).click(); await delay(page, 2000);
            } else {
                dateValue = await promisedDateField(page).nth(3).textContent();
                await closeAtRepItemEdit(page).click();
            }
            // Convert expected format for comparison
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
    } catch (error) {
        throw new Error("getting error during, during verifying the Promised Date" + error);
    }
}
module.exports = {
    navigateToRepairInProgressTab,
    checkDueLabelChangeToPromisedDate
}