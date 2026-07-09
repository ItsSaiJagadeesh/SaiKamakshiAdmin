import { useState, useEffect } from 'react';
import { usePromoCodes, useCreatePromoCode, useUpdatePromoCode, useDeletePromoCode } from '@/api/promotions';
import { useCollections } from '@/api/collections';
import { useProducts } from '@/api/products';
import { PromoCode } from '@/types/promotions';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Tag, Edit, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';

export default function CouponsTab() {
  const { data: coupons, isLoading } = usePromoCodes();
  const { data: collections } = useCollections();
  const { data: products } = useProducts();

  const createCoupon = useCreatePromoCode();
  const updateCoupon = useUpdatePromoCode();
  const deleteCoupon = useDeletePromoCode();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<PromoCode>>({
    code: '',
    type: 'DISCOUNT',
    value: 0,
    minPrice: 0,
    isActive: true,
    targetType: 'ALL',
    targetIds: []
  });

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'DISCOUNT',
      value: 0,
      minPrice: 0,
      isActive: true,
      targetType: 'ALL',
      targetIds: []
    });
    setEditingId(null);
  };

  const handleEdit = (coupon: PromoCode) => {
    setFormData({
      ...coupon,
      startingDate: coupon.startingDate?.toDate ? coupon.startingDate.toDate() : new Date(),
      endingDate: coupon.endingDate?.toDate ? coupon.endingDate.toDate() : new Date()
    });
    setEditingId(coupon.id || null);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.value || !formData.startingDate || !formData.endingDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingId) {
      updateCoupon.mutate({ id: editingId, ...formData }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    } else {
      createCoupon.mutate(formData as Omit<PromoCode, 'id'>, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    }
  };

  const handleToggleActive = (coupon: PromoCode) => {
    updateCoupon.mutate({ id: coupon.id!, isActive: !coupon.isActive });
  };

  const formatDateForInput = (date: any) => {
    if (!date) return '';
    try {
      const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
      // Format to YYYY-MM-DDThh:mm
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const handleAddTarget = (id: string) => {
    if (!id || formData.targetIds?.includes(id)) return;
    setFormData(prev => ({ ...prev, targetIds: [...(prev.targetIds || []), id] }));
  };

  const handleRemoveTarget = (id: string) => {
    setFormData(prev => ({ ...prev, targetIds: prev.targetIds?.filter(t => t !== id) || [] }));
  };

  const renderTargetSelectors = () => {
    if (formData.targetType === 'ALL') return null;

    const isCollections = formData.targetType === 'COLLECTIONS';
    const items = isCollections ? collections : products;
    const selectedItems = items?.filter(item => formData.targetIds?.includes(item.id!)) || [];

    return (
      <div className="space-y-3 p-3 bg-muted/20 border border-border/50 rounded-lg">
        <label className="text-sm font-medium">Select {isCollections ? 'Collections' : 'Products'}</label>
        
        <div className="flex gap-2">
          <select 
            className="flex-1 p-2 rounded-md border bg-background text-sm"
            onChange={(e) => handleAddTarget(e.target.value)}
            value=""
          >
            <option value="" disabled>-- Select to add --</option>
            {items?.map(item => (
              <option key={item.id} value={item.id} disabled={formData.targetIds?.includes(item.id!)}>
                {item.name || (item as any).title}
              </option>
            ))}
          </select>
        </div>

        {selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedItems.map(item => (
              <div key={item.id} className="bg-primary/10 text-primary px-3 py-1 text-xs rounded-full flex items-center gap-1.5 border border-primary/20">
                <span className="truncate max-w-[150px]">{item.name || (item as any).title}</span>
                <button type="button" onClick={() => handleRemoveTarget(item.id!)} className="hover:text-destructive transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading coupons...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Discount Coupons</h2>
          <p className="text-sm text-muted-foreground">Manage promo codes that customers can apply at checkout.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Coupon Code</label>
                  <input type="text" className="w-full p-2 rounded-md border bg-background uppercase" 
                    value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                    placeholder="e.g. FLAT500" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target</label>
                  <select className="w-full p-2 rounded-md border bg-background"
                    value={formData.targetType} onChange={e => setFormData({
                      ...formData, 
                      targetType: e.target.value as any,
                      targetIds: [] // Reset target ids when type changes
                    })}>
                    <option value="ALL">Entire Store</option>
                    <option value="COLLECTIONS">Specific Collections</option>
                    <option value="PRODUCTS">Specific Products</option>
                  </select>
                </div>
              </div>

              {renderTargetSelectors()}

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discount Type</label>
                  <select className="w-full p-2 rounded-md border bg-background"
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                    <option value="DISCOUNT">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value</label>
                  <input type="number" className="w-full p-2 rounded-md border bg-background" 
                    value={formData.value || ''} onChange={e => setFormData({...formData, value: Number(e.target.value)})} 
                    required min="1" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Cart Value</label>
                  <input type="number" className="w-full p-2 rounded-md border bg-background" 
                    value={formData.minPrice || ''} onChange={e => setFormData({...formData, minPrice: Number(e.target.value)})} 
                    required min="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valid From</label>
                  <input type="datetime-local" className="w-full p-2 rounded-md border bg-background" 
                    value={formatDateForInput(formData.startingDate)}
                    onChange={e => setFormData({...formData, startingDate: new Date(e.target.value)})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valid Until</label>
                  <input type="datetime-local" className="w-full p-2 rounded-md border bg-background" 
                    value={formatDateForInput(formData.endingDate)}
                    onChange={e => setFormData({...formData, endingDate: new Date(e.target.value)})} required />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border mt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">{editingId ? 'Save Changes' : 'Create Coupon'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Discount</th>
              <th className="px-6 py-4">Target</th>
              <th className="px-6 py-4">Min Order</th>
              <th className="px-6 py-4">Validity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons?.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-muted/20">
                <td className="px-6 py-4 font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" /> {coupon.code}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {coupon.type === 'DISCOUNT' ? `${coupon.value}%` : `₹${coupon.value}`}
                </td>
                <td className="px-6 py-4 text-xs">
                  {coupon.targetType === 'ALL' ? 'Entire Store' : 
                   <span className="bg-muted px-2 py-1 rounded-md">{coupon.targetIds?.length || 0} {coupon.targetType === 'COLLECTIONS' ? 'Collections' : 'Products'}</span>}
                </td>
                <td className="px-6 py-4">₹{coupon.minPrice}</td>
                <td className="px-6 py-4 text-muted-foreground text-xs">
                  {coupon.startingDate?.toDate ? format(coupon.startingDate.toDate(), 'MMM d, yyyy') : 'N/A'} - {coupon.endingDate?.toDate ? format(coupon.endingDate.toDate(), 'MMM d, yyyy') : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleToggleActive(coupon)}
                    className={`px-2 py-1 text-xs rounded-full cursor-pointer hover:opacity-80 transition-opacity ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                    <Edit className="w-4 h-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCoupon.mutate(coupon.id!)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {coupons?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  No coupons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
