export interface Product {
  id: number;
  name: string;
  units: ProductUnit[];
  quantity: number;
  active: boolean;
  images?: string[];
  image?: string;
  category: string;
  categories?: string[];
  order?: number;
}

export interface ProductUnit {
  name: string;
  price: number;
}

export interface CartItem {
  id: number;
  name: string;
  image: string;
  unit: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'knet';
  createdAt: string;
  deliveryAddress?: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  pushToken?: string;
}