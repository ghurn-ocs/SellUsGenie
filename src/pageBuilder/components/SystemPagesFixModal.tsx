/**
 * System Pages Fix Modal
 * Professional modal for system pages metadata migration
 */

import React, { useState } from 'react';
import { X, Shield, CheckCircle, AlertCircle, Loader, Settings, Info } from 'lucide-react';
import { fixProductsPageSlugs } from '../../utils/fixProductsPageSlugs';

interface SystemPagesFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFix: () => Promise<{ success: boolean; message: string; updatedPages: number; errors: string[] }>;
}

export const SystemPagesFixModal: React.FC<SystemPagesFixModalProps> = ({
  isOpen,
  onClose,
  onFix
}) => {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; updatedPages: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  const handleFix = async () => {
    setIsFixing(true);
    setResult(null);
    
    try {
      // First run the main system pages fix
      const systemPagesResult = await onFix();
      
      // Then run the products page slug fix
      const slugFixResult = await fixProductsPageSlugs();
      
      // Combine results
      const combinedResult = {
        success: systemPagesResult.success && slugFixResult.success,
        message: [systemPagesResult.message, slugFixResult.message].filter(Boolean).join(' '),
        updatedPages: systemPagesResult.updatedPages + slugFixResult.updatedPages,
        errors: [...systemPagesResult.errors, ...slugFixResult.errors]
      };
      
      setResult(combinedResult);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        updatedPages: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleClose = () => {
    if (!isFixing) {
      onClose();
      setResult(null);
    }
  };

  const systemPages = [
    { name: 'About Us', description: 'Company information and story' },
    { name: 'Privacy Policy', description: 'Privacy and data protection policy' },
    { name: 'Terms & Conditions', description: 'Terms of service and legal conditions' },
    { name: 'Contact Us', description: 'Contact information and form' },
    { name: 'Returns', description: 'Return policy and procedures' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Fix System Pages Protection
                </h3>
                <p className="text-blue-100 text-sm">
                  Update page metadata for proper protection
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isFixing}
              className="text-white hover:text-gray-200 p-1 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {!result ? (
            <>
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Missing System Pages
                </h4>
                <p className="text-gray-600">
                  Some essential system pages may be missing from your store, and existing pages may have incorrect URLs. This tool will check what pages exist, recreate any missing ones with proper protection and content, and fix any URL conflicts.
                </p>
              </div>

              {/* Information */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-semibold text-blue-900 mb-2">What this creates</h5>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• Recreates missing essential pages (Home, About, Privacy, Terms, Contact, Returns)</li>
                      <li>• Fixes Products & Services page URL conflicts (changes "/" to "/products")</li>
                      <li>• Sets proper protection on system pages (no delete/duplicate buttons)</li>
                      <li>• Changes edit buttons to "View" with Settings → Policies guidance</li>
                      <li>• Adds professional content and SEO optimization</li>
                      <li>• Publishes pages immediately for immediate use</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* System Pages List */}
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-900 mb-3">System Pages to Protect</h5>
                <div className="space-y-3">
                  {systemPages.map((page, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className="text-sm font-medium text-gray-900">
                          {page.name}
                        </h6>
                        <p className="text-xs text-gray-600 mt-1">
                          {page.description}
                        </p>
                      </div>
                      <div className="text-gray-400">
                        <Settings className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-semibold text-amber-900 mb-1">Safe Operation</h5>
                    <p className="text-sm text-amber-800">
                      This operation only updates page metadata and does not modify page content. 
                      It's completely safe and reversible.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Result Display */
            <div className="text-center py-8">
              {result.success ? (
                <>
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    System Pages Created!
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {result.message}
                  </p>
                  {result.updatedPages > 0 && (
                    <p className="text-sm text-green-600 mb-6">
                      Created {result.updatedPages} system page{result.updatedPages !== 1 ? 's' : ''} successfully
                    </p>
                  )}
                  <div className="bg-green-50 rounded-lg p-4 text-left">
                    <h5 className="text-sm font-semibold text-green-900 mb-2">What's Changed</h5>
                    <ul className="space-y-1 text-sm text-green-800">
                      <li>• System pages are now fully editable in Visual Page Builder</li>
                      <li>• Products & Services pages now use proper "/products" URLs</li>
                      <li>• All system page content can be customized directly</li>
                      <li>• System page badges display for identification</li>
                      <li>• Pages are ready for content editing and design</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Fix Failed
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {result.message}
                  </p>
                  {result.errors.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-4 text-left mb-4">
                      <h5 className="text-sm font-semibold text-red-900 mb-2">Error Details</h5>
                      <ul className="space-y-1 text-sm text-red-800">
                        {result.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    Please try again or contact support if the problem persists.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          {!result ? (
            <>
              <button
                onClick={handleClose}
                disabled={isFixing}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFix}
                disabled={isFixing}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isFixing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Fixing...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Create Missing Pages</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {result.success ? 'Done' : 'Close'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};