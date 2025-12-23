import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';

function ProductsPage() {
  const { data: cards, loading, error } = useProducts();
  const { addToCart } = useCart();

  if (loading) {
    return <p>Chargement du catalogue...</p>;
  }

  if (error) {
    return <p className="text-red-600">Une erreur est survenue.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Collection Pokémon</p>
        <h1 className="text-3xl font-bold text-slate-900">Cartes disponibles</h1>
        <p className="text-slate-600">
          Consultez notre sélection premium et ajoutez vos cartes favorites au panier.
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <ProductCard key={card._id} card={card} onAddToCart={addToCart} />
        ))}
      </div>
    </section>
  );
}

export default ProductsPage;
