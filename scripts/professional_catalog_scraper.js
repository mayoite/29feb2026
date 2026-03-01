const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
    catalogPath: path.resolve(__dirname, '..', 'lib', 'catalog.ts'),
    imagesDir: path.resolve(__dirname, '..', 'public', 'images', 'catalog'),
    timeout: 30000,
    delayBetweenRequests: 1500,
    maxRetries: 3
};

// Catalog India categories with proper mapping
const Catalog_CATEGORIES = [
    {
        url: 'https://www.catalogindia.in/categories/workstations',
        id: 'workstations',
        name: 'Workstations',
        description: 'Modular workstation solutions for modern offices'
    },
    {
        url: 'https://www.catalogindia.in/categories/tables', 
        id: 'tables',
        name: 'Tables',
        description: 'Conference tables, meeting tables, and office desks'
    },
    {
        url: 'https://www.catalogindia.in/categories/storage',
        id: 'storage', 
        name: 'Storage',
        description: 'Filing cabinets, lockers, and storage solutions'
    },
    {
        url: 'https://www.catalogindia.in/categories/soft-seating',
        id: 'soft-seating',
        name: 'Soft Seating', 
        description: 'Lounge chairs, sofas, and casual seating'
    },
    {
        url: 'https://www.catalogindia.in/categories/seating',
        id: 'seating',
        name: 'Seating',
        description: 'Ergonomic office chairs and task seating'
    },
    {
        url: 'https://www.catalogindia.in/categories/educational',
        id: 'educational', 
        name: 'Educational',
        description: 'Classroom furniture and educational institution solutions'
    }
];

// Utility functions
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryOperation(operation, retries = CONFIG.maxRetries) {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === retries - 1) throw error;
            await delay(2000);
        }
    }
}

// Create necessary directories
function ensureDirectories() {
    if (!fs.existsSync(CONFIG.imagesDir)) {
        fs.mkdirSync(CONFIG.imagesDir, { recursive: true });
        console.log(`📁 Created images directory: ${CONFIG.imagesDir}`);
    }
}

// Download image with proper error handling
async function downloadImage(imageUrl, localPath) {
    try {
        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'stream',
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            timeout: CONFIG.timeout
        });

        const writer = fs.createWriteStream(localPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(localPath));
            writer.on('error', reject);
        });
    } catch (error) {
        throw new Error(`Failed to download image: ${error.message}`);
    }
}

// Extract product URLs from category page
async function extractProductUrls(categoryUrl) {
    try {
        console.log(`🔍 Scanning category: ${categoryUrl}`);
        const response = await axios.get(categoryUrl, { timeout: CONFIG.timeout });
        const $ = cheerio.load(response.data);

        const productUrls = new Set();

        // Comprehensive product link detection
        const selectors = [
            'a[href*="/products/"]',
            '.product-card a[href]',
            '.item a[href*="/products/"]',
            '[data-product-url]',
            '.product-link'
        ];

        selectors.forEach(selector => {
            $(selector).each((i, elem) => {
                let href = $(elem).attr('href') || $(elem).attr('data-product-url');
                if (href && href.includes('/products/')) {
                    if (!href.startsWith('http')) {
                        href = `https://www.catalogindia.in${href}`;
                    }
                    if (!href.includes('#') && !href.includes('categories')) {
                        productUrls.add(href);
                    }
                }
            });
        });

        console.log(`📦 Found ${productUrls.size} products`);
        return Array.from(productUrls);

    } catch (error) {
        console.error(`❌ Error scanning category ${categoryUrl}:`, error.message);
        return [];
    }
}

// Extract product data with robust parsing
async function extractProductData(productUrl, categoryId) {
    return retryOperation(async () => {
        console.log(`📋 Processing: ${productUrl}`);
        
        const response = await axios.get(productUrl, { timeout: CONFIG.timeout });
        const $ = cheerio.load(response.data);

        // Extract product information
        const productName = $('h1').text().trim() || 
                           $('title').text().split('|')[0].trim() ||
                           path.basename(productUrl).replace(/[-]/g, ' ');

        const productId = path.basename(productUrl).toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        const description = $('meta[name="description"]').attr('content') || 
                           $('.product-description').text().trim() ||
                           $('p').first().text().trim() ||
                           `Premium ${productName} from Catalog India`;

        // Extract images with multiple strategies
        const imageUrls = await extractProductImages($);
        
        // Extract specifications
        const specs = extractSpecifications($);

        return {
            productId,
            productName,
            description: description.substring(0, 200),
            imageUrls,
            specs,
            categoryId,
            sourceUrl: productUrl
        };
    });
}

// Enhanced image extraction
function extractProductImages($) {
    const images = new Set();
    
    const imageSelectors = [
        'img[src*="products"]',
        'img[src*="product"]', 
        'img[alt*="product"]',
        'img[alt*="chair"]',
        'img[alt*="table"]',
        'img[alt*="desk"]',
        '.gallery img',
        '.product-image',
        '.main-image',
        '[data-image]',
        'source[srcset]'
    ];

    imageSelectors.forEach(selector => {
        $(selector).each((i, elem) => {
            let src = $(elem).attr('src') || $(elem).attr('srcset') || $(elem).attr('data-src');
            if (src) {
                // Handle srcset
                if (src.includes(',')) src = src.split(',')[0].trim().split(' ')[0];
                
                if (src && !src.includes('logo') && !src.includes('icon')) {
                    const fullUrl = src.startsWith('http') ? src : `https://www.catalogindia.in${src}`;
                    images.add(fullUrl);
                }
            }
        });
    });

    return Array.from(images).slice(0, 10);
}

