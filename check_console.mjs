import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const logs = [];

    page.on('console', msg => {
        logs.push(`[PAGE CONSOLE] ${msg.type().toUpperCase()} ${msg.text()}`);
    });

    page.on('pageerror', err => {
        logs.push(`[PAGE ERROR] ${err.toString()}`);
    });

    page.on('requestfailed', request => {
        logs.push(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
    });

    try {
        await page.goto('http://127.0.0.1:3002', { waitUntil: 'networkidle0', timeout: 10000 });
        logs.push('Page loaded successfully within Puppeteer.');
    } catch (error) {
        logs.push(`Error loading page: ${error}`);
    }

    fs.writeFileSync('puppeteer_logs.json', JSON.stringify(logs, null, 2));
    await browser.close();
})();
