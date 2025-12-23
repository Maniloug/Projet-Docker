import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

function CheckoutPage() {
  const { items, total, loading: cartLoading, checkout } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const order = await checkout();
      navigate('/confirmation', { state: order });
    } catch (err) {
      const apiError = err?.response?.data?.error || 'Échec de la simulation de paiement.';
      setError(apiError);
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return <p>Chargement du panier...</p>;
  }

  if (!items.length) {
    return <p>Votre panier est vide.</p>;
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Paiement</h1>
        <p className="text-slate-600">Simulation de paiement (aucune carte bancaire réelle).</p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Récapitulatif</h2>
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.card._id} className="flex justify-between text-sm text-slate-600">
              <span>
                {item.card.name} × {item.quantity}
              </span>
              <span>{item.lineTotal.toFixed(2)} €</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-right text-xl font-semibold text-slate-900">Total : {total.toFixed(2)} €</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Nom complet
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder="Sacha Ketchum"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="sacha@example.com"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-slate-700">
            Adresse
          </label>
          <textarea
            id="address"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            rows="3"
          ></textarea>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || cartLoading}
          className="w-full rounded-xl bg-yellow-500 px-8 py-3 text-base font-semibold text-white disabled:opacity-70"
        >
          {submitting ? 'Traitement...' : 'Simuler le paiement'}
        </button>
      </form>
    </section>
  );
}

export default CheckoutPage;
