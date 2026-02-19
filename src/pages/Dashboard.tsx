 import { ShoppingCart, IndianRupee, Clock, CheckCircle, XCircle } from 'lucide-react';
 import { StatsCard } from '@/components/admin/StatsCard';
 import { RecentOrdersTable } from '@/components/admin/RecentOrdersTable';
 import { RevenueChart } from '@/components/admin/RevenueChart';
 import { dashboardStats, mockOrders } from '@/lib/mock-data';
 
 export default function Dashboard() {
   const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('en-IN', {
       style: 'currency',
       currency: 'INR',
       maximumFractionDigits: 0,
     }).format(amount);
   };
 
   return (
     <div className="space-y-6">
       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <StatsCard
           title="Total Orders"
           value={dashboardStats.totalOrders}
           icon={ShoppingCart}
           trend={{ value: 12.5, isPositive: true }}
           variant="gold"
           delay={0}
         />
         <StatsCard
           title="Total Revenue"
           value={formatCurrency(dashboardStats.totalRevenue)}
           icon={IndianRupee}
           trend={{ value: dashboardStats.weeklyGrowth, isPositive: true }}
           variant="success"
           delay={0.05}
         />
         <StatsCard
           title="In Progress"
           value={dashboardStats.ordersInProgress}
           icon={Clock}
           variant="warning"
           delay={0.1}
         />
         <StatsCard
           title="Delivered"
           value={dashboardStats.deliveredOrders}
           icon={CheckCircle}
           variant="info"
           delay={0.15}
         />
         <StatsCard
           title="Cancelled"
           value={dashboardStats.cancelledOrders}
           icon={XCircle}
           variant="default"
           delay={0.2}
         />
       </div>
 
       {/* Charts and Tables */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
           <RevenueChart data={dashboardStats.monthlyRevenue} />
         </div>
         <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
           <h3 className="text-lg font-semibold text-foreground mb-4">Order Status</h3>
           <div className="space-y-4">
             {dashboardStats.ordersByStatus.map((item) => (
               <div key={item.status} className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div
                     className="w-3 h-3 rounded-full"
                     style={{ backgroundColor: item.color }}
                   />
                   <span className="text-sm text-foreground">{item.status}</span>
                 </div>
                 <span className="text-sm font-semibold text-foreground">{item.count}</span>
               </div>
             ))}
           </div>
         </div>
       </div>
 
       {/* Recent Orders */}
       <RecentOrdersTable orders={mockOrders} />
     </div>
   );
 }