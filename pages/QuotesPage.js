const { expect } = require("@playwright/test");
const { selectReactDropdowns, spinner, delay } = require("../tests/helper");
const { loadingText } = require("./PartsBuyingPages");
const { testData } = require("./TestData");
const { timeout } = require("../playwright.config");

const stage_url = () => { return process.env.BASE_URL_BUZZ; }
//storing locators
const quotesLink = (page) => { return page.getByText('Quotes'); }
const createQuoteBtn = (page) => { return page.getByText('Create Quote') }
const allRepairsLink = (page) => { return page.getByText('All Repairs Requests') }
const customerIconAtGrid = (page) => { return page.locator('(//*[contains(@src, "vendor_logo")])[1]') }
const allItemsAtDetailView = (page) => { return page.locator("//*[@id='repair-items']") }
const iidmCostLabel = (page) => { return page.locator("(//*[text()='IIDM Cost:'])[1]"); }
const iidmCost = (page) => { return page.locator('//*[@id="repair-items"]/div[2]/div[1]/div/div/div[2]/div[3]/div[3]/h4'); }
const quotePrice = (page) => { return page.locator('//*[@id="repair-items"]/div[2]/div[1]/div/div/div[2]/div[3]/div[1]/h4'); }
const totalGP = (page) => { return page.locator('//*[@id="repair-items"]/div[3]/div/div[1]/div/h4'); }
const totalPriceDetls = (page) => { return page.locator('//*[@id="repair-items"]/div[3]/div/div[4]/div/h4'); }
const sendToCustomerDropdown = (page) => { return page.locator("(//button[@type='button'])[6]"); }
const quoteOrRMANumber = (page) => { return page.locator("(//*[@class='id-num'])[1]"); }
const reviseQuoteButton = (page) => { return page.locator("//*[contains(text(),'Revise Quote')]"); }
const confMsgForReviseQuote = (page) => { return page.locator("(//*[text()='This will move the quote to Open, Do you want to continue ?'])[1]") }
const proceedButton = (page) => { return page.locator("//*[text()='Proceed']") }
const versionDropdown = (page) => { return page.locator("(//*[contains(text(),'V')])[1]"); }
const versionOne = (page) => { return page.locator("//*[text()='V1']") }
const projectNameRepQuote = (page) => { return page.locator("(//*[@class='field-details'])[1]/div[4]/div/div[2]"); }
const projectNamePartsQuote = (page) => { return page.locator("(//*[@class='field-details'])[1]/div[5]/div/div[2]"); }
const submitForCustomerAprvlButton = (page) => { return page.locator("//*[text()='Submit for Customer Approval']"); }
const subject = (page) => { return page.locator("//*[@name='quote_mail_subject']"); }
const companyField = (page) => { return page.getByLabel('Company Name*') }
const quoteTypeField = (page) => { return page.getByText('Quote Type').nth(1) }
const projectName = (page) => { return page.getByPlaceholder('Enter Project Name') }
const addItemsBtn = (page) => { return page.getByText('Add Items') }
const partsSeach = (page) => { return page.getByPlaceholder('Search By Part Number') }
const itemNotAvailText = (page) => { return page.locator("(//*[text() = 'Items Not Available'])[1]") }
const addNewItemBtn = (page) => { return page.getByRole('tab', { name: 'Add New Items' }) }
const supplierSearch = (page) => { return page.locator("//*[text() = 'Search']") }
const partNumberField = (page) => { return page.getByPlaceholder('Part Number') }
const partQty = (page) => { return page.getByPlaceholder('Quantity') }
const quotePriceFiled = (page) => { return page.getByPlaceholder('Quote Price') }
const listPriceFiled = (page) => { return page.getByPlaceholder('List Price') }
const iidmCostFiled = (page) => { return page.getByPlaceholder('IIDM Cost') }
const sourceField = (page, source) => { page.getByText('Select').nth(1).click(); return page.getByText(source, { exact: true }) }
const partDescription = (page) => { return page.getByPlaceholder('Description') }
const addBtnAddNewItem = (page) => { return page.getByRole('button', { name: 'Add', exact: true }) }
const fisrtSeachCheckBox = (page) => { return page.locator("(//*[contains(@class, 'data grid')]/div)[1]") }
const selectedItemAtSeach = (page) => { return page.getByRole('button', { name: 'Add Selected 1 Items' }) }
const addOptionsBtn = (page) => { return page.getByText('Add Options') }
const rqfRecDateEditIcon = (page) => { return page.locator('(//*[@class = "pi-label-edit-icon"])[2]') }
const nowButton = (page) => { return page.getByRole('button', { name: 'Now' }) }
const rTickIcon = (page) => { return page.getByTitle('Save Changes') }
const quoteReqByEditIcon = (page) => { return page.locator('(//*[@class = "pi-label-edit-icon"])[4]') }
const reactFirstDropdown = (page) => { return page.getByLabel('open') }
const gpLabel = (page, index) => { return page.locator("(//*[text()='GP'])[" + (index + 1) + "]") }
const firstItemEdit = (page, index) => { return page.locator("(//*[contains(@class, 'highlight check_box')]/div[5]/div/div[1])[" + (index + 1) + "]") }
const partNumFieldEdit = (page) => { return page.locator("//*[@name='part_number']") }
const itemNotesAtEditItem = (page) => { return page.locator("//*[@class='ql-editor ql-blank']") }
const saveButton = (page) => { return page.getByRole('button', { name: 'Save' }) }
const iidmCostReqValdn = (page) => { return page.getByText('Please enter IIDM Price') }
const deliverToCustomer = (page) => { return page.getByRole('menuitem', { name: 'Delivered to Customer' }) }
const wonButton = (page) => { return page.getByText('Won') }
const wonConfMsg = (page) => { expect(page.locator('#root')).toContainText('Are you sure you want to mark it as approve ?') }
const quotePriceLabel = (page) => { return page.locator("(//*[text()= 'Quote:'])") }
const createSOButton = (page) => { return page.getByText('Create Sales Order') }
const printIcon = (page) => { return page.locator("//img[contains(@src,'print')]") }
const toFieldAtSubCustAprvl = (page) => { return page.locator("//*[@class='side-drawer open']/div/div[2]/div[1]/div/div") }
const addThisEmailLink = (page) => { return page.locator("//*[contains(text(),'Add this Email?')]") }
const submitAtSubCustAprvl = (page) => { return page.locator("//span[normalize-space()='Submit']") }
const closeAtSubCustAprvl = (page) => { return page.locator("//div[@title='close']") }
const clickOnQuoteNum = (page, quoteNumber) => { return page.getByText(quoteNumber) }
const threeDots = (page) => { return page.locator("//*[@class='dropdown']") }
const relatedData = (page) => { return page.locator("//*[contains(@class,'border-bottom')]/div/div/div/div") };
const toolTipText = (page) => { return page.locator("//*[contains(@class,'Tooltip')]") }
const createSOBtn = (page) => { return page.getByText('Create Sales Order') }
const gridColumnData = (page, columnCount) => { return page.locator("//*[@class='ag-center-cols-container']/div/div[" + columnCount + "]"); }
const loadSpin = (page) => { return page.locator("//*[contains(@style, 'stroke:')]") }


