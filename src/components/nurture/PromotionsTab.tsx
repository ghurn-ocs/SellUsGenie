/**
 * Promotions Tab Component
 * Integrated promotion management within the Marketing section
 */

import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit2, Copy, Trash2, Eye, EyeOff, Calendar, Settings, Percent, DollarSign, Truck, Gift, Target } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { CreatePromotionDialog } from '../promotions/CreatePromotionDialog';
import { EditPromotionDialog } from '../promotions/EditPromotionDialog';
import { DeletePromotionDialog } from '../promotions/DeletePromotionDialog';
import { PromotionDetailsDialog } from '../promotions/PromotionDetailsDialog';
import { 
  usePromotions, 
  usePromotionStats,
  useTogglePromotionStatus, 
  useDuplicatePromotion 
} from '../../hooks/usePromotions';
import { useToast } from '../../hooks/useToast';
import type { Promotion, PromotionType, PromotionFilters } from '../../types/promotions';
import { isActivePromotion } from '../../types/promotions';

const getPromotionTypeSymbol = (type: PromotionType) => {
  switch (type) {
    case 'PERCENTAGE':
      return '%';
    case 'FIXED_AMOUNT':
      return '$';
    case 'FREE_SHIPPING':
      return '🚚';
    case 'BOGO':
      return '🎁';
    case 'TIERED':
      return '📊';
    default:
      return '%';
  }
};

const getPromotionTypeBadge = (type: PromotionType) => {
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2A2D36] text-sm font-bold text-white">
      {getPromotionTypeSymbol(type)}
    </div>
  );
};

const getStatusIndicator = (promotion: Promotion) => {
  const now = new Date();
  const startsAt = new Date(promotion.starts_at);
  const endsAt = promotion.ends_at ? new Date(promotion.ends_at) : null;

  if (!promotion.is_active) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        <span className="text-gray-400 text-sm">Inactive</span>
      </div>
    );
  }

  if (startsAt > now) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00D2FF]"></div>
        <span className="text-[#00D2FF] text-sm">Upcoming</span>
      </div>
    );
  }

  if (endsAt && endsAt < now) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-400"></div>
        <span className="text-red-400 text-sm">Expired</span>
      </div>
    );
  }

  if (promotion.max_uses && promotion.current_uses >= promotion.max_uses) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#FF7F00]"></div>
        <span className="text-[#FF7F00] text-sm">Limit Reached</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
      <span className="text-[#22C55E] text-sm">Active</span>
    </div>
  );
};

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

