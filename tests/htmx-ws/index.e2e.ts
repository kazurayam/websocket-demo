// tests/htmx-ws/index.test.ts
import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import * as PW from '@playwright/test';
import { BrowserDriverChromium } from '../shared/BrowserDriverChromium';

const url = 'http://localhost:8080/';

describe(`test the chat page`, async () => {
    // Here I assume that the server at http://localhost:8080 is already up and running.
    let driver: BrowserDriverChromium;
    let page: PW.Page;
    beforeAll(async () => {
        driver = await BrowserDriverChromium.create('/', { headless: true });
    });
    beforeEach(async () => {
        page = await driver.navigateToUrl(url);
    }, 20_000);

    test("make sure the correct serverName is shown", async () => {
        // Select the serverName
        const li: PW.Locator = page.getByText('htmx-ws/index.ts', {exact: false});
        // make sure the button is clickable
        await li.waitFor({ state: 'visible', timeout: 5000 });
        await PW.expect(li).toBeVisible();
    });

    afterEach(async () => {
        await page.close();
    });
    afterAll(async () => {
        driver.close();
    });
})

async function delay(timeoutMs: number) {
    await new Promise(resolve => setTimeout(resolve, timeoutMs));
}
