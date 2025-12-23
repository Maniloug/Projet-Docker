import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCard } from '../api/products';

const initialForm = {
  name: '',
  series: '',
  rarity: '',
  type: '',
  price: '',
  stock: '',
  description: '',
  imageUrl: '',
  tags: '',
  hp: '',
  abilities: '',
  weakness: '',
};

function NewCardPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      await createCard({
        name: form.name,
        series: form.series,
        rarity: form.rarity,
        type: form.type,
        price: form.price === '' ? undefined : Number(form.price),
        stock: form.stock === '' ? undefined : Number(form.stock),
        description: form.description,
        imageUrl: form.imageUrl,
        tags: form.tags,
        metadata: {
          hp: form.hp === '' ? undefined : Number(form.hp),
          abilities: form.abilities,
          weakness: form.weakness,
        },
      });
      setSuccessMessage('Carte enregistrée avec succès.');
      setForm(initialForm);
    } catch (error) {
      const apiError = error?.response?.data?.error || 'Impossible de créer la carte.';
      setErrorMessage(apiError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Administration</p>
        <h1 className="text-3xl font-bold text-slate-900">Ajouter une carte Pokémon</h1>
        <p className="text-slate-600">Ce formulaire alimente directement la base MongoDB via l API.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Nom*
            </label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="series" className="text-sm font-medium text-slate-700">
              Série*
            </label>
            <input id="series" name="series" value={form.series} onChange={handleChange} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="rarity" className="text-sm font-medium text-slate-700">
              Rareté*
            </label>
            <input id="rarity" name="rarity" value={form.rarity} onChange={handleChange} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="type" className="text-sm font-medium text-slate-700">
              Type*
            </label>
            <input id="type" name="type" value={form.type} onChange={handleChange} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="price" className="text-sm font-medium text-slate-700">
              Prix (€)*
            </label>
            <input id="price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="stock" className="text-sm font-medium text-slate-700">
              Stock disponible*
            </label>
            <input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="imageUrl" className="text-sm font-medium text-slate-700">
              Image URL*
            </label>
            <input id="imageUrl" name="imageUrl" value={form.imageUrl} onChange={handleChange} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="tags" className="text-sm font-medium text-slate-700">
              Tags (séparés par des virgules)
            </label>
            <input id="tags" name="tags" value={form.tags} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="hp" className="text-sm font-medium text-slate-700">
              HP
            </label>
            <input id="hp" name="hp" type="number" min="0" value={form.hp} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="weakness" className="text-sm font-medium text-slate-700">
              Faiblesse
            </label>
            <input id="weakness" name="weakness" value={form.weakness} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="abilities" className="text-sm font-medium text-slate-700">
              Capacités (séparées par des virgules)
            </label>
            <input id="abilities" name="abilities" value={form.abilities} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
        </div>
        <div>
          <label htmlFor="description" className="text-sm font-medium text-slate-700">
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows="4"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          ></textarea>
        </div>
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-green-600">{successMessage}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-yellow-500 px-6 py-3 text-base font-semibold text-white disabled:opacity-70"
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer la carte'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-xl border border-slate-200 px-6 py-3 text-base font-semibold text-slate-700"
          >
            Retour au catalogue
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/cards/new')}
            className="rounded-xl border border-slate-200 px-6 py-3 text-base font-semibold text-slate-700"
          >
            Réinitialiser
          </button>
        </div>
      </form>
    </section>
  );
}

export default NewCardPage;
