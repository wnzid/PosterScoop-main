import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('cartItems');
    return stored ? JSON.parse(stored) : [];
  });
  const [customCount, setCustomCount] = useState(() => {
    const stored = localStorage.getItem('cartCustomCount');
    return stored ? JSON.parse(stored) : 0;
  });

  useEffect(() => {
    localStorage.setItem('cartCustomCount', JSON.stringify(customCount));
  }, [customCount]);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    setItems((prev) => {
      const normalized = {
        image: item.image,
        type: item.type || item.posterType,
        size: item.size,
        thickness: item.thickness,
        price: item.price,
        quantity: item.quantity || item.qty || 1,
        orderCode: item.orderCode,
      };
      if (item.orderCode) {
        const count = customCount + 1;
        const customName = `Custom#${String(count).padStart(2, '0')}`;
        normalized.title = customName;
        setCustomCount(count);
      } else {
        normalized.title = item.title || '';
      }
      return [...prev, normalized];
    });
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeItem(index);
    } else {
      setItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = () => {
    setItems([]);
    setCustomCount(0);
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
