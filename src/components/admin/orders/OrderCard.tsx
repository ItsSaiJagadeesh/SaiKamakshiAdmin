import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Package, MapPin, CreditCard, Box, IndianRupee, Truck } from 'lucide-react';
import { Order } from '@/types/order';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  onStatusChangeRequest: (orderId: string, newStatus: Order['status']) => void;
}

const formatPrice = (price?: number) => {
  if (price === undefined || isNaN(price)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

export function OrderCard({ order, onStatusChangeRequest }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date safely
  const formattedDate = order.createdAt 
    ? (typeof order.createdAt.toDate === 'function' 
        ? format(order.createdAt.toDate(), 'EEE MMM dd yyyy') 
        : 'Unknown Date')
    : 'Unknown Date';

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SHIPPED': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      case 'PENDING':
      case 'PLACED': 
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const handleStatusChange = (val: string) => {
    // Only trigger if changing to a new status
    if (val.toUpperCase() !== order.status?.toUpperCase()) {
      onStatusChangeRequest(order.id!, val as Order['status']);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-4">
      {/* Header - Always visible */}
      <div 
        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <p className="text-foreground text-base ">Order #{order.id}</p>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-muted-foreground">Payment Status:</span>
            <span className={cn(
              "px-2 py-0.5 rounded-md",
              order.paymentStatus === 'Paid' ? "bg-green-100 text-green-700" :
              order.paymentStatus === 'Failed' ? "bg-red-100 text-red-700" :
              order.paymentStatus === 'Refunded' ? "bg-slate-100 text-slate-700" :
              "bg-amber-100 text-amber-700"
            )}>
              {order.paymentStatus || "PENDING"}
            </span>
          </div>

          <div className="w-[140px]">
            <Select value={order.status?.toUpperCase() || 'PENDING'} onValueChange={handleStatusChange}>
              <SelectTrigger className={`h-8 text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                <SelectValue placeholder={order.status ? order.status.toUpperCase() : 'PENDING'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLACED" className="text-xs font-bold uppercase text-yellow-700">Placed</SelectItem>
                <SelectItem value="CONFIRMED" className="text-xs font-bold uppercase text-blue-700">Confirmed</SelectItem>
                <SelectItem value="SHIPPED" className="text-xs font-bold uppercase text-purple-700">Shipped</SelectItem>
                <SelectItem value="DELIVERED" className="text-xs font-bold uppercase text-green-700">Delivered</SelectItem>
                <SelectItem value="CANCELLED" className="text-xs font-bold uppercase text-red-700">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="font-semibold text-foreground min-w-[80px] text-right flex items-center gap-1 justify-end">
            <IndianRupee className="w-4 h-4 text-muted-foreground" />
            {formatPrice(order.finalAmount || order.total || (order as any).totalAmount || (order as any).subtotal).replace('₹', '')}
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-muted-foreground ml-2"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </div>
      </div>

      {/* Expanded Content with Framer Motion */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-border mt-4 flex flex-col gap-6">
              
              {/* 1. Order Items */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Order Items
                </h4>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
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
              <div className="border-t border-border/50 pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Delivery Address
                </h4>
                <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border/40 space-y-1">
                  <p className="font-medium text-foreground uppercase tracking-wide text-sm mb-1">
                    {order.address.name} <span className="text-muted-foreground lowercase">({order.address.phone})</span>
                  </p>
                  <p className="capitalize">
                    {order.address.street}{order.address.area ? `, ${order.address.area}` : ''}
                  </p>
                  <p className="capitalize">
                    {order.address.city}, {order.address.state}, {order.address.country} - {order.address.pincode}
                  </p>
                </div>
              </div>

              {/* Shipping Details (If applicable) */}
              {order.shippingDetails && (
                <div className="border-t border-border/50 pt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    Shipping Information
                  </h4>
                  <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border/40 flex flex-col sm:flex-row gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Courier</p>
                      <p className="font-medium text-foreground">{order.shippingDetails.courierName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Tracking ID</p>
                      <p className="font-medium text-foreground font-mono">{order.shippingDetails.trackingId}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Payment Info */}
              <div className="border-t border-border/50 pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Payment Information
                </h4>
                <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between sm:block">
                        <p className="text-xs text-muted-foreground mb-1">Payment ID</p>
                        <p className="font-medium text-foreground font-mono">{order.id}</p>
                      </div>
                      <div className="flex justify-between sm:block">
                        <p className="text-xs text-muted-foreground mb-1">Coupon Applied</p>
                        <p className="font-medium text-foreground uppercase">{order.coupon || "None"}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 bg-muted/10 p-3 rounded border border-border/30">
                      <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Subtotal:</p>
                        <span className="font-medium text-foreground">₹{order.total}</span>
                      </div>
                      {(order as any).discount > 0 && (
                        <div className="flex justify-between items-center">
                          <p className="text-muted-foreground">Discount:</p>
                          <span className="font-medium text-success">-₹{(order as any).discount}</span>
                        </div>
                      )}
                      <div className="h-px bg-border my-2" />
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-foreground">Final Amount:</p>
                        <p className="font-bold text-lg text-foreground">₹{order.finalAmount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
