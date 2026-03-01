import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const categories = ['seating', 'tables', 'storage', 'workstations'];

    for (const cat of categories) {
        console.log(`Scraping category: ${cat}`);
        try {
            await page.goto(`https://www.catalogindia.in/categories/${cat}`, { waitUntil: 'networkidle2' });

            const products = await page.evaluate(() => {
                return [...document.querySelectorAll('.product-card')].map(el => {
                    const nameEl = el.querySelector('.product-card-head h3');
                    const imgs = [...el.querySelectorAll('.product-card-img img')];
                    return {
                        name: nameEl ? (nameEl as HTMLElement).innerText.trim() : null,
                        images: imgs.map(img => (img as HTMLImageElement).src).filter(src => !src.includes('data:image')),
                        description: null
                    };
                });
            });

            const filePath = path.resolve(__dirname, `catalog-${cat}.json`);
            fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
            console.log(`Saved ${products.length} products to catalog-${cat}.json`);
        } catch (err) {
            console.error(`Failed to scrape ${cat}:`, err);
        }
    }

    await browser.close();
    console.log("Done.");
}

main().catch(console.error);
