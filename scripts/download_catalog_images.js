const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

const catalogPath = path.resolve(__dirname, '..', 'lib', 'catalog.ts');
const imagesDir = path.resolve(__dirname, '..', 'public', 'images', 'catalog');

// Create images directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log(`Created images directory: ${imagesDir}`);
}

// Catalog India product URLs to process
const catalogProductUrls = [
    'https://www.catalogindia.in/products/curvivo',
    'https://www.catalogindia.in/products/myel',
    'https://www.catalogindia.in/products/exquisite',
    'https://www.catalogindia.in/products/adaptable',
    'https://www.catalogindia.in/products/deskpro',
    'https://www.catalogindia.in/products/exquisite-mt',
    'https://www.catalogindia.in/products/nextable',
    'https://www.catalogindia.in/products/prelam-locker',
    'https://www.catalogindia.in/products/pedestal',
    'https://www.catalogindia.in/products/metal-pedestal',
    'https://www.catalogindia.in/products/accent',
    'https://www.catalogindia.in/products/solace',
    'https://www.catalogindia.in/products/como',
    'https://www.catalogindia.in/products/flip',
    'https://www.catalogindia.in/products/nordic',
    'https://www.catalogindia.in/products/performer',
    'https://www.catalogindia.in/products/connecta',
    'https://www.catalogindia.in/products/wooden-bed'
];

// Download image from URL and save locally
async function downloadImage(imageUrl, localFilename) {
    try {
        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'stream',
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });
        
        const writer = fs.createWriteStream(localFilename);
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`✓ Downloaded: ${path.basename(localFilename)}`);
                resolve(localFilename);
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`✗ Failed to download ${imageUrl}:`, error.message);
        return null;
    }
}

// Extract product images with better detection
async function extractProductImages($, productUrl) {
    const images = [];
    
    // Priority selectors for product images
    const selectors = [
        '[data-gallery] img',
        '.gallery img',
        '.product-gallery img',
        '.swiper-wrapper img',
        '.image-gallery img',
        '.main-image',
        '.product-image',
        'img[src*="product"]',
        'img[src*="chair"]',
        'img[src*="table"]',
        'img[src*="desk"]',
        'img[alt*="product"]',
        'img[alt*="chair"]',
        'img[alt*="table"]',
        'img[alt*="desk"]'
    ];
    
    for (const selector of selectors) {
        $(selector).each((i, elem) => {
            const src = $(elem).attr('src');
            if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
                const fullUrl = src.startsWith('http') ? src : `https://www.catalogindia.in${src}`;
                if (!images.includes(fullUrl)) {
                    images.push(fullUrl);
                }
            }
        });
        if (images.length > 3) break; // Get at least 3 good images
    }
    
    return images.slice(0, 7); // Return max 7 images
}

