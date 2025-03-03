const { expect } = require("@playwright/test");
import { selectReactDropdowns, delay } from '../tests/helper';

export const partsPurchaseLink = (page) => { return page.getByText('Parts Purchase') }
export const allRequestsText = (page) => { return page.getByText('All Requests') };
export const createPartsPurchaseButton = (page) => { return page.getByText('Create Parts Purchase') }
export const nextButton = (page) => { return page.getByRole('button', { name: 'Next', exact: true }) }
export const searchVendorField = (page) => { return page.getByText('Search Vendor') }
export const vendorPartNumberField = (page) => { return page.getByPlaceholder('Enter Vendor Part Number') }
export const loadingText = (page) => { return page.locator("//*[text()='Loading...']"); }
export const selectTechnicianField = (page) => { return page.getByText('Select Technician') }
export const textInsideDateReuqested = (page) => { return page.locator("(//*[contains(@class,'singleValue')])[2]") }
export const dateRequestedField = (page) => { return page.getByText('Select Date Requested') }
export const urgencyField = (page) => { return page.getByText('Select Urgency') }
export const vendorPartNumErrorValidatin = (page) => { return page.locator("//*[text()='Vendor Part Number not valid']") }
export const closeCreatePartsBuyForm = (page) => { return page.getByTitle('close').getByRole('img') }
export const createButtonAtPartsPurchForm = (page) => { return page.locator("//*[@id='tab-2-tab']/div/div/button") }
export const ppIconRepairs = (page) => { return page.locator("(//*[contains(@src,'partspurchase')])[1]"); }
export const dateReqFieldLabelAtPartsp = (page) => { return page.getByText('Date Requested') }
export const ppItemQtyField = (page) => { return page.getByPlaceholder('Enter Quantity') }
export const ppItemCostField = (page) => { return page.getByPlaceholder('Enter Cost') }
export const ppItemDescField = (page) => { return page.getByPlaceholder('Enter Description') }
export const ppItemSpclNotesField = (page) => { return page.getByPlaceholder('Enter Item Special Notes') }
export const ppItemNotesField = (page) => { return page.getByPlaceholder('Enter Item Notes') }
export const jobNumField = (page) => { return page.getByLabel('Job Number') }
export const vpnFieldText = (page, vpnText) => { return page.getByText(vpnText) }
export const partsBuyStatusEdit = (page, vpnText) => { return page.locator("(//*[name()='svg'])[8]") }
export const submitButtonAtItemInfo = (page) => { return page.locator("//span[normalize-space()='Submit']") }
export const statusUpdateConfPopUp = (page) => { return page.getByText('Status Changed Successfully') }
export const reactFirstDropdown = (page) => { return page.getByLabel('open') }
export const rTickIcon = (page) => { return page.getByTitle('Save Changes') }

export async function navigateToPartsPurchase(page) {
    await partsPurchaseLink(page).click();
    await expect(allRequestsText(page)).toBeVisible();
}
export async function addDataIntoPartsPurchase(page, vendPartNumText) {
    const vendorName = 'ENTERPI SOFTWARE SOLUTIONS';
    await searchVendorField(page).click();
    await page.keyboard.insertText(vendorName);
    await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden();
    await selectReactDropdowns(page, vendorName);
    await nextButton(page).click();
    await vendorPartNumberField(page).fill(vendPartNumText);
    await createButtonAtPartsPurchForm(page).click();
}
export async function checkVendorPartNumberAcceptingSpacesOrNot(page, vendPartNumText, is_from_repair) {
    try {
        //verifying is checking vendor part number from repair or parts buyiing module
        if (is_from_repair) {
            //this condition checks from RepairTest
            //navigate to repairs and
            //verify the parts purchase icon is visible or not
            await expect(ppIconRepairs(page)).toBeVisible();
            await ppIconRepairs(page).click(); await page.waitForTimeout(2000);
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
        }; await page.waitForTimeout(2000);
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
export async function changePartsPurchaseStatus(page, statusText) {
    await partsBuyStatusEdit(page).click();
    await reactFirstDropdown(page).click();
    await selectReactDropdowns(page, statusText);
    await rTickIcon(page).click();
}
export async function changePartsPurchaseStatusToPartiallyReceived(page) {
    await changePartsPurchaseStatus(page, 'Ordered');
    await expect(statusUpdateConfPopUp(page)).toBeVisible();
    await changePartsPurchaseStatus(page, 'Partially Received');
    await expect(submitButtonAtItemInfo(page)).toBeVisible();
    await submitButtonAtItemInfo(page).click();
    await expect(statusUpdateConfPopUp(page)).toBeVisible();
    console.log('Parts purchase status has changed to Ordered, Partially received');
}
// module.exports = {
//     checkVendorPartNumberAcceptingSpacesOrNot,
//     changePartsPurchaseStatus,
//     changePartsPurchaseStatusToPartiallyReceived,
//     //exporting locstors
//     loadingText,
//     ppItemQtyField,
//     ppItemCostField,
//     ppItemDescField,
//     ppItemSpclNotesField,
//     ppItemNotesField,
//     createButtonAtPartsPurchForm,
//     jobNumField,
//     vpnFieldText

// }