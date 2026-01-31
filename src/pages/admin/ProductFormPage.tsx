import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { fetchProducts } from '@/data/mockData';
import { 
  BRANDS, 
  CATEGORIES, 
  FINISHES, 
  STOCK_STATUSES, 
  VISIBILITY_OPTIONS,
  type Product
} from '@/types/admin';
import { Link } from 'react-router-dom';

const DEFAULT_PRODUCT: Partial<Product> = {
  brand: 'snigdha-womens-world',
  category: 'anklets',
  name: '',
  sku: '',
  description: '',
  price: 0,
  sizes: [],
  metal: 'Panchaloham',
  finish: 'traditional',
  dailyWear: false,
  handmade: true,
  careInstructions: '',
  stockStatus: 'in-stock',
  visibility: 'draft',
  images: [],
};

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const isEditing = Boolean(id);
  const [products, setProducts] = useState<Product[]>([]);
  const existingProduct = isEditing ? products.find(p => p.id === id) : null;
  
  const [formData, setFormData] = useState<Partial<Product>>(
    existingProduct || DEFAULT_PRODUCT
  );
  const [sizesInput, setSizesInput] = useState(formData.sizes?.join(', ') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      setProducts(data);
    };
    loadProducts();
  }, []);

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Parse sizes from comma-separated input
    const sizes = sizesInput.split(',').map(s => s.trim()).filter(Boolean);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: isEditing ? 'Product updated' : 'Product created',
      description: isEditing 
        ? 'Your changes have been saved successfully.'
        : 'The new product has been added to your catalog.',
    });
    
    setIsSubmitting(false);
    navigate('/admin/products');
  };

  return (
    <div className="animate-fade-in">
      <AdminHeader 
        title={isEditing ? 'Edit Product' : 'Add New Product'} 
        description={isEditing ? `Editing: ${existingProduct?.name}` : 'Create a new product listing'}
        actions={
          <Link to="/admin/products">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        }
      />
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="luxury-card p-6">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Basic Information
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Traditional Panchaloham Anklet"
                    className="mt-1.5 input-luxury"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="sku">SKU / Product Code *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="e.g., SKJ-ANK-001"
                    className="mt-1.5 input-luxury"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="brand">Brand *</Label>
                  <Select 
                    value={formData.brand} 
                    onValueChange={(value) => handleChange('brand', value)}
                  >
                    <SelectTrigger className="mt-1.5 input-luxury">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANDS.map(brand => (
                        <SelectItem key={brand.value} value={brand.value}>
                          {brand.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleChange('category', value)}
                  >
                    <SelectTrigger className="mt-1.5 input-luxury">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe your product..."
                    className="mt-1.5 input-luxury min-h-[120px]"
                    rows={4}
                  />
                </div>
              </div>
            </div>
            
            {/* Pricing & Sizes */}
            <div className="luxury-card p-6">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Pricing & Sizes
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleChange('price', Number(e.target.value))}
                    placeholder="1299"
                    className="mt-1.5 input-luxury"
                    min={0}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="discountPrice">Discount Price (₹)</Label>
                  <Input
                    id="discountPrice"
                    type="number"
                    value={formData.discountPrice || ''}
                    onChange={(e) => handleChange('discountPrice', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="999"
                    className="mt-1.5 input-luxury"
                    min={0}
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                  <Input
                    id="sizes"
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    placeholder="e.g., 10 inches, 10.5 inches, Adjustable"
                    className="mt-1.5 input-luxury"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Enter sizes separated by commas
                  </p>
                </div>
              </div>
            </div>
            
            {/* Product Details */}
            <div className="luxury-card p-6">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Product Details
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="metal">Metal</Label>
                  <Input
                    id="metal"
                    value={formData.metal}
                    onChange={(e) => handleChange('metal', e.target.value)}
                    placeholder="Panchaloham"
                    className="mt-1.5 input-luxury"
                  />
                </div>
                
                <div>
                  <Label htmlFor="finish">Finish</Label>
                  <Select 
                    value={formData.finish} 
                    onValueChange={(value) => handleChange('finish', value)}
                  >
                    <SelectTrigger className="mt-1.5 input-luxury">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FINISHES.map(finish => (
                        <SelectItem key={finish.value} value={finish.value}>
                          {finish.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="sm:col-span-2">
                  <Label htmlFor="careInstructions">Care Instructions</Label>
                  <Textarea
                    id="careInstructions"
                    value={formData.careInstructions}
                    onChange={(e) => handleChange('careInstructions', e.target.value)}
                    placeholder="How to care for this product..."
                    className="mt-1.5 input-luxury"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label htmlFor="dailyWear" className="font-medium">Daily Wear</Label>
                    <p className="text-sm text-muted-foreground">Suitable for everyday use</p>
                  </div>
                  <Switch
                    id="dailyWear"
                    checked={formData.dailyWear}
                    onCheckedChange={(checked) => handleChange('dailyWear', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label htmlFor="handmade" className="font-medium">Handmade</Label>
                    <p className="text-sm text-muted-foreground">Handcrafted by artisans</p>
                  </div>
                  <Switch
                    id="handmade"
                    checked={formData.handmade}
                    onCheckedChange={(checked) => handleChange('handmade', checked)}
                  />
                </div>
              </div>
            </div>
            
            {/* Images */}
            <div className="luxury-card p-6">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Product Images
              </h3>
              
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium mb-1">Upload product images</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    PNG, JPG up to 5MB each
                  </p>
                  <Button type="button" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-3">
                💡 Enable Lovable Cloud to upload and store product images
              </p>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="luxury-card p-6">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Status
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select 
                    value={formData.visibility} 
                    onValueChange={(value) => handleChange('visibility', value)}
                  >
                    <SelectTrigger className="mt-1.5 input-luxury">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIBILITY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="stockStatus">Stock Status</Label>
                  <Select 
                    value={formData.stockStatus} 
                    onValueChange={(value) => handleChange('stockStatus', value)}
                  >
                    <SelectTrigger className="mt-1.5 input-luxury">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STOCK_STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="luxury-card p-6">
              <div className="space-y-3">
                <Button 
                  type="submit" 
                  variant="gold" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/admin/products')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
