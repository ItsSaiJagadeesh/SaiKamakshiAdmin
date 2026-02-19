import {
  collection,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/config/fribase";
import { Order } from "@/types/orders";

/* Fetch all orders */
export const fetchAllOrders = async () => {
  const snap = await getDocs(collection(db, "orders"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
};


/* Update shipping details */
export const updateShippingDetails = async (
  orderId: string,
  shipping: {
    courier: string;
    trackingId: string;
  }
) => {
  await updateDoc(doc(db, "orders", orderId), {
    shipping: {
      ...shipping,
      shippedAt: Timestamp.now(),
    },
    status: "shipped",
    updatedAt: Timestamp.now(),
  });
};


export const updateOrderStatus = async (
  orderId: string,
  status: string,
  shipping?: {
    courier: string;
    trackingId: string;
  }
) => {
  const ref = doc(db, 'orders', orderId);

  const payload: any = {
    status,
    updatedAt: Timestamp.now(),
  };

  if (status === 'SHIPPED' && shipping) {
    payload.shipping = {
      ...shipping,
      shippedAt: Timestamp.now(),
    };
  }

  await updateDoc(ref, payload);
};

export const onSnapshotOrders = (
  callback: (orders: Order[]) => void
) => {
  const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(orders);
  });

  return unsubscribe; // 🔥 VERY IMPORTANT
};