// Extract product specifications
function extractSpecifications($) {
    const specs = {};
    const features = [];

    // Look for specification tables
    $('table').each((i, table) => {
        $(table).find('tr').each((j, row) => {
            const key = $(row).find('td:first-child, th:first-child').text().trim();
            const value = $(row).find('td:last-child').text().trim();
            if (key && value) {
                specs[key] = value;
            }
        });
    });

    // Extract features from lists
    $('ul li, ol li').each((i, li) => {
        const text = $(li).text().trim();
        if (text && text.length > 10 && !text.includes('\n')) {
            features.push(text);
        }
    });

    return { specs, features: features.slice(0, 8) };
}

// Download all images for a product
async function downloadProductImages(productData) {
    const productDir = path.join(CONFIG.imagesDir, productData.productId);
    if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
    }

    const localImagePaths = [];

    for (let i = 0; i < productData.imageUrls.length; i++) {
        const imageUrl = productData.imageUrls[i];
        const extension = path.extname(imageUrl) || '.webp';
        const filename = `${i + 1}${extension}`;
        const localPath = path.join(productDir, filename);

        try {
            await downloadImage(imageUrl, localPath);
            const webPath = `/images/catalog/${productData.productId}/${filename}`;
            localImagePaths.push(webPath);
            await delay(500);
        } catch (error) {
            console.log(`⚠️  Skipping image: ${error.message}`);
        }
    }

    // Ensure we have at least one image
    if (localImagePaths.length === 0) {
        localImagePaths.push('/images/catalog/placeholder.webp');
    }

    return localImagePaths;
}

// Process complete category
async function processCategory(category) {
    console.log(`\n📂 PROCESSING CATEGORY: ${category.name}`);
    console.log('='.repeat(50));

    const productUrls = await extractProductUrls(category.url);
    const categoryProducts = [];

    for (let i = 0; i < productUrls.length; i++) {
        const productUrl = productUrls[i];
        
        try {
            const productData = await extractProductData(productUrl, category.id);
            const localImages = await downloadProductImages(productData);

            const product = {
                id: productData.productId,
                name: productData.productName,
                description: productData.description,
                flagshipImage: localImages[0],
                sceneImages: localImages.slice(1, 4),
                variants: [{
                    id: 'standard',
                    variantName: 'Standard Model',
                    galleryImages: localImages.slice(0, 7)
                }],
                detailedInfo: {
                    overview: productData.description,
                    features: productData.specs.features,
                    dimensions: productData.specs.specs['Dimensions'] || 'Customizable',
                    materials: [productData.specs.specs['Material'] || 'Premium materials']
                },
                metadata: {
                    source: 'catalogindia.in',
                    category: category.id,
                    bifmaCertified: true,
                    warrantyYears: 5
                }
            };

            categoryProducts.push(product);
            console.log(`✅ [${i + 1}/${productUrls.length}] ${product.name}`);

        } catch (error) {
            console.log(`❌ Failed to process product: ${error.message}`);
        }

        await delay(CONFIG.delayBetweenRequests);
    }

    return categoryProducts;
}

// Update catalog with all products
function updateCatalog(allProductsByCategory) {
    try {
        let catalogContent = fs.readFileSync(CONFIG.catalogPath, 'utf-8');

        const catalogCategories = Catalog_CATEGORIES.map(category => {
            const products = allProductsByCategory[category.id] || [];
            return {
                id: `catalog-${category.id}`,
                name: `Catalog ${category.name}`,
                description: category.description,
                series: [{
                    id: `catalog-${category.id}-series`,
                    name: `Catalog ${category.name} Series`,
                    description: `Premium ${category.name.toLowerCase()} solutions`,
                    products: products
                }]
            };
        }).filter(category => category.series[0].products.length > 0);

        // Convert to TypeScript format
        const catalogCatalogString = JSON.stringify(catalogCategories, null, 2)
            .replace(/"([^"]+)":/g, '$1:')
            .replace(/"([^"]+)"/g, '"$1"');

        // Replace entire catalogCatalog section
        const newCatalogContent = catalogContent.replace(
            /export const catalogCatalog: Category\[\] = \[([\s\S]*?)\];/,
            `export const catalogCatalog: Category[] = [
    ${catalogCatalogString.substring(1, catalogCatalogString.length - 1)}
];`
        );

        fs.writeFileSync(CONFIG.catalogPath, newCatalogContent, 'utf-8');

        // Statistics
        const totalProducts = catalogCategories.reduce((sum, cat) => sum + cat.series[0].products.length, 0);
        console.log(`\n🎉 CATALOG UPDATE COMPLETE!`);
        console.log(`📊 Total products: ${totalProducts}`);
        console.log(`📁 Categories: ${catalogCategories.length}`);
        console.log(`💾 Images stored in: ${CONFIG.imagesDir}`);

    } catch (error) {
        console.error('❌ Error updating catalog:', error);
        throw error;
    }
}

// Main execution
async function main() {
    console.log('🚀 Catalog INDIA PRODUCT CATALOG SCRAPER');
    console.log('='.repeat(50));
    
    ensureDirectories();

    const allProductsByCategory = {};
    let totalProcessed = 0;

    for (const category of Catalog_CATEGORIES) {
        const products = await processCategory(category);
        allProductsByCategory[category.id] = products;
        totalProcessed += products.length;
        
        console.log(`\n📈 Category complete: ${products.length} products processed`);
        await delay(2000);
    }

    if (totalProcessed > 0) {
        updateCatalog(allProductsByCategory);
    } else {
        console.log('❌ No products were processed successfully');
    }
}

// Error handling and execution
main()
    .then(() => console.log('\n✅ Script execution completed successfully'))
    .catch(error => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });