import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ThemeToggle from "./ThemeToggle";

const Register = () => {
  return (
    <>
      {/* ================================== Account Page Start =========================== */}
      <section className="account d-flex">
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
          {/* Botón Home */}
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

          {/* ThemeToggle */}
          <ThemeToggle />
        </div>

        <div className="account__left d-md-flex d-none flx-align section-bg position-relative z-index-1 overflow-hidden">
          <img
            src="assets/images/shapes/pattern-curve-seven.png"
            alt=""
            className="position-absolute end-0 top-0 z-index--1 h-100"
          />
          <div className="account-thumb">
            <img src="assets/images/nuevas/registro.jpg" alt="" />
            <div className="statistics animation bg-main text-center">
              <h5 className="statistics__amount text-white">50k</h5>
              <span className="statistics__text text-white font-14">
                Posibilidades
              </span>
            </div>
          </div>
        </div>
        <div className="account__right padding-t-120 flx-align">
          <div className="account-content">
            {/* Logo */}
            <Link to="/" className="logo d-block text-center mb-3">
              <img
                src="assets/images/logo/logo.png"
                alt="Logo claro"
                className="white-version"
                // style={{ maxWidth: "0px" }}
              />
              <img
                src="assets/images/logo/white-logo-two.png"
                alt="Logo oscuro"
                className="dark-version"
                // style={{ maxWidth: "220px" }}
              />
            </Link>

            {/* ¿Ya tienes cuenta? */}
            <div className="text-center mb-3">
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#6c5ce7",
                }}
              >
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#341f97",
                    fontWeight: "700",
                    textDecoration: "underline",
                  }}
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>

            {/* Google */}
            <div className="col-12 mb-3">
              <button
                type="button"
                className="btn btn-outline-light btn-lg-icon btn-lg w-100 pill"
              >
                <span className="icon icon-left">
                  <img src="assets/images/icons/google.svg" alt="Google" />
                </span>
                Regístrate con Google
              </button>
            </div>

            {/* Separador Ó */}
            <div className="text-center my-4">
              <span
                style={{
                  display: "inline-block",
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                ó
              </span>
            </div>

            {/* Título */}
            <h4 className="account-content__title mb-4 text-center">
              Crea Una Cuenta Gratuita
            </h4>

            <form action="#">
              <div className="row gy-4">
                {/* Nombre */}
                <div className="col-12">
                  <label
                    htmlFor="name"
                    className="form-label mb-2 font-18 font-heading fw-600"
                  >
                    Nombre Completo
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className="common-input common-input--bg common-input--withIcon"
                      id="name"
                      placeholder="Your full name"
                    />
                    <span className="input-icon">
                      <img src="assets/images/icons/user-icon.svg" alt="" />
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="col-12">
                  <label
                    htmlFor="email"
                    className="form-label mb-2 font-18 font-heading fw-600"
                  >
                    Email
                  </label>
                  <div className="position-relative">
                    <input
                      type="email"
                      className="common-input common-input--bg common-input--withIcon"
                      id="email"
                      placeholder="infoname@mail.com"
                    />
                    <span className="input-icon">
                      <img src="assets/images/icons/envelope-icon.svg" alt="" />
                    </span>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="col-12">
                  <label
                    htmlFor="phone"
                    className="form-label mb-2 font-18 font-heading fw-600"
                  >
                    Telefono
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className="common-input common-input--bg common-input--withIcon"
                      id="phone"
                      placeholder="Ejemplo: 5512345678"
                    />
                    <span className="input-icon">
                      <img src="assets/images/icons/phone-icon.svg" alt="" />
                    </span>
                  </div>
                </div>

                {/* Password */}
                <div className="col-12">
                  <label
                    htmlFor="your-password"
                    className="form-label mb-2 font-18 font-heading fw-600"
                  >
                    Contraseña
                  </label>
                  <div className="position-relative">
                    <input
                      type="password"
                      className="common-input common-input--bg common-input--withIcon"
                      id="your-password"
                      placeholder="8+ Caracteres, 1 Letra Mayúscula"
                    />
                    <span
                      className="input-icon toggle-password cursor-pointer"
                      id="#your-password"
                    >
                      <img src="assets/images/icons/lock-icon.svg" alt="" />
                    </span>
                  </div>
                </div>

                {/* Tipo de cuenta */}
                <div className="col-12">
                  <label
                    htmlFor="role"
                    className="form-label mb-2 font-18 font-heading fw-600"
                  >
                    Tipo de cuenta
                  </label>
                  <div className="position-relative">
                    <select
                      id="role"
                      className="common-input common-input--bg common-input--withIcon"
                    >
                      <option value="">-- Selecciona --</option>
                      <option value="cliente">Cliente</option>
                      <option value="vendedor">Vendedor</option>
                    </select>
                    <span className="input-icon">
                      <img src="assets/images/icons/user-icon.svg" alt="" />
                    </span>
                  </div>
                </div>

                {/* Términos */}
                <div className="col-12">
                  <div className="common-check my-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="checkbox"
                      id="agree"
                    />
                    <label
                      className="form-check-label mb-0 fw-400 font-16 text-body"
                      htmlFor="agree"
                    >
                      Acepto los Términos y Condiciones
                    </label>
                  </div>
                </div>

                {/* Botón crear cuenta */}
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-main btn-lg w-100 pill"
                  >
                    Crear Cuenta
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
      {/* ================================== Account Page End =========================== */}
    </>
  );
};

export default Register;
