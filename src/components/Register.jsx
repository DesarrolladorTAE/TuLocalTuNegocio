import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ThemeToggle from "./ThemeToggle";
import { register as apiRegister, registerWithGoogle } from "../service";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { useForm } from "react-hook-form";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";

import TerminosCondicionesContent from "./TerminosCondiciones";
import AvisoPrivacidadContent from "./PoliticasPrivacidad";
const Register = () => {
  const navigate = useNavigate();

  // Toggles de contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [openTC, setOpenTC] = useState(false);
  const [openPriv, setOpenPriv] = useState(false);


  // Snackbar MUI
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error" | "info" | "warning"
  });
  const openSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    setFocus,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
      role: "2",
      terminos_aceptados: false,
    },
    mode: "onTouched",
  });

  const FIELD_MAP = {
    // por si tu backend usa otros nombres:
    terms: "terminos_aceptados",
    terminos: "terminos_aceptados",
    telefono: "phone",
    password_confirmation: "password_confirmation",
    // agrega aquí cualquier alias que devuelva tu API
  };

  const passwordValue = watch("password");

  // Validaciones
  const rules = {
    name: {
      required: "El nombre es obligatorio.",
      minLength: { value: 2, message: "El nombre es muy corto." },
    },
    email: {
      required: "El email es obligatorio.",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Ingresa un email válido.",
      },
    },
    phone: {
      // Opcional, pero si viene, debe ser 10 dígitos
      validate: (v) =>
        v === "" || /^\d{10}$/.test(v) || "El teléfono debe tener 10 dígitos.",
      maxLength: { value: 10, message: "Máximo 10 dígitos." },
    },
    password: {
      required: "La contraseña es obligatoria.",
      pattern: {
        value: /^(?=.*[A-Z]).{8,}$/,
        message: "Mínimo 8 caracteres y 1 mayúscula.",
      },
    },
    password_confirmation: {
      required: "Confirma tu contraseña.",
      validate: (v) =>
        v === passwordValue || "Las contraseñas no coinciden.",
    },
    terminos_aceptados: {
      validate: (v) => v || "Debes aceptar los Términos y Condiciones.",
    },
  };

  function applyServerErrors(serverErrors) {
    let firstField = null;

    Object.entries(serverErrors).forEach(([rawKey, msgs]) => {
      const key = FIELD_MAP[rawKey] ?? rawKey;         // normaliza nombre
      const message = Array.isArray(msgs) ? msgs[0] : String(msgs || "Dato inválido.");
      setError(key, { type: "server", message });
      if (!firstField) firstField = key;
    });

    // Enfoca el primer campo con error
    if (firstField) setFocus(firstField);
  }

  const onSubmit = async (data) => {
    try {
      // Llamada a tu API
      await apiRegister(data);
      openSnack("Cuenta creada con éxito. ¡Bienvenido!", "success");
      navigate("/profile");
    } catch (err) {
      // Si no es error de Axios, notifica genérico
      const response = err?.response;
      if (!response) {
        openSnack("No hay conexión con el servidor. Intenta de nuevo.", "error");
        return;
      }

      const { status, data: respData } = response;

      // 422: pintar errores campo a campo y enfocar el primero
      if (status === 422) {
        if (respData?.errors) {
          applyServerErrors(respData.errors); // usa tu helper
          openSnack("Revisa los campos marcados en el formulario.", "error");
          return;
        }
        // 422 sin 'errors' (mensaje general)
        if (respData?.message) {
          // márcalo en un campo razonable o en "root"
          setError("email", { type: "server", message: respData.message });
          setFocus("email");
          openSnack(respData.message, "error");
          return;
        }
      }

      // 409 / 401 / 403 con mensaje legible
      if ((status === 409 || status === 401 || status === 403) && respData?.message) {
        openSnack(respData.message, "error");
        return;
      }

      // fallback
      openSnack(respData?.message || "Ocurrió un error inesperado. Intenta más tarde.", "error");
    }
  };

  return (
    <>
      <section className="account d-flex">
        {/* Top Actions */}
        <div
          className="top-actions"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 999,
          }}
        >
          <Link
            to="/"
            className="home-button"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#ffffffff",
              color: "#6c5ce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
            }}
            title="Inicio"
          >
            <HomeIcon fontSize="small" />
          </Link>
          <ThemeToggle />
        </div>

        {/* Left Image */}
        <div className="account__left d-md-flex d-none flx-align section-bg position-relative z-index-1 overflow-hidden">
          <img
            src="assets/images/shapes/pattern-curve-seven.png"
            alt=""
            className="position-absolute end-0 top-0 z-index--1 h-100"
          />
          <div className="account-thumb">
            <img src="assets/images/nuevas/registro.jpg" alt="" />
            <div className="statistics animation bg-main text-center">
              <h5 className="statistics__amount text-white">+50 mil</h5>
              <span className="statistics__text text-white font-14">Posibilidades</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="account__right padding-t-120 flx-align">
          <div className="account-content">
            {/* Logos y enlaces */}
            <Link to="/" className="logo d-block text-center mb-3">
              <img src="assets/images/logo/logo.png" alt="Logo claro" className="white-version" />
              <img src="assets/images/logo/white-logo-two.png" alt="Logo oscuro" className="dark-version" />
            </Link>
            <div className="text-center mb-3">
              <p style={{ fontSize: "16px", fontWeight: "500", color: "#6c5ce7" }}>
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" style={{ color: "#341f97", fontWeight: "700", textDecoration: "underline" }}>
                  Inicia sesión aquí
                </Link>
              </p>
            </div>

            {/* Registro con Google */}
            <div className="col-12 mb-3">
              <button
                type="button"
                className="btn btn-outline-light btn-lg-icon btn-lg w-100 pill"
                onClick={registerWithGoogle}
                disabled={isSubmitting}
              >
                <span className="icon icon-left">
                  <img src="assets/images/icons/google.svg" alt="Google" />
                </span>
                Regístrate con Google
              </button>
            </div>

            <div className="text-center my-4">
              <span style={{ fontSize: "20px", fontWeight: "600", color: "#333" }}>ó</span>
            </div>

            <h4 className="account-content__title mb-4 text-center">Crea Una Cuenta Gratuita</h4>

            {/* FORMULARIO (RHF) */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="row gy-4">
                {/* Nombre */}
                <div className="col-12">
                  <label className="form-label mb-2 font-18 fw-600">Nombre Completo</label>
                  <input
                    type="text"
                    className={`common-input common-input--bg ${errors.name ? "is-invalid" : ""}`}
                    placeholder="Tu nombre completo"
                    disabled={isSubmitting}
                    {...register("name", rules.name)}
                  />
                  {errors.name && <small className="text-danger">{errors.name.message}</small>}
                </div>

                {/* Email */}
                <div className="col-12">
                  <label className="form-label mb-2 font-18 fw-600">Email</label>
                  <input
                    type="email"
                    className={`common-input common-input--bg ${errors.email ? "is-invalid" : ""}`}
                    placeholder="correo@mail.com"
                    disabled={isSubmitting}
                    {...register("email", rules.email)}
                  />
                  {errors.email && <small className="text-danger">{errors.email.message}</small>}
                </div>

                {/* Teléfono */}
                <div className="col-12">
                  <label className="form-label mb-2 font-18 fw-600">Teléfono</label>
                  <input
                    type="text"
                    placeholder="10 dígitos"
                    maxLength={10}
                    className={`common-input common-input--bg ${errors.phone ? "is-invalid" : ""}`}
                    disabled={isSubmitting}
                    {...register("phone", rules.phone)}
                  />
                  {errors.phone && <small className="text-danger">{errors.phone.message}</small>}
                </div>

                {/* Contraseña */}
                <div className="col-12">
                  <label className="form-label mb-2 font-18 fw-600">Contraseña</label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="8+ caracteres, 1 mayúscula"
                      className={`common-input common-input--bg ${errors.password ? "is-invalid" : ""}`}
                      disabled={isSubmitting}
                      {...register("password", rules.password)}
                    />
                    <span
                      className="input-icon toggle-password cursor-pointer"
                      onClick={() => !isSubmitting && setShowPassword((s) => !s)}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </span>
                  </div>
                  {errors.password && <small className="text-danger">{errors.password.message}</small>}
                </div>

                {/* Confirmar Contraseña */}
                <div className="col-12">
                  <label className="form-label mb-2 font-18 fw-600">Confirmar Contraseña</label>
                  <div className="position-relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      className={`common-input common-input--bg ${errors.password_confirmation ? "is-invalid" : ""}`}
                      disabled={isSubmitting}
                      {...register("password_confirmation", rules.password_confirmation)}
                    />
                    <span
                      className="input-icon toggle-password cursor-pointer"
                      onClick={() => !isSubmitting && setShowConfirm((s) => !s)}
                    >
                      {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </span>
                  </div>
                  {errors.password_confirmation && (
                    <small className="text-danger">{errors.password_confirmation.message}</small>
                  )}
                </div>

                {/* Términos */}
                <div className="col-12">
                  <div className="d-flex align-items-center">
                    {/* Checkbox */}
                    <input
                      className={`form-check-input me-2 ${errors.terminos_aceptados ? "is-invalid" : ""}`}
                      type="checkbox"
                      id="agree"
                      disabled={isSubmitting}
                      {...register("terminos_aceptados", rules.terminos_aceptados)}
                    />

                    {/* Texto + enlaces en una sola línea */}
                    <label
                      className="form-check-label mb-0 fw-400 font-16 text-body"
                      htmlFor="agree"
                    >
                      Acepto los{" "}
                      <button
                        type="button"
                        className="btn-as-link fw-600"
                        onClick={() => setOpenTC(true)}
                        disabled={isSubmitting}
                      >
                        Términos y Condiciones
                      </button>{" "}
                      y el{" "}
                      <button
                        type="button"
                        className="btn-as-link fw-600"
                        onClick={() => setOpenPriv(true)}
                        disabled={isSubmitting}
                      >
                        Aviso de Privacidad
                      </button>
                    </label>
                  </div>

                  {/* Error */}
                  {errors.terminos_aceptados && (
                    <small className="text-danger d-block mt-1">
                      {errors.terminos_aceptados.message}
                    </small>
                  )}
                </div>


                {/* Submit */}
                <div className="col-12">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-main btn-lg w-100 pill d-flex align-items-center justify-content-center"
                    style={{ gap: 8 }}
                  >
                    {isSubmitting && (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    )}
                    {isSubmitting ? "Creando cuenta…" : "Crear Cuenta"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Dialog open={openTC} onClose={() => setOpenTC(false)} maxWidth="md" fullWidth keepMounted scroll="paper">
        <DialogTitle className="d-flex align-items-center gap-2">
          <ArticleOutlinedIcon fontSize="small" />
          Términos y Condiciones
        </DialogTitle>

        {/* Barra superior con buscador (ya dentro del componente) + botón PDF a la derecha */}
        <DialogContent dividers sx={{ maxHeight: "70vh" }}>
          <TerminosCondicionesContent />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenTC(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPriv} onClose={() => setOpenPriv(false)} maxWidth="md" fullWidth keepMounted scroll="paper">
        <DialogTitle className="d-flex align-items-center gap-2">
          <PolicyOutlinedIcon fontSize="small" />
          Aviso de Privacidad
        </DialogTitle>

        <DialogContent dividers sx={{ maxHeight: "70vh" }}>
          <AvisoPrivacidadContent />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenPriv(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>



      {/* Snackbar MUI */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert elevation={6} variant="filled" severity={snack.severity} onClose={closeSnack}>
          {snack.message}
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default Register;
