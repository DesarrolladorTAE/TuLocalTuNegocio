import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { login, loginWithGoogle } from "../service";
import {  alertaError } from "../utils/alerts";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";


const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGoogle = () => {
    if (loading) return;
    setLoading(true);
    // Redirige fuera; al volver, la callback guardará la sesión
    loginWithGoogle();
  };

  // opcional: si vienes de error en callback, muéstralo
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "oauth") alertaError("No se pudo iniciar sesión con Google.");
  }, []);

  const validar = () => {
    if (!form.email || !form.password) {
      alertaError("Ingresa tu correo y contraseña.");
      return false;
    }
    // Validación simple de email
    const emailOk = /\S+@\S+\.\S+/.test(form.email);
    if (!emailOk) {
      alertaError("Ingresa un correo válido.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    try {
      setLoading(true);
      let response = await login({
        email: form.email,
        password: form.password,
        // remember: form.remember,
      });

      if (response.user.role === 3) {
        navigate("/dashboard");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      const { response } = err || {};
      if (!response) {
        alertaError("No hay conexión con el servidor. Intenta de nuevo.");
        return;
      }
      const { status, data } = response;

      if (status === 422 && data?.errors) {
        const first =
          Object.values(data.errors)?.[0]?.[0] ||
          "Datos inválidos, revisa el formulario.";
        alertaError(first);
        return;
      }

      if ((status === 401 || status === 403) && data?.message) {
        alertaError(data.message);
        return;
      }

      alertaError(data?.message || "Ocurrió un error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================================== Página de Cuenta (Login) =========================== */}
      <section className="account d-flex">
        {/* <img src="assets/images/thumbs/account-img.png" alt="" className="account__img" /> */}

        {/* Columna izquierda (imagen) */}
        <div className="account__left d-md-flex d-none flx-align section-bg position-relative z-index-1 overflow-hidden">
          <img
            src="assets/images/shapes/pattern-curve-seven.png"
            alt=""
            className="position-absolute end-0 top-0 z-index--1 h-100"
          />
          <div className="account-thumb">
            <img src="assets/images/nuevas/iniciosesion.png" alt="" />
            <div className="statistics animation bg-main text-center">
              <h5 className="statistics__amount text-white">+50 mil</h5>
              <span className="statistics__text text-white font-14">
                Clientes
              </span>
            </div>
          </div>
        </div>

        {/* Columna derecha (formulario) */}
        <div className="account__right padding-y-120 flx-align">
          <div className="dark-light-mode">
            <ThemeToggle />
          </div>

          <div className="account-content">
            <Link to="/" className="logo mb-64">
              <img
                src="assets/images/logo/logo.png"
                alt=""
                className="white-version"
              />
              <img
                src="assets/images/logo/white-logo-two.png"
                alt=""
                className="dark-version"
              />
            </Link>

            <h4 className="account-content__title mb-48 text-capitalize">
              ¡Bienvenido de nuevo!
            </h4>

            <form onSubmit={handleSubmit}>
              <div className="row gy-4">
                {/* Botón Google primero */}
                <div className="col-12">
                  <button
                    type="button"
                    className="btn btn-outline-light btn-lg-icon btn-lg w-100 pill d-flex align-items-center justify-content-center"
                    onClick={handleGoogle}
                    disabled={loading}
                  >
                    <span className="icon icon-left">
                      <img src="assets/images/icons/google.svg" alt="Google" />
                    </span>
                    Iniciar sesión con Google
                  </button>
                </div>

                <div className="col-12 text-center">
                  <span className="font-14 text-body">
                    o ingresa con tu correo
                  </span>
                </div>

                <div className="col-12">
                  <label
                    htmlFor="email"
                    className="form-label mb-2 font-18 font-heading fw-600"
                  >
                    Correo electrónico
                  </label>
                  <div className="position-relative">
                    <input
                      type="email"
                      className="common-input common-input--bg common-input--withIcon"
                      id="email"
                      name="email"
                      placeholder="correo@ejemplo.com"
                      value={form.email}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span className="input-icon">
                      <img src="assets/images/icons/envelope-icon.svg" alt="" />
                    </span>
                  </div>
                </div>

                <div className="col-12">
                  <label
                    htmlFor="password"
                    className="form-label mb-2 font-18 font-heading fw-600"
                  >
                    Contraseña
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPass ? "text" : "password"}
                      className="common-input common-input--bg common-input--withIcon"
                      id="password"
                      name="password"
                      placeholder="Ingresa tu contraseña"
                      value={form.password}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span
                      className="input-icon toggle-password cursor-pointer"
                      onClick={() => !loading && setShowPass((prev) => !prev)}
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </span>
                  </div>
                </div>

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-main btn-lg w-100 pill d-flex align-items-center justify-content-center"
                    disabled={loading}
                    style={{ gap: 8 }}
                  >
                    {loading && (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                    )}
                    {loading ? "Iniciando sesión…" : "Iniciar sesión"}
                  </button>
                </div>

                <div className="col-sm-12 mb-0">
                  <div className="have-account text-center">
                    <p className="text font-14">
                      ¿Aún no tienes cuenta?{" "}
                      <Link
                        className="link text-main text-decoration-underline fw-500"
                        to="/register"
                      >
                        Regístrate
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
      {/* ================================== Fin Login =========================== */}
    </>
  );
};

export default Login;
