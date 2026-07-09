import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Variant, VariantSize } from '@/types/variant';
import { useCollections } from '@/api/collections';
import { useProducts } from '@/api/products';
import { toast } from 'sonner';
import { Plus, Trash2, X } from 'lucide-react';

interface VariantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantToEdit?: Variant | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function VariantModal({ open, onOpenChange, variantToEdit, onSubmit, isLoading }: VariantModalProps) {
  const [collectionId, setCollectionId] = useState('');
  const [productId, setProductId] = useState('');
  const [skuPrefix, setSkuPrefix] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<VariantSize[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: collections = [] } = useCollections();
  const { data: allProducts = [] } = useProducts();

  const filteredProducts = allProducts.filter(p => p.collectionId === collectionId);

  useEffect(() => {
    if (variantToEdit) {
      setCollectionId(variantToEdit.collectionId || '');
      setProductId(variantToEdit.productId || '');
      setSkuPrefix(variantToEdit.skuPrefix || '');
      setStatus(variantToEdit.status || 'active');
      setImages(variantToEdit.images || []);
      setSizes(variantToEdit.sizes || []);
    } else {
      setCollectionId('');
      setProductId('');
      setSkuPrefix('');
      setStatus('active');
      setImages([]);
      setSizes([]);
    }
  }, [variantToEdit, open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const uploadPromises = Array.from(files).map(file => 
        uploadToCloudinary(file, 'jewelery/variants')
      );
      const urls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...urls]);
      toast.success('Images uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
      // Reset input value so same files can be selected again if needed
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    setSizes(prev => [
      ...prev,
      {
        sizeId: Date.now().toString(),
        label: '',
        originalPrice: 0,
        discount: 0,
        finalPrice: 0,
        stock: 0
      }
    ]);
  };

  const updateSize = (index: number, field: keyof VariantSize, value: any) => {
    setSizes(prev => {
      const newSizes = [...prev];
      newSizes[index] = { ...newSizes[index], [field]: value };
      
      // Auto-calculate final price if price or discount changes
      if (field === 'originalPrice' || field === 'discount') {
        const originalPrice = Number(newSizes[index].originalPrice) || 0;
        const discount = Number(newSizes[index].discount) || 0;
        newSizes[index].finalPrice = originalPrice - (originalPrice * (discount / 100));
      }
      
      return newSizes;
    });
  };

  const removeSize = (index: number) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionId || !productId || !skuPrefix) {
      toast.error('Please fill in Collection, Product and SKU Prefix');
      return;
    }
    
    const collectionName = collections.find(c => c.id === collectionId)?.name || '';
    const productName = allProducts.find(p => p.id === productId)?.name || '';

    // Validate sizes
    const invalidSize = sizes.find(s => !s.label || s.originalPrice <= 0);
    if (invalidSize) {
      toast.error('All sizes must have a label and a valid price > 0');
      return;
    }

    onSubmit({
      collectionId,
      collectionName,
      productId,
      productName,
      skuPrefix,
      images,
      sizes,
      status,
      // Optional name for searching as per implementation plan
      name: `${productName} - ${skuPrefix}`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {variantToEdit ? 'Edit Variant' : 'Add Variant'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Collection</Label>
            <Select value={collectionId} onValueChange={(val) => { setCollectionId(val); setProductId(''); }} required>
              <SelectTrigger className="w-full focus:ring-primary focus:border-primary">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map(c => (
                  <SelectItem key={c.id} value={c.id || ''}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId} disabled={!collectionId} required>
              <SelectTrigger className="w-full focus:ring-primary focus:border-primary">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.map(p => (
                  <SelectItem key={p.id} value={p.id || ''}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skuPrefix">SKU Prefix</Label>
            <Input 
              id="skuPrefix" 
              value={skuPrefix} 
              onChange={(e) => setSkuPrefix(e.target.value)} 
              placeholder="e.g. RKBN" 
              className="focus-visible:ring-primary focus-visible:border-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Variant Images</Label>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                {images.slice(0, 3).map((url, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden border border-border group">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    
                    {index === 2 && images.length > 3 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-medium text-lg">
                        +{images.length - 3}
                      </div>
                    )}
                    
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {isUploading && (
                  <div className="w-24 h-24 rounded-md bg-muted animate-pulse flex flex-col items-center justify-center border border-border">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <Input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleImageUpload}
                disabled={isUploading}
                className="focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Sizes & Pricing</Label>
              <Button type="button" onClick={addSize} variant="outline" size="sm" className="bg-[#b98d4d] hover:bg-[#a67d43] text-white border-0 gap-1">
                <Plus className="h-4 w-4" /> Add Size
              </Button>
            </div>
            
            {sizes.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-border rounded-md text-muted-foreground text-sm">
                No sizes added yet. Click 'Add Size' to begin.
              </div>
            ) : (
              <div className="space-y-4">
                {sizes.map((size, index) => (
                  <div key={size.sizeId} className="p-4 border border-border rounded-lg bg-card/50 space-y-4 relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-[#b98d4d] bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                        Size #{index + 1}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => removeSize(index)}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <Input 
                        value={size.label} 
                        onChange={(e) => updateSize(index, 'label', e.target.value)} 
                        placeholder="Size (e.g. 2.4, Small, Adjustable)" 
                        className="focus-visible:ring-primary focus-visible:border-primary"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Price</Label>
                        <Input 
                          type="number"
                          min="0"
                          value={size.originalPrice || ''} 
                          onChange={(e) => updateSize(index, 'originalPrice', Number(e.target.value))} 
                          placeholder="0"
                          className="focus-visible:ring-primary focus-visible:border-primary"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Discount %</Label>
                        <Input 
                          type="number"
                          min="0"
                          max="100"
                          value={size.discount || ''} 
                          onChange={(e) => updateSize(index, 'discount', Number(e.target.value))} 
                          placeholder="0"
                          className="focus-visible:ring-primary focus-visible:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Stock</Label>
                        <Input 
                          type="number"
                          min="0"
                          value={size.stock || ''} 
                          onChange={(e) => updateSize(index, 'stock', Number(e.target.value))} 
                          placeholder="0"
                          className="focus-visible:ring-primary focus-visible:border-primary"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <Label>Status</Label>
            <Select value={status} onValueChange={(val: 'active' | 'inactive') => setStatus(val)}>
              <SelectTrigger className="w-full focus:ring-primary focus:border-primary">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading || isUploading} className="w-full sm:w-auto bg-[#b98d4d] hover:bg-[#a67d43] text-white">
              {isLoading ? 'Saving...' : (variantToEdit ? 'Update Variant' : 'Create Variant')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
