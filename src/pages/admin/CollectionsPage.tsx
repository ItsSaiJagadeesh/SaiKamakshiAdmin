import React, { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, LayoutGrid, List as ListIcon } from 'lucide-react';
import { useCollections, useCreateCollection, useUpdateCollection, useDeleteCollection } from '@/api/collections';
import { CollectionsGrid } from '@/components/admin/collections/CollectionsGrid';
import { CollectionsTable } from '@/components/admin/collections/CollectionsTable';
import { CollectionModal } from '@/components/admin/collections/CollectionModal';
import { Collection } from '@/types/collection';

export default function CollectionsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<Collection | null>(null);

  const { data: collections = [], isLoading } = useCollections();
  const createMutation = useCreateCollection();
  const updateMutation = useUpdateCollection();
  const deleteMutation = useDeleteCollection();

  const filteredCollections = collections.filter(collection => 
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    collection.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCollection = () => {
    setCollectionToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setCollectionToEdit(collection);
    setIsModalOpen(true);
  };

  const handleDeleteCollection = (id: string) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (collection: Collection) => {
    if (collection.id) {
      updateMutation.mutate({
        id: collection.id,
        status: collection.status === 'active' ? 'inactive' : 'active'
      });
    }
  };

  const handleSubmit = (data: Partial<Collection>) => {
    if (collectionToEdit && collectionToEdit.id) {
      updateMutation.mutate(
        { id: collectionToEdit.id, ...data },
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else { 
      // createMutation expects all required fields for a new collection
      createMutation.mutate(data as Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'productCount'>, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  return (
    <div className="animate-fade-in pb-12">
      <AdminHeader 
        title="Collections" 
        description={undefined}
      />
      
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">All Collections</h2>
            <p className="text-muted-foreground text-sm">Manage your product collections</p>
          </div>
          <Button onClick={handleAddCollection} className="gap-2 shrink-0 bg-[#b98d4d] hover:bg-[#a67d43] text-white">
            <Plus className="h-4 w-4" />
            Add Collection
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search collections..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border h-11"
            />
          </div>
          
          <div className="h-[42px] flex border border-border rounded-lg overflow-hidden">
            <Button 
              variant='ghost'
              size="icon"
              onClick={() => setViewMode('grid')}
              className={`h-10 w-10 rounded-none ${viewMode==="grid"?"bg-muted":"bg-transparent"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant='ghost'
              size="icon"
              onClick={() => setViewMode('list')}
              className={`h-10 w-10 rounded-none ${viewMode==="list"?"bg-muted":"bg-transparent"}`}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isLoading && filteredCollections.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center mt-6">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No collections found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              {searchQuery 
                ? "We couldn't find any collections matching your search. Try adjusting your filters."
                : "Get started by creating your first product collection."}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddCollection} className="mt-6 bg-[#b98d4d] hover:bg-[#a67d43] text-white">
                Create new collection
              </Button>
            )}
          </div>
        ) : (
          viewMode === 'grid' ? (
            <CollectionsGrid 
              collections={filteredCollections} 
              isLoading={isLoading} 
              onEdit={handleEditCollection}
              onDelete={handleDeleteCollection}
              onToggleStatus={handleToggleStatus}
            />
          ) : (
            <CollectionsTable 
              collections={filteredCollections} 
              isLoading={isLoading} 
              onEdit={handleEditCollection}
              onDelete={handleDeleteCollection}
              onToggleStatus={handleToggleStatus}
            />
          )
        )}
      </div>

      <CollectionModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        collectionToEdit={collectionToEdit}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
