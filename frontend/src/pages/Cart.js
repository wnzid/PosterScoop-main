import React from 'react';
import CartPage from '../components/CartPage';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { items } = useCart();
  return <CartPage cartItems={items} />;
};

export default Cart;
