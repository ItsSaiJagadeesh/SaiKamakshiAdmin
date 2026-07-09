import { 
  ShoppingCart, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Eye,
  TrendingUp
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { mockRevenueData } from '@/data/staticMockData';
import { useOrders } from '@/api/orders';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { data: orders = [] } = useOrders();
  
  const recentOrders = [...orders].sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    const aDate = typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt as any);
    const bDate = typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt as any);
    return bDate.getTime() - aDate.getTime();
  }).slice(0, 5);

  const formatPrice = (price?: number) => {
    if (price === undefined || isNaN(price)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Calculate live stats
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status?.toUpperCase() === 'DELIVERED').length;
  const cancelledOrders = orders.filter(o => o.status?.toUpperCase() === 'CANCELLED').length;
  const shippedOrders = orders.filter(o => o.status?.toUpperCase() === 'SHIPPED').length;
  const processingOrders = orders.filter(o => !['DELIVERED', 'CANCELLED', 'SHIPPED'].includes(o.status?.toUpperCase() || '')).length;

  const totalRevenue = orders
    .filter(o => o.status?.toUpperCase() !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.finalAmount || o.total || (o as any).totalAmount || (o as any).subtotal || 0), 0);

  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-border">
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-[#d9a05b] font-medium">
            Revenue : ₹{(payload[0].value / 100000).toFixed(1)}L
          </p>
        </div>
      );
    }
    return null;
  };

  const badgeClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80 capitalize";

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Delivered':
        return <div className={`${badgeClasses} bg-success/10 text-success`}>delivered</div>;
      case 'Shipped':
        return <div className={`${badgeClasses} bg-primary/10 text-primary`}>shipped</div>;
      case 'Processing':
        return <div className={`${badgeClasses} bg-warning/10 text-warning`}>processing</div>;
      case 'Confirmed':
        return <div className={`${badgeClasses} bg-info/10 text-info`}>confirmed</div>;
      case 'Cancelled':
        return <div className={`${badgeClasses} bg-destructive/10 text-destructive`}>cancelled</div>;
      default:
        return <div className={`${badgeClasses} bg-muted text-muted-foreground`}>{status.toLowerCase()}</div>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch(status) {
      case 'Paid':
        return <div className={`${badgeClasses} bg-success/10 text-success`}>paid</div>;
      case 'Pending':
        return <div className={`${badgeClasses} bg-warning/10 text-warning`}>pending</div>;
      case 'Failed':
        return <div className={`${badgeClasses} bg-destructive/10 text-destructive`}>failed</div>;
      default:
        return <div className={`${badgeClasses} bg-muted text-muted-foreground`}>{status.toLowerCase()}</div>;
    }
  };

  return (
    <div className="animate-fade-in pb-12">
      <AdminHeader 
        title="Dashboard" 
        description={undefined} // Will fallback to the formatted date in the component
      />
      
      <div className="p-6 space-y-6">
        
        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Orders */}
          <div className="rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-semibold text-foreground">{totalOrders}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/20 text-primary">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-semibold text-foreground">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="p-3 rounded-lg bg-success/20 text-success">
                <IndianRupee className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-3xl font-semibold text-foreground">{processingOrders}</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/20 text-warning">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Delivered */}
          <div className="rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md bg-gradient-to-br from-info/10 to-info/5 border-info/20">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-3xl font-semibold text-foreground">{deliveredOrders}</p>
              </div>
              <div className="p-3 rounded-lg bg-info/20 text-info">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Cancelled */}
          <div className="rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md bg-card border-border">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <p className="text-3xl font-semibold text-foreground">{cancelledOrders}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted text-muted-foreground">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
          
        </div>

        {/* Charts & Status Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
              <p className="text-sm text-muted-foreground">Monthly revenue for the last 6 months</p>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d9a05b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#d9a05b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value >= 100000 ? value / 100000 + 'L' : value / 1000 + 'K'}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#d9a05b" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-6">Order Status</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-sm text-foreground">Delivered</span>
                </div>
                <span className="font-semibold">{deliveredOrders}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-sm text-foreground">Shipped</span>
                </div>
                <span className="font-semibold">{shippedOrders}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                  <span className="text-sm text-foreground">Processing</span>
                </div>
                <span className="font-semibold">{processingOrders}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-sm text-foreground">Cancelled</span>
                </div>
                <span className="font-semibold">{cancelledOrders}</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Recent Orders Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
                <p className="text-sm text-muted-foreground">Latest 5 orders from your store</p>
              </div>
              <Link to="/admin/orders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors data-[state=selected]:bg-muted hover:bg-transparent">
                    <th className="h-12 px-4 text-left align-middle text-muted-foreground font-semibold">Order</th>
                    <th className="h-12 px-4 text-left align-middle text-muted-foreground font-semibold">Customer</th>
                    <th className="h-12 px-4 align-middle text-muted-foreground font-semibold text-right">Amount</th>
                    <th className="h-12 px-4 text-left align-middle text-muted-foreground font-semibold">Payment</th>
                    <th className="h-12 px-4 text-left align-middle text-muted-foreground font-semibold">Status</th>
                    <th className="h-12 px-4 text-left align-middle text-muted-foreground font-semibold">Date</th>
                    <th className="h-12 px-4 text-left align-middle text-muted-foreground font-semibold w-[50px]"></th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50 group">
                      <td className="p-4 align-middle font-medium text-foreground">
                        {order.id}
                      </td>
                      <td className="p-4 align-middle">
                        <div>
                          <p className="font-medium text-foreground">{order.address?.name}</p>
                          <p className="text-xs text-muted-foreground">{order.address?.phone}</p>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right font-semibold text-foreground">
                        {formatPrice(order.finalAmount || order.total || (order as any).totalAmount || (order as any).subtotal)}
                      </td>
                      <td className="px-6 py-4">
                        {getPaymentBadge(order.paymentStatus || 'Pending')}
                      </td>
                      <td className="p-4 align-middle">
                        {getStatusBadge(order.status || 'placed')}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground whitespace-nowrap">
                        {order.createdAt ? (typeof order.createdAt.toDate === 'function' ? order.createdAt.toDate().toLocaleDateString() : new Date(order.createdAt as any).toLocaleDateString()) : 'Unknown Date'}
                      </td>
                      <td className="p-4 align-middle">
                        <Link to={`/admin/orders?search=${order.id}`}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">No recent orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
