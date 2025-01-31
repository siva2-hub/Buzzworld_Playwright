const { test, expect } = require("@playwright/test");
const { default: AllPages } = require("./PageObjects");
const { login_buzz, clearFilters_TopSearch, getGridColumn, api_responses, getAccountTypePrice, storeLogin } = require("./helper");
const { time } = require("console");

const stage_url = process.env.BASE_URL_BUZZ
const stage_api_url = process.env.BASE_API_BUZZ
const stage_store_url = process.env.BASE_URL_STORE
let pob;
test('verify account type base pricing at store', async ({ page }) => {
    pob = new AllPages(page);
    let vendor_id = '6c7da9c6-5860-4b96-b1d5-ff28ba734b9c', customer = 'MULTI00', stockcode = '2000-1203';
    // await login_buzz(page, stage_url);
    //go to organizarions
    // await pob.organizations.nth(0).click();
    // await pob.organizations.nth(1).click();
    // //clear the Top Search and Filters
    // await clearFilters_TopSearch(page);
    // await pob.orgsSearch.fill(customer); await page.keyboard.press('Enter');
    // await expect(page.locator("//*[text()='" + customer + "']")).toBeVisible();
    // const at = await getGridColumn(page, 5); 
    const response = await api_responses(page, stage_api_url + 'Organizations?page=1&perPage=25&sort=asc&sort_key=name&serverFilterOptions=%5Bobject+Object%5D&search=' + customer)
    const apiActNum = response.result.data.list[0]['accountnumber'];
    const trcode = response.result.data.list[0]['territory_name'];
    console.log(apiActNum);
    if (apiActNum === customer) {
        const apiActType = response.result.data.list[0]['account_type'];
        const response1 = await api_responses(page, stage_api_url + 'AccountTypes?page=1&perPage=25&sort=asc&sort_key=name&status%5B0%5D=true&grid_name=Repairs&serverFilterOptions=%5Bobject+Object%5D&selectedCustomFilters=%5Bobject+Object%5D&search=' + apiActType.replace(' ', '+'));
        const atMapping = response1.result.data.list[0]['account_type_mapped_with'];
        console.log('act type is: ' + atMapping);
        console.log('territory code: ' + trcode);
        const response2 = await api_responses(page, stage_api_url + 'Territory?page=1&perPage=25&sort=asc&sort_key=territory_code&grid_name=Repairs&serverFilterOptions=%5Bobject+Object%5D&selectedCustomFilters=%5Bobject+Object%5D&search=' + trcode);
        const branch = response2.result.data.list[0]['branch_id'];
        console.log('branch id: ' + branch);
        const actTypeAtPricing = await getAccountTypePrice(page, atMapping, vendor_id, branch, stockcode);
        // console.log('price at price list: ' + actTypeAtPricing);
        const searResponse = await api_responses(page, stage_store_url + 'index.php?route=extension/module/search_plus&search=' + stockcode);
        const api_model = searResponse.products[0]['model'];
        if (api_model === stockcode) {
            const product_url = searResponse.products[0]['url'];
            await storeLogin(page);
            await page.goto(product_url);
            await expect(page.locator("//*[text()='Available Quantity: ']")).toBeVisible();
            const price_store = await page.locator("//*[@data-update='price']").textContent();
            if (price_store === actTypeAtPricing) {
                console.log('price at price list: ' + actTypeAtPricing + '\nprice at store: ' + price_store);
            } else {
                console.log('prices are not matched at staore and buzzworld');
                console.log('price at price list: ' + actTypeAtPricing + '\nprice at store: ' + price_store);
            }
            // console.log('price at store: ' + price_store);
        } else {
            console.log('product not found in store');
        }
        await page.pause();
    } else {
        console.log('customer not found!');
     }
});