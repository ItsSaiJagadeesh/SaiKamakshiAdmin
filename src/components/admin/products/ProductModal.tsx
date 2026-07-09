import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Product, ProductStatus } from '@/types/product';
import { useCollections } from '@/api/collections';
import { toast } from 'sonner';

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
  const [thumbnail, setThumbnail] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [occasions, setOccasions] = useState<string[]>([]);
  const [status, setStatus] = useState<ProductStatus>('draft');
  const [isUploading, setIsUploading] = useState(false);

  const { data: collections = [] } = useCollections();

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSlug(productToEdit.slug);
      setCollectionId(productToEdit.collectionId || '');
      setDescription(productToEdit.description || '');
      setThumbnail(productToEdit.thumbnail || '');
      setMinPrice(productToEdit.priceRange?.min || '');
      setMaxPrice(productToEdit.priceRange?.max || '');
      setOccasions(productToEdit.occasions || []);
      setStatus(productToEdit.status || 'draft');
    } else {
      setName('');
      setSlug('');
      setCollectionId('');
      setDescription('');
      setThumbnail('');
      setMinPrice('');
      setMaxPrice('');
      setOccasions([]);
      setStatus('draft');
    }
  }, [productToEdit, open]);

  // Auto-generate slug from name if empty
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!productToEdit) {
      setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadToCloudinary(file, 'jewelery/products');
      setThumbnail(url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOccasionChange = (occasion: string, checked: boolean) => {
    if (checked) {
      setOccasions(prev => [...prev, occasion]);
    } else {
      setOccasions(prev => prev.filter(o => o !== occasion));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !collectionId || minPrice === '' || maxPrice === '') {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const collectionName = collections.find(c => c.id === collectionId)?.name || '';

    onSubmit({
      name,
      slug,
      collectionId,
      collectionName,
      description,
      thumbnail,
      priceRange: {
        min: Number(minPrice),
        max: Number(maxPrice),
      },
      occasions,
      status,
      // Only set these on create, update handles it by spreading existing
      ...(productToEdit ? {} : { variantCount: 0, reviewSummary: { rating: 0, count: 0 } })
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {productToEdit ? 'Edit Product' : 'Create Product'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={handleNameChange} 
              placeholder="e.g. Rose Gold Engagement Ring" 
              className="focus-visible:ring-primary focus-visible:border-primary"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input 
              id="slug" 
              value={slug} 
              onChange={(e) => setSlug(e.target.value)} 
              placeholder="e.g. rose-gold-engagement-ring" 
              className="focus-visible:ring-primary focus-visible:border-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Collection Name</Label>
            <Select value={collectionId} onValueChange={setCollectionId} required>
              <SelectTrigger className="w-full focus:ring-primary focus:border-primary">
                <SelectValue placeholder="Select Collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map(c => (
                  <SelectItem key={c.id} value={c.id || ''}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Elegant rose gold engagement ring..." 
              className="focus-visible:ring-primary focus-visible:border-primary"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Thumbnail Image</Label>
            <div className="flex flex-col gap-3">
              {isUploading ? (
                <div className="w-32 h-32 rounded-md bg-muted animate-pulse flex flex-col items-center justify-center border border-border">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                </div>
              ) : thumbnail ? (
                <div className="relative w-32 h-32 rounded-md overflow-hidden border border-border">
                  <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </div>
              ) : null}
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                disabled={isUploading}
                className="focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min Price (₹)</Label>
              <Input 
                id="minPrice" 
                type="number"
                value={minPrice} 
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')} 
                placeholder="0"
                min="0"
                className="focus-visible:ring-primary focus-visible:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price (₹)</Label>
              <Input 
                id="maxPrice" 
                type="number"
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')} 
                placeholder="0"
                min="0"
                className="focus-visible:ring-primary focus-visible:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Occasions</Label>
            <div className="grid grid-cols-2 gap-3">
              {OCCASIONS_LIST.map(occasion => (
                <div key={occasion} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`occasion-${occasion}`} 
                    checked={occasions.includes(occasion)}
                    onCheckedChange={(checked) => handleOccasionChange(occasion, checked as boolean)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary"
                  />
                  <label 
                    htmlFor={`occasion-${occasion}`} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {occasion}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(val: ProductStatus) => setStatus(val)}>
              <SelectTrigger className="w-[180px] focus:ring-primary focus:border-primary">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
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
