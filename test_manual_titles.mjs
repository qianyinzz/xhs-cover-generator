import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const logs = [];

    page.on('console', msg => logs.push(`[PAGE CONSOLE] ${msg.type().toUpperCase()} ${msg.text()}`));
    page.on('requestfailed', request => {
        logs.push(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
    });

    try {
        await page.goto('http://127.0.0.1:3002', { waitUntil: 'networkidle0', timeout: 10000 });

        // Unlock App
        await page.type('input[type="text"]', '83921');
        await page.click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Navigate to Titles Tab
        const labels = await page.$$('button');
        for (const label of labels) {
            const text = await page.evaluate(el => el.textContent, label);
            if (text.includes('爆款标题')) {
                await label.click();
                break;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 500));

        // Test Manual Title Input
        const inputField = await page.waitForSelector('input[placeholder="例如：早八打工人必备的神仙平替"]');
        if (inputField) {
            await inputField.type('我的打工日记');
            await page.keyboard.press('Enter');
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        await page.screenshot({ path: 'manual_titles_test.png' });
        logs.push('Manual title test complete.');

    } catch (error) {
        logs.push(`Error running test: ${error}`);
    } finally {
        fs.writeFileSync('puppeteer_titles_logs.json', JSON.stringify(logs, null, 2));
        await browser.close();
    }
})();
