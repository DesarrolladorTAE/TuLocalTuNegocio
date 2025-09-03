import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { createProduct, actualizarUsuario, eliminarProducto } from "../service";
import { alertaSuccess, alertaError } from "../utils/alerts";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


const emptyAddress = {
  recipient: "",
  phone: "",
  street: "",
  ext_no: "",
  int_no: "",
  neighborhood: "",
  city: "",
  state: "",
  zip: "",
  references: "",
};

const MAX_FILES = 10;
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

// 👇 Componente auxiliar para mostrar un error debajo del campo
const FieldError = ({ error }) =>
  error ? <small className="text-danger d-block mt-1">{error.message || String(error)}</small> : null;

const Profile = ({ onGoToEditTab, isVendorView = false, entity, onUpdated, canEdit, products = [], categorias, onCreated, localidadesExistentes = [], refreshDatos }) => {
  const [activeButton, setActiveButton] = useState("grid-view");
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(null);
  const [editingDescripcion, setEditingDescripcion] = useState(false);
  const [localDescripcion, setLocalDescripcion] = useState();
  const [savingDescripcion, setSavingDescripcion] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const descRef = useRef(null);
  const [selectedCat, setSelectedCat] = useState(null); // null = todas
  const [searchTerm, setSearchTerm] = useState("");
  const [previews, setPreviews] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [imageDescs, setImageDescs] = useState(Array(MAX_FILES).fill("")); // descripción por slot
  const [mainIndex, setMainIndex] = useState(0); // cuál será la imagen principal


  // Categorías únicas del vendedor (a partir de products)
  const categoriasVendedor = useMemo(() => {
    const catsMap = {};
    (Array.isArray(products) ? products : []).forEach((p) => {
      if (p.category) {
        catsMap[p.category.id] = p.category;
      }
    });
    return Object.values(catsMap);
  }, [products]);

  // Filtrado por categoría y nombre
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCat ? p.category.id === selectedCat : true;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCat, searchTerm]);



  const autoResize = useCallback(() => {
    const el = descRef.current;
    if (!el) return;
    el.style.height = "auto";              // reset
    el.style.height = `${el.scrollHeight}px`; // crecer según contenido
  }, []);

  useEffect(() => {
    autoResize(); // al entrar en modo edición o cuando cambia el texto
  }, [autoResize, editingDescripcion, localDescripcion]);

  useEffect(() => {
    // console.log('erntity: ', entity)
    setLocalDescripcion(entity?.descripcion)
    // console.log('categorias: ', categorias)
  }, [entity]);

  // genera/revoca URLs cuando cambie `files`
  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviews([]);
      return;
    }
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  // === Estado para direcciones ===
  const [addressIdsInput, setAddressIdsInput] = useState(""); // "1,2,3"
  const [addressSingle, setAddressSingle] = useState({ ...emptyAddress });

  // === Estado para pivote (se sincroniza con RHF) ===
  const [pivot, setPivot] = useState({
    stock: "",
    is_active: true,
    available_from: "",
    available_to: "",
    notes: "",
  });

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    watch,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      id: "",
      name: "",
      price: "",
      stock: "",
      category_id: "",
      description: "",

      // LOCALIDADES
      selected_address_ids: [], // multi-select
      new_address: { ...emptyAddress },

      // PIVOTE por defecto
      pivot_default: {
        stock: "",
        is_active: true,
        available_from: "",
        available_to: "",
        notes: "",
      },

      // PIVOTES por localidad (opcional/overrides)
      pivots: [], // [{address_id, stock, is_active, available_from, available_to, notes}]
    },
  });

  // ===== Drop Zone =====
  const inputRef = useRef(null);
  const validateAndSetFiles = (incoming) => {
    const list = Array.from(incoming || []);
    const merged = [...files, ...list].slice(0, 10); // tope 10
    if (merged.length > 10) {
      alertaError("Solo puedes subir hasta 10 imágenes.");
      return;
    }
    const tooBig = merged.find((f) => f.size > 2 * 1024 * 1024);
    if (tooBig) {
      alertaError(`"${tooBig.name}" excede 2MB.`);
      return;
    }
    setFiles(merged);
    setImageDescs(prev => {
      const next = [...prev];
      // si entran más archivos, asegúrate de tener slots vacíos para ellos
      while (next.length < merged.length) next.push("");
      // si se recortó por tope 10, también recorta descripciones
      return next.slice(0, merged.length);
    });
  };
  const { fields: pivotFields, append: appendPivot, remove: removePivot } = useFieldArray({
    control,
    name: "pivots",
  });

  // arriba del componente
  const selectedIds = watch("selected_address_ids") || [];
  const newAddr = watch("new_address") || {};
  const hasNewAddrInput = Object.values(newAddr).some(v => (v ?? "").toString().trim() !== "");
  const exigirNueva = selectedIds.length === 0 || hasNewAddrInput;
  // Agrega pivote por cada localidad seleccionada que aún no tenga override
  const addPivotOverrides = () => {
    const existing = new Set((pivotFields || []).map((p) => String(p.address_id)));
    const toAdd = selectedIds.filter((id) => !existing.has(String(id)));
    toAdd.forEach((id) =>
      appendPivot({
        address_id: id,
        stock: "",
        is_active: true,
        available_from: "",
        available_to: "",
        notes: "",
      })
    );
  };


  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      validateAndSetFiles(e.dataTransfer.files);
    },
    [files]
  );
  const onPick = (e) => validateAndSetFiles(e.target.files);
  const removeFileAt = (idx) => {
    setFiles(arr => arr.filter((_, i) => i !== idx));
    setImageDescs(arr => {
      const next = arr.filter((_, i) => i !== idx);
      return next.length ? next : Array(MAX_FILES).fill("");
    });
    // si quitaste la principal, reubica principal al 0 o al previo
    setMainIndex(i => (i === idx ? 0 : i > idx ? i - 1 : i));
  };
  const openPicker = () => inputRef.current?.click();
  const prevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // sincroniza pivot local -> RHF (para que viaje en el submit)
  const syncPivot = (patch) => {
    setPivot((prev) => {
      const next = { ...prev, ...patch };
      // reflejar en RHF
      if ("stock" in patch) setValue("pivot.stock", next.stock);
      if ("is_active" in patch) setValue("pivot.is_active", next.is_active);
      if ("available_from" in patch) setValue("pivot.available_from", next.available_from);
      if ("available_to" in patch) setValue("pivot.available_to", next.available_to);
      if ("notes" in patch) setValue("pivot.notes", next.notes);
      return next;
    });
  };

  // Mapea errores de Laravel 422 -> RHF
  const applyServerErrors = (laravelErrors = {}) => {
    Object.entries(laravelErrors).forEach(([key, msgs]) => {
      const message = Array.isArray(msgs) ? msgs[0] : String(msgs);
      setError(key, { type: "server", message });
    });
  };

  const onSubmit = async (data) => {
    try {
      setProgress(null);

      const fd = new FormData();
      // base
      if (data.id) fd.append("id", data.id);            // 👈 aquí va el id si existe
      fd.append("name", (data.name || "").trim());
      fd.append("price", data.price);
      fd.append("stock", data.stock);
      if (data.category_id) fd.append("category_id", data.category_id);
      if (data.description) fd.append("description", data.description);

      const imagesMeta = files.map((_, idx) => ({
        index: idx,
        description: (imageDescs[idx] || "").trim(),
        is_main: idx === mainIndex,
      }));

      imagesMeta.forEach((m, i) => {
        fd.append(`images_meta[${i}][index]`, String(m.index));
        if (m.description) fd.append(`images_meta[${i}][description]`, m.description);
        fd.append(`images_meta[${i}][is_main]`, m.is_main ? '1' : '0'); // boolean como "1"/"0"
      });

      files.forEach((file) => {
        fd.append("images[]", file, file.name);
      });

      // localidades
      (data.selected_address_ids || []).forEach((id) => fd.append("address_ids[]", id));

      // nueva localidad
      const a = data.new_address || {};
      const hasSingle = a.recipient || a.phone || a.street;
      if (hasSingle) {
        if (a.recipient) fd.append("address[recipient]", a.recipient);
        if (a.phone) fd.append("address[phone]", a.phone);
        if (a.street) fd.append("address[street]", a.street);
        if (a.ext_no) fd.append("address[ext_no]", a.ext_no);
        if (a.int_no) fd.append("address[int_no]", a.int_no);
        if (a.neighborhood) fd.append("address[neighborhood]", a.neighborhood);
        if (a.city) fd.append("address[city]", a.city);
        if (a.state) fd.append("address[state]", a.state);
        if (a.zip) fd.append("address[zip]", a.zip);
        if (a.references) fd.append("address[references]", a.references);
      }

      // pivote default
      const d = data.pivot_default || {};
      if (d.stock !== "") fd.append("pivot[stock]", String(d.stock));
      fd.append("pivot[is_active]", d.is_active ? "1" : "0");
      if (d.available_from) fd.append("pivot[available_from]", d.available_from);
      if (d.available_to) fd.append("pivot[available_to]", d.available_to);
      if (d.notes) fd.append("pivot[notes]", d.notes);

      // pivotes sucursal
      (data.pivots || []).forEach((p) => {
        const base = `pivots[${p.address_id}]`;
        if (p.stock !== "") fd.append(`${base}[stock]`, String(p.stock));
        fd.append(`${base}[is_active]`, p.is_active ? "1" : "0");
        if (p.available_from) fd.append(`${base}[available_from]`, p.available_from);
        if (p.available_to) fd.append(`${base}[available_to]`, p.available_to);
        if (p.notes) fd.append(`${base}[notes]`, p.notes);
      });

      // 👉 un solo entrypoint: crea o actualiza según haya id en la raíz
      const resp = await createProduct(fd, (p) => {
        if (typeof p?.percent === "number") setProgress(p.percent);
      });

      const isUpdate = !!data.id;
      alertaSuccess(resp?.message || (isUpdate ? "Producto actualizado" : "Producto creado"));

      // Limpieza y refresco
      reset();            // esto borra el id para volver al modo "crear"
      setFiles([]);
      setProgress(null);
      setCurrentImages([]);
      setEditingProductId?.(null); // si usas banderita visual opcional
      onCreated?.(resp);
      refreshDatos(entity.id);
      onGoToEditTab('products')
    } catch (err) {
      const errors422 = err?.response?.data?.errors;
      const isUpdate = !!data.id;
      const msg =
        err?.response?.data?.message ||
        (errors422 && Object.values(errors422)?.[0]?.[0]) ||
        (isUpdate ? "No se pudo actualizar el producto" : "No se pudo crear el producto");

      if (errors422) applyServerErrors(errors422);
      alertaError(msg);
    }
  };



  const saveDescripcion = async () => {
    const next = localDescripcion.trim();
    if (!next) return;

    if (entity?.descripcion && next === entity.descripcion) {
      setEditingDescripcion(false);
      return;
    }

    try {
      setSavingDescripcion(true);

      // enviamos name y email actuales junto con la nueva descripción
      const payload = {
        name: entity?.name || "",
        email: entity?.email || "",
        descripcion: next,
      };

      const u = await actualizarUsuario(payload);

      setLocalDescripcion(u?.descripcion || next);

      // sincroniza entidad y cache local
      const merged = { ...(entity || {}), ...u };
      onUpdated?.(merged);
      try {
        localStorage.setItem("user", JSON.stringify(merged));
      } catch { }

      setEditingDescripcion(false);
    } catch (err) {
      console.error(err);
      alertaError(err.message || "No se pudo actualizar la descripción.");
    } finally {
      setSavingDescripcion(false);
    }
  };

  const handleEnviar = (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    // Sanitizar mensaje para URL
    const textoCodificado = encodeURIComponent(mensaje);
    // Asegúrate de que phone incluya código de país (ej. 52 para México)
    const enlace = `https://wa.me/${entity.phone}?text=${textoCodificado}`;

    window.open(enlace, "_blank");
  };

  // === Helpers de UI ===
  const opcionesCategorias = useMemo(
    () =>
      (categorias || []).map((c) => ({
        value: String(c.id),
        label: c.name,
        image: c.image_url, // <- viene del backend
      })),
    [categorias]
  );
  const opcionesLocalidades = useMemo(
    () =>
      localidadesExistentes.map((l) => ({
        value: l.id,
        label: l.label || `#${l.id} — ${l.city || ""}${l.state ? ", " + l.state : ""}`,
      })),
    [localidadesExistentes]
  );

  // 🔹 Localidades únicas deducidas de los productos del vendedor
  const localidadesUnicas = useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => {
      (p.locations || []).forEach((loc) => {
        if (!map.has(loc.id)) {
          map.set(loc.id, {
            ...loc,
            // etiqueta corta para UI
            label: `${loc.city || ""}${loc.state ? `, ${loc.state}` : ""}`.trim() || `#${loc.id}`,
            // datos útiles opcionales:
            hasActiveStock: !!loc?.pivot && loc.pivot.is_active && Number(loc.pivot.stock) > 0,
          });
        }
      });
    });
    return Array.from(map.values());
  }, [products]);

  function CategoryCombobox({ name = "category_id", label = "Categoría" }) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const [hoverIndex, setHoverIndex] = useState(-1);
    const rootRef = useRef(null);
    const inputRef = useRef(null);

    const selectedValue = watch(name);
    const opciones = useMemo(() => (categorias || []).map(c => ({
      value: String(c.id),
      label: c.name,
      image: c.image_url,
    })), [categorias]);

    const selectedOpt = useMemo(
      () => opciones.find(o => o.value === String(selectedValue)),
      [opciones, selectedValue]
    );

    const filtered = useMemo(() => {
      const term = q.trim().toLowerCase();
      if (!term) return opciones;
      return opciones.filter(o =>
        o.label.toLowerCase().includes(term) ||
        String(o.value).toLowerCase().includes(term)
      );
    }, [q, opciones]);

    const selectOption = (opt) => {
      setValue(name, opt?.value || "");
      setQ("");
      setOpen(false);
    };

    const clearSelection = (e) => {
      e?.stopPropagation?.();
      setValue(name, "");
      setQ("");
    };

    // Cerrar por clic fuera (solo cuando está abierto)
    useEffect(() => {
      if (!open) return;
      const onDocDown = (e) => {
        if (!rootRef.current?.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", onDocDown);
      return () => document.removeEventListener("mousedown", onDocDown);
    }, [open]);

    // Resetear hover al cerrar
    useEffect(() => {
      if (!open) setHoverIndex(-1);
    }, [open]);

    // Apertura explícita (nunca togglear)
    const openAndFocus = () => {
      if (!open) setOpen(true);
      inputRef.current?.focus();
    };

    // Teclado dentro del input
    const onKeyDown = (e) => {
      if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
        setOpen(true);
        return;
      }
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHoverIndex(i => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHoverIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const opt = filtered[Math.max(0, hoverIndex)];
        if (opt) selectOption(opt);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };

    return (
      <div className="col-sm-6" ref={rootRef}>
        <label className="form-label" htmlFor="category-search">{label}</label>

        <div
          className="position-relative"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={openAndFocus}        // <- solo abrir, NO togglear
          style={{ cursor: "text", padding: 6 }}
        >
          <div className="d-flex align-items-center gap-2 common-input common-input--md border--color-dark bg--white">
            {selectedOpt?.image && (
              <img
                src={selectedOpt.image}
                alt={selectedOpt.label}
                width={28}
                height={28}
                style={{ objectFit: "cover", borderRadius: 6, border: "1px solid rgba(0,0,0,.08)" }}
              />
            )}

            <input
              ref={inputRef}
              id="category-search"
              name="category-search"
              type="text"
              className="border-0 flex-grow-1"
              placeholder={selectedOpt ? selectedOpt.label : "Buscar o seleccionar…"}
              value={q}
              onChange={(e) => { setQ(e.target.value); if (!open) setOpen(true); }}
              onKeyDown={onKeyDown}
              onFocus={() => setOpen(true)}
              style={{ outline: "none", background: "transparent" }}
            />

            {selectedValue && (
              <button
                type="button"
                className="btn btn-sm btn-outline-light"
                onClick={clearSelection}
                title="Quitar selección"
              >
                <i className="fas fa-times" />
              </button>
            )}
            <i className={`ms-auto las la-angle-${open ? "up" : "down"}`} />
          </div>

          {open && (
            <ul
              role="listbox"
              className="list-group position-absolute w-100 mt-1 shadow-sm"
              style={{ zIndex: 2000, maxHeight: 280, overflowY: "auto", borderRadius: 8 }}
            >
              {filtered.length === 0 && (
                <li className="list-group-item small text-muted">Sin resultados…</li>
              )}

              {filtered.map((opt, idx) => {
                const active = idx === hoverIndex;
                const selected = String(selectedValue) === String(opt.value);
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={selected}
                    className={`list-group-item d-flex align-items-center gap-2 ${active ? "bg-light" : ""}`}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoverIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();   // <- evita que el contenedor reciba el click y reabra
                      selectOption(opt);
                    }}
                  >
                    {opt.image && (
                      <img
                        src={opt.image}
                        alt={opt.label}
                        width={32}
                        height={32}
                        style={{ objectFit: "cover", borderRadius: 6, border: "1px solid rgba(0,0,0,.08)" }}
                      />
                    )}
                    <div className="d-flex flex-column">
                      <span className="fw-500">{opt.label}</span>
                      <small className="text-muted">ID: {opt.value}</small>
                    </div>
                    {selected && <i className="ms-auto las la-check" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Campo real para RHF */}
        <input type="hidden" {...register(name)} />
        <FieldError error={errors?.[name]} />

        {selectedOpt && (
          <div className="mt-2 d-flex align-items-center gap-2">
            {selectedOpt.image && (
              <img
                src={selectedOpt.image}
                alt={selectedOpt.label}
                width={44}
                height={44}
                style={{ objectFit: "cover", borderRadius: 8, border: "1px solid rgba(0,0,0,.08)" }}
              />
            )}
            <div>
              <div className="fw-600">{selectedOpt.label}</div>
              <small className="text-muted">ID: {selectedOpt.value}</small>
            </div>
          </div>
        )}
      </div>
    );
  }

  const goToFormTab = () => {
    // Si usas los tabs de Bootstrap:
    const trigger = document.querySelector('#pills-Settingss-tab');
    if (trigger && window.bootstrap?.Tab) {
      const tab = new window.bootstrap.Tab(trigger);
      tab.show();
    } else {
      // Fallback: fuerza la visibilidad por clases si no hay bootstrap.Tab
      const pane = document.getElementById('pills-Settingss');
      if (pane) {
        // quita "show active" de otros y ponlo aquí si lo manejas a mano
        pane.classList.add('show', 'active');
        document.getElementById('pills-profile')?.classList.remove('show', 'active');
        document.getElementById('pills-portfolio')?.classList.remove('show', 'active');
      }
    }
    // Scroll al formulario
    setTimeout(() => {
      document.getElementById('nuevoProducto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const mapProductToForm = (prod) => ({
    id: prod?.id ?? "",   // 👈 importante
    name: prod?.name ?? "",
    price: prod?.price ?? "",
    stock: prod?.stock ?? "",
    category_id: String(prod?.category?.id ?? ""),
    description: prod?.description ?? "",
    selected_address_ids: (prod?.locations ?? []).map(l => String(l.id)),
    new_address: { ...emptyAddress },
    pivot_default: { stock: "", is_active: true, available_from: "", available_to: "", notes: "" },
    pivots: (prod?.locations ?? []).map(loc => ({
      address_id: String(loc.id),
      stock: loc?.pivot?.stock ?? "",
      is_active: !!(loc?.pivot?.is_active ?? true),
      available_from: loc?.pivot?.available_from ?? "",
      available_to: loc?.pivot?.available_to ?? "",
      notes: loc?.pivot?.notes ?? "",
    })),
  });


  const handleEditProduct = (prod) => {
    // 1) Guardar ID en edición y (opcional) sus imágenes actuales para mostrarlas
    setEditingProductId(prod.id);
    setCurrentImages(Array.isArray(prod.images) ? prod.images : []);

    // 2) Cargar valores en el formulario
    const values = mapProductToForm(prod);
    reset(values);

    // 3) Saltar al tab del formulario
    goToFormTab();
    onGoToEditTab?.();
  };

  const handleDeleteProduct = (prod) => {
    eliminarProducto(prod.id).then(() => {
      alertaSuccess("Producto eliminado");
      if (editingProductId === prod.id) {
        // Si estabas editando este producto, limpia el formulario
        reset();
        setEditingProductId(null);
        setCurrentImages([]);
      }
      refreshDatos(entity.id);
    }).catch((err) => {
      const msg = err?.response?.data?.message || "No se pudo eliminar el producto";
      alertaError(msg);
    });
  };

  // Estado local de contacto
  const [contact, setContact] = useState({
    name: entity?.name || "",
    email: entity?.email || "",
    phone: entity?.phone || "",
    terminos_aceptados: !!entity?.terminos_aceptados,
  });

  useEffect(() => {
    setContact({
      name: entity?.name || "",
      email: entity?.email || "",
      phone: entity?.phone || "",
      terminos_aceptados: !!entity?.terminos_aceptados,
    });
  }, [entity?.id, entity?.name, entity?.email, entity?.phone, entity?.terminos_aceptados]);

  const [savingContact, setSavingContact] = useState(false);

  const handleActualizarContacto = async (e) => {
    e.preventDefault();
    try {
      setSavingContact(true);

      // Normaliza/valida payload
      const payload = {
        name: (contact.name || "").trim(),
        phone: (contact.phone || "").replace(/\D/g, "").slice(0, 10),
        // Si permites editar el email, inclúyelo; si no, quita esta línea
        email: (contact.email || "").trim(),
        terminos_aceptados: contact.terminos_aceptados ? 1 : 0,
      };

      // Validaciones rápidas
      if (!payload.name) throw new Error("El nombre no puede estar vacío.");
      if (payload.phone && payload.phone.length !== 10)
        throw new Error("El teléfono debe tener 10 dígitos.");
      if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
        throw new Error("El correo no es válido.");

      await actualizarUsuario(payload);
      onUpdated?.(); // ya lo tienes como prop; refresca entity desde el padre si aplica
    } catch (err) {
      alertaError(err);
    } finally {
      setSavingContact(false);
    }
  };

  const abrirDisp = false;

  return (
    <section
      className={`profile pt-5 padding-b-120 ${activeButton === "list-view" ? "list-view" : ""
        }`}
    >
      <div className="container container-two">
        <div className="tab-content" id="pills-tabb">
          <div
            className="tab-pane fade show active"
            id="pills-profile"
            role="tabpanel"
            aria-labelledby="pills-profile-tab"
            tabIndex={0}
          >
            {/* Tab Content End */}
            <div className="profile-wrapper">
              <div className="profile-content">
                <div className="profile-content__inner">
                  <div className="profile-content__item-wrapper">
                    <div className="profile-content__item">
                      <h5 className="profile-content__title mb-2">Descripción</h5>
                      {!isVendorView ? (
                        <div className="d-flex align-items-start gap-2">
                          {editingDescripcion ? (
                            <div className="d-flex align-items-start gap-2 w-100">
                              <textarea
                                ref={descRef}
                                value={localDescripcion}
                                onChange={(e) => setLocalDescripcion(e.target.value)}
                                onInput={autoResize}
                                onKeyDown={(e) => {
                                  if (e.key === "Escape") {
                                    setEditingDescripcion(false);
                                    setLocalDescripcion(entity?.descripcion || "");
                                  }
                                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                                    saveDescripcion();
                                  }
                                }}
                                className="form-control"
                                rows={1} // arranca como una línea
                                placeholder="Escribe tu descripción..."
                                disabled={savingDescripcion}
                                autoFocus
                                style={{
                                  resize: "none",     // evitamos el grip manual
                                  overflow: "hidden", // oculta barra mientras auto–crece
                                  borderRadius: "8px",
                                  fontSize: "14px",
                                  lineHeight: "1.4",
                                  flex: 1,
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-main btn-sm"
                                onClick={saveDescripcion}
                                disabled={savingDescripcion}
                                title="Guardar"
                              >
                                {savingDescripcion ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-check" />}
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-light btn-sm"
                                onClick={() => {
                                  setEditingDescripcion(false);
                                  setLocalDescripcion(entity?.descripcion || "");
                                }}
                                title="Cancelar"
                                disabled={savingDescripcion}
                              >
                                <i className="fas fa-times" />
                              </button>
                            </div>


                          ) : (
                            <div className="w-100 d-flex align-items-center justify-content-between">
                              <div className="mb-0 markdown-body" style={{ flex: 1 }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {localDescripcion || "Sin descripción"}
                                </ReactMarkdown>
                              </div>
                              <button
                                type="button"
                                className="btn btn-outline-light btn-sm ms-2"
                                onClick={() => setEditingDescripcion(true)}
                                title="Editar descripción"
                              >
                                <i className="fas fa-pen" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mb-0 markdown-body" style={{ flex: 1 }}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {localDescripcion}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* ========================== Profile Sidebar Start =========================== */}
              {isVendorView && (
                <div className="profile-sidebar">
                  <div className="profile-sidebar__item">
                    <h5 className="profile-sidebar__title">Enviar WhatsApp</h5>
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
              )}

              {/* ========================== Informacion Personal =========================== */}

              {!isVendorView && (
                <div className="profile-sidebar">
                  <div className="profile-sidebar__item">
                    <h5 className="profile-sidebar__title">Información de contacto</h5>

                    <form onSubmit={handleActualizarContacto}>
                      <div className="row gy-3">
                        <div className="col-12">
                          <label className="form-label">Nombre</label>
                          <input
                            type="text"
                            className="common-input radius-8 common-input--md"
                            value={contact.name}
                            onChange={(e) => setContact((s) => ({ ...s, name: e.target.value }))}
                            placeholder="Nombre completo"
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label d-flex align-items-center gap-2">
                            Email
                            {entity?.email_verified_at ? (
                              <span className="badge bg-success">Verificado</span>
                            ) : (
                              <span className="badge bg-warning text-dark">Sin verificar</span>
                            )}
                          </label>
                          <input
                            type="email"
                            className="common-input radius-8 common-input--md"
                            value={contact.email}
                            onChange={(e) => setContact((s) => ({ ...s, email: e.target.value }))}
                            placeholder="correo@dominio.com"
                          />
                          <small className="text-muted d-block mt-1">
                            Si cambias el correo, podrías requerir verificación nuevamente.
                          </small>
                        </div>

                        <div className="col-12">
                          <label className="form-label">Teléfono (WhatsApp)</label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            className="common-input radius-8 common-input--md"
                            value={contact.phone}
                            onChange={(e) => {
                              const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
                              setContact((s) => ({ ...s, phone: onlyDigits }));
                            }}
                            placeholder="10 dígitos"
                          />
                          <div className="d-flex justify-content-between mt-1">
                            <small className="text-muted">Ej: 7441234567</small>
                            {contact.phone?.length === 10 && (
                              <a
                                className="link"
                                href={`https://wa.me/52${contact.phone}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Probar chat en WhatsApp
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="form-check form-switch">
                            <input
                              id="terminosSwitch"
                              type="checkbox"
                              className="form-check-input"
                              checked={!!contact.terminos_aceptados}
                              onChange={(e) =>
                                setContact((s) => ({ ...s, terminos_aceptados: e.target.checked }))
                              }
                            />
                            <label className="form-check-label" htmlFor="terminosSwitch">
                              Acepto los términos y condiciones
                            </label>
                          </div>
                        </div>

                        <div className="col-12">
                          <button type="submit" className="btn btn-main btn-md w-100" disabled={savingContact}>
                            {savingContact ? "Guardando..." : "Guardar cambios"}
                          </button>
                        </div>
                      </div>
                    </form>

                    {/* Metadatos útiles */}
                    <div className="mt-3 small text-muted">
                      <div>{(entity?.created_at)}</div>
                      <div>
                        Última actualización:{" "}
                        {entity?.updated_at &&
                          new Date(entity.updated_at).toLocaleString("es-MX", {
                            dateStyle: "long",
                            timeStyle: "short",
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* ========================== Profile Sidebar End =========================== */}
            </div>
            {/* Tab Content Start */}
          </div>
          <div
            className="tab-pane fade"
            id="pills-portfolio"
            role="tabpanel"
            aria-labelledby="pills-portfolio-tab"
            tabIndex={0}

          >
            {/* Profile Portfolio Content Star */}
            {/* Tab Start */}
            <div className="filter-tab gap-3 flx-between mb-5">
              <ul className="nav common-tab nav-pills mb-0 gap-lg-2 gap-1 me-auto" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${selectedCat === null ? "active" : ""}`}
                    type="button"
                    onClick={() => setSelectedCat(null)}
                  >
                    Todos
                  </button>
                </li>
                {categoriasVendedor.map((cat) => (
                  <li className="nav-item" key={cat.id} role="presentation">
                    <button
                      className={`nav-link ${selectedCat === cat.id ? "active" : ""}`}
                      type="button"
                      onClick={() => setSelectedCat(cat.id)}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
              <form
                className="search-box style-three"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="text"
                  className="common-input pill"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-main btn-icon icon border-0"
                >
                  <img src="assets/images/icons/search.svg" alt="" />
                </button>
              </form>
            </div>
            {/* Tab End */}
            {/* Lista de productos filtrados */}
            <div className="row g-4">
              {filteredProducts.map((prod) => {
                const mainImg = prod.images.find((img) => img.is_main) || prod.images[0];
                return (
                  <div key={prod.id} className="col-xl-3 col-lg-4 col-sm-6">
                    <div className="product-item section-bg">
                      <div className="product-item__thumb d-flex">
                        <Link to={`/product-details/${prod.id}`} className="link w-100">
                          <img src={mainImg?.img_url} alt={prod.name} className="cover-img" />
                        </Link>
                        {!isVendorView && (
                          <>
                            <button
                              type="button"
                              className="product-item__wishlist"
                              aria-label="Editar"
                              title="Editar producto"
                              onClick={() => handleEditProduct(prod)}
                            >
                              <i className="fas fa-pen" />
                            </button>
                            <button
                              type="button"
                              className="product-item__delete"
                              aria-label="Eliminar"
                              title="Eliminar producto"
                              onClick={() => handleDeleteProduct(prod)}
                            >
                              <i className="fas fa-trash" />
                            </button>
                          </>
                        )}

                      </div>
                      <div className="product-item__content">
                        <h6 className="product-item__title">
                          <Link to={`/product-details/${prod.id}`} className="link">
                            {prod.name}
                          </Link>
                        </h6>

                        <div className="product-item__info flx-between gap-2">
                          <span className="product-item__author">
                            Categoría:
                            <Link
                              to={`/all-product?cat=${prod.category.id}`}
                              className="link hover-text-decoration-underline"
                            >
                              {" "}{prod.category.name}
                            </Link>
                          </span>
                          <div className="flx-align gap-2">
                            <h6 className="product-item__price mb-0">
                              ${parseFloat(prod.price).toFixed(2)}
                            </h6>
                          </div>
                        </div>
                        <div className="product-item__bottom flx-between gap-2">
                          <span className="product-item__sales font-14 mb-2">
                            Stock: {prod.stock}
                          </span>
                          <Link
                            to={`/product-details/${prod.id}`}
                            className="btn btn-outline-light btn-sm pill"
                          >
                            Ver producto
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Profile Portfolio Content End */}
          </div>


          <div
            className="tab-pane fade"       // 👈 clases correctas
            id="pills-Settingss"            // 👈 debe coincidir con data-bs-target
            role="tabpanel"
            aria-labelledby="pills-Settingss-tab"
            tabIndex={0}
          >
            {/* ================== Setting Section Start ====================== */}
            <div className="filter-tab">
              {/* Columna izquierda: formulario base + imágenes */}
              <div className="col-lg-12">
                {/* Formulario de producto */}
                <div className="card common-card border border-gray-five overflow-hidden mb-24" id="nuevoProducto">
                  <div className="card-header">
                    <h6 className="title">Nuevo Producto</h6>
                  </div>
                  {editingProductId && (
                    <div className="alert alert-info d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Editando producto #{editingProductId}</strong>
                        <span className="ms-2">— guarda los cambios o cancela para volver a crear uno nuevo.</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-light btn-sm"
                        onClick={() => {
                          setEditingProductId(null);
                          setCurrentImages([]);
                          reset(); // vuelve a defaults del form
                        }}
                      >
                        Cancelar edición
                      </button>
                    </div>
                  )}

                  <div className="card-body">
                    <form onSubmit={handleSubmit(onSubmit)}>
                      {/* ================== Datos del producto ================== */}
                      <div className="card common-card border border-gray-five mb-24">
                        <div className="card-header"><h6 className="title">Datos del producto</h6></div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-sm-6">
                              <label htmlFor="name" className="form-label">Nombre *</label>
                              <input type="hidden" {...register("id")} />
                              <input
                                id="name"
                                type="text"
                                className="common-input common-input--md border--color-dark bg--white"
                                placeholder="Ej. Café molido 500g"
                                {...register("name", {
                                  required: "El nombre del producto es obligatorio.",
                                  maxLength: { value: 255, message: "Máximo 255 caracteres." },
                                })}
                              />
                              <FieldError error={errors.name} />
                            </div>

                            <div className="col-sm-3">
                              <label htmlFor="price" className="form-label">Precio *</label>
                              <input
                                id="price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="common-input common-input--md border--color-dark bg--white"
                                {...register("price", {
                                  required: "El precio es obligatorio.",
                                  valueAsNumber: true,
                                  min: { value: 0, message: "El precio no puede ser negativo." },
                                })}
                              />
                              <FieldError error={errors.price} />
                            </div>

                            <div className="col-sm-3">
                              <label htmlFor="stock" className="form-label">Stock inicial *</label>
                              <input
                                id="stock"
                                type="number"
                                step="1"
                                placeholder="0"
                                className="common-input common-input--md border--color-dark bg--white"
                                {...register("stock", {
                                  required: "El stock es obligatorio.",
                                  valueAsNumber: true,
                                  min: { value: 0, message: "El stock no puede ser negativo." },
                                })}
                              />
                              <FieldError error={errors.stock} />
                            </div>


                            <CategoryCombobox name="category_id" label="Categoría" />

                            <div className="col-12">
                              <label htmlFor="description" className="form-label">Descripción</label>
                              <textarea
                                id="description"
                                className="common-input common-input--md border--color-dark bg--white"
                                placeholder="Describe tu producto (ingredientes, uso, cuidados, etc.)"
                                {...register("description")}
                              />
                              <FieldError error={errors.description} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ================== Localidades ================== */}
                      <div className="card common-card border border-gray-five overflow-hidden mb-24">
                        <div className="card-header"><h6 className="title">Localidades</h6></div>
                        <div className="card-body">
                          <div className="row g-3">
                            <Controller
                              control={control}
                              name="selected_address_ids"
                              render={({ field }) => {
                                const selected = (field.value || []).map(String); // normaliza a string
                                const toggle = (id, checked) => {
                                  const sid = String(id);
                                  field.onChange(
                                    checked
                                      ? [...selected, sid]
                                      : selected.filter((v) => v !== sid)
                                  );
                                };

                                return (
                                  <div className="row g-2">
                                    {localidadesUnicas.map((l) => {
                                      const id = String(l.id);
                                      const checked = selected.includes(id);
                                      return (
                                        <div key={l.id} className="col-sm-6 col-lg-4">
                                          <div className="border rounded p-2 h-100">
                                            <div className="form-check">
                                              <input
                                                id={`addr-${l.id}`}
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={checked}
                                                onChange={(e) => toggle(id, e.target.checked)}
                                              />
                                              <label htmlFor={`addr-${l.id}`} className="form-check-label">
                                                <strong>#{l.id}</strong> — {l.label || `${l.city || ""}${l.state ? `, ${l.state}` : ""}`}
                                              </label>
                                            </div>

                                            <div className="mt-2 small text-muted">
                                              <div>Responsable: {l.recipient || "—"}</div>
                                              <div>Tel: {l.phone || "—"}</div>
                                              <div>Calle: {l.street || "—"} {l.ext_no || ""}</div>
                                              <div>CP: {l.zip || "—"}</div>
                                            </div>

                                            <div className="mt-2">
                                              {l.hasActiveStock ? (
                                                <span className="badge bg-success">Activa</span>
                                              ) : (
                                                <span className="badge bg-secondary">Sin stock/oculta</span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              }}
                            />
                            <small className="text-muted d-block mt-2">
                              Marca todas las sucursales donde estará disponible este producto.
                            </small>
                            <FieldError error={errors.selected_address_ids} />

                            <div className="col-12">
                              <hr />

                              <div className="accordion" id="accNuevaLocalidad">
                                <div className="accordion-item common-card">
                                  <h2 className="accordion-header" id="headingNuevaLocalidad">
                                    <button
                                      className={`accordion-button common-card form-label ${exigirNueva ? "" : "collapsed"}`}
                                      type="button"
                                      data-bs-toggle="collapse"
                                      data-bs-target="#collapseNuevaLocalidad"
                                      aria-expanded={exigirNueva ? "true" : "false"}
                                      aria-controls="collapseNuevaLocalidad"
                                    >
                                      Nueva localidad rápida (opcional)
                                      {localidadesUnicas.length === 0 && (
                                        <span className="badge bg-danger ms-2">Obligatoria</span>
                                      )}
                                    </button>
                                  </h2>

                                  <div
                                    id="collapseNuevaLocalidad"
                                    className={`accordion-collapse collapse ${exigirNueva ? "show" : ""}`}
                                    aria-labelledby="headingNuevaLocalidad"
                                    data-bs-parent="#accNuevaLocalidad"
                                  >
                                    <div className="accordion-body">
                                      <div className="alert alert-primary py-2 mb-3">
                                        En esta localidad se encontrá el <b>producto</b> que va a registrar.
                                      </div>

                                      <div className="row g-3">
                                        <div className="col-md-6">
                                          <label className="form-label">Responsable *</label>
                                          <input
                                            type="text"
                                            className="common-input common-input--md border--color-dark bg--white"
                                            placeholder="Encargado del local"
                                            {...register("new_address.recipient", {
                                              required: exigirNueva ? "Este campo es obligatorio" : false,
                                            })}
                                          />
                                          <FieldError error={errors?.new_address?.recipient} />
                                        </div>

                                        <div className="col-md-6">
                                          <label className="form-label">Teléfono *</label>
                                          <input
                                            type="tel"
                                            className="common-input common-input--md border--color-dark bg--white"
                                            placeholder="10 dígitos"
                                            {...register("new_address.phone", {
                                              required: exigirNueva ? "Este campo es obligatorio" : false,
                                            })}
                                          />
                                          <FieldError error={errors?.new_address?.phone} />
                                        </div>

                                        <div className="col-md-6">
                                          <label className="form-label">Calle *</label>
                                          <input
                                            type="text"
                                            className="common-input common-input--md border--color-dark bg--white"
                                            placeholder="Ej. Av. Reforma"
                                            {...register("new_address.street", {
                                              required: exigirNueva ? "Este campo es obligatorio" : false,
                                            })}
                                          />
                                          <FieldError error={errors?.new_address?.street} />
                                        </div>

                                        <div className="col-md-3">
                                          <label className="form-label">No. Ext</label>
                                          <input
                                            type="text"
                                            className="common-input common-input--md border--color-dark bg--white"
                                            placeholder="Ej. 123"
                                            {...register("new_address.ext_no")}
                                          />
                                          <FieldError error={errors?.new_address?.ext_no} />
                                        </div>

                                        <div className="col-md-3">
                                          <label className="form-label">No. Int</label>
                                          <input
                                            type="text"
                                            className="common-input common-input--md border--color-dark bg--white"
                                            placeholder="Ej. 4B"
                                            {...register("new_address.int_no")}
                                          />
                                          <FieldError error={errors?.new_address?.int_no} />
                                        </div>

                                        <div className="col-md-6">
                                          <label className="form-label">Colonia</label>
                                          <input
                                            type="text"
                                            className="common-input common-input--md border--color-dark bg--white"
                                            placeholder="Ej. Centro"
                                            {...register("new_address.neighborhood")}
                                          />
                                          <FieldError error={errors?.new_address?.neighborhood} />
                                        </div>

                                        <div className="col-md-3">
                                          <label className="form-label">Ciudad</label>
                                          <input
                                            type="text"
                                            className="common-input common-input--md border--color-dark bg--white"
                                            placeholder="Ej. Puebla"
                                            {...register("new_address.city")}
                                          />
                                          <FieldError error={errors?.new_address?.city} />
                                        </div>

                                        <div className="col-md-3">
                                          <label className="form-label">Estado</label>
                                          <input
                                            type="text"
                                            className="common-input common-input--md border--color-dark bg--white"
                                            placeholder="Ej. Puebla"
                                            {...register("new_address.state")}
                                          />
                                          <FieldError error={errors?.new_address?.state} />
                                        </div>

                                        <div className="col-md-3">
                                          <label className="form-label">C.P.</label>
                                          <input
                                            type="text"
                                            className="common-input common-input--md border--color-dark bg--white"
                                            inputMode="numeric"
                                            placeholder="Ej. 72000"
                                            {...register("new_address.zip")}
                                          />
                                          <FieldError error={errors?.new_address?.zip} />
                                        </div>

                                        <div className="col-12">
                                          <label className="form-label">Referencias</label>
                                          <textarea
                                            className="common-input common-input--md border--color-dark bg--white"
                                            rows={2}
                                            placeholder="Punto de referencia, horario, etc."
                                            {...register("new_address.references")}
                                          />
                                          <FieldError error={errors?.new_address?.references} />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>




                          </div>
                        </div>
                      </div>

                      {/* ================== Disponibilidad por sucursal ================== */}
                      <div className="col-12 mb-4 common-card">
                        <hr />

                        <div className="accordion common-card" id="accDispSucursal">
                          <div className="accordion-item common-card ">
                            <h2 className="accordion-header" id="headingDispSucursal">
                              <button
                                className={`common-card form-label accordion-button ${abrirDisp ? "" : "collapsed"}`}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseDispSucursal"
                                aria-expanded={abrirDisp ? "true" : "false"}
                                aria-controls="collapseDispSucursal"
                              >
                                Disponibilidad por sucursal
                              </button>
                            </h2>

                            <div
                              id="collapseDispSucursal"
                              className={`accordion-collapse collapse ${abrirDisp ? "show" : ""}`}
                              aria-labelledby="headingDispSucursal"
                              data-bs-parent="#accDispSucursal"
                            >
                              <div className="accordion-body">

                                {/* ================== TU BLOQUE ORIGINAL ================== */}
                                <div className="card common-card border border-gray-five overflow-hidden mb-24">
                                  <div className="card-body">
                                    {/* Nota introductoria para humanos */}
                                    <div className="p-3 rounded mb-3" >
                                      <h6>¿Para qué sirve?</h6>
                                      <samll className="mt-1 form-label">

                                        Define <em>una sola regla</em> de stock y disponibilidad que se aplicará a
                                        <b> todas tus sucursales</b>. Si alguna sucursal es distinta (más/menos stock,
                                        fechas, inactiva), luego agregas esa <b>excepción</b> abajo.
                                      </samll>
                                    </div>

                                    {/* Regla general para todas las sucursales */}
                                    <h6 className="mb-2">Regla general (aplica a todas)</h6>
                                    <div className="row g-3 align-items-end">
                                      <div className="col-sm-3">
                                        <label className="form-label">
                                          Stock para todas <span className="text-muted">(ej. 10)</span>
                                        </label>
                                        <input
                                          type="number"
                                          min="0"
                                          placeholder="0"
                                          className="common-input common-input--md border--color-dark bg--white"
                                          {...register("pivot_default.stock")}
                                        />
                                        <small className="text-muted d-block mt-1">
                                          Si no indicas nada, el stock de producto se usará como base.
                                        </small>
                                        <FieldError error={errors?.pivot_default?.stock} />
                                      </div>

                                      <div className="col-sm-3">
                                        <div className="form-check form-switch mt-4">
                                          <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="is_active_default"
                                            {...register("pivot_default.is_active")}
                                          />
                                          <label htmlFor="is_active_default" className="form-check-label form-label">
                                            Producto activo en todas
                                          </label>
                                        </div>
                                        <small className="text-muted d-block">
                                          Apágalo si, por ahora, no quieres que se muestre a la venta.
                                        </small>
                                        <FieldError error={errors?.pivot_default?.is_active} />
                                      </div>

                                      <div className="col-sm-3">
                                        <label className="form-label">Disponible desde</label>
                                        <input
                                          type="date"
                                          className="common-input common-input--md border--color-dark bg--white"
                                          {...register("pivot_default.available_from")}
                                        />
                                        <small className="text-muted">Déjalo vacío para disponibilidad inmediata.</small>
                                      </div>

                                      <div className="col-sm-3">
                                        <label className="form-label">Disponible hasta</label>
                                        <input
                                          type="date"
                                          className="common-input common-input--md border--color-dark bg--white"
                                          {...register("pivot_default.available_to")}
                                        />
                                        <small className="text-muted">Déjalo vacío si no tiene fecha de término.</small>
                                      </div>

                                      <div className="col-12">
                                        <label className="form-label">Notas internas</label>
                                        <input
                                          type="text"
                                          className="common-input common-input--md border--color-dark bg--white"
                                          placeholder="Ej. Solo exhibición, llega lote nuevo el lunes, etc."
                                          {...register("pivot_default.notes")}
                                        />
                                      </div>
                                    </div>

                                    {pivotFields.length === 0 ? (
                                      <small className="text-muted d-block">
                                        Aún no hay excepciones. La regla general se aplicará a todas tus sucursales.
                                      </small>
                                    ) : (
                                      pivotFields.map((field, index) => (
                                        <div key={field.id} className="p-3 border rounded mb-2 mt-2">
                                          <div className="d-flex justify-content-between align-items-center mb-2">
                                            <strong>
                                              Sucursal ID: {watch(`pivots.${index}.address_id`) || field.address_id}
                                            </strong>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-danger"
                                              onClick={() => removePivot(index)}
                                            >
                                              Quitar excepción
                                            </button>
                                          </div>

                                          <div className="row g-3 align-items-end">
                                            <div className="col-sm-3">
                                              <label className="form-label">Stock solo en esta sucursal</label>
                                              <input
                                                type="number"
                                                min="0"
                                                className="common-input common-input--md border--color-dark bg--white"
                                                placeholder="Deja vacío para usar la regla general"
                                                {...register(`pivots.${index}.stock`)}
                                              />
                                            </div>

                                            <div className="col-sm-3">
                                              <div className="form-check form-switch mt-4">
                                                <input
                                                  type="checkbox"
                                                  className="form-check-input"
                                                  {...register(`pivots.${index}.is_active`)}
                                                  defaultChecked
                                                />
                                                <label className="form-check-label">Activo en esta sucursal</label>
                                              </div>
                                            </div>

                                            <div className="col-sm-3">
                                              <label className="form-label">Desde (solo esta)</label>
                                              <input
                                                type="date"
                                                className="common-input common-input--md border--color-dark bg--white"
                                                {...register(`pivots.${index}.available_from`)}
                                              />
                                            </div>

                                            <div className="col-sm-3">
                                              <label className="form-label">Hasta (solo esta)</label>
                                              <input
                                                type="date"
                                                className="common-input common-input--md border--color-dark bg--white"
                                                {...register(`pivots.${index}.available_to`)}
                                              />
                                            </div>

                                            <div className="col-12">
                                              <label className="form-label">Notas (solo esta)</label>
                                              <input
                                                type="text"
                                                className="common-input common-input--md border--color-dark bg--white"
                                                placeholder="Si lo dejas vacío, se usan las notas generales"
                                                {...register(`pivots.${index}.notes`)}
                                              />
                                            </div>

                                            {/* Campo técnico oculto */}
                                            <input
                                              type="hidden"
                                              {...register(`pivots.${index}.address_id`)}
                                              defaultValue={field.address_id}
                                            />
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                                {/* ================== FIN BLOQUE ================== */}

                              </div>
                            </div>
                          </div>
                        </div>
                      </div>


                      {/* ================== Imágenes ================== */}
                      <div className="card common-card border border-gray-five overflow-hidden mb-24" onDrop={onDrop} onDragOver={prevent} onDragEnter={prevent} onDragLeave={prevent}>
                        <div className="card-header"><h6 className="title">Imágenes del producto</h6></div>
                        <div className="card-body">
                          <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onPick} />

                          <div role="button" onClick={openPicker} className="w-100 mb-3 p-3 text-center border border-dashed rounded" style={{ borderStyle: "dashed", cursor: "pointer" }}>
                            <div className="mb-1 fw-semibold  form-label">Arrastra y suelta aquí</div>
                            <small className="text-muted">o haz clic para seleccionar (máx. 10, 2MB c/u)</small>
                          </div>
                          {editingProductId && currentImages?.length > 0 && (
                            <div className="mb-3">
                              <label className="form-label fw-semibold">Imágenes actuales</label>
                              <div className="row g-2">
                                {currentImages.map(img => (
                                  <div key={img.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="border rounded overflow-hidden">
                                      <img
                                        src={img.img_url}
                                        alt=""
                                        className="w-100"
                                        style={{ height: 140, objectFit: "cover" }}
                                      />
                                    </div>
                                    {img.description && (
                                      <small className="text-muted d-block mt-1">
                                        {img.description}
                                      </small>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <small className="text-muted d-block mt-1">
                                Si subes nuevas imágenes, tu backend decidirá si reemplaza o agrega. Las descripciones de las nuevas viajarán en <code>images_meta</code>.
                              </small>
                            </div>
                          )}
                          <div className="row g-2">
                            {Array.from({ length: MAX_FILES }).map((_, i) => {
                              const f = files[i];
                              return (
                                <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={i}>
                                  <div
                                    className="position-relative border rounded d-flex align-items-center justify-content-center"
                                    style={{ width: "100%", paddingTop: "100%", overflow: "hidden" }}
                                    onClick={openPicker}
                                  >
                                    {f ? (
                                      <>
                                        <img
                                          src={previews[i]}
                                          alt={`img-${i}`}
                                          loading="lazy"
                                          className="position-absolute top-0 start-0 w-100 h-100"
                                          style={{ objectFit: "cover" }}
                                        />
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-danger position-absolute"
                                          style={{ top: 6, right: 6 }}
                                          onClick={(e) => { e.stopPropagation(); removeFileAt(i); }}
                                          aria-label="Eliminar imagen"
                                        >
                                          ×
                                        </button>
                                      </>
                                    ) : (
                                      <div
                                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-muted"
                                        style={{ fontSize: 12 }}
                                      >
                                        Slot {i + 1}
                                      </div>
                                    )}
                                  </div>

                                  {/* 👇 Campos adicionales solo cuando hay archivo */}
                                  {f && (
                                    <div className="mt-2">
                                      {/* Descripción por imagen */}
                                      <textarea
                                        className="common-input radius-8 w-100"
                                        rows={2}
                                        placeholder="Descripción de esta imagen…"
                                        value={imageDescs[i] ?? ""}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setImageDescs(prev => {
                                            const next = [...prev];
                                            next[i] = val;
                                            return next;
                                          });
                                        }}
                                        maxLength={2000}
                                      />

                                      {/* Selector de principal */}
                                      <div className="form-check mt-1">
                                        <input
                                          className="form-check-input"
                                          type="radio"
                                          name="mainImage"
                                          id={`main-${i}`}
                                          checked={mainIndex === i}
                                          onChange={() => setMainIndex(i)}
                                        />
                                        <label className="form-check-label small" htmlFor={`main-${i}`}>
                                          Usar como imagen principal
                                        </label>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>


                          {/* Preview principal */}
                          {files[0] && (
                            <div className="mt-3">
                              <label className="form-label fw-semibold">Preview principal</label>
                              <div className="border rounded overflow-hidden">
                                <img
                                  src={previews[0]}
                                  loading="lazy"
                                  alt="preview-principal" style={{ width: "100%", height: 350, objectFit: "cover" }} />
                              </div>
                            </div>
                          )}

                          {/* Progreso */}
                          {progress !== null && (
                            <div className="mt-3">
                              <div className="progress" style={{ height: 8 }}>
                                <div className="progress-bar" role="progressbar" style={{ width: `${progress}%` }} aria-valuemin="0" aria-valuemax="100" />
                              </div>
                              <small className="text-muted d-block mt-1">Subiendo… {progress}%</small>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ================== Submit ================== */}
                      <div className="mt-3">
                        <button type="submit" className="btn btn-main btn-md w-100" disabled={isSubmitting}>
                          {isSubmitting
                            ? (watch("id") ? "Guardando cambios…" : "Guardando…")
                            : (watch("id") ? "Guardar cambios" : "Agregar producto")}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Imágenes del producto (debajo del form) */}

              </div>
            </div>

            {/* ================== Setting Section End ====================== */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
