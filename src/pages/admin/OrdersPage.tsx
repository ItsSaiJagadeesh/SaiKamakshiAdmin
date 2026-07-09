import React, { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Input } from '@/components/ui/input';
import { Search, Package, CheckCircle2, Truck, XCircle, Filter } from 'lucide-react';
import { useOrders, useUpdateOrderStatus } from '@/api/orders';
import { OrderCard } from '@/components/admin/orders/OrderCard';
import { OrderStatusModal } from '@/components/admin/orders/OrderStatusModal';
import { Order } from '@/types/order';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router-dom';

const BACKEND_URL = "http://localhost:5001/api/payments";

export default function OrdersPage() {
  const { data: orders = [], isLoading: isLoadingOrders } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();
  console.log(orders);

  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Date Filters
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [proposedStatus, setProposedStatus] = useState<Order['status'] | null>(null);

  // Compute stats
  const totalOrders = orders.length;
  const confirmedCount = orders.filter(o => o.status?.toUpperCase() === 'CONFIRMED').length;
  const shippedCount = orders.filter(o => o.status?.toUpperCase() === 'SHIPPED').length;
  const cancelledCount = orders.filter(o => o.status?.toUpperCase() === 'CANCELLED').length;

  const filteredOrders = orders.filter(order => {
    // 1. Check Status
    if (statusFilter !== 'ALL' && order.status?.toUpperCase() !== statusFilter) {
      return false;
    }

    // 2. Check Search
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const idMatch = order.id?.toLowerCase().includes(query);
    const nameMatch = order.address?.name?.toLowerCase().includes(query);
    const phoneMatch = order.address?.phone?.includes(query);
    
    if (!idMatch && !nameMatch && !phoneMatch) return false;

    // 3. Date Filter
    if (dateFilter !== 'ALL' && order.createdAt) {
      const orderDate = typeof order.createdAt.toDate === 'function' ? order.createdAt.toDate() : new Date(order.createdAt as any);
      const now = new Date();
      
      if (dateFilter === 'TODAY') {
        if (orderDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'PAST_10_DAYS') {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(now.getDate() - 10);
        if (orderDate < tenDaysAgo) return false;
      } else if (dateFilter === 'LAST_MONTH') {
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);
        if (orderDate < lastMonth) return false;
      } else if (dateFilter === 'LAST_YEAR') {
        const lastYear = new Date();
        lastYear.setFullYear(now.getFullYear() - 1);
        if (orderDate < lastYear) return false;
      } else if (dateFilter === 'CUSTOM') {
        if (customStartDate) {
          const startDate = new Date(customStartDate);
          startDate.setHours(0, 0, 0, 0);
          if (startDate > orderDate) return false;
        }
        if (customEndDate) {
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
          if (endDate < orderDate) return false;
        }
      }
    } else if (dateFilter !== 'ALL' && !order.createdAt) {
      return false; // exclude orders with no date if a filter is set
    }

    return true;
  });

  // Pagination Logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handleStatusChangeRequest = (orderId: string, newStatus: Order['status']) => {
    setActiveOrderId(orderId);
    setProposedStatus(newStatus);
    setModalOpen(true);
  };

  const handleConfirmStatusChange = async (
    status: Order['status'], 
    extraDetails?: { 
      shippingDetails?: { courierName: string, trackingId: string },
      workProgressDetails?: string,
      expectedShipmentDate?: string,
      expectedDeliveryDate?: string,
      cancellationReason?: string
    }
  ) => {
    if (!activeOrderId) return;
    
    const order = orders.find(o => o.id === activeOrderId);

    if (status === 'DELIVERED' && order?.deliveryOtp) {
      const otp = window.prompt("This is a COD order. Please enter the 6-digit Delivery OTP provided by the customer:");
      if (!otp) return;
      
      try {
        const res = await fetch(`${BACKEND_URL}/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: activeOrderId, otp })
        });
        const data = await res.json();
        if (!data.success) {
          alert("Invalid OTP! Cannot deliver.");
          return;
        }
      } catch (err) {
        alert("Error verifying OTP.");
        return;
      }
    }

    updateStatusMutation.mutate(
      { id: activeOrderId, status, ...extraDetails },
      { 
        onSuccess: async () => {
          setModalOpen(false);
          if (status === 'SHIPPED' && order?.paymentStatus === 'Pending') {
            await fetch(`${BACKEND_URL}/generate-otp`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: activeOrderId })
            }).catch(console.error);
          }
        }
      }
    );
  };

  return (
    <div className="animate-fade-in pb-12">
      <AdminHeader 
        title="Orders" 
        description={undefined}
      />
      
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl border border-border bg-yellow-50/50 p-6 shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Orders</p>
              <p className="text-3xl font-semibold text-foreground">{totalOrders}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          
          <div className="rounded-xl border border-border bg-green-50/50 p-6 shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Confirmed</p>
              <p className="text-3xl font-semibold text-foreground">{confirmedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-blue-50/50 p-6 shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Shipped</p>
              <p className="text-3xl font-semibold text-foreground">{shippedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Truck className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-red-50/50 p-6 shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Cancelled</p>
              <p className="text-3xl font-semibold text-foreground">{cancelledCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Order ID, Name or Phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border h-11 focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>

          <div className="w-full sm:w-[200px] shrink-0">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-11 bg-card border-border">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PLACED">Placed</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
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

        {/* Orders List */}
        {isLoadingOrders ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse border border-border" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center mt-6">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No orders found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              {searchQuery 
                ? "We couldn't find any orders matching your search." 
                : "No orders have been placed yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onStatusChangeRequest={handleStatusChangeRequest}
              />
            ))}

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
        )}
      </div>

      {/* Confirmation & Shipping Details Modal */}
      <OrderStatusModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        newStatus={proposedStatus}
        onConfirm={handleConfirmStatusChange}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
}
