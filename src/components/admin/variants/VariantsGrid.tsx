import React, { useState } from 'react';
import { Variant } from '@/types/variant';
import { Edit, MoreHorizontal, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface VariantsGridProps {
  variants: Variant[];
  isLoading: boolean;
  onEdit: (variant: Variant) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (variant: Variant) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

function VariantImageCarousel({ images, name }: { images: string[], name: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/30">
        No Image
      </div>
    );
  }

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-full group/carousel">
      <img 
        src={images[currentIndex]} 
        alt={`${name} - ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
      {images.length > 1 && (
        <>
          <button 
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/80"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/80"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function VariantsGrid({ variants, isLoading, onEdit, onDelete, onToggleStatus }: VariantsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
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
      {variants.map((variant) => {
        const totalStock = variant.sizes?.reduce((sum, size) => sum + size.stock, 0) || 0;
        
        return (
          <div key={variant.id} className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 flex flex-col">
            <div className="relative h-48 overflow-hidden bg-muted">
              <div className="absolute top-2 right-2 z-10">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  variant.status === 'active' 
                    ? 'bg-success/90 text-white backdrop-blur-sm shadow-sm' 
                    : 'bg-secondary/90 text-secondary-foreground backdrop-blur-sm shadow-sm'
                }`}>
                  {variant.status}
                </span>
              </div>
              <VariantImageCarousel images={variant.images || []} name={variant.skuPrefix} />
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <div className="mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 flex-wrap">
                <span className="text-[#b98d4d]">{variant.collectionName}</span>
                <span>&rarr;</span>
                <span className="text-foreground line-clamp-1">{variant.productName}</span>
              </div>
              
              <h3 className="font-serif text-lg font-semibold text-foreground mb-3">{variant.skuPrefix}</h3>
              
              <div className="space-y-2 mb-4 flex-1">
                {variant.sizes && variant.sizes.map((size, idx) => (
                  <div key={size.sizeId || idx} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-muted-foreground">{size.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatPrice(size.originalPrice)}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-sm ${size.stock > 0 ? 'bg-primary/10 text-[#b98d4d]' : 'bg-destructive/10 text-destructive'}`}>
                        {size.stock > 0 ? `${size.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                ))}
                {(!variant.sizes || variant.sizes.length === 0) && (
                  <span className="text-sm text-muted-foreground italic">No sizes configured</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <span className="text-xs font-medium text-muted-foreground">Total Stock: {totalStock}</span>
                
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(variant)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Variant
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus(variant)}>
                        {variant.status === 'active' ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => variant.id && onDelete(variant.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
