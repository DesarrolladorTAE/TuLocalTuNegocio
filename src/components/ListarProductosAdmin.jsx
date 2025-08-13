import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductEditModal from "./ProductEditModal";
import { fetchCategorias } from "../service"; // <- asegúrate que exista

const currency = (n) =>
    new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 2,
    }).format(Number(n || 0));

const firstImg = (images) =>
    Array.isArray(images) && images.length
        ? images.find((i) => Number(i.is_main) === 1)?.img_url || images[0]?.img_url
        : "/assets/images/placeholder-64.png";

export default function VendorProductsPage() {
    const navigate = useNavigate();
    const { state } = useLocation();

    // persistimos cuando venimos navegando
    useEffect(() => {
        if (state?.vendor && Array.isArray(state?.products)) {
            sessionStorage.setItem(
                "vendorProductsPage",
                JSON.stringify({ vendor: state.vendor, products: state.products })
            );
        }
    }, [state]);

    // rehidratación
    const persisted = (() => {
        try {
            const raw = sessionStorage.getItem("vendorProductsPage");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    const vendor = state?.vendor || persisted?.vendor || null;
    const [rows, setRows] = useState(state?.products || persisted?.products || []);

    useEffect(() => {
        if (!vendor) navigate(-1);
    }, [vendor, navigate]);

    // Catálogo de categorías (para el modal)
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        let cancel = false;
        (async () => {
            try {
                const res = await fetchCategorias();
                const list = Array.isArray(res) ? res : res?.data;
                if (!cancel && Array.isArray(list)) setCategories(list);
            } catch (e) {
                console.error("Error cargando categorías:", e);
            }
        })();
        return () => {
            cancel = true;
        };
    }, []);

    const [editOpen, setEditOpen] = useState(false);
    const [current, setCurrent] = useState(null);

    const title = useMemo(
        () => (vendor ? `Productos de ${vendor.name}` : "Productos"),
        [vendor]
    );

    // util para resolver la categoría (objeto) por id
    const resolveCategory = (catId) =>
        categories?.find((c) => Number(c.id) === Number(catId)) || null;

    const persist = (nextRows) => {
        try {
            sessionStorage.setItem(
                "vendorProductsPage",
                JSON.stringify({ vendor, products: nextRows })
            );
        } catch { }
    };


    return (
        <>
            <style>{`
        .vendor-table thead th {
          background: #f6f8fb;
          color: #0f172a;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: middle;
        }
        .vendor-table tbody td {
          color: #111827;
          border-color: #eef2f7;
          vertical-align: middle;
        }
        .vendor-table tbody tr:hover td { background: #fafbff; }
        .vendor-table .fw-600 { font-weight: 600; }
        .vendor-table img {
          box-shadow: 0 0 0 1px rgba(0,0,0,0.04);
          border-radius: 8px;
        }
        .badge.bg-success { color: #fff; }
        .badge.bg-secondary { color: #111827; background-color: #e5e7eb !important; }
      `}</style>

            <div className="dashboard-body__content">
                <div className="card common-card">
                    <div className="card-header">
                        <h6 className="title">{title}</h6>
                    </div>

                    <div className="card-body">
                        <div className="row gy-4">
                            {/* Sidebar */}
                            <div className="col-lg-4 pe-xl-5">
                                <div className="setting-sidebar top-24">
                                    <h6 className="setting-sidebar__title">Vendedor</h6>

                                    <div className="card common-card border border-gray-five overflow-hidden mb-24">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                <img
                                                    src={vendor?.avatar_url || "/assets/images/thumbs/author-details-img.png"}
                                                    alt={vendor?.name}
                                                    style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
                                                    onError={(e) =>
                                                        (e.currentTarget.src = "/assets/images/thumbs/author-details-img.png")
                                                    }
                                                />
                                                <div>
                                                    <div className="fw-600">{vendor?.name || "—"}</div>
                                                    <div className="text-muted font-12">{vendor?.email || "—"}</div>
                                                    <div className="text-muted font-12">{vendor?.phone || "—"}</div>
                                                </div>
                                            </div>

                                            <div className="d-grid gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-main btn-sm"
                                                    onClick={() => navigate(-1)}
                                                >
                                                    ← Regresar
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <ul className="setting-sidebar-list">
                                        <li className="setting-sidebar-list__item">
                                            <span className="setting-sidebar-list__link active">
                                                Total productos: {rows?.length || 0}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Contenido principal */}
                            <div className="col-lg-8">
                                <div className="card common-card border border-gray-five overflow-hidden mb-24">
                                    <div className="card-header">
                                        <h6 className="title">Listado</h6>
                                    </div>

                                    <div className="card-body">
                                        {rows?.length ? (
                                            <div className="table-responsive">
                                                <table className="table table-hover vendor-table align-middle">
                                                    <thead>
                                                        <tr>
                                                            <th>Imagen</th>
                                                            <th>Nombre</th>
                                                            <th>Categoría</th>
                                                            <th>Precio</th>
                                                            <th>Stock</th>
                                                            <th>Status</th>
                                                            <th style={{ width: 120 }}>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {rows.map((p) => (
                                                            <tr key={p.id}>
                                                                <td>
                                                                    <img
                                                                        src={firstImg(p.images)}
                                                                        alt={p.name}
                                                                        style={{ width: 54, height: 54, objectFit: "cover" }}
                                                                        onError={(e) =>
                                                                        (e.currentTarget.src =
                                                                            "/assets/images/nuevas/imagendefault.png")
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="fw-600">{p.name}</td>
                                                                <td>
                                                                    {p.category?.name ? (
                                                                        <span className="badge bg-light text-dark">
                                                                            {p.category.name}
                                                                        </span>
                                                                    ) : (
                                                                        "—"
                                                                    )}
                                                                </td>
                                                                <td>{currency(p.price)}</td>
                                                                <td>{p.stock ?? 0}</td>
                                                                <td>
                                                                    <span
                                                                        className={
                                                                            p.status === "activo"
                                                                                ? "badge bg-success"
                                                                                : "badge bg-secondary"
                                                                        }
                                                                    >
                                                                        {p.status || "—"}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => {
                                                                            setCurrent(p);
                                                                            setEditOpen(true);
                                                                        }}
                                                                    >
                                                                        Editar
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-muted">Este vendedor no tiene productos.</div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn w-100 btn-main btn-md"
                                    onClick={() => navigate(-1)}
                                >
                                    Volver
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {editOpen && current && (
                <ProductEditModal
                    vendorId={vendor.id}
                    open={editOpen}

                    onClose={() => {
                        setEditOpen(false);
                        setCurrent(null);
                    }}

                    product={current}
                    categories={categories} // << pásalas al modal
                    onSubmit={(values) => {
                        // normaliza numéricos
                        const next = {
                            ...values,
                            id: current.id, // por si lo necesitas enviar
                            price: Number(values.price ?? 0),
                            stock: Number(values.stock ?? 0),
                            category_id: Number(values.category_id ?? current.category_id),
                        };

                        // resuelve el objeto de categoría para reflejar nombre en la tabla
                        const catObj = resolveCategory(next.category_id) || current.category || null;

                        setRows((prev) =>
                            prev.map((r) =>
                                r.id === current.id
                                    ? {
                                        ...r,
                                        ...next,
                                        category: catObj ? { ...catObj } : r.category,
                                    }
                                    : r
                            )
                        );

                        setEditOpen(false);
                        setCurrent(null);
                    }}
                    onUpdated={(pActualizado) => {
                        setRows((prev) => {
                            const next = prev.map((r) =>
                                Number(r.id) === Number(pActualizado.id) ? { ...r, ...pActualizado } : r
                            );
                            persist(next);
                            return next;
                        });
                    }}

                    // ✅ cuando el modal elimina un producto
                    onDeleted={(id) => {
                        setRows((prev) => {
                            const next = prev.filter((r) => Number(r.id) !== Number(id));
                            persist(next);
                            return next;
                        });
                    }}
                />
            )}
        </>
    );
}
