import { Link } from "react-router-dom";
import React, { useMemo, useState } from "react";
// si ya tienes un axios configurado con CSRF/Sanctum, úsalo:
import axiosClient from "../axiosClient"; // ajusta a tu path real

const MXN = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

const preset = [100, 200, 300, 500]; // MXN

const Donation = () => {
  const [amount, setAmount] = useState(200); // MXN
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("Apoyo a la causa");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // el monto efectivo es el custom (>0) o el seleccionado
  const effectiveAmount = useMemo(() => {
    const v = Number(custom);
    if (!isNaN(v) && v > 0) return v;
    return amount;
  }, [custom, amount]);

  // const toggleMethod = (k) =>
  //   setMethods((m) => ({ ...m, [k]: !m[k] }));

  const handleDonate = async (e) => {
    // obtener el usuario desde localStorage
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      user = {};
    }

    e.preventDefault();
    setErr("");

    if (!effectiveAmount || effectiveAmount < 1) {
      setErr("Ingresa un monto válido.");
      return;
    }

    try {
      setLoading(true);

      // OJO: esto sigue tu backend actual que espera las keys en el body:
      const payload = {
        amount: Math.round(effectiveAmount * 100), // a centavos
        description: message || "Donación",
        // publicKey: import.meta.env.VITE_CONEKTA_PUBLIC_KEY,    // ⚠️ sólo pública
        // privateKey: import.meta.env.VITE_CONEKTA_PRIVATE_KEY,  // ⚠️ no recomendado
        success_url: `${window.location.origin}/donaciones`,
        failure_url: `${window.location.origin}/donaciones`,
        // allowed_payment_methods: selectedMethods, // ['card','spei','cash']
        customer: anonymous
          ? {}
          : {
            name: name?.trim() || user.name || undefined,
            email: email?.trim() || user.email || undefined,
          },
        metadata: {
          source: "web",
          path: window.location.pathname,
        },
      };

      const { data } = await axiosClient.get("/donations/checkout-url", {
        // Tu ruta está en GET; si cambias a POST, usa axiosClient.post
        params: payload, // GET -> mandamos por query
      });

      // Abre la URL de pago:
      if (data?.checkout_url) {
        // Más confiable en iOS/Safari
        window.location.assign(data.checkout_url);
      } else {
        setErr("No se recibió la URL de pago. Intenta de nuevo.");
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.errors ||
        e?.message ||
        "Error inesperado";
      setErr(typeof msg === "string" ? msg : "Ocurrió un error al generar el enlace de pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact padding-t-120 padding-b-60 section-bg position-relative z-index-1 overflow-hidden">
      <img
        src="assets/images/gradients/banner-two-gradient.png"
        alt=""
        className="bg--gradient"
      />
      <img
        src="assets/images/shapes/pattern-five.png"
        className="position-absolute end-0 top-0 z-index--1"
        alt=""
      />
      <div className="container container-two">
        <div className="row gy-4">
          {/* Lado izquierdo: info de campaña */}
          <div className="col-lg-5">
            <div className="contact-info">
              <h3 className="contact-info__title">Dona y haz la diferencia</h3>
              <p className="contact-info__desc">
                Tu aportación ayuda a sostener nuestras causas y llegar a más personas.
                Puedes donar con tarjeta, SPEI o efectivo (OXXO). ¡Gracias por apoyar!
              </p>

              <div className="contact-info__item-wrapper flx-between gap-4">
                <div className="contact-info__item">
                  <span className="contact-info__text d-block mb-1">Transparencia</span>
                  <span className="contact-info__link font-18 fw-500 text-heading">
                    Recibirás confirmación de pago
                  </span>
                </div>
                <div className="contact-info__item">
                  <span className="contact-info__text d-block mb-1">Seguridad</span>
                  <span className="contact-info__link font-18 fw-500 text-heading">
                    Pagos procesados por Conekta
                  </span>
                </div>
              </div>

              <div className="mt-24">
                <ul className="social-icon-list">
                  <li className="social-icon-list__item">
                    <Link to="https://www.facebook.com" className="social-icon-list__link text-heading flx-center">
                      <i className="fab fa-facebook-f" />
                    </Link>
                  </li>
                  <li className="social-icon-list__item">
                    <Link to="https://www.linkedin.com" className="social-icon-list__link text-heading flx-center">
                      <i className="fab fa-linkedin-in" />
                    </Link>
                  </li>
                  <li className="social-icon-list__item">
                    <Link to="https://www.youtube.com" className="social-icon-list__link text-heading flx-center">
                      <i className="fab fa-youtube" />
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mt-3 small text-muted">
                Al donar aceptas nuestro aviso de privacidad y términos. Si necesitas
                recibo fiscal, contáctanos antes de donar.
              </div>
            </div>
          </div>

          {/* Lado derecho: formulario de donación */}
          <div className="col-lg-7 ps-lg-5">
            <div className="card common-card p-sm-4">
              <div className="card-body">
                <form autoComplete="off" onSubmit={handleDonate}>
                  <div className="row gy-4">
                    {/* Monto */}
                    <div className="col-12">
                      <label className="form-label mb-2 font-18 font-heading fw-600">
                        Monto de tu donación
                      </label>
                      <div className="d-flex gap-2 flex-wrap">
                        {preset.map((p) => (
                          <button
                            key={p}
                            type="button"
                            className={`btn pill ${amount === p && !custom ? "btn-main" : "btn-outline-light"}`}
                            onClick={() => {
                              setAmount(p);
                              setCustom("");
                            }}
                            disabled={loading}
                          >
                            {MXN(p)}
                          </button>
                        ))}
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted">o</span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={custom}
                            onChange={(e) => setCustom(e.target.value)}
                            placeholder="Otro monto"
                            className="common-input common-input--grayBg border"
                            style={{ width: 160 }}
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <strong>Total:</strong>{" "}
                        {MXN(Math.max(0, effectiveAmount || 0))}
                      </div>
                    </div>

                    {/* Datos del donante */}
                    <div className="col-sm-6">
                      <label className="form-label mb-2 font-18 font-heading fw-600">
                        Nombre (opcional)
                      </label>
                      <input
                        type="text"
                        className="common-input common-input--grayBg border"
                        placeholder="Tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={anonymous || loading}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label mb-2 font-18 font-heading fw-600">
                        Correo (opcional)
                      </label>
                      <input
                        type="email"
                        className="common-input common-input--grayBg border"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={anonymous || loading}
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="anonSwitch"
                          checked={anonymous}
                          onChange={() => setAnonymous((x) => !x)}
                          disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="anonSwitch">
                          Donar de forma anónima
                        </label>
                      </div>
                    </div>

                    {/* Métodos de pago */}
                    {/* <div className="col-12">
                      <label className="form-label mb-2 font-18 font-heading fw-600">
                        Método de pago
                      </label>
                      <div className="d-flex gap-3 flex-wrap">
                        <label className="form-check d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={methods.card}
                            onChange={() => toggleMethod("card")}
                            disabled={loading}
                          />
                          <span>Tarjeta</span>
                        </label>
                        <label className="form-check d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={methods.spei}
                            onChange={() => toggleMethod("spei")}
                            disabled={loading}
                          />
                          <span>SPEI</span>
                        </label>
                        <label className="form-check d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={methods.cash}
                            onChange={() => toggleMethod("cash")}
                            disabled={loading}
                          />
                          <span>Efectivo (OXXO)</span>
                        </label>
                      </div>
                    </div> */}

                    {/* Mensaje/causa */}
                    <div className="col-sm-12">
                      <label className="form-label mb-2 font-18 font-heading fw-600">
                        Mensaje o causa (opcional)
                      </label>
                      <textarea
                        className="common-input common-input--grayBg border"
                        placeholder="Ej. 'Apoyo para becas' o 'Medicamentos'"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {err && (
                      <div className="col-12">
                        <div className="alert alert-danger py-2">{String(err)}</div>
                      </div>
                    )}

                    <div className="col-sm-12">
                      <button className="btn btn-main btn-lg pill w-100" disabled={loading}>
                        {loading ? "Generando enlace de pago..." : "Donar ahora"}
                      </button>
                      <div className="mt-2 text-center text-muted small">
                        Serás enviado/a a una página segura de pago.
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>{/* fin col derecha */}
        </div>
      </div>
    </section>
  );
};

export default Donation;
