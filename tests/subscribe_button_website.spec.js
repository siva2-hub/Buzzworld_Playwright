const { test, expect } = require("@playwright/test");
const { read_excel_data } = require("./helper");

test("verifying subscribe button at website negative scenarios", async ({ page }) => {
    // Navigate to the website
    await page.goto("https://stagingiidm.wpengine.com/");
    await page.locator("//*[text()='Accept All']").click();
    // Read data from the Excel file
    const excel_data = await read_excel_data('performance.xlsx', 0);
    for (let index = 1; index < excel_data.length; index++) {
        const page_url = excel_data[index]['__EMPTY_1'];
        await page.goto(page_url);
        const subscrbe = page.locator("//*[contains(text(),'Subscribe')]");
        await subscrbe.scrollIntoViewIfNeeded();
        let isSubscribeButtonVisible = false, isValidationSuccessfull = false;
        // Check if the Subscribe button is visible
        try {
            await expect(subscrbe).toBeVisible();
            isSubscribeButtonVisible = true;
        } catch (error) {
            isSubscribeButtonVisible = false;
        }
        if (isSubscribeButtonVisible) {
            // Click the Subscribe button
            await subscrbe.click();
            const firstNameInput = page.locator("//*[contains(@id,'first_name')]");
            const lastNameInput = page.locator("//*[contains(@id,'last_name')]");
            const emailInput = page.locator("//*[contains(@id,'email')]");
            //Enter the data into the required fields
            await firstNameInput.fill('first name');
            await lastNameInput.fill('last name');
            await emailInput.fill('firstname@espi.com');
            //Clear the data from required fields
            await firstNameInput.fill('');
            await lastNameInput.fill('');
            await emailInput.fill('');
            // Click the Subscribe button within the form
            await page.locator("//*[@value='Subscribe']").click();
            // Validate error messages
            try {
                const firstNameValidation = page.locator("//*[text()='please enter first name']");
                const lastNameValidation = page.locator("//*[text()='please enter last name']");
                const emailValidation = page.locator("//*[text()='please email']");
                await expect(firstNameValidation).toBeVisible({ timeout: 2300 });
                await expect(lastNameValidation).toBeVisible({ timeout: 2300 });
                await expect(emailValidation).toBeVisible({ timeout: 2300 });
                isValidationSuccessfull = true;
            } catch (error) {
                isValidationSuccessfull = false;
                throw error;
            }
            if (isValidationSuccessfull) { await page.click("//*[@aria-label='Close']"); }
            else { }
        } else { }
    }
});
test("verifying subscribe button at website positive scenarios", async ({ page }) => {
    const firstName = "Default", lastName = "Test2", email = "defaulttest2@espi.co";
    // Navigate to the website
    await page.goto("https://stagingiidm.wpengine.com/");
    await page.locator("//*[text()='Accept All']").click();
    const subscrbe = page.locator("//*[contains(text(),'Subscribe')]");
    await subscrbe.scrollIntoViewIfNeeded();
    let isSubscribeButtonVisible = false, isSuccessValidationVisible = false;
    // Check if the Subscribe button is visible
    try {
        await expect(subscrbe).toBeVisible();
        isSubscribeButtonVisible = true;
    } catch (error) {
        isSubscribeButtonVisible = false;
    }
    if (isSubscribeButtonVisible) {
        // Click the Subscribe button
        await subscrbe.click();
        const firstNameInput = page.locator("//*[contains(@id,'first_name')]");
        const lastNameInput = page.locator("//*[contains(@id,'last_name')]");
        const emailInput = page.locator("//*[contains(@id,'email')]");
        //Enter the data into the required fields
        await firstNameInput.fill(firstName);
        await lastNameInput.fill(lastName);
        await emailInput.fill(email);
        // Click the Subscribe button within the form
        await page.locator("//*[@value='Subscribe']").click();
        // Validate success messages
        try {
            const successValidation = page.locator("//*[text()='Your information has been submitted']");
            await expect(successValidation).toBeVisible({ timeout: 160000 });
            isSuccessValidationVisible = true;
        } catch (error) {
            isSuccessValidationVisible = false;
            throw error;
        }
        if (isSuccessValidationVisible) { await page.click("//*[@aria-label='Close']"); }
        else { }
    } else { }
});