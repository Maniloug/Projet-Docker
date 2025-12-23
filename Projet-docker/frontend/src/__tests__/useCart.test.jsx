import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../hooks/useCart';
import {
  fetchCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  checkoutCart,
} from '../api/cart';

vi.mock('../api/cart', () => ({
  fetchCart: vi.fn(),
  addItemToCart: vi.fn(),
  updateCartItem: vi.fn(),
  removeCartItem: vi.fn(),
  checkoutCart: vi.fn(),
}));

const defaultCart = {
  sessionId: 'test-session',
  items: [],
  total: 0,
  itemCount: 0,
};

const renderWithProvider = (props = {}) =>
  renderHook(() => useCart(), {
    wrapper: ({ children }) => <CartProvider autoLoad={false} initialCart={{ ...defaultCart, ...props.initialCart }}>{children}</CartProvider>,
  });

describe('useCart hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalise les données initiales manquantes (Input Validation)', () => {
    const { result } = renderWithProvider({ initialCart: { items: null, total: null, itemCount: null } });

    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('rafraîchit le panier et met à jour le total (Core Functionality)', async () => {
    fetchCart.mockResolvedValue({ ...defaultCart, items: [{ card: { _id: '1', name: 'Pikachu', price: 9 }, quantity: 1, lineTotal: 9 }], total: 9, itemCount: 1 });
    const { result } = renderWithProvider();

    await act(async () => {
      await result.current.refreshCart();
    });

    expect(result.current.total).toBe(9);
    expect(result.current.items).toHaveLength(1);
    expect(fetchCart).toHaveBeenCalled();
  });

  it('expose les erreurs quand l API échoue (Error Handling)', async () => {
    const apiError = new Error('API KO');
    fetchCart.mockRejectedValue(apiError);
    const { result } = renderWithProvider();

    await act(async () => {
      await expect(result.current.refreshCart()).rejects.toThrow('API KO');
    });

    expect(result.current.error).toBe(apiError);
  });

  it('met à jour létat après add/update/remove et vide après checkout (Side Effects)', async () => {
    const updatedCart = { ...defaultCart, items: [{ card: { _id: 'card', name: 'Card', price: 5 }, quantity: 2, lineTotal: 10 }], total: 10, itemCount: 2 };
    addItemToCart.mockResolvedValue(updatedCart);
    updateCartItem.mockResolvedValue({ ...updatedCart, items: [{ ...updatedCart.items[0], quantity: 3, lineTotal: 15 }], total: 15, itemCount: 3 });
    removeCartItem.mockResolvedValue(defaultCart);
    checkoutCart.mockResolvedValue({ status: 'paid', orderId: 'POKE-123', total: 15, items: updatedCart.items });

    const { result } = renderWithProvider();

    await act(async () => {
      await result.current.addToCart('card', 2);
    });
    expect(result.current.total).toBe(10);

    await act(async () => {
      await result.current.updateQuantity('card', 3);
    });
    expect(result.current.total).toBe(15);

    await act(async () => {
      await result.current.removeItem('card');
    });
    expect(result.current.items).toHaveLength(0);

    await act(async () => {
      const summary = await result.current.checkout();
      expect(summary.status).toBe('paid');
    });
    expect(result.current.total).toBe(0);
  });
});
