const { expect } = require("@playwright/test");
const { delay } = require("../tests/helper");

//storing locators
const adminButton = (page) => { return page.getByText('Admin'); }
const usersTab = (page) => { return page.locator('#root').getByText('Users') }
const userProfile = (page) => { return page.getByText('User Profile') }
const userEmail = (page) => { return page.getByPlaceholder('Enter Email ID') }
const userSysProId = (page) => { return page.getByPlaceholder('Enter Syspro Id') }
const userSysProExistValdn = (page) => { return page.getByText('Syspro Id already exists.') }
const userSearch = (page) => { return page.getByPlaceholder('Search') }
const userDetils = (page, userName) => { return page.locator("//*[@title='" + userName + "']") }
const userEdit = (page) => { return page.getByText('Edit') }
const userEmailReqVaidn = (page) => { return page.getByText('Please Enter Email ID') }
const userSysProReqValdn = (page) => { return page.getByText('Syspro ID can\'t be empty') }
const updateAtUserEdit = (page) => { return page.getByRole('button', { name: 'Update' }) }
const cancelAtUserEdit = (page) => { return page.getByRole('dialog').getByRole('button', { name: 'Cancel' }) }

//do actions
async function navigateToUsers(page) {
    await adminButton(page).nth(0).click();
    await usersTab(page).click();
    return userProfile(page);
}
async function checkEmailSysProEditStatus(page, userFullName, sysProId) {
    //navigate to users pages
    await expect(await navigateToUsers(page)).toBeVisible();
    //search for specific user
    await userSearch(page).fill(userFullName);
    //checking searched user appeared  or not
    await expect(userDetils(page, userFullName)).toBeVisible();
    //if appeared select and go to User profile
    await userEdit(page).click();
    //checking User Email is visible or not
    await expect(userEmail(page)).toBeVisible();
    const isEmailEnable = await userEmail(page).isEnabled();
    const isSysproIDEnable = await userSysProId(page).isEnabled();
    //verifying User Email, SysProId is Enabled or not
    if (isEmailEnable) {
        if (isSysproIDEnable) {
            //empty the user email, sysproid field
            await userEmail(page).fill('');
            await userSysProId(page).fill('');
            //update the user details
            await updateAtUserEdit(page).click();
            //validating the email, sysproid required validations
            await expect(userEmailReqVaidn(page)).toBeVisible();
            await expect(userSysProReqValdn(page)).toBeVisible();
            await cancelAtUserEdit(page).click();
            //checking syspro ID with existing syspro ID
            await userEdit(page).click();
            await expect(userEmail(page)).toBeVisible();
            await userSysProId(page).fill(sysProId);
            await updateAtUserEdit(page).click();
            await expect(userSysProExistValdn(page)).toBeVisible();
            await cancelAtUserEdit(page).click();
            await delay(page, 2000);
        } else { throw new Error('syspro id field is disabled at edit users page'); }
    } else { throw new Error('email filed is disabled at edit users page'); }
}
module.exports = {
    checkEmailSysProEditStatus
}