

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchCategorias, indexProductos, productsByCategory } from "../service";

const AllProduct = () => {
  const [activeButton, setActiveButton] = useState("grid-view");
  const [filter, setFilter] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [categoriasAll, setCategoriasAll] = useState([]);
  const [productos, setProductos] = useState([]);
  const [activeCat, setActiveCat] = useState(null); // null = Todas
  const [openCats, setOpenCats] = useState(true);   // 👉 controla colapso del bloque "Categorias"
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Lista base (lo que viene del API, todas o por categoría)
  const [productosRaw, setProductosRaw] = useState([]);

  // Normaliza cadenas (minúsculas y sin acentos)
  const norm = (s) =>
    (s ?? "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Aplica filtro por texto
  const applyFilter = (list, q) => {
    const qn = norm(q);
    if (!qn) return list;
    return list.filter((p) =>
      [
        p.name,
        p.description,
        p?.category?.name,
        p?.vendor?.name,
      ].some((f) => norm(f).includes(qn))
    );
  };

  // Debounce 250ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Cuando cambia texto o base, recalcula mostrados
  useEffect(() => {
    setProductos(applyFilter(productosRaw, debouncedSearch));
  }, [debouncedSearch, productosRaw]);

  const handleClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  // Si usas filtro por categoría:
  const loadAll = async () => {
    const list = await indexProductos();
    setProductosRaw(list);
    setSearch(""); // opcional: limpiar búsqueda al cambiar categoría
  };

  const loadByCat = async (id) => {
    const list = await productsByCategory(id);
    setProductosRaw(list);
    setSearch(""); // opcional
  };

  // al montar, cargar todas
  useEffect(() => { loadAll().catch(console.error); }, []);

  // ✅ Normaliza la URL (tu API ya manda absoluta)
  const buildImageUrl = (path) => {
    if (!path) return "/assets/images/thumbs/placeholder-product.png";
    return String(path); // ya viene completa (https://...)
  };

  // ✅ Toma la principal (is_main = 1/true) o la primera
  const getCover = (product) => {
    const imgs = Array.isArray(product?.images) ? product.images : [];
    if (!imgs.length) return "/assets/images/nuevas/imagendefault.png";

    const main =
      imgs.find(im => im.is_main === 1 || im.is_main === true || im.is_main === "1") ||
      imgs[0];

    // tu API usa `img_url`; dejamos fallback a `image_url` por si cambia
    const url = main?.img_url || main?.image_url;
    return buildImageUrl(url);
  };

  // ✅ Formatea precio seguro
  const money = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? `$${n.toFixed(2)}` : `$${v ?? "0.00"}`;
  };

  // ✅ Handlers (fuera de otros handlers)
  // const handleFilter = () => setFilter(f => !f);

  useEffect(() => {
    let cancelled = false;

    // util: baraja y toma N
    const pickRandom = (arr, n) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a.slice(0, n);
    };

    (async () => {
      try {
        const res = await fetchCategorias(); // tu service

        // según cómo devuelve tu service, normaliza:
        const list = Array.isArray(res) ? res : res?.data;

        if (Array.isArray(list) && !cancelled) {
          setCategorias(pickRandom(list, 5));
        }
      } catch (e) {
        console.error("Error cargando categorías:", e);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetchCategorias();
        const list = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(list) && !cancelled) {
          setCategoriasAll(list);
        }
      } catch (e) {
        console.error("Error cargando TODAS las categorías:", e);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const handleFilter = () => {
    setFilter(!filter);
  };

  // 👇 Cargar productos para la grilla
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await indexProductos();
        if (!cancelled) setProductosRaw(list); // 👈 base
      } catch (e) { console.error(e); }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className={`all-product padding-y-120 ${activeButton === "list-view" ? "list-view" : ""
      }`}>
      <div className="container container-two">
        <div className="row">
          <div className="col-lg-12">
            <div className="filter-tab gap-3 flx-between">
              <button
                type="button"
                className="filter-tab__button btn btn-outline-light pill d-flex align-items-center"
              >
                <span className="icon icon-left">
                  <img src="assets/images/icons/filter.svg" alt="" />
                </span>
                <span className="font-18 fw-500">Filtros</span>
              </button>
              <ul className="nav common-tab nav-pills mb-0 gap-lg-2 gap-1 ms-lg-auto" id="pills-tab" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeCat === null ? "active" : ""}`}
                    type="button"
                    onClick={loadAll}
                  >
                    Todas
                  </button>
                </li>

                {categorias.map(cat => (
                  <li className="nav-item" role="presentation" key={cat.id}>
                    <button
                      className={`nav-link ${activeCat === cat.id ? "active" : ""}`}
                      type="button"
                      onClick={() => loadByCat(cat.id)}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="list-grid d-flex align-items-center gap-2">
                <button
                  className={`list-grid__button list-button d-sm-flex d-none text-body ${activeButton === "list-view" ? "active" : ""
                    }`}
                  onClick={() => handleClick("list-view")}
                >
                  <i className="las la-list" />
                </button>
                <button
                  className={`list-grid__button grid-button d-sm-flex d-none  text-body ${activeButton === "grid-view" ? "active" : ""
                    }`}
                  onClick={() => handleClick("grid-view")}
                >
                  <i className="las la-border-all" />
                </button>
                <button className="list-grid__button sidebar-btn text-body d-lg-none d-flex" onClick={handleFilter}>
                  <i className="las la-bars" />
                </button>
              </div>
            </div>
            <form action="#" className="filter-form pb-4 d-block">
              <form className="filter-form pb-4 d-block" onSubmit={(e) => e.preventDefault()}>
                <div className="search-box d-flex">
                  <input
                    type="text"
                    className="common-input common-input--lg pill shadow-sm"
                    placeholder="Buscar productos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-main btn-icon icon border-0">
                    <img src="assets/images/icons/search.svg" alt="" />
                  </button>
                </div>
              </form>

            </form>
          </div>
          <div className="col-xl-3 col-lg-4">
            {/* ===================== Filter Sidebar Start ============================= */}
            <div className={`filter-sidebar ${filter && "show"}`}>
              <button
                type="button"
                className="filter-sidebar__close p-2 position-absolute end-0 top-0 z-index-1 text-body hover-text-main font-20 d-lg-none d-block"
                onClick={handleFilter}
              >
                <i className="las la-times" />
              </button>

              <div className="filter-sidebar__item">
                <button
                  type="button"
                  className="filter-sidebar__button font-16 text-capitalize fw-500 w-100 d-flex align-items-center"
                  onClick={() => setOpenCats(o => !o)} // 👉 toggle colapso
                  aria-expanded={openCats}
                  aria-controls="cats-content"
                >
                  <span>Categorias</span>
                  <span className={`ms-auto transition ${openCats ? "rotate-180" : ""}`}>
                    <i className="las la-angle-down" />
                  </span>
                </button>

                {/* Contenido colapsable */}
                <div
                  id="cats-content"
                  className="filter-sidebar__content"
                  style={{ display: openCats ? "block" : "none" }} // 👉 colapsa/expande
                >
                  <ul className="filter-sidebar-list">
                    {/* Todas */}
                    <li className="filter-sidebar-list__item">
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); loadAll(); }}
                        className={`filter-sidebar-list__text ${activeCat === null ? "active" : ""}`}
                      >
                        Todas las Categorias
                        <span className="qty">{categoriasAll.length}</span>
                      </a>
                    </li>

                    {/* Categorías */}
                    {categoriasAll.map((cat) => (
                      <li key={cat.id} className="filter-sidebar-list__item">
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); loadByCat(cat.id); }}
                          className={`filter-sidebar-list__text ${activeCat === cat.id ? "active" : ""}`}
                        >
                          {cat.name}
                          {cat.product_count != null && (
                            <span className="qty">{cat.product_count}</span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* ===================== Filter Sidebar End ============================= */}
          </div>
          <div className="col-xl-9 col-lg-8">
            <div className="tab-content" id="pills-tabContent">
              <div
                className="tab-pane fade show active"
                id="pills-product"
                role="tabpanel"
                aria-labelledby="pills-product-tab"
                tabIndex={0}
              >
                <div className="row gy-4 list-grid-wrapper">
                  {/* 👇 AQUÍ reemplazamos los 8 items estáticos por el map de productos */}
                  {productos.map((p) => (
                    <div className="col-xl-4 col-sm-6" key={p.id}>
                      <div className="product-item section-bg">
                        <div className="product-item__thumb d-flex">
                          <Link to={`/producto/${p.slug || p.id}`} className="link w-100">
                            <img
                              src={getCover(p)}
                              alt={p.name || "Producto"}
                              className="cover-img"
                              loading="lazy"
                            />
                          </Link>
                          <button type="button" className="product-item__wishlist" aria-label="Agregar a wishlist">
                            <i className="fas fa-heart" />
                          </button>
                        </div>

                        <div className="product-item__content">
                          <h6 className="product-item__title">
                            <Link to={`/producto/${p.slug || p.id}`} className="link">
                              {p.name}
                            </Link>
                          </h6>

                          <div className="product-item__info flx-between gap-2">
                            <span className="product-item__author">
                              Por{" "}
                              <Link to={`/vendedor/${p.vendor?.id || ""}`} className="link hover-text-decoration-underline">
                                {p.vendor?.name || "Vendedor"}
                              </Link>
                            </span>
                            <div className="flx-align gap-2">
                              <h6 className="product-item__price mb-0">{money(p.price)}</h6>
                              {/* Si tienes precio anterior, muéstralo como tachado */}
                              {p.prev_price ? (
                                <span className="product-item__prevPrice text-decoration-line-through">
                                  {money(p.prev_price)}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="product-item__bottom flx-between gap-2">
                            <div>
                              {/* Si tienes ventas o rating en tu API, colócalos aquí */}
                              {p.sales != null && (
                                <span className="product-item__sales font-14 mb-2">
                                  {p.sales} Sales
                                </span>
                              )}
                              <div className="d-flex align-items-center gap-1">
                                <ul className="star-rating">
                                  {/* Render simple de 5 estrellas o según p.rating */}
                                  {[...Array(5)].map((_, i) => (
                                    <li className="star-rating__item font-11" key={i}>
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

                            <Link to={`/product-details/${p.slug || p.id}`} className="btn btn-outline-light btn-sm pill">
                              Ver detalles
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Si no hay productos, muestra un vacío bonito */}
                  {productos.length === 0 && (
                    <div className="col-12">
                      <div className="text-center py-5 text-body">
                        No hay productos disponibles.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>{/* row */}
      </div>{/* container */}
    </section>
  );
};

export default AllProduct;