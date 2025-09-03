/**
 * Provisioning Modal
 * Professional modal for store provisioning notifications and actions
 */

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, AlertCircle, Loader, Home, FileText, Users, Shield } from 'lucide-react';

interface ProvisioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProvision: () => Promise<{ success: boolean; message: string }>;
  storeName: string;
  needsProvisioning: {
    needsPages: boolean;
    needsPolicies: boolean;
    pageCount: number;
  };
}

export const ProvisioningModal: React.FC<ProvisioningModalProps> = ({
  isOpen,
  onClose,
  onProvision,
  storeName,
  needsProvisioning
}) => {
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleProvision = async () => {
    setIsProvisioning(true);
    setResult(null);
    
    try {
      const result = await onProvision();
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleClose = () => {
    if (!isProvisioning) {
      onClose();
      setResult(null);
    }
  };

  const pagesToCreate = [
    { icon: Home, name: 'Home Page', description: 'Your main landing page with hero section' },
    { icon: Users, name: 'About Us', description: 'Managed through Settings → Policies' },
    { icon: Shield, name: 'Privacy Policy', description: 'Managed through Settings → Policies' },
    { icon: FileText, name: 'Terms & Conditions', description: 'Managed through Settings → Policies' },
    { icon: Users, name: 'Contact Us', description: 'Customizable contact information page' }
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
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Complete Your Store Setup
                </h3>
                <p className="text-purple-100 text-sm">
                  {storeName}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isProvisioning}
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
                  Your store needs essential pages
                </h4>
                <p className="text-gray-600">
                  Let's set up the fundamental pages every professional online store needs. 
                  This takes just a few seconds and gives you a complete website structure.
                </p>
              </div>

              {/* Current Status */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Current Status</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${needsProvisioning.needsPages ? 'bg-amber-400' : 'bg-green-400'}`} />
                    <span className="text-gray-700">
                      Pages: {needsProvisioning.pageCount} created
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${needsProvisioning.needsPolicies ? 'bg-amber-400' : 'bg-green-400'}`} />
                    <span className="text-gray-700">
                      Policies: {needsProvisioning.needsPolicies ? 'Need setup' : 'Ready'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pages to Create */}
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Pages to Create</h5>
                <div className="space-y-3">
                  {pagesToCreate.map((page, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="bg-purple-100 rounded-lg p-2">
                        <page.icon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className="text-sm font-medium text-gray-900">
                          {page.name}
                        </h6>
                        <p className="text-xs text-gray-600 mt-1">
                          {page.description}
                        </p>
                      </div>
                      <div className="text-green-500">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h5 className="text-sm font-semibold text-blue-900 mb-2">What you'll get</h5>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Professional website structure</li>
                  <li>• SEO-optimized page templates</li>
                  <li>• Legal compliance pages</li>
                  <li>• Fully customizable content</li>
                  <li>• Mobile-responsive design</li>
                </ul>
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
                    Store Setup Complete!
                  </h4>
                  <p className="text-gray-600 mb-6">
                    {result.message}
                  </p>
                  <div className="bg-green-50 rounded-lg p-4 text-left">
                    <h5 className="text-sm font-semibold text-green-900 mb-2">Next Steps</h5>
                    <ul className="space-y-1 text-sm text-green-800">
                      <li>• Customize your Home page content</li>
                      <li>• Update your About Us in Settings → Policies</li>
                      <li>• Add your contact information</li>
                      <li>• Preview your live website</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Setup Failed
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {result.message}
                  </p>
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
                disabled={isProvisioning}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Skip for now
              </button>
              <button
                onClick={handleProvision}
                disabled={isProvisioning}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isProvisioning ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Setting up...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Set Up My Store</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              {result.success ? 'Continue to Page Builder' : 'Close'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};