// Process a single product - download images and return local paths
async function processProduct(productUrl) {
    try {
        console.log(`\nProcessing product: ${productUrl}`);
        const response = await axios.get(productUrl);
        const $ = cheerio.load(response.data);
        
        // Extract product name for folder naming
        const productName = $('h1').text().trim() || 
                           productUrl.split('/').pop().replace(/[-]/g, ' ');
        const productId = productUrl.split('/').pop().toLowerCase();
        
        // Extract images
        const imageUrls = await extractProductImages($, productUrl);
        
        if (imageUrls.length === 0) {
            console.log(`No images found for ${productName}`);
            return null;
        }
        
        // Create product-specific directory
        const productDir = path.join(imagesDir, productId);
        if (!fs.existsSync(productDir)) {
            fs.mkdirSync(productDir, { recursive: true });
        }
        
        // Download images
        const localImagePaths = [];
        for (let i = 0; i < imageUrls.length; i++) {
            const imageUrl = imageUrls[i];
            const extension = path.extname(imageUrl) || '.jpg';
            const filename = `${productId}-${i + 1}${extension}`;
            const localPath = path.join(productDir, filename);
            
            const downloadedPath = await downloadImage(imageUrl, localPath);
            if (downloadedPath) {
                // Convert to web path for catalog
                const webPath = `/images/catalog/${productId}/${filename}`;
                localImagePaths.push(webPath);
            }
            
            // Add delay between downloads
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        if (localImagePaths.length === 0) {
            console.log(`No images downloaded for ${productName}`);
            return null;
        }
        
        // Return product data with local image paths
        return {
            id: productId,
            name: productName,
            description: $('meta[name="description"]').attr('content') || 
                         `Premium ${productName} from Catalog India`,
            flagshipImage: localImagePaths[0],
            sceneImages: localImagePaths.slice(1, 4),
            variants: [{
                id: 'standard',
                variantName: 'Standard Model',
                galleryImages: localImagePaths.slice(0, 7).length >= 7 ? 
                    localImagePaths.slice(0, 7) : 
                    localImagePaths.concat(
                        Array(7 - localImagePaths.length).fill('/images/catalog/placeholder.webp')
                    )
            }],
            detailedInfo: {
                overview: `High-quality ${productName} designed for modern workspaces`,
                features: ['Ergonomic design', 'Premium materials', 'Durable construction'],
                dimensions: 'Customizable dimensions',
                materials: ['Premium materials']
            }
        };
        
    } catch (error) {
        console.error(`Error processing ${productUrl}:`, error.message);
        return null;
    }
}

// Update catalog with local image paths
function updateCatalogWithLocalImages(products) {
    if (products.length === 0) {
        console.log('No products to update in catalog');
        return;
    }
    
    try {
        let catalogContent = fs.readFileSync(catalogPath, 'utf-8');
        
        // Group products by type (simplified categorization)
        const seatingProducts = products.filter(p => 
            p.name.toLowerCase().includes('chair') || 
            p.name.toLowerCase().includes('seating') ||
            p.id.includes('myel') || p.id.includes('flip') || p.id.includes('nordic')
        );
        
        const tableProducts = products.filter(p => 
            p.name.toLowerCase().includes('table') || 
            p.name.toLowerCase().includes('desk') ||
            p.id.includes('exquisite') || p.id.includes('nextable')
        );
        
        const workstationProducts = products.filter(p => 
            p.name.toLowerCase().includes('workstation') ||
            p.id.includes('curvivo') || p.id.includes('adaptable') || p.id.includes('deskpro')
        );
        
        const storageProducts = products.filter(p => 
            p.name.toLowerCase().includes('storage') ||
            p.name.toLowerCase().includes('locker') ||
            p.name.toLowerCase().includes('pedestal') ||
            p.id.includes('prelam') || p.id.includes('pedestal')
        );
        
        // Create Catalog categories with local images
        const catalogCategories = [];
        
        if (seatingProducts.length > 0) {
            catalogCategories.push({
                id: 'catalog-seating',
                name: 'Catalog Seating',
                description: 'Premium ergonomic seating solutions from Catalog India',
                series: [{
                    id: 'catalog-seating-series',
                    name: 'Catalog Seating Series',
                    description: 'Ergonomic chairs designed for comfort and productivity',
                    products: seatingProducts
                }]
            });
        }
        
        if (tableProducts.length > 0) {
            catalogCategories.push({
                id: 'catalog-tables',
                name: 'Catalog Tables',
                description: 'High-quality tables and desks from Catalog India',
                series: [{
                    id: 'catalog-tables-series',
                    name: 'Catalog Tables Series',
                    description: 'Durable tables for various workspace needs',
                    products: tableProducts
                }]
            });
        }
        
        if (workstationProducts.length > 0) {
            catalogCategories.push({
                id: 'catalog-workstations',
                name: 'Catalog Workstations',
                description: 'Modular workstation solutions from Catalog India',
                series: [{
                    id: 'catalog-workstations-series',
                    name: 'Catalog Workstations Series',
                    description: 'Flexible workstations for modern offices',
                    products: workstationProducts
                }]
            });
        }
        
        if (storageProducts.length > 0) {
            catalogCategories.push({
                id: 'catalog-storage',
                name: 'Catalog Storage',
                description: 'Storage solutions from Catalog India',
                series: [{
                    id: 'catalog-storage-series',
                    name: 'Catalog Storage Series',
                    description: 'Organizational storage units',
                    products: storageProducts
                }]
            });
        }
        
        // Convert to TypeScript format
        const catalogCatalogString = JSON.stringify(catalogCategories, null, 2)
            .replace(/"([^"]+)":/g, '$1:')
            .replace(/"([^"]+)"/g, '"$1"');
        
        // Update catalog
        if (catalogContent.includes('export const catalogCatalog: Category[] = [')) {
            const newCatalogContent = catalogContent.replace(
                'export const catalogCatalog: Category[] = [',
                `export const catalogCatalog: Category[] = [
    ${catalogCatalogString.substring(1, catalogCatalogString.length - 1)},`
            );
            
            fs.writeFileSync(catalogPath, newCatalogContent, 'utf-8');
            console.log(`\n✅ Successfully updated catalog with ${products.length} products using local images!`);
            console.log(`📁 Images stored in: ${imagesDir}`);
        } else {
            console.log('Could not find catalogCatalog export in catalog.ts');
        }
        
    } catch (error) {
        console.error('Error updating catalog:', error);
    }
}

// Main function
async function main() {
    console.log('🚀 Starting Catalog image download and catalog update...');
    console.log(`📂 Local image directory: ${imagesDir}`);
    
    const processedProducts = [];
    
    for (const productUrl of catalogProductUrls) {
        const productData = await processProduct(productUrl);
        if (productData) {
            processedProducts.push(productData);
        }
        
        // Add delay between product processing
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (processedProducts.length > 0) {
        updateCatalogWithLocalImages(processedProducts);
    } else {
        console.log('No products were processed successfully');
    }
}

// Run the script
main().catch(console.error);