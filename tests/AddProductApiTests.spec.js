const { test, request, expect } = require("@playwright/test");
const { testData } = require("../pages/TestData");
const { stage_api_url } = require("./helper");
const { getAPIResponse, postAPIResponse } = require("../pages/APIs");

test('Add Product API with duplicate stock code', async () => {
    //Add Product API Test
    const data =
    {
        "manufacturer_discount_id": {
            "value": "41f55b0b-65bd-40d1-a4d6-1c679312238c",
            "label": "BACOTest#16381"
        },
        "vendor_id": "25ea1571-7cfd-422f-8f5c-6dc411fe610f",
        "stock_code": "0165009LS",
        "list_price": "233",
        "description": "Manually added",
        "product_class": {
            "label": "AB01 - ABB CONTROL INC",
            "value": "AB01"
        },
        "branch_id": "385411d3-ddc8-4029-9719-e89698446c24"
    }
    let res = await postAPIResponse(request, 'Products', data);
    expect(res.result.status_code).toBe(422);
    expect(res.result.success).toBe(false);
    expect(res.result.data).toBe('The Stock Code already exists.');
    expect(res.result.message).toBe('Error while saving products data');
});
test('Add Product API with empty stock code', async () => {
    //Add Product API Test
    const data =
    {
        "manufacturer_discount_id": {
            "value": "41f55b0b-65bd-40d1-a4d6-1c679312238c",
            "label": "BACOTest#16381"
        },
        "vendor_id": "25ea1571-7cfd-422f-8f5c-6dc411fe610f",
        "stock_code": "",
        "list_price": "233",
        "description": "Manually added",
        "product_class": {
            "label": "AB01 - ABB CONTROL INC",
            "value": "AB01"
        },
        "branch_id": "385411d3-ddc8-4029-9719-e89698446c24"
    }
    let res = await postAPIResponse(request, 'Products', data);
    expect(res.result.status_code).toBe(422);
    // console.log('res', res);
    expect(res.result.success).toBe(false);
    expect(res.result.data).toBe('The name field is required.');
    expect(res.result.message).toBe('Error while saving products data');
});
test('Add Selected Items to Quote API Test', async () => {
    const data = {
        "quote_id": "b1c90127-99f7-479b-b9fc-55a9b2dfffa0",
        "selected_items": [
            {
                "manufacturer_id": "3f92aa36-2284-44b3-865c-34df2fee05e9",
                "quantity": "2",
                "products_id": "44d569bb-e852-4db6-879f-7742bd8da768"
            },
        ],
        "customer_id": "57ee609d-582a-eb11-8156-00505684552b"
    }
    let res = await postAPIResponse(request, 'QuoteItems', data);
    console.log('res', res);
});
test('Bulk Edit Items to Quote API Test', async () => {
    const data = {
        "discount": "",
        //Selecting source
        "source": {
            "value": "58cb3589-2409-459b-a450-7228fa3a08f4",
            "label": "Field Service"
        },
        //selecting lead time
        "lead_time": {
            "value": "74964759-6dfe-4a01-af65-4b80ff3a13d3",
            "label": "TBD"
        },
        "lead_time_value": "",
        //quote id
        "quote_id": "b1c90127-99f7-479b-b9fc-55a9b2dfffa0",
        //items ids
        "ids": [
            "7bffda48-1208-422e-9541-d9ac4d319020"
        ]
    }
    let res = await postAPIResponse(request, 'QuoteItems', data);
    console.log('res', res);
});