export const PromotionsTab: React.FC = () => {
  const [filters, setFilters] = useState<PromotionFilters>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: promotionsData,
    isLoading,
    error
  } = usePromotions(filters, currentPage, 10);

  const { data: stats } = usePromotionStats();
  const toggleStatus = useTogglePromotionStatus();
  const duplicatePromotion = useDuplicatePromotion();
  const { toast } = useToast();

  const handleFilterChange = (newFilters: Partial<PromotionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleToggleStatus = async (promotion: Promotion) => {
    try {
      await toggleStatus.mutateAsync({
        promotionId: promotion.id,
        isActive: !promotion.is_active
      });
      
      toast({
        title: 'Success',
        description: `Promotion ${promotion.is_active ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update promotion status',
        variant: 'destructive'
      });
    }
  };

  const handleDuplicate = async (promotion: Promotion) => {
    try {
      await duplicatePromotion.mutateAsync(promotion);
      toast({
        title: 'Success',
        description: 'Promotion duplicated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate promotion',
        variant: 'destructive'
      });
    }
  };

  const openEditDialog = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowDeleteDialog(true);
  };

  const openDetailsDialog = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowDetailsDialog(true);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Promotions & Discounts</h2>
          <p className="text-[#A0A0A0]">Create and manage discount codes for your customers</p>
        </div>
        
        <Button onClick={() => setShowCreateDialog(true)} variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Promotion
        </Button>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1A1D23] border border-[#2A2D36] rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{stats.total_promotions}</div>
            <div className="text-sm text-[#A0A0A0]">Total Promotions</div>
          </div>
          <div className="bg-[#1A1D23] border border-[#2A2D36] rounded-lg p-4">
            <div className="text-2xl font-bold text-[#00D2FF]">{stats.active_promotions}</div>
            <div className="text-sm text-[#A0A0A0]">Active Now</div>
          </div>
          <div className="bg-[#1A1D23] border border-[#2A2D36] rounded-lg p-4">
            <div className="text-2xl font-bold text-[#FF7F00]">{stats.total_uses}</div>
            <div className="text-sm text-[#A0A0A0]">Times Used</div>
          </div>
          <div className="bg-[#1A1D23] border border-[#2A2D36] rounded-lg p-4">
            <div className="text-2xl font-bold text-[#22C55E]">
              ${stats.total_discount_amount.toFixed(2)}
            </div>
            <div className="text-sm text-[#A0A0A0]">Total Discounts</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#1A1D23] border border-[#2A2D36] rounded-lg p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-white font-medium">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {Object.keys(filters).length} active
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A0A0A0]" />
            <Input
              placeholder="Search codes, names..."
              className="pl-10 bg-[#151821] border-[#2A2D36] text-white"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ search: e.target.value || undefined })}
            />
          </div>

          {/* Type Filter */}
          <select
            className="flex h-10 w-full rounded-md border border-[#2A2D36] bg-[#151821] px-3 py-2 text-sm text-white"
            value={filters.type || ''}
            onChange={(e) => handleFilterChange({ type: e.target.value as PromotionType || undefined })}
          >
            <option value="">All Types</option>
            <option value="PERCENTAGE">Percentage Off</option>
            <option value="FIXED_AMOUNT">Fixed Amount</option>
            <option value="FREE_SHIPPING">Free Shipping</option>
            <option value="BOGO">Buy One Get One</option>
            <option value="TIERED">Tiered Discount</option>
          </select>

          {/* Status Filter */}
          <select
            className="flex h-10 w-full rounded-md border border-[#2A2D36] bg-[#151821] px-3 py-2 text-sm text-white"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange({ status: e.target.value as any || undefined })}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="mt-4">
            <Button variant="outline-secondary" onClick={clearFilters} size="sm">
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Promotions List */}
      <div className="bg-[#1A1D23] border border-[#2A2D36] rounded-lg">
        {error && (
          <div className="p-8 text-center text-red-400">
            Error loading promotions: {error.message}
          </div>
        )}
        
        {isLoading && (
          <div className="p-8 text-center text-[#A0A0A0]">
            Loading promotions...
          </div>
        )}

        {promotionsData && promotionsData.data.length === 0 && (
          <div className="p-8 text-center">
            <div className="mb-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-[#2A2D36] flex items-center justify-center">
                <Plus className="h-6 w-6 text-[#A0A0A0]" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No promotions found</h3>
            <p className="text-[#A0A0A0] mb-6">
              {hasActiveFilters 
                ? 'No promotions match your current filters.'
                : 'Create your first promotion to start offering discounts.'
              }
            </p>
            {!hasActiveFilters && (
              <Button onClick={() => setShowCreateDialog(true)} variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Promotion
              </Button>
            )}
          </div>
        )}

        {promotionsData && promotionsData.data.length > 0 && (
          <div className="overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[120px]" />
                <col className="w-[280px]" />
                <col className="w-[60px]" />
                <col className="w-[120px]" />
                <col className="w-[100px]" />
                <col className="w-[130px]" />
                <col className="w-[120px]" />
                <col className="w-[180px]" />
              </colgroup>
              <thead className="border-b border-[#2A2D36]">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Code</th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Name & Description</th>
                  <th className="text-center p-4 text-sm font-medium text-[#A0A0A0]">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Value</th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Usage</th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Expires</th>
                  <th className="text-center p-4 text-sm font-medium text-[#A0A0A0]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotionsData.data.map((promotion) => (
                  <tr key={promotion.id} className="border-b border-[#2A2D36] hover:bg-[#151821]">
                    <td className="p-4">
                      <div className="font-mono font-semibold text-white text-sm">
                        {promotion.code}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-white text-sm">{promotion.name}</div>
                        {promotion.description && (
                          <div className="text-xs text-[#A0A0A0] mt-1">
                            {promotion.description.length > 40
                              ? `${promotion.description.substring(0, 40)}...`
                              : promotion.description
                            }
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      {getPromotionTypeBadge(promotion.type)}
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-white text-sm">
                        {formatDiscountValue(promotion)}
                      </div>
                      {promotion.min_order_amount > 0 && (
                        <div className="text-xs text-[#A0A0A0]">
                          Min: ${promotion.min_order_amount.toFixed(2)}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="text-sm text-white">
                        <div className="font-medium">
                          {promotion.current_uses}
                          {promotion.max_uses ? ` / ${promotion.max_uses}` : ''}
                        </div>
                        {promotion.max_uses_per_customer > 1 && (
                          <div className="text-xs text-[#A0A0A0]">
                            {promotion.max_uses_per_customer}/customer
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      {getStatusIndicator(promotion)}
                    </td>

                    <td className="p-4">
                      <div className="text-sm text-white">
                        {promotion.ends_at ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(promotion.ends_at), 'MMM d')}
                          </div>
                        ) : (
                          <span className="text-[#A0A0A0]">No expiry</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsDialog(promotion)}
                          className="h-8 w-8 p-0 text-[#00D2FF] hover:bg-[#00D2FF]/20"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(promotion)}
                          className="h-8 w-8 p-0 text-[#22C55E] hover:bg-[#22C55E]/20"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(promotion)}
                          className="h-8 w-8 p-0 text-[#9B51E0] hover:bg-[#9B51E0]/20"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(promotion)}
                          className="h-8 w-8 p-0 text-[#FF7F00] hover:bg-[#FF7F00]/20"
                          title={promotion.is_active ? "Deactivate" : "Activate"}
                        >
                          {promotion.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(promotion)}
                          className="h-8 w-8 p-0 text-red-400 hover:bg-red-400/20"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Simple pagination */}
            {promotionsData.has_more && (
              <div className="p-4 border-t border-[#2A2D36] flex justify-center">
                <Button
                  variant="outline-secondary"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="border-[#2A2D36] text-[#A0A0A0] hover:text-white"
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreatePromotionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {selectedPromotion && (
        <>
          <EditPromotionDialog
            promotion={selectedPromotion}
            open={showEditDialog}
            onOpenChange={(open) => {
              setShowEditDialog(open);
              if (!open) setSelectedPromotion(null);
            }}
          />

          <DeletePromotionDialog
            promotion={selectedPromotion}
            open={showDeleteDialog}
            onOpenChange={(open) => {
              setShowDeleteDialog(open);
              if (!open) setSelectedPromotion(null);
            }}
          />

          <PromotionDetailsDialog
            promotion={selectedPromotion}
            open={showDetailsDialog}
            onOpenChange={(open) => {
              setShowDetailsDialog(open);
              if (!open) setSelectedPromotion(null);
            }}
          />
        </>
      )}
    </div>
  );
};