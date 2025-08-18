# Supabase Storage Setup Guide

## 🔥 **Issue: "Bucket not found" Error**

When users try to upload images in the New Product form, you may encounter a "Bucket not found" error. This happens because the required storage buckets haven't been created in your Supabase project.

## 🛠️ **Quick Fix**

### Step 1: Run Storage Setup Script
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/storage-setup.sql`
4. Click **Run** to execute the script

### Step 2: Verify Bucket Creation
1. Go to **Storage** in your Supabase dashboard
2. You should see the following buckets:
   - `product-images` (for product photos)
   - `store-images` (for store logos, banners, etc.)

## 📋 **Manual Setup (Alternative)**

If you prefer to set up manually:

### Create Buckets
1. Go to **Storage** → **Create a new bucket**
2. Create bucket with these settings:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Enabled
   - **File size limit**: 50MB
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

### Set Up Policies
In **SQL Editor**, run:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');
```

## 🔧 **Bucket Configuration**

### Default Buckets Used:
- **product-images**: Product photos and gallery images
- **store-images**: Store logos, banners, profile images

### File Restrictions:
- **Max size**: 50MB per file
- **Allowed types**: JPEG, PNG, WebP, GIF
- **Public access**: ✅ Enabled (for displaying images)

## 🚨 **Error Messages You Might See**

### "Bucket not found"
**Cause**: Storage bucket doesn't exist  
**Solution**: Run the storage setup script

### "Permission denied" 
**Cause**: RLS policies not configured  
**Solution**: Check storage policies in Supabase dashboard

### "Authentication required"
**Cause**: User not logged in  
**Solution**: Ensure user authentication is working

### "File too large"
**Cause**: File exceeds 50MB limit  
**Solution**: User should resize/compress image

## 📁 **File Organization**

Images are organized as follows:
```
product-images/
├── products/
│   ├── 1639123456789-abc123def.jpg
│   ├── 1639123457890-xyz789ghi.png
│   └── ...
└── galleries/
    ├── 1639123458901-gallery1.jpg
    └── ...

store-images/
├── logos/
│   ├── 1639123459012-logo1.png
│   └── ...
└── banners/
    ├── 1639123460123-banner1.jpg
    └── ...
```

## ✅ **Verification Steps**

1. **Test Upload**: Try uploading an image in the New Product form
2. **Check Storage**: Verify file appears in Supabase Storage
3. **Test Display**: Ensure image displays correctly in the product form
4. **Check URL**: Verify the public URL is accessible

## 🔗 **Related Files**

- `src/components/ImageUpload.tsx` - Image upload component
- `src/components/ProductForm.tsx` - Uses ImageUpload for products
- `database/storage-setup.sql` - Automated bucket setup script

## 🆘 **Still Having Issues?**

1. Check your Supabase project URL and keys in `.env`
2. Verify internet connection and Supabase service status
3. Check browser console for detailed error messages
4. Ensure your Supabase project has storage enabled

## 🎯 **Best Practices**

- **Image Optimization**: Encourage users to upload compressed images
- **Naming Convention**: Files are automatically renamed with timestamps
- **Security**: Only authenticated users can upload
- **Cleanup**: Consider implementing periodic cleanup of unused images