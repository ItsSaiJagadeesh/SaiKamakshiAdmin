import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller } from 'react-hook-form';
import { productSchema, ProductFormValues } from '@/lib/validations/product';
import { uploadImageToCloudinary } from '@/api/cloudinary.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Product } from '@/types/product';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Collection } from '@/types/collection';

type Props = {
  collections: Collection[];  
  editingProduct : Product | null;
  onSubmitProduct: (data: ProductFormValues) => Promise<void>;
};

export function ProductForm({ collections , editingProduct , onSubmitProduct }: Props) {
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues:  {
      name: '',
      slug: '',
      collectionName: '',
      description: '',
      thumbnail: '',
      priceRange: { min: 0, max: 0 },
      occasions: [],
      status: 'draft',
    },
  });

  useEffect(()=>{
    if (!editingProduct) return;

    reset({
        description:editingProduct.description,
        name:editingProduct.name,
        slug:editingProduct.slug,
        collectionName:editingProduct.collectionName,
        thumbnail:editingProduct.thumbnail,
        status:editingProduct.status,
        priceRange:editingProduct.priceRange,
        occasions:editingProduct.occasions,
    })
  },[editingProduct,reset])

  /* ---------- Auto slug ---------- */
  useEffect(() => {
    const name = watch('name');
    if (!editingProduct && name) {
      setValue(
        'slug',
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  }, [setValue,watch,editingProduct]);

  /* ---------- Image Upload ---------- */
  const handleImageUpload = async (file: File) => {
    const url = await uploadImageToCloudinary(file, {
      folder: '/jewellery/products',
      onProgress: setUploadProgress,
    });
    setValue('thumbnail', url, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmitProduct)} className="px-4 space-y-2 max-h-[80vh] overflow-auto">

      {/* Name */}
      <div>
        <Label>Product Name</Label>
        <Input {...register('name')} className='my-1' />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      {/* Slug */}
      <div>
        <Label>Slug</Label>
        <Input {...register('slug')} className='my-1'/>
        {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
      </div>

      {/* Collection */}
      <div>
        <Label>Collection Name</Label>
        <Controller
            name="collectionName"
            control={control}
            render={({ field }) => (
                <Select  value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="my-1">
                    <SelectValue placeholder="Select Collection" />
                </SelectTrigger>
                <SelectContent>
                    {
                        collections.map((collection)=>(
                            <SelectItem value={collection.name} key={collection.id} >{collection.name}</SelectItem>
                        ))
                    }
                </SelectContent>
                </Select>
            )}
        />
        {errors.collectionName && (
          <p className="text-xs text-destructive">{errors.collectionName.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label>Description</Label>
        <Textarea rows={4} {...register('description')} className='my-1' />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Image */}
      <div className="space-y-2">
        <Label>Thumbnail Image</Label>

        {watch('thumbnail') && (
          <img
            alt={"products-thumbnial"}
            src={watch('thumbnail')}
            className="w-32 h-32 rounded-lg object-cover"
          />
        )}

        <Input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
        />

        {uploadProgress > 0 && uploadProgress < 100 && (
          <Progress value={uploadProgress} />
        )}
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Min Price (₹)</Label>
          <Input
            type="number"
            min={0}
            className='my-1'
            {...register('priceRange.min', { valueAsNumber: true })}
          />
          {errors.priceRange?.min && (
            <p className="text-xs text-destructive">
              {errors.priceRange.min.message}
            </p>
          )}
        </div>

        <div>
          <Label>Max Price (₹)</Label>
          <Input
            type="number"
            min={0}
            className='my-1'
            {...register('priceRange.max', { valueAsNumber: true })}
          />
          {errors.priceRange?.max && (
            <p className="text-xs text-destructive">
              {errors.priceRange.max.message}
            </p>
          )}
        </div>
      </div>
      {/* Occasions */}
        <div>
        <Label>Occasions</Label>

        <div className="grid grid-cols-2 gap-3 mt-2">
            {['wedding', 'festival', 'daily-wear', 'party', 'office', 'traditional'].map(
            (occasion) => (
                <label
                key={occasion}
                className="flex items-center gap-2 text-sm cursor-pointer"
                >
                <input
                    type="checkbox"
                    value={occasion}
                    {...register('occasions')}
                    className="accent-primary"
                />
                <span className="capitalize">
                    {occasion.replace('-', ' ')}
                </span>
                </label>
            )
            )}
        </div>

        {errors.occasions && (
            <p className="text-xs text-destructive mt-1">
            {errors.occasions.message}
            </p>
        )}
        </div>


      {/* Status */}
      <div>
        <Label>Status</Label>
        <Controller
            name="status"
            control={control}
            render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-[180px] mt-1">
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                </SelectContent>
                </Select>
            )}
        />
        {errors.status && (
            <p className="text-xs text-destructive pt-2">
                {errors.status.message}
            </p>
        )}

      </div>

      <Button type="submit" disabled={isSubmitting}>
        {editingProduct ? 'Update Product' : 'Create Product'}
      </Button>
    </form>
  );
}
