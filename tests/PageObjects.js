const {  expect } = require('@playwright/test');

export default class  AllPages{
    constructor(page) {
        this.page = page;
    }
    //Page Objects
    get userNameInput() { return this.page.getByLabel('Email'); }
    get passwordInput() { return this.page.getByPlaceholder('Enter Password'); }
    get signInButton() { return this.page.getByRole('button', { name: 'Sign In', exact: true }); }
    get profileIconListView(){return this.page.locator('(//*[contains(@src, "vendor_logo")])[1]')};

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