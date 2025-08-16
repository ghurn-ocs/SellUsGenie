/**
 * Form View Component
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Check, AlertCircle, Loader2, Upload } from 'lucide-react';
import type { WidgetViewProps } from '../../types';
import type { FormProps, FormField } from './index';

export const FormView: React.FC<WidgetViewProps> = ({ widget }) => {
  const props = widget.props as FormProps;
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());

  // Initialize form data with default values
  useEffect(() => {
    const initialData: Record<string, string | string[]> = {};
    props.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.id] = field.defaultValue;
      } else if (field.type === 'checkbox' && field.options) {
        initialData[field.id] = [];
      } else {
        initialData[field.id] = '';
      }
    });
    setFormData(initialData);
  }, [props.fields]);

  // Update visible fields based on conditional logic
  useEffect(() => {
    const visible = new Set<string>();
    
    props.fields.forEach(field => {
      let shouldShow = true;
      
      if (field.conditionalLogic?.showWhen) {
        const condition = field.conditionalLogic.showWhen;
        const fieldValue = formData[condition.fieldId];
        
        switch (condition.operator) {
          case 'equals':
            shouldShow = fieldValue === condition.value || 
              (Array.isArray(fieldValue) && Array.isArray(condition.value) && 
               JSON.stringify(fieldValue.sort()) === JSON.stringify(condition.value.sort()));
            break;
          case 'not_equals':
            shouldShow = fieldValue !== condition.value;
            break;
          case 'contains':
            shouldShow = Array.isArray(fieldValue) && Array.isArray(condition.value) &&
              condition.value.some(v => fieldValue.includes(v));
            break;
          case 'greater_than':
            shouldShow = Number(fieldValue) > Number(condition.value);
            break;
          case 'less_than':
            shouldShow = Number(fieldValue) < Number(condition.value);
            break;
        }
      }
      
      if (shouldShow) {
        visible.add(field.id);
      }
    });
    
    setVisibleFields(visible);
  }, [formData, props.fields]);

  const validateField = useCallback((field: FormField, value: string | string[]) => {
    const errors: string[] = [];

    // Required validation
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      errors.push(`${field.label} is required`);
    }

    if (value && !Array.isArray(value)) {
      // Email validation
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push('Please enter a valid email address');
      }

      // URL validation
      if (field.type === 'url' && !/^https?:\/\/.+/.test(value)) {
        errors.push('Please enter a valid URL');
      }

      // Phone validation
      if (field.type === 'phone' && !/^[\+]?[\d\s\-\(\)]+$/.test(value)) {
        errors.push('Please enter a valid phone number');
      }

      // Length validation
      if (field.validation?.min && value.length < field.validation.min) {
        errors.push(`Minimum ${field.validation.min} characters required`);
      }

      if (field.validation?.max && value.length > field.validation.max) {
        errors.push(`Maximum ${field.validation.max} characters allowed`);
      }

      // Pattern validation
      if (field.validation?.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          errors.push(field.validation.customMessage || 'Invalid format');
        }
      }

      // Number validation
      if (field.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push('Please enter a valid number');
        } else {
          if (field.validation?.min && num < field.validation.min) {
            errors.push(`Minimum value is ${field.validation.min}`);
          }
          if (field.validation?.max && num > field.validation.max) {
            errors.push(`Maximum value is ${field.validation.max}`);
          }
        }
      }
    }

    return errors[0] || null;
  }, []);

  const handleFieldChange = useCallback((fieldId: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));

    if (props.validation.validateOnChange) {
      const field = props.fields.find(f => f.id === fieldId);
      if (field) {
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [fieldId]: error || '' }));
      }
    }
  }, [props.validation.validateOnChange, props.fields, validateField]);

  const handleFieldBlur = useCallback((fieldId: string) => {
    if (props.validation.validateOnBlur) {
      const field = props.fields.find(f => f.id === fieldId);
      if (field) {
        const value = formData[fieldId];
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [fieldId]: error || '' }));
      }
    }
  }, [props.validation.validateOnBlur, props.fields, formData, validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Validate all visible fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    props.fields.forEach(field => {
      if (visibleFields.has(field.id)) {
        const error = validateField(field, formData[field.id]);
        if (error) {
          newErrors[field.id] = error;
          hasErrors = true;
        }
      }
    });

    setErrors(newErrors);

    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Handle form submission based on action type
      switch (props.actions.onSubmit) {
        case 'email':
          // In a real implementation, this would send an email via your backend
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
          break;
        
        case 'webhook':
          if (props.actions.webhookUrl) {
            await fetch(props.actions.webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData),
            });
          }
          break;
        
        case 'redirect':
          if (props.actions.redirectUrl) {
            window.location.href = props.actions.redirectUrl;
            return;
          }
          break;
        
        case 'custom':
          // Custom JavaScript execution would go here
          break;
      }

      setSubmitStatus('success');
      
      // Reset form after successful submission
      const resetData: Record<string, string | string[]> = {};
      props.fields.forEach(field => {
        resetData[field.id] = field.type === 'checkbox' && field.options ? [] : '';
      });
      setFormData(resetData);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, props.fields, props.actions, visibleFields, validateField]);

  const renderField = useCallback((field: FormField) => {
    if (!visibleFields.has(field.id)) return null;

    const value = formData[field.id] || '';
    const error = errors[field.id];
    const hasError = !!error && props.validation.showErrorsInline;

    const fieldClasses = `
      ${props.styling.fieldStyle === 'filled' ? 'bg-gray-50 border-gray-200' : ''}
      ${props.styling.fieldStyle === 'outlined' ? 'bg-white border-gray-300' : ''}
      ${props.styling.fieldStyle === 'underlined' ? 'bg-transparent border-0 border-b-2 border-gray-300 rounded-none' : ''}
      ${hasError ? 'border-red-500 focus:border-red-500' : 'focus:border-primary-500'}
      w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20
    `;

    const widthClasses = {
      full: 'col-span-full',
      half: 'col-span-6',
      third: 'col-span-4',
      quarter: 'col-span-3',
    };

    const commonProps = {
      id: field.id,
      className: fieldClasses,
      placeholder: props.styling.showPlaceholders ? field.placeholder : undefined,
      required: field.required,
      onBlur: () => handleFieldBlur(field.id),
    };

    let fieldElement;

    switch (field.type) {
      case 'textarea':
        fieldElement = (
          <textarea
            {...commonProps}
            value={value as string}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={4}
          />
        );
        break;

      case 'select':
        fieldElement = (
          <select
            {...commonProps}
            value={value as string}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          >
            <option value="">Choose an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        break;

      case 'checkbox':
        fieldElement = (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(value as string[]).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = value as string[];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleFieldChange(field.id, newValues);
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
        break;

      case 'radio':
        fieldElement = (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
        break;

      case 'file':
        fieldElement = (
          <div className="relative">
            <input
              type="file"
              {...commonProps}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFieldChange(field.id, file.name);
                }
              }}
              className="hidden"
            />
            <label htmlFor={field.id} className={`${fieldClasses} cursor-pointer flex items-center justify-center space-x-2`}>
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500">{value || 'Choose file'}</span>
            </label>
          </div>
        );
        break;

      default:
        fieldElement = (
          <input
            {...commonProps}
            type={field.type}
            value={value as string}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
    }

    return (
      <div key={field.id} className={`${field.width ? widthClasses[field.width] : 'col-span-full'}`}>
        {props.styling.showLabels && (
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && props.styling.showRequiredIndicator && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
        )}
        
        {fieldElement}
        
        {field.helpText && (
          <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
        )}
        
        {hasError && (
          <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }, [formData, errors, props.styling, props.validation.showErrorsInline, visibleFields, handleFieldChange, handleFieldBlur]);

  const getSpacingClass = () => {
    switch (props.styling.spacing) {
      case 'compact': return 'space-y-3';
      case 'loose': return 'space-y-8';
      default: return 'space-y-6';
    }
  };

  const getLayoutClass = () => {
    switch (props.styling.layout) {
      case 'inline': return 'flex flex-wrap gap-4';
      case 'grid': return 'grid grid-cols-12 gap-4';
      default: return getSpacingClass();
    }
  };

  const getButtonStyle = () => {
    const baseClasses = 'font-medium rounded-lg transition-all flex items-center justify-center space-x-2';
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };
    
    const styleClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-500',
      minimal: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    };

    return `${baseClasses} ${sizeClasses[props.submitButton.size]} ${styleClasses[props.submitButton.style]} ${
      props.submitButton.fullWidth ? 'w-full' : ''
    }`;
  };

  if (submitStatus === 'success') {
    return (
      <div className="text-center p-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you!</h3>
        <p className="text-gray-600">{props.actions.successMessage}</p>
      </div>
    );
  }

  return (
    <div className="form-widget max-w-2xl">
      {(props.title || props.description) && (
        <div className="mb-8">
          {props.title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{props.title}</h2>
          )}
          {props.description && (
            <p className="text-gray-600">{props.description}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={getLayoutClass()}>
          {props.fields.map(renderField)}
        </div>

        {submitStatus === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{props.actions.errorMessage}</p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={getButtonStyle()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{props.submitButton.loadingText || 'Submitting...'}</span>
              </>
            ) : (
              <span>{props.submitButton.text}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};