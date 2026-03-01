const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../scraped_catalog.json');
const outputPath = path.join(__dirname, '../lib/catalog.ts');

const rawData = fs.readFileSync(catalogPath, 'utf-8');
const catalog = JSON.parse(rawData);

// The exact interfaces we want in the file
const interfaceDefinitions = `export interface ProductVariant {
    id: string;
    variantName: string; // e.g., "With Headrest", "Without Headrest"
    proplessImages: string[]; // Exactly 3 images requested
}

export interface ProductInfo {
    overview: string;
    features: string[];
    dimensions: string;
    materials: string[];
}

export interface Product {
    id: string;
    name: string;
    description: string;
    flagshipImage: string;
    sceneImages: string[];
    variants: ProductVariant[];
    detailedInfo: ProductInfo;
}

export interface Series {
    id: string;
    name: string;
    description: string;
    products: Product[];
}

export interface Category {
    id: string;
    name: string;
    description: string;
    series: Series[];
}

`;

function migrateProduct(oldProduct) {
    const imageUrl = oldProduct.imageUrl || '/placeholder.jpg';

    // Inject custom prototype data for Fluid X
    if (oldProduct.id === 'fluid-x') {
        return {
            id: 'fluid-x',
            name: 'Fluid X',
            description: 'The ultimate ergonomic mesh chair designed for all-day comfort. Featuring dynamic lumbar support, breathable premium mesh, and customized adjustments for your exact working posture.',
            flagshipImage: '/assets/products/seating/fluid-x/flagship.jpg',
            sceneImages: [
                '/assets/products/seating/fluid-x/scene-1.jpg',
                '/assets/products/seating/fluid-x/scene-2.jpg',
                '/assets/products/seating/fluid-x/scene-3.jpg'
            ],
            variants: [
                {
                    id: 'standard',
                    variantName: 'Standard Configuration',
                    proplessImages: [
                        '/assets/products/seating/fluid-x/propless-1.jpg',
                        '/assets/products/seating/fluid-x/propless-2.jpg',
                        '/assets/products/seating/fluid-x/propless-3.jpg'
                    ]
                },
                {
                    id: 'with-headrest',
                    variantName: 'Executive with Headrest',
                    proplessImages: [
                        '/assets/products/seating/fluid-x/propless-h-1.jpg',
                        '/assets/products/seating/fluid-x/propless-h-2.jpg',
                        '/assets/products/seating/fluid-x/propless-h-3.jpg'
                    ]
                }
            ],
            detailedInfo: {
                overview: 'Experience the pinnacle of ergonomic design with the Fluid X. Crafted for modern professionals, it seamlessly blends intuitive adjustments with continuous dynamic support to elevate any workspace.',
                features: [
                    "Dynamic auto-adjusting lumbar support",
                    "Premium breathable elastomeric mesh",
                    "4D adjustable armrests",
                    "Synchronized tilt mechanism with 4 locking positions",
                    "Built to rigorous BIFMA standards"
                ],
                dimensions: "Overall Size: 680W x 640D x 1000-1100H (mm)",
                materials: ["Glass-filled nylon frame", "High-tensile Korean mesh", "Aluminum base"]
            }
        };
    }

    // Create a robust default structure that satisfies the new TS interfaces
    return {
        id: oldProduct.id,
        name: oldProduct.name,
        description: oldProduct.description || ('The ' + oldProduct.name + ' is a premium addition to our catalog.'),
        flagshipImage: imageUrl,
        sceneImages: [imageUrl, imageUrl, imageUrl], // Fallbacks until real scenes are added
        variants: [
            {
                id: 'standard',
                variantName: 'Standard Configuration',
                proplessImages: [imageUrl, imageUrl, imageUrl] // Fallbacks
            }
        ],
        detailedInfo: {
            overview: ('Experience the pinnacle of design with the ' + oldProduct.name + '. Crafted for modern professionals, it seamlessly blends form and function to elevate any workspace.'),
            features: [
                "Ergonomic design for all-day comfort",
                "Premium, high-durability materials",
                "Sleek, architectural aesthetic",
                "Built to BIFMA standards"
            ],
            dimensions: "Standard Dimensions (Refer to spec sheet)",
            materials: ["Engineered structure", "Premium finish"]
        }
    };
}

const newCatalog = catalog.map(category => ({
    ...category,
    series: category.series.map(series => ({
        ...series,
        products: series.products.map(migrateProduct)
    }))
}));

const tsContent = interfaceDefinitions + "export const catalogCatalog: Category[] = " + JSON.stringify(newCatalog, null, 4) + ";\n";

fs.writeFileSync(outputPath, tsContent, 'utf-8');
console.log('Successfully migrated catalog.ts to the new Product interface.');
