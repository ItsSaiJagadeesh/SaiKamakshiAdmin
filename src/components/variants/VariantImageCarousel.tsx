import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

function VariantImageCarousel({ images }: { images: string[] }) {
  if (!images?.length) {
    return (
      <div className="h-56 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
        No Image
      </div>
    );
  }

  return (
    <Carousel className="group relative w-full">
      <CarouselContent>
        {images.map((img, index) => (
          <CarouselItem key={index}>
            <div className="h-56 rounded-lg overflow-hidden">
              <img
                src={img}
                alt="variant"
                className="w-full h-full object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    <div className='absolute inset-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300  '>
      {images.length > 1 && (
        <>
          <CarouselPrevious className='absolute left-4' />
          <CarouselNext className='absolute right-4' />
        </>
      )}
    </div>
    </Carousel>
  );
}


export default VariantImageCarousel;