/**
 * Enhanced Page Builder Page
 * Full-screen enhanced page builder
 */

import React from 'react';
import { EnhancedPageBuilder } from '../../pageBuilder/editor/EnhancedPageBuilder';
import { SupabasePageRepository } from '../../pageBuilder/data/SupabasePageRepository';
import type { User as PageBuilderUser } from '../../pageBuilder/types';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';

interface EnhancedPageBuilderPageProps {
  pageId?: string;
}

export const EnhancedPageBuilderPage: React.FC<EnhancedPageBuilderPageProps> = ({ pageId }) => {
  const { user } = useAuth();
  const { currentStore } = useStore();

  // Convert auth user to page builder user format
  const pageBuilderUser: PageBuilderUser | null = user && currentStore ? {
    id: user.id,
    email: user.email || '',
    role: 'owner', // TODO: Implement proper role management
    storeId: currentStore.id,
  } : null;

  const repository = pageBuilderUser && currentStore ? 
    new SupabasePageRepository(pageBuilderUser, currentStore.id) : null;

  const handleSave = async (document: any) => {
    if (!repository) return;
    
    try {
      console.log('Page saved for store:', currentStore?.id, document);
      await repository.saveDraft(document);
      // TODO: Implement toast notification
    } catch (error) {
      console.error('Error saving page:', error);
      // TODO: Implement error notification
    }
  };

  const handlePublish = async (document: any) => {
    if (!repository) return;
    
    try {
      console.log('Page published for store:', currentStore?.id, document);
      await repository.publish(document.id);
      // TODO: Implement success message
    } catch (error) {
      console.error('Error publishing page:', error);
      // TODO: Implement error notification
    }
  };

  const handleError = (error: Error) => {
    console.error('Page builder error:', error);
    // TODO: Implement proper error notification
  };

  // Don't render if no user or store is available
  if (!pageBuilderUser || !repository) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page builder...</p>
        </div>
      </div>
    );
  }

  return (
    <EnhancedPageBuilder
      pageId={pageId}
      user={pageBuilderUser}
      repository={repository}
      onSave={handleSave}
      onPublish={handlePublish}
      onError={handleError}
    />
  );
};