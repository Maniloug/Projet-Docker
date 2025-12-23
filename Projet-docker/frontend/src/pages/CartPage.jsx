import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

function CartPage() {
  const { items, total = 0, loading, error, updateQuantity, removeItem } = useCart();

  if (loading) {
    return <p>Chargement du panier...</p>;
  }

  if (error) {
    return <p className="text-red-600">Impossible de charger le panier.</p>;
  }

  if (!items.length) {
    return (
      <section className="space-y-4 text-center">
        <p>Votre panier est vide.</p>
        <Link to="/" className="text-yellow-600 underline">
          Retourner vers le catalogue
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Panier</h1>
        <p className="text-slate-600">Ajustez les quantités avant de passer au paiement.</p>
      </header>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.card._id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-4">
              <img src={item.card.imageUrl} alt={item.card.name} className="h-24 w-24 rounded-xl object-cover" />
              <div>
                <p className="text-lg font-semibold text-slate-900">{item.card.name}</p>
                <p className="text-sm text-slate-500">{item.card.price.toFixed(2)} € pièce</p>
                <p className="text-sm font-medium text-slate-700">Sous-total : {item.lineTotal.toFixed(2)} €</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600" htmlFor={`qty-${item.card._id}`}>
                Quantité
              </label>
              <input
                id={`qty-${item.card._id}`}
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => {
                  const parsed = Number(e.target.value);
                  const safeValue = Number.isNaN(parsed) ? 1 : parsed;
                  updateQuantity(item.card._id, safeValue);
                }}
                className="w-20 rounded-lg border border-slate-200 px-2 py-1"
              />
              <button
                type="button"
                onClick={() => removeItem(item.card._id)}
                className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600"
              >
                Retirer
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-col items-end gap-4">
        <p className="text-2xl font-semibold text-slate-900">Total : {total.toFixed(2)} €</p>
        <Link to="/checkout" className="rounded-xl bg-yellow-500 px-8 py-3 text-base font-semibold text-white">
          Procéder au paiement
        </Link>
      </div>
    </section>
  );
}

export default CartPage;
