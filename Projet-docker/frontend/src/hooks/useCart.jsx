import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCart, addItemToCart, updateCartItem, removeCartItem, checkoutCart } from '../api/cart';

const EMPTY_CART = { sessionId: '', items: [], total: 0, itemCount: 0 };

const CartContext = createContext(null);

function normalizeCart(nextCart = EMPTY_CART) {
  if (!nextCart) {
    return EMPTY_CART;
  }

  return {
    sessionId: nextCart.sessionId || '',
    items: Array.isArray(nextCart.items) ? nextCart.items : [],
    total: typeof nextCart.total === 'number' ? nextCart.total : 0,
    itemCount: typeof nextCart.itemCount === 'number' ? nextCart.itemCount : 0,
  };
}

export function CartProvider({ children, initialCart = EMPTY_CART, autoLoad = true }) {
  const [cart, setCart] = useState(() => normalizeCart(initialCart));
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const updateCartState = useCallback((nextCart) => {
    setCart(normalizeCart(nextCart));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    const timeout = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCart();
      updateCartState(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateCartState]);

  useEffect(() => {
    if (!autoLoad) {
      setLoading(false);
      return;
    }
    refreshCart().catch(() => undefined);
  }, [autoLoad, refreshCart]);

  const addToCart = useCallback(
    async (cardId, quantity = 1) => {
      const updated = await addItemToCart(cardId, quantity);
      updateCartState(updated);
      setError(null);
      const addedLine = updated.items.find((item) => {
        const itemId = item.card?._id?.toString();
        return itemId && itemId === cardId?.toString();
      });
      const cardName = addedLine?.card?.name || 'Article';
      showToast(`${cardName} ajouté au panier`);
      return updated;
    },
    [updateCartState, showToast]
  );

  const updateQuantity = useCallback(
    async (cardId, quantity) => {
      const updated = await updateCartItem(cardId, quantity);
      updateCartState(updated);
      setError(null);
      return updated;
    },
    [updateCartState]
  );

  const removeItem = useCallback(
    async (cardId) => {
      const updated = await removeCartItem(cardId);
      updateCartState(updated);
      setError(null);
      return updated;
    },
    [updateCartState]
  );

  const checkout = useCallback(async () => {
    const summary = await checkoutCart();
    updateCartState(EMPTY_CART);
    setError(null);
    return summary;
  }, [updateCartState]);

  const value = useMemo(
    () => ({
      cart,
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount,
      loading,
      error,
      addToCart,
      updateQuantity,
      removeItem,
      checkout,
      refreshCart,
      toast,
      dismissToast,
    }),
    [cart, loading, error, addToCart, updateQuantity, removeItem, checkout, refreshCart, toast, dismissToast]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
