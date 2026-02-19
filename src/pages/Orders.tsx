
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Truck,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { LayoutGroup } from "framer-motion";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { StatsCard } from "@/components/admin/StatsCard";
import { fetchAllOrders, onSnapshotOrders, updateOrderStatus } from "@/services/orders.service";
import { CartItem, Order } from "@/types/orders";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState(false);
  const [shippingDialog, setShippingDialog] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order>(null);
  const [nextStatus, setNextStatus] = useState<string>("");

  const [shipping, setShipping] = useState({
    courier: "",
    trackingId: "",
  });

  useEffect(() => {
    const unsubscribe = onSnapshotOrders(setOrders);

    // cleanup on unmount
    return () => unsubscribe();
  }, []);



  const stats = {
    totalOrders: orders.length,
    confirmed: orders.filter(o => o.status == "CONFIRMED").length,
    shipped: orders.filter(o => o.status === "SHIPPED").length,
    cancelled: orders.filter(o => o.status === "CANCELLED").length,
  };

  const toggle = (id: string) =>
    setOpenOrderId(prev => (prev === id ? null : id));

  const handleStatusClick = (order: Order, status: string) => {
    setSelectedOrder(order);
    setNextStatus(status);

    if (status === "SHIPPED") {
      setShippingDialog(true);
    } else {
      setConfirmDialog(true);
    }
  };

  const confirmStatusUpdate = async () => {
    await updateOrderStatus(selectedOrder.id, nextStatus);
    setConfirmDialog(false);
  };

  const confirmShipping = async () => {
    await updateOrderStatus(
      selectedOrder.id,
      "SHIPPED",
      shipping
    );
    setShippingDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 space-y-6">

        {/* STATS */}
        <div className="sticky top-32 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-background">
          <StatsCard title="Total Orders" value={stats.totalOrders} icon={Package} variant="gold" />
          <StatsCard title="Confirmed" value={stats.confirmed} icon={CheckCircle} variant="success" />
          <StatsCard title="Shipped" value={stats.shipped} icon={Truck} variant="info" />
          <StatsCard title="Cancelled" value={stats.cancelled} icon={XCircle} variant="warning" />
        </div>

        {/* ORDERS */}
        {orders.map(order => {
          const isOpen = openOrderId === order.id;

          return (
            <Card key={order.id} className="p-4 space-y-4">
              <LayoutGroup>
                {/* HEADER */}
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggle(order.id)}
                >
                  <div>
                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt.seconds * 1000).toDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{order.payment.method}</Badge>

                    {/* STATUS BADGE → DROPDOWN */}
                    <Select
                      value={order.status}
                      onValueChange={(v) =>
                        handleStatusClick(order, v)
                      }
                    >
                      <SelectTrigger className="w-auto border-none p-0">
                        <Button
                          variant="ghost"
                          className="h-auto px-2 py-1"
                        >
                          <Badge className={statusStyles[order.status]}>
                            {order.status}
                          </Badge>
                        </Button>
                      </SelectTrigger>

                      <SelectContent>
                        {Object.keys(statusStyles).map(s => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="font-semibold">₹{order.subtotal}</span>
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>

                {/* EXPANDED */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t pt-4 space-y-4"
                    >
                      {/* ITEMS */}
                      {order.items.map((item: CartItem) => (
                        <div key={item.variantId} className="flex gap-4">
                          <img alt={item.variantName} src={item.image} className="w-16 h-16 rounded-md" />
                          <div className="flex-1">
                            <p className="font-medium">{item.variantName}</p>
                            <p className="text-sm text-muted-foreground">
                              Size: {item.size} • Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      ))}
                      {/* ADDRESS */}
                      <div className="space-y-1">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          Delivery Address
                        </h3>
                        <p className="text-sm">
                          {order.address.name}, {order.address.phone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.address.street},{" "}
                          {order.address.area && `${order.address.area}, `}
                          {order.address.city},{" "}
                          {order.address.state} –{" "}
                          {order.address.pincode}
                        </p>
                      </div>
                      {/* PAYMENT */}
                     <div className="space-y-1">
                       <h3 className="font-semibold flex items-center gap-2">
                         <CreditCard className="w-4 h-4" />
                         Payment Details
                       </h3>
                       <p className="text-sm">
                         Method: {order.payment.method}
                       </p>
                       <p className="text-sm text-muted-foreground">
                         Status: {order.payment.status}
                       </p>
                       {order.payment.razorpayPaymentId && (
                         <p className="text-xs text-muted-foreground">
                           Payment ID:{" "}
                           {order.payment.razorpayPaymentId}
                         </p>
                       )}
                     </div>

                     {/* SHIPPING */}
                     {order.shipping && (
                       <div className="space-y-1">
                         <h3 className="font-semibold">
                           Shipping Details
                         </h3>
                         <p className="text-sm">
                           Courier: {order.shipping.courier}
                         </p>
                         <p className="text-sm">
                           Tracking ID:{" "}
                           {order.shipping.trackingId}
                         </p>
                       </div>)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </LayoutGroup>
            </Card>
          );
        })}

        {/* CONFIRM STATUS DIALOG */}
        <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Status Change</DialogTitle>
            </DialogHeader>
            <p>
              Change order status to{" "}
              <strong>{nextStatus}</strong>?
            </p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setConfirmDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmStatusUpdate}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SHIPPING DETAILS DIALOG */}
        <Dialog open={shippingDialog} onOpenChange={setShippingDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shipping Details</DialogTitle>
            </DialogHeader>

            <input
              placeholder="Courier Name"
              className="border rounded-md px-3 py-2"
              onChange={(e) =>
                setShipping({ ...shipping, courier: e.target.value })
              }
            />
            <input
              placeholder="Tracking ID"
              className="border rounded-md px-3 py-2"
              onChange={(e) =>
                setShipping({ ...shipping, trackingId: e.target.value })
              }
            />

            <DialogFooter>
              <Button variant="ghost" onClick={() => setShippingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmShipping}>
                Mark as Shipped
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}
