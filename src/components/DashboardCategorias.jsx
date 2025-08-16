import { useEffect, useMemo, useRef, useState } from "react";
import { fetchCategorias } from "../service/index";
import { crearCategoria, actualizarCategoria, eliminarCategoria } from "../service/indexAdmin";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// function logFormData(fd) {
//     const out = {};
//     for (const [k, v] of fd.entries()) {
//         out[k] = v instanceof File ? `{File: ${v.name} (${v.type}, ${v.size}B)}` : v;
//     }
//     console.log("FormData =>", out);
// }


export default function DashboardCategorias() {
    const [loading, setLoading] = useState(false);
    const [cats, setCats] = useState([]);
    const [filter, setFilter] = useState("");
    //@ts-ignore
    const [selected, setSelected] = useState(null);
    const [saving, setSaving] = useState(false);

    // collapse del formulario
    const [openForm, setOpenForm] = useState(false);
    const collapseRef = useRef(null);

    const [form, setForm] = useState({
        id: null,
        name: "",
        parent_id: "",
        description: "",
        image: null,
        imagePreview: null,
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success", // 'success' | 'error' | 'info' | 'warning'
    });

    const formatBytes = (bytes) => {
        if (!Number.isFinite(bytes)) return "";
        const units = ["B", "KB", "MB", "GB"];
        let i = 0, v = bytes;
        while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
        const p = v < 10 && i > 0 ? 1 : 0;
        return `${v.toFixed(p)} ${units[i]}`;
    };

    const showSnack = (message, severity = "success") =>
        setSnackbar({ open: true, message, severity });

    const closeSnack = (_e, reason) => {
        if (reason === "clickaway") return;
        setSnackbar((s) => ({ ...s, open: false }));
    };

    // Opcional: formatear errores de Axios/Laravel
    const getErrorMsg = (err) =>
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Ocurrió un error";

    // ===== Cargar categorías =====
    const fetchCats = async () => {
        try {
            setLoading(true);
            const res = await fetchCategorias();
            const list = Array.isArray(res) ? res : res?.data || [];
            const norm = list
                .map((c) => ({
                    id: c.id,
                    name: c.name ?? "",
                    slug: c.slug ?? "",
                    description: c.description ?? "",
                    parent_id: c.parent_id ?? null,
                    image_url: c.image_url ?? null,
                    parent: c.parent ?? null,
                    children: Array.isArray(c.children) ? c.children : [],
                    created_at: c.created_at,
                    updated_at: c.updated_at,
                }))
                .sort((a, b) => a.name.localeCompare(b.name, "es"));
            setCats(norm);
        } catch (e) {
            console.error("Error cargando categorías:", e);
            setCats([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCats();
    }, []);

    // ===== Helpers =====
    const parents = useMemo(
        () => cats.filter((c) => c.parent_id === null),
        [cats]
    );

    const byFilter = useMemo(() => {
        const q = (filter || "").toLowerCase();
        if (!q) return cats;
        return cats.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                String(c.id).includes(q) ||
                (c.slug || "").toLowerCase().includes(q)
        );
    }, [cats, filter]);

    const resetForm = () =>
        setForm({
            id: null,
            name: "",
            parent_id: "",
            description: "",
            image: null,
            imagePreview: null,
        });

    const openAndScrollForm = () => {
        setOpenForm(true);
        setTimeout(() => {
            collapseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
    };

    const toEdit = (cat) => {
        setSelected(cat.id);
        setForm({
            id: cat.id,
            name: cat.name || "",
            parent_id: cat.parent_id ?? "",
            description: cat.description || "",
            image: null,
            imagePreview: cat.image_url || null,
        });
        openAndScrollForm();
    };

    const toCreate = () => {
        setSelected(null);
        resetForm();
        openAndScrollForm();
    };

    const onChangeFile = (file) => {
        if (!file) {
            setForm((f) => ({ ...f, image: null, imagePreview: f.id ? f.imagePreview : null }));
            return;
        }
        const url = URL.createObjectURL(file);
        setForm((f) => ({ ...f, image: file, imagePreview: url }));
    };

    // ===== Handlers (por ahora solo loguean) =====

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const fd = new FormData();
            fd.append("name", form.name.trim());

            const pid = form.parent_id === "" ? null : Number(form.parent_id);
            if (pid !== null && Number.isFinite(pid)) fd.append("parent_id", String(pid));

            if (form.description) fd.append("description", form.description);
            if (form.image) fd.append("image", form.image);

            await crearCategoria(fd);
            await fetchCats();
            toCreate();
            showSnack("Categoría creada correctamente", "success");
        } catch (err) {
            console.error(err);
            showSnack(getErrorMsg(err), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!form.id) return;

        try {
            setSaving(true);
            const fd = new FormData();
            fd.append("id", String(form.id));
            fd.append("name", form.name.trim());

            const pid = form.parent_id === "" ? null : Number(form.parent_id);
            if (pid !== null && Number.isFinite(pid)) fd.append("parent_id", String(pid));

            if (form.description) fd.append("description", form.description);
            if (form.image) fd.append("image", form.image);

            await actualizarCategoria(fd);
            await fetchCats();
            showSnack("Categoría actualizada", "success");
        } catch (err) {
            console.error(err);
            showSnack(getErrorMsg(err), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!form.id) return;
        if (!window.confirm("¿Eliminar esta categoría?")) return;

        try {
            setSaving(true);
            await eliminarCategoria({ id: Number(form.id) });
            await fetchCats();
            toCreate();
            showSnack("Categoría eliminada", "success");
        } catch (err) {
            console.error(err);
            showSnack(getErrorMsg(err), "error");
        } finally {
            setSaving(false);
        }
    };

    const bust = (url, version) => {
        if (!url) return "";
        const v = version ? new Date(version).getTime() : Date.now();
        return `${url}${url.includes("?") ? "&" : "?"}v=${v}`;
    };

    // ===== UI =====
    return (
        <section className="padding-y-10">
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={closeSnack}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={closeSnack}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
            <div className="container container-two">

                {/* Encabezado compactado (sin buscador aquí) */}
                <div className="d-flex align-items-center justify-content-between mb-3 mt-3">
                    <div className="d-flex align-items-center gap-3">
                        <h4 className="mb-0">Categorías</h4>
                        <span className="badge bg-light text-body">
                            {loading ? "Cargando…" : `${cats.length} total`}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="btn btn-outline-light pill"
                        onClick={() => setOpenForm((o) => !o)}
                        aria-expanded={openForm}
                        aria-controls="cat-form-collapse"
                        ref={collapseRef}
                    >
                        {openForm ? "Ocultar formulario" : "Agregar / Editar categoría"}
                    </button>
                </div>

                {/* ==== Collapse del formulario ==== */}
                <div
                    id="cat-form-collapse"
                    className="mb-4"
                    style={{
                        display: openForm ? "block" : "none",
                    }}
                >
                    <div className="p-3 p-lg-4 border rounded bg-white">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h5 className="mb-0">
                                {form.id ? `Editar categoría #${form.id}` : "Nueva categoría"}
                            </h5>
                            {form.id ? (
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm pill"
                                    onClick={handleDelete}
                                >
                                    Eliminar
                                </button>
                            ) : null}
                        </div>

                        <form onSubmit={form.id ? handleUpdate : handleCreate}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Nombre *</label>
                                    <input
                                        type="text"
                                        className="common-input common-input--md"
                                        value={form.name}
                                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        placeholder="Ej. Electrónica"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Padre (opcional)</label>
                                    <select
                                        className="common-input common-input--md"
                                        value={form.parent_id}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, parent_id: e.target.value }))
                                        }
                                    >
                                        <option value="">— Sin padre —</option>
                                        {parents.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (#{p.id})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="form-text">
                                        Solo se listan categorías raíz como posibles “padres”.
                                    </div>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        className="common-input"
                                        rows={3}
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, description: e.target.value }))
                                        }
                                        placeholder="Descripción breve de la categoría"
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label d-flex align-items-center gap-2">
                                        Imagen (opcional)
                                        <small className="text-muted">
                                            jpg, jpeg, png, webp, avif (máx. 4MB)
                                        </small>
                                    </label>
                                    <div className="position-relative">
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp,.avif"
                                            className="form-control pe-5"  // un poco de padding derecho
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;

                                                // Chequeo front: 4 MB
                                                if (file && file.size > 4 * 1024 * 1024) {
                                                    showSnack("La imagen supera 4 MB", "error"); // usa tu snackbar de MUI
                                                    e.target.value = ""; // limpia el input
                                                    return;
                                                }

                                                onChangeFile(file);
                                            }}
                                        />

                                        {/* Tamaño a la derecha, gris, dentro del input */}
                                        {form.image && (
                                            <span
                                                className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted"
                                                style={{ pointerEvents: "none", fontSize: 12 }}
                                            >
                                                {formatBytes(form.image.size)}
                                            </span>
                                        )}
                                    </div>

                                    {form.imagePreview ? (
                                        <div className="mt-2">
                                            <img
                                                src={form.imagePreview}
                                                alt="preview"
                                                style={{
                                                    width: 120,
                                                    height: 120,
                                                    objectFit: "cover",
                                                    borderRadius: 8,
                                                    border: "1px solid rgba(0,0,0,.08)",
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                    <div className="form-text">
                                        En el backend se guarda y se sirve vía <code>image_url</code>.
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex gap-2 mt-3">
                                <button type="submit" className="btn btn-main pill" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                            {form.id ? "Guardando…" : "Creando…"}
                                        </>
                                    ) : (
                                        form.id ? "Guardar cambios" : "Crear categoría"
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline-light pill"
                                    onClick={toCreate}
                                >
                                    Limpiar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ==== Tarjeta de listado con buscador integrado ==== */}
                <div className="p-3 p-lg-4 border rounded section-bg">
                    <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                        <h6 className="mb-0">Listado</h6>

                        <div className="d-flex align-items-center gap-2">
                            <div className="search-box d-flex" style={{ maxWidth: 320 }}>
                                <input
                                    type="text"
                                    className="common-input common-input--md pill"
                                    placeholder="Buscar por nombre, slug o ID…"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="btn btn-main btn-icon icon border-0"
                                    onClick={() => setFilter(filter.trim())}
                                    aria-label="Buscar"
                                    title="Buscar"
                                >
                                    <img src="/assets/images/icons/search.svg" alt="" />
                                </button>
                            </div>

                            <button
                                className="btn btn-outline-light btn-sm pill"
                                onClick={fetchCats}
                            >
                                <i className="las la-sync-alt me-1" />
                                Actualizar
                            </button>

                            <button
                                className="btn btn-outline-light btn-sm pill"
                                onClick={toCreate}
                            >
                                + Nueva categoría
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table align-middle text-heading">
                            <thead>
                                <tr>
                                    <th style={{ width: 80 }}>ID</th>
                                    <th style={{ width: 70 }}>Img</th>
                                    <th>Nombre</th>
                                    <th>Padre</th>
                                    <th style={{ width: 160 }} className="text-end">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {byFilter.map((c) => {
                                    const parentName =
                                        c.parent_id ? cats.find((x) => x.id === c.parent_id)?.name : "—";
                                    return (
                                        <tr key={c.id}>
                                            <td>#{c.id}</td>
                                            <td>
                                                {c.image_url ? (
                                                    <img
                                                        src={bust(c.image_url, c.updated_at)}
                                                        alt={c.name}
                                                        style={{
                                                            width: 44,
                                                            height: 44,
                                                            objectFit: "cover",
                                                            borderRadius: 6,
                                                            border: "1px solid rgba(0,0,0,.08)",
                                                        }}
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = "/assets/images/thumbs/placeholder-product.png";
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td>{c.name}</td>
                                            <td>{parentName || "—"}</td>
                                            <td className="text-end">
                                                <div className="d-inline-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-light pill"
                                                        onClick={() => toEdit(c)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger pill"
                                                        onClick={() => {
                                                            setForm((f) => ({
                                                                ...f,
                                                                id: c.id,
                                                                name: c.name,
                                                                parent_id: c.parent_id ?? "",
                                                                description: c.description || "",
                                                                image: null,
                                                                imagePreview: c.image_url || null,
                                                            }));
                                                            setSelected(c.id);
                                                            setOpenForm(true);
                                                            handleDelete();
                                                        }}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {byFilter.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-body">
                                            {loading ? "Cargando…" : "Sin resultados"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* listado */}
            </div>
        </section>
    );
}
