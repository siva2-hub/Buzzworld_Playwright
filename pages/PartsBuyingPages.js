const { expect } = require("@playwright/test");
const { selectReactDropdowns } = require("../tests/helper");
const { navigateToRepairInProgressTab } = require("./RepairPages");

const partsPurchaseLink = (page) => { return page.getByText('Parts Purchase') }
const allRequestsText = (page) => { return page.getByText('All Requests') };
const createPartsPurchaseButton = (page) => { return page.getByText('Create Parts Purchase') }
const nextButton = (page) => { return page.getByRole('button', { name: 'Next', exact: true }) }
const searchVendorField = (page) => { return page.getByText('Search Vendor') }
const vendorPartNumberField = (page) => { return page.getByPlaceholder('Enter Vendor Part Number') }
const loadingText = (page) => { return page.locator("//*[text()='Loading...']"); }
const selectTechnicianField = (page) => { return page.getByText('Select Technician') }
const textInsideDateReuqested = (page) => { return page.locator("(//*[contains(@class,'singleValue')])[2]") }
const dateRequestedField = (page) => { return page.getByText('Select Date Requested') }
const urgencyField = (page) => { return page.getByText('Select Urgency') }
const vendorPartNumErrorValidatin = (page) => { return page.locator("//*[text()='Vendor Part Number not valid']") }
const closeCreatePartsBuyForm = (page) => { return page.getByTitle('close').getByRole('img') }
const createButtonAtPartsPurchForm = (page) => { return page.locator("//*[@id='tab-2-tab']/div/div/button") }


async function navigateToPartsPurchase(page) {
    await partsPurchaseLink(page).click();
    await expect(allRequestsText(page)).toBeVisible();
}
async function addDataIntoPartsPurchase(page, vendPartNumText) {
    const vendorName = 'ENTERPI SOFTWARE SOLUTIONS';
    await nextButton(page).click();
    await searchVendorField(page).click();
    await page.keyboard.insertText(vendorName);
    await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden();
    await selectReactDropdowns(page, vendorName);
    await nextButton(page).click();
    await vendorPartNumberField(page).fill(vendPartNumText);
    await createButtonAtPartsPurchForm(page).click();
}
async function checkVendorPartNumberAcceptingSpacesOrNot(page, vendPartNumText) {
    try {
        //Navigate to Parts Purchase Page
        await navigateToPartsPurchase(page);
        //click on create Parts Purchase button
        await createPartsPurchaseButton(page).click();
        //select the technician field
        await selectTechnicianField(page).click();
        await page.keyboard.press('Enter');
        //Verifying Date Requested field is prefilled or not with current date
        try {
            await expect(textInsideDateReuqested(page)).toBeVisible({ timeout: 2000 });
        } catch (error) {
            await dateRequestedField(page).click();
            await page.keyboard.press('ArrowRight');
            await page.keyboard.press('Enter');
            await page.keyboard.press('ArrowLeft');
        }
        //click on the urgnecy field
        await urgencyField(page).click();
        //select the Urgency what ever required
        await selectReactDropdowns(page, 'Standard');
        //fill the required data click on save date waiting for validation
        await addDataIntoPartsPurchase(page, vendPartNumText);
        //verifying validation is displayed or not
        await expect(vendorPartNumErrorValidatin(page)).toBeHidden({ timeout: 2300 });
        //close the create parts buying form
        await closeCreatePartsBuyForm(page).click();
        //navigate to repairs and
        //read store the parts purchase icon at repairs details view
        const partsPurchaseIcon = await navigateToRepairInProgressTab(page);
        //verify the parts purchase icon is visible or not
        await expect(partsPurchaseIcon).toBeVisible();
        await partsPurchaseIcon.click();
        await addDataIntoPartsPurchase(page, vendPartNumText);
    } catch (error) {
        throw new Error("vendor part number not accepting spaces: " + error);
    }
}
module.exports = {
    checkVendorPartNumberAcceptingSpacesOrNot,
    loadingText
}