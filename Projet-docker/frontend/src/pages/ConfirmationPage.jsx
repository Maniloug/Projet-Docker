import { Link, useLocation } from 'react-router-dom';

function ConfirmationPage() {
  const location = useLocation();
  const order = location.state;

  return (
    <section className="mx-auto max-w-xl space-y-6 text-center">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Merci</p>
        <h1 className="text-4xl font-bold text-slate-900">Commande confirmée !</h1>
      </div>
      {order?.orderId ? (
        <p className="text-slate-600">
          Numéro de commande <span className="font-semibold">{order.orderId}</span>
        </p>
      ) : (
        <p className="text-slate-600">Votre commande a été enregistrée.</p>
      )}
      {order?.items?.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left">
          <h2 className="text-lg font-semibold text-slate-900">Résumé</h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-600">
            {order.items.map((item) => (
              <li key={item.card._id} className="flex justify-between">
                <span>
                  {item.card.name} × {item.quantity}
                </span>
                <span>{item.lineTotal.toFixed(2)} €</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right text-xl font-semibold text-slate-900">Total : {order.total.toFixed(2)} €</p>
        </div>
      ) : null}
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-xl bg-yellow-500 px-6 py-3 text-base font-semibold text-white"
      >
        Retourner au catalogue
      </Link>
    </section>
  );
}

export default ConfirmationPage;
