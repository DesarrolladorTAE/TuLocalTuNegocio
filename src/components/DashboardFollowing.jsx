import { useEffect, useState } from "react";
import { mostrarUsuario } from "../service/indexAdmin";
import { useNavigate } from "react-router-dom";

const fmtMesAnio = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
    });
  } catch {
    return "—";
  }
};

// util: obtener imágenes de productos [{src, title}]
const getProductThumbs = (products = []) => {
  const thumbs = [];
  for (const p of products) {
    if (Array.isArray(p.images) && p.images.length) {
      // prioriza is_main, si no, toma la primera
      const main = p.images.find((i) => Number(i.is_main) === 1) || p.images[0];
      thumbs.push({ src: main.img_url, title: p.name });
    }
  }
  return thumbs;
};

// fallback avatar en caso de que no venga
const AVATAR_FALLBACK = "/assets/images/thumbs/author-details-img.png";

const DashboardFollowing = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        // asumiendo que mostrarUsuario(2) devuelve el arreglo de vendedores (role 2)
        const res = await mostrarUsuario(2);
        console.log('respuesta: ', res)
        if (!cancel) {
          const list = Array.isArray(res) ? res : res?.data || [];
          setVendors(list);
        }
      } catch (e) {
        if (!cancel) setErr(e?.message || "Error cargando vendedores");
        console.error(e);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="dashboard-body__content">
        <div className="card common-card">
          <div className="card-body">Cargando vendedores…</div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="dashboard-body__content">
        <div className="card common-card">
          <div className="card-body text-danger">{err}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-body__content">
      <div className="card common-card">
        <div className="card-body">
          Vendedores
          <div className="follow-wrapper">
            {vendors.map((v) => {
              const avatar = v.avatar_url || AVATAR_FALLBACK;
              const thumbs = getProductThumbs(v.products);
              const itemsCount = v.products?.length || 0;

              return (
                <div className="follow-item" key={v.id}>
                  {/* Autor / Avatar */}
                  <div className="follow-item__author">
                    <div className="d-flex align-items-start gap-2">
                      <div className="author-details__thumb flex-shrink-0">
                        <img
                          src={avatar}
                          alt={v.name}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                          onError={(e) => {
                            e.currentTarget.src = AVATAR_FALLBACK;
                          }}
                        />
                      </div>

                      <div className="author-details__content">
                        <h6 className="author-details__name font-18 mb-2">
                          {v.name}
                        </h6>

                        {/* Mini iconos: imágenes de productos con title */}
                        <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                          {thumbs.length ? (
                            thumbs.map((t, idx) => (
                              <li
                                key={idx}
                                className="badge-list__item"
                                title={t.title}
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                data-bs-title={t.title}
                              >
                                <img
                                  src={t.src}
                                  alt={t.title}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    objectFit: "cover",
                                    borderRadius: 6,
                                  }}
                                />
                              </li>
                            ))
                          ) : (
                            <li className="text-muted font-12">
                              Sin imágenes de productos
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Meta del vendedor */}
                  <div className="follow-item__meta">
                    <strong className="font-11 fw-600 text-heading">
                      {itemsCount} {itemsCount === 1 ? "Producto" : "Productos"}
                      <br />
                      Email: {v.email || "—"}
                      <br />
                      Tel: {v.phone || "—"}
                      <br />
                      Miembro desde: {fmtMesAnio(v.created_at)}
                    </strong>
                  </div>

                  {/* Panel derecho: si aún quieres mostrar “Sales / ratings”, lo dejamos como N/A */}
                  {/* Panel derecho: info creativa de productos */}
                  <div className="follow-item__sales">
                    <div className="sales">
                      <span className="sales__text mb-1 font-13 text-heading fw-500">
                        Inventario
                      </span>

                      {/* Stock total */}
                      <h6 className="sales__amount mb-0 font-body">
                        {v.products?.reduce((sum, p) => sum + Number(p.stock || 0), 0) || 0} unidades
                      </h6>

                      {/* Producto más reciente */}
                      <span className="star-rating__text text-heading font-12 fw-500 d-block mt-1">
                        Más reciente:{" "}
                        {v.products?.length
                          ? v.products
                            .slice()
                            .sort(
                              (a, b) => new Date(b.created_at) - new Date(a.created_at)
                            )[0].name
                          : "—"}
                      </span>

                      {/* Precio promedio */}
                      {v.products?.length > 0 && (
                        <span className="star-rating__text text-heading font-12 fw-500 d-block">
                          Precio promedio:{" "}
                          {new Intl.NumberFormat("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          }).format(
                            v.products.reduce((sum, p) => sum + Number(p.price || 0), 0) /
                            v.products.length
                          )}
                        </span>
                      )}

                      {/* Categorías distintas */}
                      {v.products?.length > 0 && (
                        <span className="star-rating__text text-heading font-12 fw-500 d-block">
                          Categorías:{" "}
                          {[...new Set(v.products.map((p) => p.category?.name).filter(Boolean))]
                            .slice(0, 2)
                            .join(", ") || "—"}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-main pill px-4"
                    onClick={() =>
                      navigate(`/vendedor/${v.id}/products`, {
                        state: {
                          vendor: {
                            id: v.id,
                            name: v.name,
                            email: v.email,
                            phone: v.phone,
                            created_at: v.created_at,
                            avatar_url: v.avatar_url,
                          },
                          // 🔽 Enviamos los productos con TODOS los campos que el modal necesita
                          products: (v.products ?? []).map(p => ({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            stock: p.stock,
                            status: p.status,
                            // ✅ Claves que usa el reset()
                            description: p.description ?? "",
                            category_id: p.category_id ?? p.category?.id ?? null,
                            category: p.category ?? null,

                            // ✅ Imágenes con shape { id?, img_url, is_main }
                            images: Array.isArray(p.images)
                              ? p.images.map(img => ({
                                id: img.id,
                                img_url: img.img_url,
                                is_main: Number(img.is_main) === 1 ? 1 : 0,
                              }))
                              : [],

                            // ✅ Locations con su pivot (stock, is_active, available_from/to, notes)
                            locations: Array.isArray(p.locations)
                              ? p.locations.map(loc => ({
                                id: loc.id,
                                recipient: loc.recipient ?? "",
                                phone: loc.phone ?? "",
                                street: loc.street ?? "",
                                ext_no: loc.ext_no ?? "",
                                int_no: loc.int_no ?? "",
                                neighborhood: loc.neighborhood ?? "",
                                city: loc.city ?? "",
                                state: loc.state ?? "",
                                zip: loc.zip ?? "",
                                references: loc.references ?? "",
                                // pivot puede venir undefined; normalizamos
                                pivot: loc.pivot
                                  ? {
                                    stock: Number(loc.pivot.stock ?? 0),
                                    is_active: Number(loc.pivot.is_active ?? 0),
                                    available_from: loc.pivot.available_from ?? "",
                                    available_to: loc.pivot.available_to ?? "",
                                    notes: loc.pivot.notes ?? "",
                                  }
                                  : null,
                              }))
                              : [],
                          })),
                        },
                      })
                    }
                  >
                    Ver productos
                  </button>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFollowing;
