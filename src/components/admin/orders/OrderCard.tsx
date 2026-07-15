import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Package, MapPin, CreditCard, Box, IndianRupee, Truck } from 'lucide-react';
import { Order } from '@/types/order';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn, statusDisable } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  onStatusChangeRequest: (orderId: string, newStatus: Order['status']) => void;
  onSelect: () => void;
  selected?: boolean;
  onToggleSelect?: (checked: boolean) => void;
}

const formatPrice = (price?: number) => {
  if (price === undefined || isNaN(price)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

export function OrderCard({ order, onStatusChangeRequest, onSelect, selected, onToggleSelect }: OrderCardProps) {

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
    <div 
      className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-4 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onSelect}
    >
      {/* Header - Always visible */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onToggleSelect && (
            <div onClick={e => e.stopPropagation()}>
              <Checkbox 
                checked={selected} 
                onCheckedChange={onToggleSelect} 
                className="w-5 h-5 rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>
          )}
          <div className="flex-1">
            <p className="text-foreground text-base ">Order #{order.id}</p>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-muted-foreground">Payment Status:</span>
            <span className={cn(
              "px-2 py-0.5 rounded-md",
              order.paymentStatus === 'Paid' ? "bg-green-100 text-green-700" :
              order.paymentStatus === 'Failed' ? "bg-red-100 text-red-700" :
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
                <SelectItem disabled={statusDisable(order.status,'CONFIRMED')} value="CONFIRMED" className="text-xs font-bold uppercase text-blue-700">Confirmed</SelectItem>
                <SelectItem disabled={statusDisable(order.status,'SHIPPED')} value="SHIPPED" className="text-xs font-bold uppercase text-purple-700">Shipped</SelectItem>
                <SelectItem disabled={statusDisable(order.status,'DELIVERED')} value="DELIVERED" className="text-xs font-bold uppercase text-green-700">Delivered</SelectItem>
                <SelectItem disabled={statusDisable(order.status,'CANCELLED')} value="CANCELLED" className="text-xs font-bold uppercase text-red-700">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="font-semibold text-foreground min-w-[80px] text-right flex items-center gap-1 justify-end">
            <IndianRupee className="w-4 h-4 text-muted-foreground" />
            {formatPrice(order.finalAmount || order.total ).replace('₹', '')}
          </div>

          <motion.div className="text-muted-foreground ml-2">
            <ChevronDown className="h-5 w-5 -rotate-90" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
