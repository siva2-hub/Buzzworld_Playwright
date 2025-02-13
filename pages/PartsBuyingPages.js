const { expect } = require("@playwright/test");
const { selectReactDropdowns, delay } = require("../tests/helper");

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
const ppIconRepairs = (page) => { return page.locator("(//*[contains(@src,'partspurchase')])[1]"); }
const dateReqFieldLabelAtPartsp = (page) => { return page.getByText('Date Requested') }
const ppItemQtyField = (page) => { return page.getByPlaceholder('Enter Quantity') }
const ppItemCostField = (page) => { return page.getByPlaceholder('Enter Cost') }
const ppItemDescField = (page) => { return page.getByPlaceholder('Enter Description') }
const ppItemSpclNotesField = (page) => { return page.getByPlaceholder('Enter Item Special Notes') }
const ppItemNotesField = (page) => { return page.getByPlaceholder('Enter Item Notes') }
const jobNumField = (page) => { return page.getByLabel('Job Number') }
const vpnFieldText = (page, vpnText) => { return page.getByText(vpnText) }


async function navigateToPartsPurchase(page) {
    await partsPurchaseLink(page).click();
    await expect(allRequestsText(page)).toBeVisible();
}
async function addDataIntoPartsPurchase(page, vendPartNumText) {
    const vendorName = 'ENTERPI SOFTWARE SOLUTIONS';
    await searchVendorField(page).click();
    await page.keyboard.insertText(vendorName);
    await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden();
    await selectReactDropdowns(page, vendorName);
    await nextButton(page).click();
    await vendorPartNumberField(page).fill(vendPartNumText);
    await createButtonAtPartsPurchForm(page).click();
}
async function checkVendorPartNumberAcceptingSpacesOrNot(page, vendPartNumText, is_from_repair) {
    try {
        //verifying is checking vendor part number from repair or parts buyiing module
        if (is_from_repair) {
            //this condition checks from RepairTest
            //navigate to repairs and
            //verify the parts purchase icon is visible or not
            await expect(ppIconRepairs(page)).toBeVisible();
            await ppIconRepairs(page).click(); await delay(page, 2000);
            await expect(dateReqFieldLabelAtPartsp(page).first()).toBeVisible();
        } else {
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
        }; await delay(page, 2000);
        await nextButton(page).click();
        //select vendor
        await addDataIntoPartsPurchase(page, vendPartNumText);
        //verifying validation is displayed or not at item information
        await expect(vendorPartNumErrorValidatin(page)).toBeHidden({ timeout: 2300 });
        console.log('Vendor Part Number field accepting the spaces');
        //close the create parts buying form
        // await closeCreatePartsBuyForm(page).click();
    } catch (error) {
        throw new Error("vendor part number not accepting spaces: " + error);
    }
}
module.exports = {
    checkVendorPartNumberAcceptingSpacesOrNot,
    loadingText,
    //exporting locstors
    ppItemQtyField,
    ppItemCostField,
    ppItemDescField,
    ppItemSpclNotesField,
    ppItemNotesField,
    createButtonAtPartsPurchForm,
    jobNumField,
    vpnFieldText
}