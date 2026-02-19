import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { Controller } from 'react-hook-form';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { variantSchema, VariantFormValues } from '@/lib/validations/variant';
import { uploadMultipleImages } from '@/api/cloudinary.api';

import { fetchCollections } from '@/services/collections.service';
import { fetchProductsByCollection, updateVariantCount } from '@/services/products.service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collection } from '@/types/collection';
import { Product } from '@/types/product';
import { createVariant } from '@/services/variants.service';
import { toast } from '@/hooks/use-toast';

const SIZE_OPTIONS = ['Baby', '2.2', '2.4', '2.6', '2.8', '2.10', 'Adjustable', 'Free Size'];

export function VariantForm({ initialData, setDialogOpen }: {
  initialData?: VariantFormValues;
  setDialogOpen :React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: initialData ?? {
      collectionId: '',
      productId: '',
      skuPrefix: '',
      images: [],
      sizes: [],
      status: 'active',
    },
  });

  const collectionId = watch('collectionId');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sizes',
  });

  /* ---------- Load collections ---------- */
  useEffect(() => {
    const load = async ()=>{
      const collections_data = await fetchCollections();
      setCollections(collections_data);
    }
    load();
  }, []);

  /* ---------- Load products when collection changes ---------- */
  useEffect(() => {
    const load = async()=>{
      const products_data = await fetchProductsByCollection(collectionId);
      console.log(products_data);
      setProducts(products_data);
    }
    load();
  }, [collectionId]);

  /* ---------- Image Upload ---------- */
  const handleImageUpload = async (filesList: FileList) => {
    const files = Array.from(filesList);
    const urls = await uploadMultipleImages(files, {
      folder: '/jewellery/products/variants',
      onProgress: setUploadProgress,
    });

    setValue('images', [...(watch('images') || []), ...urls], {
      shouldValidate: true,
    });
  };

  const onSubmit= async (data:VariantFormValues) => {
     try {
        const activeProduct = products.find((p)=>p.id==data.productId);
        await createVariant({
          ...data,
          
          productName: activeProduct.name,
          
          collectionName: activeProduct.collectionName,
        });
        await updateVariantCount(data.productId,1);
        toast({ title: 'Variant created successfully' });
        setDialogOpen(false);
    } catch {

      toast({
          title: 'Failed to create variant',
          variant: 'destructive',
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-4 max-h-[80vh] overflow-auto">

      {/* Collection */}
      <div>
        <Label>Collection</Label>
        <Controller
          name="collectionId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>

              <SelectContent>
                {collections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.collectionId && <p className="text-xs text-destructive">{errors.collectionId.message}</p>}
      </div>

      {/* Product */}
      <div>
        <Label>Product</Label>
        <Controller
          name="productId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!collectionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>

              <SelectContent>
                {
                  products.length==0 && (
                    <div className='w-full h-auto px-4 py-2 text-primary'>
                        No Products for the selected collection
                    </div>
                  )
                }
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.productId && <p className="text-xs text-destructive">{errors.productId.message}</p>}
      </div>

      {/* SKU */}
      <div>
        <Label>SKU Prefix</Label>
        <Input {...register('skuPrefix')} />
        {errors.skuPrefix && <p className="text-xs text-destructive">{errors.skuPrefix.message}</p>}
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>Variant Images</Label>

        {/* Preview */}
        {watch('images')?.length > 0 && (
          <div className="flex gap-3">
            {watch('images')
              .slice(0, 3)
              .map((img: string, index: number) => {
                const remaining = watch('images').length - 3;

                return (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border"
                  >
                    <img
                      src={img}
                      alt="variant-preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay on 3rd image */}
                    {index === 2 && remaining > 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          +{remaining}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* Upload input */}
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) =>
            e.target.files && handleImageUpload(e.target.files)
          }
        />

        {/* Upload progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <Progress value={uploadProgress} />
        )}
      </div>


      {/* Sizes */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Sizes & Pricing</Label>
          <Button type="button" size="sm" onClick={() => append({
            label: '2.4',
            originalPrice: 0,
            discount: 0,
            stock: 0,
          })}>
            <Plus className="h-4 w-4 mr-1" /> Add Size
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Badge className='h-fit px-3 py-1.5 text-white text-xs/[14px] border border-primary bg-primary/10 text-primary'>Size #{index + 1}</Badge>
              <Button type="button" size="icon" variant="ghost" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <Controller
              name={`sizes.${index}.label`}
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>

                  <SelectContent>
                    {SIZE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <div>
              <Label>Price</Label>
              <Input type="number" placeholder="Price"
                {...register(`sizes.${index}.originalPrice`, { valueAsNumber: true })} />
              </div>
              <div>
              <Label>Discount %</Label>
              <Input type="number" placeholder="Discount %"
                {...register(`sizes.${index}.discount`, { valueAsNumber: true })} />
              </div>
              <div>
              <Label>Stock</Label>
              <Input type="number" placeholder="Stock"
                {...register(`sizes.${index}.stock`, { valueAsNumber: true })} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div>
        <Label>Status</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {initialData ? 'Update Variant' : 'Create Variant'}
      </Button>
    </form>
  );
}
