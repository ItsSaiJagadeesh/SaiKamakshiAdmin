import { Package, Tags, Eye, FileEdit, Clock, TrendingUp } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/admin/StatCard';
import { VisibilityBadge, StockBadge } from '@/components/admin/ProductStatusBadge';
import { fetchProducts, fetchCategories } from '@/data/mockData';
import { CATEGORIES } from '@/types/admin';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const productsData = await fetchProducts();
      const categoriesData = await fetchCategories();
      setProducts(productsData);
      setCategories(categoriesData);
    };
    loadData();
  }, []);

  if (!products.length || !categories.length) {
    return <div>Loading...</div>;
  }

  const totalProducts = products.length;
  const publishedProducts = products.filter(p => p.visibility === 'published').length;
  const draftProducts = products.filter(p => p.visibility === 'draft').length;
  const totalCategories = categories.length;
  
  const recentProducts = [...products]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  return (
    <div className="animate-fade-in">
      <AdminHeader 
        title="Dashboard" 
        description="Welcome back! Here's what's happening with your store."
        actions={
          <Link to="/admin/products/new">
            <Button variant="gold">
              <Package className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        }
      />
      
      <div className="p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Products" 
            value={totalProducts} 
            icon={Package}
            trend={{ value: 12, label: 'from last month' }}
          />
          <StatCard 
            title="Published" 
            value={publishedProducts} 
            icon={Eye}
          />
          <StatCard 
            title="Drafts" 
            value={draftProducts} 
            icon={FileEdit}
          />
          <StatCard 
            title="Categories" 
            value={totalCategories} 
            icon={Tags}
          />
        </div>
        
        {/* Recent Products */}
        <div className="luxury-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  Recent Products
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Latest updates to your product catalog
                </p>
              </div>
              <Link to="/admin/products">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentProducts.map((product, index) => (
                  <tr 
                    key={product.id} 
                    className="table-row-hover animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {product.images[0] ? (
                            <img 
                              src={product.images[0].url} 
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground">
                        {CATEGORIES.find(c => c.value === product.category)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {product.discountPrice ? (
                          <>
                            <span className="font-medium text-foreground">₹{product.discountPrice}</span>
                            <span className="ml-2 text-sm text-muted-foreground line-through">₹{product.price}</span>
                          </>
                        ) : (
                          <span className="font-medium text-foreground">₹{product.price}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <VisibilityBadge status={product.visibility} />
                        <StockBadge status={product.stockStatus} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {format(product.updatedAt, 'MMM d, yyyy')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Categories Overview */}
          <div className="luxury-card p-6">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              Categories Overview
            </h3>
            <div className="space-y-3">
              {categories.slice(0, 5).map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{category.name}</span>
                  <span className="text-sm font-medium text-primary">
                    {category.productCount} products
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="luxury-card p-6">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/products/new">
                <Button variant="luxury" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
              <Link to="/admin/categories">
                <Button variant="luxury" className="w-full justify-start">
                  <Tags className="h-4 w-4 mr-2" />
                  Manage Categories
                </Button>
              </Link>
              <Link to="/admin/pages">
                <Button variant="luxury" className="w-full justify-start">
                  <FileEdit className="h-4 w-4 mr-2" />
                  Edit Pages
                </Button>
              </Link>
              <Link to="/admin/settings">
                <Button variant="luxury" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
