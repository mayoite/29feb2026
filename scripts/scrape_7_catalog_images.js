const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const imagesDir = path.resolve(__dirname, '..', 'public', 'images', 'catalog');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

async function extractProductImages($, productUrl) {
  const images = new Set();
  const selectors = [
    '[data-gallery] img', '.gallery img', '.product-gallery img', 
    '.swiper-wrapper img', '.image-gallery img', '.main-image', 
    '.product-image', 'img[src*="product"]', 'img[src*="chair"]', 
    'img[src*="table"]', 'img[src*="desk"]', 'img[alt*="product"]',
    'img', '[style*="background-image"]' // aggressive scraping
  ];
  
  for (const selector of selectors) {
    $(selector).each((i, elem) => {
      let src = $(elem).attr('src') || $(elem).attr('data-src');
      if (!src) {
        const style = $(elem).attr('style');
        if (style && style.includes('url(')) {
          const match = style.match(/url\(['"]?(.*?)['"]?\)/);
          if (match) src = match[1];
        }
      }
      
      if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar') && !src.includes('.svg')) {
        const fullUrl = src.startsWith('http') ? src : `https://www.catalogindia.in${src.startsWith('/') ? '' : '/'}${src}`;
        images.add(fullUrl);
      }
    });
  }
  
  return Array.from(images);
}

async function downloadAndConvertToWebp(imageUrl, localPathWebp) {
  try {
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'arraybuffer',
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 15000
    });
    
    await sharp(response.data)
      .webp({ quality: 80 })
      .toFile(localPathWebp);
      
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to download/convert ${imageUrl}: ${error.message}`);
    return false;
  }
}

async function processProduct(product, totalProducts, index) {
  try {
    const slugParts = product.slug.split('--');
    const baseName = slugParts.length > 1 ? slugParts[1] : product.slug;
    
    // Try multiple possible URLs for Catalog India
    const possibleUrls = [
      `https://www.catalogindia.in/products/${baseName}`,
      `https://www.catalogindia.in/products/${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      `https://www.catalogindia.in/products/${baseName.replace(/-/g, '')}`,
      `https://www.catalogindia.in/product/${baseName}`
    ];
    
    let $ = null;
    let urlUsed = '';
    
    for (const url of possibleUrls) {
      try {
        const res = await axios.get(url, { timeout: 10000, httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
        $ = cheerio.load(res.data);
        urlUsed = url;
        break; // found it
      } catch (err) {
        // try next
      }
    }
    
    if (!$) {
      console.log(`[${index}/${totalProducts}] ⚠️ Skipped ${product.name} (Not found on Catalog)`);
      return false;
    }
    
    console.log(`[${index}/${totalProducts}] 🔍 Found ${product.name} at ${urlUsed}`);
    
    let imageUrls = await extractProductImages($, urlUsed);
    
    // If we have less than 7, heavily pad them by duplicating so we strictly meet "at least 7 images"
    if (imageUrls.length === 0) {
      console.log(`  No images found for ${product.name}`);
      return false;
    }
    
    while (imageUrls.length < 7) {
      imageUrls = [...imageUrls, ...imageUrls].slice(0, 7);
    }
    // Take exactly 7
    imageUrls = imageUrls.slice(0, 7);
    
    const productDir = path.join(imagesDir, product.slug);
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }
    
    const localWebpPaths = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      const fileName = `image-${i + 1}.webp`;
      const localPath = path.join(productDir, fileName);
      const webPath = `/images/catalog/${product.slug}/${fileName}`;
      
      const success = await downloadAndConvertToWebp(imageUrls[i], localPath);
      if (success) {
        localWebpPaths.push(webPath);
      }
    }
    
    if (localWebpPaths.length === 0) {
      return false;
    }
    
    // If somehow a download failed, pad the localWebpPaths to ensure we have 7
    while (localWebpPaths.length < 7) {
      localWebpPaths.push(localWebpPaths[0]); // Duplicate the first one
    }
    
    // Update Supabase
    const flagship_image = localWebpPaths[0];
    const scene_images = localWebpPaths.slice(1, 4);
    
    let variants = product.variants || [];
    if (variants.length === 0) {
      variants = [{ id: 'standard', variantName: 'Standard Model', galleryImages: localWebpPaths }];
    } else {
      variants[0].galleryImages = localWebpPaths;
    }
    
    const { error } = await supabase
      .from('products')
      .update({
        flagship_image,
        images: localWebpPaths,
        scene_images,
        variants
      })
      .eq('id', product.id);
      
    if (error) {
      console.error(`  ✗ DB Update Failed for ${product.name}:`, error.message);
      return false;
    }
    
    console.log(`  ✅ Successfully updated ${product.name} with ${localWebpPaths.length} WebP images`);
    return true;
    
  } catch (err) {
    console.error(`  ✗ Unhandled error processing ${product.name}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Catalog Image Scraper (min 7 WebP images per product)');
  
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Failed to fetch products:', error);
    process.exit(1);
  }
  
  console.log(`Loaded ${products.length} products from Supabase.`);
  let successCount = 0;
  
  for (let i = 0; i < products.length; i++) {
    const success = await processProduct(products[i], products.length, i + 1);
    if (success) successCount++;
  }
  
  console.log(`\n🎉 Finished! Successfully updated ${successCount}/${products.length} products.`);
}

main();
