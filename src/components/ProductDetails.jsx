import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MoreItems from "./MoreItems"; // ajusta la ruta si aplica
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const money = (v) => {
  const n = Number(v ?? 0);
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  });
};

// 👇 helper fuera del componente (no usa hooks)
const orderImages = (images = []) => {
  const uniq = [];
  const seen = new Set();
  images.forEach((i) => {
    if (!i?.img_url) return;
    if (seen.has(i.img_url)) return;
    seen.add(i.img_url);
    uniq.push(i);
  });
  // principal primero
  return uniq.sort((a, b) => Number(b.is_main) - Number(a.is_main));
};

const ProductDetails = ({ product }) => {
  // ✅ hooks siempre al tope, nunca detrás de un return
  const imgs = useMemo(() => {
    const ordered = orderImages(product?.images || []);
    const arr = ordered.length
      ? ordered.map((i) => i.img_url)
      : ["/assets/images/nuevas/imagendefault.png"];
    return arr.slice(0, 10); // hasta 10
  }, [product?.images]);

  const [idx, setIdx] = useState(0);
  const total = imgs.length;
  const [mensaje, setMensaje] = useState("");


  useEffect(() => {
    setIdx(0); // reset al cambiar de producto
  }, [product?.id]);

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  const onKey = (e) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  const touch = useRef({ x: 0, y: 0 });
  const onTouchStart = (e) => {
    const t = e.touches?.[0];
    if (t) touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - touch.current.x;
    if (Math.abs(dx) > 40) (dx > 0 ? prev() : next());
  };

  if (!product) return null; // 👈 el return puede ir después de los hooks

  const vendor = product.vendor || {};
  const category = product.category || {};

  function encodeWhatsApp(text) {
    return text
      .replace(/\n/g, "%0A")   // solo reemplazar saltos de línea
      .replace(/ /g, "%20");   // y espacios
  }

  const handleEnviar = (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    const baseUrl = 'https://tulocaltunego.com/api/graph/producto/';
    const urlProducto = `${baseUrl}${product.id}`;

    // PRIMERA línea solo el link => ayuda a preview grande
    let baseMensaje =
      `${urlProducto}\n\n` +
      `¡Hola! 👋\n` +
      `Me interesa el producto:\n` +
      `📦 *${product.name}*\n` +
      `Categoría: ${product.category.name}\n\n`;

    baseMensaje += mensaje;

    const enlace = `https://wa.me/${vendor.phone}?text=${encodeWhatsApp(baseMensaje)}`;
    window.open(enlace, "_blank");
  };


  return (
    <div className="product-details mt-32 padding-b-120">
      <div className="container container-two">
        <div className="row gy-4">
          <div className="col-lg-8">
            <div className="tab-content" id="pills-tabContent">
              <div
                className="tab-pane fade show active"
                id="pills-product-details"
                role="tabpanel"
                aria-labelledby="pills-product-details-tab"
                tabIndex={0}
              >
                {/* ===== Carrusel ===== */}
                <div
                  className="product-details__thumb position-relative"
                  tabIndex={0}
                  onKeyDown={onKey}
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                  style={{ outline: "none" }}
                >
                  <img
                    src={imgs[idx]}
                    alt={`${product.name} - imagen ${idx + 1}`}
                    style={{ width: "100%", height: "auto", borderRadius: 8, objectFit: "cover" }}
                  />

                  {total > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Anterior"
                        onClick={prev}
                        className="btn btn-white position-absolute"
                        style={{ top: "50%", left: 8, transform: "translateY(-50%)", borderRadius: 999, padding: "8px 10px" }}
                      >
                        <i className="fas fa-chevron-left" />
                      </button>
                      <button
                        type="button"
                        aria-label="Siguiente"
                        onClick={next}
                        className="btn btn-white position-absolute"
                        style={{ top: "50%", right: 8, transform: "translateY(-50%)", borderRadius: 999, padding: "8px 10px" }}
                      >
                        <i className="fas fa-chevron-right" />
                      </button>
                    </>
                  )}
                </div>

                {total > 1 && (
                  <div className="d-flex gap-2 mt-3 flex-wrap">
                    {imgs.map((src, i) => (
                      <button
                        key={src + i}
                        type="button"
                        onClick={() => setIdx(i)}
                        className="p-0 border-0"
                        style={{
                          outline: "none",
                          borderRadius: 6,
                          boxShadow: i === idx ? "0 0 0 2px var(--main)" : "none",
                        }}
                      >
                        <img
                          src={src}
                          alt={`miniatura ${i + 1}`}
                          style={{
                            width: 72,
                            height: 72,
                            objectFit: "cover",
                            borderRadius: 6,
                            opacity: i === idx ? 1 : 0.7,
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
                {/* ===== Fin Carrusel ===== */}

                {/* Botones opcionales */}
                <div className="product-details__buttons flx-align justify-content-center gap-3 mt-3">
                  <Link
                    to="#"
                    className="btn btn-main d-inline-flex align-items-center gap-2 pill px-sm-5 justify-content-center"
                  >
                    Ver producto
                    <img src="/assets/images/icons/eye-outline.svg" alt="" />
                  </Link>
                </div>

                <h1 className="mt-4">{product.name}</h1>
                <div className="mb-0 markdown-body" style={{ flex: 1 }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {product.description}
                  </ReactMarkdown>
                </div>

                <div className="product-details__item">
                  <h5 className="product-details__title mb-3">Detalles del producto</h5>
                  <ul className="product-list">
                    <li className="product-list__item"><strong>Categoría:</strong> {category.name || "-"}</li>
                    <li className="product-list__item"><strong>Stock:</strong> {product.stock ?? 0}</li>
                    <li className="product-list__item"><strong>Estatus:</strong> {product.status}</li>
                  </ul>
                </div>

                {category?.image_url && (
                  <Link
                    to={`/all-product?cat=${category.id}`}
                    className=""
                  >
                    <div className="product-details__item">
                      <h5 className="product-details__title mb-3">Categoría</h5>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={category.image_url}
                          alt={category.name}
                          style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
                        />
                        <div>
                          <div className="fw-600">{category.name}</div>
                          <div className="text-body">{category.slug}</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {vendor?.id && (
                  <Link
                    to={`/vendor/${vendor.id}`}
                    className=""
                  >
                    <div className="product-details__item">
                      <h5 className="product-details__title mb-3">Vendedor</h5>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={vendor.avatar_url || "/assets/images/thumbs/author-details-img.png"}
                          alt={vendor.name}
                          style={{ width: 64, height: 64, objectFit: "cover", borderRadius: "50%" }}
                        />
                        <div>
                          <div className="fw-600">{vendor.name}</div>
                          <div className="text-body">{vendor.email}</div>
                          {vendor.phone && <div className="text-body">{vendor.phone}</div>}
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                <MoreItems vendorId={vendor?.id} currentProductId={product.id} />
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="product-sidebar section-bg">
              <div className="product-sidebar__top position-relative flx-between gap-1">
                <h6 className="product-sidebar__title mb-0">
                  {money(product.price)}
                </h6>
              </div>

              <ul className="sidebar-list mt-3">
                <li className="sidebar-list__item flx-align gap-2 font-14 fw-300 mb-2">
                  <span className="icon"><img src="/assets/images/icons/check-cirlce.svg" alt="" /></span>
                  <span className="text">Producto verificado</span>
                </li>
                <li className="sidebar-list__item flx-align gap-2 font-14 fw-300 mb-2">
                  <span className="icon"><img src="/assets/images/icons/check-cirlce.svg" alt="" /></span>
                  <span className="text">En stock: {product.stock ?? 0}</span>
                </li>
                <li className="sidebar-list__item flx-align gap-2 font-14 fw-300">
                  <span className="icon"><img src="/assets/images/icons/check-cirlce.svg" alt="" /></span>
                  <span className="text">Categoría: {category.name || "-"}</span>
                </li>
              </ul>

              {/* <button type="button" className="btn btn-main d-flex w-100 justify-content-center align-items-center gap-2 pill px-sm-5 mt-32">
                <img src="/assets/images/icons/add-to-cart.svg" alt="" />
                Agregar al carrito
              </button> */}

              {vendor?.id && (
                <div className="author-details mt-4">
                  <div className="d-flex align-items-center gap-2">
                    <div className="author-details__thumb flex-shrink-0">
                      <img
                        src={vendor.avatar_url || "/assets/images/thumbs/author-details-img.png"}
                        alt={vendor.name}
                      />
                    </div>
                    <div className="author-details__content">
                      <h6 className="author-details__name font-18 mb-2">
                        <span className="link hover-text-main">{vendor.name}</span>
                      </h6>
                      <span className="d-flex align-items-center gap-1">
                        <span className="star-rating">
                          <span className="star-rating__item font-11"><i className="fas fa-star" /></span>
                          <span className="star-rating__item font-11"><i className="fas fa-star" /></span>
                          <span className="star-rating__item font-11"><i className="fas fa-star" /></span>
                          <span className="star-rating__item font-11"><i className="fas fa-star" /></span>
                          <span className="star-rating__item font-11"><i className="fas fa-star" /></span>
                        </span>
                        <span className="star-rating__text text-body"> 5.0</span>
                      </span>
                    </div>
                  </div>
                  <Link to={`/vendor/${vendor.id}`} className="btn btn-outline-light w-100 pill mt-32">Ver perfil del vendedor</Link>
                </div>
              )}

              <ul className="meta-attribute mt-4">
                <li className="meta-attribute__item">
                  <span className="name">Télefono</span>
                  <span className="details">
                    <a href={"tel:" + vendor.phone}>
                      {vendor.phone}
                    </a>
                  </span>
                </li>
                <li className="meta-attribute__item">
                  <span className="name">Correo</span>
                  <span className="details">
                    <a href={"mailto:" + vendor.email}> {vendor.email}</a>
                  </span>
                </li>
                {/* ========================== Profile Sidebar Start =========================== */}
                <div className="author-details">
                  <div className="">
                    <h5 className="">Enviar WhatsApp</h5>
                    <form onSubmit={handleEnviar}>
                      <div className="row gy-4">
                        <div className="col-12">
                          <textarea
                            className="common-input radius-8"
                            placeholder="Escribe tu mensaje..."
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                          />
                        </div>
                        <div className="col-12">
                          <button
                            type="submit"
                            className="btn btn-main btn-md w-100"
                          >
                            Enviar
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
