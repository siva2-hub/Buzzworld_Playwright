const { expect } = require("@playwright/test");
const { loadingText } = require("./PartsBuyingPages");
const { selectReactDropdowns, api_responses } = require("../tests/helper");

const inventoryLink = (page) => { return page.getByText('Inventory') }
const addStockCode = (page) => { return page.getByText('Add Stock Code') }
const singleStockCode = (page) => { return page.getByText('Single Stock Code') }
const searchStockField = (page) => { return page.getByText('Search By Stock Code', { exact: true }) }
const warehouseLabel = (page) => { return page.getByText('Warehouse') }
const warehouseInfo = (page) => { return page.locator("//*[@class='info']") }
const warehouseField = (page) => { return page.getByRole('dialog').getByLabel('open').nth(4) }
const addBtnAtAddNewPart = (page) => { return page.getByRole('button', { name: 'Add', exact: true }) }
const prodClsReqValdn = (page) => { return page.getByText('Please Select Product Class') }
const prodClsField = (page) => { return page.getByRole('dialog').getByLabel('open').nth(1) }
const stockExistsValdn = (page) => { return page.getByText('stock code exists') }

async function naviageToInventory(page) {
    await inventoryLink(page).click()
    await expect(addStockCode(page)).toBeVisible()
}
async function checkWarehouseInfoAtAddNewPart(page, newPart) {
    await naviageToInventory(page)
    await addStockCode(page).click()
    await singleStockCode(page).click()
    await searchStockField(page).click()
    await page.keyboard.insertText(newPart)
    await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden()
    await selectReactDropdowns(page, newPart)
    await warehouseLabel(page).scrollIntoViewIfNeeded()
    const apiResponse = await api_responses(page, 'https://staging-buzzworld-api.iidm.com/v1/getInventoryQuery?stockCode=' + newPart + '&stockCodeId=' + newPart);
    const warehouseData = apiResponse.result.data.stockItemInfo.warehouse;
    let displayingWarehouse = [];
    for (let index = 0; index < warehouseData.length; index++) {
        displayingWarehouse.push(warehouseData[index]['warehouse']);
    }
    const actualDisplayingInfo = await warehouseInfo(page).textContent();
    const expDisplayingInfo = newPart + ' exists in warehouse ' + displayingWarehouse.join(', ');
    if (expDisplayingInfo === actualDisplayingInfo) {
        await warehouseField(page).click();
        await page.keyboard.insertText(warehouseData[0]['warehouse'])
        await page.keyboard.press('Enter');
        await addBtnAtAddNewPart(page).click();
        try {
            await expect(prodClsReqValdn(page)).toBeVisible({ timeout: 2000 });
            await prodClsField(page).click();
            await selectReactDropdowns(page, 'AB01')
        } catch (error) { }
        await addBtnAtAddNewPart(page).click();
        await expect(stockExistsValdn(page)).toBeVisible();
    } else {
        console.log('expected displaying warehouse info: ' + expDisplayingInfo);
        console.log('actual displaying warehouse info: ' + actualDisplayingInfo);
    }
}
module.exports = {
    checkWarehouseInfoAtAddNewPart
}