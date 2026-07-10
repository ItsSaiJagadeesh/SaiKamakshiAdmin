import React, { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Input } from '@/components/ui/input';
import { Search, Package, CheckCircle2, Truck, XCircle, Filter, MapPin, CreditCard, Box, X, ChevronDown } from 'lucide-react';
import { useOrders, useUpdateOrderStatus } from '@/api/orders';
import { OrderCard } from '@/components/admin/orders/OrderCard';
import { OrderStatusModal } from '@/components/admin/orders/OrderStatusModal';
import { Order } from '@/types/order';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/api/payments`;

const formatPrice = (price?: number) => {
  if (price === undefined || isNaN(price)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

export default function OrdersPage() {
  const { data: orders = [], isLoading: isLoadingOrders } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();

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

  // Side Panel state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
          // If panel is open, optimistically update its status
          if (selectedOrder?.id === activeOrderId) {
            setSelectedOrder(prev => prev ? { ...prev, status } : null);
          }

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
    <div className="animate-fade-in pb-12 relative overflow-x-hidden min-h-screen">
      <AdminHeader 
        title="Orders" 
        description={undefined}
      />
      
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 p-6 shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Orders</p>
              <p className="text-3xl font-semibold text-foreground">{totalOrders}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Package className="h-6 w-6" />
            </div>
          </div>
          
          <div className="rounded-xl border bg-gradient-to-br from-success/10 to-success/5 border-success/20 p-6 shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Confirmed</p>
              <p className="text-3xl font-semibold text-foreground">{confirmedCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-success/20 flex items-center justify-center text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-xl border bg-gradient-to-br from-blue-400/10 to-blue-400/5 border-blue-400/20 p-6 shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Shipped</p>
              <p className="text-3xl font-semibold text-foreground">{shippedCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-400/20 flex items-center justify-center text-blue-500">
              <Truck className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-xl border bg-gradient-to-br from-rose-400/10 to-rose-400/5 border-rose-400/20 p-6 shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Cancelled</p>
              <p className="text-3xl font-semibold text-foreground">{cancelledCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-rose-400/20 flex items-center justify-center text-rose-500">
              <XCircle className="h-6 w-6" />
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
                onSelect={() => setSelectedOrder(order)}
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

      {/* Slide-out Side Panel using Framer Motion */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 border-l border-gray-200 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedOrder.createdAt 
                      ? (typeof selectedOrder.createdAt.toDate === 'function' 
                          ? selectedOrder.createdAt.toDate().toLocaleString() 
                          : 'Unknown Date')
                      : 'Unknown Date'}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)} className="rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </Button>
              </div>

              <div className="p-6 space-y-8">
                
                {/* 1. Order Items */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Order Items
                  </h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-start bg-muted/20 p-3 rounded-lg border border-border/40">
                        <div className="w-16 h-16 rounded-md bg-muted border border-border overflow-hidden shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.variantName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Box className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/admin/variants?search=${encodeURIComponent(item.variantName)}`} 
                            className="font-semibold text-sm text-primary hover:underline line-clamp-1"
                          >
                            {item.variantName}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-1">
                            Size: {item.size} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="font-medium text-sm text-foreground shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Delivery Address */}
                <div className="border-t border-border/50 pt-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Delivery Address
                  </h4>
                  <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border/40 space-y-1">
                    <p className="font-medium text-foreground uppercase tracking-wide text-sm mb-1">
                      {selectedOrder.address.name} <span className="text-muted-foreground lowercase">({selectedOrder.address.phone})</span>
                    </p>
                    <p className="capitalize">
                      {selectedOrder.address.street}{selectedOrder.address.area ? `, ${selectedOrder.address.area}` : ''}
                    </p>
                    <p className="capitalize">
                      {selectedOrder.address.city}, {selectedOrder.address.state}, {selectedOrder.address.country} - {selectedOrder.address.pincode}
                    </p>
                  </div>
                </div>

                {/* Shipping Details (If applicable) */}
                {selectedOrder.shippingDetails && (
                  <div className="border-t border-border/50 pt-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      Shipping Information
                    </h4>
                    <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border/40 flex flex-col sm:flex-row gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Courier</p>
                        <p className="font-medium text-foreground">{selectedOrder.shippingDetails.courierName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Tracking ID</p>
                        <p className="font-medium text-foreground font-mono">{selectedOrder.shippingDetails.trackingId}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Payment Info */}
                <div className="border-t border-border/50 pt-6 pb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Payment Information
                  </h4>
                  <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border/40">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">Payment Status</p>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                            selectedOrder.paymentStatus === 'Paid' ? "bg-green-100 text-green-700" :
                            selectedOrder.paymentStatus === 'Failed' ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {selectedOrder.paymentStatus || "PENDING"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">Coupon Applied</p>
                          <p className="font-medium text-foreground uppercase">{selectedOrder.coupon || "None"}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 bg-muted/10 p-3 rounded border border-border/30">
                        <div className="flex justify-between items-center">
                          <p className="text-muted-foreground">Subtotal:</p>
                          <span className="font-medium text-foreground">₹{selectedOrder.total}</span>
                        </div>
                        {(selectedOrder as any).discount > 0 && (
                          <div className="flex justify-between items-center">
                            <p className="text-muted-foreground">Discount:</p>
                            <span className="font-medium text-green-600">-₹{(selectedOrder as any).discount}</span>
                          </div>
                        )}
                        <div className="h-px bg-border my-2" />
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-foreground">Final Amount:</p>
                          <p className="font-bold text-lg text-foreground">₹{selectedOrder.finalAmount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
