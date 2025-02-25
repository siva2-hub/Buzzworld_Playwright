const { expect } = require("@playwright/test")
const { customerIconAtGrid, companyField, reactFirstDropdown, addItemsBtn, partsSeach, partNumberField, partDescription, quoteOrRMANumber, rTickIcon, clickOnRelatedIds, saveButton, createSOBtn, gpLabel } = require("./QuotesPage")
const { getRMAItemStatus, selectReactDropdowns, spinner, approve, createSO, wonQuote, submitForCustomerApprovals, defaultTurnAroundTime, delay } = require("../tests/helper")
const { checkVendorPartNumberAcceptingSpacesOrNot, ppItemQtyField, ppItemCostField, ppItemDescField, ppItemSpclNotesField, ppItemNotesField, createButtonAtPartsPurchForm, jobNumField, vpnFieldText, loadingText } = require("./PartsBuyingPages")
const { testData } = require("./TestData")
const { error } = require("console")

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
const serialNumField = (page) => { return page.locator("//*[contains(@name,'serial_')]") }
const saveAtRepItemEdit = (page) => { return page.locator("//*[text()='Save']") }
const closeAtRepItemEdit = (page) => { return page.locator("//*[@title='close']") }
const createRMABtn = (page) => { return page.getByText('Create RMA') }
const createBtnAtRMA = (page) => { return page.getByRole('button', { name: 'Create', exact: true }) }
const clickHereToAddThemBtn = (page) => { return page.locator('//*[text() = "? Click here to add them"]') }
const fisrtSeachCheckBox = (page) => { return page.locator("//*[contains(@class,'data repair_grid')]/div/div/label") }
const addSelectedPartBtn = (page) => { return page.getByRole('button', { name: 'Add Selected 1 Parts' }) }
const assignLocation = (page) => { return page.getByText('Assign Location') }
const mfgField = (page) => { return page.getByLabel('Manufacturer*') }
const addNewPartBtn = (page) => { return page.getByRole('button', { name: 'Add New Part' }) }
const serNumEdit = (page) => { return page.locator("//span[@title='Edit']//*[name()='svg']") }
const strgLocation = (page) => { return page.getByPlaceholder('Storage Location') }
const irnlItemNotesField = (page) => { return page.getByPlaceholder('Type here') }
const updLocationBtn = (page) => { return page.getByRole('button', { name: 'Update Location' }) }
const assignTechBtn = (page) => { return page.getByText('Assign Technician') }
const assignButton = (page) => { return page.getByRole('button', { name: 'Assign' }) }
const evaluateItemBtn = (page) => { return page.getByText('Evaluate Item') }
const estimatedRepHrs = (page) => { return page.getByPlaceholder('Estimated Repair Hrs') }
const estimatedPartsCost = (page) => { return page.getByPlaceholder('Estimated Parts Cost') }
const techSuggPrice = (page) => { return page.getByPlaceholder('Technician Suggested Price') }
const repTypeRadioBtn = (page, repair_type) => { return page.locator("(//*[@class = 'radio'])[" + repair_type + "]") }
const summaryField = (page) => { return page.getByText('Select') }
const updtEvaluationBtn = (page) => { return page.getByRole('button', { name: 'Update Evaluation' }) }
const pendingQuoteStatus = (page) => { return page.getByText('Pending Quote') }
const repItemCheckbox = (page) => { return page.locator('#repair-items label') }
const addItemsToQuoteBtn = (page) => { return page.getByRole('button', { name: 'Add items to quote' }) }
const addItemsToQuoteConfPopUp = (page) => { return page.getByText('Are you sure you want to add these item(s) to quote ?') }
const acceptButton = (page) => { return page.getByRole('button', { name: 'Accept' }) }
const quoteItemsIsVisible = (page) => { expect(page.locator('#repair-items')).toContainText('Quote Items') }
const repLinkAtJobDetls = (page) => { return page.locator("(//*[contains(@class,'border-bottom')])/div/div[1]") }
const markAsInProgressBtn = (page) => { return page.getByText('Mark as In Progress') }
const repInProgresConfPopUp = (page) => { expect(page.locator('#root')).toContainText('Are you sure you want to move this item to Repair In Progress?') }
const mfgFieldAtPp = (page) => { return page.getByText('Search Manufacturer') }
const poInfoText = (page) => { return page.getByText('Purchase Order Information') }
const assignToQCButton = (page) => { return page.getByText('Assign to QC') }
const repSummaryField = (page) => { return page.locator("//*[contains(@src, 'repair_summary')]") }
const repSummaryData = async (page, summaryData) => {
    console.log('summary data count: ' + summaryData.length);
    for (let index = 0; index < summaryData.length; index++) {
        await page.getByText(summaryData[index], { exact: true }).click();
    }
}
const repSummaryNotes = (page) => { return page.getByPlaceholder('Enter Repair Summary Notes') }
const updateSuccMsg = (page) => { return page.getByText('Updated Successfully') };
const assignQCLabel = (page) => { return page.getByText('Assign QC') }
const pendingQCText = (page) => { return page.getByText('Pending QC') }
const qcCheckListIcon = (page) => { return page.locator("//*[contains(@src,'qc_checklist')]") }
const partsNotesQC = (page) => { return page.locator('textarea[name="part_notes"]') }
const qcComments = (page) => { return page.locator('textarea[name="qc_comments"]') }
const penInvoiceStatus = (page) => { return page.getByText('Pending Invoice') }
const intrnlUsedParts = (page) => { return page.getByText('Internal Used Parts') }
const selectSupplier = async (page, supplCode, supplName) => {
    await page.getByText('Search').click();
    await page.keyboard.insertText(supplCode);
    await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden();
    await selectReactDropdowns(page, supplName + supplCode);
}
const intrnlUsedPartsDesc = (page) => { return page.locator('textarea[name="internal_parts\\.0\\.part_description"]') }
const intrnlUsedPartsNum = (page) => { return page.getByPlaceholder('Enter Part Number') }
const addNewRowIntrnlUsedPart = (page) => { return page.locator("//p[@class='add-row-text']") }
const newPartUsedPartNumberValns = (page) => { return page.getByText('Please enter Part Number') }
const qcFailedStatus = (page) => { return page.getByText('QC Failed') }
const repItemStatus = (page) => { return page.locator('//*[@id="repair-items"]/div[2]/div/div/div[2]/div[5]/h4') }
const pendingQCConfText = (page) => { return page.getByText('Are you sure you want to move this status to Pending QC') }
const repItemEditIcon = (page) => { return page.locator("//*[contains(@src,'themecolorEdit')]") }
const lineShipDateAtSO = (page) => { return page.locator("//*[@title='Line Ship Date']") }
const custReqDateAtSO = (page) => { return page.locator("//*[@title='Customer Request Date']") }
const poNumAtSOScr = (page) => { return page.getByPlaceholder('Enter PO Number'); }

