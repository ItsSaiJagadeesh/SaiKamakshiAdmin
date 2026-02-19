 import { motion } from 'framer-motion';
 import { Eye, MoreHorizontal } from 'lucide-react';
 import { Order } from '@/lib/mock-data';
 import { cn } from '@/lib/utils';
 import { Button } from '@/components/ui/button';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import { Badge } from '@/components/ui/badge';
 
 interface RecentOrdersTableProps {
   orders: Order[];
 }
 
 const statusStyles: Record<string, { bg: string; text: string }> = {
   placed: { bg: 'bg-muted', text: 'text-muted-foreground' },
   confirmed: { bg: 'bg-info/10', text: 'text-info' },
   processing: { bg: 'bg-warning/10', text: 'text-warning' },
   shipped: { bg: 'bg-primary/10', text: 'text-primary' },
   delivered: { bg: 'bg-success/10', text: 'text-success' },
   cancelled: { bg: 'bg-destructive/10', text: 'text-destructive' },
   returned: { bg: 'bg-destructive/10', text: 'text-destructive' },
 };
 
 const paymentStyles: Record<string, { bg: string; text: string }> = {
   pending: { bg: 'bg-warning/10', text: 'text-warning' },
   paid: { bg: 'bg-success/10', text: 'text-success' },
   failed: { bg: 'bg-destructive/10', text: 'text-destructive' },
 };
 
 export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
   const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('en-IN', {
       style: 'currency',
       currency: 'INR',
       maximumFractionDigits: 0,
     }).format(amount);
   };
 
   const formatDate = (dateString: string) => {
     return new Date(dateString).toLocaleDateString('en-IN', {
       day: 'numeric',
       month: 'short',
       year: 'numeric',
     });
   };
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.4, delay: 0.3 }}
       className="rounded-xl border border-border bg-card shadow-sm"
     >
       <div className="p-6 border-b border-border">
         <div className="flex items-center justify-between">
           <div>
             <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
             <p className="text-sm text-muted-foreground">Latest 10 orders from your store</p>
           </div>
           <Button variant="outline" size="sm">
             View All
           </Button>
         </div>
       </div>
 
       <div className="overflow-x-auto">
         <Table>
           <TableHeader>
             <TableRow className="hover:bg-transparent">
               <TableHead className="font-semibold">Order</TableHead>
               <TableHead className="font-semibold">Customer</TableHead>
               <TableHead className="font-semibold text-right">Amount</TableHead>
               <TableHead className="font-semibold">Payment</TableHead>
               <TableHead className="font-semibold">Status</TableHead>
               <TableHead className="font-semibold">Date</TableHead>
               <TableHead className="font-semibold w-[50px]"></TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {orders.map((order, index) => (
               <TableRow key={order.id} className="group">
                 <TableCell className="font-medium text-foreground">
                   {order.orderNumber}
                 </TableCell>
                 <TableCell>
                   <div>
                     <p className="font-medium text-foreground">{order.customer.name}</p>
                     <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                   </div>
                 </TableCell>
                 <TableCell className="text-right font-semibold text-foreground">
                   {formatCurrency(order.pricing.total)}
                 </TableCell>
                 <TableCell>
                   <Badge
                     variant="secondary"
                     className={cn(
                       'capitalize',
                       paymentStyles[order.payment.status].bg,
                       paymentStyles[order.payment.status].text
                     )}
                   >
                     {order.payment.status}
                   </Badge>
                 </TableCell>
                 <TableCell>
                   <Badge
                     variant="secondary"
                     className={cn(
                       'capitalize',
                       statusStyles[order.orderStatus].bg,
                       statusStyles[order.orderStatus].text
                     )}
                   >
                     {order.orderStatus}
                   </Badge>
                 </TableCell>
                 <TableCell className="text-muted-foreground">
                   {formatDate(order.createdAt)}
                 </TableCell>
                 <TableCell>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Eye className="h-4 w-4" />
                   </Button>
                 </TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
       </div>
     </motion.div>
   );
 }