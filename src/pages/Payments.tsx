 import { useState } from 'react';
 import { motion } from 'framer-motion';
 import { Search, CreditCard, CheckCircle, XCircle, Clock, RefreshCcw } from 'lucide-react';
 import { Payment, mockPayments } from '@/lib/mock-data';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Badge } from '@/components/ui/badge';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import { cn } from '@/lib/utils';
 
 const statusIcons = {
   pending: Clock,
   success: CheckCircle,
   failed: XCircle,
   refunded: RefreshCcw,
 };
 
 const statusStyles = {
   pending: { bg: 'bg-warning/10', text: 'text-warning' },
   success: { bg: 'bg-success/10', text: 'text-success' },
   failed: { bg: 'bg-destructive/10', text: 'text-destructive' },
   refunded: { bg: 'bg-info/10', text: 'text-info' },
 };
 
 export default function Payments() {
   const [payments] = useState<Payment[]>(mockPayments);
   const [searchQuery, setSearchQuery] = useState('');
   const [statusFilter, setStatusFilter] = useState<string>('all');
 
   const filteredPayments = payments.filter((payment) => {
     const matchesSearch = payment.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
     return matchesSearch && matchesStatus;
   });
 
   const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('en-IN', {
       style: 'currency',
       currency: 'INR',
       maximumFractionDigits: 0,
     }).format(amount);
   };
 
   const formatDate = (dateString?: string) => {
     if (!dateString) return '-';
     return new Date(dateString).toLocaleDateString('en-IN', {
       day: 'numeric',
       month: 'short',
       year: 'numeric',
       hour: '2-digit',
       minute: '2-digit',
     });
   };
 
   const totalRevenue = filteredPayments
     .filter((p) => p.status === 'success')
     .reduce((sum, p) => sum + p.amount, 0);
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h2 className="text-lg font-semibold text-foreground">Payment History</h2>
           <p className="text-sm text-muted-foreground">
             {filteredPayments.length} transactions • Total: {formatCurrency(totalRevenue)}
           </p>
         </div>
       </div>
 
       {/* Stats Cards */}
       <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="p-4 rounded-xl border border-border bg-card"
         >
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-success/10">
               <CheckCircle className="h-5 w-5 text-success" />
             </div>
             <div>
               <p className="text-xs text-muted-foreground">Successful</p>
               <p className="text-lg font-semibold text-foreground">
                 {payments.filter((p) => p.status === 'success').length}
               </p>
             </div>
           </div>
         </motion.div>
         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.05 }}
           className="p-4 rounded-xl border border-border bg-card"
         >
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-warning/10">
               <Clock className="h-5 w-5 text-warning" />
             </div>
             <div>
               <p className="text-xs text-muted-foreground">Pending</p>
               <p className="text-lg font-semibold text-foreground">
                 {payments.filter((p) => p.status === 'pending').length}
               </p>
             </div>
           </div>
         </motion.div>
         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="p-4 rounded-xl border border-border bg-card"
         >
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-destructive/10">
               <XCircle className="h-5 w-5 text-destructive" />
             </div>
             <div>
               <p className="text-xs text-muted-foreground">Failed</p>
               <p className="text-lg font-semibold text-foreground">
                 {payments.filter((p) => p.status === 'failed').length}
               </p>
             </div>
           </div>
         </motion.div>
         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.15 }}
           className="p-4 rounded-xl border border-border bg-card"
         >
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10">
               <CreditCard className="h-5 w-5 text-primary" />
             </div>
             <div>
               <p className="text-xs text-muted-foreground">Total Volume</p>
               <p className="text-lg font-semibold text-foreground">{formatCurrency(totalRevenue)}</p>
             </div>
           </div>
         </motion.div>
       </div>
 
       {/* Filters */}
       <div className="flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1 max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder="Search by order number..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-10"
           />
         </div>
         <Select value={statusFilter} onValueChange={setStatusFilter}>
           <SelectTrigger className="w-[160px]">
             <SelectValue placeholder="All Status" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All Status</SelectItem>
             <SelectItem value="success">Successful</SelectItem>
             <SelectItem value="pending">Pending</SelectItem>
             <SelectItem value="failed">Failed</SelectItem>
             <SelectItem value="refunded">Refunded</SelectItem>
           </SelectContent>
         </Select>
       </div>
 
       {/* Payments Table */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
       >
         <Table>
           <TableHeader>
             <TableRow className="hover:bg-transparent">
               <TableHead className="font-semibold">Order</TableHead>
               <TableHead className="font-semibold">Payment ID</TableHead>
               <TableHead className="font-semibold">Method</TableHead>
               <TableHead className="font-semibold text-right">Amount</TableHead>
               <TableHead className="font-semibold">Status</TableHead>
               <TableHead className="font-semibold">Date</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {filteredPayments.map((payment) => {
               const StatusIcon = statusIcons[payment.status];
               return (
                 <TableRow key={payment.id} className="group">
                   <TableCell className="font-medium text-foreground">
                     {payment.orderNumber}
                   </TableCell>
                   <TableCell className="text-muted-foreground font-mono text-xs">
                     {payment.razorpay?.paymentId || '-'}
                   </TableCell>
                   <TableCell>
                     <Badge variant="outline" className="capitalize">
                       {payment.method}
                     </Badge>
                   </TableCell>
                   <TableCell className="text-right font-semibold text-foreground">
                     {formatCurrency(payment.amount)}
                   </TableCell>
                   <TableCell>
                     <Badge
                       variant="secondary"
                       className={cn(
                         'capitalize',
                         statusStyles[payment.status]?.bg,
                         statusStyles[payment.status]?.text
                       )}
                     >
                       <StatusIcon className="h-3 w-3 mr-1" />
                       {payment.status}
                     </Badge>
                   </TableCell>
                   <TableCell className="text-muted-foreground">
                     {formatDate(payment.paidAt || payment.createdAt)}
                   </TableCell>
                 </TableRow>
               );
             })}
           </TableBody>
         </Table>
       </motion.div>
     </div>
   );
 }