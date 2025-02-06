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
    //get the Customer column data the Organizations grid
    const response = await api_responses(page, stage_api_url + 'Organizations?page=1&perPage=25&sort=asc&sort_key=name&serverFilterOptions=%5Bobject+Object%5D&search=' + customer)
    //read and store the customer account number
    const apiActNum = response.result.data.list[0]['accountnumber'];
    //read and store the customer territory code
    const trcode = response.result.data.list[0]['territory_name'];
    console.log(apiActNum);
    //verifying the passing customer and getting customer data from organization grid
    if (apiActNum === customer) {
        //if customer was matched, read the customer account type
        const apiActType = response.result.data.list[0]['account_type'];
        //get the Account Types data from Account Types grid
        const response1 = await api_responses(page, stage_api_url + 'AccountTypes?page=1&perPage=25&sort=asc&sort_key=name&status%5B0%5D=true&grid_name=Repairs&serverFilterOptions=%5Bobject+Object%5D&selectedCustomFilters=%5Bobject+Object%5D&search=' + apiActType.replace(' ', '+'));
        const atMapping = response1.result.data.list[0]['account_type_mapped_with'];
        console.log('act type is: ' + atMapping);
        console.log('territory code: ' + trcode);
        //get the territory column data from territoried grid
        const response2 = await api_responses(page, stage_api_url + 'Territory?page=1&perPage=25&sort=asc&sort_key=territory_code&grid_name=Repairs&serverFilterOptions=%5Bobject+Object%5D&selectedCustomFilters=%5Bobject+Object%5D&search=' + trcode);
        //read the branch data from territory API
        const branch = response2.result.data.list[0]['branch_id'];
        console.log('branch id: ' + branch);
        //read the pricing details
        const actTypeAtPricing = await getAccountTypePrice(page, atMapping, vendor_id, branch, stockcode);
        // console.log('price at price list: ' + actTypeAtPricing);
        //read the store search response, verify searched part exist or not in search result
        const searResponse = await api_responses(page, stage_store_url + 'index.php?route=extension/module/search_plus&search=' + stockcode);
        const api_model = searResponse.products[0]['model'];
        //verifying part number at store search
        if (api_model === stockcode) {
            const product_url = searResponse.products[0]['url'];
            await storeLogin(page);
            await page.goto(product_url);
            await expect(page.locator("//*[text()='Available Quantity: ']")).toBeVisible();
            const price_store = await page.locator("//*[@data-update='price']").textContent();
            //verifying prices from the store and buzzworld pricing
            if (price_store === actTypeAtPricing) {
                console.log('prices are matched at store and buzzworld');
                console.log('price at price list: ' + actTypeAtPricing + '\nprice at store: ' + price_store);
            } else {
                console.log('prices are not matched at store and buzzworld');
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