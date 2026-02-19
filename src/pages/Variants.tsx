import { useEffect, useState } from 'react';
import {
  Grid,
  List,
  Plus,
  Search,
  Trash2,
  Edit,
  Layers,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { fetchProducts } from '@/services/products.service';
import { getVariantsByProduct, deleteVariant } from '@/services/variants.service';

import type { Product } from '@/types/product';
import type { Variant } from '@/types/variant';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { VariantForm } from '@/components/variants/VariantForm';
import VariantImageCarousel from '@/components/variants/VariantImageCarousel';
import { toast } from '@/hooks/use-toast';

export default function Variants() {
  const [loading,setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [variantsMap, setVariantsMap] = useState<Record<string, Variant[]>>({});
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVarient,setEditingVarent] = useState<Variant | null>(null);

  const [search, setSearch] = useState('');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      try{
        setLoading(true);
        const productsData = await fetchProducts();
        setProducts(productsData);

        const map: Record<string, Variant[]> = {};
        for (const p of productsData) {
          map[p.id] = await getVariantsByProduct(p.id);
        }
        setVariantsMap(map);
      }
      catch(error){
        toast({
          title:"Error",
          description: "Erroer while featching the varients ",
          variant:'destructive'
        })
      }
      finally{
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (collectionFilter !== 'all' && p.collectionId !== collectionFilter)
      return false;
    if (productFilter !== 'all' && p.id !== productFilter) return false;
    return true;
  });

  const hasAnyVariants = Object.values(variantsMap).some(
    (arr) => arr && arr.length > 0
  );

  const handleDelete = async (productId: string, variantId: string) => {
    try{
      if (!confirm('Delete this variant?')) return;
      setLoading(true);
      await deleteVariant(productId, variantId);

      setVariantsMap((prev) => ({
        ...prev,
        [productId]: prev[productId].filter((v) => v.id !== variantId),
      }));
      toast({
        title:"Deleted vareint"
      });
    }
    catch(error){
      toast({
        title:"Error",
        description:"Error while deleting the Varient",
        variant:"destructive"
      })
    }
    finally{
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/*================= Dialog ================= */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Add Variant
            </DialogTitle>
          </DialogHeader>

          { (
            <VariantForm initialData={editingVarient} setDialogOpen={setDialogOpen}/>
          )}
        </DialogContent>
      </Dialog>


      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Product Variants</h2>
          <p className="text-sm text-muted-foreground">
            Manage SKUs, sizes, pricing and stock
          </p>
        </div>

        {/* GLOBAL ADD VARIANT */}
        <Button onClick={() => {
          // setActiveProduct(product);
          setDialogOpen(true);
        }} 
        className="bg-gradient-gold text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search by SKU / size / product"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Collection Filter */}
        <Select value={collectionFilter} onValueChange={setCollectionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Collections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Collections</SelectItem>
            {[...new Set(products.map((p) => p.collectionId))].map((id) => {
              const col = products.find((p) => p.collectionId === id);
              return (
                <SelectItem key={id} value={id}>
                  {col?.collectionName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Product Filter */}
        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {filteredProducts.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Toggle */}
        <div className="flex border border-border rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView('grid')}
            className={cn('rounded-none', view === 'grid' && 'bg-muted')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView('list')}
            className={cn('rounded-none', view === 'list' && 'bg-muted')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {!hasAnyVariants && !loading && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Variants Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            You haven’t added any variants yet. Start by creating variants for
            your products to manage sizes, pricing, and stock.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add First Variant
          </Button>
        </div>
      )}

      {/* ================= GRID VIEW ================= */}
      {view === 'grid' && loading && 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
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
        </div>
      }
      {view === 'grid' && !loading &&
        filteredProducts.map((product) => {
          const variants =
            variantsMap[product.id]?.filter(
              (v) =>
                v.skuPrefix.toLowerCase().includes(search.toLowerCase()) ||
                v.productName.toLowerCase().includes(search.toLowerCase())
            ) || [];

          if (!variants.length) return null;

          return (
            <div key={product.id} className="space-y-4">
              <h3 className="font-semibold">
                {product.collectionName} → {product.name}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {variants.map((variant) => (
                  // <div
                  //   key={variant.id}
                  //   className="rounded-xl border bg-card p-4 space-y-2"
                  // >
                  //   <div className="flex justify-between">
                  //     <p className="font-semibold">{variant.skuPrefix}</p>
                  //     <Badge variant="secondary">{variant.status}</Badge>
                  //   </div>

                  //   <p className="text-sm text-muted-foreground">
                  //     Sizes: {variant.sizes.map((s) => s.label).join(', ')}
                  //   </p>

                  //   <p className="text-sm">
                  //     Stock:{' '}
                  //     {variant.sizes.reduce((t, s) => t + s.stock, 0)}
                  //   </p>

                  //   <div className="flex justify-end gap-2 pt-2">
                  //     <Button size="icon" variant="ghost">
                  //       <Edit className="h-4 w-4" />
                  //     </Button>
                  //     <Button
                  //       size="icon"
                  //       variant="ghost"
                  //       onClick={() =>
                  //         handleDelete(product.id, variant.id)
                  //       }
                  //     >
                  //       <Trash2 className="h-4 w-4 text-destructive" />
                  //     </Button>
                  //   </div>
                  // </div>
                  <div key={variant.id} className="rounded-xl border bg-card p-4 space-y-3">
                    {/* Carousel */}
                    <VariantImageCarousel images={variant.images} />

                    <div className="flex justify-between">
                      <p className="font-semibold">{variant.skuPrefix}</p>
                      <Badge variant="secondary">{variant.status}</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Sizes: {variant.sizes.map((s) => s.label).join(', ')}
                    </p>

                    <p className="text-sm">
                      Stock:{' '}
                      {variant.sizes.reduce((t, s) => t + s.stock, 0)}
                    </p>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button onClick={()=>{
                          setDialogOpen(true);
                          setEditingVarent(variant);
                          }} size="icon" variant="ghost">
                        <Edit  className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(product.id, variant.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                ))}
              </div>
            </div>
          );
        })
      }

      {view === 'list' &&
        filteredProducts.map((product) => {
          const variants =
            variantsMap[product.id]?.filter(
              (v) =>
                v.skuPrefix.toLowerCase().includes(search.toLowerCase()) ||
                v.productName.toLowerCase().includes(search.toLowerCase())
            ) || [];

          if (!variants.length) return null;

          return (
            <div key={product.id} className="space-y-3">
              {/* Section Header */}
              <h3 className="font-semibold text-sm text-muted-foreground">
                {product.collectionName} →{' '}
                <span className="text-foreground font-medium">
                  {product.name}
                </span>
              </h3>

              {/* Table */}
              <div className="rounded-xl border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left">SKU</th>
                      <th className="px-4 py-2 text-left">Sizes</th>
                      <th className="px-4 py-2 text-left">Stock</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 w-[90px] text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {variants.map((variant) => (
                      <tr
                        key={variant.id}
                        className="hover:bg-muted/40 transition"
                      >
                        {/* SKU */}
                        <td className="px-4 py-2 font-medium">
                          {variant.skuPrefix}
                        </td>

                        {/* Sizes */}
                        <td className="px-4 py-2 text-muted-foreground">
                          {variant.sizes.map((s) => s.label).join(', ')}
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-2">
                          {variant.sizes.reduce(
                            (total, s) => total + s.stock,
                            0
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-2">
                          <Badge variant="secondary">
                            {variant.status}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-2 text-right">
                          <div className="inline-flex gap-2">
                            <Button size="icon" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                handleDelete(product.id, variant.id)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      }

    </div>
  );
}
