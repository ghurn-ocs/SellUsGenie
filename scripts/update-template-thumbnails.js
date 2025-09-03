#!/usr/bin/env node

/**
 * Update Template Thumbnails Script
 * Updates all template thumbnail URLs to use local images
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const libraryPath = path.join(__dirname, '..', 'src', 'pageBuilder', 'templates', 'library.ts');

// Template ID to filename mapping
const templateMappings = [
  // Technology & SaaS
  { id: 'modern-hero-landing', filename: 'modern-hero-landing.jpg' },
  { id: 'saas-product', filename: 'saas-product.jpg' },
  { id: 'ai-startup', filename: 'ai-startup.jpg' },
  { id: 'mobile-app-landing', filename: 'mobile-app-landing.jpg' },
  { id: 'software-company', filename: 'software-company.jpg' },
  
  // E-commerce & Retail
  { id: 'ecommerce-product-showcase', filename: 'ecommerce-product-showcase.jpg' },
  { id: 'fashion-boutique', filename: 'fashion-boutique.jpg' },
  { id: 'electronics-store', filename: 'electronics-store.jpg' },
  { id: 'handmade-crafts', filename: 'handmade-crafts.jpg' },
  { id: 'luxury-brand', filename: 'luxury-brand.jpg' },
  
  // Creative & Portfolio
  { id: 'minimal-portfolio', filename: 'minimal-portfolio.jpg' },
  { id: 'photographer-portfolio', filename: 'photographer-portfolio.jpg' },
  { id: 'artist-showcase', filename: 'artist-showcase.jpg' },
  { id: 'architecture-firm', filename: 'architecture-firm.jpg' },
  
  // Health & Wellness
  { id: 'medical-clinic', filename: 'medical-clinic.jpg' },
  { id: 'fitness-gym', filename: 'fitness-gym.jpg' },
  { id: 'wellness-spa', filename: 'wellness-spa.jpg' },
  { id: 'dental-practice', filename: 'dental-practice.jpg' },
  { id: 'yoga-studio', filename: 'yoga-studio.jpg' },
  
  // Food & Restaurant
  { id: 'restaurant-menu', filename: 'restaurant-menu.jpg' },
  { id: 'coffee-shop', filename: 'coffee-shop.jpg' },
  { id: 'food-truck', filename: 'food-truck.jpg' },
  { id: 'bakery-shop', filename: 'bakery-shop.jpg' },
  
  // Professional Services
  { id: 'business-corporate', filename: 'business-corporate.jpg' },
  { id: 'law-firm', filename: 'law-firm.jpg' },
  { id: 'accounting-firm', filename: 'accounting-firm.jpg' },
  { id: 'consulting-agency', filename: 'consulting-agency.jpg' },
  
  // Education
  { id: 'online-course', filename: 'online-course.jpg' },
  { id: 'university-program', filename: 'university-program.jpg' },
  { id: 'tutoring-service', filename: 'tutoring-service.jpg' },
  
  // Real Estate
  { id: 'real-estate-agency', filename: 'real-estate-agency.jpg' },
  { id: 'property-management', filename: 'property-management.jpg' },
  
  // Events & Entertainment
  { id: 'event-conference', filename: 'event-conference.jpg' },
  { id: 'wedding-planner', filename: 'wedding-planner.jpg' },
  { id: 'music-band', filename: 'music-band.jpg' },
  
  // Blog & Content
  { id: 'blog-magazine', filename: 'blog-magazine.jpg' },
  { id: 'news-publication', filename: 'news-publication.jpg' },
  { id: 'personal-blog', filename: 'personal-blog.jpg' },
  
  // Nonprofit
  { id: 'nonprofit-charity', filename: 'nonprofit-charity.jpg' },
  { id: 'community-organization', filename: 'community-organization.jpg' },
  
  // Automotive
  { id: 'car-dealership', filename: 'car-dealership.jpg' },
  { id: 'auto-repair', filename: 'auto-repair.jpg' },
  
  // Travel
  { id: 'hotel-resort', filename: 'hotel-resort.jpg' },
  { id: 'travel-agency', filename: 'travel-agency.jpg' },
  
  // Sports
  { id: 'sports-team', filename: 'sports-team.jpg' },
  
  // Finance
  { id: 'financial-advisor', filename: 'financial-advisor.jpg' },
  { id: 'insurance-agency', filename: 'insurance-agency.jpg' },
  
  // Pet Care Templates
  { id: 'veterinary-clinic', filename: 'veterinary-clinic.jpg' },
  { id: 'pet-grooming-spa', filename: 'pet-grooming-spa.jpg' },
  { id: 'pet-boarding-daycare', filename: 'pet-boarding-daycare.jpg' },
  { id: 'dog-training-academy', filename: 'dog-training-academy.jpg' },
  { id: 'pet-store-supplies', filename: 'pet-store-supplies.jpg' },
  { id: 'mobile-vet-services', filename: 'mobile-veterinary-services.jpg' },
  { id: 'pet-rescue-sanctuary', filename: 'pet-rescue-sanctuary.jpg' },
  { id: 'exotic-pet-specialist', filename: 'exotic-pet-specialist.jpg' },
  { id: 'pet-photography-studio', filename: 'pet-photography-studio.jpg' },
  { id: 'pet-insurance-broker', filename: 'pet-insurance-broker.jpg' },
  { id: 'dog-walker-services', filename: 'dog-walker-services.jpg' },
  { id: 'pet-behavioral-therapist', filename: 'pet-behavioral-therapist.jpg' },
  { id: 'pet-taxi-transport', filename: 'pet-taxi-transport.jpg' },
  { id: 'aquarium-fish-store', filename: 'aquarium-fish-store.jpg' },
  { id: 'pet-memorial-services', filename: 'pet-memorial-services.jpg' },
  
  // Food Industry Expansion
  { id: 'farm-to-table-restaurant', filename: 'farm-to-table-restaurant.jpg' },
  { id: 'food-delivery-app', filename: 'food-delivery-platform.jpg' },
  { id: 'vegan-plant-based', filename: 'vegan-plant-based.jpg' },
  { id: 'craft-brewery-taproom', filename: 'craft-brewery-taproom.jpg' },
  { id: 'gourmet-catering', filename: 'gourmet-catering.jpg' },
  { id: 'ice-cream-parlor', filename: 'ice-cream-parlor.jpg' },
  { id: 'wine-tasting-room', filename: 'wine-tasting-room.jpg' },
  { id: 'food-blogger-influencer', filename: 'food-blogger-influencer.jpg' },
  { id: 'meal-prep-service', filename: 'meal-prep-service.jpg' },
  { id: 'ethnic-fusion-restaurant', filename: 'ethnic-fusion-restaurant.jpg' },
  { id: 'cooking-school-academy', filename: 'cooking-school-academy.jpg' },
  { id: 'farmers-market-vendor', filename: 'farmers-market-vendor.jpg' },
  { id: 'specialty-spice-shop', filename: 'specialty-spice-shop.jpg' },
  { id: 'food-safety-consultant', filename: 'food-safety-consultant.jpg' },
  { id: 'ghost-kitchen-delivery', filename: 'ghost-kitchen-delivery.jpg' },
  { id: 'tea-house-ceremony', filename: 'traditional-tea-house.jpg' },
  { id: 'nutritionist-dietitian', filename: 'nutritionist-dietitian.jpg' },
  { id: 'food-photography-studio', filename: 'food-photography-studio.jpg' },
  { id: 'molecular-gastronomy', filename: 'molecular-gastronomy.jpg' },
  { id: 'food-waste-reduction', filename: 'food-waste-reduction.jpg' },
  
  // Emerging & Innovative Industries
  { id: 'ai-chatbot-platform', filename: 'ai-chatbot-platform.jpg' },
  { id: 'sustainability-consultant', filename: 'sustainability-consultant.jpg' },
  { id: 'drone-services-company', filename: 'drone-services-company.jpg' },
  { id: 'blockchain-development', filename: 'blockchain-development.jpg' },
  { id: 'virtual-reality-studio', filename: 'virtual-reality-studio.jpg' },
  { id: 'mental-health-app', filename: 'mental-health-app.jpg' },
  { id: 'smart-home-installer', filename: 'smart-home-installation.jpg' },
  { id: 'cybersecurity-firm', filename: 'cybersecurity-firm.jpg' },
  { id: 'renewable-energy-installer', filename: 'renewable-energy-installer.jpg' },
  { id: 'telehealth-platform', filename: 'telehealth-platform.jpg' },
  { id: 'esports-gaming-arena', filename: 'esports-gaming-arena.jpg' },
  { id: 'data-analytics-consultant', filename: 'data-analytics-consultant.jpg' },
  { id: 'biotechnology-lab', filename: 'biotechnology-lab.jpg' },
  { id: 'space-technology-startup', filename: 'space-technology-startup.jpg' },
  { id: 'autonomous-vehicle-testing', filename: 'autonomous-vehicle-testing.jpg' },
];

function updateTemplateThumbnails() {
  console.log('Reading template library file...');
  
  let content = fs.readFileSync(libraryPath, 'utf8');
  let updatedCount = 0;
  
  // Update each template thumbnail
  templateMappings.forEach(({ id, filename }) => {
    const oldPattern = new RegExp(`(id: '${id}'[\\s\\S]*?thumbnail: ')https://images\\.unsplash\\.com[^']*(')`);
    const newThumbnail = `/images/templates/${filename}`;
    
    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, `$1${newThumbnail}$2`);
      console.log(`✓ Updated ${id} → ${filename}`);
      updatedCount++;
    } else {
      console.log(`⚠ Could not find pattern for ${id}`);
    }
  });
  
  console.log(`\nWriting updated file...`);
  fs.writeFileSync(libraryPath, content);
  
  console.log(`\nUpdate complete:`);
  console.log(`✓ Updated: ${updatedCount} templates`);
  console.log(`📁 File: ${libraryPath}`);
}

// Run the update
updateTemplateThumbnails();