import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Order } from '@/types/order';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    status: Order['status'], 
    extraDetails?: { 
      shippingDetails?: { courierName: string, trackingId: string, trackingLink?: string }
    }
  ) => void;
  newStatus: Order['status'] | null;
  isLoading?: boolean;
}

export function OrderStatusModal({ isOpen, onClose, onConfirm, newStatus, isLoading }: OrderStatusModalProps) {
  const [courierName, setCourierName] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [trackingLink, setTrackingLink] = useState('');

  // Reset local state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCourierName('');
      setTrackingId('');
      setTrackingLink('');
    }
  }, [isOpen]);

  if (!isOpen || !newStatus) return null;

  const statusUpperCase = newStatus.toUpperCase();
  const isShipping = statusUpperCase === 'SHIPPED';

  const handleConfirm = () => {
    onConfirm(newStatus, {
      shippingDetails: isShipping ? { courierName, trackingId, trackingLink } : undefined
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
          className="relative bg-card w-full max-w-md rounded-xl shadow-lg border border-border overflow-hidden z-10 m-4"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-xl font-semibold">
                {isShipping ? 'Shipping Details' : 'Confirm Status Change'}
              </h2>
              <button 
                title='close'
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isShipping ? (
              <div className="space-y-4">
                <Input 
                  placeholder="Courier Name" 
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  disabled={isLoading}
                />
                <Input 
                  placeholder="Tracking ID" 
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  disabled={isLoading}
                />
                <Input 
                  placeholder="Tracking Link (Optional)" 
                  value={trackingLink}
                  onChange={(e) => setTrackingLink(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            ) : (
              <p className="text-foreground text-lg mb-8">
                Change order status to <span className="font-bold text-primary uppercase">{newStatus}</span>?
              </p>
            )}

            <div className="flex justify-end gap-3 mt-8">
              <Button 
                variant="ghost" 
                onClick={onClose}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={isLoading || (isShipping && (!courierName || !trackingId))}
                className="bg-[#b98d4d] hover:bg-[#a67d43] text-white"
              >
                {isLoading 
                  ? 'Saving...' 
                  : isShipping 
                    ? 'Mark as Shipped' 
                    : 'Confirm'
                }
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
