import React, { useState } from 'react';
import { Product } from '@/types/product';
import { Edit, MoreHorizontal, Trash2, Eye, EyeOff, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface ProductsGridProps {
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

function ImageCarousel({ images, alt }: { images: string[], alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/30">
        No Image
      </div>
    );
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-full group/carousel">
      <img 
        src={images[currentIndex]} 
        alt={`${alt} - ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
      {images.length > 1 && (
        <>
          <button 
            title="Previous Image"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            title="Next Image"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ProductsGrid({ products, isLoading, onEdit, onDelete, onToggleStatus, onRowClick }: ProductsGridProps) {
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
      {products.map((product) => {
        const totalStock = product.sizes?.reduce((sum, size) => sum + size.stock, 0) || 0;
        const finalPrice = product.originalPrice - (product.discount || 0);

        return (
          <div 
            key={product.id} 
            onClick={() => onRowClick?.(product)}
            className="group cursor-pointer rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 flex flex-col"
          >
            <div className="relative h-48 overflow-hidden bg-muted">
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  product.status === 'published' 
                    ? 'bg-success/90 text-white backdrop-blur-sm shadow-sm' 
                    : product.status === 'out_of_stock'
                    ? 'bg-destructive/90 text-white backdrop-blur-sm shadow-sm'
                    : 'bg-secondary/90 text-secondary-foreground backdrop-blur-sm shadow-sm'
                }`}>
                  {product.status}
                </span>
              </div>
              <ImageCarousel images={product.images} alt={product.name} />
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <div className="mb-1 text-xs font-medium text-[#b98d4d]">{product.collectionName}</div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-1 line-clamp-1">{product.name}</h3>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                {product.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">
                    {formatPrice(finalPrice)}
                  </span>
                  {product.discount ? (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center text-xs text-muted-foreground font-medium">
                  <Star className="h-3 w-3 fill-[#b98d4d] text-[#b98d4d] mr-1" />
                  {product.reviewSummary?.rating || 0}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <span className="text-xs text-muted-foreground">{totalStock} in stock • {product.sizes?.length || 0} sizes</span>
                
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
        );
      })}
    </div>
  );
}
