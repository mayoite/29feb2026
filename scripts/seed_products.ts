// Seed products using SUPABASE_SERVICE_ROLE_KEY (bypasses ALL RLS).
// Run with: npx tsx scripts/seed_products.ts
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
});

// All products from the original lib/catalog.ts mapped to DB rows
const PRODUCTS = [
    // SEATING - FLUID SERIES
    { name: 'Fluid X', slug: 'fluid-x', category: 'oando-seating', category_id: 'oando-seating', flagship_image: '/images/catalog/oando-seating--fluid-x/image-1.webp', description: 'Premium executive ergonomic chair with advanced lumbar support.', scene_images: [], variants: [], detailed_info: { overview: 'Premium ergonomic executive seating.', features: ['Adjustable lumbar', 'Mesh back', 'Height adjustable'], dimensions: 'W650 x D650 x H900-1050mm', materials: ['Mesh', 'Aluminum', 'Foam'] }, metadata: { sustainabilityScore: 8, bifmaCertified: true, warrantyYears: 5, priceRange: 'premium' }, specs: { dimensions: 'W650 x D650 x H900-1050mm', materials: ['Mesh', 'Aluminum', 'Foam'], features: ['Adjustable lumbar', 'Mesh back', 'Height adjustable'], sustainability_score: 8 }, series_id: 'fluid-series', series_name: 'Fluid Series' },
    { name: 'Fluid Task', slug: 'fluid-task', category: 'oando-seating', category_id: 'oando-seating', flagship_image: '/images/catalog/oando-seating--fluid-x/image-2.webp', description: 'Mid-back ergonomic task chair for extended desk work.', scene_images: [], variants: [], detailed_info: { overview: 'Mid-back ergonomic task chair.', features: ['Adjustable armrests', 'Tilt mechanism', 'Height adjustable'], dimensions: 'W620 x D620 x H850-1000mm', materials: ['Fabric', 'Nylon', 'Foam'] }, metadata: { sustainabilityScore: 7, bifmaCertified: true, warrantyYears: 5, priceRange: 'mid' }, specs: { dimensions: 'W620 x D620 x H850-1000mm', materials: ['Fabric', 'Nylon', 'Foam'], features: ['Adjustable armrests', 'Tilt mechanism'], sustainability_score: 7 }, series_id: 'fluid-series', series_name: 'Fluid Series' },

    // SEATING - CLASSY SERIES
    { name: 'Classy Executive', slug: 'classy-executive', category: 'oando-seating', category_id: 'oando-seating', flagship_image: '/images/catalog/oando-seating--fluid-x/image-3.webp', description: 'High-back leather executive chair for boardroom environments.', scene_images: [], variants: [], detailed_info: { overview: 'High-back leather executive chair.', features: ['Genuine leather', 'High backrest', 'Padded armrests'], dimensions: 'W700 x D700 x H950-1100mm', materials: ['Leather', 'Chrome', 'Foam'] }, metadata: { sustainabilityScore: 6, warrantyYears: 3, priceRange: 'premium' }, specs: { dimensions: 'W700 x D700 x H950-1100mm', materials: ['Leather', 'Chrome', 'Foam'], features: ['Genuine leather', 'High backrest'], sustainability_score: 6 }, series_id: 'classy-series', series_name: 'Classy Series' },

    // WORKSTATIONS - CABIN SERIES
    { name: 'Cabin 60×30', slug: 'cabin-60x30', category: 'oando-workstations', category_id: 'oando-workstations', flagship_image: '/images/products/imported/cabin/image-1.webp', description: 'Modular rectangular workstation with cable management.', scene_images: ['/images/products/imported/cabin/image-2.webp', '/images/products/imported/cabin/image-3.webp'], variants: [], detailed_info: { overview: 'Modular rectangular workstation.', features: ['Cable management', 'Modular panels', 'Scratch resistant'], dimensions: '1500 x 750 x 750mm', materials: ['MDF', 'Powder coated steel'] }, metadata: { sustainabilityScore: 7, warrantyYears: 5, priceRange: 'mid' }, specs: { dimensions: '1500 x 750 x 750mm', materials: ['MDF', 'Powder coated steel'], features: ['Cable management', 'Modular panels'], sustainability_score: 7 }, series_id: 'cabin-series', series_name: 'Cabin Series' },
    { name: 'Cabin L-Shape', slug: 'cabin-l-shape', category: 'oando-workstations', category_id: 'oando-workstations', flagship_image: '/images/products/imported/cabin/image-4.webp', description: 'L-shaped workstation for corner configurations.', scene_images: [], variants: [], detailed_info: { overview: 'L-shaped corner workstation.', features: ['Corner optimized', 'Cable management', 'Extra work surface'], dimensions: '1500 x 1500 x 750mm', materials: ['MDF', 'Powder coated steel'] }, metadata: { sustainabilityScore: 7, warrantyYears: 5, priceRange: 'mid' }, specs: { dimensions: '1500 x 1500 x 750mm', materials: ['MDF', 'Steel'], features: ['Corner optimized', 'Cable management'], sustainability_score: 7 }, series_id: 'cabin-series', series_name: 'Cabin Series' },

    // TABLES - MEETING SERIES
    { name: 'Conference Table 8-Seater', slug: 'conference-8-seater', category: 'oando-tables', category_id: 'oando-tables', flagship_image: '/images/products/imported/meeting-table/image-33.webp', description: 'Executive 8-seater conference table with power access.', scene_images: [], variants: [], detailed_info: { overview: 'Executive conference table.', features: ['Integrated power outlets', 'Cable management', 'Premium finish'], dimensions: '2400 x 1200 x 760mm', materials: ['MDF', 'Powder coated steel base'] }, metadata: { sustainabilityScore: 7, warrantyYears: 5, priceRange: 'premium' }, specs: { dimensions: '2400 x 1200 x 760mm', materials: ['MDF', 'Steel'], features: ['Integrated power outlets'], sustainability_score: 7 }, series_id: 'meeting-series', series_name: 'Meeting Series' },

    // STORAGE
    { name: 'Mobile Pedestal 3-Drawer', slug: 'pedestal-3-drawer', category: 'oando-storage', category_id: 'oando-storage', flagship_image: '/images/products/imported/storage/image-14.webp', description: 'Mobile 3-drawer pedestal with central locking.', scene_images: [], variants: [], detailed_info: { overview: 'Mobile storage pedestal.', features: ['Central locking', 'Castors', '3 drawers', 'Key included'], dimensions: 'W400 x D500 x H650mm', materials: ['Steel'] }, metadata: { sustainabilityScore: 8, warrantyYears: 5, priceRange: 'mid' }, specs: { dimensions: 'W400 x D500 x H650mm', materials: ['Steel'], features: ['Central locking', 'Castors'], sustainability_score: 8 }, series_id: 'storage-series', series_name: 'Storage Series' },

    // SOFT SEATING
    { name: 'Cocoon Lounge Chair', slug: 'cocoon-lounge', category: 'oando-soft-seating', category_id: 'oando-soft-seating', flagship_image: '/images/products/imported/cocoon/image-1.webp', description: 'Cocoon-style acoustic lounge chair for focus and informal meetings.', scene_images: [], variants: [], detailed_info: { overview: 'Acoustic lounge chair.', features: ['Acoustic shell', 'USB charging port', 'Fabric upholstery'], dimensions: 'W900 x D850 x H1400mm', materials: ['Fabric', 'Foam', 'Steel base'] }, metadata: { sustainabilityScore: 8, warrantyYears: 3, priceRange: 'premium' }, specs: { dimensions: 'W900 x D850 x H1400mm', materials: ['Fabric', 'Foam', 'Steel'], features: ['Acoustic shell', 'USB charging'], sustainability_score: 8 }, series_id: 'cocoon-series', series_name: 'Cocoon Series' },

    // EDUCATIONAL
    { name: 'Accent Study Chair', slug: 'accent-study', category: 'oando-educational', category_id: 'oando-educational', flagship_image: '/images/products/imported/accent/image-1.webp', description: 'Lightweight stackable chair for educational environments.', scene_images: [], variants: [], detailed_info: { overview: 'Educational stackable chair.', features: ['Stackable', 'Lightweight', 'Durable polypropylene'], dimensions: 'W500 x D520 x H820mm', materials: ['Polypropylene', 'Steel'] }, metadata: { sustainabilityScore: 9, warrantyYears: 3, priceRange: 'budget' }, specs: { dimensions: 'W500 x D520 x H820mm', materials: ['Polypropylene', 'Steel'], features: ['Stackable', 'Lightweight'], sustainability_score: 9 }, series_id: 'educational-series', series_name: 'Educational Series' },
];

async function seedProducts() {
    console.log(`Seeding ${PRODUCTS.length} products via service role...\n`);

    const { error, count } = await supabase
        .from('products')
        .upsert(PRODUCTS, { onConflict: 'slug', count: 'exact' });

    if (error) {
        console.error('❌ Products seeding failed:', error.message);
        console.error('Details:', error.details);
    } else {
        console.log(`✅ Products seeded: ${PRODUCTS.length} rows upserted`);
        console.log('\nNext step: run seed_data.sql in Supabase SQL Editor to seed the full catalog (100+ products).');
    }
}

seedProducts().catch(err => {
    console.error('Fatal:', err.message);
    process.exit(1);
});
