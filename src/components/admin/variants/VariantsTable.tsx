import React from 'react';
import { Variant } from '@/types/variant';
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal, Trash2, Eye, EyeOff } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

interface VariantsTableProps {
  variants: Variant[];
  isLoading: boolean;
  onEdit: (variant: Variant) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (variant: Variant) => void;
}

export function VariantsTable({ variants, isLoading, onEdit, onDelete, onToggleStatus }: VariantsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Variant Info</th>
                <th className="px-6 py-4">Sizes</th>
                <th className="px-6 py-4">Total Stock</th>
                <th className="px-6 py-4">Status</th>
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
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
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
              <th className="px-6 py-4 font-medium">Variant Info</th>
              <th className="px-6 py-4 font-medium">Sizes</th>
              <th className="px-6 py-4 font-medium">Total Stock</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {variants.map((variant) => {
              const totalStock = variant.sizes?.reduce((sum, size) => sum + size.stock, 0) || 0;
              const sizesStr = variant.sizes?.map(s => s.label).join(', ') || 'None';
              
              return (
                <tr key={variant.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 mb-1">
                       <span className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground">
                         <span className="text-[#b98d4d]">{variant.collectionName}</span> &rarr; {variant.productName}
                       </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-muted border border-border shrink-0">
                        {variant.images && variant.images.length > 0 ? (
                          <img src={variant.images[0]} alt={variant.skuPrefix} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-base">{variant.skuPrefix}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[200px] flex flex-wrap gap-1">
                      {variant.sizes && variant.sizes.length > 0 ? (
                        variant.sizes.map((s, idx) => (
                          <span key={idx} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-md border border-border whitespace-nowrap">
                            {s.label}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground italic text-xs">No sizes</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${totalStock > 0 ? 'text-foreground' : 'text-destructive'}`}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      variant.status === 'active' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {variant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                        <DropdownMenuItem onClick={() => onEdit(variant)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => variant.id && onDelete(variant.id)}>
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