async function naviagateToRepairs(page) {
    await repairsLink(page).click();
    await expect(customerIconAtGrid(page)).toBeVisible();
}
async function createRepair(page, acc_num, cont_name) {
    try {
        await naviagateToRepairs(page);
        // await page.goto('https://www.staging-buzzworld.iidm.com/parts-purchase-detail-view/e81fca37-f0e2-4e3d-b058-33d3fcd89b0a')
        await createRMABtn(page).click();
        await expect(companyField(page)).toBeVisible();
        await companyField(page).fill(acc_num);
        await expect(page.getByText(acc_num, { exact: true }).nth(1)).toBeVisible();
        await page.getByText(acc_num, { exact: true }).nth(1).click();
        await reactFirstDropdown(page).nth(2).click();
        await page.keyboard.insertText(cont_name);
        await selectReactDropdowns(page, cont_name); //await page.pause();
        await createBtnAtRMA(page).click();
        await expect(quoteOrRMANumber(page)).toBeVisible();
        const rmaNumber = await quoteOrRMANumber(page).textContent();
        console.log('RMA: ' + rmaNumber);
        return rmaNumber.replace('#', '');
    } catch (error) {
        throw new Error("getting error while creating repair" + error)
    }
}
async function addItemsToRepairs(page, vendorName, vendorCode, stock_code, partDesc, serialNum) {
    for (let index = 0; index < stock_code.length; index++) {
        await addItemsBtn(page).click();
        await partsSeach(page).fill(stock_code[index]);
        await spinner(page)
        let res = false;
        try {
            await expect(clickHereToAddThemBtn(page)).toBeVisible({ timeout: 4000 });
            res = true;
        } catch (error) { res = false; }
        if (res) {
            //Add New Part
            await addNewPart(page, stock_code[index], vendorCode, vendorName, partDesc, serialNum);
        } else {
            await fisrtSeachCheckBox(page).click();// await page.pause();
            await addSelectedPartBtn(page).click();
        }
        // Assign Location
        await expect(assignLocation(page).first()).toBeVisible();
    }
}
async function addNewPart(page, stock_code, vendorCode, vendorName, partDesc, serialNum) {
    await clickHereToAddThemBtn(page).click();
    await expect(partNumberField(page)).toBeVisible();
    await partNumberField(page).fill(stock_code);
    await reactFirstDropdown(page).click();
    await mfgField(page).fill(vendorCode);
    // await this.delay(2000);
    try {
        await page.getByText(vendorName).first().click({ timeout: 4000 });
    } catch (error) { }
    await serialNumField(page).fill(serialNum);
    await partDescription(page).fill(partDesc); //await page.pause();
    await addNewPartBtn(page).click();
}
async function assignLocationFun(page, serialNum, storageLocation, internalItemNotes) {
    assignLocation(page).first().click();
    await serNumEdit(page).click();
    if (await serialNumField(page).getAttribute('value') === '') {
        await serialNumField(page).fill(serialNum);
        await rTickIcon(page).click();
    }
    await strgLocation(page).fill(storageLocation);
    await irnlItemNotesField(page).fill(internalItemNotes);
    await updLocationBtn(page).click();
    //verify Assign Technician is visible or not
    await expect(assignTechBtn(page).first()).toBeVisible()
    console.log('Location Assigned');
}
async function assignTech(page, tech, internalItemNotes) {
    await assignTechBtn(page).click();
    await reactFirstDropdown(page).click();
    await page.keyboard.insertText(tech);
    await page.keyboard.press('Enter');
    await irnlItemNotesField(page).fill(internalItemNotes);
    await assignButton(page).click();
    //verify Evaluate Item button is visible or not
    await expect(evaluateItemBtn(page).first()).toBeVisible();
    console.log('Technician Assigned');
}
async function itemEvaluation(page, repairType, techSuggestedPrice, internalItemNotes) {
    await evaluateItemBtn(page).click();
    //select repair type
    await repTypeRadioBtn(page, repairType).click();//await page.pause();
    if (repairType == 1) {
        await estimatedRepHrs(page).fill('2');
        await estimatedPartsCost(page).fill('123.53');
        await techSuggPrice(page).fill(techSuggestedPrice);
    } else if (repairType == 2) {

    } else {
        await techSuggPrice(page).fill(techSuggestedPrice);
    }
    await page.waitForTimeout(1500);
    await summaryField(page).click();
    for (let index = 0; index < 3; index++) {
        await page.keyboard.press('Space');
        await page.keyboard.press('ArrowDown');
    }
    await irnlItemNotesField(page).fill(internalItemNotes);
    await updtEvaluationBtn(page).hover();
    await updtEvaluationBtn(page).click();
    await expect(pendingQuoteStatus(page).first()).toBeVisible();
    console.log('Item evaluation has completed.');
}
async function repItemAddedToQuote(page) {
    // Add Items to Quote
    await page.reload();
    await page.waitForTimeout(4000);
    let checkbox = await repItemCheckbox(page);
    let checkBoxCount = await checkbox.count();
    console.log('count is ', checkBoxCount);
    for (let i = 0; i < checkBoxCount; i++) {
        let check;
        if (checkBoxCount > 1) {
            if (i == 0) {
                check = await repItemCheckbox(page).first();
            } else {
                check = await repItemCheckbox(page).nth(i);
            }
        } else {
            check = await repItemCheckbox(page).first();
        }
        if (await check.isChecked()) {
            console.log('check box already selected');
        } else {
            await check.click();
        }
    }
    await addItemsToQuoteBtn(page).click();
    await expect(addItemsToQuoteConfPopUp(page)).toBeVisible();
    await acceptButton(page).click();
    await expect(gpLabel(page, 0)).toBeVisible();
    const quoteNumber = await quoteOrRMANumber(page).textContent();
    console.log("RMA quote is created: " + quoteNumber);
    return quoteNumber.replace('#', '');
}
async function approveWonTheRepairQuote(page, contactName) {
    //Approve the Repair Quote
    await approve(page, contactName);
    console.log('Repair Quoted has approved');
    // Submit for customer approval
    await submitForCustomerApprovals(page);
    console.log('Repair Quoted has send to customer for approval');
    // Mark the quote as won
    await wonQuote(page);
    console.log('Repair Quoted has Won');
}
async function createSORepQuote(page, vendorName, isCreateJob, quoteType) {
    // Create a Sales Order (SO) for RMA Quote
    await createSO(page, vendorName, isCreateJob, quoteType);
}
async function markAsRepairInProgress(page) {
    //naigate to Repairs detailed view
    await clickOnRelatedIds(page, 'Related to Repairs');
    await expect(serialNumaberLabel(page).first()).toBeVisible();
    await expect(markAsInProgressBtn(page).first()).toBeVisible();
    await markAsInProgressBtn(page).first().click();
    await repInProgresConfPopUp(page);
    await acceptButton(page).click();
    await expect(inProgressStatus(page)).toBeVisible();
    console.log('Repair Item Marked as In Progress');
}
async function createPartsPurchase(page, vendorPartNum, vendorName, ppItemQty, ppItemCost, ppItemDesc, ppItemSpclNotes, ppItemNotes) {
    //Navigate to Repairs Details from Jobs Details view
    await repLinkAtJobDetls(page).click();
    await expect(serialNumaberLabel(page).first()).toBeVisible();
    // await page.goto('https://www.staging-buzzworld.iidm.com/parts-purchase-detail-view/1d2d727a-50b8-4ae6-ab98-030678563a40')
    //here verifying Vendor part number accepting spaces or not from repair
    await checkVendorPartNumberAcceptingSpacesOrNot(page, vendorPartNum, true);
    //click on search manifacture field
    await mfgFieldAtPp(page).click();
    await page.keyboard.insertText(vendorName);
    await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden();
    await page.waitForTimeout(3000);
    await page.keyboard.press('Enter');
    // await page.getByText('OMRON ELECTRONICS LLC', { exact: true }).click();
    await ppItemQtyField(page).fill(ppItemQty);
    await ppItemCostField(page).fill(ppItemCost);
    await ppItemDescField(page).fill(ppItemDesc);
    await ppItemSpclNotesField(page).fill(ppItemSpclNotes);
    await ppItemNotesField(page).fill(ppItemNotes); //await page.pause();
    await createButtonAtPartsPurchForm(page).click();
    await expect(poInfoText(page)).toBeVisible();
    //verifying vendor part number updated at or not
    await expect(vpnFieldText(page, vendorPartNum)).toBeVisible();
    let pp = await quoteOrRMANumber(page).textContent();
    let pp_id = pp.replace("#", "");
    // console.log('used job id is ' + await jobNumField(page).textContent());
    console.log('parts purchase created with id ' + pp_id);
}
async function repairSummary(page, sumData, repSumNotes, internalItemNotes) {
    await repSummaryField(page).click();
    await page.getByLabel('open').click();
    await repSummaryData(page, sumData);
    await page.keyboard.press('Escape');
    await repSummaryNotes(page).fill(repSumNotes);
    await irnlItemNotesField(page).fill(internalItemNotes);
    //click on save button
    await saveButton(page).click();
    await expect(updateSuccMsg(page).nth(1)).toBeVisible();
    console.log('Repair summary has updated');
}
async function assignToQC(page, tech, internalNotes) {
    await expect(assignToQCButton(page)).toBeVisible();
    await assignToQCButton(page).click();
    await expect(assignQCLabel(page).nth(1)).toBeVisible();
    await reactFirstDropdown(page).click();
    await page.keyboard.insertText(tech);
    await page.keyboard.press('Enter');
    await irnlItemNotesField(page).fill(internalNotes);
    await assignButton(page).click();
    await expect(pendingQCText(page)).toBeVisible();
    console.log('QC has Assigned');
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
async function saveQCCheckListForm(page, partsNotes, qcCommentsToCust, status, supplCode, supplName, intrnlPartNum, intrnlPartsUsedDesc) {
    //Go to the QC Checklist Form
    await qcCheckListIcon(page).scrollIntoViewIfNeeded();
    await qcCheckListIcon(page).click();
    await expect(intrnlUsedParts(page)).toBeVisible();
    //Fill the QC Checklist
    await reactFirstDropdown(page).first().click();
    await selectReactDropdowns(page, 'Drive QC');
    // Checking appropriate radio buttons
    await page.getByLabel('Yes').first().check();
    await page.getByLabel('No').nth(2).check();
    await page.getByLabel('N/A').nth(2).check();
    await page.getByLabel('Yes').nth(3).check();
    // Setting status to 'Pass'
    await page.getByText('Status').nth(1).click();
    await page.getByText(status, { exact: true }).click();
    // Filling text areas
    await partsNotesQC(page).fill(partsNotes);
    await qcComments(page).fill(qcCommentsToCust);
    await intrnlUsedPartsNum(page).fill(intrnlPartNum);
    await selectSupplier(page, supplCode, supplName);
    await intrnlUsedPartsDesc(page).fill(intrnlPartsUsedDesc);
    await saveButton(page).first().click(); //await page.pause();
    if (status == 'Pass') {
        await expect(penInvoiceStatus(page).first()).toBeVisible();
    } else {
        await expect(qcFailedStatus(page).first()).toBeVisible();
    }
    console.log('QC status has updated to ' + status);
}
async function verifyAddRowIssue(page) {
    const repIteStatus = await repItemStatus(page).textContent();
    console.log('status is:' + repIteStatus); //await page.pause();
    if (repIteStatus == ' QC Failed') {
        await pendingQCText(page).first().click();
        await expect(pendingQCConfText(page)).toBeVisible();
        await acceptButton(page).click();
    } else {
    }
    await expect(qcCheckListIcon(page)).toBeVisible();
    await qcCheckListIcon(page).click();
    await expect(addNewRowIntrnlUsedPart(page)).toBeVisible();
    await addNewRowIntrnlUsedPart(page).click();
    await expect(intrnlUsedPartsNum(page).first()).toBeVisible()
    await saveButton(page).click();
    const valnCount = await newPartUsedPartNumberValns(page).count();
    if (valnCount > 1) {
        console.log('on single click multiple rows are added');
        throw new Error("" + error)
    } else {
        console.log('Add Multiple rows issue has fixed')
    }
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
                console.log('date promised value matched...');
                console.log('actual Date Promised: ' + actDatePromisedValue + ' expected Date Promised: ' + expDatePromisedValue);
            } else {
                console.log('date promised value not matched...');
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
async function updateDatesAtRepairs(page, aprDateValue, promDateValue) {
    //click first repair item edit icon
    await repItemEditIcon(page).first().click();
    await expect(estimatedRepHrs(page)).toBeVisible();
    await promisedDateField(page).nth(2).click();
    await page.keyboard.insertText(aprDateValue);
    await page.keyboard.press('Enter');
    await promisedDateField(page).nth(3).click();
    await page.keyboard.insertText(promDateValue);
    await page.keyboard.press('Enter');
    await saveButton(page).click(); await delay(page, 2000);
    await repItemEditIcon(page).first().click();
    await expect(estimatedRepHrs(page)).toBeVisible();
    const approvedDate = await promisedDateField(page).nth(2).textContent();
    const promicedDate = await promisedDateField(page).nth(3).textContent();
    if (approvedDate === aprDateValue && promicedDate == promDateValue) {
        console.log('dates are matched')
    } else {
        console.log('dates are not matched')
    } console.log('expected aproved date: (' + aprDateValue + ') actual aproved date: (' + approvedDate + ')');
    console.log('expected promised date: (' + promDateValue + ') actual promised date: (' + promicedDate + ')');
    await closeAtRepItemEdit(page);
    return [approvedDate, promicedDate];
}
async function checkDatesAtCreateSO(page, aprDateRep, promDateRep) {
    await createSOBtn(page).click();
    await expect(poNumAtSOScr(page)).toBeVisible();
    const lsdAtSO = await lineShipDateAtSO(page).textContent();
    const crdAtSO = await custReqDateAtSO(page).textContent();
    if (aprDateRep == crdAtSO.replaceAll('-', '/') && promDateRep == lsdAtSO.replaceAll('-', '/')) {
        console.log('Repairs dates are prefilled at create SO screen')
    } else {
        console.log('Repairs dates are not prefilled at create SO screen')
    }
    console.log('dates at SO screen: (' + lsdAtSO + ') (' + crdAtSO + ')');
    console.log('dates from repair: (' + promDateRep + ') (' + promDateValue + ')');
    await closeAtRepItemEdit(page).click();
}
module.exports = {
    //exporting functions
    createRepair,
    navigateToRepairInProgressTab,
    checkDueLabelChangeToPromisedDate,
    addItemsToRepairs,
    assignLocationFun,
    assignTech,
    itemEvaluation,
    repItemAddedToQuote,
    approveWonTheRepairQuote,
    createSORepQuote,
    markAsRepairInProgress,
    createPartsPurchase,
    assignToQC,
    repairSummary,
    saveQCCheckListForm,
    verifyAddRowIssue,
    updateDatesAtRepairs,
    checkDatesAtCreateSO,
    //exporting locators
    ppIconRepairs
}