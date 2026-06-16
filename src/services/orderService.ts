import supabase from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockDishes, popularRestaurants } from '../constants/mockData';

export interface OrderItemInput {
  foodItem: string; // ID
  quantity: number;
}

export interface AddressInput {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface PlaceOrderPayload {
  restaurantId: string;
  items: OrderItemInput[];
  paymentMethod: 'COD' | 'Online';
  deliveryAddress: AddressInput;
  discount?: number;
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

const LOCAL_ORDERS_KEY = 'vegdash_local_orders';

const sanitizeOrderDriver = (driver: any) => {
  if (!driver) return { name: 'Rohan Sharma', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150' };
  if (typeof driver === 'string') {
    try {
      return JSON.parse(driver);
    } catch (_) {
      return { name: driver, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150' };
    }
  }
  return driver;
};

const getLocalOrders = async (): Promise<any[]> => {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
};

const saveLocalOrders = async (orders: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (_) {}
};

const generateObjectId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
};

const simulateOrderStatus = (order: any) => {
  if (!order) return order;
  return {
    ...order,
    statusHistory: Array.isArray(order.statusHistory) 
      ? order.statusHistory 
      : [{ status: order.orderStatus || 'placed', timestamp: order.createdAt || new Date().toISOString() }]
  };
};

export const orderService = {
  async placeOrder(payload: PlaceOrderPayload) {
    let user: any = null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        user = data.user;
      }
    } catch (_) {}

    const foodIds = payload.items.map(item => item.foodItem);
    let dbItems: any[] = [];
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .in('_id', foodIds);
      if (!error && data && data.length > 0) {
        dbItems = data;
      } else {
        dbItems = mockDishes.filter(d => foodIds.includes(String(d.id))).map(d => ({ _id: String(d.id), price: d.price }));
      }
    } catch (_) {
      dbItems = mockDishes.filter(d => foodIds.includes(String(d.id))).map(d => ({ _id: String(d.id), price: d.price }));
    }

    let subtotal = 0;
    const itemsWithPrices = payload.items.map(item => {
      const dbItem = dbItems.find(i => String(i._id) === String(item.foodItem));
      const price = dbItem ? Number(dbItem.price) : 0;
      subtotal += price * item.quantity;
      return {
        foodItem: item.foodItem,
        quantity: item.quantity,
        price
      };
    });

    const discount = payload.discount || 0;
    const deliveryFee = 25;
    const packagingFee = 15;
    const totalAmount = Math.max(0, subtotal + deliveryFee + packagingFee - discount);

    const orderId = generateObjectId();

    const orderRow = {
      _id: orderId,
      customer: user?.id || 'guest',
      restaurant: payload.restaurantId,
      items: itemsWithPrices,
      subtotal,
      deliveryFee,
      discount,
      totalAmount,
      paymentStatus: payload.paymentMethod === 'COD' ? 'pending' : 'paid',
      paymentMethod: payload.paymentMethod,
      paymentId: '',
      orderStatus: 'placed',
      deliveryAddress: payload.deliveryAddress,
      driver: JSON.stringify({
        name: 'Rohan Sharma',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150',
      }),
      statusHistory: [{ status: 'placed', timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const { error: insertErr } = await supabase.from('orders').insert(orderRow);
      if (insertErr) {
        console.error('Supabase Order Insertion Error:', insertErr.message, insertErr.details);
      }
    } catch (err: any) {
      console.error('Supabase Order Insertion Exception:', err);
    }

    const localOrderRow = {
      ...orderRow,
      driver: {
        name: 'Rohan Sharma',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150',
      }
    };

    const local = await getLocalOrders();
    await saveLocalOrders([localOrderRow, ...local]);

    return localOrderRow;
  },

  async verifyPayment(payload: VerifyPaymentPayload) {
    try {
      await supabase
        .from('orders')
        .update({ paymentStatus: 'paid', paymentId: payload.razorpayPaymentId })
        .eq('_id', payload.orderId);
    } catch (_) {}

    const local = await getLocalOrders();
    const updated = local.map(o => {
      if (o._id === payload.orderId) {
        return { ...o, paymentStatus: 'paid', paymentId: payload.razorpayPaymentId };
      }
      return o;
    });
    await saveLocalOrders(updated);

    return updated.find(o => o._id === payload.orderId);
  },

  async getMyOrders() {
    let user: any = null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        user = data.user;
      }
    } catch (_) {}

    const userId = user?.id || 'guest';
    let dbOrders: any[] = [];
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer', userId)
        .order('createdAt', { ascending: false });
      if (!error && data && data.length > 0) {
        dbOrders = data;
      } else {
        dbOrders = await getLocalOrders();
      }
    } catch (_) {
      dbOrders = await getLocalOrders();
    }

    let userOrders = dbOrders.filter(o => o.customer === userId);
    if (userOrders.length === 0) {
      userOrders = dbOrders;
    }

    const populated = userOrders.map(order => {
      const simulated = simulateOrderStatus(order);
      const res = popularRestaurants.find(r => r.id === simulated.restaurant);
      const itemsPopulated = simulated.items.map((it: any) => {
        const dish = mockDishes.find(d => String(d.id) === String(it.foodItem));
        return {
          ...it,
          foodItem: dish ? {
            _id: String(dish.id),
            name: dish.name,
            image: dish.image,
            category: dish.category,
          } : {
            _id: it.foodItem,
            name: 'Delicious Veg Dish',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150',
            category: 'Pure Veg',
          }
        };
      });

      return {
        ...simulated,
        driver: sanitizeOrderDriver(simulated.driver),
        items: itemsPopulated,
        restaurant: res ? {
          _id: res.id,
          name: res.name,
          coverImage: res.image,
          rating: Number(res.rating) || 4.5,
        } : simulated.restaurant
      };
    });

    return populated;
  },

  async getOrderById(id: string) {
    let dbOrder: any = null;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('_id', id)
        .single();
      if (!error && data) {
        dbOrder = data;
      } else {
        const local = await getLocalOrders();
        dbOrder = local.find(o => o._id === id);
      }
    } catch (_) {
      const local = await getLocalOrders();
      dbOrder = local.find(o => o._id === id);
    }

    if (!dbOrder) {
      throw new Error('Order not found');
    }

    const simulated = simulateOrderStatus(dbOrder);
    simulated.driver = sanitizeOrderDriver(simulated.driver);
    const res = popularRestaurants.find(r => r.id === simulated.restaurant);
    if (res) {
      simulated.restaurant = {
        _id: res.id,
        name: res.name,
        coverImage: res.image,
        rating: Number(res.rating) || 4.5,
      };
    }

    const itemsPopulated = simulated.items.map((it: any) => {
      const dish = mockDishes.find(d => String(d.id) === String(it.foodItem));
      return {
        ...it,
        foodItem: dish ? {
          _id: String(dish.id),
          name: dish.name,
          image: dish.image,
          category: dish.category,
        } : {
          _id: it.foodItem,
          name: 'Delicious Veg Dish',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150',
          category: 'Pure Veg',
        }
      };
    });
    simulated.items = itemsPopulated;

    return simulated;
  },
};

export default orderService;
