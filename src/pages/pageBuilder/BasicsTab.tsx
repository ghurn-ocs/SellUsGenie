/**
 * Basics Tab Component
 * Contains store branding, logo, tagline, SEO, and browser tab configuration
 */

import React, { useState } from 'react';
import { Settings, Store, Globe, Upload, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { supabase } from '../../lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const BasicsTab: React.FC = () => {
  const { currentStore, updateStore } = useStore();
  const queryClient = useQueryClient();
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, boolean>>({});
  
  // Local state for form values
  const [formData, setFormData] = useState({
    store_name: currentStore?.store_name || '',
    store_tagline: currentStore?.store_tagline || '', // Use correct store_tagline field
    store_logo_url: currentStore?.store_logo_url || ''
  });

  // Update form data when currentStore changes
  React.useEffect(() => {
    if (currentStore) {
      setFormData({
        store_name: currentStore.store_name || '',
        store_tagline: currentStore.store_tagline || '', // Use correct store_tagline field
        store_logo_url: currentStore.store_logo_url || ''
      });
      setUnsavedChanges({});
    }
  }, [currentStore]);

  const saveBasics = useMutation({
    mutationFn: async (updates: Partial<typeof formData>) => {
      if (!currentStore) throw new Error('No store selected');
      console.log('Attempting to save store updates:', updates);
      console.log('Store ID:', currentStore.id);
      
      // Map form fields to database columns
      const dbUpdates: Record<string, any> = {};
      if ('store_name' in updates) dbUpdates.store_name = updates.store_name;
      if ('store_tagline' in updates) dbUpdates.store_tagline = updates.store_tagline; // Use correct store_tagline field
      if ('store_logo_url' in updates) dbUpdates.store_logo_url = updates.store_logo_url;
      
      console.log('Mapped database updates:', dbUpdates);
      await updateStore(currentStore.id, dbUpdates);
    },
    onSuccess: () => {
      console.log('Store basics saved successfully');
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setUnsavedChanges({});
    },
    onError: (error) => {
      console.error('Error saving store basics:', error);
    }
  });

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(prev => ({ ...prev, [field]: true }));
  };

  const handleSave = () => {
    const changedFields = Object.keys(unsavedChanges).reduce((acc, key) => {
      if (unsavedChanges[key]) {
        acc[key] = formData[key as keyof typeof formData];
      }
      return acc;
    }, {} as Partial<typeof formData>);

    if (Object.keys(changedFields).length > 0) {
      saveBasics.mutate(changedFields);
    }
  };

  const hasUnsavedChanges = Object.values(unsavedChanges).some(Boolean);

  if (!currentStore) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-[#A0A0A0] mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Store Selected</h3>
          <p className="text-[#A0A0A0]">Please select a store to configure its basic settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Save Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Store Basics</h2>
          {hasUnsavedChanges && (
            <button
              onClick={handleSave}
              disabled={saveBasics.isPending}
              className="inline-flex items-center px-4 py-2 bg-[#9B51E0] text-white font-medium rounded-lg hover:bg-[#A051E0] disabled:opacity-50 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveBasics.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Store Branding Section */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center mb-4">
                <Store className="h-5 w-5 text-[#A0A0A0] mr-2" />
                <h3 className="text-lg font-medium text-white">Store Branding</h3>
              </div>
              
              <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-6 space-y-6">
                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    value={formData.store_name}
                    onChange={(e) => handleFieldChange('store_name', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent placeholder-[#6A6A6A]"
                    placeholder="Enter your store name"
                  />
                  {unsavedChanges.store_name && (
                    <p className="mt-1 text-sm text-[#9B51E0]">• Unsaved changes</p>
                  )}
                </div>

                {/* Store Tagline */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Store Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.store_tagline}
                    onChange={(e) => handleFieldChange('store_tagline', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent placeholder-[#6A6A6A]"
                    placeholder="Your store's tagline or slogan"
                  />
                  {unsavedChanges.store_tagline && (
                    <p className="mt-1 text-sm text-[#9B51E0]">• Unsaved changes</p>
                  )}
                </div>

                {/* Store Logo */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Store Logo URL
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="url"
                      value={formData.store_logo_url}
                      onChange={(e) => handleFieldChange('store_logo_url', e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent placeholder-[#6A6A6A]"
                      placeholder="https://example.com/logo.png"
                    />
                    <button
                      className="px-4 py-2 bg-[#3A3A3A] text-[#A0A0A0] rounded-lg hover:bg-[#4A4A4A] transition-colors inline-flex items-center"
                      title="Upload logo functionality coming soon"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </button>
                  </div>
                  {unsavedChanges.store_logo_url && (
                    <p className="mt-1 text-sm text-[#9B51E0]">• Unsaved changes</p>
                  )}
                  {formData.store_logo_url && (
                    <div className="mt-3 p-3 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
                      <p className="text-sm text-[#A0A0A0] mb-2">Logo Preview:</p>
                      <img 
                        src={formData.store_logo_url} 
                        alt="Store logo preview"
                        className="h-16 w-auto border border-[#3A3A3A] rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - SEO and Browser Tab Configuration */}
          <div className="space-y-8">
            {/* SEO Configuration Section */}
            <div>
              <div className="flex items-center mb-4">
                <Globe className="h-5 w-5 text-[#A0A0A0] mr-2" />
                <h3 className="text-lg font-medium text-white">SEO Configuration</h3>
              </div>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                <p className="text-green-400 text-sm mb-2">
                  <strong>Coming Soon:</strong> Advanced SEO configuration
                </p>
                <ul className="text-green-300 text-sm space-y-1">
                  <li>• Meta descriptions and keywords</li>
                  <li>• Social media previews (Open Graph)</li>
                  <li>• Structured data markup</li>
                  <li>• XML sitemap generation</li>
                </ul>
              </div>
            </div>

            {/* Browser Tab Configuration Section */}
            <div>
              <div className="flex items-center mb-4">
                <Settings className="h-5 w-5 text-[#A0A0A0] mr-2" />
                <h3 className="text-lg font-medium text-white">Browser Tab Configuration</h3>
              </div>
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                <p className="text-purple-400 text-sm mb-2">
                  <strong>Coming Soon:</strong> Browser tab customization
                </p>
                <ul className="text-purple-300 text-sm space-y-1">
                  <li>• Custom favicon upload</li>
                  <li>• Dynamic title templates</li>
                  <li>• Tab appearance settings</li>
                  <li>• Progressive Web App configuration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(saveBasics.isSuccess || saveBasics.isError) && (
          <div className="mt-8">
            {saveBasics.isSuccess && (
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>Store basics saved successfully!</span>
                </div>
              </div>
            )}

            {saveBasics.isError && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>Failed to save changes. Please try again.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};