import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Toast from '@radix-ui/react-toast';

interface CopyBlockProps {
  content: string;
  title?: string;
  language?: string;
  className?: string;
}

export const CopyBlock: React.FC<CopyBlockProps> = ({ 
  content, 
  title, 
  language = 'text',
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setToastOpen(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      setToastOpen(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className={`relative group ${className}`}>
        {title && (
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">{title}</h4>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={handleCopy}
                    className="
                      inline-flex items-center gap-1.5 px-2 py-1 text-xs
                      bg-gray-100 hover:bg-gray-200 text-gray-700
                      border border-gray-300 rounded
                      transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    "
                    aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-green-600" aria-hidden="true" />
                        <span className="text-green-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" aria-hidden="true" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="
                      px-2 py-1 text-xs text-white bg-gray-900 rounded
                      shadow-lg z-50
                    "
                    sideOffset={5}
                  >
                    {copied ? 'Copied!' : 'Copy to clipboard'}
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        )}

        <div className="relative">
          <pre className={`
            p-4 bg-gray-50 border border-gray-200 rounded-lg
            text-sm font-mono leading-relaxed overflow-x-auto
            ${language === 'html' ? 'language-html' : ''}
            ${language === 'css' ? 'language-css' : ''}
          `}>
            <code className="text-gray-800">{content}</code>
          </pre>
          
          {!title && (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={handleCopy}
                    className="
                      absolute top-2 right-2 p-2
                      bg-white/90 hover:bg-white border border-gray-300
                      rounded transition-all duration-200
                      opacity-0 group-hover:opacity-100
                      focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500
                    "
                    aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" aria-hidden="true" />
                    )}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="
                      px-2 py-1 text-xs text-white bg-gray-900 rounded
                      shadow-lg z-50
                    "
                    sideOffset={5}
                  >
                    {copied ? 'Copied!' : 'Copy to clipboard'}
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>
      </div>

      <Toast.Provider swipeDirection="right">
        <Toast.Root
          className="
            bg-green-50 border border-green-200 rounded-lg shadow-lg p-4
            data-[state=open]:animate-slideIn data-[state=closed]:animate-hide
            data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]
            data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out]
            data-[swipe=end]:animate-swipeOut
          "
          open={toastOpen}
          onOpenChange={setToastOpen}
        >
          <Toast.Title className="text-sm font-medium text-green-800 flex items-center gap-2">
            <Check className="w-4 h-4" aria-hidden="true" />
            Copied to clipboard
          </Toast.Title>
          <Toast.Description className="text-xs text-green-600 mt-1">
            Template is ready to paste
          </Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col p-6 gap-2 w-96 max-w-[100vw] m-0 list-none z-50 outline-none" />
      </Toast.Provider>
    </>
  );
};

export default CopyBlock;