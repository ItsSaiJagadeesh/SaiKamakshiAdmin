import React from 'react';
import { Collection } from '@/types/collection';
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal, Trash2, Eye, EyeOff } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

interface CollectionsGridProps {
  collections: Collection[];
  isLoading: boolean;
  onEdit: (collection: Collection) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (collection: Collection) => void;
}

export function CollectionsGrid({ collections, isLoading, onEdit, onDelete, onToggleStatus }: CollectionsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-4 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center pt-4">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return null; // Let the parent component handle empty state
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {collections.map((collection) => (
        <div key={collection.id} className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative h-48 bg-muted">
            {collection.coverImage ? (
              <img src={collection.coverImage} alt={collection.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            <div className="absolute top-3 right-3">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                collection.status === 'active' 
                  ? 'bg-success/90 text-white shadow-sm' 
                  : 'bg-muted/90 text-muted-foreground shadow-sm'
              }`}>
                {collection.status}
              </span>
            </div>
          </div>
          
          <div className="p-4 flex flex-col h-[calc(100%-12rem)]">
            <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1">{collection.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[40px]">
              {collection.description || 'No description provided.'}
            </p>
            <p className="text-xs text-muted-foreground mt-3 mb-4">
              Updated: {new Date(collection.updatedAt).toLocaleDateString()}
            </p>
            
            <div className="mt-auto flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(collection)} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onToggleStatus(collection)}>
                    {collection.status === 'active' ? (
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
                  <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => collection.id && onDelete(collection.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
