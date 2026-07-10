import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { X, Edit, Trash2, ChevronLeft, ChevronRight, Package, Tag, Layers, Star } from 'lucide-react';

interface ProductDetailsPanelProps {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

export function ProductDetailsPanel({ product, onClose, onEdit, onDelete }: ProductDetailsPanelProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  const totalStock = product.sizes?.reduce((sum, size) => sum + size.stock, 0) || 0;
  const finalPrice = product.originalPrice - (product.discount || 0);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % (product.images?.length || 1));
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + (product.images?.length || 1)) % (product.images?.length || 1));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/20 z-50 flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          className="w-full max-w-md h-full bg-card border-l border-border shadow-2xl overflow-y-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card/95 backdrop-blur z-10">
            <h2 className="font-serif text-xl font-semibold text-foreground">Product Details</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Image Gallery */}
          <div className="space-y-4">
              <div className="relative overflow-hidden bg-muted border border-border group">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img 
                      src={product.images[currentImageIndex]} 
                      alt={product.name} 
                      className="w-full object-cover aspect-[4/3] transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.images.length > 1 && (
                      <>
                        <button title="Previous Image" onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button title="Next Image" onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full  flex items-center justify-center text-muted-foreground">
                    No Images Available
                  </div>
                )}
                
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
                    product.status === 'published' 
                      ? 'bg-success text-white' 
                      : product.status === 'out_of_stock'
                      ? 'bg-destructive text-white'
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {product.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto px-6 pb-2 scrollbar-thin">
                  {product.images.map((img, idx) => (
                    <button 
                      title={`View Image ${idx + 1}`}
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-sm overflow-hidden shrink-0 border-2 transition-colors ${
                        idx === currentImageIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
          </div>

          <div className="p-6 flex-1 space-y-8">
          
            {/* Basic Info */}
            <div>
              <div className="text-sm font-medium text-[#b98d4d] mb-1">{product.collectionName}</div>
              <h1 className="font-serif text-2xl font-semibold text-foreground mb-4">{product.name}</h1>
              
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Base Price</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold text-foreground">{formatPrice(finalPrice)}</span>
                    {product.discount ? (
                      <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                    ) : null}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Total Stock</div>
                  <div className="text-lg font-semibold text-foreground">{totalStock} Units</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-border rounded-lg bg-card">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Tag className="w-4 h-4" /> SKU Prefix
                </div>
                <div className="font-medium text-foreground">{product.skuPrefix || 'N/A'}</div>
              </div>
              <div className="p-3 border border-border rounded-lg bg-card">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Star className="w-4 h-4" /> Rating
                </div>
                <div className="font-medium text-foreground">{product.reviewSummary?.rating || 0} ({product.reviewSummary?.count || 0} reviews)</div>
              </div>
            </div>

            {/* Sizes & Stock */}
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-primary" /> Sizes & Variants
              </h3>
              
              {product.sizes && product.sizes.length > 0 ? (
                <div className="space-y-3">
                  {product.sizes.map((size) => {
                    const isOutOfStock = size.stock <= 0;
                    return (
                      <div 
                        key={size.sizeId} 
                        className={`p-4 rounded-lg border flex items-center justify-between ${
                          isOutOfStock ? 'bg-destructive/5 border-destructive/20' : 'bg-card border-border'
                        }`}
                      >
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {size.label}
                            {isOutOfStock && (
                              <span className="text-[10px] uppercase font-bold tracking-wider text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            SKU: {product.skuPrefix}-{size.label.replace(/\s+/g, '-').toUpperCase()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${isOutOfStock ? 'text-destructive' : 'text-foreground'}`}>
                            {size.stock} in stock
                          </div>
                          {size.priceAdjustment ? (
                            <div className="text-sm font-medium text-success">
                              {size.priceAdjustment > 0 ? '+' : ''}{formatPrice(size.priceAdjustment)}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">No extra cost</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 border border-dashed border-border rounded-lg text-center text-muted-foreground">
                  No sizes configured.
                </div>
              )}
            </div>
            
            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border bg-muted/20 flex gap-3 mt-auto">
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" 
              onClick={() => {
                onClose();
                onEdit(product);
              }}
            >
              <Edit className="w-4 h-4 mr-2" /> Edit Product
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={() => {
                if (product.id) {
                  onDelete(product.id);
                  onClose();
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
