/**
 * SellUsGenie Promotions Management Page
 * Main interface for store owners to manage promotion codes and coupons
 */

import React, { useState } from 'react';
import { Plus, Search, Filter, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { PromotionsList } from './PromotionsList';
import { CreatePromotionDialog } from './CreatePromotionDialog';
import { PromotionsStats } from './PromotionsStats';
import { usePromotions, usePromotionStats } from '../../hooks/usePromotions';
import type { PromotionFilters, PromotionType } from '../../types/promotions';

const PROMOTION_TYPES: { value: PromotionType; label: string }[] = [
  { value: 'PERCENTAGE', label: 'Percentage Off' },
  { value: 'FIXED_AMOUNT', label: 'Fixed Amount' },
  { value: 'FREE_SHIPPING', label: 'Free Shipping' },
  { value: 'BOGO', label: 'Buy One Get One' },
  { value: 'TIERED', label: 'Tiered Discount' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'expired', label: 'Expired' },
  { value: 'upcoming', label: 'Upcoming' }
];

export const PromotionsPage: React.FC = () => {
  const [filters, setFilters] = useState<PromotionFilters>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: promotionsData,
    isLoading,
    error
  } = usePromotions(filters, currentPage, 20);

  const { data: stats } = usePromotionStats();

  const handleFilterChange = (newFilters: Partial<PromotionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promotions</h1>
          <p className="text-muted-foreground">
            Manage discount codes and promotional offers for your store
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export usage report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Promotion
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <PromotionsStats stats={stats} />}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-auto">
                {Object.keys(filters).length} active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search codes, names..."
                className="pl-10"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange({ search: e.target.value || undefined })}
              />
            </div>

            {/* Type Filter */}
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={filters.type || ''}
              onChange={(e) => handleFilterChange({ type: e.target.value as PromotionType || undefined })}
            >
              <option value="">All Types</option>
              {PROMOTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange({ status: e.target.value as any || undefined })}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Actions */}
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Promotions
            {promotionsData && (
              <Badge variant="secondary" className="ml-2">
                {promotionsData.total}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-red-600">
              Error loading promotions: {error.message}
            </div>
          )}
          
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Loading promotions...
            </div>
          )}

          {promotionsData && (
            <PromotionsList
              promotions={promotionsData.data}
              currentPage={currentPage}
              totalPages={Math.ceil(promotionsData.total / 20)}
              onPageChange={setCurrentPage}
              hasMore={promotionsData.has_more}
            />
          )}

          {promotionsData && promotionsData.data.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto max-w-sm">
                <div className="mb-4">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">No promotions found</h3>
                <p className="text-muted-foreground mb-6">
                  {hasActiveFilters 
                    ? 'No promotions match your current filters.'
                    : 'Get started by creating your first promotion.'
                  }
                </p>
                {!hasActiveFilters && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Promotion
                  </Button>
                )}
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Promotion Dialog */}
      <CreatePromotionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};