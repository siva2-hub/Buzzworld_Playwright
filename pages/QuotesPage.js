const { expect } = require("@playwright/test");

const stage_url = () => { return process.env.BASE_URL_BUZZ; }
//storing locators
const quotesLink = (page) => { return page.getByText('Quotes'); }
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

async function navigateToQuotesPage(page) {
    await quotesLink(page).click()
    await expect(allRepairsLink(page)).toBeVisible();
    await expect(customerIconAtGrid(page).toBeVisible());
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
        console.log('actual sobject: ' + actaualSuobject + '\nexpected subject: ' + expectedSubject);
    } else { throw new Error("actual subject is: " + actaualSuobject + ' but expected subject is: ' + expectedSubject); }
}
module.exports = {
    navigateToQuotesPage,
    checkGPGrandTotalAtQuoteDetails,
    checkReviseForOldVersions,
    displayProjectNameAtSendToCustomerApprovals
}