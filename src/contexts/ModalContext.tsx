/**
 * Modal Context for Business-Friendly User Interactions
 * Provides centralized modal management with clear, non-technical language
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertModal } from '../components/ui/AlertModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { PromptModal } from '../components/ui/PromptModal';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  submitText?: string;
  cancelText?: string;
  required?: boolean;
}

interface ModalState {
  alert: Partial<AlertModalProps> | null;
  confirmation: Partial<ConfirmationModalProps> | null;
  prompt: Partial<PromptModalProps> | null;
}

interface ModalContextType {
  // Alert methods
  showAlert: (options: {
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    buttonText?: string;
  }) => Promise<void>;
  
  showSuccess: (title: string, message: string) => Promise<void>;
  showError: (title: string, message: string) => Promise<void>;
  showWarning: (title: string, message: string) => Promise<void>;
  showInfo: (title: string, message: string) => Promise<void>;

  // Confirmation methods
  showConfirmation: (options: {
    title: string;
    message: string;
    type?: 'warning' | 'danger' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
  }) => Promise<boolean>;

  // Prompt methods
  showPrompt: (options: {
    title: string;
    message: string;
    placeholder?: string;
    defaultValue?: string;
    submitText?: string;
    cancelText?: string;
    required?: boolean;
  }) => Promise<string | null>;

  // Close all modals
  closeAll: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    alert: null,
    confirmation: null,
    prompt: null,
  });

  const [resolvers, setResolvers] = useState<{
    alert: (() => void) | null;
    confirmation: ((result: boolean) => void) | null;
    prompt: ((result: string | null) => void) | null;
  }>({
    alert: null,
    confirmation: null,
    prompt: null,
  });

  // Alert methods
  const showAlert = (options: Parameters<ModalContextType['showAlert']>[0]): Promise<void> => {
    return new Promise((resolve) => {
      setModalState(prev => ({
        ...prev,
        alert: {
          ...options,
          isOpen: true,
          onClose: () => {
            setModalState(prev => ({ ...prev, alert: null }));
            setResolvers(prev => ({ ...prev, alert: null }));
            resolve();
          },
        },
      }));
      setResolvers(prev => ({ ...prev, alert: () => resolve() }));
    });
  };

  const showSuccess = (title: string, message: string) => 
    showAlert({ title, message, type: 'success' });

  const showError = (title: string, message: string) => 
    showAlert({ title, message, type: 'error' });

  const showWarning = (title: string, message: string) => 
    showAlert({ title, message, type: 'warning' });

  const showInfo = (title: string, message: string) => 
    showAlert({ title, message, type: 'info' });

  // Confirmation methods
  const showConfirmation = (options: Parameters<ModalContextType['showConfirmation']>[0]): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState(prev => ({
        ...prev,
        confirmation: {
          ...options,
          isOpen: true,
          onClose: () => {
            setModalState(prev => ({ ...prev, confirmation: null }));
            setResolvers(prev => ({ ...prev, confirmation: null }));
            resolve(false);
          },
          onConfirm: () => {
            setModalState(prev => ({ ...prev, confirmation: null }));
            setResolvers(prev => ({ ...prev, confirmation: null }));
            resolve(true);
          },
        },
      }));
      setResolvers(prev => ({ ...prev, confirmation: (result: boolean) => resolve(result) }));
    });
  };

  // Prompt methods
  const showPrompt = (options: Parameters<ModalContextType['showPrompt']>[0]): Promise<string | null> => {
    return new Promise((resolve) => {
      setModalState(prev => ({
        ...prev,
        prompt: {
          ...options,
          isOpen: true,
          onClose: () => {
            setModalState(prev => ({ ...prev, prompt: null }));
            setResolvers(prev => ({ ...prev, prompt: null }));
            resolve(null);
          },
          onSubmit: (value: string) => {
            setModalState(prev => ({ ...prev, prompt: null }));
            setResolvers(prev => ({ ...prev, prompt: null }));
            resolve(value);
          },
        },
      }));
      setResolvers(prev => ({ ...prev, prompt: (result: string | null) => resolve(result) }));
    });
  };

  const closeAll = () => {
    setModalState({
      alert: null,
      confirmation: null,
      prompt: null,
    });
    setResolvers({
      alert: null,
      confirmation: null,
      prompt: null,
    });
  };

  const contextValue: ModalContextType = {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
    showPrompt,
    closeAll,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      
      {/* Render modals */}
      {modalState.alert && (
        <AlertModal
          {...modalState.alert}
          isOpen={true}
          onClose={modalState.alert.onClose || (() => {})}
          title={modalState.alert.title || ''}
          message={modalState.alert.message || ''}
        />
      )}
      
      {modalState.confirmation && (
        <ConfirmationModal
          {...modalState.confirmation}
          isOpen={true}
          onClose={modalState.confirmation.onClose || (() => {})}
          onConfirm={modalState.confirmation.onConfirm || (() => {})}
          title={modalState.confirmation.title || ''}
          message={modalState.confirmation.message || ''}
        />
      )}
      
      {modalState.prompt && (
        <PromptModal
          {...modalState.prompt}
          isOpen={true}
          onClose={modalState.prompt.onClose || (() => {})}
          onSubmit={modalState.prompt.onSubmit || (() => {})}
          title={modalState.prompt.title || ''}
          message={modalState.prompt.message || ''}
        />
      )}
    </ModalContext.Provider>
  );
};

// Hook to use modal context
export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};