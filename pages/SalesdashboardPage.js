import { expect } from "@playwright/test";
import { getEleByText } from "./PricingPages";
import { delay, search_user } from "../tests/helper";
export const ytdSalesTarget = (page) => { return page.locator("//*[@class='appointments-target']") }
export const filterArrow = (page) => { return page.locator("//*[@class='arrow']") }
export const selectBranch = (page, branchName) => { return page.getByRole('button', { name: `${branchName} Expand node` }) }
export const applyButton = (page) => { return page.getByRole('button', { name: 'Apply' }) }
export const selectSalesPerson = (page, salesPerson) => { return page.getByRole('button', { name: salesPerson }) }
export const saveButton = (page) => { return page.getByRole('button', { name: 'Save' }) }
export const salesButton = (page) => { return page.locator("//*[text()='Sales' and @class='link-icon-text']") }
export const avgGoalsSalesDashB = (page) => { return page.locator("(//*[contains(@class,'recharts-reference-line')])[2]") }

export async function getYTDTargets(page, salesPerson) {
    await getEleByText(page, 'Dashboard').nth(0).click();
    await salesButton(page).click();
    await filterArrow(page).nth(0).click(); await delay(page, 4000);
    //*[@class='tree-select-dropdown']/div/div[1]/div[2]/div
    for (let s = 0; s < salesPerson.length; s++) {
        let branches = await page.locator("//*[@class='tree-select-dropdown']/div/div");
        console.log('branches count is ', await branches.count())
        for (let index = 0; index < await branches.count(); index++) {
            let sPerson = await branches.nth(index).locator("//div[2]/div");
            let status = false;
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
    await applyButton(page).click();
    await expect(page.getByText('Filter Applied')).toBeVisible();
    await expect(ytdSalesTarget(page).nth(1)).toBeVisible();
    let tarSales = await ytdSalesTarget(page).nth(1).textContent();
    return tarSales.replaceAll(/[$,]/g, '');
}
export async function readingUserGoals(page, months, count) {
    let valOfmonths = 0, firstFiveMonths = 0; let avgCount = 0;
    //reading all months goals
    for (let index = 0; index < months.length; index++) {
        // let valOfmonth = await page.getByPlaceholder(`Enter value for ${months[index]}`).getAttribute('value');
        let valOfmonth = await page.getByRole('textbox', { name: months[index].toLowerCase() }).getAttribute('value');
        valOfmonths = parseFloat((valOfmonths + parseFloat(valOfmonth)).toFixed("2"));
        //reading first five months goals
        if (index < 5) {
            firstFiveMonths = parseFloat((firstFiveMonths + parseFloat(valOfmonth)).toFixed("2"));
            avgCount = avgCount + 1;
        }
    }
    if (count == 0) { valOfmonths = 0; firstFiveMonths = 0 }
    console.log(`before add values, values of all months ${valOfmonths}`);
    console.log(`before add values, values of first five months ${firstFiveMonths}`);
    return [valOfmonths, firstFiveMonths, avgCount];
}
export async function checkGoalsAtGraph(page) {
    let avgGoalsLine;
    try {
        await expect(getEleByText(page, 'No data available for selected sales person').nth(0)).toBeHidden({ timeout: 3000 })
        avgGoalsLine = await avgGoalsSalesDashB(page).getAttribute('y');
    } catch (error) {
        console.log('No data available for selected sales person');
    }
    return avgGoalsLine;
}
export async function checkYTDSalesTarget(page, months, salesPerson, appendValue) {
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
        await readingUserGoals(page, months, count);
        //Writing values into all months
        for (let index = 0; index < months.length; index++) {
            await page.getByPlaceholder(`Enter value for ${months[index]}`).fill((index + appendValue).toString());
        }
        await delay(page, 1200);
        let goals = await readingUserGoals(page, months, 1);
        valOfmonths += goals[0]; firstFiveGoals += goals[1];
        // avgCount += goals[2]
        await expect(saveButton(page)).toBeEnabled();
        await saveButton(page).click();
        await expect(getEleByText(page, 'User goals Updated.')).toBeVisible();
    }
    valOfmonths = Math.round(valOfmonths);
    tarSales = await getYTDTargets(page, salesPerson);
    console.log(`user total goals after changes save ${valOfmonths}\nafter add goals sales targets is ${tarSales.replaceAll(/[/]/g, '')}`);
    if (tarSales.includes(`${valOfmonths}`)) {
        console.log(`Sales target is updated successfully`);
        let avgGoalsGraph = await checkGoalsAtGraph(page);
        let firstFiveGoalsAvg = (firstFiveGoals / avgCount);
        // console.log('first five months values ', firstFiveGoals)
        // console.log('first five months count is ', avgCount);
        console.log(`avg goals values after save, in the user goals is ${firstFiveGoalsAvg}\nafter adding goals to user avg goals in the Sales grapgh is ${avgGoalsGraph}`)
        if (firstFiveGoalsAvg == avgGoalsGraph) {
            testResult = true;
        }
    } else {
        console.log(`Sales target is not updated successfully`);
        testResult = false;
    }
    return testResult;
}
