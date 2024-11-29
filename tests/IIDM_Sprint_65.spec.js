import { test, expect } from '@playwright/test';
const { verifying_pull_data_from_syspro, login_buzz, verify_storage_location_repair_quotes, verify_quote_clone_archived_quotes, vendor_website_field_validation_slash, verify_default_branch_pricing, returnResult, filters_quotes_sales_person, filters_quotes_cust, create_parts_purchase, warranty_repair_parts_purchase, verify_stocked_location_parts_system_quotes, i_icon_for_verifying_warehouses } = require('./helper');
const stage_url = process.env.BASE_URL_BUZZ;
// test.describe('all tests', async () => {
test.describe('all tests ', async () => {
    let page, results;
    // To Run the Tests in Serial Order un comment the below line
    test.describe.configure({ mode: 'serial' })
    let w = 1920, h = 910;
    // let w = 1280, h = 551;

    test.beforeAll(async ({ browser }) => {
        // await reports('First Test', 'Passed');
        page = await browser.newPage();
        // await setScreenSize(page, w, h);
        await login_buzz(page, stage_url);
    });

    test('Verify New Part Number pull fron syspro', async ({ }, testInfo) => {
        let newPart = 'GHG-673G12';// 2423534-TEST
        results = await verifying_pull_data_from_syspro(page, newPart);
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });
    test('Verify storage location field for repair quotes', async ({ }, testInfo) => {
        let newPart = '2423534-TEST';
        results = await verify_storage_location_repair_quotes(page);
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });
    test('Verify Quote Clone for Archived quotes', async ({ }, testInfo) => {
        results = await verify_quote_clone_archived_quotes(page, 'Archived Quotes', 'Archived');
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });
    test('Verify Quote Clone for Expired quotes', async ({ }, testInfo) => {
        results = await verify_quote_clone_archived_quotes(page, 'Expired Quotes', 'Expired');
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });
    test('Verify Vendor Website Slash Validation at Parts Purchase', async ({ }, testInfo) => {
        results = await vendor_website_field_validation_slash(page);
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });
    test('Verify Branch Issue In Pricing', async ({ }, testInfo) => {
        results = await verify_default_branch_pricing(page);
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });
    test('verify filters in quotes with customer name', async ({ }, testInfo) => {
        let acc_num = "ZUMMO00", custName = 'Zummo Meat Co Inc';
        results = await filters_quotes_cust(page, acc_num, custName);
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });
    test('verify filters in quotes with sales person', async ({ }, testInfo) => {
        let salesPerson = 'Frontier';
        results = await filters_quotes_sales_person(page, salesPerson, 0, 7);
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });
    test('verify filters in quotes with status', async ({ }, testInfo) => {
        let status = 'Won';
        results = await filters_quotes_sales_person(page, status, 1, 8);
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });
    test('verify filters in quotes with quoted by', async ({ }, testInfo) => {
        let quoted_by = 'Annita Torres';
        results = await filters_quotes_sales_person(page, quoted_by, 2, 4);
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });
    test('verify filters in quotes with item filters', async ({ }, testInfo) => {
        let quoted_by = 'S8VS-18024B';
        results = await filters_quotes_sales_person(page, quoted_by, 3, 4);
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });
    test('Verify Urgency as Warranty Repair at Parts Purchase Item Notes Manually', async ({ }, testInfo) => {
        results = await warranty_repair_parts_purchase(page, true);
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });
    test('Verify Urgency as Warranty Repair at Parts Purchase Item Notes From Repair', async ({ }, testInfo) => {
        results = await warranty_repair_parts_purchase(page, false);
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });
    test('Verify Stocked Location at item list view', async ({ }, testInfo) => {
        results = await verify_stocked_location_parts_system_quotes(page, false);
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });
    test('Verify Stocked Code warehouse not match with customer warehouse', async ({ }, testInfo) => {
        let quote_id = '5b170299-5369-4163-a6ac-e34739b51cd4', quote_type = 'system_quotes';
        results = await i_icon_for_verifying_warehouses(page, quote_type, quote_id);
        let testName = testInfo.title;
        await returnResult(page, testName, results);
    });

})