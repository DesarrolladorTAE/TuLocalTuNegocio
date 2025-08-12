import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productosPorVendedor } from "../service"; // tu función del service

const MoreItems = ({ vendorId, currentProductId }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!vendorId) return;
    (async () => {
      try {
        const res = await productosPorVendedor(vendorId);
        // Filtramos para que no aparezca el mismo producto
        setItems(res.filter((p) => p.id !== currentProductId).slice(0, 9));
      } catch (err) {
        console.error("Error cargando otros productos:", err);
      }
    })();
  }, [vendorId, currentProductId]);

  if (!items.length) return null;

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
            <Link
              to={`/product-details/${item.id}`}
              className="link w-100 h-100 d-block"
            >
              <img
                src={
                  item.images?.find((i) => i.is_main)?.img_url ||
                  item.images?.[0]?.img_url ||
                  "/assets/images/nuevas/imagendefault.png"
                }
                alt={item.name}
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoreItems;
