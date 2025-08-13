import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productosPorVendedor } from "../service"; // tu función del service

// Util: baraja y toma N (Fisher–Yates)
const pickRandom = (arr, n) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
};

const MoreItems = ({ vendorId, currentProductId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    let cancel = false;

    (async () => {
      try {
        setLoading(true);
        const res = await productosPorVendedor(vendorId);

        // Soporta array directo o { vendor, products }
        const list = Array.isArray(res) ? res : Array.isArray(res?.products) ? res.products : [];

        if (!cancel) {
          const filtered = list.filter((p) => p?.id !== currentProductId);
          const selected = pickRandom(filtered, 7); // 👈 solo 7 aleatorios
          setItems(selected);
        }
      } catch (err) {
        console.error("Error cargando otros productos:", err);
        if (!cancel) setItems([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => { cancel = true; };
  }, [vendorId, currentProductId]);

  if (loading) return null; // opcional: spinner
  if (!items.length) return null;

  const getThumb = (item) =>
    item?.images?.find((i) => Number(i?.is_main) === 1)?.img_url ||
    item?.images?.[0]?.img_url ||
    "/assets/images/nuevas/imagendefault.png";

  return (
    <div className="more-item">
      <div className="flx-between mb-4">
        <h5 className="more-item__title">Más productos del vendedor</h5>
        <Link
          to={`/vendor/${vendorId}`}
          className="text-heading fw-500 hover-text-decoration-underline"
        >
          Ver todos
        </Link>
      </div>

      <div className="more-item__content flx-align">
        {items.map((item) => (
          <div key={item.id} className="more-item__item">
            <Link to={`/product-details/${item.id}`} className="link w-100 h-100 d-block">
              <img src={getThumb(item)} alt={item.name} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoreItems;
