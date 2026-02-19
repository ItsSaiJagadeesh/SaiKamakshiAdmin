 import { motion } from 'framer-motion';
 import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
 
 interface RevenueChartProps {
   data: { month: string; revenue: number }[];
 }
 
 export function RevenueChart({ data }: RevenueChartProps) {
   const formatCurrency = (value: number) => {
     return new Intl.NumberFormat('en-IN', {
       style: 'currency',
       currency: 'INR',
       notation: 'compact',
       maximumFractionDigits: 0,
     }).format(value);
   };
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.4, delay: 0.2 }}
       className="rounded-xl border border-border bg-card p-6 shadow-sm"
     >
       <div className="mb-6">
         <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
         <p className="text-sm text-muted-foreground">Monthly revenue for the last 6 months</p>
       </div>
 
       <div className="h-[280px]">
         <ResponsiveContainer width="100%" height="100%">
           <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
             <defs>
               <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0.3} />
                 <stop offset="95%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0} />
               </linearGradient>
             </defs>
             <CartesianGrid strokeDasharray="3 3" stroke="hsl(38, 20%, 88%)" vertical={false} />
             <XAxis
               dataKey="month"
               axisLine={false}
               tickLine={false}
               tick={{ fill: 'hsl(30, 10%, 45%)', fontSize: 12 }}
             />
             <YAxis
               axisLine={false}
               tickLine={false}
               tick={{ fill: 'hsl(30, 10%, 45%)', fontSize: 12 }}
               tickFormatter={formatCurrency}
             />
             <Tooltip
               contentStyle={{
                 backgroundColor: 'hsl(45, 50%, 98%)',
                 border: '1px solid hsl(38, 20%, 88%)',
                 borderRadius: '8px',
                 boxShadow: '0 4px 6px -1px hsl(30 20% 20% / 0.08)',
               }}
               formatter={(value: number) => [formatCurrency(value), 'Revenue']}
               labelStyle={{ color: 'hsl(30, 10%, 15%)', fontWeight: 600 }}
             />
             <Area
               type="monotone"
               dataKey="revenue"
               stroke="hsl(43, 74%, 49%)"
               strokeWidth={2}
               fill="url(#revenueGradient)"
             />
           </AreaChart>
         </ResponsiveContainer>
       </div>
     </motion.div>
   );
 }