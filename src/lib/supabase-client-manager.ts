/**
 * Supabase Client Manager - Singleton Pattern
 * Ensures only one instance of each client type exists across the entire application
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

class SupabaseClientManager {
  private static instance: SupabaseClientManager;
  private publicClient: SupabaseClient | null = null;
  private adminClient: SupabaseClient | null = null;
  
  // Environment variables
  private readonly supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  private readonly supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  private readonly serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  private constructor() {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
  }

  static getInstance(): SupabaseClientManager {
    if (!SupabaseClientManager.instance) {
      SupabaseClientManager.instance = new SupabaseClientManager();
    }
    return SupabaseClientManager.instance;
  }

  /**
   * Get the admin client (server-side only, service-role key)
   */
  getAdminClient(): SupabaseClient {
    if (typeof window !== 'undefined') {
      throw new Error('getAdminClient() called in browser - admin client is server-only');
    }
    
    if (!this.serviceRoleKey) {
      throw new Error('Service role key required for admin client');
    }
    
    if (!this.adminClient) {
      this.adminClient = createClient(this.supabaseUrl, this.serviceRoleKey, {
        auth: { 
          persistSession: false, 
          autoRefreshToken: false 
        }
      });
    }
    return this.adminClient;
  }

  /**
   * Get the public client (browser-safe, anonymous key)
   */
  getPublicClient(): SupabaseClient {
    if (!this.publicClient) {
      this.publicClient = createClient(this.supabaseUrl, this.supabaseAnonKey, {
        auth: { 
          storageKey: 'sb-public-auth', // unique storage key to avoid collisions
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            'X-Client-Info': 'sellusgenie-public',
          },
        },
      });
    }
    return this.publicClient;
  }

  /**
   * Initialize client if needed (no longer uses window storage for security)
   */
  initializeIfNeeded() {
    // Clients are now created on-demand without window storage
    // This prevents JWT token exposure vulnerabilities
  }

  /**
   * Debug method to check current client status
   */
  getStatus() {
    return {
      hasAdminClient: !!this.adminClient,
      // Window storage removed for security - no longer tracks window client
    };
  }
}

// Initialize singleton instance
const clientManager = SupabaseClientManager.getInstance();

// Export the singleton instance and convenient client accessors
export { clientManager as SupabaseClientManager };
export const getAdminClient = () => clientManager.getAdminClient();
export const getPublicClient = () => clientManager.getPublicClient();

// Main client export for authenticated operations (browser-safe)
let _cachedPublicClient: any = null;
export const supabase = new Proxy({}, {
  get(_target, prop) {
    if (!_cachedPublicClient) {
      _cachedPublicClient = getPublicClient();
    }
    return _cachedPublicClient[prop];
  }
});

// Separate public client for storefront/public operations
export const supabasePublic = getPublicClient();