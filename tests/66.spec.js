const { test } = require("@playwright/test");
const { login_buzz } = require("./helper");

const stage_url = process.env.BASE_URL_BUZZ;
let page, results, context;
test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  page = await context.newPage()
  await login_buzz(page, stage_url);
});

test("POS reports prefil previous month and current", async()=>{
    
});
test("Revice the old version", async()=>{
    
});
test("display the GP for grand total", async()=>{
    
});
test("", async()=>{
    
});