import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchCategorias,
  indexProductos,
  productsByCategory,
} from "../service";

/**
 * ArrivalOne dinámico (limpio de warnings ESLint)
 * - Muestra 5 categorías aleatorias en cada carga.
 * - Muestra 12 productos aleatorios; si hay menos, muestra los disponibles.
 * - Al hacer clic en una categoría, muestra 12 aleatorios de esa categoría.
 * - Sin aria-selected en <button> para evitar jsx-a11y warnings.
 */
export default function ArrivalOne() {
  const [cats, setCats] = useState([]); // 5 categorías aleatorias
  const [activeCat, setActiveCat] = useState(null); // null = Todas
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]); // hasta 12 productos aleatorios

  // ================= Helpers =================
  const buildImageUrl = (path) => {
    if (!path) return "/assets/images/nuevas/imagendefault.png";
    return String(path); // ya viene absoluta desde la API (https://...)
  };

  const getCover = (product) => {
    const imgs = Array.isArray(product?.images) ? product.images : [];
    if (!imgs.length) return "/assets/images/nuevas/imagendefault.png";
    const main =
      imgs.find(
        (im) => im.is_main === 1 || im.is_main === true || im.is_main === "1"
      ) || imgs[0];
    const url = main?.img_url || main?.image_url;
    return buildImageUrl(url);
  };

  const money = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? `$${n.toFixed(2)}` : `$${v ?? "0.00"}`;
  };

  const pickRandom = (arr = [], n = 12) => {
    const a = Array.isArray(arr) ? [...arr] : [];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  };

  // ================= Data loading =================
  const loadAll = async () => {
    setLoading(true);
    try {
      const list = await indexProductos();
      const products = Array.isArray(list) ? list : list?.data || [];
      setItems(pickRandom(products, 12)); // 12 aleatorios globales
    } finally {
      setLoading(false);
    }
  };

  const loadByCat = async (id) => {
    setLoading(true);
    try {
      const list = await productsByCategory(id);
      const products = Array.isArray(list) ? list : list?.data || [];
      setItems(pickRandom(products, 12)); // 12 aleatorios de la categoría
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías (5 aleatorias) una vez
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchCategorias();
        const list = Array.isArray(res) ? res : res?.data || [];
        if (!cancelled) setCats(pickRandom(list, 5)); // 5 aleatorias
      } catch (e) {
        console.error("Error cargando categorías", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Carga inicial: 12 aleatorios de todos
  useEffect(() => {
    loadAll();
  }, []);

  // ================= Render =================
  return (
    <section className="arrival-product padding-y-120 section-bg position-relative z-index-1">
      <img
        src="assets/images/gradients/product-gradient.png"
        alt=""
        className="bg--gradient white-version"
      />
      <img
        src="assets/images/shapes/element2.png"
        alt=""
        className="element one"
      />

      <div className="container container-two">
        <div className="section-heading">
          <h3 className="section-heading__title">Productos recién agregados</h3>
        </div>

        {/* ===== Tabs de categorías ===== */}
        <ul
          className="nav common-tab justify-content-center nav-pills mb-48"
          role="tablist"
        >
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeCat === null ? "active" : ""}`}
              type="button"
              onClick={() => {
                setActiveCat(null);
                loadAll();
              }}
            >
              Todas
            </button>
          </li>

          {cats.map((cat) => (
            <li key={cat.id} className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeCat === cat.id ? "active" : ""}`}
                type="button"
                onClick={() => {
                  setActiveCat(cat.id);
                  loadByCat(cat.id);
                }}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>

        {/* ===== Contenido (una sola "pane" activa porque renderizamos por estado) ===== */}
        <div className="tab-content">
          <div
            className="tab-pane fade show active"
            role="tabpanel"
            tabIndex={0}
          >
            {loading ? (
              <div className="text-center py-5">Cargando…</div>
            ) : (
              <div className="row gy-4">
                {items.map((p) => (
                  <div className="col-xl-3 col-lg-4 col-sm-6" key={p.id}>
                    <div className="product-item">
                      <div className="product-item__thumb d-flex">
                        <Link
                          to={`/product-details/${p.id}`}
                          className="link w-100"
                        >
                          <img
                            src={getCover(p)}
                            alt={p.name || "Producto"}
                            className="cover-img"
                          />
                        </Link>
                        {/* <button
                          type="button"
                          className="product-item__wishlist"
                          aria-label="Wishlist"
                        >
                          <i className="fas fa-heart" />
                        </button> */}
                      </div>

                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link
                            to={`/product-details/${p.id}`}
                            className="link"
                          >
                            {p.name}
                          </Link>
                        </h6>

                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            por{" "}
                            <Link
                              to={`/vendor/${p.vendor?.id || ""}`}
                              className="link hover-text-decoration-underline"
                            >
                              {p.vendor?.name || "Vendedor"}
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">
                              {money(p.price)}
                            </h6>
                            {p.prev_price ? (
                              <span className="product-item__prevPrice text-decoration-line-through">
                                {money(p.prev_price)}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="product-item__bottom flx-between gap-2">
                          <div>
                            {p.sales != null && (
                              <span className="product-item__sales font-14 mb-2">
                                {p.sales} Sales
                              </span>
                            )}
                            <div className="d-flex align-items-center gap-1">
                              <ul className="star-rating">
                                {[...Array(5)].map((_, i) => (
                                  <li
                                    className="star-rating__item font-11"
                                    key={i}
                                  >
                                    <i className="fas fa-star" />
                                  </li>
                                ))}
                              </ul>
                              {p.reviews_count != null && (
                                <span className="star-rating__text text-heading fw-500 font-14">
                                  ({p.reviews_count})
                                </span>
                              )}
                            </div>
                          </div>
                          <Link
                            to={`/product-details/${p.id}`}
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Ver detalles
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="col-12">
                    <div className="text-center py-5 text-body">
                      No hay productos disponibles.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="text-center mt-64">
          <Link to="/all-product" className="btn btn-main btn-lg pill fw-300">
            Ver Mas Productos ... 
          </Link>
        </div>
      </div>
    </section>
  );
}
