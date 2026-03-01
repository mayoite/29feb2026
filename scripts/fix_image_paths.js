const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixPaths() {
  console.log('--- Fixing Image Paths ---');
  
  // 1. Fetch all products
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, category_id, flagship_image, images, scene_images, variants');

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${products.length} products total.`);

  for (const product of products) {
    let needsUpdate = false;
    let flagship_image = product.flagship_image;
    let images = product.images || [];
    let scene_images = product.scene_images || [];
    let variants = product.variants || [];
    
    // Log start of product check
    // console.log(`Checking ${product.name}...`);

    const fixPath = (p) => {
      if (!p || typeof p !== 'string') return p;
      if (p.includes('/images/products/imported/') || p.includes('/images/educational/') || p.includes('/images/collaborative/') || p.includes('/products/')) {
        const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const catId = product.category_id || '';
        const newDir = `${catId}--${slug}`;
        const newPath = `/images/catalog/${newDir}/image-1.webp`;
        
        const localDir = path.join(process.cwd(), 'public', 'images', 'catalog', newDir);
        const folderExists = fs.existsSync(localDir);
        
        if (folderExists) {
          if (newPath !== p) {
            console.log(`  Flagship Match: ${newDir}`);
            needsUpdate = true;
          }
          return newPath;
        } else {
          // Try fuzzy match if exact catId--slug fails
          const catalogDir = path.join(process.cwd(), 'public', 'images', 'catalog');
          const dirs = fs.readdirSync(catalogDir);
          const fuzzyMatch = dirs.find(d => d.endsWith(`--${slug}`) || d.includes(`--${slug}-`));
          if (fuzzyMatch) {
            const fuzzyPath = `/images/catalog/${fuzzyMatch}/image-1.webp`;
            if (fuzzyPath !== p) {
              console.log(`  Flagship Fuzzy Match: ${fuzzyMatch}`);
              needsUpdate = true;
            }
            return fuzzyPath;
          }
        }
      }
      return p;
    };

    const fixImagesArray = (arr) => {
      if (!Array.isArray(arr)) return arr;
      return arr.map((p, idx) => {
        if (!p || typeof p !== 'string') return p;
        if (p.includes('/images/products/imported/') || p.includes('/images/educational/') || p.includes('/images/collaborative/') || p.includes('/products/')) {
          const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const catId = product.category_id || '';
          const newDir = `${catId}--${slug}`;
          
          let targetDir = newDir;
          const localDir = path.join(process.cwd(), 'public', 'images', 'catalog', newDir);
          if (!fs.existsSync(localDir)) {
            const catalogDir = path.join(process.cwd(), 'public', 'images', 'catalog');
            const dirs = fs.readdirSync(catalogDir);
            const fuzzyMatch = dirs.find(d => d.endsWith(`--${slug}`) || d.includes(`--${slug}-`));
            if (fuzzyMatch) targetDir = fuzzyMatch;
          }

          const newPath = `/images/catalog/${targetDir}/image-${idx + 1}.webp`;
          const localFile = path.join(process.cwd(), 'public', 'images', 'catalog', targetDir, `image-${idx + 1}.webp`);
          
          if (fs.existsSync(localFile)) {
            if (newPath !== p) {
              needsUpdate = true;
            }
            return newPath;
          } else {
            // Check if ANY image exists in that folder and pick the first one if padding is needed
            const finalDir = path.join(process.cwd(), 'public', 'images', 'catalog', targetDir);
            if (fs.existsSync(finalDir)) {
               const files = fs.readdirSync(finalDir).filter(f => f.endsWith('.webp'));
               if (files.length > 0) {
                 const fallbackFile = files[idx % files.length];
                 const fallbackPath = `/images/catalog/${targetDir}/${fallbackFile}`;
                 if (fallbackPath !== p) {
                   needsUpdate = true;
                 }
                 return fallbackPath;
               }
            }
          }
        }
        return p;
      });
    };

    flagship_image = fixPath(flagship_image);
    images = fixImagesArray(images);
    scene_images = fixImagesArray(scene_images);
    
    // Fix variants gallery images
    if (Array.isArray(variants)) {
      variants = variants.map(v => {
        if (v.galleryImages) {
          return { ...v, galleryImages: fixImagesArray(v.galleryImages) };
        }
        return v;
      });
    }

    if (needsUpdate) {
      console.log(`Updating product: ${product.name} (${product.id})`);
      const { error: updateError } = await supabase
        .from('products')
        .update({
          flagship_image,
          images,
          scene_images,
          variants
        })
        .eq('id', product.id);

      if (updateError) {
        console.error(`Failed to update ${product.name}:`, updateError.message);
      }
    }
  }

  console.log('--- Path Fix Complete ---');
}

fixPaths();
