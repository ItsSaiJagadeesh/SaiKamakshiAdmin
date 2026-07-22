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
import { downloadAllInvoices, downloadInvoice } from '@/utils/generateInvoice';


import { Download, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { CreateOrderPanel } from '@/components/admin/orders/CreateOrderPanel';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import OrderSidePanel from '@/components/admin/orders/OrderSidePanel';


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
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [proposedStatus, setProposedStatus] = useState<Order['status'] | null>(null);

  // Side Panel state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Bulk Selection state
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  // Create Order Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Invoice download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

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
        if (dateRange?.from) {
          const startDate = new Date(dateRange.from);
          startDate.setHours(0, 0, 0, 0);
          if (startDate > orderDate) return false;
        }
        if (dateRange?.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          if (endDate < orderDate) return false;
        }
      }
    } else if (dateFilter !== 'ALL' && !order.createdAt) {
      return false; // exclude orders with no date if a filter is set
    }

    return true;
  });

  // Sort: Selected orders first, then original order (which is descending by date)
  const sortedFilteredOrders = [...filteredOrders].sort((a, b) => {
    const aSelected = selectedOrderIds.has(a.id!);
    const bSelected = selectedOrderIds.has(b.id!);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  // Pagination Logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedFilteredOrders.length / itemsPerPage);
  const paginatedOrders = sortedFilteredOrders.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const toggleOrderSelection = (orderId: string, checked: boolean) => {
    const newSet = new Set(selectedOrderIds);
    if (checked) {
      newSet.add(orderId);
    } else {
      newSet.delete(orderId);
    }
    setSelectedOrderIds(newSet);
  };

  const handleStatusChangeRequest = (orderId: string, newStatus: Order['status']) => {
    setActiveOrderId(orderId);
    setProposedStatus(newStatus);
    setModalOpen(true);
  };

  const handleConfirmStatusChange = async (
    status: Order['status'], 
    extraDetails?: { 
      shippingDetails?: { courierName: string, trackingId: string, trackingLink?: string }
    }
  ) => {
    if (!activeOrderId) return;
    
    const order = orders.find(o => o.id === activeOrderId);

    if (!order) {
      return;
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
        <div className="flex flex-col xl:flex-col gap-4 mb-6 justify-between items-start ">
          <div className=" flex flex-col sm:flex-row gap-4 w-full  flex-1">
            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto flex-1">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by Order ID, Name or Phone..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border h-11 focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              {selectedOrderIds.size > 0 && (
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    setIsDownloadingAll(true);
                    try {
                      const selected = sortedFilteredOrders.filter(o => selectedOrderIds.has(o.id!));
                      await downloadAllInvoices(selected);
                    } finally {
                      setIsDownloadingAll(false);
                    }
                  }}
                  disabled={isDownloadingAll}
                  className="h-11 border-primary text-primary hover:bg-primary/5"
                >
                  {isDownloadingAll ? (
                    <span className="flex items-center">
                      <span className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                      Generating...
                    </span>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download {selectedOrderIds.size} Invoice{selectedOrderIds.size > 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              )}
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="h-11 bg-[#b98d4d] hover:bg-[#a67d43] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 xl:mt-0">
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={`h-11 bg-card border-border justify-start text-left font-normal ${!dateRange ? 'text-muted-foreground' : ''}`}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(r) => { setDateRange(r); setCurrentPage(1); }}
                      numberOfMonths={2}
                      classNames={{
                        day_selected: "bg-[#b98d4d] text-white hover:bg-[#b98d4d] hover:text-white focus:bg-[#b98d4d] focus:text-white",
                        day_range_middle: "aria-selected:bg-[#b98d4d]/20 aria-selected:text-[#b98d4d]"
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
          )}
          </div>
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
                selected={selectedOrderIds.has(order.id!)}
                onToggleSelect={(checked) => toggleOrderSelection(order.id!, checked)}
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
      <OrderSidePanel selectedOrder={selectedOrder}  setSelectedOrder={setSelectedOrder} downloadInvoice={downloadInvoice}/>

      <CreateOrderPanel 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
