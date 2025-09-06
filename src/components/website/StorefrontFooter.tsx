import React from 'react';

interface StorefrontFooterProps {
  storeData?: {
    id: string;
    store_name: string;
    store_slug: string;
    store_logo_url: string | null;
    is_active: boolean;
  };
}

export const StorefrontFooter: React.FC<StorefrontFooterProps> = ({ storeData }) => {
  console.log('🦶 StorefrontFooter rendered for store:', storeData?.store_name);

  return (
    <footer className="storefront-footer bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <p className="text-sm">
            © 2024 {storeData?.store_name || 'Store Name'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};