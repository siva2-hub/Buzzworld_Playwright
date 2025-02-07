const date = new Date().toDateString(); let results = false;
const currentDate = new Date(date);
let day = currentDate.getDate();
let previuosMonth = currentDate.getMonth();
const year = currentDate.getFullYear();

//storing locators
const reportsLink = (page) => { return page.locator("//span[normalize-space()='Reports']"); }
const pointOfSalesLink = (page) => { return page.getByText('Point of Sales'); }
const selectReportDropDown = (page) => { return page.getByText('Select Report') };
const selectMonthFiled = (page) => { return page.locator("(//*[contains(@class,'react-select__control')])[1]") }
const selectYearFiled = (page) => { return page.locator("(//*[contains(@class,'react-select__control')])[2]") }



async function navigateToPOSReports(page) {
    await reportsLink(page).click();
    await pointOfSalesLink(page).click();
    return selectReportDropDown(page);
}
async function checkPrviousMonthandCurrentYearPrefil(page) {
    if (previuosMonth === 0) {
        previuosMonth = '0';
    }
    let results = false;
    if (previuosMonth.toString().length < 2) {
        previuosMonth = '0' + previuosMonth;
    }
    console.log('previous month: ' + previuosMonth);
    //navigate to POS Reports page
    await navigateToPOSReports(page);
    //reading the prefilled month from Month field
    const actualMonth = await selectMonthFiled(page).textContent();
    //reading the prefilled year from Year field
    const actualYear = await selectYearFiled(page).textContent();
    //verifying previousmonth index value
    if (previuosMonth === '0') {
        //checking the expected motnh prefilled or not in the Month and Year Fields
        if ((actualMonth === '12') && (Number(actualYear) === (year - 1))) {
            console.log('this is first month of the year so we displaying last year last month');
            results = true;
        }
        else { results = false; }
    } else {
        if (previuosMonth === actualMonth && year === Number(actualYear)) { results = true; }
        else { results = false; }
    }
    console.log('expected month: ' + previuosMonth + ' actual month: ' + actualMonth);
    console.log('expected year: ' + year + ' actual year: ' + actualYear);
    if (results) { } else { throw new Error("getting error while prefilling the POS dates"); }
}
module.exports = {
    navigateToPOSReports,
    checkPrviousMonthandCurrentYearPrefil
}