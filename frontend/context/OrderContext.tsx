import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast from 'react-native-toast-message';

export type OrderStage = 'Cart' | 'Paid' | 'Packed' | 'Picked Up' | 'On The Way' | 'Delivered' | 'Released' | 'Returned';

export type Order = {
  id: string;
  item: string;
  itemPrice: number;
  deliveryFee: number;
  platformFeePercent: number;
  buyer: string;
  seller: string;
  rider: string | null;
  stage: OrderStage;
  pickupCode: string;
};

type Notification = {
  id: string;
  recipient: 'buyer' | 'seller' | 'rider' | 'admin';
  text: string;
  time: string;
  read: boolean;
};

type CartItem = { id: string; title: string; price: number; seller: string; placeholderColor: string };

type OrderContextType = {
  orders: Order[];
  notifications: Notification[];
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  createOrder: (item: string, itemPrice: number, deliveryFee: number, seller: string) => string;

  markPaid: (orderId: string) => void;
  markPacked: (orderId: string) => void;
  assignRider: (orderId: string, riderId: string) => void;
  markPickedUp: (orderId: string) => void;
  markOnTheWay: (orderId: string) => void;
  markDelivered: (orderId: string, enteredCode: string) => { success: boolean; message: string };
  releasePayment: (orderId: string) => void;
  markReturned: (orderId: string) => void;
  getUnreadCount: (recipient: Notification['recipient']) => number;
  markAllRead: (recipient: Notification['recipient']) => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function generateCode() {
  return `ST-${Math.floor(100000 + Math.random() * 900000)}`;
}

function timeNow() {
  return 'Just now';
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([
    { id: '1', item: 'MacBook Pro 14"', itemPrice: 1850, deliveryFee: 25, platformFeePercent: 15, buyer: 'martin_o', seller: 'ama_b', rider: null, stage: 'Packed', pickupCode: 'ST-834748' },
    { id: '2', item: 'Vintage Guitar', itemPrice: 4200, deliveryFee: 30, platformFeePercent: 15, buyer: 'kojo_a', seller: 'seller_sophie', rider: 'rider001', stage: 'On The Way', pickupCode: 'ST-775172' },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      if (prev.some((c) => c.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const clearCart = () => setCart([]);

  const pushNotification = (recipient: Notification['recipient'], text: string) => {
    setNotifications((prev) => [
      { id: String(Date.now() + Math.random()), recipient, text, time: timeNow(), read: false },
      ...prev,
    ]);
    Toast.show({
      type: 'success',
      text1: 'SafeTrade 🔔',
      text2: text,
      position: 'top',
      visibilityTime: 3500,
      topOffset: 60,
    });
  };

  const createOrder = (item: string, itemPrice: number, deliveryFee: number, seller: string) => {
    const id = String(Date.now());
    const newOrder: Order = {
      id, item, itemPrice, deliveryFee, platformFeePercent: 15,
      buyer: 'martin_o', seller, rider: null, stage: 'Cart', pickupCode: generateCode(),
    };
    setOrders((prev) => [...prev, newOrder]);
    return id;
  };

  const markPaid = (orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, stage: 'Paid' } : o)));
    pushNotification('buyer', 'Payment successful! Your order is being prepared.');
    const order = orders.find((o) => o.id === orderId);
    if (order) pushNotification('seller', `New order paid: ${order.item}. Please pack it up.`);
  };

  const markPacked = (orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, stage: 'Packed' } : o)));
    const order = orders.find((o) => o.id === orderId);
    pushNotification('rider', `New delivery available: ${order?.item ?? 'an item'}.`);
    pushNotification('buyer', 'Your seller has packed your item. A rider will pick it up soon.');
  };

  const assignRider = (orderId: string, riderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, rider: riderId } : o)));
  };

  const markPickedUp = (orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, stage: 'Picked Up' } : o)));
    pushNotification('buyer', 'Your rider has picked up your package!');
    const order = orders.find((o) => o.id === orderId);
    pushNotification('seller', `Rider picked up: ${order?.item ?? 'item'}.`);
  };

  const markOnTheWay = (orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, stage: 'On The Way' } : o)));
    pushNotification('buyer', 'Your rider is on the way to you!');
  };

  const markDelivered = (orderId: string, enteredCode: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };
    if (enteredCode.trim().toUpperCase() !== order.pickupCode) {
      return { success: false, message: 'Incorrect code. Ask the buyer for their pickup code.' };
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, stage: 'Delivered' } : o)));
    pushNotification('buyer', 'Delivered! Thanks for trading safely on SafeTrade.');
    pushNotification('seller', `${order.item} was delivered successfully. Payment pending admin release.`);
    pushNotification('admin', `${order.item} delivered \u2014 ready for payment release.`);
    return { success: true, message: 'Delivered successfully.' };
  };

  const releasePayment = (orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, stage: 'Released' } : o)));
    const order = orders.find((o) => o.id === orderId);
    const sellerCut = order ? order.itemPrice * (1 - order.platformFeePercent / 100) : 0;
    pushNotification('seller', `Payment of GHS ${sellerCut.toFixed(2)} has been released to you!`);
  };

  const markReturned = (orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, stage: 'Returned' } : o)));
    const order = orders.find((o) => o.id === orderId);
    pushNotification('buyer', `Your refund for ${order?.item ?? 'item'} has been processed (delivery fee non-refundable).`);
    pushNotification('seller', `${order?.item ?? 'An item'} was returned by the buyer.`);
  };

  const getUnreadCount = (recipient: Notification['recipient']) =>
    notifications.filter((n) => n.recipient === recipient && !n.read).length;

  const markAllRead = (recipient: Notification['recipient']) => {
    setNotifications((prev) => prev.map((n) => (n.recipient === recipient ? { ...n, read: true } : n)));
  };

  return (
    <OrderContext.Provider
      value={{
        orders, notifications, cart, addToCart, removeFromCart, clearCart,
        createOrder, markPaid, markPacked, assignRider,
        markPickedUp, markOnTheWay, markDelivered, releasePayment, markReturned,
        getUnreadCount, markAllRead,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
}