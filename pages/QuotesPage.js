const { expect } = require("@playwright/test");
const { selectReactDropdowns, spinner } = require("../tests/helper");
const { loadingText } = require("./PartsBuyingPages");

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
const submitForCustomerDropdown = (page) => { return page.locator('//*[@id="root"]/div/div[3]/div[1]/div[1]/div/div[2]/div[1]/div[3]/div/button'); }
const quoteOrRMANumber = (page) => { return page.locator("(//*[@class='id-num'])[1]"); }
const reviseQuoteButton = (page) => { return page.locator("//*[contains(text(),'Revise Quote')]"); }
const confMsgForReviseQuote = (page) => { return page.locator("(//*[text()='This will move the quote to Open, Do you want to continue ?'])[1]") }
const proceedButton = (page) => { return page.locator("//*[text()='Proceed']") }
const versionDropdown = (page) => { return page.locator("(//*[contains(text(),'V')])[1]"); }
const versionOne = (page) => { return page.locator("//*[text()='V1']") }
const projectNameRepQuote = (page) => { return page.locator("(//*[@class='field-details'])[1]/div[4]/div/div[2]"); }
const projectNamePartsQuote = (page) => { return page.locator("(//*[@class='field-details'])[1]/div[5]/div/div[2]"); }
const sendToCustomerButton = (page) => { return page.locator("//*[text()='Submit for Customer Approval']"); }
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

async function navigateToQuotesPage(page) {
    await quotesLink(page).click()
    await expect(customerIconAtGrid(page)).toBeVisible();
}
async function createQuote(page, acc_num, quote_type, project_name) {
    let quote_number;
    try {
        await createQuoteBtn(page).click();
        await expect(companyField(page)).toBeVisible();
        await companyField(page).fill(acc_num);
        await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden();
        await expect(page.getByText(acc_num, { exact: true }).nth(1)).toBeVisible();
        await page.getByText(acc_num, { exact: true }).nth(1).click();
        await quoteTypeField(page).click();
        await selectReactDropdowns(page, quote_type);
        await projectName(page).fill(project_name);
        await page.pause();
        await createQuoteBtn(page).nth(2).click();
        await expect(allItemsAtDetailView(page)).toContainText('Add Items');
        quote_number = await quoteOrRMANumber(page.textContent());
        console.log('quote is created: ' + quote_number);
    } catch (error) {
        throw new Error("getting error while creating quote: " + error)
    }
    return quote_number;
}
async function addItemsToQuote(page, stock_code, quote_type, suppl_name, suppl_code, sourceText, part_desc) {
    for (let index = 0; index < stock_code.length; index++) {
        await addItemsBtn(page).click();
        await partsSeach(page).fill(stock_code[index]);
        await spinner(page);
        let res = false;
        try {
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
                await selectReactDropdowns(page, (suppl_name + suppl_code))
            } else { }
            await partNumberField(page).fill(stock_code[index]);
            await partQty(page).fill('1');
            await quotePriceFiled(page).fill('20123.56');
            await listPriceFiled(page).fill('256.36');
            await iidmCostFiled(page).fill('2549.256984');
            await sourceField(page, sourceText).click();
            await page.getByText('Select', { exact: true }).click();
            await page.getByText('Day(s)', { exact: true }).click();
            await page.getByPlaceholder('Day(s)').click();
            await page.getByPlaceholder('Day(s)').fill('12-16');
            await partDescription(page).fill(part_desc);
            await addBtnAddNewItem(page).click();
        } else {
            await fisrtSeachCheckBox(page).first().click();
            await selectedItemAtSeach(page).click();
        }
        await expect(addOptionsBtn(page)).toBeVisible();
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
    await page.goto(stage_url() + urlPath);
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
async function displayProjectNameAtSendToCustomerApprovals(page, quote_id, isCreateNew, accoutNumber, contactName, quoteType, items) {
    if (isCreateNew) {
        await createQuote(page, accoutNumber, quoteType);
        await addItesms(page, items, quoteType);
        await selectRFQDateandQuoteRequestedBy(page, contactName);
        await soucreSelection(page, items[0]);
    } else { await page.goto(stage_url() + 'all_quotes/' + quote_id) }
    const quoteNumber = await quoteOrRMANumber(page).textContent();
    let projectName = await projectNamePartsQuote(page).textContent();
    // await approve(page, contactName);
    await expect(iidmCostLabel(page)).toBeVisible();
    await sendToCustomerButton(page).click();
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
}
module.exports = {
    navigateToQuotesPage,
    createQuote,
    checkGPGrandTotalAtQuoteDetails,
    checkReviseForOldVersions,
    displayProjectNameAtSendToCustomerApprovals,
    customerIconAtGrid
}