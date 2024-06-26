const { expect } = require('@playwright/test');

export default class AllPages {
    constructor(page) {
        this.page = page;
    }
    //Page Objects
    get userNameInput() { return this.page.getByLabel('Email'); }
    get passwordInput() { return this.page.getByPlaceholder('Enter Password'); }
    get signInButton() { return this.page.getByRole('button', { name: 'Sign In', exact: true }); }
    get profileIconListView() { return this.page.locator('(//*[contains(@src, "vendor_logo")])[1]'); }
    get resetPasswordBtn() { return this.page.locator("//*[text() = 'Reset Password']"); }
    get customerDropdown() { return this.page.getByLabel('Company Name*'); }
    get createButton() { return this.page.getByRole('button', { name: 'Create', exact: true }); }
    //Select item check box at add items page
    get checkBox() { return this.page.locator('g > rect'); }

    async login(url) {
        await this.page.goto(url);
        await this.page.waitForTimeout(1300);
        if (await this.page.url().includes('sso')) {
            await this.userNameInput.fill('defaultuser@enterpi.com');
            await this.passwordInput.fill('Enter@4321');
            await this.signInButton.click();
        } else {
        }
        await expect(this.profileIconListView).toBeVisible({ timeout: 30000 });
        await this.page.waitForTimeout(1600);
    }

}