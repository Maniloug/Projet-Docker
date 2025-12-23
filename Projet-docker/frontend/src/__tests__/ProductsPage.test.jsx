import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import ProductsPage from '../pages/ProductsPage';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';

vi.mock('../hooks/useProducts');
vi.mock('../hooks/useCart');

const sampleCards = [
  {
    _id: '1',
    slug: 'pikachu-v',
    name: 'Pikachu V',
    series: 'Sword & Shield',
    rarity: 'Ultra Rare',
    type: 'Electric',
    price: 25,
    stock: 5,
    description: 'Carte test',
    imageUrl: 'https://example.com/pikachu.jpg',
  },
];

describe('ProductsPage', () => {
  const addToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useCart.mockReturnValue({ addToCart });
  });

  it('affiche la liste des cartes (Core Functionality)', () => {
    useProducts.mockReturnValue({ data: sampleCards, loading: false, error: null });

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Pikachu V')).toBeInTheDocument();
    expect(screen.getByText('Cartes disponibles')).toBeInTheDocument();
  });

  it('affiche un message derreur quand l API échoue (Error Handling)', () => {
    useProducts.mockReturnValue({ data: [], loading: false, error: new Error('API KO') });

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/erreur est survenue/i)).toBeInTheDocument();
  });

  it('envoie une action d ajout au panier quand on clique sur Ajouter (Side Effects)', async () => {
    useProducts.mockReturnValue({ data: sampleCards, loading: false, error: null });
    useCart.mockReturnValue({ addToCart });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    const buttons = screen.getAllByRole('button', { name: /ajouter/i });
    await user.click(buttons[0]);

    expect(addToCart).toHaveBeenCalledWith('1');
  });
});
