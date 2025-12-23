import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import NewCardPage from './pages/NewCardPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/cards/:cardId" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/admin/cards/new" element={<NewCardPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
