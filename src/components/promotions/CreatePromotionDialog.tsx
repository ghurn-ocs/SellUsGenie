/**
 * Create Promotion Dialog Component
 * Comprehensive form for creating new promotions with all options
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Percent, DollarSign, Truck, Gift, Target } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Switch } from '../ui/Switch';
import { Badge } from '../ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/Form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/Tabs';
import { Calendar } from '../ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { useCreatePromotion, useGeneratePromotionCode } from '../../hooks/usePromotions';
import { useToast } from '../../hooks/useToast';
import type { PromotionType, CreatePromotionRequest } from '../../types/promotions';

const promotionSchema = z.object({
  code: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(50, 'Code must be less than 50 characters')
    .regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BOGO', 'TIERED']),
  value: z.number().positive('Value must be positive').optional(),
  min_order_amount: z.number().min(0, 'Minimum order amount cannot be negative'),
  max_discount_amount: z.number().positive('Maximum discount amount must be positive').optional(),
  max_uses: z.number().int().positive('Max uses must be a positive integer').optional(),
  max_uses_per_customer: z.number().int().positive('Max uses per customer must be a positive integer'),
  first_order_only: z.boolean(),
  starts_at: z.date({ required_error: 'Start date is required' }),
  ends_at: z.date().optional(),
  priority: z.number().int().min(1, 'Priority must be at least 1').max(1000, 'Priority cannot exceed 1000'),
  stackable: z.boolean(),
  exclusive: z.boolean(),
  is_active: z.boolean()
}).refine((data) => {
  const needsValue = ['PERCENTAGE', 'FIXED_AMOUNT', 'TIERED'].includes(data.type);
  return !needsValue || (data.value !== undefined && data.value > 0);
}, {
  message: 'Value is required for this promotion type',
  path: ['value']
}).refine((data) => {
  if (data.ends_at && data.starts_at) {
    return data.ends_at > data.starts_at;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['ends_at']
});

type FormData = z.infer<typeof promotionSchema>;

interface CreatePromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROMOTION_TYPES = [
  { 
    value: 'PERCENTAGE' as PromotionType, 
    label: 'Percentage Off', 
    icon: Percent,
    description: 'Discount by percentage (e.g., 20% off)'
  },
  { 
    value: 'FIXED_AMOUNT' as PromotionType, 
    label: 'Fixed Amount', 
    icon: DollarSign,
    description: 'Discount by fixed dollar amount (e.g., $10 off)'
  },
  { 
    value: 'FREE_SHIPPING' as PromotionType, 
    label: 'Free Shipping', 
    icon: Truck,
    description: 'Free shipping on eligible orders'
  },
  { 
    value: 'BOGO' as PromotionType, 
    label: 'Buy One Get One', 
    icon: Gift,
    description: 'Buy one get one deals and variations'
  },
  { 
    value: 'TIERED' as PromotionType, 
    label: 'Tiered Discount', 
    icon: Target,
    description: 'Different discounts based on order amount'
  }
];

export const CreatePromotionDialog: React.FC<CreatePromotionDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [selectedType, setSelectedType] = useState<PromotionType>('PERCENTAGE');
  const [activeTab, setActiveTab] = useState('basic');
  
  const createPromotion = useCreatePromotion();
  const generateCode = useGeneratePromotionCode();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: undefined,
      min_order_amount: 0,
      max_discount_amount: undefined,
      max_uses: undefined,
      max_uses_per_customer: 1,
      first_order_only: false,
      starts_at: new Date(),
      ends_at: undefined,
      priority: 100,
      stackable: false,
      exclusive: false,
      is_active: true
    }
  });

  const watchedType = form.watch('type');
  const needsValue = ['PERCENTAGE', 'FIXED_AMOUNT', 'TIERED'].includes(watchedType);

  const handleGenerateCode = async () => {
    try {
      const code = await generateCode.mutateAsync({ length: 8 });
      form.setValue('code', code);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate code',
        variant: 'destructive'
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const request: CreatePromotionRequest = {
        ...data,
        starts_at: data.starts_at.toISOString(),
        ends_at: data.ends_at?.toISOString()
      };

      await createPromotion.mutateAsync(request);
      
      toast({
        title: 'Success',
        description: 'Promotion created successfully',
      });
      
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create promotion',
        variant: 'destructive'
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setActiveTab('basic');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Promotion</DialogTitle>
          <DialogDescription>
            Set up a new discount code or promotional offer for your customers
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="rules">Discount Rules</TabsTrigger>
                <TabsTrigger value="limits">Usage Limits</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Code *</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="SAVE20"
                              className="font-mono uppercase"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleGenerateCode}
                            disabled={generateCode.isPending}
                          >
                            Generate
                          </Button>
                        </div>
                        <FormDescription>
                          Unique code customers will use at checkout
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="20% Off Summer Sale" />
                        </FormControl>
                        <FormDescription>
                          Internal name for this promotion
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          placeholder="Optional description of this promotion"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Promotion Type Selection */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Type *</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {PROMOTION_TYPES.map((type) => (
                            <div
                              key={type.value}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                field.value === type.value
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                              style={{
                                borderColor: field.value === type.value ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                                backgroundColor: field.value === type.value ? 'var(--color-primary-light)' : 'transparent'
                              }}
                              onClick={() => field.onChange(type.value)}
                            >
                              <div className="flex items-start gap-3">
                                <type.icon 
                                  className="h-5 w-5 mt-0.5" 
                                  style={{ color: 'var(--color-primary)' }}
                                />
                                <div>
                                  <div 
                                    className="font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                  >
                                    {type.label}
                                  </div>
                                  <div 
                                    className="text-sm"
                                    style={{ color: 'var(--text-secondary)' }}
                                  >
                                    {type.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Discount Rules Tab */}
              <TabsContent value="rules" className="space-y-6">
                {needsValue && (
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Discount Value *
                          {watchedType === 'PERCENTAGE' && ' (%)'}
                          {watchedType === 'FIXED_AMOUNT' && ' ($)'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step={watchedType === 'PERCENTAGE' ? '1' : '0.01'}
                            min="0"
                            max={watchedType === 'PERCENTAGE' ? '100' : undefined}
                            onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          {watchedType === 'PERCENTAGE' && 'Percentage discount (0-100)'}
                          {watchedType === 'FIXED_AMOUNT' && 'Fixed dollar amount off'}
                          {watchedType === 'TIERED' && 'Base discount amount for tiered calculation'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="min_order_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum order total required (0 for no minimum)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedType === 'PERCENTAGE' && (
                    <FormField
                      control={form.control}
                      name="max_discount_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Discount ($)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Cap the maximum discount amount (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="starts_at"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When this promotion becomes active
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ends_at"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>No end date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Leave empty for no expiration
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Usage Limits Tab */}
              <TabsContent value="limits" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="max_uses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Usage Limit</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            placeholder="Unlimited"
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum times this code can be used (leave empty for unlimited)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_uses_per_customer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Uses Per Customer</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            onChange={(e) => field.onChange(e.target.value === '' ? 1 : parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormDescription>
                          How many times each customer can use this code
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="first_order_only"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          First Order Only
                        </FormLabel>
                        <FormDescription>
                          Restrict this promotion to first-time customers only
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          max="1000"
                          onChange={(e) => field.onChange(e.target.value === '' ? 100 : parseInt(e.target.value) || 100)}
                        />
                      </FormControl>
                      <FormDescription>
                        Higher numbers = higher priority when multiple promotions apply (1-1000)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="stackable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Stackable
                          </FormLabel>
                          <FormDescription>
                            Allow this promotion to be used with other promotions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="exclusive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Exclusive
                          </FormLabel>
                          <FormDescription>
                            This promotion cannot be combined with any others
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Active
                          </FormLabel>
                          <FormDescription>
                            Make this promotion active immediately after creation
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPromotion.isPending}>
                {createPromotion.isPending ? 'Creating...' : 'Create Promotion'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};