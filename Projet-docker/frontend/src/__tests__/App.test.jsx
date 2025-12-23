import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { CartProvider } from '../hooks/useCart';

describe('App routing', () => {
  it('renders catalogue headline', () => {
    render(
      <MemoryRouter>
        <CartProvider autoLoad={false}>
          <App />
        </CartProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/chargement du catalogue/i)).toBeInTheDocument();
  });
});
