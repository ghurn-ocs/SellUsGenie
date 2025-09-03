#!/usr/bin/env node

/**
 * Fix Template Thumbnails Script
 * Correctly maps each template to its proper local image
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const libraryPath = path.join(__dirname, '..', 'src', 'pageBuilder', 'templates', 'library.ts');

// Correct template ID to filename mapping
const templateMappings = {
  'modern-hero-landing': 'modern-hero-landing.jpg',
  'saas-product': 'saas-product.jpg',
  'ai-startup': 'ai-startup.jpg',
  'mobile-app-landing': 'mobile-app-landing.jpg',
  'software-company': 'software-company.jpg',
  'ecommerce-product-showcase': 'ecommerce-product-showcase.jpg',
  'fashion-boutique': 'fashion-boutique.jpg',
  'electronics-store': 'electronics-store.jpg',
  'handmade-crafts': 'handmade-crafts.jpg',
  'luxury-brand': 'luxury-brand.jpg',
  'minimal-portfolio': 'minimal-portfolio.jpg',
  'photographer-portfolio': 'photographer-portfolio.jpg',
  'artist-showcase': 'artist-showcase.jpg',
  'architecture-firm': 'architecture-firm.jpg',
  'medical-clinic': 'medical-clinic.jpg',
  'fitness-gym': 'fitness-gym.jpg',
  'wellness-spa': 'wellness-spa.jpg',
  'dental-practice': 'dental-practice.jpg',
  'yoga-studio': 'yoga-studio.jpg',
  'restaurant-menu': 'restaurant-menu.jpg',
  'coffee-shop': 'coffee-shop.jpg',
  'food-truck': 'food-truck.jpg',
  'bakery-shop': 'bakery-shop.jpg',
  'business-corporate': 'business-corporate.jpg',
  'law-firm': 'law-firm.jpg',
  'accounting-firm': 'accounting-firm.jpg',
  'consulting-agency': 'consulting-agency.jpg',
  'online-course': 'online-course.jpg',
  'university-program': 'university-program.jpg',
  'tutoring-service': 'tutoring-service.jpg',
  'real-estate-agency': 'real-estate-agency.jpg',
  'property-management': 'property-management.jpg',
  'event-conference': 'event-conference.jpg',
  'wedding-planner': 'wedding-planner.jpg',
  'music-band': 'music-band.jpg',
  'blog-magazine': 'blog-magazine.jpg',
  'news-publication': 'news-publication.jpg',
  'personal-blog': 'personal-blog.jpg',
  'nonprofit-charity': 'nonprofit-charity.jpg',
  'community-organization': 'community-organization.jpg',
  'car-dealership': 'car-dealership.jpg',
  'auto-repair': 'auto-repair.jpg',
  'hotel-resort': 'hotel-resort.jpg',
  'travel-agency': 'travel-agency.jpg',
  'sports-team': 'sports-team.jpg',
  'financial-advisor': 'financial-advisor.jpg',
  'insurance-agency': 'insurance-agency.jpg',
  'veterinary-clinic': 'veterinary-clinic.jpg',
  'pet-grooming-spa': 'pet-grooming-spa.jpg',
  'pet-boarding-daycare': 'pet-boarding-daycare.jpg',
  'dog-training-academy': 'dog-training-academy.jpg',
  'pet-store-supplies': 'pet-store-supplies.jpg',
  'mobile-vet-services': 'mobile-veterinary-services.jpg',
  'pet-rescue-sanctuary': 'pet-rescue-sanctuary.jpg',
  'exotic-pet-specialist': 'exotic-pet-specialist.jpg',
  'pet-photography-studio': 'pet-photography-studio.jpg',
  'pet-insurance-broker': 'pet-insurance-broker.jpg',
  'dog-walker-services': 'dog-walker-services.jpg',
  'pet-behavioral-therapist': 'pet-behavioral-therapist.jpg',
  'pet-taxi-transport': 'pet-taxi-transport.jpg',
  'aquarium-fish-store': 'aquarium-fish-store.jpg',
  'pet-memorial-services': 'pet-memorial-services.jpg',
  'farm-to-table-restaurant': 'farm-to-table-restaurant.jpg',
  'food-delivery-app': 'food-delivery-platform.jpg',
  'vegan-plant-based': 'vegan-plant-based.jpg',
  'craft-brewery-taproom': 'craft-brewery-taproom.jpg',
  'gourmet-catering': 'gourmet-catering.jpg',
  'ice-cream-parlor': 'ice-cream-parlor.jpg',
  'wine-tasting-room': 'wine-tasting-room.jpg',
  'food-blogger-influencer': 'food-blogger-influencer.jpg',
  'meal-prep-service': 'meal-prep-service.jpg',
  'ethnic-fusion-restaurant': 'ethnic-fusion-restaurant.jpg',
  'cooking-school-academy': 'cooking-school-academy.jpg',
  'farmers-market-vendor': 'farmers-market-vendor.jpg',
  'specialty-spice-shop': 'specialty-spice-shop.jpg',
  'food-safety-consultant': 'food-safety-consultant.jpg',
  'ghost-kitchen-delivery': 'ghost-kitchen-delivery.jpg',
  'tea-house-ceremony': 'traditional-tea-house.jpg',
  'nutritionist-dietitian': 'nutritionist-dietitian.jpg',
  'food-photography-studio': 'food-photography-studio.jpg',
  'molecular-gastronomy': 'molecular-gastronomy.jpg',
  'food-waste-reduction': 'food-waste-reduction.jpg',
  'ai-chatbot-platform': 'ai-chatbot-platform.jpg',
  'sustainability-consultant': 'sustainability-consultant.jpg',
  'drone-services-company': 'drone-services-company.jpg',
  'blockchain-development': 'blockchain-development.jpg',
  'virtual-reality-studio': 'virtual-reality-studio.jpg',
  'mental-health-app': 'mental-health-app.jpg',
  'smart-home-installer': 'smart-home-installation.jpg',
  'cybersecurity-firm': 'cybersecurity-firm.jpg',
  'renewable-energy-installer': 'renewable-energy-installer.jpg',
  'telehealth-platform': 'telehealth-platform.jpg',
  'esports-gaming-arena': 'esports-gaming-arena.jpg',
  'data-analytics-consultant': 'data-analytics-consultant.jpg',
  'biotechnology-lab': 'biotechnology-lab.jpg',
  'space-technology-startup': 'space-technology-startup.jpg',
  'autonomous-vehicle-testing': 'autonomous-vehicle-testing.jpg',
};

function fixTemplateThumbnails() {
  console.log('Reading template library file...');
  
  let content = fs.readFileSync(libraryPath, 'utf8');
  let updatedCount = 0;
  
  // Fix each template thumbnail
  Object.entries(templateMappings).forEach(([id, filename]) => {
    const oldPattern = new RegExp(`(id: '${id}'[\\s\\S]*?thumbnail: ')(/images/templates/)[^']*(')`);
    const newThumbnail = `/images/templates/${filename}`;
    
    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, `$1$2${filename}$3`);
      console.log(`✓ Fixed ${id} → ${filename}`);
      updatedCount++;
    } else {
      // Try to find the template and add correct thumbnail
      const templatePattern = new RegExp(`(id: '${id}'[\\s\\S]*?thumbnail: ')[^']*(')`);
      if (templatePattern.test(content)) {
        content = content.replace(templatePattern, `$1${newThumbnail}$2`);
        console.log(`✓ Updated ${id} → ${filename}`);
        updatedCount++;
      } else {
        console.log(`⚠ Could not find pattern for ${id}`);
      }
    }
  });
  
  console.log(`\nWriting updated file...`);
  fs.writeFileSync(libraryPath, content);
  
  console.log(`\nUpdate complete:`);
  console.log(`✓ Updated: ${updatedCount} templates`);
  console.log(`📁 File: ${libraryPath}`);
}

// Run the fix
fixTemplateThumbnails();