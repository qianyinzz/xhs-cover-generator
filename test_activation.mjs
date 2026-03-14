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
        logs.push('Page loaded successfully within Puppeteer.');

        // Screenshot 1: Activation Modal Check
        await page.screenshot({ path: 'activation_modal_test.png' });

        // Type PIN and submit
        await page.type('input[type="text"]', '83921');
        await page.click('button[type="submit"]');

        // Wait for network and DOM to settle (unlock transition)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Screenshot 2: Unlocked App
        await page.screenshot({ path: 'app_unlocked_test.png' });
        logs.push('Unlock sequence complete.');

    } catch (error) {
        logs.push(`Error loading page: ${error}`);
    } finally {
        fs.writeFileSync('puppeteer_activation_logs.json', JSON.stringify(logs, null, 2));
        await browser.close();
    }
})();
