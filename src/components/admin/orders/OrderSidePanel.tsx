import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Package, MapPin, CreditCard, Truck, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types/order';


interface OrderSidePanelProps {
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  downloadInvoice: (order: Order) => Promise<void>;
}

const OrderSidePanel = ({ selectedOrder, setSelectedOrder, downloadInvoice }: OrderSidePanelProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  return (
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
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={async () => {
                      setIsDownloading(true);
                      try {
                        await downloadInvoice(selectedOrder);
                        // Refresh order from server if it generated a new URL
                        if (!selectedOrder.invoiceUrl) {
                          // we could invalidate queries here, but the user will get it on next refresh
                        }
                      } finally {
                        setIsDownloading(false);
                      }
                    }} 
                    disabled={isDownloading}
                    className="hidden sm:flex text-primary hover:text-primary border-primary hover:bg-primary/5"
                  >
                    {isDownloading ? (
                      <span className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isDownloading ? 'Generating...' : 'Invoice'}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)} className="rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-500" />
                  </Button>
                </div>
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
                      <div key={idx} className="flex gap-4 items-start bg-muted/20 p-2 rounded-lg border border-border/40">
                        <div className="w-16 h-16 rounded-md bg-muted border border-border overflow-hidden shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Box className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/products?product=${encodeURIComponent(item.slug)}`} 
                            className="font-semibold text-sm text-primary hover:underline line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-1">
                            Size: {item.sizeLabel} • Qty: {item.quantity}
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
                  <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border/40 space-y-0.5">
                    <p className="font-medium text-foreground uppercase tracking-wide text-sm">
                      {selectedOrder.address.name} 
                    </p>
                    <p className="font-medium text-foreground tracking-wide text-sm ">
                      {selectedOrder.address.phone} 
                    </p>
                    <p className="font-medium text-foreground tracking-wide text-sm ">
                      {selectedOrder.address.email} 
                    </p>
                    <div className="space-y-1 pt-2">
                      <p className="capitalize">
                        {selectedOrder.address.street}{selectedOrder.address.area ? `, ${selectedOrder.address.area}` : ''}
                      </p>
                      <p className="capitalize">
                        {selectedOrder.address.city}, {selectedOrder.address.state}, {selectedOrder.address.country} - {selectedOrder.address.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping Details (If applicable) */}
                {selectedOrder.shippingDetails && (selectedOrder.status === 'SHIPPED' || selectedOrder.status === 'DELIVERED') && (
                  <div className="border-t border-border/50 pt-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      Shipping Information
                    </h4>
                    <div className="text-sm text-muted-foreground bg-muted/20 px-3 py-2 rounded-lg border border-border/40 flex flex-col sm:flex-col gap-2">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Courier :</p>
                        <p className="font-medium text-foreground">{selectedOrder.shippingDetails.courierName}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 ">
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Tracking ID :</p>
                        <p className="font-medium text-foreground font-mono">{selectedOrder.shippingDetails.trackingId}</p>
                      </div>
                      {selectedOrder.shippingDetails.trackingLink && (
                        <div className="flex flex-col sm:flex-row gap-4">
                          <p className="text-sm font-semibold text-muted-foreground mb-1">Tracking Link :</p>
                          <a 
                            href={selectedOrder.shippingDetails.trackingLink} 
                            target="_blank" 
                            rel="noreferrer"
                            className="font-medium text-primary hover:underline line-clamp-1"
                          >
                            Track Order
                          </a>
                        </div>
                      )}
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
                        {(selectedOrder as Order).discount > 0 && (
                          <div className="flex justify-between items-center">
                            <p className="text-muted-foreground">Discount:</p>
                            <span className="font-medium text-green-600">-₹{(selectedOrder as Order).discount}</span>
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
  );
}

export default OrderSidePanel;