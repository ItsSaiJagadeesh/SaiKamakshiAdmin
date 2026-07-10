import React from 'react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (product: Product) => void;
  onRowClick?: (product: Product) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

export function ProductsTable({ products, isLoading, onEdit, onDelete, onToggleStatus, onRowClick }: ProductsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Collection</th>
                <th className="px-6 py-4">Base Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-md shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Collection</th>
              <th className="px-6 py-4 font-medium">Base Price</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Rating</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => {
              const totalStock = product.sizes?.reduce((sum, size) => sum + size.stock, 0) || 0;
              const finalPrice = product.originalPrice - (product.discount || 0);

              return (
                <tr 
                  key={product.id} 
                  className="group hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onRowClick?.(product)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-muted border border-border shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{totalStock} in stock</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#b98d4d]">{product.collectionName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium flex flex-col">
                      <span>{formatPrice(finalPrice)}</span>
                      {product.discount ? (
                        <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      product.status === 'published' 
                        ? 'bg-success/10 text-success' 
                        : product.status === 'out_of_stock'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 font-medium">
                      <Star className="h-3 w-3 fill-[#b98d4d] text-[#b98d4d]" />
                      {product.reviewSummary?.rating || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onToggleStatus(product)}>
                          {product.status === 'published' ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Draft
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => product.id && onDelete(product.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
