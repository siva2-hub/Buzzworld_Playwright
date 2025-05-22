import { clear } from "console";
import { getEleByAny, getEleByClass, getEleByText, getEleContText } from "./PricingPages";
import { createSOBtn, iidmCostLabel } from "./QuotesPage";
import { enterKey } from "./RepairPages";
import { testData } from "./TestData";
import AllPages from "../tests/PageObjects";

const { expect } = require("@playwright/test");
const { loadingText, reactFirstDropdown } = require("./PartsBuyingPages");
const { selectReactDropdowns, api_responses, filters_quotes_sales_person, filters_quotes_cust, clearFilters_TopSearch } = require("../tests/helper");

export const inventoryLink = (page) => { return page.getByText('Inventory') }
export const addStockCode = (page) => { return page.getByText('Add Stock Code') }
export const singleStockCode = (page) => { return page.getByText('Single Stock Code') }
export const searchStockField = (page) => { return page.getByText('Search By Stock Code', { exact: true }) }
export const searchStockFieldInv = (page) => { return page.getByText('Search by Stock Code', { exact: true }) }
export const warehouseLabel = (page) => { return page.getByText('Warehouse') }
export const warehouseInfo = (page) => { return page.locator("//*[@class='info']") }
export const warehouseField = (page) => { return page.getByRole('dialog').getByLabel('open').nth(4) }
export const addBtnAtAddNewPart = (page) => { return page.getByRole('button', { name: 'Add', exact: true }) }
export const prodClsReqValdn = (page) => { return page.getByText('Please Select Product Class') }
export const prodClsField = (page) => { return page.getByRole('dialog').getByLabel('open').nth(1) }
export const stockExistsValdn = (page) => { return page.getByText('stock code exists') }
export const longDescLabelName = (page) => { return page.getByText('Long Description') }
export const longDescField = (page) => { return page.getByPlaceholder('Enter Long Description') }
export const stockItemsAtCreateSO = (page) => { return page.locator('//*[@id="root"]/div/div[3]/div[6]/div/div[1]/div/div[2]/div[3]/div') }
export const itemsCountAtQuotes = (page) => { return page.locator('//*[@id="repair-items"]/div[1]') }

export async function naviageToInventory(page) {
    await inventoryLink(page).click()
    await expect(addStockCode(page)).toBeVisible()
}
export async function checkWarehouseInfoAtAddNewPart(page, newPart) {
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
export async function checkLongDescriptonField(page, testDataLD) {
    const [checkingPlace, stocCode, status] = testDataLD; let checkStatus = false;
    await naviageToInventory(page);
    switch (checkingPlace) {
        case 'stock_line_items_page':
            await expect(addStockCode(page)).toBeVisible();
            await addStockCode(page).click();
            await addStockCode(page).click();
            await searchStockField(page).click();
            await expect(page.getByRole('heading', { name: 'Add Stock Line Items' })).toBeVisible();
            await expect(longDescLabelName(page)).toBeVisible();
            await expect(longDescField(page)).toBeVisible(); checkStatus = true;
            break;
        case 'inventory_search':
            await expect(addStockCode(page)).toBeVisible();
            await searchStockFieldInv(page).click();;
            await page.keyboard.insertText(stocCode);
            await expect(loadingText(page)).toBeVisible(); await expect(loadingText(page)).toBeHidden();
            await selectReactDropdowns(page, stocCode);
            await expect(longDescLabelName(page)).toBeVisible(); checkStatus = true;
            break;
        case 'create_so':
            await getEleByText(page, 'Quotes').nth(0).click();
            try {
                await expect(getEleByText(page, 'Clear').nth(0)).toBeVisible({ timeout: 2000 });
                await getEleByText(page, 'Clear').nth(0).click();
            } catch (error) { }
            await getEleByText(page, 'Filters').nth(0).click();
            await reactFirstDropdown(page).nth(2).click();
            await selectReactDropdowns(page, status);
            await page.getByRole('button', { name: 'Apply' }).click();
            let wonStatus = getEleByText(page, status).nth(0);
            await expect(wonStatus).toBeVisible();
            await wonStatus.click();
            // await page.goto('https://www.staging-buzzworld.iidm.com/all_quotes/adf75994-b679-489d-ae3f-867d686be2d8');
            await expect(iidmCostLabel(page).nth(0)).toBeVisible();
            let itemsCountInItemsTab = await itemsCountAtQuotes(page).textContent();
            itemsCountInItemsTab = parseInt(itemsCountInItemsTab.replaceAll(/[Quote Items ()]/g, ''));
            await createSOBtn(page).click();
            await expect(stockItemsAtCreateSO(page).nth(0)).toBeVisible();
            let itemsCountInCreateSOTab = await stockItemsAtCreateSO(page).count();
            console.log(`Items count in Items tab: ${itemsCountInItemsTab}\nItems count in Create SO tab: ${itemsCountInCreateSOTab}`);
            if (itemsCountInItemsTab === itemsCountInCreateSOTab) {
                for (let index = 0; index < itemsCountInCreateSOTab; index++) {
                    let itemDetails = await stockItemsAtCreateSO(page).nth(index).locator('//div/div[2]/div[5]').textContent();
                    console.log(`Item ${index + 1} details: ${itemDetails}`);
                    if (itemDetails.includes('Long Description')) {
                        console.log(`Long Description field is visible at ${checkingPlace}`);
                    }
                }
                console.log('Items count in Items tab and Create SO tab are same');
            } else {
                // let stockItemsNonSys = await getEleByClass(page, 'tooltip bottom').count();
                let stockItemsNonSys = await getEleByAny(page, 'class', 'tooltip bottom').count();
                console.log(`Total stock items not in create so screen is which are not in syspro : ${stockItemsNonSys}`);
                itemsCountInCreateSOTab = itemsCountInCreateSOTab + stockItemsNonSys;
                console.log(`total stock items not in create so screen is : ${itemsCountInCreateSOTab}`);
                if (itemsCountInItemsTab === itemsCountInCreateSOTab) {
                    for (let index = 0; index < stockItemsNonSys; index++) {
                        await getEleByClass(page, 'tooltip bottom').nth(index).click();
                        // await expect(page.locator("//input[@name='description']")).toBeVisible();
                        await expect(getEleByAny(page, 'name', 'description')).toBeVisible();
                        await expect(longDescLabelName(page)).toBeVisible({ timeout: 2000 });
                        await expect(longDescField(page)).toBeVisible({ timeout: 2000 });
                        console.log(`Long Description field is visible for stock item ${checkingPlace}`);
                    }
                    for (let index = 0; index < itemsCountInCreateSOTab; index++) {
                        let itemDetails = await stockItemsAtCreateSO(page).nth(index).locator('//div/div[2]/div[5]').textContent();
                        console.log(`Item ${index + 1} details: ${itemDetails}`);
                        if (itemDetails.includes('Long Description')) {
                            console.log(`Long Description field is visible at ${checkingPlace}`);
                        }
                    }
                } else {
                    console.log('Items count in Items tab and Create SO tab are not same');
                }
            }
            await page.pause();
            checkStatus = true;
            break;
        default:
            break;
    }
    if (checkStatus) {
        console.log(`Long Description field is visible at ${checkingPlace}`);
    } else {
        console.log(`Long Description field is not visible at ${checkingPlace}`);
    }
    return checkStatus;
}