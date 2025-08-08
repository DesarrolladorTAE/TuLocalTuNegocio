import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ThemeToggle from "./ThemeToggle";
import { register, loginWithGoogle, registerWithGoogle } from "../service";
import { alertaSuccess, alertaError } from "../utils/alerts";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    role: "1",
    terminos_aceptados: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false); // 👈 animación / bloqueo

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validarFormulario = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.password_confirmation) {
      alertaError("Todos los campos son obligatorios.");
      return false;
    }

    const regexTelefono = /^\d{10}$/;
    if (formData.phone && !regexTelefono.test(formData.phone)) {
      alertaError("El teléfono debe tener exactamente 10 dígitos.");
      return false;
    }

    const regexPassword = /^(?=.*[A-Z]).{8,}$/;
    if (!regexPassword.test(formData.password)) {
      alertaError("La contraseña debe tener al menos 8 caracteres y 1 letra mayúscula.");
      return false;
    }

    if (formData.password !== formData.password_confirmation) {
      alertaError("Las contraseñas no coinciden.");
      return false;
    }

    if (!formData.terminos_aceptados) {
      alertaError("Debes aceptar los Términos y Condiciones.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      const res = await register(formData);

      // Si llega aquí, asumimos 200/201 OK
      alertaSuccess("Cuenta creada con éxito. ¡Bienvenido!");
      navigate("/"); // o a la ruta que prefieras
    } catch (err) {
      const { response } = err || {};

      if (!response) {
        alertaError("No hay conexión con el servidor. Intenta de nuevo.");
        return;
        }

      const { status, data } = response;

      if (status === 422 && data?.errors) {
        // Muestra el primer error de validación
        const firstMsg = Object.values(data.errors)?.[0]?.[0] || "Datos inválidos, revisa el formulario.";
        alertaError(firstMsg);
        return;
      }

      if (status === 409 && data?.message) {
        alertaError(data.message); // p.ej. email ya registrado
        return;
      }

      if ((status === 401 || status === 403) && data?.message) {
        alertaError(data.message); // no autorizado
        return;
      }

      alertaError(data?.message || "Ocurrió un error inesperado. Intenta más tarde.");
    } finally {
      setLoading(false);
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
              <button type="button" className="btn btn-outline-light btn-lg-icon btn-lg w-100 pill" onClick={registerWithGoogle} disabled={loading}>
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

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit}>
              <div className="row gy-4">
                <div className="col-12">
                  <label className="form-label mb-2 font-18 fw-600">Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="common-input common-input--bg"
                    placeholder="Tu nombre completo"
                    disabled={loading}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label mb-2 font-18 fw-600">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="common-input common-input--bg"
                    placeholder="correo@mail.com"
                    disabled={loading}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label mb-2 font-18 fw-600">Teléfono</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="common-input common-input--bg"
                    placeholder="10 dígitos"
                    maxLength={10}
                    disabled={loading}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label mb-2 font-18 fw-600">Contraseña</label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="common-input common-input--bg"
                      placeholder="8+ caracteres, 1 mayúscula"
                      disabled={loading}
                    />
                    <span className="input-icon toggle-password cursor-pointer" onClick={() => !loading && setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </span>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label mb-2 font-18 fw-600">Confirmar Contraseña</label>
                  <div className="position-relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className="common-input common-input--bg"
                      placeholder="Repite tu contraseña"
                      disabled={loading}
                    />
                    <span className="input-icon toggle-password cursor-pointer" onClick={() => !loading && setShowConfirm(!showConfirm)}>
                      {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </span>
                  </div>
                </div>
                {/* <div className="col-12">
                  <label className="form-label mb-2 font-18 fw-600">Tipo de Cuenta</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="common-input common-input--bg"
                    disabled={loading}
                  >
                    <option value="1">Cliente</option>
                    <option value="2">Vendedor</option>
                  </select>
                </div> */}
                <div className="col-12">
                  <div className="common-check my-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="terminos_aceptados"
                      checked={formData.terminos_aceptados}
                      onChange={handleChange}
                      id="agree"
                      disabled={loading}
                    />
                    <label className="form-check-label mb-0 fw-400 font-16 text-body" htmlFor="agree">
                      Acepto los Términos y Condiciones
                    </label>
                  </div>
                </div>
                <div className="col-12">
                  <button
                    type="submit"
                    disabled={!formData.terminos_aceptados || loading}
                    className="btn btn-main btn-lg w-100 pill d-flex align-items-center justify-content-center"
                    style={{ gap: 8 }}
                  >
                    {loading && (
                      // Usa Bootstrap si lo tienes; si no, puedes reemplazar por tu propio loader
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    )}
                    {loading ? "Creando cuenta…" : "Crear Cuenta"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Register;
