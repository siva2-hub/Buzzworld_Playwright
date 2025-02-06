import test, { expect } from "@playwright/test";
import { addItemsToQuote, addItesms, approve, assignToQC, createRMA, createSO, delay, getRMAItemStatus, itemsAddToEvaluation, login, login_buzz, loginAsClientFromBuzzworld, markAsInProgress, repSummary, selectReactDropdowns, submitForCustomerApprovals, updateQCStatus, wonQuote } from "./helper";
import AllPages from "./PageObjects";
import { allowedNodeEnvironmentFlags } from "process";

let page, pob;
const stage_url = process.env.BASE_URL_BUZZ;
const test_data = {
    customer: 'Multicam Inc',
    accountNumber: 'MULTI00',
    contactName: 'Garret Luppino',
    stockCodes: ['123BACO01920'],
    technician: 'Dan Holmes',
    repairTypes: ['1'], // '1' = Repairable, '2' = Non Repairable, '3' = Outsource Repairable
    vendorName: 'BACO CONTROLS INC',
    vendorCode: 'BACO001'
};
test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
    pob = new AllPages(page);
    await login_buzz(page, stage_url);
});
test('Verify the Due Date label to be Promised Date and Prefill the same', async () => {
    const expText = 'Date Promised';
    //Navigate to Repairs > Receiving
    try {
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
});
test('Verifying Show Line Ship Date in Customer Portal', async () => {
    //Login as specific Client from Buzzworld
    const page1 = await loginAsClientFromBuzzworld(page, test_data.customer, test_data.accountNumber);
    await page1.getByText('Orders', { exact: true }).click();
    // Ensure grid status is visible and interactable
    const gridStatus = page1.locator("//*[@class='ag-react-container']");
    await expect(gridStatus.nth(0)).toBeVisible();
    await gridStatus.nth(0).click();
    // Verify order details
    await expect(page1.locator("//*[text()='Customer Request Date : ']")).toBeVisible();
    try {
        await expect(page1.locator("//*[text()='Line Ship Date : ']").first()).toBeVisible({ timeout: 2400 });
    } catch (error) {
        console.log('Error during the Order verification' + error);
        throw error;
    }
});
test('QC Checklist Internal Used Parts', async () => {
    // Step 1: Create RMA
    await createRMA(page, test_data.accountNumber, test_data.contactName);
    // Step 2: Add items for evaluation
    await itemsAddToEvaluation(page, test_data.stockCodes, test_data.technician, test_data.repairTypes, test_data.vendorCode, test_data.vendorName);
    // Step 3: Add items to quote
    await addItemsToQuote(page);
    // Step 4: Approve the quote
    await approve(page, test_data.contactName);
    // Step 5: Submit for customer approval
    await submitForCustomerApprovals(page);
    // Step 6: Mark the quote as won
    await wonQuote(page);
    // Step 7: Create a Sales Order (SO)
    await createSO(page, test_data.vendorName, true);
    // Step 8: Mark as In Progress
    await markAsInProgress(page);
    // Step 9: Generate Repair Summary
    await repSummary(page);
    // Step 10: Assign to QC
    await assignToQC(page, test_data.technician);
    // Step 11: Update QC Status
    await updateQCStatus(page);
    // Pause for debugging
});