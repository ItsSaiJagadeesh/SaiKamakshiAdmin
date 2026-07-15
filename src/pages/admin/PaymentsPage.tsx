import React, { useState } from 'react';
import { usePayments } from '@/api/payments';
import { Payment } from '@/types/payment';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  CreditCard
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function PaymentsPage() {
  const { data: payments = [], isLoading } = usePayments();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Date Filters
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    // 1. Search Filter (by Order ID or Payment ID)
    const query = searchQuery.toLowerCase();
    const orderMatch = payment.orderId?.toLowerCase().includes(query);
    const paymentMatch = payment.paymentId?.toLowerCase().includes(query);
    const razorpayMatch = payment.CashFreePaymentId?.toLowerCase().includes(query);
    
    if (query && !orderMatch && !paymentMatch && !razorpayMatch) return false;

    // 2. Status Filter
    if (statusFilter !== 'ALL' && payment.status?.toUpperCase() !== statusFilter) return false;

    // 3. Date Filter
    if (dateFilter !== 'ALL' && payment.createdAt) {
      const paymentDate = typeof payment.createdAt.toDate === 'function' ? payment.createdAt.toDate() : new Date(payment.createdAt as any);
      const now = new Date();
      
      if (dateFilter === 'TODAY') {
        if (paymentDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'PAST_10_DAYS') {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(now.getDate() - 10);
        if (paymentDate < tenDaysAgo) return false;
      } else if (dateFilter === 'LAST_MONTH') {
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);
        if (paymentDate < lastMonth) return false;
      } else if (dateFilter === 'LAST_YEAR') {
        const lastYear = new Date();
        lastYear.setFullYear(now.getFullYear() - 1);
        if (paymentDate < lastYear) return false;
      } else if (dateFilter === 'CUSTOM') {
        if (customStartDate) {
          const startDate = new Date(customStartDate);
          startDate.setHours(0, 0, 0, 0);
          if (startDate > paymentDate) return false;
        }
        if (customEndDate) {
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
          if (endDate < paymentDate) return false;
        }
      }
    } else if (dateFilter !== 'ALL' && !payment.createdAt) {
      return false; // exclude if no date and filter is active
    }

    return true;
  });

  // Calculate Stats
  const successfulPayments = payments.filter(p => p.status === 'Successful');
  const pendingPayments = payments.filter(p => p.status === 'Pending');
  const failedPayments = payments.filter(p => p.status === 'Failed');
  const totalVolume = successfulPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const formatPrice = (price?: number) => {
    if (price === undefined || isNaN(price)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status: Payment['status']) => {
    switch (status) {
      case 'Successful':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Success
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-12">
      {/* Header */}
      <AdminHeader
              title="Payments" 
              description={undefined}
      />
      <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Successful */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Successful</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{successfulPayments.length}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{pendingPayments.length}</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Failed */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Failed</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{failedPayments.length}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-lg text-red-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Total Volume */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{formatPrice(totalVolume)}</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by order or payment ID..." 
            className="pl-9 h-11 bg-card border-border w-full"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="w-full sm:w-[200px] shrink-0">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-11 bg-card border-border">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="All Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="SUCCESSFUL">Successful</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[200px] shrink-0">
          <Select value={dateFilter} onValueChange={(v) => { setDateFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-11 bg-card border-border">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Date Filter" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Time</SelectItem>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="PAST_10_DAYS">Past 10 Days</SelectItem>
              <SelectItem value="LAST_MONTH">Last Month</SelectItem>
              <SelectItem value="LAST_YEAR">Last Year</SelectItem>
              <SelectItem value="CUSTOM">Custom Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateFilter === 'CUSTOM' && (
          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              className="h-11 bg-card border-border" 
              value={customStartDate} 
              onChange={(e) => { setCustomStartDate(e.target.value); setCurrentPage(1); }} 
            />
            <span className="text-muted-foreground">to</span>
            <Input 
              type="date" 
              className="h-11 bg-card border-border" 
              value={customEndDate} 
              onChange={(e) => { setCustomEndDate(e.target.value); setCurrentPage(1); }} 
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Payment ID</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {payment.orderId.toUpperCase().slice(0, 12)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {payment.CashFreePaymentId || payment.transactionId || payment.paymentId.slice(0, 16) + "..."}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded border border-border bg-muted/50 text-xs font-medium">
                      {payment.method === 'CASHFREE' ? 'Cashfree' : payment.method === 'MANUAL' ? 'Manual' : 'COD'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {formatPrice(payment.amount)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {payment.createdAt 
                      ? (typeof payment.createdAt.toDate === 'function' ? format(payment.createdAt.toDate(), 'd MMM yyyy, hh:mm a') : format(new Date(payment.createdAt as any), 'd MMM yyyy, hh:mm a'))
                      : 'Unknown Date'}
                  </td>
                </tr>
              ))}
              {paginatedPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controller */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="font-bold"
          >
            &lt;
          </Button>
          <span className="text-sm font-semibold text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="font-bold"
          >
            &gt;
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
