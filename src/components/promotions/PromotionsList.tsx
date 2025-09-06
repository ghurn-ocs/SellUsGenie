/**
 * Promotions List Component
 * Displays promotions in a table format with actions
 */

import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Edit2, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  Percent,
  DollarSign,
  Truck,
  Gift,
  Target,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Pagination } from '../ui/pagination';
import { EditPromotionDialog } from './EditPromotionDialog';
import { DeletePromotionDialog } from './DeletePromotionDialog';
import { PromotionDetailsDialog } from './PromotionDetailsDialog';
import { 
  useTogglePromotionStatus, 
  useDuplicatePromotion 
} from '../../hooks/usePromotions';
import { useToast } from '../../hooks/useToast';
import type { Promotion } from '../../types/promotions';
import { isActivePromotion } from '../../types/promotions';

interface PromotionsListProps {
  promotions: Promotion[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasMore: boolean;
}

const getPromotionTypeSymbol = (type: string) => {
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

const getPromotionTypeBadge = (type: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PERCENTAGE: 'secondary',
    FIXED_AMOUNT: 'default',
    FREE_SHIPPING: 'outline',
    BOGO: 'secondary',
    TIERED: 'default'
  };

  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold">
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
        <span className="text-gray-600 text-sm">Inactive</span>
      </div>
    );
  }

  if (startsAt > now) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
        <span className="text-blue-600 text-sm">Upcoming</span>
      </div>
    );
  }

  if (endsAt && endsAt < now) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-400"></div>
        <span className="text-red-600 text-sm">Expired</span>
      </div>
    );
  }

  if (promotion.max_uses && promotion.current_uses >= promotion.max_uses) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-orange-400"></div>
        <span className="text-orange-600 text-sm">Limit Reached</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-green-400"></div>
      <span className="text-green-600 text-sm">Active</span>
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

export const PromotionsList: React.FC<PromotionsListProps> = ({
  promotions,
  currentPage,
  totalPages,
  onPageChange,
  hasMore
}) => {
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const toggleStatus = useTogglePromotionStatus();
  const duplicatePromotion = useDuplicatePromotion();
  const { toast } = useToast();

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

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Code</TableHead>
              <TableHead className="w-[280px]">Name & Description</TableHead>
              <TableHead className="w-[60px] text-center">Type</TableHead>
              <TableHead className="w-[120px]">Value</TableHead>
              <TableHead className="w-[100px]">Usage</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="w-[120px]">Valid Until</TableHead>
              <TableHead className="w-[160px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promotion) => (
              <TableRow key={promotion.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="font-mono font-semibold text-sm">
                    {promotion.code}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">{promotion.name}</div>
                    {promotion.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {promotion.description.length > 40
                          ? `${promotion.description.substring(0, 40)}...`
                          : promotion.description
                        }
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  {getPromotionTypeBadge(promotion.type)}
                </TableCell>

                <TableCell>
                  <div className="font-medium text-sm">
                    {formatDiscountValue(promotion)}
                  </div>
                  {promotion.min_order_amount > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Min: ${promotion.min_order_amount.toFixed(2)}
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">
                      {promotion.current_uses}
                      {promotion.max_uses ? ` / ${promotion.max_uses}` : ''}
                    </div>
                    {promotion.max_uses_per_customer > 1 && (
                      <div className="text-xs text-muted-foreground">
                        {promotion.max_uses_per_customer}/customer
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {getStatusIndicator(promotion)}
                </TableCell>

                <TableCell>
                  <div className="text-sm">
                    {promotion.ends_at ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(promotion.ends_at), 'MMM d')}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No expiry</span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetailsDialog(promotion)}
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(promotion)}
                      className="h-8 w-8 p-0 hover:bg-green-100"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4 text-green-600" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(promotion)}
                      className="h-8 w-8 p-0 hover:bg-purple-100"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4 text-purple-600" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(promotion)}
                      className="h-8 w-8 p-0 hover:bg-orange-100"
                      title={promotion.is_active ? "Deactivate" : "Activate"}
                    >
                      {promotion.is_active ? (
                        <EyeOff className="h-4 w-4 text-orange-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-orange-600" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(promotion)}
                      className="h-8 w-8 p-0 hover:bg-red-100"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          hasMore={hasMore}
        />
      )}

      {/* Dialogs */}
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