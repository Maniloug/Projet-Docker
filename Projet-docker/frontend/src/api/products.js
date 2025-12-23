import http from './httpClient';

export async function listCards() {
  const { data } = await http.get('/cards');
  return data.data;
}

export async function getCard(cardId) {
  const { data } = await http.get(`/cards/${cardId}`);
  return data.data;
}

export async function createCard(payload) {
  const { data } = await http.post('/cards', payload);
  return data.data;
}

export async function deleteCard(cardId) {
  const { data } = await http.delete(`/cards/${cardId}`);
  return data.data;
}
