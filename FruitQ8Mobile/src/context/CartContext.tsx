import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';
import { fetchDeliverySettings, fetchProductsFromFirebase } from '../services/firebase';

interface CartItem {
  product: Product;
  unit: { name: string; nameAr?: string; price: number };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  deliveryFee: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  loadDeliverySettings: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(0);

  useEffect(() => {
    loadCart();
    loadDeliverySettings();
  }, []);

  useEffect(() => {
    saveCart();
  }, [items]);

  const loadCart = async () => {
    try {
      const saved = await AsyncStorage.getItem('cart');
      if (!saved) {
        setItems([]);
        return;
      }

      const parsedItems = JSON.parse(saved);
      if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
        setItems([]);
        return;
      }

      try {
        const firebaseProducts = await fetchProductsFromFirebase();
        const productMap = new Map(firebaseProducts.map((product: any) => [String(product.id), product]));

        const syncedItems = parsedItems.flatMap((item: CartItem) => {
          const product = productMap.get(String(item.product.id));
          if (!product || product.active === false || product.isHidden === true) {
            return [];
          }

          const units = Array.isArray(product.units) ? product.units : [];
          const matchedUnit = units.find((unit: any) => unit.name === item.unit.name) ?? units[0];
          if (!matchedUnit) {
            return [];
          }

          const image = Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : product.image || item.product.image;

          return [{
            ...item,
            product: {
              ...item.product,
              name: product.name || item.product.name,
              nameAr: product.nameAr || item.product.nameAr,
              image,
              images: product.images || item.product.images,
              price: Number(matchedUnit.price) || 0,
              unit: matchedUnit.name,
              unitAr: matchedUnit.nameAr || matchedUnit.name,
              units: units.map((unit: any) => ({
                name: unit.name,
                nameAr: unit.nameAr || unit.name,
                price: Number(unit.price) || 0,
              })),
              stock: Number(product.quantity ?? product.stock ?? item.product.stock ?? 0),
              discount: Number(product.discount ?? item.product.discount ?? 0),
            },
            unit: {
              name: matchedUnit.name,
              nameAr: matchedUnit.nameAr || matchedUnit.name,
              price: Number(matchedUnit.price) || 0,
            },
          }];
        });

        setItems(syncedItems);
        await AsyncStorage.setItem('cart', JSON.stringify(syncedItems));
      } catch (syncError) {
        console.error('Error syncing cart:', syncError);
        setItems(parsedItems);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === newItem.product.id && item.unit.name === newItem.unit.name
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === newItem.product.id && item.unit.name === newItem.unit.name
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const loadDeliverySettings = async () => {
    try {
      const settings = await fetchDeliverySettings();
      setDeliveryFee(settings.fee || 0);
      setFreeDeliveryAbove(settings.freeAbove || 0);
    } catch (error) {
      console.error('Error loading delivery settings:', error);
    }
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unit.price * item.quantity, 0);
  const calculatedDeliveryFee = subtotal >= freeDeliveryAbove ? 0 : deliveryFee;
  const total = subtotal + calculatedDeliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        total,
        deliveryFee: calculatedDeliveryFee,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loadDeliverySettings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
