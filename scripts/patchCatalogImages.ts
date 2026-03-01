import { Project, SyntaxKind, ArrayLiteralExpression, ObjectLiteralExpression, PropertyAssignment, StringLiteral } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

interface ScrapedProduct {
    name: string;
    images: string[];
    description: string | null;
}

const getScrapedData = (cat: string): ScrapedProduct[] => {
    try {
        const file = fs.readFileSync(path.resolve(__dirname, `catalog-${cat}.json`), 'utf-8');
        return JSON.parse(file);
    } catch {
        return [];
    }
}

async function main() {
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath('lib/catalog.ts');

    const oandoCatalogVar = sourceFile.getVariableDeclaration('oandoCatalog');
    if (!oandoCatalogVar) throw new Error("Could not find oandoCatalog");

    const initializer = oandoCatalogVar.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    const categories = initializer.getElements().filter(e => e.isKind(SyntaxKind.ObjectLiteralExpression)) as ObjectLiteralExpression[];

    for (const cat of categories) {
        const catNameProp = cat.getProperty('category')?.asKind(SyntaxKind.PropertyAssignment) || cat.getProperty('name')?.asKind(SyntaxKind.PropertyAssignment);
        if (!catNameProp) continue;
        const catName = (catNameProp.getInitializerIfKindOrThrow(SyntaxKind.StringLiteral) as StringLiteral).getLiteralValue().toLowerCase();

        let scrapeCat = '';
        if (catName.includes('seating')) scrapeCat = 'seating';
        else if (catName.includes('tables')) scrapeCat = 'tables';
        else if (catName.includes('storage')) scrapeCat = 'storage';
        else if (catName.includes('workstation')) scrapeCat = 'workstations';
        else continue;

        const scrapedProducts = getScrapedData(scrapeCat);
        if (!scrapedProducts || scrapedProducts.length === 0) continue;

        const seriesProp = cat.getProperty('series')?.asKind(SyntaxKind.PropertyAssignment);
        if (!seriesProp) continue;

        const seriesArr = seriesProp.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
        for (const ser of seriesArr.getElements()) {
            if (!ser.isKind(SyntaxKind.ObjectLiteralExpression)) continue;
            const productsProp = ser.getProperty('products')?.asKind(SyntaxKind.PropertyAssignment);
            if (!productsProp) continue;
            const productsArr = productsProp.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);

            for (const prod of productsArr.getElements()) {
                if (!prod.isKind(SyntaxKind.ObjectLiteralExpression)) continue;

                const prodNameProp = prod.getProperty('name')?.asKind(SyntaxKind.PropertyAssignment);
                if (!prodNameProp) continue;
                const prodName = prodNameProp.getInitializerIfKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue();

                // Find a match in the scraped data (case-insensitive, roughly matching)
                const match = scrapedProducts.find(s => s.name && s.name.toLowerCase().includes(prodName.toLowerCase()));

                if (match && match.images && match.images.length > 0) {
                    const images = match.images;
                    const flagship = images[0];
                    const others = images.slice(1);

                    const flagshipProp = prod.getProperty('flagshipImage')?.asKind(SyntaxKind.PropertyAssignment);
                    if (flagshipProp) {
                        const currentVal = flagshipProp.getInitializerIfKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue();
                        if (!currentVal || currentVal === "") {
                            flagshipProp.setInitializer(`"${flagship}"`);
                        }
                    }

                    const sceneProp = prod.getProperty('sceneImages')?.asKind(SyntaxKind.PropertyAssignment);
                    if (sceneProp && others.length > 0) {
                        const arr = sceneProp.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
                        if (arr.getElements().length === 0) {
                            sceneProp.setInitializer(`[${others.map(img => `"${img}"`).join(', ')}]`);
                        }
                    }
                }
            }
        }
    }

    sourceFile.saveSync();
    console.log(`Catalog matching complete. Patch saved to lib/catalog.ts`);
}

main().catch(console.error);
