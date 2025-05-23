import { expect } from "@playwright/test";
import { getEleByText, getEleContText } from "./PricingPages";
import { ANSI_ORANGE, ANSI_RESET, delay, login_buzz, login_buzz_newUser, search_user, selectReactDropdowns, spinner } from "../tests/helper";
import { reactFirstDropdown } from "./PartsBuyingPages";
import { testData } from "./TestData";
import { time } from "console";
export const ytdSalesTarget = (page) => { return page.locator("//*[@class='appointments-target']") }
export const filterArrow = (page) => { return page.locator("//*[@class='arrow']") }
export const selectBranch = (page, branchName) => { return page.getByRole('button', { name: `${branchName} Expand node` }) }
export const applyButton = (page) => { return page.getByRole('button', { name: 'Apply' }) }
export const selectSalesPerson = (page, salesPerson) => { return page.getByRole('button', { name: salesPerson }) }
export const saveButton = (page) => { return page.getByRole('button', { name: 'Save' }) }
export const salesButton = (page) => { return page.locator("//*[text()='Sales' and @class='link-icon-text']") }
export const avgGoalsSalesDashB = (page) => { return page.locator("(//*[contains(@class,'recharts-reference-line')])[2]") }
export const userEdit = (page) => { return page.locator("(//*[contains(@src,'themecolorEdit')])[1]") }
export const userUpdateBtn = (page) => { return page.getByRole('button', { name: 'Update' }) }
export const userProfileIcon = (page) => { return page.locator("//*[@class='user_image']") }
export const branchesListSD = (page) => { return page.locator("//*[@class='tree-select-dropdown']/div/div") }
export const monthGoalInPut = (page, monthName) => { return page.getByPlaceholder(`Enter value for ${monthName}`) }
export const salesValue = (page) => { return page.locator("//*[@class='sales-value']") }
export const userRoleText = (page) => { return page.locator("//*[@class='user-field-details user-details']/div[1]/div/div[2]") }

