import React, { createContext, useContext, useEffect, useState } from 'react';
import API_BASE from '../utils/apiBase';

const DiscountContext = createContext();

export const useDiscounts = () => useContext(DiscountContext);

export function DiscountProvider({ children }) {
  const [posterDiscounts, setPosterDiscounts] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const pdRes = await fetch(`${API_BASE}/api/discounts/posters`);
        if (pdRes.ok) setPosterDiscounts(await pdRes.json());
        const pcRes = await fetch(`${API_BASE}/api/discounts/promo`);
        if (pcRes.ok) setPromoCodes(await pcRes.json());
      } catch (e) {
        // ignore network errors
      }
    };
    load();
  }, []);

  const addPosterDiscount = async (discount) => {
    const res = await fetch(`${API_BASE}/api/discounts/posters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discount),
    });
    if (res.ok) {
      const d = await res.json();
      setPosterDiscounts((prev) => [...prev, d]);
    } else {
      throw new Error('Failed to add discount');
    }
  };

  const removePosterDiscount = async (id) => {
    const res = await fetch(`${API_BASE}/api/discounts/posters/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setPosterDiscounts((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const addPromoCode = async (promo) => {
    const res = await fetch(`${API_BASE}/api/discounts/promo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promo),
    });
    if (res.ok) {
      const p = await res.json();
      setPromoCodes((prev) => [...prev, p]);
    } else {
      throw new Error('Failed to add promo');
    }
  };

  const removePromoCode = async (id) => {
    const res = await fetch(`${API_BASE}/api/discounts/promo/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setPromoCodes((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <DiscountContext.Provider
      value={{
        posterDiscounts,
        promoCodes,
        addPosterDiscount,
        removePosterDiscount,
        addPromoCode,
        removePromoCode,
      }}
    >
      {children}
    </DiscountContext.Provider>
  );
}
