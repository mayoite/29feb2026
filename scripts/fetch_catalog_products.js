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

async function fetchProductUrlsFromCategory(categoryUrl) {
    try {
        console.log(`Fetching products from category: ${categoryUrl}`);
        const response = await axios.get(categoryUrl);
        const $ = cheerio.load(response.data);
        
        const productUrls = [];
        // Look for product links - this selector might need adjustment based on actual page structure
        $('a[href*="/products/"]').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && !href.includes('#') && !productUrls.includes(href)) {
                productUrls.push(href);
            }
        });
        
        return productUrls.map(url => 
            url.startsWith('http') ? url : `https://www.catalogindia.in${url}`
        );
    } catch (error) {
        console.error(`Error fetching category ${categoryUrl}:`, error.message);
        return [];
    }
}

async function fetchProductData(productUrl) {
    try {
        console.log(`Fetching product data from: ${productUrl}`);
        const response = await axios.get(productUrl);
        const $ = cheerio.load(response.data);
        
        // Extract product information with better selectors
        const productName = $('h1').first().text().trim() || 
                           $('title').text().split('|')[0].trim() ||
                           productUrl.split('/').pop().replace(/[-]/g, ' ');
        
        const description = $('meta[name="description"]').attr('content') ||
                           $('p').first().text().trim() ||
                           'Premium furniture solution from Catalog India';
        
        // Extract images
        const images = [];
        $('img').each((i, elem) => {
            const src = $(elem).attr('src');
            if (src && src.includes('products') && !src.includes('logo') && !src.includes('icon')) {
                const fullUrl = src.startsWith('http') ? src : `https://www.catalogindia.in${src}`;
                images.push(fullUrl);
            }
        });
        
        // Extract specifications and features
        const features = [];
        $('li, .feature-item, .spec-item').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text && text.length > 10 && !features.includes(text)) {
                features.push(text);
            }
        });
        
        // Determine category based on URL
        let category = 'furniture';
        if (productUrl.includes('seating')) category = 'seating';
        if (productUrl.includes('tables')) category = 'tables';
        if (productUrl.includes('storage')) category = 'storage';
        if (productUrl.includes('educational')) category = 'educational';
        if (productUrl.includes('workstations')) category = 'workstations';
        
        return {
            id: productUrl.split('/').pop().toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: productName,
            description: description.substring(0, 200), // Limit description length
            flagshipImage: images.length > 0 ? images[0] : '/images/catalog/placeholder.webp',
            sceneImages: images.slice(1, 4), // Use next 3 images as scene images
            variants: [{
                id: 'standard',
                variantName: 'Standard Configuration',
                galleryImages: images.slice(0, 7).length >= 7 ? 
                    images.slice(0, 7) : 
                    images.concat(Array(7 - images.length).fill('/images/catalog/placeholder.webp'))
            }],
            detailedInfo: {
                overview: description,
                features: features.length > 0 ? features.slice(0, 5) : [
                    'Ergonomic design',
                    'Premium materials',
                    'Durable construction',
                    'Modern aesthetics',
                    'Catalog quality guarantee'
                ],
                dimensions: 'Customizable dimensions',
                materials: ['Premium materials', 'Eco-friendly components']
            },
            metadata: {
                source: 'catalogindia.in',
                category: category,
                bifmaCertified: true,
                warrantyYears: 5
            }
        };
    } catch (error) {
        console.error(`Error fetching product ${productUrl}:`, error.message);
        return null;
    }
}

async function getAllCatalogProducts() {
    console.log('Starting Catalog product scraping...');
    
    const allProducts = [];
    const categories = {};
    
    // First, get all product URLs from each category
    for (const categoryUrl of catalogCategoryUrls) {
        const categoryName = categoryUrl.split('/').pop();
        const productUrls = await fetchProductUrlsFromCategory(categoryUrl);
        
        console.log(`Found ${productUrls.length} products in ${categoryName}`);
        
        // Fetch each product's data
        for (const productUrl of productUrls.slice(0, 3)) { // Limit to 3 products per category for demo
            const productData = await fetchProductData(productUrl);
            if (productData) {
                productData.category = categoryName;
                allProducts.push(productData);
            }
            // Add delay to be respectful to the server
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Add delay between categories
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return allProducts;
}

function integrateIntoCatalog(products) {
    if (products.length === 0) {
        console.log('No products to integrate');
        return;
    }
    
    // Read existing catalog
    let catalogContent = fs.readFileSync(catalogPath, 'utf-8');
    
    // Group products by category
    const productsByCategory = {};
    products.forEach(product => {
        if (!productsByCategory[product.category]) {
            productsByCategory[product.category] = [];
        }
        productsByCategory[product.category].push(product);
    });
    
    // Create Catalog categories
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
    
    // Add Catalog categories to the catalog
    const catalogCatalogString = JSON.stringify(catalogCategories, null, 2)
        .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys for TypeScript
        .replace(/"([^"]+)"/g, '"$1"'); // Keep quotes for string values
    
    // Simple replacement - in production, you'd want a proper TypeScript parser
    if (catalogContent.includes('export const catalogCatalog: Category[] = [')) {
        const newCatalogContent = catalogContent.replace(
            'export const catalogCatalog: Category[] = [',
            `export const catalogCatalog: Category[] = [
    ${catalogCatalogString.substring(1, catalogCatalogString.length - 1)},`
        );
        
        fs.writeFileSync(catalogPath, newCatalogContent, 'utf-8');
        console.log(`Successfully integrated ${products.length} Catalog products into catalog.ts`);
        console.log(`Created ${catalogCategories.length} Catalog categories`);
    } else {
        console.log('Could not find catalogCatalog export in catalog.ts');
    }
}

function checkDependencies() {
    try {
        require('axios');
        require('cheerio');
        return true;
    } catch (error) {
        console.log('\nRequired dependencies not found. Please install them first:');
        console.log('npm install axios cheerio');
        return false;
    }
}

async function main() {
    if (!checkDependencies()) {
        return;
    }
    
    try {
        const products = await getAllCatalogProducts();
        integrateIntoCatalog(products);
    } catch (error) {
        console.error('Error in main process:', error);
    }
}

// Run the script
main().catch(console.error);