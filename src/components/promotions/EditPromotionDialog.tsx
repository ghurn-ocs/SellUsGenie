/**
 * Edit Promotion Dialog Component
 * Similar to CreatePromotionDialog but pre-populated with existing data
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { useUpdatePromotion } from '../../hooks/usePromotions';
import { useToast } from '../../hooks/useToast';
import type { Promotion, UpdatePromotionRequest } from '../../types/promotions';

const updatePromotionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  description: z.string().optional(),
  is_active: z.boolean().default(true)
});

type FormData = z.infer<typeof updatePromotionSchema>;

interface EditPromotionDialogProps {
  promotion: Promotion;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPromotionDialog: React.FC<EditPromotionDialogProps> = ({
  promotion,
  open,
  onOpenChange
}) => {
  const updatePromotion = useUpdatePromotion();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(updatePromotionSchema),
    defaultValues: {
      name: promotion.name,
      description: promotion.description || '',
      is_active: promotion.is_active
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const request: UpdatePromotionRequest = {
        id: promotion.id,
        ...data
      };

      await updatePromotion.mutateAsync(request);
      
      toast({
        title: 'Success',
        description: 'Promotion updated successfully',
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update promotion',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Promotion</DialogTitle>
          <DialogDescription>
            Update the details of {promotion.code}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="20% Off Summer Sale" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="Optional description"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePromotion.isPending}>
                {updatePromotion.isPending ? 'Updating...' : 'Update Promotion'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};