export async function getYTDTargets(page, salesPerson) {
    await getEleByText(page, 'Dashboard').nth(0).click();
    await salesButton(page).click();
    await filterArrow(page).nth(0).click(); await delay(page, 4000);
    //*[@class='tree-select-dropdown']/div/div[1]/div[2]/div
    let status = false;
    for (let s = 0; s < salesPerson.length; s++) {
        let branches = await branchesListSD(page);
        console.log('branches count is ', await branches.count())
        for (let index = 0; index < await branches.count(); index++) {
            let sPerson = await branches.nth(index).locator("//div[2]/div");
            for (let sp = 0; sp < await sPerson.count(); sp++) {
                let sPerName = await sPerson.nth(sp).textContent();
                // console.log('saleperson name ', sPerName);
                if (salesPerson[s] == sPerName) {
                    console.log(`${sPerName} found in ${await branches.nth(index).locator("//div[1]").nth(0).textContent()} branch`);
                    await branches.nth(index).click();
                    await sPerson.nth(sp).click();
                    status = true;
                    break;
                } else { }
            } if (status) { break; }
        }
    }
    if (status) {
        await applyButton(page).click();
        await expect(page.getByText('Filter Applied')).toBeVisible();
        await expect(ytdSalesTarget(page).nth(1)).toBeVisible();
        let tarSales = await ytdSalesTarget(page).nth(1).textContent();
        return tarSales.replaceAll(/[$,]/g, '');
    } else {
        throw new Error(`${salesPerson} is not found in any branch.`);
    }
}
export async function readingUserGoals(page, months, count) {
    let valOfmonths = 0, firstFiveMonths = 0; let avgCount = 0, index = 0;
    //reading all months goals
    for (let month of months.keys()) {
        let valOfmonth = await monthGoalInPut(page, month).getAttribute('value');
        valOfmonths = parseFloat((valOfmonths + parseFloat(valOfmonth)).toFixed("2"));
        //reading first five months goals
        if (index < 5) {
            firstFiveMonths = parseFloat((firstFiveMonths + parseFloat(valOfmonth)).toFixed("2"));
            avgCount = avgCount + 1;
        } await delay(page, 500);
        console.log(`${month}: ${valOfmonth}`);
        index = index + 1;
    }
    return [valOfmonths, firstFiveMonths, avgCount];
}
export async function checkGoalsAtGraph(page, months, salesPerson) {
    let testStatus = false;
    try {
        await expect(getEleByText(page, 'Shipments').nth(0)).toBeVisible();
        for (let index = 0; index < 5; index++) {
            await page.locator(`g:nth-child(${index + 1}) > .recharts-rectangle`).first().hover(); await delay(page, 1000);
            let goalAtGraph = await getEleByText(page, 'Goals: $').textContent();
            goalAtGraph = goalAtGraph.replaceAll(/[Goals :,]/g, "")
            let expectedGoalGraph = months.get(testData.months[index]);
            if (salesPerson.length > 1) {
                expectedGoalGraph = expectedGoalGraph * salesPerson.length;
            }
            expectedGoalGraph = '$' + expectedGoalGraph.toString().replaceAll(/[,]/g, "");
            console.log(`goal at map is ${expectedGoalGraph}\ngoal at gra is ${goalAtGraph}`)
            if (goalAtGraph === expectedGoalGraph) { testStatus = true; }
            else { testStatus = false; break; }
        }
    } catch (error) {
        console.log(`${error}: No data available for selected sales person`);
    }
    return testStatus;
}
export async function checkYTDSalesTarget(page, months, salesPerson) {
    let valOfmonths = 0, testResult = false; let firstFiveGoals = 0, avgCount = 5;
    let tarSales = await getYTDTargets(page, salesPerson);
    console.log(`before add goals sales targets is: ${tarSales.replace('/', '')}`);
    for (let count = 0; count < salesPerson.length; count++) {
        await search_user(page, salesPerson[count]);
        await expect(getEleByText(page, 'Goal')).toBeVisible();
        await getEleByText(page, 'Goal').click();
        await expect(getEleByText(page, 'Appointments (Per Week)')).toBeVisible();
        //Reading the all months values
        if (count == 0) { valOfmonths = 0; }
        //Writing values into all months
        for (let [month, goal] of months) {
            await await monthGoalInPut(page, month).fill("");
            await await monthGoalInPut(page, month).fill((goal).toString());
        }
        await expect(saveButton(page)).toBeEnabled();
        await saveButton(page).click();
        await expect(getEleByText(page, 'User goals Updated.')).toBeVisible();
        await delay(page, 1200);
        let goals = await readingUserGoals(page, months, 1);
        console.log(`${salesPerson[count]}: ${goals}`)
        valOfmonths += goals[0]; firstFiveGoals += goals[1];
    }
    valOfmonths = Math.round(valOfmonths);
    tarSales = await getYTDTargets(page, salesPerson);
    console.log(`user total goals after changes save ${valOfmonths}\nafter add goals sales targets is ${tarSales.replaceAll(/[/]/g, '')}`);
    if (tarSales.includes(`${valOfmonths}`)) {
        console.log(`Sales target is updated successfully`);
        let avgGoalsGraph = await checkGoalsAtGraph(page, months, salesPerson);
        if (avgGoalsGraph) { testResult = true; }
    } else {
        console.log(`Sales target is not updated successfully`);
        testResult = false;
    }
    return testResult;
}
export async function changeUserRole_Branch(page, userEmail, userRole, branchName) {
    await search_user(page, userEmail); let count1 = 1, count2 = 3;
    let userRoleTxtUserProfile = await userRoleText(page).textContent();
    // if (userRoleTxtUserProfile == 'Sales VP') { count1 = 0, count2 = 2; }
    await getEleByText(page, 'User Profile').nth(0).click();
    await userEdit(page).click();
    //change user role
    await reactFirstDropdown(page).nth(count1).click();
    await selectReactDropdowns(page, userRole);
    //change branch
    await reactFirstDropdown(page).nth(count2).click();
    await selectReactDropdowns(page, branchName);
    await userUpdateBtn(page).nth(0).click();
    await expect(page.locator('div').filter({ hasText: /^Updated Successfully$/ }).nth(2)).toBeVisible();
    await expect(getEleByText(page, 'Edit User').nth(0)).toBeHidden(); await delay(page, 1400);
}
export async function checkBranchesForSuperUserInSalesDashboard(page, browser, userData, newPage) {
    let [url, userEmail, pWord, userRole, branchName, count] = userData, testResult = false;
    await changeUserRole_Branch(page, userEmail, userRole, branchName);
    await delay(page, 2300);
    let context;
    if (count == 0) {
        context = await browser.newContext();
        newPage = await context.newPage();
        await login_buzz_newUser(newPage, url, userEmail, pWord);
    }
    await userProfileIcon(newPage).click()
    await getEleByText(newPage, 'User Profile').nth(0).click();
    await expect(getEleByText(newPage, userEmail)).toBeVisible(); await delay(newPage, 1500);
    await getEleByText(newPage, 'Dashboard').nth(0).click();
    await salesButton(newPage).click(); await delay(newPage, 1200);
    try { await expect(filterArrow(newPage).nth(0)).toBeVisible({ timeout: 2000 }); }
    catch (error) { }
    if (await filterArrow(newPage).count() > 0) {
        await filterArrow(newPage).nth(0).click(); await delay(newPage, 4000);
    } else { console.log(`branches filter arrow not displaying for user role ${ANSI_ORANGE}${userRole}${ANSI_RESET}`) }
    let branchesCount = await branchesListSD(newPage).count();
    console.log(`branches count is ${branchesCount} for user role ${ANSI_ORANGE}${userRole}${ANSI_RESET}`)
    console.log('Displaying branches at dropdowns are:'); let branchNameSD;
    if (userRole != 'Sales') {
        for (let index = 0; index < branchesCount; index++) {
            branchNameSD = await branchesListSD(newPage).nth(index).locator("//div[1]").nth(0).textContent()
            console.log(`${branchNameSD}`)
        }
    } else { console.log(`branch is not display for user role ${ANSI_ORANGE}${userRole}${ANSI_RESET}`) }
    switch (userRole) {
        case 'Super User':
            if (branchesCount == 7) { testResult = true; }
            else { testResult = false; }
            break;
        case 'Sales Manager':
            if (branchesCount == 1) {
                if (branchName == branchNameSD) { console.log(`set branch for user is ${branchName}\ndisplaying branch at sals dashboard is ${branchNameSD}`); testResult = true; }
            } else { console.log(`${userRole} not checking`); testResult = false; }
            break;
        case 'Sales':
            if (branchesCount == 0) { testResult = true; }
            else { console.log(`${userRole} not checking`); testResult = false; }
            break;
        case 'Sales VP':
            if (branchesCount == 7) { testResult = true; }
            else { console.log(`${userRole} not checking`); testResult = false; }
            break;
        default:
            console.log(`roles are not checking`)
            break;
    }
    return [testResult, newPage];
}
export async function checkAcctsOutSideFrequency(page, salesPerson) {
    await getYTDTargets(page, salesPerson); let count = 0;
    try {
        await expect(salesValue(page)).toBeVisible();
        if (await getEleByText(page, 'View all').count() > 1) { count = 1; }
        await getEleByText(page, 'View all').nth(count).click()
        await expect(getEleContText(page, 'Last met on').nth(0)).toBeVisible();
        let totalGridRows = await page.locator("(//*[contains(@id,'row-count')])[2]").textContent();
        let expectedRows = await salesValue(page).textContent();
        console.log(`expected rows ${expectedRows} for ${salesPerson}\nactual rows ${totalGridRows} for ${salesPerson}`);
        if (totalGridRows == expectedRows) { await page.getByTitle("Close").click(); return true; }
        else { return false; }
    } catch (error) {
        console.log(error); return false;
    }
}
export async function navigateToDashBoard(browser, url, userEmail, pWord, count) {
    let newPage, context;
    if (count == 0) {
        context = await browser.newContext();
        newPage = await context.newPage();
        await login_buzz_newUser(newPage, url, userEmail, pWord);
    }
    await login_buzz_newUser(newPage, url, userEmail, pWord);
    await userProfileIcon(newPage).click()
    await getEleByText(newPage, 'User Profile').nth(0).click();
    await expect(getEleByText(newPage, userEmail)).toBeVisible(); await delay(newPage, 1500);
    await getEleByText(newPage, 'Dashboard').nth(0).click();
    await salesButton(newPage).click(); await delay(newPage, 1200);
    try { await expect(filterArrow(page).nth(0)).toBeVisible({ timeout: 2000 }); }
    catch (error) { }
    return newPage;
}
export async function checkSalesManagersViewingInTheirOwnBranch(page, browser, requiredData) {
    const [url, userEmail, pWord, userRole, branchName, count] = requiredData; let checkingStatus = false;
    await changeUserRole_Branch(page, userEmail, userRole, branchName);
    await delay(page, 2300);
    let newPage = await navigateToDashBoard(browser, url, userEmail, pWord, count); await delay(page, 2300);
    try { await expect(filterArrow(newPage).nth(0)).toBeVisible({ timeout: 2000 }); }
    catch (error) { }
    if (await filterArrow(newPage).count() > 0) {
        await filterArrow(newPage).nth(0).click(); await delay(newPage, 4000);
    } else { console.log(`branches filter arrow not displaying for user role ${ANSI_ORANGE}${userRole}${ANSI_RESET}`) }
    let branches = await branchesListSD(newPage);
    console.log('branches count is ', await branches.count())
    for (let index = 0; index < await branches.count(); index++) {
        let dropBranchName = await branches.nth(index).textContent();
        console.log(`${userRole} branch is ${branchName}\nDropdown branch is ${dropBranchName}`)
        if (dropBranchName == branchName) {
            for (let index = 0; index < await branches.count(); index++) {
                let sPerson = await branches.nth(index).locator("//div[2]/div");
                for (let sp = 0; sp < await sPerson.count(); sp++) {
                    let sPerName = await sPerson.nth(sp).textContent();
                    console.log('saleperson name ', sPerName);
                    if (salesPerson[s] == sPerName) {
                        console.log(`${userRole} is found in ${branchName}`)
                        let viewLink = await salesValue(page).nth(0).locator("//span/a");
                        if (await viewLink.count() > 0) {
                            console.log(`view link is enabled for ${userRole} at Accounts Outside Appointment Frequency`)
                            console.log(`link is ${await viewLink.nth(0).getAttribute('href')}`)
                        } else {
                            console.log(`view link is disbled for ${userRole} at Accounts Outside Appointment Frequency`)
                        }
                        console.log(`${sPerName} found in ${await branches.nth(index).locator("//div[1]").nth(0).textContent()} branch`);
                        checkingStatus = true; break;
                    } else { console.log(`${userRole} is not found in ${branchName}`); checkingStatus = false; }
                }
            }
            break;
        } else {

        }
        let sPerson = await branches.nth(index).locator("//div[2]/div");
    }
}
