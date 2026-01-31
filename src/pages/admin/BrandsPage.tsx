import { Building2, Package, ExternalLink } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { fetchBrands } from '@/data/mockData';
import { useEffect, useState } from 'react';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const loadBrands = async () => {
      const data = await fetchBrands();
      setBrands(data);
    };
    loadBrands();
  }, []);

  if (!brands.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="animate-fade-in">
      <AdminHeader 
        title="Brands" 
        description="Manage your jewellery brands"
      />
      
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {brands.map((brand, index) => (
            <div 
              key={brand.id} 
              className="luxury-card overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header with gradient */}
              <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative">
                <div className="absolute -bottom-8 left-6">
                  <div className="w-16 h-16 rounded-xl bg-card border border-border shadow-lg flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>
              
              <div className="p-6 pt-12">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {brand.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {brand.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">{brand.productCount}</span>
                    <span className="text-muted-foreground">products</span>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Products
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 luxury-card p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Add More Brands</h4>
              <p className="text-sm text-muted-foreground">
                Currently, the system supports two fixed brands. To add more brands, please enable 
                Lovable Cloud for database functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
