import { useEffect, useState } from 'react';
import { listCards } from '../api/products';

export function useProducts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listCards()
      .then((cards) => {
        if (mounted) {
          setError(null);
          setData(cards);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
