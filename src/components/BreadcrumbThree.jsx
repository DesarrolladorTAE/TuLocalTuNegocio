import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { actualizarUsuario, actualizarAvatar } from "../service";
import { alertaError } from "../utils/alerts";

function formatoFechaRegistro(iso) {
  if (!iso) return "";
  const fecha = new Date(iso);
  const dia = fecha.toLocaleDateString("es-MX", { day: "numeric" });
  const mes = fecha.toLocaleDateString("es-MX", { month: "long" });
  const anio = fecha.toLocaleDateString("es-MX", { year: "numeric" });
  return `Se registró el ${dia} de ${mes} del ${anio}`;
}

const BreadcrumbThree = ({
  title = "",
  trail = [],
  entity = null,
  showNewProduct = true,
  isVendorView = false,
  onUpdated,
}) => {

  const [localName, setLocalName] = useState();
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const registered = entity?.created_at ? formatoFechaRegistro(entity.created_at) : "";
  const heading = isVendorView ? "Vendedor" : "Mi perfil";

  const defaultAvatar = "/assets/images/thumbs/author-profile.png";

  // URL del backend (con bust)
  const [avatarUrl, setAvatarUrl] = useState(entity?.avatar_url || defaultAvatar);
  // Preview local inmediato
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);

  const [savingAvatar, setSavingAvatar] = useState(false);
  const fileRef = useRef(null);

  const bust = (url) => (url ? `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}` : url);

  useEffect(() => {
    // console.log('entety: ', entu)
    // cuando cambie el entity (p. ej. al entrar), muestra el avatar actual
    if (entity?.avatar_url) {
      setAvatarUrl(bust(entity.avatar_url));
    } else if (!entity) {
      setAvatarUrl(defaultAvatar);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity?.avatar_url]);

  // Limpia el objectURL temporal cuando cambie o al desmontar
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  useEffect(() => {
    setLocalName(entity.name)
    console.log('nombre: ', entity.name)
  }, []);

  const triggerAvatar = () => fileRef.current?.click();

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1) Preview inmediato
    const localUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(localUrl);

    try {
      setSavingAvatar(true);

      // 2) SUBE solo el avatar (multipart puro) usando el nuevo servicio
      const u = await actualizarAvatar(file);

      // 3) Reemplaza por la URL del backend + bust para tumbar caché
      const nextUrl = bust(u?.avatar_url || avatarUrl || defaultAvatar);
      setAvatarUrl(nextUrl);
      setAvatarPreviewUrl(null);

      // 4) Propaga al padre y persiste en localStorage
      const merged = { ...(entity || {}), ...u, avatar_url: nextUrl };
      onUpdated?.(merged);
      try { localStorage.setItem("user", JSON.stringify(merged)); } catch { }
    } catch (err) {
      console.error(err);
      alertaError(err.message || "No se pudo actualizar el avatar.");
      // si falla, regresa la UI al avatar anterior
      setAvatarPreviewUrl(null);
    } finally {
      setSavingAvatar(false);
      e.target.value = ""; // permite volver a elegir el mismo archivo
      // libera memoria del objectURL temporal
      if (localUrl) URL.revokeObjectURL(localUrl);
    }
  };

  const saveName = async () => {
    const next = localName.trim();
    if (!next) return;
    if (entity?.name && next === entity.name) { setEditingName(false); return; }
    try {
      setSavingName(true);
      // usa tu servicio existente para actualizar nombre
      const u = await actualizarUsuario({ name: next });
      setLocalName(u?.name || next);

      // sincroniza entidad y cache local
      const merged = { ...(entity || {}), ...u };
      onUpdated?.(merged);
      try { localStorage.setItem("user", JSON.stringify(merged)); } catch { }

      setEditingName(false);
    } catch (err) {
      console.error(err);
      alertaError(err.message || "No se pudo actualizar el nombre.");
    } finally {
      setSavingName(false);
    }
  };

  return (
    <section className="breadcrumb-three section-bg position-relative z-index-1 overflow-hidden">
      <img src="/assets/images/gradients/breadcrumb-gradient-bg.png" alt="" className="bg--gradient" />
      <img src="assets/images/shapes/element-moon3.png" alt="" className="element one" />
      <img src="assets/images/shapes/element-moon1.png" alt="" className="element three" />

      <div className="container container-two">
        {Array.isArray(trail) && trail.length > 0 && (
          <ul className="breadcrumb-list flx-align gap-2 mb-2">
            {trail.map((item, i) => (
              <li key={`${item.label}-${i}`} className="breadcrumb-list__item font-14 text-body">
                {item.to ? (
                  <Link to={item.to} className="breadcrumb-list__link text-body hover-text-main">
                    {item.label}
                  </Link>
                ) : (
                  <span className="breadcrumb-list__text">{item.label}</span>
                )}
                {i < trail.length - 1 && (
                  <span className="breadcrumb-list__icon font-10">
                    <i className="fas fa-chevron-right" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="breadcrumb-three-content border-bottom border-color">
          <div className="breadcrumb-three-content__inner">
            <div className="breadcrumb-three-content__left">
              <div className="flx-between align-items-end gap-3">
                <div className="author-profile d-flex gap-2 flex-column">
                  {/* Avatar con overlay de cámara */}
                  <div className="author-profile__thumb" style={{ position: "relative" }}>
                    <img
                      // si hay preview local úsala; si no, la URL del backend
                      key={avatarUrl}
                      src={avatarPreviewUrl || avatarUrl || defaultAvatar}
                      alt={entity?.name || "avatar"}
                      className="author-profile__img"
                      onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                    />

                    {!isVendorView && (
                      <>
                        <button
                          type="button"
                          className="avatar-edit-btn btn btn-white"
                          onClick={triggerAvatar}
                          disabled={savingAvatar}
                          title="Cambiar avatar"
                          style={{ position: "absolute", right: -6, bottom: -6, borderRadius: 999, padding: "6px 8px" }}
                        >
                          {savingAvatar ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-camera" />}
                        </button>

                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*,image/webp"
                          onChange={onAvatarChange}
                          hidden
                        />
                      </>
                    )}
                  </div>

                  <div className="author-profile__info">
                    <h3 className="breadcrumb-three-content__title mb-2">{heading}</h3>

                    {!isVendorView ? (
                      <div className="d-flex align-items-center gap-2">
                        {editingName ? (
                          <>
                            <input
                              value={localName}
                              onChange={(e) => setLocalName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveName();
                                if (e.key === "Escape") { setEditingName(false); setLocalName(entity?.name || localName); }
                              }}
                              className="form-control"
                              style={{ maxWidth: 280 }}
                              placeholder="Tu nombre"
                              disabled={savingName}
                              autoFocus
                            />
                            <button type="button" className="btn btn-main btn-sm" onClick={saveName} disabled={savingName} title="Guardar">
                              {savingName ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-check" />}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-light btn-sm"
                              onClick={() => { setEditingName(false); setLocalName(entity?.name || localName); }}
                              title="Cancelar"
                              disabled={savingName}
                            >
                              <i className="fas fa-times" />
                            </button>
                          </>
                        ) : (
                          <>
                            <h5 className="author-profile__name mb-2">{localName}</h5>
                            <button type="button" className="btn btn-outline-light btn-sm" onClick={() => setEditingName(true)} title="Editar nombre">
                              <i className="fas fa-pen" />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <h5 className="author-profile__name mb-2">{localName}</h5>
                    )}

                    {registered && <span className="author-profile__membership font-14">{registered}</span>}
                  </div>
                </div>

                <div className="breadcrumb-three-content__right flex-shrink-0 d-flex align-items-center gap-4 gap-lg-5">
                  <div className="author-rating">
                    <span className="author-rating__text text-heading fw-500 mb-2">Calificación del autor</span>
                    <div className="d-flex align-items-center gap-1">
                      <ul className="star-rating">
                        {[...Array(5)].map((_, i) => (
                          <li key={i} className="star-rating__item font-11"><i className="fas fa-star" /></li>
                        ))}
                      </ul>
                      <span className="star-rating__text text-body ms-1">5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ul className="nav tab-bordered nav-pills mt-4" id="pills-tabbs" role="tablist">
            <li className="nav-item" role="presentation">
              <button className="nav-link active" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="true">
                Perfil
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="pills-portfolio-tab" data-bs-toggle="pill" data-bs-target="#pills-portfolio" type="button" role="tab" aria-controls="pills-portfolio" aria-selected="false">
                Productos
              </button>
            </li>
            {showNewProduct && !isVendorView && (
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="pills-Settingss-tab" data-bs-toggle="pill" data-bs-target="#pills-Settingss" type="button" role="tab" aria-controls="pills-Settingss" aria-selected="false">
                  Nuevo Producto
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default BreadcrumbThree;
