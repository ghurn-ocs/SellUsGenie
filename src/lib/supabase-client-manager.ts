/**
 * Supabase Client Manager - Singleton Pattern
 * Ensures only one instance of each client type exists across the entire application
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

class SupabaseClientManager {
  private static instance: SupabaseClientManager;
  private adminClient: SupabaseClient | null = null;
  
  // Environment variables
  private readonly supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  private readonly supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  private constructor() {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    console.log('🔧 SupabaseClientManager: Initializing singleton instance');
  }

  static getInstance(): SupabaseClientManager {
    if (!SupabaseClientManager.instance) {
      SupabaseClientManager.instance = new SupabaseClientManager();
      console.log('✅ SupabaseClientManager: Created new singleton instance');
    } else {
      console.log('🔄 SupabaseClientManager: Reusing existing singleton instance');
    }
    return SupabaseClientManager.instance;
  }

  /**
   * Get the admin client (authenticated, persistent session)
   */
  getAdminClient(): SupabaseClient {
    if (!this.adminClient) {
      console.log('🔧 SupabaseClientManager: Creating admin client');
      this.adminClient = createClient(this.supabaseUrl, this.supabaseAnonKey, {
        auth: {
          storageKey: 'supabase-admin-auth-token',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            'X-Client-Info': 'sellusgenie-admin',
          },
        },
      });
      
      // Store reference for HMR persistence
      if (typeof window !== 'undefined') {
        (window as any).__supabase_admin_client = this.adminClient;
      }
    }
    return this.adminClient;
  }

  /**
   * Get the public client (same as admin client - RLS handles security)
   */
  getPublicClient(): SupabaseClient {
    // Return the same admin client - security is handled by RLS policies
    console.log('🔧 SupabaseClientManager: Public client request - returning admin client (RLS handles security)');
    return this.getAdminClient();
  }

  /**
   * Check and restore clients from window for HMR persistence
   */
  restoreFromWindow() {
    if (typeof window !== 'undefined') {
      if ((window as any).__supabase_admin_client && !this.adminClient) {
        console.log('🔧 SupabaseClientManager: Restoring admin client from window');
        this.adminClient = (window as any).__supabase_admin_client;
      }
    }
  }

  /**
   * Debug method to check current client status
   */
  getStatus() {
    return {
      hasAdminClient: !!this.adminClient,
      windowAdminClient: !!(typeof window !== 'undefined' && (window as any).__supabase_admin_client),
    };
  }
}

// Initialize and restore from window immediately
const clientManager = SupabaseClientManager.getInstance();
clientManager.restoreFromWindow();

// Export the singleton instance and convenient client accessors
export { clientManager as SupabaseClientManager };
export const getAdminClient = () => clientManager.getAdminClient();
export const getPublicClient = () => clientManager.getPublicClient();

// Backward compatibility exports - use lazy getters to avoid eager initialization
let _cachedAdminClient: any = null;
export const supabase = new Proxy({}, {
  get(target, prop) {
    if (!_cachedAdminClient) {
      _cachedAdminClient = getAdminClient();
    }
    return _cachedAdminClient[prop];
  }
});

// Public client is now the same as admin client
export const supabasePublic = supabase;