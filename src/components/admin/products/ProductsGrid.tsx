import React from 'react';
import { Product } from '@/types/product';
import { Edit, MoreHorizontal, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils'; // Assuming this exists or I will just write a simple formatter

interface ProductsGridProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (product: Product) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

export function ProductsGrid({ products, isLoading, onEdit, onDelete, onToggleStatus }: ProductsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 flex flex-col">
          <div className="relative h-48 overflow-hidden bg-muted">
            <div className="absolute top-2 right-2 z-10">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                product.status === 'published' 
                  ? 'bg-success/90 text-white backdrop-blur-sm shadow-sm' 
                  : 'bg-secondary/90 text-secondary-foreground backdrop-blur-sm shadow-sm'
              }`}>
                {product.status === 'published' ? 'published' : 'draft'}
              </span>
            </div>
            {product.thumbnail ? (
              <img 
                src={product.thumbnail} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/30">
                No Image
              </div>
            )}
          </div>
          
          <div className="p-4 flex flex-col flex-1">
            <div className="mb-1 text-xs font-medium text-[#b98d4d]">{product.collectionName}</div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-1 line-clamp-1">{product.name}</h3>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
              {product.description || 'No description provided.'}
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-foreground">
                {formatPrice(product.priceRange?.min || 0)} - {formatPrice(product.priceRange?.max || 0)}
              </span>
              <div className="flex items-center text-xs text-muted-foreground font-medium">
                <Star className="h-3 w-3 fill-[#b98d4d] text-[#b98d4d] mr-1" />
                {product.reviewSummary?.rating || 0}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
              <span className="text-xs text-muted-foreground">{product.variantCount || 0} variants</span>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Product
                    </DropdownMenuItem>
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
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => product.id && onDelete(product.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
