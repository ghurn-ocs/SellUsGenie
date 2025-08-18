/**
 * Storage utilities for Supabase bucket management and image uploads
 */

import { supabase } from './supabase';

// Storage bucket configuration
export const STORAGE_BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
  STORE_IMAGES: 'store-images'
} as const;

// Storage folders within buckets
export const STORAGE_FOLDERS = {
  PRODUCTS: 'products',
  GALLERIES: 'galleries', 
  LOGOS: 'logos',
  BANNERS: 'banners'
} as const;

/**
 * Check if a storage bucket exists by testing direct access
 * This avoids issues with listBuckets() permissions
 */
export async function checkBucketExists(bucketName: string): Promise<boolean> {
  try {
    // Try to access the bucket directly by listing its contents
    // This works even when listBuckets() fails due to RLS policies
    const { error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });
    
    // If no error, bucket exists and is accessible
    if (!error) {
      return true;
    }

    // Check for specific "bucket not found" errors
    const errorMessage = error.message?.toLowerCase() || '';
    if (errorMessage.includes('bucket') && errorMessage.includes('not found')) {
      return false;
    }

    // For other errors (like permission issues), assume bucket exists
    // since we can't definitively say it doesn't exist
    console.warn(`Bucket existence check inconclusive for ${bucketName}:`, error.message);
    return true;
  } catch (error) {
    console.error('Error in checkBucketExists:', error);
    // On exception, assume bucket exists to avoid blocking uploads
    return true;
  }
}

/**
 * Get helpful error message for storage errors
 */
export function getStorageErrorMessage(error: any, bucketName: string): string {
  const errorMessage = error?.message || String(error);

  if (errorMessage.includes('Bucket not found') || errorMessage.includes('bucket_id')) {
    return `Storage bucket '${bucketName}' not found. Please run the storage setup script from database/storage-setup.sql to create the required buckets.`;
  }

  if (errorMessage.includes('JWT') || errorMessage.includes('token')) {
    return 'Authentication required. Please log in and try again.';
  }

  if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
    return 'Permission denied. Please check your storage permissions or contact support.';
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (errorMessage.includes('file size') || errorMessage.includes('payload')) {
    return 'File too large. Please use a smaller image (max 50MB).';
  }

  return `Upload failed: ${errorMessage}`;
}

/**
 * Generate a unique filename for uploads
 */
export function generateFileName(originalName: string, folder?: string): string {
  const fileExt = originalName.split('.').pop();
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substr(2, 9);
  const fileName = `${timestamp}-${randomStr}.${fileExt}`;
  
  return folder ? `${folder}/${fileName}` : fileName;
}

/**
 * Validate image file before upload
 */
export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export function validateImageFile(
  file: File, 
  options: FileValidationOptions = {}
): string | null {
  const { 
    maxSizeMB = 50, 
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] 
  } = options;

  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Accepted types: ${allowedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()}`;
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File too large. Maximum size: ${maxSizeMB}MB`;
  }
  
  return null;
}

/**
 * Upload image to Supabase storage with error handling
 */
export async function uploadImage(
  file: File,
  bucketName: string,
  folder?: string,
  options: FileValidationOptions = {}
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file
    const validationError = validateImageFile(file, options);
    if (validationError) {
      return { url: null, error: validationError };
    }

    // Check if bucket exists
    const bucketExists = await checkBucketExists(bucketName);
    if (!bucketExists) {
      return { 
        url: null, 
        error: `Storage bucket '${bucketName}' not found. Please run the storage setup script.` 
      };
    }

    // Generate file path
    const filePath = generateFileName(file.name, folder);

    // Upload file
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return { url: null, error: getStorageErrorMessage(uploadError, bucketName) };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };

  } catch (error) {
    return { url: null, error: getStorageErrorMessage(error, bucketName) };
  }
}

/**
 * Delete image from storage
 */
export async function deleteImage(
  filePath: string,
  bucketName: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      return { success: false, error: getStorageErrorMessage(error, bucketName) };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: getStorageErrorMessage(error, bucketName) };
  }
}