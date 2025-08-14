import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { actualizarAdmin, mostrarUsuario } from "../service/indexAdmin";
import { register as apiRegister } from "../service/index"; // 👈 tu método de services
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const ProfileInner = () => {
  const userLS = JSON.parse(localStorage.getItem("user"));

  // ---------------- Perfil (ya lo tenías) ----------------
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm({
    defaultValues: {
      name: userLS.name || "",
      email: userLS.email || "",
      phone: userLS.phone || "",
      descripcion: userLS.descripcion || "",
      password: "",
      password_confirmation: "",
    },
  });

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [adminsMock, setAdmin] = useState([]);

  const openSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });
  const handleSnackClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnack((s) => ({ ...s, open: false }));
  };

  const username = useMemo(() => {
    if (userLS.username) return userLS.username;
    if (userLS.email) return userLS.email.split("@")[0];
    return (userLS.name || "usuario").toLowerCase().replace(/\s+/g, ".");
  }, [userLS]);

  const memberSince = useMemo(() => {
    try {
      return new Date(userLS.created_at).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  }, [userLS.created_at]);

  const withBust = (url, seed = Date.now()) =>
    url ? `${url}${url.includes("?") ? "&" : "?"}v=${seed}` : url;

  // ---------- Avatar: preview + DnD ----------
  const [avatarPreview, setAvatarPreview] = useState(
    withBust(userLS.avatar_url || userLS.avatar || "/assets/images/placeholder-avatar.png")
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const objectUrlRef = useRef(null);

  const setPreviewFromFile = (file) => {
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setAvatarPreview(url);
    setAvatarFile(file);
  };

  const onDrop = useCallback((accepted) => {
    if (accepted && accepted[0]) setPreviewFromFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024,
  });

  const onManualSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) setPreviewFromFile(f);
  };

  useEffect(() => {
    refrestAdmin()
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // ---------- submit perfil ----------
  const onSubmit = async (values) => {
    const fd = new FormData();

    if (dirtyFields.name && values.name !== userLS.name) fd.append("name", values.name);
    if (dirtyFields.email && values.email !== userLS.email) fd.append("email", values.email);
    if (dirtyFields.phone && values.phone !== (userLS.phone || "")) fd.append("phone", values.phone || "");
    if (dirtyFields.descripcion && (values.descripcion || "") !== (userLS.descripcion || "")) {
      fd.append("descripcion", values.descripcion || "");
    }
    if (values.password) {
      fd.append("password", values.password);
      fd.append("password_confirmation", values.password_confirmation || "");
    }
    if (avatarFile) {
      fd.append("avatar", avatarFile);
    }

    if (![...fd.keys()].length) return;

    try {
      const data = await actualizarAdmin(fd);
      const updated = data.user || {};
      const nextUser = { ...userLS, ...updated };
      localStorage.setItem("user", JSON.stringify(nextUser));

      if (updated.avatar_url) {
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
        setAvatarPreview(withBust(updated.avatar_url, Date.now()));
        setAvatarFile(null);
      }

      reset({
        name: nextUser.name || "",
        email: nextUser.email || "",
        phone: nextUser.phone || "",
        descripcion: nextUser.descripcion || "",
        password: "",
        password_confirmation: "",
      });

      openSnack(data.message || "Perfil actualizado correctamente.", "success");
    } catch (err) {
      const val = err?.errors;
      if (val && typeof val === "object") {
        Object.entries(val).forEach(([field, messages]) => {
          const msg = Array.isArray(messages) ? messages[0] : String(messages);
          setError(field === "avatar" ? "root" : field, { type: "server", message: msg });
        });
        const firstMsg =
          Object.values(val)?.[0]?.[0] || "Corrige los campos marcados e intenta nuevamente.";
        openSnack(firstMsg, "error");
      } else {
        setError("root", { type: "server", message: err?.message || "Error al actualizar el perfil." });
        openSnack(err?.message || "Error al actualizar el perfil.", "error");
      }
    }
  };

  // ---------------- Alta dinámica de administradores ----------------
  // RHF independiente para admins:
  const adminForm = useForm({
    defaultValues: {
      admins: [
        {
          name: "",
          email: "",
          phone: "",
          password: "",
          password_confirmation: "",
          google_id: "",
          terminos_aceptados: true, // requerido por backend
        },
      ],
    },
    mode: "onChange",
  });
  const {
    register: regAdmin,
    handleSubmit: handleSubmitAdmins,
    control,
    formState: { errors: adminErrors, isSubmitting: isSubmittingAdmins },
    getValues: getAdminValues,
    setError: setAdminError,
    reset: resetAdmins,
  } = adminForm;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "admins",
  });

  const agregarFila = () =>
    append({
      name: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
      google_id: "",
      terminos_aceptados: true,
    });

  const crearAdministradores = async ({ admins }) => {
    if (!Array.isArray(admins) || admins.length === 0) return;

    // Prepara payload por cada admin
    const payloads = admins.map((a) => ({
      name: a.name?.trim(),
      email: a.email?.trim(),
      phone: a.phone?.trim() || null,
      password: a.password,
      password_confirmation: a.password_confirmation,
      google_id: a.google_id?.trim() || null,
      // forzamos admin role=3 y términos true:
      role: 3,
      terminos_aceptados: Boolean(a.terminos_aceptados),
    }));

    try {
      const results = await Promise.allSettled(payloads.map((p) => apiRegister(p)));

      // Construye resumen por fila
      const ok = [];
      const fail = [];
      results.forEach((r, idx) => {
        if (r.status === "fulfilled") {
          ok.push({ index: idx, email: payloads[idx].email });
        } else {
          const val = r.reason?.response?.data?.errors || r.reason?.errors;
          const msg =
            (val && Object.values(val)?.[0]?.[0]) ||
            r.reason?.response?.data?.message ||
            r.reason?.message ||
            "Error inesperado";
          fail.push({ index: idx, email: payloads[idx].email, message: msg });

          // pinta error de ese bloque en el form:
          setAdminError(`admins.${idx}.root`, { type: "server", message: msg });
        }
      });

      if (ok.length) {
        openSnack(`Administradores creados: ${ok.map((x) => x.email).join(", ")}`, "success");
      }
      if (fail.length) {
        openSnack(
          `Errores: ${fail.map((x) => `${x.email}: ${x.message}`).join(" | ")}`,
          "error"
        );
      }

      // Si todos OK, limpia y acualiza
      refrestAdmin()
      if (fail.length === 0) {
        resetAdmins({
          admins: [
            {
              name: "",
              email: "",
              phone: "",
              password: "",
              password_confirmation: "",
              google_id: "",
              terminos_aceptados: true,
            },
          ],
        });
      }
    } catch (e) {
      openSnack("Error al crear administradores.", "error");
    }
  };

  // ---------- UI ----------
  const nameWatch = watch("name");
  const emailWatch = watch("email");
  const phoneWatch = watch("phone");
  const descripcionWatch = watch("descripcion");


  const refrestAdmin = () => {
    mostrarUsuario(3).then((res) => {
      console.log('admins: ', res)
      setAdmin(res)
    }).catch((err) => {
      console.log('err: ', err)
    })
  }

  return (
    <>
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleSnackClose} severity={snack.severity} variant="filled" sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>

      {/* Cover */}
      <div className="cover-photo position-relative z-index-1 overflow-hidden">
        <div className="avatar-upload">
          <div className="avatar-edit">
            <input type="file" id="imageUploadTwo" accept=".png, .jpg, .jpeg" />
            <label htmlFor="imageUploadTwo">
              <span className="icon"><img src="assets/images/icons/camera-two.svg" alt="" /></span>
              <span className="text">Change Cover</span>
            </label>
          </div>
          <div className="avatar-preview">
            <div id="imagePreviewTwo"></div>
          </div>
        </div>
      </div>

      <div className="dashboard-body__content profile-content-wrapper z-index-1 position-relative mt--100">
        <div className="profile">
          <div className="row gy-4">
            {/* Col izquierda */}
            <div className="col-xxl-3 col-xl-4">
              <div className="profile-info">
                <div className="profile-info__inner mb-40 text-center">
                  <div className="avatar-upload mb-24">
                    <div className="avatar-edit">
                      <input type="file" id="imageUpload" accept=".png, .jpg, .jpeg" onChange={onManualSelect} style={{ display: "none" }} />
                      <label htmlFor="imageUpload">
                        <img src="assets/images/icons/camera.svg" alt="" />
                      </label>
                    </div>
                    <div className="avatar-preview">
                      <div
                        id="imagePreview"
                        {...getRootProps()}
                        style={{
                          backgroundImage: `url(${avatarPreview})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          borderRadius: "50%",
                          width: 120,
                          height: 120,
                          margin: "0 auto",
                          border: isDragActive ? "2px dashed #0d6efd" : "2px solid transparent",
                          transition: "border .2s ease",
                          cursor: "pointer",
                        }}
                        title={isDragActive ? "Suelta la imagen aquí" : "Arrastra una imagen o haz clic"}
                      >
                        <input {...getInputProps()} />
                      </div>
                    </div>
                  </div>

                  <h5 className="profile-info__name mb-1">{nameWatch}</h5>
                  <span className="profile-info__designation font-14">
                    {descripcionWatch || "Usuario registrado"}
                  </span>
                </div>

                <ul className="profile-info-list">
                  <li className="profile-info-list__item">
                    <span className="profile-info-list__content flx-align flex-nowrap gap-2">
                      <img src="assets/images/icons/profile-info-icon1.svg" alt="" className="icon" />
                      <span className="text text-heading fw-500">Tipo usuario</span>
                    </span>
                    <span className="profile-info-list__info">{username}</span>
                  </li>

                  <li className="profile-info-list__item">
                    <span className="profile-info-list__content flx-align flex-nowrap gap-2">
                      <img src="assets/images/icons/profile-info-icon2.svg" alt="" className="icon" />
                      <span className="text text-heading fw-500">Correo</span>
                    </span>
                    <span className="profile-info-list__info">{emailWatch}</span>
                  </li>

                  <li className="profile-info-list__item">
                    <span className="profile-info-list__content flx-align flex-nowrap gap-2">
                      <img src="assets/images/icons/profile-info-icon3.svg" alt="" className="icon" />
                      <span className="text text-heading fw-500">Telefono</span>
                    </span>
                    <span className="profile-info-list__info">{phoneWatch || "—"}</span>
                  </li>

                  <li className="profile-info-list__item">
                    <span className="profile-info-list__content flx-align flex-nowrap gap-2">
                      <img src="assets/images/icons/profile-info-icon6.svg" alt="" className="icon" />
                      <span className="text text-heading fw-500">Miembro desde</span>
                    </span>
                    <span className="profile-info-list__info">{memberSince}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Col derecha */}
            <div className="col-xxl-9 col-xl-8">
              <div className="dashboard-card">
                <div className="dashboard-card__header pb-0">
                  <ul className="nav tab-bordered nav-pills" id="pills-tab" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link font-18 font-heading active"
                        id="pills-personalInfo-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#pills-personalInfo"
                        type="button"
                        role="tab"
                        aria-controls="pills-personalInfo"
                        aria-selected="true"
                      >
                        Personal Info
                      </button>
                    </li>

                    {/* NUEVA pestaña: Administradores */}
                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link font-18 font-heading"
                        id="pills-admins-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#pills-admins"
                        type="button"
                        role="tab"
                        aria-controls="pills-admins"
                        aria-selected="false"
                      >
                        Administradores
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="profile-info-content">
                  <div className="tab-content" id="pills-tabContent">
                    {/* --------- Personal Info --------- */}
                    <div className="tab-pane fade show active" id="pills-personalInfo" role="tabpanel">
                      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                        <div className="row gy-4">
                          <div className="col-sm-12">
                            {errors.root?.server && (
                              <div className="alert alert-danger py-2">{errors.root.server.message}</div>
                            )}
                          </div>

                          <div className="col-sm-12">
                            <label className="form-label mb-2 font-18 font-heading fw-600">Nombre</label>
                            <input
                              className="common-input border"
                              placeholder="Nombre"
                              {...register("name", { required: "El nombre es obligatorio" })}
                            />
                            {errors.name && <small className="text-danger">{errors.name.message}</small>}
                          </div>

                          <div className="col-sm-6">
                            <label className="form-label mb-2 font-18 font-heading fw-600">Teléfono</label>
                            <input className="common-input border" placeholder="Teléfono" {...register("phone")} />
                          </div>

                          <div className="col-sm-6">
                            <label className="form-label mb-2 font-18 font-heading fw-600">Email</label>
                            <input
                              type="email"
                              className="common-input border"
                              placeholder="Email"
                              {...register("email", {
                                required: "El email es obligatorio",
                                pattern: { value: /\S+@\S+\.\S+/, message: "Email inválido" },
                              })}
                            />
                            {errors.email && <small className="text-danger">{errors.email.message}</small>}
                          </div>

                          <div className="col-sm-12">
                            <label className="form-label mb-2 font-18 font-heading fw-600">Descripción</label>
                            <textarea
                              className="common-input border"
                              rows={3}
                              placeholder="Cuéntanos algo de ti"
                              {...register("descripcion")}
                            />
                          </div>

                          <div className="col-sm-6">
                            <label className="form-label mb-2 font-18 font-heading fw-600">
                              Nueva contraseña (opcional)
                            </label>
                            <input
                              type="password"
                              className="common-input border"
                              placeholder="********"
                              {...register("password", {
                                minLength: { value: 8, message: "Mínimo 8 caracteres" },
                              })}
                            />
                            {errors.password && <small className="text-danger">{errors.password.message}</small>}
                          </div>

                          <div className="col-sm-6">
                            <label className="form-label mb-2 font-18 font-heading fw-600">
                              Confirmar contraseña
                            </label>
                            <input
                              type="password"
                              className="common-input border"
                              placeholder="********"
                              {...register("password_confirmation", {
                                validate: (v, f) =>
                                  !f.password || v === f.password || "Las contraseñas no coinciden",
                              })}
                            />
                            {errors.password_confirmation && (
                              <small className="text-danger">{errors.password_confirmation.message}</small>
                            )}
                          </div>

                          <div className="col-sm-12 text-end">
                            <button className="btn btn-main btn-lg pill mt-4" disabled={isSubmitting}>
                              {isSubmitting ? "Guardando..." : "Actualizar perfil"}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* --------- NUEVO: Administradores --------- */}
                    <div
                      className="tab-pane fade"
                      id="pills-admins"
                      role="tabpanel"
                      aria-labelledby="pills-admins-tab"
                      tabIndex={0}
                    >
                      <div className="accordion" id="accordionAdmins">
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingFormAdmins">
                            <button
                              className="accordion-button"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseFormAdmins"
                              aria-expanded="true"
                              aria-controls="collapseFormAdmins"
                            >
                              Alta de administradores
                            </button>
                          </h2>

                          {/* 👇 El body va dentro del collapse */}
                          <div
                            id="collapseFormAdmins"
                            className="accordion-collapse collapse show"
                            aria-labelledby="headingFormAdmins"
                            data-bs-parent="#accordionAdmins"
                          >
                            <div className="accordion-body">
                              <form autoComplete="off" onSubmit={handleSubmitAdmins(crearAdministradores)}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h5 className="mb-0">Alta de administradores</h5>
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                                    onClick={agregarFila}
                                  >
                                    <AddCircleOutlineIcon fontSize="small" />
                                    Agregar administrador
                                  </button>
                                </div>

                                {fields.length === 0 && (
                                  <div className="alert alert-info">No hay filas. Agrega un administrador.</div>
                                )}

                                {fields.map((field, idx) => {
                                  const base = `admins.${idx}`;
                                  const e = adminErrors?.admins?.[idx] || {};
                                  const rootErr = e?.root?.message;

                                  return (
                                    <div key={field.id} className="border rounded p-3 mb-3">
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 className="mb-0">Administrador #{idx + 1}</h6>
                                        <button
                                          type="button"
                                          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                          onClick={() => remove(idx)}
                                          title="Eliminar fila"
                                        >
                                          <DeleteOutlineIcon fontSize="small" />
                                          Quitar
                                        </button>
                                      </div>

                                      {rootErr && <div className="alert alert-danger py-2">{rootErr}</div>}

                                      <div className="row gy-3">
                                        <div className="col-md-6">
                                          <label className="form-label fw-600">Nombre *</label>
                                          <input
                                            className="common-input border"
                                            placeholder="Nombre completo"
                                            {...regAdmin(`${base}.name`, {
                                              required: "El nombre es obligatorio.",
                                              maxLength: { value: 255, message: "Máximo 255 caracteres." },
                                            })}
                                          />
                                          {e?.name && <small className="text-danger">{e.name.message}</small>}
                                        </div>

                                        <div className="col-md-6">
                                          <label className="form-label fw-600">Email *</label>
                                          <input
                                            type="email"
                                            className="common-input border"
                                            placeholder="correo@dominio.com"
                                            {...regAdmin(`${base}.email`, {
                                              required: "El email es obligatorio.",
                                              pattern: { value: /\S+@\S+\.\S+/, message: "Email inválido." },
                                            })}
                                          />
                                          {e?.email && <small className="text-danger">{e.email.message}</small>}
                                        </div>

                                        <div className="col-md-6">
                                          <label className="form-label fw-600">Teléfono</label>
                                          <input
                                            className="common-input border"
                                            placeholder="Opcional"
                                            {...regAdmin(`${base}.phone`, {
                                              maxLength: { value: 20, message: "Máximo 20 caracteres." },
                                            })}
                                          />
                                          {e?.phone && <small className="text-danger">{e.phone.message}</small>}
                                        </div>

                                        <div className="col-md-6">
                                          <label className="form-label fw-600">Google ID</label>
                                          <input
                                            className="common-input border"
                                            placeholder="Opcional"
                                            {...regAdmin(`${base}.google_id`)}
                                          />
                                        </div>

                                        <div className="col-md-6">
                                          <label className="form-label fw-600">Contraseña *</label>
                                          <input
                                            type="password"
                                            className="common-input border"
                                            placeholder="********"
                                            {...regAdmin(`${base}.password`, {
                                              required: "La contraseña es obligatoria.",
                                              minLength: { value: 8, message: "Mínimo 8 caracteres." },
                                            })}
                                          />
                                          {e?.password && <small className="text-danger">{e.password.message}</small>}
                                        </div>

                                        <div className="col-md-6">
                                          <label className="form-label fw-600">Confirmar contraseña *</label>
                                          <input
                                            type="password"
                                            className="common-input border"
                                            placeholder="********"
                                            {...regAdmin(`${base}.password_confirmation`, {
                                              validate: (v) => {
                                                const pw = getAdminValues(`${base}.password`);
                                                return v === pw || "Las contraseñas no coinciden.";
                                              },
                                            })}
                                          />
                                          {e?.password_confirmation && (
                                            <small className="text-danger">{e.password_confirmation.message}</small>
                                          )}
                                        </div>

                                        <div className="col-md-12 d-flex align-items-center gap-2">
                                          <input
                                            id={`chk-terminos-${idx}`}
                                            type="checkbox"
                                            className="form-check-input"
                                            defaultChecked
                                            {...regAdmin(`${base}.terminos_aceptados`, {
                                              required: "Debes aceptar los términos.",
                                            })}
                                          />
                                          <label htmlFor={`chk-terminos-${idx}`} className="form-check-label">
                                            Acepto términos y condiciones *
                                          </label>
                                          {e?.terminos_aceptados && (
                                            <small className="text-danger ms-2">{e.terminos_aceptados.message}</small>
                                          )}
                                        </div>

                                        {/* role fijo 3 (no editable) */}
                                        <div className="col-md-12">
                                          <small className="text-muted">
                                            Este usuario se registrará con rol: <b>3 (Administrador)</b>
                                          </small>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}

                                <div className="text-end">
                                  <button className="btn btn-main btn-lg pill mt-2" disabled={isSubmittingAdmins}>
                                    {isSubmittingAdmins ? "Creando..." : "Crear administradores"}
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                          {/* 👆 Fin collapse */}
                        </div>
                      </div>

                      {/* Lista de administradores (mock) */}
                      <div className="mt-4">
                        <h5 className="mb-3">Administradores registrados</h5>
                        <ul className="list-group">
                          {adminsMock.map((a) => (
                            <li
                              key={a.id}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <strong className="d-block">{a.name}</strong>
                                <span className="text-muted d-block">{a.email}</span>
                                <small className="text-muted">Tel: {a.phone || "—"}</small>
                              </div>
                              <span className={`badge ${a.status === "Activo" ? "bg-success" : "bg-secondary"}`}>
                                {a.status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
            {/* fin col derecha */}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileInner;
