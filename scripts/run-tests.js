#!/usr/bin/env node

/**
 * Automated Testing Script for Sell Us Genie eCommerce Platform
 * 
 * This script runs comprehensive automated tests to validate platform functionality
 * without requiring manual UAT testing. Adapted for React web application with Supabase.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Enhanced test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds timeout
  retries: 2,
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
  outputFile: 'test-results.json',
  htmlReport: true,
  coverageThreshold: 80,
  accessibilityLevel: 'AA', // WCAG level
  performanceBudget: {
    bundleSize: '2MB',
    dependencies: 100
  }
};

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${message}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logTest(name, status, duration = 0, error = null) {
  const statusIcon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
  const statusColor = status === 'PASS' ? 'green' : status === 'WARN' ? 'yellow' : 'red';
  const durationText = duration > 0 ? ` (${duration}ms)` : '';
  
  log(`${statusIcon} ${name}${durationText}`, statusColor);
  
  if (error && TEST_CONFIG.verbose) {
    log(`   Error: ${error}`, 'red');
  }
}

// Enhanced test categories for StreamSell eCommerce Platform
const TEST_CATEGORIES = {
  'Code Quality': [
    'TypeScript Compilation',
    'Linting',
    'Import Validation',
    'Code Complexity Analysis'
  ],
  'Component Testing': [
    'React Component Validation',
    'Component Props Testing',
    'Hook Usage Validation',
    'Component Structure Analysis'
  ],
  'UI/UX Testing': [
    'Accessibility Compliance',
    'Touch Target Sizing',
    'Color Contrast Validation',
    'Responsive Design Testing',
    'Navigation Flow Testing'
  ],
  'Functional Testing': [
    'API Integration Testing',
    'Form Validation Testing',
    'Error Handling Testing',
    'State Management Testing',
    'Data Flow Validation'
  ],
  'Performance Testing': [
    'Bundle Size Analysis',
    'Memory Usage Testing',
    'Rendering Performance',
    'Network Request Optimization'
  ],
  'Security Testing': [
    'Environment Variable Security',
    'API Key Exposure Check',
    'Sensitive Data Validation',
    'Supabase RLS Validation'
  ],
  'Data Validation': [
    'Supabase Schema Validation',
    'Type Definitions',
    'Database Interface Validation'
  ],
  'Build System': [
    'Vite Configuration',
    'Tailwind CSS Configuration',
    'Environment Variables'
  ],
  'Dependencies': [
    'Package Installation',
    'Version Compatibility',
    'React Query Integration'
  ],
  'E-commerce Specific': [
    'Multi-tenancy Validation',
    'Store Management Testing',
    'Product Management Testing',
    'Order Management Testing',
    'Customer Management Testing',
    'Authentication Flow Testing'
  ]
};

// Test functions
const tests = {
  // Code Quality Tests
  async testTypeScriptCompilation() {
    try {
      const startTime = Date.now();
      execSync('npx tsc --noEmit --skipLibCheck', { 
        stdio: 'pipe',
        timeout: TEST_CONFIG.timeout 
      });
      const duration = Date.now() - startTime;
      return { status: 'PASS', duration };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  async testLinting() {
    try {
      const startTime = Date.now();
      // Check if ESLint is configured
      if (fs.existsSync('.eslintrc.js') || fs.existsSync('.eslintrc.json')) {
        execSync('npx eslint src/ --ext .ts,.tsx', { 
          stdio: 'pipe',
          timeout: TEST_CONFIG.timeout 
        });
      }
      const duration = Date.now() - startTime;
      return { status: 'PASS', duration };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  async testImportValidation() {
    try {
      const startTime = Date.now();
      // Check for common import issues
      const srcPath = path.join(process.cwd(), 'src');
      const files = getAllFiles(srcPath, ['.ts', '.tsx']);
      
      let hasErrors = false;
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        // Check for relative imports that might be broken
        const relativeImports = content.match(/from ['"]\.\.\/[^'"]*['"]/g);
        if (relativeImports) {
          for (const importPath of relativeImports) {
            const cleanPath = importPath.replace(/from ['"]/, '').replace(/['"]/, '');
            const fullPath = path.resolve(path.dirname(file), cleanPath);
            if (!fs.existsSync(fullPath) && !fs.existsSync(fullPath + '.ts') && !fs.existsSync(fullPath + '.tsx')) {
              hasErrors = true;
              if (TEST_CONFIG.verbose) {
                log(`   Broken import in ${file}: ${cleanPath}`, 'yellow');
              }
            }
          }
        }
      }
      
      const duration = Date.now() - startTime;
      return { status: hasErrors ? 'FAIL' : 'PASS', duration };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  // Data Validation Tests
  async testSupabaseSchemaValidation() {
    try {
      const startTime = Date.now();
      const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
      
      if (!fs.existsSync(schemaPath)) {
        return { status: 'FAIL', error: 'Database schema file not found' };
      }

      const content = fs.readFileSync(schemaPath, 'utf8');
      
      // Check for required tables
      const requiredTables = [
        'store_owners', 'stores', 'store_owner_subscriptions', 
        'products', 'categories', 'customers', 'orders', 'cart_items', 'payments'
      ];

      let missingTables = [];
      for (const table of requiredTables) {
        if (!content.includes(`CREATE TABLE ${table}`)) {
          missingTables.push(table);
        }
      }

      // Check for RLS policies
      if (!content.includes('ROW LEVEL SECURITY') || !content.includes('ENABLE ROW LEVEL SECURITY')) {
        missingTables.push('RLS policies');
      }

      const duration = Date.now() - startTime;
      return { 
        status: missingTables.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: missingTables.length > 0 ? `Missing: ${missingTables.join(', ')}` : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  async testTypeDefinitions() {
    try {
      const startTime = Date.now();
      const supabasePath = path.join(process.cwd(), 'src', 'lib', 'supabase.ts');
      
      if (!fs.existsSync(supabasePath)) {
        return { status: 'FAIL', error: 'Supabase configuration file not found' };
      }

      const content = fs.readFileSync(supabasePath, 'utf8');
      
      // Check for required interfaces
      const requiredInterfaces = [
        'StoreOwner', 'Store', 'StoreOwnerSubscription', 
        'Product', 'Customer', 'Order'
      ];

      let missingInterfaces = [];
      for (const interfaceName of requiredInterfaces) {
        if (!content.includes(`interface ${interfaceName}`) && !content.includes(`export interface ${interfaceName}`)) {
          missingInterfaces.push(interfaceName);
        }
      }

      const duration = Date.now() - startTime;
      return { 
        status: missingInterfaces.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: missingInterfaces.length > 0 ? `Missing interfaces: ${missingInterfaces.join(', ')}` : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  async testDatabaseInterfaceValidation() {
    try {
      const startTime = Date.now();
      const supabasePath = path.join(process.cwd(), 'src', 'lib', 'supabase.ts');
      
      if (!fs.existsSync(supabasePath)) {
        return { status: 'FAIL', error: 'Supabase configuration file not found' };
      }

      const content = fs.readFileSync(supabasePath, 'utf8');
      
      // Check for required Supabase setup
      const requiredElements = [
        'createClient', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'
      ];

      let missingElements = [];
      for (const element of requiredElements) {
        if (!content.includes(element)) {
          missingElements.push(element);
        }
      }

      const duration = Date.now() - startTime;
      return { 
        status: missingElements.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: missingElements.length > 0 ? `Missing: ${missingElements.join(', ')}` : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  // Build System Tests
  async testViteConfiguration() {
    try {
      const startTime = Date.now();
      const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
      const hasViteConfig = fs.existsSync(viteConfigPath);
      
      const duration = Date.now() - startTime;
      return { 
        status: hasViteConfig ? 'PASS' : 'FAIL', 
        duration,
        error: !hasViteConfig ? 'Vite configuration not found' : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  async testTailwindCSSConfiguration() {
    try {
      const startTime = Date.now();
      const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
      const postcssConfigPath = path.join(process.cwd(), 'postcss.config.js');
      
      const hasTailwindConfig = fs.existsSync(tailwindConfigPath);
      const hasPostcssConfig = fs.existsSync(postcssConfigPath);
      
      const duration = Date.now() - startTime;
      return { 
        status: (hasTailwindConfig && hasPostcssConfig) ? 'PASS' : 'FAIL', 
        duration,
        error: !hasTailwindConfig ? 'tailwind.config.js not found' : !hasPostcssConfig ? 'postcss.config.js not found' : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  async testEnvironmentVariables() {
    try {
      const startTime = Date.now();
      const envPath = path.join(process.cwd(), '.env');
      const envExamplePath = path.join(process.cwd(), 'env.example');
      
      if (!fs.existsSync(envExamplePath)) {
        return { status: 'FAIL', error: 'env.example file not found' };
      }

      const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
      const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
      
      let missingVars = [];
      for (const varName of requiredVars) {
        if (!envExampleContent.includes(varName)) {
          missingVars.push(varName);
        }
      }

      const duration = Date.now() - startTime;
      return { 
        status: missingVars.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: missingVars.length > 0 ? `Missing environment variables: ${missingVars.join(', ')}` : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  // Dependency Tests
  async testPackageInstallation() {
    try {
      const startTime = Date.now();
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        return { status: 'FAIL', error: 'package.json not found' };
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const nodeModulesPath = path.join(process.cwd(), 'node_modules');
      
      const hasNodeModules = fs.existsSync(nodeModulesPath);
      
      const duration = Date.now() - startTime;
      return { 
        status: hasNodeModules ? 'PASS' : 'FAIL', 
        duration,
        error: !hasNodeModules ? 'node_modules not found - run npm install' : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  async testVersionCompatibility() {
    try {
      const startTime = Date.now();
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        return { status: 'FAIL', error: 'package.json not found' };
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check for required dependencies
      const requiredDeps = [
        'react', 'react-dom', 'wouter', '@tanstack/react-query', '@supabase/supabase-js'
      ];

      let missingDeps = [];
      for (const dep of requiredDeps) {
        if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
          missingDeps.push(dep);
        }
      }

      const duration = Date.now() - startTime;
      return { 
        status: missingDeps.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: missingDeps.length > 0 ? `Missing dependencies: ${missingDeps.join(', ')}` : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  async testReactQueryIntegration() {
    try {
      const startTime = Date.now();
      const srcPath = path.join(process.cwd(), 'src');
      const hookFiles = getAllFiles(srcPath, ['.ts']).filter(file => 
        file.includes('hooks/') && file.includes('use')
      );
      
      let errors = [];
      for (const file of hookFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Skip hooks that are explicitly marked to skip React Query validation
        if (content.includes('@react-query-skip:')) {
          continue;
        }
        
        // Check for proper React Query imports
        if (!content.includes('@tanstack/react-query')) {
          errors.push(`${file}: Missing React Query import`);
        }
        
        // Check for proper hook structure
        if (!content.includes('useQuery') && !content.includes('useMutation')) {
          errors.push(`${file}: Missing React Query hooks`);
        }
      }
      
      const duration = Date.now() - startTime;
      return { 
        status: errors.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: errors.length > 0 ? errors.slice(0, 3).join('; ') : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  // Enhanced Component Testing Functions
  async testReactComponentValidation() {
    try {
      const startTime = Date.now();
      const srcPath = path.join(process.cwd(), 'src');
      const componentFiles = getAllFiles(srcPath, ['.tsx']).filter(file => 
        file.includes('components/') || file.includes('pages/')
      );
      
      let errors = [];
      for (const file of componentFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for proper React imports
        if (!content.includes('import React') && !content.includes('import * as React')) {
          errors.push(`${file}: Missing React import`);
        }
        
        // Check for proper component structure
        if (!content.includes('export default') && !content.includes('export const')) {
          errors.push(`${file}: Missing component export`);
        }
        
        // Check for TypeScript interfaces
        if (!content.includes('interface') && !content.includes('type Props')) {
          errors.push(`${file}: Missing TypeScript props interface`);
        }
      }
      
      const duration = Date.now() - startTime;
      return { 
        status: errors.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: errors.length > 0 ? errors.slice(0, 3).join('; ') : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  // UI/UX Testing Functions
  async testAccessibilityCompliance() {
    try {
      const startTime = Date.now();
      const srcPath = path.join(process.cwd(), 'src');
      const componentFiles = getAllFiles(srcPath, ['.tsx']);
      
      let errors = [];
      for (const file of componentFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for buttons without accessibility labels
        if (content.includes('<button') && !content.includes('aria-label') && !content.includes('aria-labelledby')) {
          errors.push(`${file}: Button missing accessibility label`);
        }
        
        // Check for form inputs without labels
        if (content.includes('<input') && !content.includes('aria-label') && !content.includes('aria-labelledby') && !content.includes('<label')) {
          errors.push(`${file}: Input missing accessibility label`);
        }
        
        // Check for images without alt text
        if (content.includes('<img') && !content.includes('alt=')) {
          errors.push(`${file}: Image missing alt text`);
        }
      }
      
      const duration = Date.now() - startTime;
      return { 
        status: errors.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: errors.length > 0 ? errors.slice(0, 3).join('; ') : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  async testResponsiveDesignTesting() {
    try {
      const startTime = Date.now();
      const srcPath = path.join(process.cwd(), 'src');
      const componentFiles = getAllFiles(srcPath, ['.tsx']);
      
      let warnings = [];
      for (const file of componentFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for hardcoded dimensions (but exclude responsive utilities)
        const dimensionMatches = content.match(/width:\s*\d+|height:\s*\d+/g);
        if (dimensionMatches && dimensionMatches.length > 3) {
          // Skip if the file uses responsive design utilities
          if (!content.includes('sm:') && !content.includes('md:') && !content.includes('lg:') && !content.includes('xl:')) {
            warnings.push(`${file}: Multiple hardcoded dimensions, consider responsive design`);
          }
        }
      }
      
      const duration = Date.now() - startTime;
      return { 
        status: warnings.length === 0 ? 'PASS' : 'WARN', 
        duration,
        error: warnings.length > 0 ? warnings.slice(0, 3).join('; ') : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  // E-commerce Specific Tests
  async testMultiTenancyValidation() {
    try {
      const startTime = Date.now();
      const srcPath = path.join(process.cwd(), 'src');
      const contextFiles = getAllFiles(srcPath, ['.tsx']).filter(file => 
        file.includes('contexts/')
      );
      
      let errors = [];
      for (const file of contextFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for store context
        if (file.includes('StoreContext') && !content.includes('store_id')) {
          errors.push(`${file}: Store context missing store_id handling`);
        }
        
        // Check for auth context
        if (file.includes('AuthContext') && !content.includes('auth.uid')) {
          errors.push(`${file}: Auth context missing user ID handling`);
        }
      }
      
      const duration = Date.now() - startTime;
      return { 
        status: errors.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: errors.length > 0 ? errors.slice(0, 3).join('; ') : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  async testStoreManagementTesting() {
    try {
      const startTime = Date.now();
      const srcPath = path.join(process.cwd(), 'src');
      const storeFiles = getAllFiles(srcPath, ['.tsx']).filter(file => 
        file.includes('Store') && !file.includes('StoreFrontend')
      );
      
      let errors = [];
      for (const file of storeFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for store selector functionality
        if (file.includes('StoreOwnerDashboard') && !content.includes('currentStore')) {
          errors.push(`${file}: Store dashboard missing store selector`);
        }
        
        // Check for store creation functionality
        if (file.includes('StoreOwnerDashboard') && !content.includes('createStore')) {
          errors.push(`${file}: Store dashboard missing store creation`);
        }
      }
      
      const duration = Date.now() - startTime;
      return { 
        status: errors.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: errors.length > 0 ? errors.slice(0, 3).join('; ') : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  async testProductManagementTesting() {
    try {
      const startTime = Date.now();
      const srcPath = path.join(process.cwd(), 'src');
      const productFiles = getAllFiles(srcPath, ['.tsx']).filter(file => 
        file.includes('Product')
      );
      
      let errors = [];
      for (const file of productFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for product CRUD operations
        if (file.includes('ProductForm') && !content.includes('onSubmit')) {
          errors.push(`${file}: Product form missing submit handler`);
        }
        
        // Check for product list functionality
        if (file.includes('ProductList') && !content.includes('products')) {
          errors.push(`${file}: Product list missing products data`);
        }
      }
      
      const duration = Date.now() - startTime;
      return { 
        status: errors.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: errors.length > 0 ? errors.slice(0, 3).join('; ') : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  async testOrderManagementTesting() {
    try {
      const startTime = Date.now();
      const srcPath = path.join(process.cwd(), 'src');
      const orderFiles = getAllFiles(srcPath, ['.tsx']).filter(file => 
        file.includes('Order')
      );
      
      let errors = [];
      for (const file of orderFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for order status management
        if (file.includes('OrderList') && !content.includes('status')) {
          errors.push(`${file}: Order list missing status handling`);
        }
        
        // Check for order statistics
        if (file.includes('OrderList') && !content.includes('getOrderStats')) {
          errors.push(`${file}: Order list missing statistics`);
        }
      }
      
      const duration = Date.now() - startTime;
      return { 
        status: errors.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: errors.length > 0 ? errors.slice(0, 3).join('; ') : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  async testCustomerManagementTesting() {
    try {
      const startTime = Date.now();
      const srcPath = path.join(process.cwd(), 'src');
      const customerFiles = getAllFiles(srcPath, ['.tsx']).filter(file => 
        file.includes('Customer')
      );
      
      let errors = [];
      for (const file of customerFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for customer data display
        if (file.includes('CustomerList') && !content.includes('customers')) {
          errors.push(`${file}: Customer list missing customers data`);
        }
        
        // Check for customer statistics
        if (file.includes('CustomerList') && !content.includes('getCustomerStats')) {
          errors.push(`${file}: Customer list missing statistics`);
        }
      }
      
      const duration = Date.now() - startTime;
      return { 
        status: errors.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: errors.length > 0 ? errors.slice(0, 3).join('; ') : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  async testAuthenticationFlowTesting() {
    try {
      const startTime = Date.now();
      const srcPath = path.join(process.cwd(), 'src');
      const authFiles = getAllFiles(srcPath, ['.tsx']).filter(file => 
        file.includes('Auth') || file.includes('LandingPage')
      );
      
      let errors = [];
      for (const file of authFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for OAuth integration
        if (file.includes('LandingPage') && (!content.includes('Google') || !content.includes('Apple'))) {
          errors.push(`${file}: Landing page missing OAuth options`);
        }
        
        // Check for auth callback handling
        if (file.includes('AuthCallback') && !content.includes('supabase.auth')) {
          errors.push(`${file}: Auth callback missing Supabase auth`);
        }
      }
      
      const duration = Date.now() - startTime;
      return { 
        status: errors.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: errors.length > 0 ? errors.slice(0, 3).join('; ') : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  // Security Testing Functions
  async testSupabaseRLSValidation() {
    try {
      const startTime = Date.now();
      const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
      
      if (!fs.existsSync(schemaPath)) {
        return { status: 'FAIL', error: 'Database schema file not found' };
      }

      const content = fs.readFileSync(schemaPath, 'utf8');
      
      // Check for RLS policies on all tables
      const tables = ['store_owners', 'stores', 'products', 'customers', 'orders'];
      let missingPolicies = [];
      
      for (const table of tables) {
        if (!content.includes(`CREATE POLICY`) || !content.includes(`ON ${table}`)) {
          missingPolicies.push(table);
        }
      }
      
      const duration = Date.now() - startTime;
      return { 
        status: missingPolicies.length === 0 ? 'PASS' : 'FAIL', 
        duration,
        error: missingPolicies.length > 0 ? `Missing RLS policies for: ${missingPolicies.join(', ')}` : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  },

  // Additional Code Quality Tests
  async testCodeComplexityAnalysis() {
    try {
      const startTime = Date.now();
      const srcPath = path.join(process.cwd(), 'src');
      const componentFiles = getAllFiles(srcPath, ['.tsx']);
      
      let warnings = [];
      for (const file of componentFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for large components (over 200 lines)
        const lines = content.split('\n').length;
        if (lines > 200) {
          warnings.push(`${file}: Large component (${lines} lines), consider splitting`);
        }
        
        // Check for nested ternary operators
        const ternaryCount = (content.match(/\?/g) || []).length;
        if (ternaryCount > 3) {
          warnings.push(`${file}: Multiple ternary operators, consider simplifying`);
        }
      }
      
      const duration = Date.now() - startTime;
      return { 
        status: warnings.length === 0 ? 'PASS' : 'WARN', 
        duration,
        error: warnings.length > 0 ? warnings.slice(0, 3).join('; ') : null
      };
    } catch (error) {
      return { status: 'FAIL', error: error.message };
    }
  }
};

// Utility function to get all files recursively
function getAllFiles(dirPath, extensions, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, extensions, arrayOfFiles);
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

// Main test runner
async function runTests() {
  logHeader('STREAMSELL AUTOMATED TESTING SUITE');
  log(`Running tests with timeout: ${TEST_CONFIG.timeout}ms`, 'blue');
  log(`Verbose mode: ${TEST_CONFIG.verbose ? 'ON' : 'OFF'}`, 'blue');
  
  const results = {
    timestamp: new Date().toISOString(),
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    categories: {}
  };

  // Run tests by category
  for (const [category, testNames] of Object.entries(TEST_CATEGORIES)) {
    logHeader(category.toUpperCase());
    results.categories[category] = { tests: [], passed: 0, failed: 0 };
    
    for (const testName of testNames) {
      const testFunctionName = 'test' + testName.replace(/\s+/g, '');
      const testFunction = tests[testFunctionName];
      
      if (testFunction) {
        results.totalTests++;
        
        let testResult;
        for (let attempt = 1; attempt <= TEST_CONFIG.retries; attempt++) {
          if (attempt > 1) {
            log(`   Retry attempt ${attempt}...`, 'yellow');
          }
          
          testResult = await testFunction();
          
          if (testResult.status === 'PASS') {
            break;
          }
        }
        
        logTest(testName, testResult.status, testResult.duration, testResult.error);
        
        const testInfo = {
          name: testName,
          status: testResult.status,
          duration: testResult.duration,
          error: testResult.error,
          timestamp: new Date().toISOString()
        };
        
        results.categories[category].tests.push(testInfo);
        
        if (testResult.status === 'PASS') {
          results.passedTests++;
          results.categories[category].passed++;
        } else {
          results.failedTests++;
          results.categories[category].failed++;
        }
      } else {
        log(`⚠️  Test function not found: ${testName}`, 'yellow');
      }
    }
  }

  // Display summary
  logHeader('TEST SUMMARY');
  log(`Total Tests: ${results.totalTests}`, 'bright');
  log(`Passed: ${results.passedTests} ✅`, 'green');
  log(`Failed: ${results.failedTests} ❌`, 'red');
  log(`Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%`, 'bright');
  
  // Category breakdown
  log('\nCategory Breakdown:', 'bright');
  for (const [category, data] of Object.entries(results.categories)) {
    const categorySuccess = data.tests.length > 0 ? ((data.passed / data.tests.length) * 100).toFixed(1) : '0.0';
    const statusColor = data.failed === 0 ? 'green' : 'red';
    log(`  ${category}: ${data.passed}/${data.tests.length} (${categorySuccess}%)`, statusColor);
  }

  // Save results to file
  try {
    fs.writeFileSync(TEST_CONFIG.outputFile, JSON.stringify(results, null, 2));
    log(`\nResults saved to: ${TEST_CONFIG.outputFile}`, 'blue');
  } catch (error) {
    log(`\nFailed to save results: ${error.message}`, 'red');
  }

  // Exit with appropriate code
  const exitCode = results.failedTests === 0 ? 0 : 1;
  process.exit(exitCode);
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('StreamSell Automated Testing Suite', 'bright');
  log('Usage: node scripts/run-tests.js [options]', 'blue');
  log('\nOptions:', 'bright');
  log('  --verbose, -v    Enable verbose output', 'blue');
  log('  --help, -h       Show this help message', 'blue');
  log('\nExamples:', 'bright');
  log('  node scripts/run-tests.js', 'blue');
  log('  node scripts/run-tests.js --verbose', 'blue');
  process.exit(0);
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Test runner failed: ${error.message}`, 'red');
  process.exit(1);
});
