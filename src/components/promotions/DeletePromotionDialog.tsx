/**
 * Delete Promotion Dialog Component
 * Confirmation dialog for deleting promotions
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useDeletePromotion } from '../../hooks/usePromotions';
import { useToast } from '../../hooks/useToast';
import type { Promotion } from '../../types/promotions';

interface DeletePromotionDialogProps {
  promotion: Promotion;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeletePromotionDialog: React.FC<DeletePromotionDialogProps> = ({
  promotion,
  open,
  onOpenChange
}) => {
  const deletePromotion = useDeletePromotion();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deletePromotion.mutateAsync(promotion.id);
      
      toast({
        title: 'Success',
        description: 'Promotion deleted successfully',
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete promotion',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Promotion
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the promotion code "{promotion.code}".
          </DialogDescription>
        </DialogHeader>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 my-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This promotion has been used {promotion.current_uses} times. 
                  Deleting it will not affect past orders, but customers will no longer 
                  be able to use this code.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={deletePromotion.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleDelete}
            disabled={deletePromotion.isPending}
          >
            {deletePromotion.isPending ? 'Deleting...' : 'Delete Promotion'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};