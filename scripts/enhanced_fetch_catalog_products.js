const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '..', 'lib', 'catalog.ts');

// Catalog India category URLs
const catalogCategoryUrls = [
    'https://www.catalogindia.in/categories/workstations',
    'https://www.catalogindia.in/categories/tables',
    'https://www.catalogindia.in/categories/storage',
    'https://www.catalogindia.in/categories/soft-seating',
    'https://www.catalogindia.in/categories/seating',
    'https://www.catalogindia.in/categories/educational'
];

// Enhanced image extraction with better selectors
async function extractProductImages($, productUrl) {
    const images = [];
    
    // Try multiple selectors for product images
    const selectors = [
        '.gallery img',
        '.product-gallery img',
        '.image-gallery img',
        '.swiper-slide img',
        '.product-image',
        'img[src*="products"]',
        'img[src*="product"]',
        'img[alt*="product"]',
        'img[alt*="chair"]',
        'img[alt*="table"]',
        'img[alt*="desk"]'
    ];
    
    for (const selector of selectors) {
        $(selector).each((i, elem) => {
            const src = $(elem).attr('src');
            if (src && !src.includes('logo') && !src.includes('icon')) {
                const fullUrl = src.startsWith('http') ? src : `https://www.catalogindia.in${src}`;
                if (!images.includes(fullUrl)) {
                    images.push(fullUrl);
                }
            }
        });
        if (images.length > 0) break;
    }
    
    return images;
}

// Enhanced specification extraction
async function extractProductSpecs($) {
    const specs = {};
    const features = [];
    
    // Try multiple selectors for specifications
    const specSelectors = [
        '.specs tr',
        '.specifications tr',
        '.features li',
        '.spec-list li',
        '.product-details tr',
        'table tr'
    ];
    
    for (const selector of specSelectors) {
        $(selector).each((i, elem) => {
            const key = $(elem).find('td:first-child, th:first-child, dt').text().trim();
            const value = $(elem).find('td:last-child, dd').text().trim();
            if (key && value && key.length < 50 && value.length < 100) {
                specs[key] = value;
            }
        });
    }
    
    // Extract features from lists
    $('ul li, ol li').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text && text.length > 10 && text.length < 150 && !text.includes('\n')) {
            features.push(text);
        }
    });
    
    return { specs, features: features.slice(0, 8) };
}

async function fetchProductData(productUrl) {
    try {
        console.log(`Fetching enhanced product data from: ${productUrl}`);
        const response = await axios.get(productUrl);
        const $ = cheerio.load(response.data);
        
        // Extract product name
        const productName = $('h1').text().trim() || 
                           $('title').text().split('|')[0].trim() ||
                           productUrl.split('/').pop().replace(/[-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Extract description
        const metaDescription = $('meta[name="description"]').attr('content') || '';
        const firstParagraph = $('p').first().text().trim();
        const description = metaDescription || firstParagraph || 'Premium furniture solution from Catalog India';
        
        // Extract images
        const images = await extractProductImages($, productUrl);
        
        // Extract specifications and features
        const { specs, features } = await extractProductSpecs($);
        
        // Determine category based on URL
        let category = 'furniture';
        if (productUrl.includes('seating')) category = 'seating';
        if (productUrl.includes('tables')) category = 'tables';
        if (productUrl.includes('storage')) category = 'storage';
        if (productUrl.includes('educational')) category = 'educational';
        if (productUrl.includes('workstations')) category = 'workstations';
        if (productUrl.includes('soft-seating')) category = 'soft-seating';
        
        // Create better product data structure
        return {
            id: productUrl.split('/').pop().toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: productName,
            description: description.substring(0, 200),
            flagshipImage: images.length > 0 ? images[0] : '/images/catalog/placeholder.webp',
            sceneImages: images.slice(1, 4),
            variants: [{
                id: 'standard',
                variantName: 'Standard Model',
                galleryImages: images.length >= 7 ? 
                    images.slice(0, 7) : 
                    images.concat(Array(7 - images.length).fill('/images/catalog/placeholder.webp'))
            }],
            detailedInfo: {
                overview: description,
                features: features.length > 0 ? features : [
                    'Ergonomic design for comfort',
                    'Premium quality materials',
                    'Durable construction',
                    'Modern aesthetic appeal',
                    'Catalog quality certification'
                ],
                dimensions: specs['Dimensions'] || specs['Size'] || 'Customizable to requirements',
                materials: specs['Materials'] ? [specs['Materials']] : ['High-quality materials']
            },
            metadata: {
                source: 'catalogindia.in',
                category: category,
                bifmaCertified: true,
                warrantyYears: specs['Warranty'] ? parseInt(specs['Warranty']) || 5 : 5,
                specifications: specs
            }
        };
    } catch (error) {
        console.error(`Error fetching product ${productUrl}:`, error.message);
        return null;
    }
}

// Main function to run the enhanced scraping
async function main() {
    try {
        console.log('Starting enhanced Catalog product scraping...');
        
        // Test with a few specific product URLs first
        const testUrls = [
            'https://www.catalogindia.in/products/curvivo',
            'https://www.catalogindia.in/products/myel',
            'https://www.catalogindia.in/products/exquisite'
        ];
        
        const products = [];
        for (const url of testUrls) {
            const productData = await fetchProductData(url);
            if (productData) {
                // Determine category from URL
                if (url.includes('myel')) productData.category = 'seating';
                if (url.includes('exquisite')) productData.category = 'tables';
                if (url.includes('curvivo')) productData.category = 'workstations';
                
                products.push(productData);
                console.log(`✓ Successfully fetched: ${productData.name}`);
            }
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        if (products.length > 0) {
            // Integrate into catalog
            integrateIntoCatalog(products);
            console.log('Enhanced product data integration completed!');
        } else {
            console.log('No products were fetched successfully');
        }
        
    } catch (error) {
        console.error('Error in enhanced scraping:', error);
    }
}

// Integration function (same as before)
function integrateIntoCatalog(products) {
    if (products.length === 0) return;
    
    let catalogContent = fs.readFileSync(catalogPath, 'utf-8');
    
    const productsByCategory = {};
    products.forEach(product => {
        if (!productsByCategory[product.category]) {
            productsByCategory[product.category] = [];
        }
        productsByCategory[product.category].push(product);
    });
    
    const catalogCategories = [];
    for (const [categoryName, categoryProducts] of Object.entries(productsByCategory)) {
        const category = {
            id: `catalog-${categoryName}`,
            name: `Catalog ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}`,
            description: `Premium ${categoryName} solutions from Catalog India`,
            series: [{
                id: `catalog-${categoryName}-series`,
                name: `Catalog ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Series`,
                description: `High-quality ${categoryName} designed for modern workspaces`,
                products: categoryProducts
            }]
        };
        catalogCategories.push(category);
    }
    
    const catalogCatalogString = JSON.stringify(catalogCategories, null, 2)
        .replace(/"([^"]+)":/g, '$1:')
        .replace(/"([^"]+)"/g, '"$1"');
    
    if (catalogContent.includes('export const catalogCatalog: Category[] = [')) {
        const newCatalogContent = catalogContent.replace(
            'export const catalogCatalog: Category[] = [',
            `export const catalogCatalog: Category[] = [
    ${catalogCatalogString.substring(1, catalogCatalogString.length - 1)},`
        );
        
        fs.writeFileSync(catalogPath, newCatalogContent, 'utf-8');
        console.log(`Integrated ${products.length} enhanced Catalog products`);
    }
}

// Run the enhanced script
main().catch(console.error);