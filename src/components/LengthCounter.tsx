import React, { useState, useEffect } from 'react';
import { Info, Check, AlertTriangle } from 'lucide-react';

interface LengthCounterProps {
  label: string;
  placeholder: string;
  minLength?: number;
  maxLength?: number;
  idealMin?: number;
  idealMax?: number;
  keywordToCheck?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  multiline?: boolean;
  className?: string;
}

interface FeedbackState {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  icon: React.ReactNode;
}

export const LengthCounter: React.FC<LengthCounterProps> = ({
  label,
  placeholder,
  minLength = 0,
  maxLength = 160,
  idealMin = 50,
  idealMax = 60,
  keywordToCheck,
  defaultValue = '',
  onChange,
  multiline = false,
  className = ''
}) => {
  const [value, setValue] = useState(defaultValue);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const currentLength = value.length;
  const hasKeyword = keywordToCheck ? 
    value.toLowerCase().includes(keywordToCheck.toLowerCase()) : 
    true;

  useEffect(() => {
    // Calculate feedback based on length and keyword presence
    let newFeedback: FeedbackState | null = null;

    if (currentLength === 0) {
      newFeedback = {
        type: 'info',
        message: `Start typing your ${label.toLowerCase()}`,
        icon: <Info className="w-4 h-4" />
      };
    } else if (currentLength < minLength) {
      newFeedback = {
        type: 'error',
        message: `Too short. Add ${minLength - currentLength} more characters.`,
        icon: <AlertTriangle className="w-4 h-4" />
      };
    } else if (currentLength > maxLength) {
      newFeedback = {
        type: 'error',
        message: `Too long. Remove ${currentLength - maxLength} characters.`,
        icon: <AlertTriangle className="w-4 h-4" />
      };
    } else if (currentLength >= idealMin && currentLength <= idealMax && hasKeyword) {
      newFeedback = {
        type: 'success',
        message: keywordToCheck 
          ? `Perfect! Good length and includes "${keywordToCheck}".`
          : 'Perfect length!',
        icon: <Check className="w-4 h-4" />
      };
    } else if (!hasKeyword && keywordToCheck) {
      newFeedback = {
        type: 'warning',
        message: `Consider including "${keywordToCheck}" for better SEO.`,
        icon: <AlertTriangle className="w-4 h-4" />
      };
    } else if (currentLength < idealMin) {
      newFeedback = {
        type: 'warning',
        message: `Good start. ${idealMin - currentLength} more characters for ideal length.`,
        icon: <Info className="w-4 h-4" />
      };
    } else if (currentLength > idealMax) {
      newFeedback = {
        type: 'warning',
        message: `A bit long. Consider shortening by ${currentLength - idealMax} characters.`,
        icon: <AlertTriangle className="w-4 h-4" />
      };
    } else {
      newFeedback = {
        type: 'info',
        message: 'Looking good!',
        icon: <Check className="w-4 h-4" />
      };
    }

    setFeedback(newFeedback);
  }, [value, currentLength, hasKeyword, keywordToCheck, label, minLength, maxLength, idealMin, idealMax]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
  };

  const getLengthColor = () => {
    if (currentLength === 0) return 'text-gray-400';
    if (currentLength < minLength || currentLength > maxLength) return 'text-red-600';
    if (currentLength >= idealMin && currentLength <= idealMax) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getFeedbackColor = () => {
    switch (feedback?.type) {
      case 'success': return 'text-green-700 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  const inputClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-md
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    transition-colors duration-200
    ${currentLength > maxLength ? 'border-red-300 focus:ring-red-500' : ''}
    ${currentLength >= idealMin && currentLength <= idealMax && hasKeyword ? 'border-green-300 focus:ring-green-500' : ''}
  `;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        
        {multiline ? (
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            rows={3}
            className={inputClasses}
            aria-describedby={`${label.toLowerCase().replace(/\s+/g, '-')}-feedback`}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={inputClasses}
            aria-describedby={`${label.toLowerCase().replace(/\s+/g, '-')}-feedback`}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className={`font-mono ${getLengthColor()}`}>
            {currentLength} / {maxLength}
          </span>
          
          <span className="text-gray-500">
            Ideal: {idealMin}–{idealMax} chars
          </span>
          
          {keywordToCheck && (
            <span className={`flex items-center gap-1 ${hasKeyword ? 'text-green-600' : 'text-yellow-600'}`}>
              {hasKeyword ? (
                <Check className="w-3 h-3" aria-hidden="true" />
              ) : (
                <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              )}
              <span className="text-xs">
                {hasKeyword ? 'Keyword included' : 'Missing keyword'}
              </span>
            </span>
          )}
        </div>
      </div>

      {feedback && (
        <div 
          className={`flex items-center gap-2 p-2 rounded border text-xs ${getFeedbackColor()}`}
          id={`${label.toLowerCase().replace(/\s+/g, '-')}-feedback`}
          role="status"
          aria-live="polite"
        >
          {feedback.icon}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
};

export default LengthCounter;