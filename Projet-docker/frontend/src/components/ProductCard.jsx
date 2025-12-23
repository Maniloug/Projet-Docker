import { Link } from 'react-router-dom';

function ProductCard({ card, onAddToCart }) {
  const detailPath = card.slug || card._id;
  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <img src={card.imageUrl} alt={card.name} className="h-56 w-full rounded-t-xl object-cover" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{card.name}</h3>
          <p className="text-sm text-slate-500">{card.series} • {card.rarity}</p>
        </div>
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{card.price.toFixed(2)} €</span>
          <span>| Stock : {card.stock}</span>
        </p>
        <p className="line-clamp-3 text-sm text-slate-600">{card.description}</p>
        <div className="mt-auto flex flex-wrap gap-2">
          <Link
            to={`/cards/${detailPath}`}
            className="flex-1 rounded-lg border border-yellow-300 px-3 py-2 text-center text-sm font-medium text-yellow-700"
          >
            Détails
          </Link>
          <button
            type="button"
            onClick={() => onAddToCart(card._id)}
            className="flex-1 rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-white"
          >
            Ajouter
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
