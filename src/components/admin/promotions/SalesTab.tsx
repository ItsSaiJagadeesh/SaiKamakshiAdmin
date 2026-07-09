import { useState } from 'react';
import { useSales, useCreateSale, useUpdateSale, useDeleteSale } from '@/api/promotions';
import { Sale } from '@/types/promotions';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Image as ImageIcon, Play, Square } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SalesTab() {
  const { data: sales, isLoading } = useSales();
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();
  const deleteSale = useDeleteSale();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Sale>>({
    name: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    targetType: 'ALL',
    targetIds: [],
    isActive: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.discountValue || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    createSale.mutate(formData as Omit<Sale, 'id'>, {
      onSuccess: () => {
        setIsDialogOpen(false);
      }
    });
  };

  const handleApplySale = async (saleId: string) => {
    try {
      toast.loading('Applying sale discounts...');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/sales/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        // Refresh sales to show active status
        updateSale.mutate({ id: saleId, isActive: true });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to communicate with backend');
    }
  };

  const handleRevertSale = async (saleId: string) => {
    try {
      toast.loading('Reverting sale discounts...');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/sales/revert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        updateSale.mutate({ id: saleId, isActive: false });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to communicate with backend');
    }
  };

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading sales...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Festival & Flash Sales</h2>
          <p className="text-sm text-muted-foreground">Create sales that globally update prices and feature on the landing page.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Sale</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sale Name</label>
                  <input type="text" className="w-full p-2 rounded-md border bg-background" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g. Diwali Dhamaka" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Type</label>
                  <select className="w-full p-2 rounded-md border bg-background"
                    value={formData.targetType} onChange={e => setFormData({...formData, targetType: e.target.value as any})}>
                    <option value="ALL">Entire Store</option>
                    <option value="COLLECTIONS">Specific Collections</option>
                    <option value="PRODUCTS">Specific Products</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discount Type</label>
                  <select className="w-full p-2 rounded-md border bg-background"
                    value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value as any})}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discount Value</label>
                  <input type="number" className="w-full p-2 rounded-md border bg-background" 
                    value={formData.discountValue || ''} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} 
                    required min="1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <input type="datetime-local" className="w-full p-2 rounded-md border bg-background" 
                    onChange={e => setFormData({...formData, startDate: new Date(e.target.value)})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <input type="datetime-local" className="w-full p-2 rounded-md border bg-background" 
                    onChange={e => setFormData({...formData, endDate: new Date(e.target.value)})} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Banner Image URL (Desktop)</label>
                <div className="flex gap-2">
                  <input type="text" className="w-full p-2 rounded-md border bg-background" 
                    value={formData.bannerDesktop || ''} onChange={e => setFormData({...formData, bannerDesktop: e.target.value})} 
                    placeholder="https://..." />
                </div>
              </div>

              <Button type="submit" className="w-full">Create Sale Event</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sales?.map((sale) => (
          <div key={sale.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            {sale.bannerDesktop ? (
              <img src={sale.bannerDesktop} alt={sale.name} className="w-full h-32 object-cover border-b border-border" />
            ) : (
              <div className="w-full h-32 bg-muted flex items-center justify-center border-b border-border text-muted-foreground">
                <ImageIcon className="h-8 w-8 opacity-50" />
              </div>
            )}
            <div className="p-5 flex-1 space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{sale.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${sale.isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {sale.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {sale.discountType === 'PERCENTAGE' ? `${sale.discountValue}% OFF` : `₹${sale.discountValue} OFF`} • {sale.targetType}
                </p>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Starts: {sale.startDate?.toDate ? format(sale.startDate.toDate(), 'PP p') : 'No Date'}</p>
                <p>Ends: {sale.endDate?.toDate ? format(sale.endDate.toDate(), 'PP p') : 'No Date'}</p>
              </div>
            </div>

            <div className="p-4 bg-muted/30 border-t border-border flex justify-between gap-2">
              {sale.isActive ? (
                <Button variant="destructive" className="flex-1 gap-2" onClick={() => handleRevertSale(sale.id!)}>
                  <Square className="w-4 h-4" /> End Sale
                </Button>
              ) : (
                <Button variant="default" className="flex-1 gap-2 bg-success hover:bg-success/90 text-white" onClick={() => handleApplySale(sale.id!)}>
                  <Play className="w-4 h-4" /> Start Sale
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={() => deleteSale.mutate(sale.id!)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {sales?.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No sales created yet.
          </div>
        )}
      </div>
    </div>
  );
}
