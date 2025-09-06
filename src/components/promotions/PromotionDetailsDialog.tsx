/**
 * Promotion Details Dialog Component
 * Read-only view of promotion details with analytics
 */

import React from 'react';
import { format } from 'date-fns';
import { Calendar, Users, TrendingUp, DollarSign, Copy } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { usePromotionAnalytics } from '../../hooks/usePromotions';
import { useToast } from '../../hooks/useToast';
import type { Promotion } from '../../types/promotions';
import { isActivePromotion } from '../../types/promotions';

interface PromotionDetailsDialogProps {
  promotion: Promotion;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatDiscountValue = (promotion: Promotion) => {
  switch (promotion.type) {
    case 'PERCENTAGE':
      return `${promotion.value}%`;
    case 'FIXED_AMOUNT':
      return `$${promotion.value?.toFixed(2)}`;
    case 'FREE_SHIPPING':
      return 'Free Shipping';
    case 'BOGO':
      return 'Buy One Get One';
    case 'TIERED':
      return 'Tiered Discount';
    default:
      return '-';
  }
};

const getStatusBadge = (promotion: Promotion) => {
  const now = new Date();
  const startsAt = new Date(promotion.starts_at);
  const endsAt = promotion.ends_at ? new Date(promotion.ends_at) : null;

  if (!promotion.is_active) {
    return <Badge variant="secondary">Inactive</Badge>;
  }

  if (startsAt > now) {
    return <Badge variant="outline">Upcoming</Badge>;
  }

  if (endsAt && endsAt < now) {
    return <Badge variant="destructive">Expired</Badge>;
  }

  if (promotion.max_uses && promotion.current_uses >= promotion.max_uses) {
    return <Badge variant="destructive">Limit Reached</Badge>;
  }

  return <Badge variant="default">Active</Badge>;
};

export const PromotionDetailsDialog: React.FC<PromotionDetailsDialogProps> = ({
  promotion,
  open,
  onOpenChange
}) => {
  const { data: analytics } = usePromotionAnalytics(promotion.id);
  const { toast } = useToast();

  const copyCode = () => {
    navigator.clipboard.writeText(promotion.code);
    toast({
      title: 'Copied!',
      description: 'Promotion code copied to clipboard',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
              {promotion.code}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyCode}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
            {getStatusBadge(promotion)}
          </DialogTitle>
          <DialogDescription>
            Detailed information and analytics for this promotion
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Promotion Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{promotion.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{promotion.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-medium">{formatDiscountValue(promotion)}</span>
                </div>
                {promotion.min_order_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Order:</span>
                    <span className="font-medium">${promotion.min_order_amount.toFixed(2)}</span>
                  </div>
                )}
                {promotion.max_discount_amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Discount:</span>
                    <span className="font-medium">${promotion.max_discount_amount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Usage & Limits</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Times Used:</span>
                  <span className="font-medium">
                    {promotion.current_uses}
                    {promotion.max_uses ? ` / ${promotion.max_uses}` : ' (unlimited)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Customer:</span>
                  <span className="font-medium">{promotion.max_uses_per_customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">First Order Only:</span>
                  <span className="font-medium">{promotion.first_order_only ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stackable:</span>
                  <span className="font-medium">{promotion.stackable ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exclusive:</span>
                  <span className="font-medium">{promotion.exclusive ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Starts:</span>
                <div className="font-medium">
                  {format(new Date(promotion.starts_at), 'PPP p')}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Ends:</span>
                <div className="font-medium">
                  {promotion.ends_at 
                    ? format(new Date(promotion.ends_at), 'PPP p')
                    : 'No expiration'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {promotion.description && (
            <div>
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-sm text-muted-foreground">{promotion.description}</p>
            </div>
          )}

          {/* Analytics */}
          {analytics && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Total Uses</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{analytics.total_uses}</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Total Discount</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    ${analytics.total_discount.toFixed(2)}
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Unique Customers</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{analytics.unique_customers}</div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">Avg Order Value</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    ${analytics.average_order_value.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product/Category Restrictions */}
          {((promotion.eligible_products && promotion.eligible_products.length > 0) || 
            (promotion.eligible_categories && promotion.eligible_categories.length > 0) ||
            (promotion.excluded_products && promotion.excluded_products.length > 0) ||
            (promotion.excluded_categories && promotion.excluded_categories.length > 0)) && (
            <div>
              <h3 className="font-semibold mb-3">Product Restrictions</h3>
              <div className="space-y-2 text-sm">
                {promotion.eligible_products && promotion.eligible_products.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Eligible Products:</span>
                    <span className="ml-2 font-medium">{promotion.eligible_products.length} products</span>
                  </div>
                )}
                {promotion.eligible_categories && promotion.eligible_categories.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Eligible Categories:</span>
                    <span className="ml-2 font-medium">{promotion.eligible_categories.length} categories</span>
                  </div>
                )}
                {promotion.excluded_products && promotion.excluded_products.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Excluded Products:</span>
                    <span className="ml-2 font-medium">{promotion.excluded_products.length} products</span>
                  </div>
                )}
                {promotion.excluded_categories && promotion.excluded_categories.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Excluded Categories:</span>
                    <span className="ml-2 font-medium">{promotion.excluded_categories.length} categories</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};