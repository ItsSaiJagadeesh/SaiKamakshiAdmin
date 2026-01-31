import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Tags, Package } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { fetchCategories } from '@/data/mockData';
import type { CategoryItem } from '@/types/admin';
import { format } from 'date-fns';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  
  const { toast } = useToast();

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  const handleOpenDialog = (category?: CategoryItem) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingCategory) {
      setCategories(prev => prev.map(c => 
        c.id === editingCategory.id 
          ? { ...c, name: formData.name, description: formData.description }
          : c
      ));
      toast({
        title: 'Category updated',
        description: 'The category has been updated successfully.',
      });
    } else {
      const newCategory: CategoryItem = {
        id: Date.now().toString(),
        slug: formData.name.toLowerCase().replace(/\s+/g, '-') as any,
        name: formData.name,
        description: formData.description,
        productCount: 0,
        createdAt: new Date(),
      };
      setCategories(prev => [...prev, newCategory]);
      toast({
        title: 'Category created',
        description: 'The new category has been added.',
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    toast({
      title: 'Category deleted',
      description: 'The category has been removed.',
    });
  };

  return (
    <div className="animate-fade-in">
      <AdminHeader 
        title="Categories" 
        description="Organize your products into categories"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory 
                    ? 'Update the category details below.'
                    : 'Create a new category for your products.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="categoryName">Category Name *</Label>
                  <Input
                    id="categoryName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Necklaces"
                    className="mt-1.5 input-luxury"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Textarea
                    id="categoryDescription"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this category..."
                    className="mt-1.5 input-luxury"
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="gold" onClick={handleSave} disabled={!formData.name.trim()}>
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      
      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <div 
              key={category.id} 
              className="luxury-card p-6 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tags className="h-6 w-6 text-primary" />
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleOpenDialog(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  {category.productCount} products
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(category.createdAt, 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
