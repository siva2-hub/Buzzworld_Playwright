import { time } from 'console';

const { expect } = require('@playwright/test');
export default class AllPages {
    constructor(page) {
        this.page = page;
        this.initializeSelectors();
    }
    initializeSelectors() {
        // Authentication Elements
        this.userNameInput = this.page.getByLabel('Email');
        this.passwordInput = this.page.getByPlaceholder('Enter Password');
        this.signInButton = this.page.getByRole('button', { name: 'Sign In', exact: true });
        this.resetPasswordBtn = this.page.locator("//*[text() = 'Reset Password']");

        // Profile Elements
        this.profileIconListView = this.page.locator('(//*[contains(@src, "vendor_logo")])[1]');
        this.customerDropdown = this.page.getByLabel('Company Name*');

        // Buttons
        this.createButton = this.page.getByRole('button', { name: 'Create', exact: true });
        this.addItemsBtn = this.page.locator("//*[text()='Add Items']");
        this.reviseQuoteButton = this.page.locator("//*[contains(text(),'Revise Quote')]");
        this.sendToCustomerButton = this.page.locator("//*[text()='Submit for Customer Approval']");

        // Grid Elements
        this.checkBox = this.page.locator("(//*[contains(@class, 'data grid')]/div)[1]");
        this.gridFirstRow = this.page.locator("//*[@class='ag-center-cols-container']/div[1]");
        this.gridStatus = this.page.locator("//*[@class='ag-react-container']");
        this.statusAtGrid = this.gridStatus;

        // Quote Elements
        this.headerQuotesTab = this.page.locator("//*[text()='Quotes']").first();
        this.createQuoteAtQuotesLV = this.page.locator('div').filter({ hasText: /^Create Quote$/ }).nth(1);
        this.itemsNotAvailText = this.page.getByText('Quote item(s) Not Available');

        // Pricing Elements
        this.pricingDropDown = this.page.locator("(//*[text()='Pricing'])");
        this.nonSPAButtonAtDropDown = this.page.getByRole('menuitem', { name: 'Non Standard Pricing' });
        this.discountCodeUploader = this.page.locator("(//*[@type = 'file'])[1]");
        this.pricingUploader = this.page.locator("(//*[@type = 'file'])[2]");
        this.isAppendCheckbox = this.page.getByText('Append to Existing List');

        // Quote Details
        this.allItemsAtDetailView = this.page.locator("//*[@id='repair-items']");
        this.iidmCostLabel = this.page.locator("(//*[text()='IIDM Cost:'])[1]");
        this.iidmCost = this.page.locator('//*[@id="repair-items"]/div[2]/div[1]/div/div/div[2]/div[3]/div[3]/h4');
        this.quotePrice = this.page.locator('//*[@id="repair-items"]/div[2]/div[1]/div/div/div[2]/div[3]/div[1]/h4');
        this.totalGP = this.page.locator('//*[@id="repair-items"]/div[3]/div/div[1]/div/h4');
        this.totalPriceDetls = this.page.locator('//*[@id="repair-items"]/div[3]/div/div[4]/div/h4');
        this.submitForCustomerDropdown = this.page.locator('//*[@id="root"]/div/div[3]/div[1]/div[1]/div/div[2]/div[1]/div[3]/div/button');

        // Search and Filtering
        this.clearTopSearch = this.page.locator('div:nth-child(3) > svg');
        this.clearFilters = this.page.locator("//*[text()='Clear']");
        this.orgsSearch = this.page.locator("//*[@placeholder='Name / Company Name / Account Number / Owner']");
        this.firstSearchProduct = this.page.locator("(//*[@class='product-name'])[1]/p[1]");
        this.loadAtStoreSeach = this.page.locator("//*[text()='Searching...']");

        // Other Elements
        this.poNumberAtSO = this.page.getByPlaceholder('Enter PO Number');
        this.quoteOrRMANumber = this.page.locator("(//*[@class='id-num'])[1]");
        this.organizations = this.page.locator("//*[text()='Organizations']");
        this.versionDropdown = this.page.locator("(//*[contains(text(),'V')])[1]");
        this.projectNameRepQuote = this.page.locator("(//*[@class='field-details'])[1]/div[4]/div/div[2]");
        this.projectNamePartsQuote = this.page.locator("(//*[@class='field-details'])[1]/div[5]/div/div[2]");
        this.subject = this.page.locator("//*[@name='quote_mail_subject']");
        this.startDateEndDateByPlaceholder = this.page.getByPlaceholder('MM/DD/YYYY-MM/DD/YYYY');
        this.loading = this.page.locator("//*[text()='Loading...']");
        this.sc31Limit = this.page.locator("//*[contains(text(),'Stock Code(s) has more than 31 characters')]");
        this.ppIconRepairs = this.page.locator("(//*[contains(@src,'partspurchase')])[1]");
        this.horzScrollView = this.page.locator("//*[@class='ag-body-horizontal-scroll-viewport']");
        this.horzScrollToRight = this.page.locator("//*[@class='ag-horizontal-right-spacer ag-scroller-corner']");
        this.sysproIdAtUserEdit = this.page.locator("//*[@name='syspro_id']");
        this.emailAtUserEdit = this.page.locator("//*[@name='email']");
        this.leftBack = this.page.locator("//*[contains(@src,'chevron_left')]");
        this.serialNumaberLabel = this.page.locator("//*[text()='Serial No:']");
        this.datePromisedLabel = this.page.locator("//*[@id='repair-items']/div[2]/div[1]/div/div[2]/div[4]/div[3]/span");
        this.datePromisedValue = this.page.locator("//*[@id='repair-items']/div[2]/div[1]/div/div[2]/div[4]/div[3]/h4");
        this.plusIconAtSO = this.page.locator("//*[contains(@src,'addIcon')]");
        this.i_icon_create_SO = this.page.locator("//*[contains(@style,'margin: 3px -12px;')]");
        this.toolTip = this.page.locator("(//*[contains(@class, 'Tooltip')])[1]");
    }
}