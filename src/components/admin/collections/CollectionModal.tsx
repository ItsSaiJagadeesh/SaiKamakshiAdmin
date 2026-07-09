import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Collection, Status } from '@/types/collection';
import { toast } from 'sonner';

interface CollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionToEdit?: Collection | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function CollectionModal({ open, onOpenChange, collectionToEdit, onSubmit, isLoading }: CollectionModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>('active');
  const [coverImage, setCoverImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (collectionToEdit) {
      setName(collectionToEdit.name);
      setSlug(collectionToEdit.slug);
      setDescription(collectionToEdit.description || '');
      setStatus(collectionToEdit.status);
      setCoverImage(collectionToEdit.coverImage || '');
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setStatus('active');
      setCoverImage('');
    }
  }, [collectionToEdit, open]);

  // Auto-generate slug from name if empty
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!collectionToEdit) {
      setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadToCloudinary(file, 'jewelery/collections');
      setCoverImage(url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error('Name and Slug are required');
      return;
    }
    
    onSubmit({
      name,
      slug,
      description,
      status,
      coverImage
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {collectionToEdit ? 'Edit Collection' : 'Create Collection'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {collectionToEdit ? 'Edit Field Collection' : 'Add a new jewellery collection'}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-2 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={handleNameChange} 
              placeholder="e.g. Mangalsutram Chains" 
              className="focus-visible:ring-primary focus-visible:border-primary"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input 
              id="slug" 
              value={slug} 
              onChange={(e) => setSlug(e.target.value)} 
              placeholder="e.g. mangalsutram-chains" 
              className="focus-visible:ring-primary focus-visible:border-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Sacred mangalsutram chains and links..." 
              className="focus-visible:ring-primary focus-visible:border-primary"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="flex flex-col gap-3">
              {isUploading ? (
                <div className="w-32 h-32 rounded-md bg-muted animate-pulse flex flex-col items-center justify-center border border-border">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                </div>
              ) : coverImage ? (
                <div className="relative w-32 h-32 rounded-md overflow-hidden border border-border">
                  <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              ) : null}
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                disabled={isUploading}
                className="focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading || isUploading} className="w-full sm:w-auto bg-[#b98d4d] hover:bg-[#a67d43] text-white">
              {isLoading ? 'Saving...' : (collectionToEdit ? 'Update Collection' : 'Create Collection')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
