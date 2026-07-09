import React from 'react';
import { Collection } from '@/types/collection';
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal, Trash2, Eye, EyeOff } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

interface CollectionsTableProps {
  collections: Collection[];
  isLoading: boolean;
  onEdit: (collection: Collection) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (collection: Collection) => void;
}

export function CollectionsTable({ collections, isLoading, onEdit, onDelete, onToggleStatus }: CollectionsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="h-12 px-6 text-left align-middle text-sm font-semibold text-muted-foreground">Image</th>
                <th className="h-12 px-6 text-left align-middle text-sm font-semibold text-muted-foreground">Name</th>
                <th className="h-12 px-6 text-left align-middle text-sm font-semibold text-muted-foreground">Status</th>
                <th className="h-12 px-6 text-left align-middle text-sm font-semibold text-muted-foreground">Updated at</th>
                <th className="h-12 px-6 text-right align-middle text-sm font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="bg-card">
                  <td className="p-4 px-6"><Skeleton className="h-12 w-12 rounded-md" /></td>
                  <td className="p-4 px-6">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </td>
                  <td className="p-4 px-6"><Skeleton className="h-6 w-16 rounded-full" /></td>
                  <td className="p-4 px-6"><Skeleton className="h-4 w-32" /></td>
                  <td className="p-4 px-6 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (collections.length === 0) {
    return null; // Let the parent component handle empty state
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors bg-muted/20 hover:bg-muted/20">
              <th className="h-14 px-6 text-left align-middle font-semibold text-muted-foreground w-24">Image</th>
              <th className="h-14 px-6 text-left align-middle font-semibold text-muted-foreground">Name</th>
              <th className="h-14 px-6 text-left align-middle font-semibold text-muted-foreground">Status</th>
              <th className="h-14 px-6 text-left align-middle font-semibold text-muted-foreground">Updated at</th>
              <th className="h-14 px-6 text-right align-middle font-semibold text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0 divide-y divide-border">
            {collections.map((collection) => (
              <tr key={collection.id} className="transition-colors hover:bg-muted/30 group">
                <td className="p-4 px-6 align-middle">
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-muted border border-border shrink-0">
                    {collection.coverImage ? (
                      <img src={collection.coverImage} alt={collection.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
                        No Img
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 px-6 align-middle">
                  <div>
                    <p className="font-medium text-foreground">{collection.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">/{collection.slug}</p>
                  </div>
                </td>
                <td className="p-4 px-6 align-middle">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    collection.status === 'active' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {collection.status}
                  </span>
                </td>
                <td className="p-4 px-6 align-middle text-muted-foreground">
                  {new Date(collection.updatedAt).toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td className="p-4 px-6 align-middle text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
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
                      <DropdownMenuItem onClick={() => onEdit(collection)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => collection.id && onDelete(collection.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
