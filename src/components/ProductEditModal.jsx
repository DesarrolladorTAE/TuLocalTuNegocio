import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { actualizarProdcutoAdmin, elimarProdAdmin, refreshProdAdmin } from "../service/indexAdmin";
import { useDropzone } from "react-dropzone";

export default function ProductEditModal({
    open,
    onClose,
    product,
    categories = [],
    vendorId,
    onUpdated,
    onDeleted
}) {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            name: "",
            price: "",
            stock: "",
            status: "activo",
            category_id: "",
            description: "",
            // pivot por defecto
            pivot_stock: 0,
            pivot_is_active: true,
            pivot_available_from: "",
            pivot_available_to: "",
            pivot_notes: "",
            // locations
            sync_locations: false,
            selected_address_ids: [], // checkboxes
            // nueva address opcional
            address_recipient: "",
            address_phone: "",
            address_street: "",
            address_ext_no: "",
            address_int_no: "",
            address_neighborhood: "",
            address_city: "",
            address_state: "",
            address_zip: "",
            address_references: "",
        },
    });

    // Manejo de imágenes en UI (previews)
    // const [imageFiles, setImageFiles] = useState([]); // File[]
    // const [imagePreviews, setImagePreviews] = useState([]); // [{url, name, size}]
    const [slots, setSlots] = useState(Array(10).fill(null)); // 10 slots

    useEffect(() => {
        if (!product) return;
        const existing = Array.isArray(product.images) ? product.images : [];
        const seed = existing.slice(0, 10).map((img) => ({ url: img.img_url })); // usa img_url del API
        const filled = [...seed];
        while (filled.length < 10) filled.push(null);
        setSlots(filled);
    }, [product]);

    // Helpers de slots
    const setSlot = (i, val) =>
        setSlots((prev) => {
            const next = [...prev];
            next[i] = val;
            return next;
        });

    const handleDropFile = (i, item) => setSlot(i, item);
    const handleClear = (i) => setSlot(i, null);

    useEffect(() => {
        console.log('Prodcutos: ', product)
        if (product) {
            reset({
                name: product.name ?? "",
                price: product.price ?? "",
                stock: product.stock ?? 0,
                status: product.status ?? "activo",
                category_id: product.category_id ?? product.category?.id ?? "",
                description: product.description ?? "",
                // pivot default: si hay locations, usa la primera como base para mostrar
                pivot_stock: product.locations?.[0]?.pivot?.stock ?? 0,
                pivot_is_active: (product.locations?.[0]?.pivot?.is_active ?? 1) === 1,
                pivot_available_from: product.locations?.[0]?.pivot?.available_from ?? "",
                pivot_available_to: product.locations?.[0]?.pivot?.available_to ?? "",
                pivot_notes: product.locations?.[0]?.pivot?.notes ?? "",
                // por defecto, si ya tiene locations, marcarlas
                selected_address_ids: (product.locations || []).map((l) => String(l.id)),
            });
        }
    }, [product, reset]);

    const buildFormFromProduct = (p) => ({
        name: p?.name ?? "",
        price: p?.price ?? "",
        stock: p?.stock ?? 0,
        status: p?.status ?? "activo",
        category_id: p?.category_id ?? p?.category?.id ?? "",
        description: p?.description ?? "",
        // pivot por defecto: usa la primera location si existe
        pivot_stock: p?.locations?.[0]?.pivot?.stock ?? 0,
        pivot_is_active: (p?.locations?.[0]?.pivot?.is_active ?? 1) === 1,
        pivot_available_from: p?.locations?.[0]?.pivot?.available_from ?? "",
        pivot_available_to: p?.locations?.[0]?.pivot?.available_to ?? "",
        pivot_notes: p?.locations?.[0]?.pivot?.notes ?? "",
        // marcar como seleccionadas las locations existentes
        selected_address_ids: (p?.locations || []).map((l) => String(l.id)),

        // campos de “nueva address” en blanco
        sync_locations: false,
        address_recipient: "",
        address_phone: "",
        address_street: "",
        address_ext_no: "",
        address_int_no: "",
        address_neighborhood: "",
        address_city: "",
        address_state: "",
        address_zip: "",
        address_references: "",
    });

    const buildSlotsFromProduct = (p) => {
        const existing = Array.isArray(p?.images) ? p.images : [];
        // cache-busting suave para que el preview no quede en caché del navegador
        const seed = existing.slice(0, 10).map((img) => ({
            url: `${img.img_url}?t=${Date.now()}`
        }));
        const filled = [...seed];
        while (filled.length < 10) filled.push(null);
        return filled;
    };

    // terminar la función:
    const refreshProduct = async () => {
        try {
            const res = await refreshProdAdmin(vendorId);
            // 1) encuentra el producto actualizado por id
            const p = res?.products?.find((x) => Number(x.id) === Number(product?.id));

            if (!p) {
                console.warn("Producto no encontrado en el refresh:", product?.id);
                return;
            }

            // 2) resetea el form con los datos frescos
            reset(buildFormFromProduct(p));

            // 3) actualiza los slots de imágenes
            setSlots(buildSlotsFromProduct(p));

            // 4) (opcional) notifica al padre para refrescar su estado/lista
            if (onUpdated) onUpdated(p);

            // 5) (opcional) podrías refrescar también el “product” local si lo manejas en estado
            // pero como viene por props, el onUpdated hará que el padre te re-renderice con p
        } catch (err) {
            console.log("err", err);
            alert("No se pudo refrescar datos del vendedor / producto.");
        }
    };
    const selectedAddressIds = watch("selected_address_ids");

    if (!open) return null;

    const onSubmit = async (values) => {
        // Construir FormData EXACTO para el validador del backend
        const fd = new FormData();

        // Identificadores
        if (vendorId) fd.append("idVendedor", Number(vendorId));
        if (product?.id) fd.append("id", Number(product.id)); // por salud futura

        console.log('vendedor: ', vendorId)
        console.log('product?.id: ', product?.id)

        // Campos base
        fd.append("name", values.name);
        fd.append("price", String(values.price ?? 0));
        fd.append("stock", String(values.stock ?? 0));
        if (values.category_id) fd.append("category_id", String(values.category_id));
        if (values.status) fd.append("status", values.status);
        if (values.description) fd.append("description", values.description);

        const newFiles = slots.filter((s) => s?.file).map((s) => s.file);
        if (newFiles.length > 0) {
            newFiles.forEach((f) => fd.append("images[]", f));
        }

        // Locations existentes seleccionadas
        (values.selected_address_ids || []).forEach((id, i) => {
            // aseguramos número como string
            fd.append(`address_ids[${i}]`, String(id));
        });

        // Nueva address opcional (solo si se capturó recipient, phone y street)
        const hasNewAddress =
            values.address_recipient || values.address_phone || values.address_street;
        if (hasNewAddress) {
            if (values.address_recipient) fd.append("address[recipient]", values.address_recipient);
            if (values.address_phone) fd.append("address[phone]", values.address_phone);
            if (values.address_street) fd.append("address[street]", values.address_street);
            if (values.address_ext_no) fd.append("address[ext_no]", values.address_ext_no);
            if (values.address_int_no) fd.append("address[int_no]", values.address_int_no);
            if (values.address_neighborhood) fd.append("address[neighborhood]", values.address_neighborhood);
            if (values.address_city) fd.append("address[city]", values.address_city);
            if (values.address_state) fd.append("address[state]", values.address_state);
            if (values.address_zip) fd.append("address[zip]", values.address_zip);
            if (values.address_references) fd.append("address[references]", values.address_references);
        }

        // Control de asociación
        fd.append("sync_locations", values.sync_locations ? "1" : "0");

        // Pivot defaults (se aplican a todas las locations enviadas)
        fd.append("pivot[stock]", String(values.pivot_stock ?? 0));
        fd.append("pivot[is_active]", values.pivot_is_active ? "1" : "0");
        if (values.pivot_available_from) fd.append("pivot[available_from]", values.pivot_available_from);
        if (values.pivot_available_to) fd.append("pivot[available_to]", values.pivot_available_to);
        if (values.pivot_notes) fd.append("pivot[notes]", values.pivot_notes);

        try {
            const res = await actualizarProdcutoAdmin(fd);
            // Opcional: callback con el producto actualizado
            if (onUpdated && res?.product) onUpdated(res.product);
            onClose();
            refreshProduct()
        } catch (err) {
            // Puedes adaptar a tu sistema de alerts/toasts
            console.log("Error al actualizar producto:", err);
            alert(
                err?.message ||
                err?.errors?.[Object.keys(err?.errors || {})[0]]?.[0] ||
                "No se pudo actualizar el producto"
            );
        }
    };

    const eliminarProd = () => {
        if (!product?.id || !vendorId) return;

        const data = { id: product.id, userID: vendorId };

        elimarProdAdmin(data)
            .then((res) => {
                // 1) quita de la lista inmediatamente
                if (onDeleted) onDeleted(product.id);

                // 2) (opcional) refresca desde backend para alinear totales/contador
                refreshVendorProducts(); // 👈 ver función abajo

                // 3) cierra modal
                onClose();
            })
            .catch((err) => {
                console.log(err);
                alert("No se pudo eliminar el producto.");
            });
    };

    const refreshVendorProducts = async () => {
        try {
            const res = await refreshProdAdmin(vendorId);
            // si tu padre quiere toda la lista fresca, puedes exponer otro callback
            if (res?.products && onUpdated) {
                // opción A: envía la lista completa con una bandera
                onUpdated({ __all__: true, products: res.products });
            }
        } catch (e) {
            console.log("No se pudo refrescar el vendedor:", e);
        }
    };


    function ImageSlot({ index, value, onDropFile, onClear }) {
        const { getRootProps, getInputProps, isDragActive } = useDropzone({
            multiple: false,
            accept: { "image/*": [] },
            onDrop: (accepted) => {
                const f = accepted?.[0];
                if (f) {
                    const url = URL.createObjectURL(f);
                    onDropFile(index, { file: f, url });
                }
            },
        });

        return (
            <div
                className="position-relative border rounded d-flex align-items-center justify-content-center"
                style={{
                    width: "100%",      // Ahora ocupa todo el ancho de su celda
                    aspectRatio: "1/1", // Mantiene proporción cuadrada
                    overflow: "hidden",
                    background: "#0b1220",
                    borderStyle: isDragActive ? "dashed" : "solid",
                    cursor: "pointer",
                }}
                title={value ? "Haz clic para reemplazar" : "Arrastra o haz clic para cargar"}
                {...getRootProps()}
            >
                <input {...getInputProps()} />
                {value ? (
                    <>
                        <img
                            src={value.url}
                            alt={`slot-${index + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClear(index);
                            }}
                            title="Quitar"
                        >
                            ×
                        </button>
                    </>
                ) : (
                    <div className="text-center px-2" style={{ color: "#9fb3c8", fontSize: 12 }}>
                        <div style={{ fontSize: 20, lineHeight: 1 }}>＋</div>
                        <div>Agregar</div>
                    </div>
                )}
                {index === 0 && (
                    <span className="badge bg-success position-absolute start-0 bottom-0 rounded-0 px-2">
                        Principal
                    </span>
                )}
            </div>
        );
    }

    // UI
    return (
        <div
            className="modal d-block"
            tabIndex={-1}
            role="dialog"
            onClick={onClose}
            style={{ background: "rgba(15, 23, 42, .45)", zIndex: 1050 }}
        >
            <div className="modal-dialog modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-header">
                            <h5 className="modal-title">Editar producto</h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
                        </div>

                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Nombre</label>
                                    <input
                                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                        {...register("name", { required: "Requerido" })}
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Precio</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={`form-control ${errors.price ? "is-invalid" : ""}`}
                                        {...register("price", {
                                            required: "Requerido",
                                            min: { value: 0, message: "No negativo" },
                                        })}
                                    />
                                    {errors.price && <div className="invalid-feedback">{errors.price.message}</div>}
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Stock</label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.stock ? "is-invalid" : ""}`}
                                        {...register("stock", {
                                            required: "Requerido",
                                            min: { value: 0, message: "No negativo" },
                                        })}
                                    />
                                    {errors.stock && <div className="invalid-feedback">{errors.stock.message}</div>}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">Estado</label>
                                    <select className="form-select" {...register("status")}>
                                        <option value="activo">Activo</option>
                                        <option value="borrador">Borrador</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>

                                <div className="col-md-8">
                                    <label className="form-label">Categoría</label>
                                    <select
                                        className={`form-select ${errors.category_id ? "is-invalid" : ""}`}
                                        {...register("category_id", { required: "Requerido" })}
                                    >
                                        <option value="">Selecciona una categoría…</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && (
                                        <div className="invalid-feedback d-block">{errors.category_id.message}</div>
                                    )}
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Descripción</label>
                                    <textarea rows={4} className="form-control" {...register("description")} />
                                </div>

                                {/* IMÁGENES */}
                                <div className="col-12">
                                    <label className="form-label d-flex align-items-center gap-2">
                                        Imágenes (máx. 10)
                                        <small className="text-muted">Arrastra o haz clic en cada slot</small>
                                    </label>

                                    {/* Grid flexible: ocupa todo el ancho */}
                                    <div
                                        className="d-grid"
                                        style={{
                                            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                                            gap: 12,
                                        }}
                                    >
                                        {slots.map((value, i) => (
                                            <ImageSlot
                                                key={i}
                                                index={i}
                                                value={value}
                                                onDropFile={handleDropFile}
                                                onClear={handleClear}
                                            />
                                        ))}
                                    </div>

                                    <div className="form-text mt-2">
                                        Si adjuntas al menos una imagen nueva, el backend reemplazará todas las imágenes del
                                        producto por las enviadas (la primera será la principal). Si no adjuntas archivos, se
                                        conservarán las actuales.
                                    </div>
                                </div>


                                {/* LOCATIONS EXISTENTES */}
                                <div className="col-12">
                                    <div className="form-check form-switch mb-2">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="sync_locations"
                                            {...register("sync_locations")}
                                        />
                                        <label className="form-check-label" htmlFor="sync_locations">
                                            Reemplazar asociaciones de ubicaciones (sync)
                                        </label>
                                    </div>

                                    {Array.isArray(product?.locations) && product.locations.length > 0 && (
                                        <>
                                            <label className="form-label">Ubicaciones del vendedor</label>
                                            <div className="row g-2">
                                                {product.locations.map((loc) => {
                                                    const idStr = String(loc.id);
                                                    const checked = (selectedAddressIds || []).includes(idStr);
                                                    return (
                                                        <div className="col-md-6" key={loc.id}>
                                                            <div className="form-check border rounded p-2">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id={`addr_${loc.id}`}
                                                                    value={idStr}
                                                                    {...register("selected_address_ids")}
                                                                    defaultChecked={checked}
                                                                />
                                                                <label className="form-check-label" htmlFor={`addr_${loc.id}`}>
                                                                    #{loc.id} — {loc.street} {loc.ext_no || ""}, {loc.city}, {loc.state}{" "}
                                                                    {loc.zip || ""}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* NUEVA ADDRESS OPCIONAL */}
                                <div className="col-12 mt-3">
                                    <h6 className="mb-2">Agregar nueva ubicación (opcional)</h6>
                                    <div className="row g-2">
                                        <div className="col-md-6">
                                            <label className="form-label">Destinatario</label>
                                            <input className="form-control" {...register("address_recipient")} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Teléfono</label>
                                            <input className="form-control" {...register("address_phone")} />
                                        </div>
                                        <div className="col-md-8">
                                            <label className="form-label">Calle</label>
                                            <input className="form-control" {...register("address_street")} />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label">No. Ext</label>
                                            <input className="form-control" {...register("address_ext_no")} />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label">No. Int</label>
                                            <input className="form-control" {...register("address_int_no")} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Colonia</label>
                                            <input className="form-control" {...register("address_neighborhood")} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Ciudad</label>
                                            <input className="form-control" {...register("address_city")} />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label">Estado</label>
                                            <input className="form-control" {...register("address_state")} />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label">C.P.</label>
                                            <input className="form-control" {...register("address_zip")} />
                                        </div>
                                        <div className="col-md-10">
                                            <label className="form-label">Referencias</label>
                                            <input className="form-control" {...register("address_references")} />
                                        </div>
                                    </div>
                                </div>

                                {/* PIVOT DEFAULTS */}
                                <div className="col-12 mt-3">
                                    <h6 className="mb-2">Parámetros por ubicación (pivot por defecto)</h6>
                                    <div className="row g-2">
                                        <div className="col-md-3">
                                            <label className="form-label">Stock</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                {...register("pivot_stock", { min: { value: 0, message: "No negativo" } })}
                                            />
                                        </div>
                                        <div className="col-md-3 d-flex align-items-end">
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="pivot_is_active"
                                                    {...register("pivot_is_active")}
                                                />
                                                <label className="form-check-label" htmlFor="pivot_is_active">
                                                    Activo
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Disponible desde</label>
                                            <input type="date" className="form-control" {...register("pivot_available_from")} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Disponible hasta</label>
                                            <input type="date" className="form-control" {...register("pivot_available_to")} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Notas</label>
                                            <input className="form-control" {...register("pivot_notes")} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={eliminarProd}
                                disabled={isSubmitting}
                            >
                                Eliminar
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Guardando…" : "Guardar cambios"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
