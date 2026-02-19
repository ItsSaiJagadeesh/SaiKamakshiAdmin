 import { motion } from 'framer-motion';
 import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface StatsCardProps {
   title: string;
   value: string | number;
   icon: LucideIcon;
   trend?: { value: number; isPositive: boolean };
   variant?: 'default' | 'gold' | 'success' | 'warning' | 'info';
   delay?: number;
 }
 
 const variantStyles = {
   default: 'bg-card border-border',
   gold: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20',
   success: 'bg-gradient-to-br from-success/10 to-success/5 border-success/20',
   warning: 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20',
   info: 'bg-gradient-to-br from-info/10 to-info/5 border-info/20',
 };
 
 const iconStyles = {
   default: 'bg-muted text-muted-foreground',
   gold: 'bg-primary/20 text-primary',
   success: 'bg-success/20 text-success',
   warning: 'bg-warning/20 text-warning',
   info: 'bg-info/20 text-info',
 };
 
 export function StatsCard({ title, value, icon: Icon, trend, variant = 'default', delay = 0 }: StatsCardProps) {
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.4, delay }}
       className={cn(
         'rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md',
         variantStyles[variant]
       )}
     >
       <div className="flex items-start justify-between">
         <div className="space-y-3">
           <p className="text-sm font-medium text-muted-foreground">{title}</p>
           <p className="text-3xl font-semibold text-foreground">{value}</p>
           {trend && (
             <div className="flex items-center gap-1">
               {trend.isPositive ? (
                 <TrendingUp className="h-4 w-4 text-success" />
               ) : (
                 <TrendingDown className="h-4 w-4 text-destructive" />
               )}
               <span className={cn('text-sm font-medium', trend.isPositive ? 'text-success' : 'text-destructive')}>
                 {trend.isPositive ? '+' : ''}{trend.value}%
               </span>
               <span className="text-xs text-muted-foreground">vs last week</span>
             </div>
           )}
         </div>
         <div className={cn('p-3 rounded-lg', iconStyles[variant])}>
           <Icon className="h-6 w-6" />
         </div>
       </div>
     </motion.div>
   );
 }