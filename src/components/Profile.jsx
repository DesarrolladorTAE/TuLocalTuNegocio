import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { createProduct, actualizarUsuario } from "../service";
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

// 👇 Componente auxiliar para mostrar un error debajo del campo
const FieldError = ({ error }) =>
  error ? <small className="text-danger d-block mt-1">{error.message || String(error)}</small> : null;

const Profile = ({ isVendorView = false, entity, onUpdated, canEdit, products, categorias }) => {
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

  // Categorías únicas del vendedor (a partir de products)
  const categoriasVendedor = useMemo(() => {
    const catsMap = {};
    products.forEach((p) => {
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
    console.log('categorias: ', categorias)
  }, [entity]);

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
    setFiles((arr) => arr.filter((_, i) => i !== idx));
  };
  const openPicker = () => inputRef.current?.click();
  const prevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // ======= react-hook-form =======
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      price: "",
      stock: "",
      category_id: "",
      description: "",
      address_id: "",
      pivot: {
        stock: "",
        is_active: true,
        available_from: "",
        available_to: "",
        notes: "",
      },
    },
  });

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
      // key puede ser "name", "address.recipient", "address_ids.0", "images.2", "pivot.stock", etc.
      const message = Array.isArray(msgs) ? msgs[0] : String(msgs);
      // RHF soporta path con dot-notation
      setError(key, { type: "server", message });
    });
  };

  const onSubmit = async (data) => {
    try {
      setProgress(null);

      const fd = new FormData();

      // Campos base (desde RHF)
      fd.append("name", (data.name || "").trim());
      fd.append("price", data.price);
      fd.append("stock", data.stock);
      if (data.category_id) fd.append("category_id", data.category_id);
      if (data.description) fd.append("description", data.description);

      // Imágenes
      files.forEach((file) => fd.append("images[]", file));

      // IDs de direcciones (mezcla campo suelto + lista controlada por estado)
      if (data.address_id?.trim()) fd.append("address_id", data.address_id.trim());
      addressIdsInput
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((val) => fd.append("address_ids[]", val));

      // Dirección única (desde estado controlado existente)
      const a = addressSingle;
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

      // Pivot (desde RHF, sincronizado con estado)
      if (pivot.stock !== "") fd.append("pivot[stock]", String(pivot.stock));
      fd.append("pivot[is_active]", pivot.is_active ? "1" : "0");
      if (pivot.available_from) fd.append("pivot[available_from]", pivot.available_from);
      if (pivot.available_to) fd.append("pivot[available_to]", pivot.available_to);
      if (pivot.notes) fd.append("pivot[notes]", pivot.notes);

      const resp = await createProduct(fd, (p) => {
        if (typeof p?.percent === "number") setProgress(p.percent);
      });

      alertaSuccess(resp?.message || "Producto creado");

      // Reset RHF + estados relacionados
      reset();
      setFiles([]);
      setProgress(null);
      setAddressIdsInput("");
      setAddressSingle({ ...emptyAddress });
      setPivot({ stock: "", is_active: true, available_from: "", available_to: "", notes: "" });
    } catch (err) {
      const errors422 = err?.response?.data?.errors;
      const msg =
        err?.response?.data?.message ||
        (errors422 && Object.values(errors422)?.[0]?.[0]) ||
        "No se pudo crear el producto";

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
            className="tab-pane fade"
            id="pills-followerss"
            role="tabpanel"
            aria-labelledby="pills-followerss-tab"
            tabIndex={0}
          >
            <div className="profile-wrapper">
              <div className="profile-content">
                <div className="follow-wrapper">
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Follow
                    </button>
                  </div>
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Follow
                    </button>
                  </div>
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Follow
                    </button>
                  </div>
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Follow
                    </button>
                  </div>
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Follow
                    </button>
                  </div>
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Follow
                    </button>
                  </div>
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Follow
                    </button>
                  </div>
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Follow
                    </button>
                  </div>
                </div>
              </div>
              {/* ========================== Profile Sidebar Start =========================== */}
              <div className="profile-sidebar">
                <div className="profile-sidebar__item">
                  <h5 className="mb-4">Featured Items</h5>
                  <div className="featured-item d-flex align-items-center gap-4">
                    <div className="featured-item__thumb">
                      <Link to="/product-details" className="link">
                        <img
                          src="assets/images/thumbs/featured-item-img.png"
                          alt=""
                        />
                      </Link>
                    </div>
                    <div className="featured-item__content">
                      <h6 className="featured-item__title mb-2">
                        <Link to="/product-details" className="link">
                          Personal portfolio one page template
                        </Link>
                      </h6>
                      <span className="featured-item__text mb-2 text-heading fw-500">
                        250 Purchases
                      </span>
                      <div className="d-flex align-items-center gap-1">
                        <ul className="star-rating">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-body font-14">
                          {" "}
                          5.0{" "}
                        </span>
                        <span className="star-rating__text text-body font-14">
                          {" "}
                          (116)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="profile-sidebar__author">
                    <div className="author-details p-0 border-0 mt-0">
                      <div className="d-flex align-items-center gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <span className="d-flex align-items-center gap-1">
                            <span className="star-rating">
                              <span className="star-rating__item font-11">
                                <i className="fas fa-star" />
                              </span>
                              <span className="star-rating__item font-11">
                                <i className="fas fa-star" />
                              </span>
                              <span className="star-rating__item font-11">
                                <i className="fas fa-star" />
                              </span>
                              <span className="star-rating__item font-11">
                                <i className="fas fa-star" />
                              </span>
                              <span className="star-rating__item font-11">
                                <i className="fas fa-star" />
                              </span>
                            </span>
                            <span className="star-rating__text text-body">
                              {" "}
                              5.0
                            </span>
                          </span>
                        </div>
                      </div>
                      <ul className="badge-list flx-align gap-2 mt-3">
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge1.png" alt="" />
                        </li>
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge2.png" alt="" />
                        </li>
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge3.png" alt="" />
                        </li>
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge4.png" alt="" />
                        </li>
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge5.png" alt="" />
                        </li>
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge6.png" alt="" />
                        </li>
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge7.png" alt="" />
                        </li>
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge8.png" alt="" />
                        </li>
                      </ul>
                      <Link
                        to="/profile"
                        className="btn btn-outline-light w-100 pill mt-32 fw-600"
                      >
                        Total 89 Items
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="profile-sidebar__item">
                  <h5 className="profile-sidebar__title">Email to Support</h5>
                  <form action="#">
                    <div className="row gy-4">
                      <div className="col-12">
                        <label
                          htmlFor="emailssssId"
                          className="form-label mb-2 font-18 fw-500"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          className="common-input radius-8 common-input--md"
                          id="emailssssId"
                          placeholder="dpmarket@gmail.com"
                        />
                      </div>
                      <div className="col-12">
                        <label
                          htmlFor="messagessssId"
                          className="form-label mb-2 font-18 fw-500"
                        >
                          Message
                        </label>
                        <textarea
                          className="common-input radius-8"
                          id="messagessssId"
                          placeholder="Write Message"
                          defaultValue={""}
                        />
                      </div>
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-main btn-md w-100"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              {/* ========================== Profile Sidebar End =========================== */}
            </div>
          </div>
          <div
            className="tab-pane fade"
            id="pills-Followingg"
            role="tabpanel"
            aria-labelledby="pills-Followingg-tab"
            tabIndex={0}
          >
            <div className="profile-wrapper">
              <div className="profile-content">
                <div className="follow-wrapper">
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Unfollow
                    </button>
                  </div>
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Unfollow
                    </button>
                  </div>
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Unfollow
                    </button>
                  </div>
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Unfollow
                    </button>
                  </div>
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Unfollow
                    </button>
                  </div>
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Unfollow
                    </button>
                  </div>
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Unfollow
                    </button>
                  </div>
                  <div className="follow-item">
                    <div className="follow-item__author">
                      <div className="d-flex align-items-start gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <ul className="badge-list badge-list--sm flx-align gap-1 mt-3 ms-0">
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge1.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge2.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge3.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge4.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge5.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge6.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge7.png"
                                alt=""
                              />
                            </li>
                            <li
                              className="badge-list__item"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title="Badge Info"
                            >
                              <img
                                src="assets/images/thumbs/badge8.png"
                                alt=""
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="follow-item__meta">
                      <strong className="font-11 fw-600 text-heading">
                        77 Items
                        <br />
                        100 Followers
                        <br />
                        Member Since: September 2018
                        <br />
                        Available for freelance work
                      </strong>
                    </div>
                    <div className="follow-item__sales">
                      <div className="sales">
                        <span className="sales__text mb-1 font-13 text-heading fw-500">
                          Sales
                        </span>
                        <h6 className="sales__amount mb-0 font-body">15,830</h6>
                        <ul className="star-rating mt-2">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-heading font-12 fw-500">
                          {" "}
                          116 ratings
                        </span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-main pill px-4">
                      Unfollow
                    </button>
                  </div>
                </div>
              </div>
              {/* ========================== Profile Sidebar Start =========================== */}
              <div className="profile-sidebar">
                <div className="profile-sidebar__item">
                  <h5 className="mb-4">Featured Items</h5>
                  <div className="featured-item d-flex align-items-center gap-4">
                    <div className="featured-item__thumb">
                      <Link to="/product-details" className="link">
                        <img
                          src="assets/images/thumbs/featured-item-img.png"
                          alt=""
                        />
                      </Link>
                    </div>
                    <div className="featured-item__content">
                      <h6 className="featured-item__title mb-2">
                        <Link to="/product-details" className="link">
                          Personal portfolio one page template
                        </Link>
                      </h6>
                      <span className="featured-item__text mb-2 text-heading fw-500">
                        250 Purchases
                      </span>
                      <div className="d-flex align-items-center gap-1">
                        <ul className="star-rating">
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                          <li className="star-rating__item font-11">
                            <i className="fas fa-star" />
                          </li>
                        </ul>
                        <span className="star-rating__text text-body font-14">
                          {" "}
                          5.0{" "}
                        </span>
                        <span className="star-rating__text text-body font-14">
                          {" "}
                          (116)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="profile-sidebar__author">
                    <div className="author-details p-0 border-0 mt-0">
                      <div className="d-flex align-items-center gap-2">
                        <div className="author-details__thumb flex-shrink-0">
                          <img
                            src="assets/images/thumbs/author-details-img.png"
                            alt=""
                          />
                        </div>
                        <div className="author-details__content">
                          <h6 className="author-details__name font-18 mb-2">
                            Oviousdev
                          </h6>
                          <span className="d-flex align-items-center gap-1">
                            <span className="star-rating">
                              <span className="star-rating__item font-11">
                                <i className="fas fa-star" />
                              </span>
                              <span className="star-rating__item font-11">
                                <i className="fas fa-star" />
                              </span>
                              <span className="star-rating__item font-11">
                                <i className="fas fa-star" />
                              </span>
                              <span className="star-rating__item font-11">
                                <i className="fas fa-star" />
                              </span>
                              <span className="star-rating__item font-11">
                                <i className="fas fa-star" />
                              </span>
                            </span>
                            <span className="star-rating__text text-body">
                              {" "}
                              5.0
                            </span>
                          </span>
                        </div>
                      </div>
                      <ul className="badge-list flx-align gap-2 mt-3">
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge1.png" alt="" />
                        </li>
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge2.png" alt="" />
                        </li>
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge3.png" alt="" />
                        </li>
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge4.png" alt="" />
                        </li>
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge5.png" alt="" />
                        </li>
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge6.png" alt="" />
                        </li>
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge7.png" alt="" />
                        </li>
                        <li
                          className="badge-list__item"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          data-bs-title="Badge Info"
                        >
                          <img src="assets/images/thumbs/badge8.png" alt="" />
                        </li>
                      </ul>
                      <Link
                        to="/profile"
                        className="btn btn-outline-light w-100 pill mt-32 fw-600"
                      >
                        Total 89 Items
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="profile-sidebar__item">
                  <h5 className="profile-sidebar__title">Email to Support</h5>
                  <form action="#">
                    <div className="row gy-4">
                      <div className="col-12">
                        <label
                          htmlFor="emailssId"
                          className="form-label mb-2 font-18 fw-500"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          className="common-input radius-8 common-input--md"
                          id="emailssId"
                          placeholder="dpmarket@gmail.com"
                        />
                      </div>
                      <div className="col-12">
                        <label
                          htmlFor="messagessId"
                          className="form-label mb-2 font-18 fw-500"
                        >
                          Message
                        </label>
                        <textarea
                          className="common-input radius-8"
                          id="messagessId"
                          placeholder="Write Message"
                          defaultValue={""}
                        />
                      </div>
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-main btn-md w-100"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              {/* ========================== Profile Sidebar End =========================== */}
            </div>
          </div>
          <div
            className="tab-pane fade"
            id="pills-Settingss"
            role="tabpanel"
            aria-labelledby="pills-Settingss-tab"
            tabIndex={0}
          >
            {/* ================== Setting Section Start ====================== */}
            <div className="row gy-4">
              {/* Columna izquierda: formulario base + imágenes */}
              <div className="col-lg-8">
                {/* Formulario de producto */}
                <div className="card common-card border border-gray-five overflow-hidden mb-24" id="nuevoProducto">
                  <div className="card-header">
                    <h6 className="title">Nuevo Producto</h6>
                  </div>
                  <div className="card-body">
                    <form onSubmit={rhfHandleSubmit(onSubmit)}>
                      <div className="row gy-3">
                        {/* Datos base */}
                        <div className="col-sm-6 col-xs-6">
                          <label htmlFor="name" className="form-label">Nombre *</label>
                          <input
                            type="text"
                            id="name"
                            className="common-input common-input--md border--color-dark bg--white"
                            {...register("name", { required: "El nombre del producto es obligatorio.", maxLength: { value: 255, message: "Máximo 255 caracteres." } })}
                          />
                          <FieldError error={errors.name} />
                        </div>

                        <div className="col-sm-3 col-xs-6">
                          <label htmlFor="price" className="form-label">Precio *</label>
                          <input
                            type="number"
                            step="0.01"
                            id="price"
                            className="common-input common-input--md border--color-dark bg--white"
                            {...register("price", {
                              required: "El precio es obligatorio.",
                              valueAsNumber: true,
                              min: { value: 0, message: "El precio no puede ser negativo." },
                            })}
                          />
                          <FieldError error={errors.price} />
                        </div>

                        <div className="col-sm-3 col-xs-6">
                          <label htmlFor="stock" className="form-label">Stock *</label>
                          <input
                            type="number"
                            step="1"
                            id="stock"
                            className="common-input common-input--md border--color-dark bg--white"
                            {...register("stock", {
                              required: "El stock es obligatorio.",
                              valueAsNumber: true,
                              min: { value: 0, message: "El stock no puede ser negativo." },
                            })}
                          />
                          <FieldError error={errors.stock} />
                        </div>

                        <div className="col-sm-6 col-xs-6">
                          <label htmlFor="category_id" className="form-label">ID Categoría</label>
                          <input
                            type="text"
                            id="category_id"
                            className="common-input common-input--md border--color-dark bg--white"
                            placeholder="Ej. 26"
                            {...register("category_id", {
                              validate: (v) => !v || /^\d+$/.test(v) || "Debe ser numérico",
                            })}
                          />
                          <FieldError error={errors.category_id} />
                        </div>

                        <div className="col-sm-12">
                          <label htmlFor="description" className="form-label">Descripción</label>
                          <textarea
                            id="description"
                            className="common-input common-input--md border--color-dark bg--white"
                            placeholder="Describe tu producto"
                            {...register("description")}
                          />
                          <FieldError error={errors.description} />
                        </div>

                        {/* Direcciones por ID */}
                        <div className="col-12">
                          <h6 className="mb-2">Localidades / Direcciones</h6>
                          <div className="row g-3">
                            <div className="col-sm-6">
                              <label className="form-label">address_id (opcional)</label>
                              <input
                                type="text"
                                placeholder="Ej. 15"
                                className="common-input common-input--md border--color-dark bg--white"
                                {...register("address_id", {
                                  validate: (v) => !v || /^\d+$/.test(v) || "Debe ser numérico",
                                })}
                              />
                              <FieldError error={errors.address_id} />
                            </div>
                            <div className="col-sm-6">
                              <label className="form-label">address_ids (lista, separados por coma)</label>
                              <input
                                type="text"
                                value={addressIdsInput}
                                onChange={(e) => setAddressIdsInput(e.target.value)}
                                placeholder="Ej. 21, 22, 23"
                                className="common-input common-input--md border--color-dark bg--white"
                              />
                              <FieldError error={errors["address_ids"]} />
                            </div>
                          </div>
                        </div>

                        {/* Pivot */}
                        <div className="col-12">
                          <div className="mt-3 p-3 border rounded">
                            <h6 className="mb-2">Configuración por localidad (pivot por defecto)</h6>
                            <div className="row g-3">
                              <div className="col-sm-4">
                                <label className="form-label">pivot.stock</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={pivot.stock}
                                  onChange={(e) => syncPivot({ stock: e.target.value })}
                                  className="common-input common-input--md border--color-dark bg--white"
                                  placeholder="0"
                                />
                                <FieldError error={errors?.pivot?.stock} />
                              </div>
                              <div className="col-sm-4">
                                <label className="form-label d-block">pivot.is_active</label>
                                <div className="form-check form-switch">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="pivot_is_active"
                                    checked={pivot.is_active}
                                    onChange={(e) => syncPivot({ is_active: e.target.checked })}
                                  />
                                  <label htmlFor="pivot_is_active" className="form-check-label">Activo</label>
                                </div>
                                <FieldError error={errors?.pivot?.is_active} />
                              </div>
                              <div className="col-sm-4">
                                <label className="form-label">pivot.notes</label>
                                <input
                                  type="text"
                                  value={pivot.notes}
                                  onChange={(e) => syncPivot({ notes: e.target.value })}
                                  className="common-input common-input--md border--color-dark bg--white"
                                  placeholder="Notas opcionales"
                                />
                                <FieldError error={errors?.pivot?.notes} />
                              </div>
                              <div className="col-sm-6">
                                <label className="form-label">pivot.available_from</label>
                                <input
                                  type="date"
                                  value={pivot.available_from}
                                  onChange={(e) => syncPivot({ available_from: e.target.value })}
                                  className="common-input common-input--md border--color-dark bg--white"
                                />
                                <FieldError error={errors?.pivot?.available_from} />
                              </div>
                              <div className="col-sm-6">
                                <label className="form-label">pivot.available_to</label>
                                <input
                                  type="date"
                                  value={pivot.available_to}
                                  onChange={(e) => syncPivot({ available_to: e.target.value })}
                                  className="common-input common-input--md border--color-dark bg--white"
                                />
                                <FieldError error={errors?.pivot?.available_to} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progreso */}
                        {progress !== null && (
                          <div className="col-sm-12">
                            <div className="progress" style={{ height: 8 }}>
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${progress}%` }}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              />
                            </div>
                            <small className="text-muted d-block mt-1">Subiendo… {progress}%</small>
                          </div>
                        )}
                      </div>
                      <div
                        className="mt-3 p-3 border rounded"
                        onDrop={onDrop}
                        onDragOver={prevent}
                        onDragEnter={prevent}
                        onDragLeave={prevent}
                      >

                        {/* Encabezado estilo formulario */}
                        <div className="">
                          <h6 className="title m-0">Imágenes del producto</h6>
                        </div>

                        <div className="card-body">
                          <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={onPick}
                          />

                          <div
                            role="button"
                            onClick={openPicker}
                            className="w-100 mb-3 p-3 text-center border border-dashed rounded"
                            style={{ borderStyle: "dashed", cursor: "pointer" }}
                          >
                            <div className="mb-1 fw-semibold text-dark">Arrastra y suelta aquí</div>
                            <small className="text-muted">o haz clic para seleccionar (máx. 10, 2MB c/u)</small>
                          </div>

                          {/* Grid responsiva de 10 slots */}
                          <div className="row g-2">
                            {Array.from({ length: 10 }).map((_, i) => {
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
                                          src={URL.createObjectURL(f)}
                                          alt={`img-${i}`}
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
                                </div>
                              );
                            })}
                          </div>

                          {/* Preview principal grande (primer imagen) */}
                          {files[0] && (
                            <div className="mt-3">
                              <label className="form-label fw-semibold">Preview principal</label>
                              <div className="border rounded overflow-hidden">
                                <img
                                  src={URL.createObjectURL(files[0])}
                                  alt="preview-principal"
                                  style={{ width: "100%", height: 350, objectFit: "cover" }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botón a LO ANCHO */}
                      <div className="mt-3">
                        <button type="submit" className="btn btn-main btn-md w-100" disabled={isSubmitting}>
                          {isSubmitting ? "Guardando…" : "Agregar producto"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Imágenes del producto (debajo del form) */}

              </div>

              {/* Columna derecha: Vivienda */}
              <div className="col-lg-4">
                <div className="card common-card border border-gray-five overflow-hidden">
                  <div className="card-header">
                    <h6 className="title">Vivienda / Dirección del vendedor</h6>
                  </div>
                  <div className="card-body">
                    <small className="text-muted d-block mb-2">
                      Si llenas esta sección, el backend requiere <strong>Destinatario, Teléfono y Calle</strong>.
                    </small>
                    <div className="row g-2">
                      {[
                        ["recipient", "Destinatario *"],
                        ["phone", "Teléfono *"],
                        ["street", "Calle *"],
                        ["ext_no", "No. Ext"],
                        ["int_no", "No. Int"],
                        ["neighborhood", "Colonia"],
                        ["city", "Ciudad"],
                        ["state", "Estado"],
                        ["zip", "C.P."],
                      ].map(([key, label]) => (
                        <div className="col-12" key={key}>
                          <label className="form-label">{label}</label>
                          <input
                            type="text"
                            value={addressSingle[key]}
                            onChange={(e) => setAddressSingle((s) => ({ ...s, [key]: e.target.value }))}
                            className="common-input common-input--md border--color-dark bg--white"
                          />
                        </div>
                      ))}
                      <div className="col-12">
                        <label className="form-label">Referencias</label>
                        <textarea
                          value={addressSingle.references}
                          onChange={(e) => setAddressSingle((s) => ({ ...s, references: e.target.value }))}
                          className="common-input common-input--md border--color-dark bg--white"
                          placeholder="Punto de referencia, horario, etc."
                        />
                      </div>
                    </div>

                    <hr className="my-3" />
                    <label className="form-label">IDs de direcciones existentes</label>
                    <input
                      type="text"
                      value={addressIdsInput}
                      onChange={(e) => setAddressIdsInput(e.target.value)}
                      placeholder="Ej. 21, 22, 23"
                      className="common-input common-input--md border--color-dark bg--white"
                    />
                    <small className="text-muted d-block mt-1">
                      También puedes usar el campo <code>address_id</code> en el formulario principal.
                    </small>
                  </div>
                </div>
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
