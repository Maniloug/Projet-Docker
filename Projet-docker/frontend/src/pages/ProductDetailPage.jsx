import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { deleteCard, getCard } from '../api/products';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';

function ProductDetailPage() {
  const { cardId } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    getCard(cardId)
      .then((data) => setCard(data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [cardId]);

  useEffect(() => {
    setQuantity(1);
  }, [cardId]);

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error || !card) {
    return <p className="text-red-600">Carte introuvable.</p>;
  }

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement cette carte ?')) {
      return;
    }
    setDeleting(true);
    setAdminError('');
    try {
      await deleteCard(card._id);
      navigate('/');
    } catch (err) {
      const apiError = err?.response?.data?.error || "Impossible de supprimer la carte.";
      setAdminError(apiError);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="grid gap-8 md:grid-cols-2">
      <img src={card.imageUrl} alt={card.name} className="w-full rounded-2xl object-cover" />
      <div className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{card.series}</p>
          <h1 className="text-4xl font-bold text-slate-900">{card.name}</h1>
        </div>
        <p className="text-lg text-slate-600">{card.description}</p>
        <ul className="space-y-1 text-sm text-slate-600">
          <li>Type : {card.type}</li>
          <li>Rareté : {card.rarity}</li>
          <li>Stock : {card.stock}</li>
        </ul>
        <p className="text-2xl font-semibold text-yellow-600">{card.price.toFixed(2)} €</p>
        <div className="flex items-center gap-3">
          <label htmlFor="quantity" className="text-sm text-slate-600">
            Quantité
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            max={card.stock}
            value={quantity}
            onChange={(event) => {
              const value = Number(event.target.value);
              const limited = Math.min(card.stock, Math.max(1, value));
              setQuantity(limited);
            }}
            className="w-24 rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <button
          type="button"
          onClick={() => addToCart(card._id, quantity)}
          className="rounded-xl bg-yellow-500 px-8 py-3 text-base font-semibold text-white"
        >
          Ajouter au panier
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-xl border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 disabled:opacity-70"
        >
          {deleting ? 'Suppression...' : 'Supprimer la carte'}
        </button>
        {adminError ? <p className="text-sm text-red-600">{adminError}</p> : null}
      </div>
    </section>
  );
}

export default ProductDetailPage;
