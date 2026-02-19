import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
  Upload,
  Grid,
  List,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  fetchCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from '@/services/collections.service';

import { uploadImageToCloudinary } from '@/api/cloudinary.api';
import {
  collectionSchema,
  CollectionFormValues,
} from '@/lib/validations/collection';
import type { Collection } from '@/types/collection';
import { formatFirebaseTimestamp } from '@/lib/utils';
import type { ViewMode } from '@/types/common';

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [loading,setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      coverImage: '',
    },
  });

  /* ---------------- Fetch Collections ---------------- */
  useEffect(() => {
    const fetchData = async()=>{
      setLoading(true);
      try{
        const data = await fetchCollections();
        setCollections(data);
      }
      catch(error){
        toast({
          title:"Error ",
          description:"error on fetching the data",
          variant:"destructive"
        })
      }
      finally{
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const closeForm = () => {
    reset();
    setEditingCollection(null);
    setIsDialogOpen(false);
  };

  /* ---------------- Image Upload ---------------- */
  const handleImageUpload = async (file: File) => {
    try {
      setUploadProgress(0);

      const url = await uploadImageToCloudinary(file, {
        onProgress: setUploadProgress,
        folder: 'jewellery/collections',
      });

      setValue('coverImage', url, { shouldValidate: true });

      toast({
        title: 'Image uploaded',
        description: 'Cover image uploaded successfully',
      });
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Unable to upload image',
        variant: 'destructive',
      });
    }
  };

  /* ---------------- Create Collection ---------------- */
  const onSubmit = async (data: CollectionFormValues) => {
    try {
      if (editingCollection) {
        // UPDATE
        await updateCollection(editingCollection.id, data);
        setCollections((pre)=>{
          const filtered_data = pre.filter((c)=>c.id!==editingCollection.id);
          const updated_collections = [...filtered_data,{...editingCollection,...data}];
          return updated_collections;
        })

        toast({
          title: 'Collection updated',
          description: 'Changes saved successfully',
        });
      }
      else{
        await createCollection(data);
        setCollections(await fetchCollections());

        toast({
          title: 'Collection created',
          description: 'New collection added successfully',
        });
      }
      closeForm();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create collection',
        variant: 'destructive',
      });
    }
  };

  /* ---------------- Toggle Status ---------------- */
  const toggleStatus = async (id: string, status: string) => {
    try {
      await updateCollection(id, {
        status: status === 'active' ? 'inactive' : 'active',
      });

      setCollections((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' }
            : c
        )
      );

      toast({ title: 'Status updated' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  /* ---------------- Delete ---------------- */
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) return;

    try {
      await deleteCollection(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
      toast({ title: 'Collection deleted' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete collection',
        variant: 'destructive',
      });
    }
  };

  /* ---------------- Filter ---------------- */
  const filteredCollections = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditForm = (collection: Collection) => {
    setEditingCollection(collection);
    setIsDialogOpen(true);

    reset({
      name: collection.name,
      slug: collection.slug,
      description: collection.description ?? '',
      coverImage: collection.coverImage ?? '',
    });
  };


  /* ---------------- UI ---------------- */
  return (
    <div className={`space-y-6 ${isSubmitting?"cursor-not-allowed pointer-events-none":"pointer-events-auto"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">All Collections</h2>
          <p className="text-sm text-muted-foreground">
            Manage your product collections
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" /> Add Collection
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCollection ? 'Edit Collection' : 'Create Collection'}</DialogTitle>
              <DialogDescription>
                {editingCollection ? 'Edit Feild Collection' : 'Add a new jewellery collection'}
                
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <Label>Name</Label>
                <Input {...register('name')} />
                {errors.name && (
                  <p className="text-xs text-destructive pt-2">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div>
                <Label>Slug</Label>
                <Input {...register('slug')} />
                {errors.slug && (
                  <p className="text-xs text-destructive pt-2">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <Textarea {...register('description')} />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Cover Image</Label>

                {watch('coverImage') && (
                  <img
                    alt="cover-image"
                    src={watch('coverImage')}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                )}

                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handleImageUpload(e.target.files[0])
                  }
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.coverImage.message}
                  </p>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress value={uploadProgress} />
                )}
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-gold text-primary-foreground"
                >
                  {isSubmitting ? 'Creating…' : 'Create Collection'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className='flex gap-4'>
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search collections…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex border border-border rounded-lg overflow-hidden">
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setViewMode('grid')}
               className={cn(
                 'rounded-none',
                 viewMode === 'grid' && 'bg-muted'
               )}
             >
               <Grid className="h-4 w-4" />
             </Button>
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setViewMode('list')}
               className={cn(
                 'rounded-none',
                 viewMode === 'list' && 'bg-muted'
               )}
             >
               <List className="h-4 w-4" />
             </Button>
      </div>
      </div>
      
      { viewMode === 'list'?
      <motion.div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className="px-4 py-3 text-left text-sm font-semibold text-foreground">Image</TableHead>
              <TableHead className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</TableHead>
              <TableHead className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</TableHead>
              <TableHead className="px-4 py-3 text-left text-sm font-semibold text-foreground">Updated at</TableHead>
              <TableHead className="px-4 py-3 text-left text-sm font-semibold text-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {
              loading && (
                [1,2,3,4,5,6].map(()=>{
                  return(
                    <TableRow className='pointer-events-none'>
                      {[1,2,3,4,5].map((
                        _,i
                      )=>{
                        return(
                          <TableCell key={i} className='p-4 animate-pulse '>
                            <div className='w-full h-6 bg-border/50 rounded-md'></div>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })
              )
            }
            {
              !loading && filteredCollections.length==0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">
                        No collections found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search or create a new collection
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )
            }
            {!loading && filteredCollections.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <img
                    alt={`${c.name}-cover-image`}
                    src={c.coverImage}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                </TableCell>

                <TableCell>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">/{c.slug}</p>
                </TableCell>
                
                <TableCell>
                  <Badge
                    className={cn(
                      c.status === 'active'
                        ? 'bg-success/10 text-success'
                        : 'bg-muted'
                    )}
                  >
                    {c.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  {formatFirebaseTimestamp(c.updatedAt)}
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => toggleStatus(c.id, c.status)}
                      >
                        {c.status === 'active' ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" /> Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" /> Activate
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem className='cursor-pointer' onClick={() => openEditForm(c)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>:
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {loading && Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border bg-card overflow-hidden animate-pulse"
        >
          {/* Image skeleton */}
          <div className="h-40 w-full bg-muted" />

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted rounded" />

            <div className="h-3 w-2/3 bg-muted rounded" />

            <div className="flex justify-between pt-3">
              <div className="h-8 w-20 bg-muted rounded-md" />
              <div className="h-8 w-8 bg-muted rounded-md" />
            </div>
          </div>
        </div>
      ))}
        {
              !loading && filteredCollections.length==0 && (
                <div className='border border-border col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 bg-muted/50 px-6 py-8 rounded-xl'>
                  <div className=''>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">
                        No Products found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search or create a new Product
                      </p>
                    </div>
                  </div>
                </div>
              )
            }
        {!loading && filteredCollections.map((c) => (
          <motion.div
            key={c.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col rounded-xl border bg-card overflow-hidden group"
          >
            {/* Image */}
            <div className="relative h-64">
              <img
                src={c.coverImage}
                alt={c.name}
                className="w-full h-full object-cover"
              />
              <Badge
                className={cn(
                  'absolute top-2 right-2 hover:',
                  c.status === 'active'
                    ? 'bg-success/90 text-white'
                    : 'bg-muted'
                )}
              >
                {c.status}
              </Badge>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between items-start p-4 space-y-2">
              <div className='flex flex-col justify-start items-start gap-2'>
                <h3 className="font-semibold truncate">{c.name}</h3>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {c.description}
                </p>

                <p className="text-sm text-muted-foreground">
                  Updated: <span className='text-sm text-foreground'>{formatFirebaseTimestamp(c.updatedAt)}</span>
                </p>
              </div>
              {/* Actions */}
              <div className="w-full flex items-center justify-between pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditForm(c)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => toggleStatus(c.id, c.status)}
                    >
                      {c.status === 'active' ? (
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

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      }
    </div>
          
  );
}
