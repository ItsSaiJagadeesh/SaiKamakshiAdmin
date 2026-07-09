import React, { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, LayoutGrid, List as ListIcon } from 'lucide-react';
import { useVariants, useCreateVariant, useUpdateVariant, useDeleteVariant } from '@/api/variants';
import { useCollections } from '@/api/collections';
import { useProducts } from '@/api/products';
import { VariantsGrid } from '@/components/admin/variants/VariantsGrid';
import { VariantsTable } from '@/components/admin/variants/VariantsTable';
import { VariantModal } from '@/components/admin/variants/VariantModal';
import { Variant } from '@/types/variant';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from 'react-router-dom';

export default function VariantsPage() {
  const [searchParams] = useSearchParams();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [variantToEdit, setVariantToEdit] = useState<Variant | null>(null);

  const { data: variants = [], isLoading: isLoadingVariants } = useVariants();
  const { data: collections = [] } = useCollections();
  const { data: allProducts = [] } = useProducts();
  
  const createMutation = useCreateVariant();
  const updateMutation = useUpdateVariant();
  const deleteMutation = useDeleteVariant();

  // Filter products dropdown based on selected collection
  const availableProducts = collectionFilter === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.collectionId === collectionFilter);

  const filteredVariants = variants.filter(variant => {
    const searchLower = searchQuery.toLowerCase();
    
    // Search by Variant Name (SKU Prefix), size label, or product name
    const matchesSearch = 
      (variant.name && variant.name.toLowerCase().includes(searchLower)) ||
      variant.skuPrefix.toLowerCase().includes(searchLower) ||
      variant.productName.toLowerCase().includes(searchLower) ||
      (variant.sizes && variant.sizes.some(s => s.label.toLowerCase().includes(searchLower)));

    const matchesCollection = collectionFilter === 'all' || variant.collectionId === collectionFilter;
    const matchesProduct = productFilter === 'all' || variant.productId === productFilter;
    
    return matchesSearch && matchesCollection && matchesProduct;
  });

  const handleAddVariant = () => {
    setVariantToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditVariant = (variant: Variant) => {
    setVariantToEdit(variant);
    setIsModalOpen(true);
  };

  const handleDeleteVariant = (id: string) => {
    if (window.confirm("Are you sure you want to delete this variant?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (variant: Variant) => {
    if (variant.id) {
      updateMutation.mutate({
        id: variant.id,
        status: variant.status === 'active' ? 'inactive' : 'active'
      });
    }
  };

  const handleSubmit = (data: any) => {
    if (variantToEdit && variantToEdit.id) {
      updateMutation.mutate(
        { id: variantToEdit.id, ...data },
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  return (
    <div className="animate-fade-in pb-12">
      <AdminHeader 
        title="Variants" 
        description={undefined}
      />
      
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">Product Variants</h2>
            <p className="text-muted-foreground text-sm">Manage SKUs, sizes, pricing and stock</p>
          </div>
          <Button onClick={handleAddVariant} className="gap-2 shrink-0 bg-[#b98d4d] hover:bg-[#a67d43] text-white">
            <Plus className="h-4 w-4" />
            Add Variant
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by SKU / size / product / variant name" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border h-10 focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
            <Select 
              value={collectionFilter} 
              onValueChange={(val) => {
                setCollectionFilter(val);
                setProductFilter('all'); // Reset product filter when collection changes
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px] h-10 bg-card border-border focus:ring-primary focus:border-primary">
                <SelectValue placeholder="All Collections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collections</SelectItem>
                {collections.map(c => (
                  <SelectItem key={c.id} value={c.id || ''}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-10 bg-card border-border focus:ring-primary focus:border-primary">
                <SelectValue  placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {availableProducts.map(p => (
                  <SelectItem key={p.id} value={p.id || ''}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="h-[42px] flex border border-border rounded-lg overflow-hidden">
              <Button 
                                      variant='ghost'
                                      size="icon"
                                      onClick={() => setViewMode('grid')}
                                      className={`h-10 w-10 rounded-none ${viewMode==="grid"?"bg-muted":"bg-transparent"}`}
                                    >
                                      <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                                      variant='ghost'
                                      size="icon"
                                      onClick={() => setViewMode('list')}
                                      className={`h-10 w-10 rounded-none ${viewMode==="list"?"bg-muted":"bg-transparent"}`}
                                    >
                                      <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {!isLoadingVariants && filteredVariants.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center mt-6">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No variants found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              {searchQuery || collectionFilter !== 'all' || productFilter !== 'all'
                ? "We couldn't find any variants matching your filters. Try adjusting them."
                : "Get started by creating your first product variant."}
            </p>
            {(!searchQuery && collectionFilter === 'all' && productFilter === 'all') && (
              <Button onClick={handleAddVariant} className="mt-6 bg-[#b98d4d] hover:bg-[#a67d43] text-white">
                Create new variant
              </Button>
            )}
          </div>
        ) : (
          viewMode === 'grid' ? (
            <VariantsGrid 
              variants={filteredVariants} 
              isLoading={isLoadingVariants} 
              onEdit={handleEditVariant}
              onDelete={handleDeleteVariant}
              onToggleStatus={handleToggleStatus}
            />
          ) : (
            <VariantsTable 
              variants={filteredVariants} 
              isLoading={isLoadingVariants} 
              onEdit={handleEditVariant}
              onDelete={handleDeleteVariant}
              onToggleStatus={handleToggleStatus}
            />
          )
        )}
      </div>

      <VariantModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        variantToEdit={variantToEdit}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
