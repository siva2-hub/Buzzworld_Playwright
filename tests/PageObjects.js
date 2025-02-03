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
        this.headerQuotesTab = this.page.locator("//*[text()='Quotes']").first();
        this.createQuoteAtQuotesLV = this.page.locator('div').filter({ hasText: /^Create Quote$/ }).nth(1);
        this.addItemsBtn = this.page.locator("//*[text()='Add Items']");
        this.itemsNotAvailText = this.page.getByText('Quote item(s) Not Available');
        this.clearTopSearch = this.page.locator('div:nth-child(3) > svg');
        this.submitForCustomerDropdown = this.page.locator('//*[@id="root"]/div/div[3]/div[1]/div[1]/div/div[2]/div[1]/div[3]/div/button');
        this.reviseQuoteButton = this.page.locator("//*[contains(text(),'Revise Quote')]");
        this.allItemsAtDetailView = this.page.locator("//*[@id='repair-items']");
        this.iidmCostLabel = this.page.locator("(//*[text()='IIDM Cost:'])[1]");
        this.iidmCost = this.page.locator('//*[@id="repair-items"]/div[2]/div[1]/div/div/div[2]/div[3]/div[3]/h4');
        this.quotePrice = this.page.locator('//*[@id="repair-items"]/div[2]/div[1]/div/div/div[2]/div[3]/div[1]/h4');
        this.totalGP = this.page.locator('//*[@id="repair-items"]/div[3]/div/div[1]/div/h4');
        this.totalPriceDetls = this.page.locator('//*[@id="repair-items"]/div[3]/div/div[4]/div/h4');
        this.versionDropdown = this.page.locator("(//*[contains(text(),'V')])[1]");
        this.projectNameRepQuote = this.page.locator("(//*[@class='field-details'])[1]/div[4]/div/div[2]");
        this.projectNamePartsQuote = this.page.locator("(//*[@class='field-details'])[1]/div[5]/div/div[2]");
        this.subject = this.page.locator("//*[@name='quote_mail_subject']");
        this.sendToCustomerButton = this.page.locator("//*[text()='Submit for Customer Approval']");
        this.quoteOrRMANumber = this.page.locator("(//*[@class='id-num'])[1]");
        this.pricingDropDown = this.page.locator("(//*[text()='Pricing'])");
        this.organizations = this.page.locator("//*[text()='Organizations']");
        this.nonSPAButtonAtDropDown = this.page.getByRole('menuitem', { name: 'Non Standard Pricing' });
        this.startDateEndDateByPlaceholder = this.page.getByPlaceholder('MM/DD/YYYY-MM/DD/YYYY');
        this.loading = this.page.locator("//*[text()='Loading...']");
        this.discountCodeUploader = this.page.locator("(//*[@type = 'file'])[1]");
        this.pricingUploader = this.page.locator("(//*[@type = 'file'])[2]");
        this.isAppendCheckbox = this.page.getByText('Append to Existing List');
        this.sc31Limit = this.page.locator("//*[contains(text(),'Stock Code(s) has more than 31 characters')]");
        this.ppIconRepairs = this.page.locator("(//*[contains(@src,'partspurchase')])[1]");
        this.horzScrollView = this.page.locator("//*[@class='ag-body-horizontal-scroll-viewport']");
        this.horzScrollToRight = this.page.locator("//*[@class='ag-horizontal-right-spacer ag-scroller-corner']");
        this.sysproIdAtUserEdit = this.page.locator("//*[@name='syspro_id']");
        this.emailAtUserEdit = this.page.locator("//*[@name='email']");
        this.leftBack = this.page.locator("//*[contains(@src,'chevron_left')]");
        this.clearFilters = this.page.locator("//*[text()='Clear']");
        this.statusAtGrid = this.page.locator("//*[@class='ag-react-container']");
        this.orgsSearch = this.page.locator("//*[@placeholder='Name / Company Name / Account Number / Owner']");
        this.firstSearchProduct = this.page.locator("(//*[@class='product-name'])[1]/p[1]");
        this.loadAtStoreSeach = this.page.locator("//*[text()='Searching...']");
        this.serialNumaberLabel = this.page.locator("//*[text()='Serial No:']");
        this.datePromisedLabel = this.page.locator("//*[@id='repair-items']/div[2]/div[1]/div/div[2]/div[4]/div[3]/span");
        this.datePromisedValue = this.page.locator("//*[@id='repair-items']/div[2]/div[1]/div/div[2]/div[4]/div[3]/h4");
        this.gridStatus = this.page.locator("//*[@class='ag-react-container']");
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