import http from './httpClient';

export async function fetchCart() {
  const { data } = await http.get('/cart');
  return data.data;
}

export async function addItemToCart(cardId, quantity = 1) {
  const { data } = await http.post('/cart', { cardId, quantity });
  return data.data;
}

export async function updateCartItem(cardId, quantity) {
  const { data } = await http.put(`/cart/${cardId}`, { quantity });
  return data.data;
}

export async function removeCartItem(cardId) {
  const { data } = await http.delete(`/cart/${cardId}`);
  return data.data;
}

export async function checkoutCart() {
  const { data } = await http.post('/cart/checkout');
  return data.data;
}
