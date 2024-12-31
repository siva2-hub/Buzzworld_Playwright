import { time } from 'console';

const { expect } = require('@playwright/test');

export default class AllPages {
    constructor(page) {
        this.page = page;
        this.userNameInput = this.page.getByLabel('Email');
        this.passwordInput = this.page.getByPlaceholder('Enter Password');
        this.signInButton = this.page.getByRole('button', { name: 'Sign In', exact: true });
        this.profileIconListView = this.page.locator('(//*[contains(@src, "vendor_logo")])[1]');
        this.resetPasswordBtn = this.page.locator("//*[text() = 'Reset Password']");
        this.customerDropdown = this.page.getByLabel('Company Name*');
        this.createButton = this.page.getByRole('button', { name: 'Create', exact: true });
        //Select item check box at add items page
        this.checkBox = this.page.locator("(//*[contains(@class, 'data grid')]/div)[1]");
        //click Proceed button at BOM Upload Page
        // this.proceed = this.page.click("(//*[text()='Proceed'])[2]");
        //Click Admin tab
        // this.clickAdmin = this.page.getByText('Admin').first().click();
        //First row in grid list
        this.gridFirstRow = this.page.locator("//*[@class='ag-center-cols-container']/div[1]");
        this.headerQuotesTab = this.page.getByText('Quotes', { exact: true }).first();
        this.createQuoteAtQuotesLV = this.page.locator('div').filter({ hasText: /^Create Quote$/ }).nth(1);
        this.addItemsBtn = this.page.locator("//*[text()='Add Items']");
        this.itemsNotAvailText = this.page.getByText('Quote item(s) Not Available');
        this.submitForCustomerDropdown = this.page.locator('//*[@id="root"]/div/div[3]/div[1]/div[1]/div/div[2]/div[1]/div[3]/div/button');
        this.reviseQuoteButton = this.page.locator("//*[contains(text(),'Revise Quote')]");
        this.allItemsAtDetailView = this.page.locator("//*[@id='repair-items']");
        this.iidmCostLabel = this.page.locator("(//*[text()='IIDM Cost:'])[1]");
        this.iidmCost = this.page.locator('//*[@id="repair-items"]/div[2]/div[1]/div/div/div[2]/div[3]/div[3]/h4');
        this.quotePrice = this.page.locator('//*[@id="repair-items"]/div[2]/div[1]/div/div/div[2]/div[3]/div[1]/h4');
        this.totalGP = this.page.locator('//*[@id="repair-items"]/div[3]/div/div[1]/div/h4');
        this.versionDropdown = this.page.locator("(//*[contains(text(),'V')])[1]");
        this.projectNameRepQuote = this.page.locator("(//*[@class='field-details'])[1]/div[4]/div/div[2]");
        this.projectNamePartsQuote = this.page.locator("(//*[@class='field-details'])[1]/div[5]/div/div[2]");
        this.subject = this.page.locator("//*[@name='quote_mail_subject']");
        this.sendToCustomerButton = this.page.locator("//*[text()='Submit for Customer Approval']");
        this.quoteOrRMANumber = this.page.locator("//*[@class='id-num']");
        this.pricingDropDown = this.page.getByRole('button', { name: 'Pricing expand' });
        this.nonSPAButtonAtDropDown = this.page.getByRole('menuitem', { name: 'Non Standard Pricing' });
        this.startDateEndDateByPlaceholder = this.page.getByPlaceholder('MM/DD/YYYY-MM/DD/YYYY');
    }
    //Page Objects
    // get userNameInput() { return this.page.getByLabel('Email'); }
    // get passwordInput() { return this.page.getByPlaceholder('Enter Password'); }
    // get signInButton() { return this.page.getByRole('button', { name: 'Sign In', exact: true }); }
    // get profileIconListView() { return this.page.locator('(//*[contains(@src, "vendor_logo")])[1]'); }
    // get resetPasswordBtn() { return this.page.locator("//*[text() = 'Reset Password']"); }
    // get customerDropdown() { return this.page.getByLabel('Company Name*'); }
    // get createButton() { return this.page.getByRole('button', { name: 'Create', exact: true }); }
    // //Select item check box at add items page
    // get checkBox() { return this.page.locator("(//*[contains(@class, 'data grid')]/div)[1]"); }
    // //click Proceed button at BOM Upload Page
    // get proceed() { return this.page.click("(//*[text()='Proceed'])[2]"); }
    // //Click Admin tab
    // get clickAdmin() { return this.page.getByText('Admin').first().click(); }
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