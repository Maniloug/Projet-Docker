import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

function Navbar() {
  const { itemCount } = useCart();
  const navClass = ({ isActive }) =>
    `rounded px-3 py-2 text-sm font-medium ${isActive ? 'bg-yellow-200 text-slate-900' : 'text-slate-700'}`;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold text-yellow-500">
          PokéBoutique
        </Link>
        <nav className="flex flex-wrap gap-2">
          <NavLink to="/" className={navClass} end>
            Catalogue
          </NavLink>
          <NavLink to="/cart" className={navClass}>
            <span className="flex items-center gap-2">
              Panier
              {itemCount > 0 && (
                <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </span>
          </NavLink>
          <NavLink to="/admin/cards/new" className={navClass}>
            Ajouter une carte
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
