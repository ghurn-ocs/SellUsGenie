import React from 'react';
import { ExternalLink, Settings, Package, Tags, Image } from 'lucide-react';
import { Link } from 'wouter';

interface CtaChipProps {
  label: string;
  href: string;
  icon: string;
  external?: boolean;
  className?: string;
}

const iconMap = {
  Settings,
  Package,
  Tags,
  Image,
  ExternalLink
};

export const CtaChip: React.FC<CtaChipProps> = ({ 
  label, 
  href, 
  icon, 
  external = false,
  className = '' 
}) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Settings;
  
  const chipClasses = `
    inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium
    bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800
    border border-blue-200 hover:border-blue-300
    rounded-full transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${className}
  `;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={chipClasses}
        aria-label={`${label} (opens in new tab)`}
      >
        <IconComponent className="w-4 h-4" aria-hidden="true" />
        <span>{label}</span>
        <ExternalLink className="w-3 h-3" aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link href={href} className={chipClasses}>
      <IconComponent className="w-4 h-4" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
};

export default CtaChip;