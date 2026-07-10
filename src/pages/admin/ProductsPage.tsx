import React, { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, LayoutGrid, List as ListIcon } from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/api/products';
import { useCollections } from '@/api/collections';
import { ProductsGrid } from '@/components/admin/products/ProductsGrid';
import { ProductsTable } from '@/components/admin/products/ProductsTable';
import { ProductModal } from '@/components/admin/products/ProductModal';
import { ProductDetailsPanel } from '@/components/admin/products/ProductDetailsPanel';
import { Product } from '@/types/product';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToView, setProductToView] = useState<Product | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: collections = [] } = useCollections();
  
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCollection = collectionFilter === 'all' || product.collectionId === collectionFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesCollection && matchesStatus;
  });

  // Handle URL changes to open side panel
  useEffect(() => {
    const productSlug = searchParams.get('product');
    if (productSlug && products.length > 0) {
      const foundProduct = products.find(p => p.slug === productSlug);
      if (foundProduct) {
        setProductToView(foundProduct);
        setIsDetailsOpen(true);
      }
    }
  }, [searchParams, products]);

  // Handle filter changes by resetting page to 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, collectionFilter, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddProduct = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
    setIsDetailsOpen(false); // Close details if open
  };

  const handleRowClick = (product: Product) => {
    setSearchParams({ product: product.slug });
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (product: Product) => {
    if (product.id) {
      updateMutation.mutate({
        id: product.id,
        status: product.status === 'published' ? 'draft' : 'published'
      });
    }
  };

  const handleSubmit = (data: any) => {
    if (productToEdit && productToEdit.id) {
      updateMutation.mutate(
        { id: productToEdit.id, ...data },
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  return (
    <div className="animate-fade-in pb-12">
      <AdminHeader 
        title="Products" 
        description={undefined}
      />
      
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">All Products</h2>
            <p className="text-muted-foreground text-sm">{products.length} products in catalog</p>
          </div>
          <Button onClick={handleAddProduct} className="gap-2 shrink-0 bg-[#b98d4d] hover:bg-[#a67d43] text-white">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border h-10 focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:w-auto">
            <Select value={collectionFilter} onValueChange={setCollectionFilter}>
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] h-10 bg-card border-border focus:ring-primary focus:border-primary">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
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

        {!isLoadingProducts && filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center mt-6">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No products found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              {searchQuery || collectionFilter !== 'all' || statusFilter !== 'all'
                ? "We couldn't find any products matching your filters. Try adjusting them."
                : "Get started by creating your first product."}
            </p>
            {(!searchQuery && collectionFilter === 'all' && statusFilter === 'all') && (
              <Button onClick={handleAddProduct} className="mt-6 bg-[#b98d4d] hover:bg-[#a67d43] text-white">
                Create new product
              </Button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <ProductsGrid 
                products={paginatedProducts} 
                isLoading={isLoadingProducts} 
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onToggleStatus={handleToggleStatus}
                onRowClick={handleRowClick}
              />
            ) : (
              <ProductsTable 
                products={paginatedProducts} 
                isLoading={isLoadingProducts} 
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onToggleStatus={handleToggleStatus}
                onRowClick={handleRowClick}
              />
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="font-bold"
                >
                  &lt;
                </Button>
                <span className="text-sm font-semibold text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="font-bold"
                >
                  &gt;
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <ProductModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        productToEdit={productToEdit}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
      
      {isDetailsOpen && (
        <ProductDetailsPanel 
          product={productToView}
          onClose={() => {
            setIsDetailsOpen(false);
            setProductToView(null);
            setSearchParams({});
          }}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      )}
    </div>
  );
}
