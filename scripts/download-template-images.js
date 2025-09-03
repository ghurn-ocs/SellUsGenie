#!/usr/bin/env node

/**
 * Download Template Images Script
 * Downloads all template images and stores them locally
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateImages = [
  // Technology & SaaS
  { id: 'modern-hero-landing', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&auto=format' },
  { id: 'saas-product', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&auto=format' },
  { id: 'ai-startup', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&auto=format' },
  { id: 'mobile-app-landing', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop&auto=format' },
  { id: 'software-company', url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop&auto=format' },
  
  // E-commerce & Retail
  { id: 'ecommerce-product-showcase', url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop&auto=format' },
  { id: 'fashion-boutique', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&auto=format' },
  { id: 'electronics-store', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&auto=format' },
  { id: 'handmade-crafts', url: 'https://images.unsplash.com/photo-1452827073306-6e6e661baf57?w=400&h=300&fit=crop&auto=format' },
  { id: 'luxury-brand', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&h=300&fit=crop&auto=format' },
  
  // Creative & Portfolio
  { id: 'minimal-portfolio', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&auto=format' },
  { id: 'photographer-portfolio', url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop&auto=format' },
  { id: 'artist-showcase', url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop&auto=format' },
  { id: 'architecture-firm', url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop&auto=format' },
  
  // Health & Wellness
  { id: 'medical-clinic', url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&auto=format' },
  { id: 'fitness-gym', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop&auto=format' },
  { id: 'wellness-spa', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop&auto=format' },
  { id: 'dental-practice', url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop&auto=format' },
  { id: 'yoga-studio', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format' },
  
  // Food & Restaurant
  { id: 'restaurant-menu', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&auto=format' },
  { id: 'coffee-shop', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop&auto=format' },
  { id: 'food-truck', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format' },
  { id: 'bakery-shop', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format' },
  
  // Professional Services
  { id: 'business-corporate', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format' },
  { id: 'law-firm', url: 'https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=400&h=300&fit=crop&auto=format' },
  { id: 'accounting-firm', url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&auto=format' },
  { id: 'consulting-agency', url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&auto=format' },
  
  // Education
  { id: 'online-course', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&auto=format' },
  { id: 'university-program', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop&auto=format' },
  { id: 'tutoring-service', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&auto=format' },
  
  // Real Estate
  { id: 'real-estate-agency', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format' },
  { id: 'property-management', url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop&auto=format' },
  
  // Events & Entertainment
  { id: 'event-conference', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop&auto=format' },
  { id: 'wedding-planner', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop&auto=format' },
  { id: 'music-band', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&auto=format' },
  
  // Blog & Content
  { id: 'blog-magazine', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop&auto=format' },
  { id: 'news-publication', url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop&auto=format' },
  { id: 'personal-blog', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop&auto=format' },
  
  // Nonprofit
  { id: 'nonprofit-charity', url: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=400&h=300&fit=crop&auto=format' },
  { id: 'community-organization', url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop&auto=format' },
  
  // Automotive
  { id: 'car-dealership', url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop&auto=format' },
  { id: 'auto-repair', url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop&auto=format' },
  
  // Travel
  { id: 'hotel-resort', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&auto=format' },
  { id: 'travel-agency', url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop&auto=format' },
  
  // Sports
  { id: 'sports-team', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop&auto=format' },
  
  // Finance
  { id: 'financial-advisor', url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&auto=format' },
  { id: 'insurance-agency', url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop&auto=format' },
  
  // Pet Care Templates
  { id: 'veterinary-clinic', url: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop&auto=format' },
  { id: 'pet-grooming-spa', url: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?w=400&h=300&fit=crop&auto=format' },
  { id: 'pet-boarding-daycare', url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&auto=format' },
  { id: 'dog-training-academy', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop&auto=format' },
  { id: 'pet-store-supplies', url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&auto=format' },
  { id: 'mobile-vet-services', url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop&auto=format' },
  { id: 'pet-rescue-sanctuary', url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop&auto=format' },
  { id: 'exotic-pet-specialist', url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop&auto=format' },
  { id: 'pet-photography-studio', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop&auto=format' },
  { id: 'pet-insurance-broker', url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&h=300&fit=crop&auto=format' },
  { id: 'dog-walker-services', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop&auto=format' },
  { id: 'pet-behavioral-therapist', url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&auto=format' },
  { id: 'pet-taxi-transport', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop&auto=format' },
  { id: 'aquarium-fish-store', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&auto=format' },
  { id: 'pet-memorial-services', url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&auto=format' },
  
  // Food Industry Expansion
  { id: 'farm-to-table-restaurant', url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&auto=format' },
  { id: 'food-delivery-app', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format' },
  { id: 'vegan-plant-based', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format' },
  { id: 'craft-brewery-taproom', url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&auto=format' },
  { id: 'gourmet-catering', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&auto=format' },
  { id: 'ice-cream-parlor', url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop&auto=format' },
  { id: 'wine-tasting-room', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format' },
  { id: 'food-blogger-influencer', url: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=300&fit=crop&auto=format' },
  { id: 'meal-prep-service', url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop&auto=format' },
  { id: 'ethnic-fusion-restaurant', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format' },
  { id: 'cooking-school-academy', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format' },
  { id: 'farmers-market-vendor', url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop&auto=format' },
  { id: 'specialty-spice-shop', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop&auto=format' },
  { id: 'food-safety-consultant', url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop&auto=format' },
  { id: 'ghost-kitchen-delivery', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format' },
  { id: 'tea-house-ceremony', url: 'https://images.unsplash.com/photo-1545105511-7053d29bf8dc?w=400&h=300&fit=crop&auto=format' },
  { id: 'nutritionist-dietitian', url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop&auto=format' },
  { id: 'food-photography-studio', url: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=300&fit=crop&auto=format' },
  { id: 'molecular-gastronomy', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&auto=format' },
  { id: 'food-waste-reduction', url: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=400&h=300&fit=crop&auto=format' },
  
  // Emerging & Innovative Industries
  { id: 'ai-chatbot-platform', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&auto=format' },
  { id: 'sustainability-consultant', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop&auto=format' },
  { id: 'drone-services-company', url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=300&fit=crop&auto=format' },
  { id: 'blockchain-development', url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop&auto=format' },
  { id: 'virtual-reality-studio', url: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=400&h=300&fit=crop&auto=format' },
  { id: 'mental-health-app', url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop&auto=format' },
  { id: 'smart-home-installer', url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&auto=format' },
  { id: 'cybersecurity-firm', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop&auto=format' },
  { id: 'renewable-energy-installer', url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop&auto=format' },
  { id: 'telehealth-platform', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&auto=format' },
  { id: 'esports-gaming-arena', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop&auto=format' },
  { id: 'data-analytics-consultant', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&auto=format' },
  { id: 'biotechnology-lab', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&auto=format' },
  { id: 'space-technology-startup', url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop&auto=format' },
  { id: 'autonomous-vehicle-testing', url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&auto=format' },
];

const outputDir = path.join(__dirname, '..', 'public', 'images', 'templates');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadImage(imageData) {
  return new Promise((resolve, reject) => {
    const { id, url } = imageData;
    const filename = `${id}.jpg`;
    const filepath = path.join(outputDir, filename);
    
    console.log(`Downloading ${id}...`);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✓ Downloaded ${filename}`);
          resolve(filepath);
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        const redirectUrl = response.headers.location;
        https.get(redirectUrl, (redirectResponse) => {
          if (redirectResponse.statusCode === 200) {
            const fileStream = fs.createWriteStream(filepath);
            redirectResponse.pipe(fileStream);
            fileStream.on('finish', () => {
              fileStream.close();
              console.log(`✓ Downloaded ${filename} (redirected)`);
              resolve(filepath);
            });
          } else {
            reject(new Error(`Failed to download ${id}: ${redirectResponse.statusCode}`));
          }
        }).on('error', reject);
      } else {
        reject(new Error(`Failed to download ${id}: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function downloadAllImages() {
  console.log(`Starting download of ${templateImages.length} template images...`);
  
  let successful = 0;
  let failed = 0;
  
  for (const imageData of templateImages) {
    try {
      await downloadImage(imageData);
      successful++;
    } catch (error) {
      console.error(`✗ Failed to download ${imageData.id}:`, error.message);
      failed++;
    }
    
    // Add small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\nDownload complete:`);
  console.log(`✓ Successful: ${successful}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total: ${templateImages.length}`);
}

// Run the download process
downloadAllImages().catch(console.error);