import { expect } from "@playwright/test";
import { stage_api_url } from "../tests/helper";
import { testData } from "./TestData";

export const token = testData.token;
export const apiURL = process.env.BASE_API_BUZZ;

export async function getAPIResponse(request, api_path) {
    const context = await request.newContext({
        ignoreHTTPSErrors: true,
        extraHTTPHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
    const response = await context.get(`${apiURL}${api_path}`);
    expect(response.status()).toBe(200);
    let apiResult = await response.json();
    // apiResult = JSON.stringify(apiResult, null, 2);
    return apiResult;
}
export async function postAPIResponse(request, api_path, postData) {
    const context = await request.newContext({
        ignoreHTTPSErrors: true,
        extraHTTPHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
    // console.log(`url is ${apiURL}`);
    const response = await context.post(`${apiURL}${api_path}`, {
        data: JSON.stringify(postData),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    try {
        expect(response.status()).toBe(200);
    } catch (error) {
    }
    let quote = await response.json();
    return quote;
}