 import { useEffect, useState } from 'react';
 import { motion } from 'framer-motion';
 import { Plus, Search, Edit, Trash2, Star, MoreHorizontal, Filter, Grid, List } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Badge } from '@/components/ui/badge';
 import type { Product } from '@/types/product';

 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { cn } from '@/lib/utils';
import { Dialog, DialogTrigger, DialogHeader, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ProductForm } from '@/components/products/ProductForm';
import { toast } from '@/hooks/use-toast';
import { createProduct, deleteProduct, fetchProducts, updateProduct } from '@/services/products.service';
import { ProductFormValues } from '@/lib/validations/product';
import { Collection } from '@/types/collection';
import { fetchCollections } from '@/services/collections.service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 
 export default function Products() {
   const [loading,setLoading] = useState(false);
   const [products, setProducts] = useState<Product[]>([]);
   const [searchQuery, setSearchQuery] = useState('');
   const [statusFilter, setStatusFilter] = useState<string>('all');
   const [collections,setCollections] = useState<Collection[]>([]);
   const [collectionFilter, setCollectionFilter] = useState<string>('all');
   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
 
   const filteredProducts = products.filter((product) => {
     const matchesSearch =
       product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       product.slug.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
     const matchesCollection =
       collectionFilter === 'all' || product.collectionId === collectionFilter;
     return matchesSearch && matchesStatus && matchesCollection;
   });
 
   const formatPrice = (amount: number) => {
     return new Intl.NumberFormat('en-IN', {
       style: 'currency',
       currency: 'INR',
       maximumFractionDigits: 0,
     }).format(amount);
   };

   useEffect(() => {
      const load = async () => {
      try {
        setLoading(true);
        const product_data = await fetchProducts();
        setProducts(product_data);
        const collection_data = await fetchCollections();
        setCollections(collection_data);
      } catch {
        toast({ title: 'Failed to load products', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
      };
      load();
    }, []);


const handleSubmitProduct = async (data: ProductFormValues) => {
  try {
    // 🔍 Find collection by collectionName (NOT product name)
    const collection = collections.find(
      (c) => c.name === data.collectionName
    );

    if (!collection) {
      toast({
        title: 'Invalid collection',
        description: 'Selected collection not found',
        variant: 'destructive',
      });
      return;
    }

    /* ================= CREATE MODE ================= */
    if (!editingProduct) {
      const productPayload = {
        ...data,

        collectionId: collection.id,
      };

      await createProduct(productPayload);

      toast({ title: 'Product created successfully' });
    }

    /* ================= UPDATE MODE (OPTIONAL) ================= */
    else {
      const updatePayload = {
        ...data,
        collectionId: collection.id,
      };

      await updateProduct(editingProduct.id, updatePayload);

      toast({ title: 'Product updated successfully' });
    }

    //Refresh list
    setProducts(await fetchProducts());

    // Reset UI state
    setDialogOpen(false);
    setEditingProduct(null);
  } catch (error) {
    toast({
      title: editingProduct ? 'Update failed' : 'Create failed',
      description: 'Something went wrong. Please try again.',
      variant: 'destructive',
    });
  }
};




  const handleUpdateStatus = async (product:Product) => {

    const isPublished = product.status=="draft"?"published":"draft";

    try {
      await updateProduct(product.id, {...product,status:isPublished});
      setProducts(await fetchProducts());
      toast({ title: 'Product updated' });
      setEditingProduct(null);
      setDialogOpen(false);
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm('Delete this product?')) return;


    try {
      await deleteProduct(product.id, product.collectionId);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast({ title: 'Product deleted' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
    };


  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

    
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h2 className="text-lg font-semibold text-foreground">All Products</h2>
           <p className="text-sm text-muted-foreground">
             {filteredProducts.length} products in catalog
           </p>
         </div>
         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Create Product'}</DialogTitle>
              </DialogHeader>
              <ProductForm collections={collections} editingProduct={editingProduct}  onSubmitProduct={handleSubmitProduct} />
            </DialogContent>
          </Dialog>
         
       </div>
 
       {/* Filters */}
       <div className="flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1 max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder="Search products..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-10"
           />
         </div>
         <div className="flex gap-3">
           <Select value={collectionFilter} onValueChange={setCollectionFilter}>
             <SelectTrigger className="w-[240px]">
               <SelectValue placeholder="All Collections" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Collections</SelectItem>
               {collections.map((col) => (
                 <SelectItem key={col.id} value={col.id}>
                   {col.name}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
           <Select value={statusFilter} onValueChange={setStatusFilter}>
             <SelectTrigger className="w-[140px]">
               <SelectValue placeholder="All Status" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Status</SelectItem>
               <SelectItem value="published">Published</SelectItem>
               <SelectItem value="draft">Draft</SelectItem>
             </SelectContent>
           </Select>
           <div className="flex border border-border rounded-lg overflow-hidden">
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setViewMode('grid')}
               className={cn(
                 'rounded-none',
                 viewMode === 'grid' && 'bg-muted'
               )}
             >
               <Grid className="h-4 w-4" />
             </Button>
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setViewMode('list')}
               className={cn(
                 'rounded-none',
                 viewMode === 'list' && 'bg-muted'
               )}
             >
               <List className="h-4 w-4" />
             </Button>
           </div>
           
         </div>
       </div>
 
       {/* Product Grid */}
       {viewMode === 'grid' ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {loading && Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card overflow-hidden animate-pulse"
            >
              {/* Image skeleton */}
              <div className="h-40 w-full bg-muted" />

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />

                <div className="h-3 w-2/3 bg-muted rounded" />

                <div className="flex justify-between pt-3">
                  <div className="h-8 w-20 bg-muted rounded-md" />
                  <div className="h-8 w-8 bg-muted rounded-md" />
                </div>
              </div>
            </div>
            ))}
            {
              !loading && filteredProducts.length==0 && (
                <div className='border border-border col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 bg-muted/50 px-6 py-8 rounded-xl'>
                  <div className=''>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">
                        No Products found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search or create a new Product
                      </p>
                    </div>
                  </div>
                </div>
              )
            }
           {filteredProducts.map((product, index) => (
             <motion.div
               key={product.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05 }}
               className="group rounded-xl border border-border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow"
             >
               <div className="relative h-72 overflow-hidden bg-muted">
                 <img
                   src={product.thumbnail}
                   alt={product.name}
                   className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                 />
                 <div className="absolute top-3 right-3">
                   <Badge
                     variant="secondary"
                     className={cn(
                       product.status === 'published'
                         ? 'bg-success/90 text-white'
                         : 'bg-warning/90 text-white'
                     )}
                   >
                     {product.status}
                   </Badge>
                 </div>
               </div>
               <div className="p-4">
                 <p className="text-xs text-primary font-medium mb-1">
                   {product.collectionName}
                 </p>
                 <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                   {product.name}
                 </h3>
                 <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                   {product.description}
                 </p>
                 <div className="flex items-center justify-between">
                   <p className="font-semibold text-foreground">
                     {formatPrice(product.priceRange.min)} - {formatPrice(product.priceRange.max)}
                   </p>
                   <div className="flex items-center gap-1">
                     <Star className="h-4 w-4 fill-primary text-primary" />
                     <span className="text-sm font-medium">{product.reviewSummary.rating}</span>
                   </div>
                 </div>
                 <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                   <span className="text-xs text-muted-foreground">
                     {product.variantCount} variants
                   </span>
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8">
                         <MoreHorizontal className="h-4 w-4" />
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={()=>{openEdit(product)}}>
                         <Edit className="h-4 w-4 mr-2" />
                         Edit Product
                       </DropdownMenuItem>
                      <DropdownMenuItem onClick={()=>{handleUpdateStatus(product)}}>{product.status=="draft"?"Publish":"Draft"}</DropdownMenuItem>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem onClick={()=>handleDelete(product)} className="text-destructive">
                         <Trash2 className="h-4 w-4 mr-2" />
                         Delete
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                 </div>
               </div>
             </motion.div>
           ))}
         </div>
       ) : (
         <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
           <Table className="w-full">
             <TableHeader className="bg-muted/50">
               <TableRow>
                 <TableHead className="px-4 py-3 text-left text-sm font-semibold text-foreground">Product</TableHead>
                 <TableHead className="px-4 py-3 text-left text-sm font-semibold text-foreground">Collection</TableHead>
                 <TableHead className="px-4 py-3 text-left text-sm font-semibold text-foreground">Price Range</TableHead>
                 <TableHead className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</TableHead>
                 <TableHead className="px-4 py-3 text-left text-sm font-semibold text-foreground">Rating</TableHead>
                 <TableHead className="px-4 py-3 text-left text-sm font-semibold text-foreground">Action</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody className="divide-y divide-border">
              {
              loading && (
                [1,2,3,4,5,6].map(()=>{
                  return(
                    <TableRow className='pointer-events-none'>
                      {[1,2,3,4,5].map((
                        _,i
                      )=>{
                        return(
                          <TableCell key={i} className='p-4 animate-pulse '>
                            <div className='w-full h-6 bg-border/50 rounded-md'></div>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })
              )
            }
            {
              !loading && filteredProducts.length==0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">
                        No Products found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search or create a new Product
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )
            }

               {loading && filteredProducts.map((product) => (
                 <TableRow key={product.id} className="group hover:bg-muted/50">
                   <TableCell className="px-4 py-3">
                     <div className="flex items-center gap-3">
                       <img
                         src={product.thumbnail}
                         alt={product.name}
                         className="w-12 h-12 rounded-lg object-cover"
                       />
                       <div>
                         <p className="font-semibold text-foreground">{product.name}</p>
                         <p className="text-xs text-muted-foreground">{product.variantCount} variants</p>
                       </div>
                     </div>
                   </TableCell>
                   <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                     {product.collectionName}
                   </TableCell>
                   <TableCell className="px-4 py-3 text-sm font-medium text-foreground">
                     {formatPrice(product.priceRange.min)} - {formatPrice(product.priceRange.max)}
                   </TableCell>
                   <TableCell className="px-4 py-3">
                     <Badge
                       variant="secondary"
                       className={cn(
                         'capitalize',
                         product.status === 'published'
                           ? 'bg-success/10 text-success'
                           : 'bg-warning/10 text-warning'
                       )}
                     >
                       {product.status}
                     </Badge>
                   </TableCell>
                   <TableCell className="px-4 py-3">
                     <div className="flex items-center gap-1">
                       <Star className="h-4 w-4 fill-primary text-primary" />
                       <span className="text-sm font-medium">{product.reviewSummary.rating}</span>
                       <span className="text-xs text-muted-foreground">({product.reviewSummary.count})</span>
                     </div>
                   </TableCell>
                   <TableCell className="px-4 py-3">
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button
                           variant="ghost"
                           size="icon"
                           className="opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <MoreHorizontal className="h-4 w-4" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={()=>{openEdit(product)}}>
                           <Edit className="h-4 w-4 mr-2" />
                           Edit
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={()=>{handleUpdateStatus(product)}}>{product.status=="draft"?"Publish":"Draft"}</DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem onClick={()=>handleDelete(product)} className="text-destructive">
                           <Trash2 className="h-4 w-4 mr-2" />
                           Delete
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </div>
       )}
     </div>
   );
 }