import Navbar from './Navbar';
import Toast from './Toast';
import { useCart } from '../hooks/useCart';

function Layout({ children }) {
  const { toast, dismissToast } = useCart();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      {toast ? (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast message={toast.message} type={toast.type} onClose={dismissToast} />
        </div>
      ) : null}
    </div>
  );
}

export default Layout;
