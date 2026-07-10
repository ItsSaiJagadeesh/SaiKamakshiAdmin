import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Product, ProductStatus, ProductSize } from '@/types/product';
import { useCollections } from '@/api/collections';
import { toast } from 'sonner';
import { Plus, Trash2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: Product | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const OCCASIONS_LIST = ['Wedding', 'Festival', 'Daily Wear', 'Party', 'Office', 'Traditional'];

export function ProductModal({ open, onOpenChange, productToEdit, onSubmit, isLoading }: ProductModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [skuPrefix, setSkuPrefix] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [occasions, setOccasions] = useState<string[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [status, setStatus] = useState<ProductStatus>('draft');
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: collections = [] } = useCollections();

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSlug(productToEdit.slug);
      setCollectionId(productToEdit.collectionId || '');
      setDescription(productToEdit.description || '');
      setImages(productToEdit.images || []);
      setSkuPrefix(productToEdit.skuPrefix || '');
      setOriginalPrice(productToEdit.originalPrice || '');
      setDiscount(productToEdit.discount || '');
      setOccasions(productToEdit.occasions || []);
      setSizes(productToEdit.sizes || []);
      setStatus(productToEdit.status || 'draft');
    } else {
      setName('');
      setSlug('');
      setCollectionId('');
      setDescription('');
      setImages([]);
      setSkuPrefix('');
      setOriginalPrice('');
      setDiscount('');
      setOccasions([]);
      setSizes([]);
      setStatus('draft');
    }
  }, [productToEdit, open]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!productToEdit) {
      setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const newUrls = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadToCloudinary(files[i], 'jewelery/products');
        newUrls.push(url);
      }
      setImages(prev => [...prev, ...newUrls]);
      toast.success('Images uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = ''; // reset input
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleOccasionChange = (occasion: string, checked: boolean) => {
    if (checked) {
      setOccasions(prev => [...prev, occasion]);
    } else {
      setOccasions(prev => prev.filter(o => o !== occasion));
    }
  };

  const addSize = () => {
    setSizes(prev => [...prev, { sizeId: uuidv4(), label: '', stock: 0, priceAdjustment: 0 }]);
  };

  const removeSize = (index: number) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: keyof ProductSize, value: any) => {
    setSizes(prev => {
      const newSizes = [...prev];
      newSizes[index] = { ...newSizes[index], [field]: value };
      return newSizes;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !collectionId || originalPrice === '' || !skuPrefix) {
      toast.error('Please fill in all required fields (Name, Slug, Collection, SKU, Base Price)');
      return;
    }
    
    if (sizes.length === 0) {
      toast.error('Please add at least one size/variant');
      return;
    }

    const collectionName = collections.find(c => c.id === collectionId)?.name || '';

    // Calculate dynamic status based on total stock
    const totalStock = sizes.reduce((sum, s) => sum + Number(s.stock), 0);
    let finalStatus = status;
    if (totalStock <= 0) {
      finalStatus = 'out_of_stock';
    } else if (status === 'out_of_stock') {
      // If it was out of stock but now has stock, make it published (or draft based on previous logic, let's default to published if they are saving it)
      finalStatus = 'published';
    }

    onSubmit({
      name,
      slug,
      collectionId,
      collectionName,
      skuPrefix,
      description,
      images,
      originalPrice: Number(originalPrice),
      discount: Number(discount) || 0,
      sizes: sizes.map(s => ({
        ...s,
        stock: Number(s.stock),
        priceAdjustment: Number(s.priceAdjustment) || 0
      })),
      occasions,
      status: finalStatus,
      ...(productToEdit ? {} : { reviewSummary: { rating: 0, count: 0 } })
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {productToEdit ? 'Edit Product' : 'Create Product'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8 mt-4">
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Basic Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" value={name} onChange={handleNameChange} placeholder="e.g. Rose Gold Ring" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Collection *</Label>
                <Select value={collectionId} onValueChange={setCollectionId} required>
                  <SelectTrigger><SelectValue placeholder="Select Collection" /></SelectTrigger>
                  <SelectContent>
                    {collections.map(c => (
                      <SelectItem key={c.id} value={c.id || ''}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skuPrefix">SKU Prefix *</Label>
                <Input id="skuPrefix" value={skuPrefix} onChange={(e) => setSkuPrefix(e.target.value)} placeholder="e.g. RGR-01" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Base Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (₹) *</Label>
                <Input id="originalPrice" type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : '')} required min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (₹)</Label>
                <Input id="discount" type="number" value={discount} onChange={(e) => setDiscount(e.target.value ? Number(e.target.value) : '')} min="0" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Images</h3>
            <div className="flex flex-wrap gap-4">
              {images.slice(0, 4).map((img, idx) => {
                const isFourth = idx === 3;
                const hasMore = images.length > 4;
                const remainingCount = images.length - 4;

                return (
                  <div key={idx} className="relative w-24 h-24 rounded-md border overflow-hidden group">
                    <img src={img} alt={`img-${idx}`} className="w-full h-full object-cover" />
                    
                    {isFourth && hasMore && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-medium text-xl pointer-events-none">
                        +{remainingCount}
                      </div>
                    )}

                    <button 
                      title="Remove Image" 
                      type="button" 
                      onClick={() => removeImage(idx)} 
                      className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              <div 
                className="w-24 h-24 rounded-md border border-dashed flex flex-col items-center justify-center text-muted-foreground relative hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-6 h-6 mb-1" />
                    <span className="text-[10px]">Add Image</span>
                  </>
                )}
                <Input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageUpload} 
                  disabled={isUploading} 
                  className="invisible absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
            </div>
          </div>

          {/* Sizes and Stock */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-lg">Sizes & Stock</h3>
              <Button type="button" variant="outline" size="sm" onClick={addSize}>
                <Plus className="w-4 h-4 mr-1" /> Add Size
              </Button>
            </div>
            
            <div className="space-y-3">
              {sizes.map((size, index) => (
                <div key={size.sizeId} className="flex gap-3 items-end p-3 border rounded-lg bg-muted/20">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs">Size Label</Label>
                    <Input value={size.label} onChange={(e) => updateSize(index, 'label', e.target.value)} placeholder="e.g. 2.4 or Free Size" required />
                  </div>
                  <div className="w-28 space-y-1.5">
                    <Label className="text-xs">Price Adj. (₹)</Label>
                    <Input type="number" value={size.priceAdjustment} onChange={(e) => updateSize(index, 'priceAdjustment', e.target.value)} placeholder="0" />
                  </div>
                  <div className="w-24 space-y-1.5">
                    <Label className="text-xs">Stock</Label>
                    <Input type="number" min="0" value={size.stock} onChange={(e) => updateSize(index, 'stock', e.target.value)} required />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive mb-0.5" onClick={() => removeSize(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {sizes.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                  No sizes added yet. Click "Add Size" to create one.
                </div>
              )}
            </div>
          </div>

          {/* Occasions & Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Other Settings</h3>
            
            <div className="space-y-3">
              <Label>Occasions</Label>
              <div className="flex flex-wrap gap-4">
                {OCCASIONS_LIST.map(occasion => (
                  <div key={occasion} className="flex items-center space-x-2">
                    <Checkbox id={`occasion-${occasion}`} checked={occasions.includes(occasion)} onCheckedChange={(checked) => handleOccasionChange(occasion, checked as boolean)} />
                    <label htmlFor={`occasion-${occasion}`} className="text-sm font-medium cursor-pointer">{occasion}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(val: ProductStatus) => setStatus(val)} disabled={sizes.reduce((sum, s) => sum + Number(s.stock), 0) <= 0}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              {sizes.reduce((sum, s) => sum + Number(s.stock), 0) <= 0 && (
                <p className="text-xs text-destructive mt-1">Status will be automatically set to Out of Stock because total stock is 0.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border mt-6">
            <Button type="submit" disabled={isLoading || isUploading} className="w-full sm:w-auto bg-[#b98d4d] hover:bg-[#a67d43] text-white">
              {isLoading ? 'Saving...' : (productToEdit ? 'Update Product' : 'Create Product')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
