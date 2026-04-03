export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  categoryAr: string;
  unit: string;
  unitAr: string;
  units?: { name: string; nameAr?: string; price: number }[];
  stock: number;
  discount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: Date;
  deliveryAddress: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ProductDetails: { product: Product };
  Auth: undefined;
  ManageOrders: undefined;
  ManageProducts: undefined;
  ManageUsers: undefined;
  ManageCategories: undefined;
  ManageOffers: undefined;
  Reports: undefined;
  AddEditProduct: { product?: any };
  Checkout: undefined;
  MyOrders: undefined;
  OrderDetails: { order: any };
};

export type MainTabParamList = {
  Home: undefined;
  Offers: undefined;
  Cart: undefined;
  Profile: undefined;
  Admin: undefined;
};