async function navigateToQuotesPage(page) {
    await quotesLink(page).click()
    await expect(customerIconAtGrid(page)).toBeVisible();
}
async function createQuote(page, acc_num, quote_type, project_name) {
    let quote_number;
    try {
        // await page.goto('https://www.staging-buzzworld.iidm.com/all_quotes/a251e1dd-1cc8-432c-8535-ab5dc6fa2c61')
        await createQuoteBtn(page).click();
        await expect(companyField(page)).toBeVisible();
        await companyField(page).fill(acc_num);
        await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden();
        await expect(page.getByText(acc_num, { exact: true }).nth(1)).toBeVisible();
        await page.getByText(acc_num, { exact: true }).nth(1).click();
        await quoteTypeField(page).click();
        await selectReactDropdownAtQP(page, quote_type);
        await projectName(page).fill(project_name);//await page.pause();
        await createQuoteBtn(page).nth(2).click();
        await expect(allItemsAtDetailView(page)).toContainText('Add Items');
        quote_number = await quoteOrRMANumber(page).textContent();
        console.log('quote is created: ' + quote_number);
        return quote_number.replace('#', '');
    } catch (error) {
        throw new Error("getting error while creating quote: " + error)
    }
}
async function selectReactDropdownAtQP(page, selectingText) {
    const drops = await page.locator("//*[contains(@class,'react-select__option')]"); let isSelected = false;
    // console.log('dropdowns count is: ' + await drops.count());
    for (let index = 0; index < await drops.count(); index++) {
        const dropdownText = await drops.nth(index).textContent();
        // console.log(dropdownText);
        if (dropdownText === selectingText) { await drops.nth(index).click(); isSelected = true; break; }
        else { isSelected = false; }
    }
    if (isSelected) { }
    else { throw new Error(selectingText + " not found in dropdown"); }
}
async function addItemsToQuote(page, stock_code, quote_type, suppl_name, suppl_code, sourceText, part_desc, qp) {
    for (let index = 0; index < stock_code.length; index++) {
        await addItemsBtn(page).click();
        await partsSeach(page).fill(stock_code[index]);
        let res = false;
        try {
            await expect(itemNotAvailText(page)).toBeHidden();
            await expect(loadSpin(page)).toBeHidden();
            await expect(itemNotAvailText(page)).toBeVisible({ timeout: 2300 });
            res = true;
        } catch (error) {
            // console.log(error);
            res = false;
        }
        if (res) {
            await addNewItemBtn(page).click();
            if (quote_type == 'Parts Quote') {
                await supplierSearch(page).click();
                await page.keyboard.insertText(suppl_code);
                await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden();
                await selectReactDropdownAtQP(page, (suppl_name + suppl_code))
            } else { }
            await partNumberField(page).fill(stock_code[index]);
            await partQty(page).fill('1');
            await quotePriceFiled(page).fill(qp);
            await listPriceFiled(page).fill('256.36');
            await iidmCostFiled(page).fill('2549.256984');
            await sourceField(page, sourceText).click();
            await page.getByText('Select', { exact: true }).click();
            await page.getByText('Day(s)', { exact: true }).click();
            await page.getByPlaceholder('Day(s)').click();
            await page.getByPlaceholder('Day(s)').fill('12-16');
            await partDescription(page).fill(part_desc); //await page.pause();
            await addBtnAddNewItem(page).click();
        } else {
            await fisrtSeachCheckBox(page).first().click(); //await page.pause();
            await selectedItemAtSeach(page).click();
        }
        await expect(addOptionsBtn(page)).toBeVisible();
    }
}
async function selectRFQDateRequestedBy(page, cont_name) {
    await rqfRecDateEditIcon(page).click();
    await nowButton(page).click();
    await rTickIcon(page).click();
    await quoteReqByEditIcon(page).click();
    await reactFirstDropdown(page).click();
    try {
        await expect(loadingText(page)).toBeVisible({ timeout: 3000 }); await expect(loadingText(page)).toBeHidden();
    } catch (error) { }
    await selectReactDropdownAtQP(page, cont_name);
    await rTickIcon(page).click();
    await page.waitForTimeout(2000);
}
async function selectSource(page, stock_code, sourceText, item_notes_text) {
    for (let index = 0; index < stock_code.length; index++) {
        //item edit icon
        await expect(gpLabel(page, index)).toBeVisible();
        await firstItemEdit(page, index).click();
        await expect(partNumFieldEdit(page)).toBeVisible();
        await reactFirstDropdown(page).nth(1).click();
        await selectReactDropdownAtQP(page, sourceText);
        await itemNotesAtEditItem(page).fill(item_notes_text);
        await saveButton(page).click();
        try {
            await expect(iidmCostReqValdn(page)).toBeVisible({ timeout: 2000 });
            await iidmCostFiled(page).fill('0.1');
            await saveButton(page).click();
        } catch (error) {
        }
        await page.waitForTimeout(2000); await expect(addOptionsBtn(page)).toBeVisible();
    }
}
async function reviseQuote(page) {
    const reviseQuoteBtn = reviseQuoteButton(page);
    await expect(reviseQuoteBtn).toBeVisible({ timeout: 2000 });
    await reviseQuoteBtn.click();
    await expect(confMsgForReviseQuote(page)).toBeVisible();
    await proceedButton(page).first().click();
    await expect(iidmCostLabel(page)).toBeVisible();
}
async function sendForCustomerApprovals(page) {
    await expect(gpLabel(page, 0)).toBeVisible(); await page.waitForTimeout(1400);
    await sendToCustomerDropdown(page).click();
    await expect(deliverToCustomer(page)).toBeVisible()
    await deliverToCustomer(page).click();
    await expect(wonButton(page)).toBeVisible()
}
async function submitForCustAproval(page, userEmail) {
    await submitForCustomerAprvlButton(page).click();
    await expect(toFieldAtSubCustAprvl(page)).toBeVisible();
    const toFieldData = await toFieldAtSubCustAprvl(page).textContent();
    if (toFieldData === '') {
        await toFieldAtSubCustAprvl(page).fill(userEmail);
        await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden();
        await expect(addThisEmailLink(page)).toBeVisible();
        await addThisEmailLink(page).click()
    } else { }
    await expect(submitAtSubCustAprvl(page)).toBeVisible();
    await submitAtSubCustAprvl(page).click()
    await expect(wonButton(page)).toBeVisible()
}
async function quoteWon(page) {
    await wonButton(page).click();
    await wonConfMsg(page);
    await proceedButton(page).first().click();
    await expect(gpLabel(page, 0)).toBeVisible();
    let itemsCount = await quotePriceLabel(page).count({ timeout: 2000 });
    console.log('Items Count is ', itemsCount);
    await expect(createSOButton(page)).toBeVisible()
}
async function printQuotePDF(page, quote_number) {
    // await page.goto(testData.app_url + 'all_quotes/' + testData.quotes.quote_id);
    await clickOnQuoteNum(page, quote_number).click();
    const quoteNum = await quoteOrRMANumber(page).textContent();
    const page1Promise = page.waitForEvent('popup');
    try {
        await expect(threeDots(page)).toBeVisible({ timeout: 2400 });
        await threeDots(page).click();
        await printIcon(page).nth(1).click();
    } catch (error) {
        await printIcon(page).nth(0).click();
    }
    const page1 = await page1Promise;
    const pdfUrl = page1.url();
    await expect(pdfUrl).toContain('PreviewPdf/' + quoteNum.replace('#', '') + '.pdf');
    console.log('quote pdf url: ' + pdfUrl)
    await page1.close();
}
async function checkReviseForOldVersions(page, quote_id, isCreateNew, accoutNumber, contactName, quoteType, items) {
    if (isCreateNew) {
        await createQuote(page, accoutNumber, quoteType);
        await addItesms(page, items, quoteType);
        await selectRFQDateandQuoteRequestedBy(page, contactName);
        await soucreSelection(page, items);
        await approve(page, contactName);
    } else { await page.goto(stage_url() + 'all_quotes/' + quote_id); }
    const iidmCostText = iidmCostLabel(page);
    await expect(iidmCostText).toBeVisible();
    const itemsDataInLatestVersion = await allItemsAtDetailView(page).textContent();
    try {
        await expect(reviseQuoteButton(page)).toBeVisible({ timeout: 2000 });
        try {
            await expect(versionDropdown(page)).toBeVisible({ timeout: 2000 });
        } catch (error) { await reviseQuote(page); }
        const versionDropdn = versionDropdown(page);
        await versionDropdn.click();
        await versionOne(page).click();
        await expect(iidmCostText).toBeVisible();
        const itemsDataInOldVersion = await allItemsAtDetailView(page).textContent();
        if (itemsDataInLatestVersion === itemsDataInOldVersion) {
            await expect(reviseQuoteButton(page)).toBeVisible({ timeout: 2000 });
            const itemsDataInLatestVersion = await allItemsAtDetailView(page).textContent();
            await reviseQuote(page);
            await versionDropdn.click();
            await versionOne(page).click();
            await expect(iidmCostText).toBeVisible();
            await allItemsAtDetailView(page).scrollIntoViewIfNeeded();
            const itemsDataInOldVersion = await allItemsAtDetailView(page).textContent();
            if (itemsDataInLatestVersion === itemsDataInOldVersion) {
                await expect(reviseQuoteButton(page)).toBeVisible({ timeout: 2000 });
            } else { }
        } else { throw new Error("items data at latest and old version are not matched."); }
    } catch (error) { throw new Error('Error is: ' + error); }
}
async function checkGPGrandTotalAtQuoteDetails(page, quoteId) {
    const urlPath = 'all_quotes/' + quoteId;
    // await page.goto(stage_url() + urlPath);
    let totalIidmCost = 0.0, totalQuotePrice = 0.0;
    await expect(iidmCostLabel(page)).toBeVisible();
    const iCost = iidmCost(page);
    const qPrice = quotePrice(page);
    const tAGP = await totalGP(page).textContent();
    for (let index = 0; index < await iCost.count(); index++) {
        let ic = await iCost.nth(index).textContent();
        let qp = await qPrice.nth(index).textContent();
        totalIidmCost = totalIidmCost + Number((ic.replace("$", "")).replace(",", ""));
        totalQuotePrice = totalQuotePrice + Number((qp.replace("$", "")).replace(",", ""));
    }
    const totalExpectedGP = ((((totalQuotePrice - totalIidmCost) / totalQuotePrice) * 100).toFixed(2)) + ' %';
    const totalActualGP = (Number((tAGP.replace("$", "")).replace("%", "")).toFixed(2)) + ' %';
    if (totalActualGP === totalExpectedGP) {
        console.log('actual gp: ' + totalActualGP + ' expected gp: ' + totalExpectedGP);
    } else { throw new Error('actual gp: ' + totalActualGP + ' expected gp: ' + totalExpectedGP); }
    console.log('Quote Number: ' + await quoteOrRMANumber(page).textContent());
}
async function displayProjectNameAtSendToCustomerApprovals(page, quote_id) {
    // await page.goto(stage_url() + 'all_quotes/' + quote_id)
    const quoteNumber = await quoteOrRMANumber(page).textContent();
    let projectName = await projectNamePartsQuote(page).textContent();
    await expect(iidmCostLabel(page)).toBeVisible();
    await submitForCustomerAprvlButton(page).click();
    let expectedSubject;
    if (projectName === '-') {
        expectedSubject = 'IIDM Quote - ' + quoteNumber;
    } else {
        projectName = projectName.charAt(0).toUpperCase() + projectName.slice(1);
        expectedSubject = projectName + ' - ' + 'IIDM Quote - ' + quoteNumber;
    }
    const actaualSuobject = await subject(page).getAttribute('value');
    if (actaualSuobject === expectedSubject) {
        console.log('actual sobject: ' + actaualSuobject + '\nexpect subject: ' + expectedSubject);
    } else { throw new Error("actual subject is: " + actaualSuobject + ' but expected subject is: ' + expectedSubject); }
    await closeAtSubCustAprvl(page).click();
}
async function clickOnRelatedIds(page, macthedText) {
    await delay(page, 2000);
    let count = await relatedData(page).count();
    for (let index = 0; index < count; index++) {
        const firstId = relatedData(page).nth(index);
        await firstId.hover();
        let relatedDataText = await toolTipText(page).textContent();
        if (relatedDataText === macthedText) {
            await firstId.click(); break;
        } else {

        }
    }
}
module.exports = {
    navigateToQuotesPage,
    createQuote,
    addItemsToQuote,
    selectRFQDateRequestedBy,
    selectSource,
    sendForCustomerApprovals,
    submitForCustAproval,
    quoteWon,
    printQuotePDF,
    checkGPGrandTotalAtQuoteDetails,
    checkReviseForOldVersions,
    displayProjectNameAtSendToCustomerApprovals,
    clickOnRelatedIds,
    selectReactDropdownAtQP,
    //exporting locators
    companyField,
    customerIconAtGrid,
    reactFirstDropdown,
    addItemsBtn,
    partsSeach,
    partNumberField,
    partDescription,
    quoteOrRMANumber,
    rTickIcon,
    saveButton,
    createSOBtn,
    gridColumnData,
    gpLabel
}