import { Link } from "react-router-dom";
import React, { useEffect, useMemo, useRef, useState } from "react";
import axiosClient from "../axiosClient";

const MXN = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

const preset = [100, 200, 300, 500]; // MXN

function loadPayPal({
  clientId,
  currency = "MXN",
  locale = "es_MX",
  components = "buttons,marks",
} = {}) {
  if (!clientId) return Promise.reject(new Error("Falta clientId de PayPal"));
  const id = "paypal-sdk";
  const params = new URLSearchParams({
    "client-id": clientId,
    currency,
    locale,
    components,
    intent: "capture",
  });
  const desiredSrc = `https://www.paypal.com/sdk/js?${params.toString()}`;

  const existing = document.getElementById(id);
  if (existing) {
    if (existing.src === desiredSrc) {
      if (window.paypal) return Promise.resolve(window.paypal);
      return new Promise((resolve) => {
        existing.addEventListener("load", () => resolve(window.paypal));
      });
    } else {
      existing.remove();
    }
  }

  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.id = id;
    s.src = desiredSrc;
    s.async = true;
    s.onload = () => resolve(window.paypal);
    s.onerror = () => reject(new Error("No se pudo cargar PayPal SDK"));
    document.head.appendChild(s);
  });
}

const Donation = () => {
  const [amount, setAmount] = useState(200);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("Apoyo a la causa");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const paypalBtnRef = useRef(null);

  const effectiveAmount = useMemo(() => {
    const v = Number(custom);
    if (!isNaN(v) && v > 0) return v;
    return amount;
  }, [custom, amount]);

  // Render PayPal Buttons
  useEffect(() => {
    const clientId =
      "AfcK74JpIOLk5mi45WsZPvO3czidSwv6abSUBZjS6xlHdacJ-IKjOrUpmHCJ4asVDFAaC_mqglu8Hgwe"; // producción
    if (!clientId) return;

    setErr("");
    loadPayPal({
      clientId,
      currency: "MXN",
      locale: "es_MX",
      buyerCountry: "MX",
      components: "buttons",
    })
      .then((paypal) => {
        if (paypalBtnRef.current) paypalBtnRef.current.innerHTML = "";

        paypal
          .Buttons({
            style: {
              layout: "vertical",
              shape: "pill",
              label: "donate",
            },
            createOrder: (_data, actions) => {
              if (!effectiveAmount || effectiveAmount < 1) {
                setErr("Ingresa un monto válido.");
                return;
              }
              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    amount: {
                      currency_code: "MXN",
                      value: String(effectiveAmount.toFixed(2)),
                    },
                    description: message || "Donación",
                  },
                ],
                application_context: {
                  shipping_preference: "NO_SHIPPING",
                },
              });
            },
            onApprove: async (_data, actions) => {
              const details = await actions.order.capture();
              try {
                await axiosClient.post("/donations/paypal-complete", {
                  order: details,
                  donor: anonymous
                    ? {}
                    : {
                        name: name?.trim() || undefined,
                        email: email?.trim() || undefined,
                      },
                  note: message || "Donación",
                });
              } catch (e) {
                console.warn("Callback backend falló:", e?.message);
              }
              window.location.assign("/donaciones?status=success");
            },
            onError: (err) => {
              console.error(err);
              setErr("Hubo un problema con PayPal. Intenta nuevamente.");
            },
          })
          .render(paypalBtnRef.current);
      })
      .catch(() => setErr("No se pudo cargar PayPal. Revisa tu client ID."));
  }, [effectiveAmount, message, anonymous, name, email]);

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
          {/* Izquierda */}
          <div className="col-lg-5">
            <div className="contact-info">
              <h3 className="contact-info__title">Dona y haz la diferencia</h3>
              <p className="contact-info__desc">
                Tu aportación ayuda a sostener nuestras causas y llegar a más
                personas. Puedes donar con tu cuenta PayPal. ¡Gracias por
                apoyar!
              </p>

              <div className="contact-info__item-wrapper flx-between gap-4">
                <div className="contact-info__item">
                  <span className="contact-info__text d-block mb-1">
                    Transparencia
                  </span>
                  <span className="contact-info__link font-18 fw-500 text-heading">
                    Recibirás confirmación de pago
                  </span>
                </div>
                <div className="contact-info__item">
                  <span className="contact-info__text d-block mb-1">
                    Seguridad
                  </span>
                  <span className="contact-info__link font-18 fw-500 text-heading">
                    Pagos procesados por PayPal
                  </span>
                </div>
              </div>

              <div className="mt-24">
                <ul className="social-icon-list">
                  <li className="social-icon-list__item">
                    <Link
                      to="https://www.tiktok.com/@tulocaltunego?is_from_webapp=1&sender_device=pc"
                      className="social-icon-list__link text-heading flx-center"
                    >
                      <i className="fab fa-tiktok" />
                    </Link>
                  </li>
                  <li className="social-icon-list__item">
                    <Link
                      to="https://www.instagram.com/tulocaltunego/?utm_source=ig_web_button_share_sheet"
                      className="social-icon-list__link text-heading flx-center"
                    >
                      <i className="fab fa-instagram" />
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mt-3 small text-muted">
                Al donar aceptas nuestro aviso de privacidad y términos. Si
                necesitas recibo fiscal, contáctanos antes de donar.
              </div>
            </div>
          </div>

          {/* Derecha */}
          <div className="col-lg-7 ps-lg-5">
            <div className="card common-card p-sm-4">
              <div className="card-body">
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
                          className={`btn pill ${
                            amount === p && !custom
                              ? "btn-main"
                              : "btn-outline-light"
                          }`}
                          onClick={() => {
                            setAmount(p);
                            setCustom("");
                          }}
                          disabled={loading}
                        >
                          {MXN(p)}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2">
                      <strong>Total:</strong>{" "}
                      {MXN(Math.max(0, effectiveAmount || 0))}
                    </div>
                  </div>

                  {/* Datos donante */}
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
                      <label
                        className="form-check-label"
                        htmlFor="anonSwitch"
                      >
                        Donar de forma anónima
                      </label>
                    </div>
                  </div>

                  {/* Mensaje */}
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
                      <div className="alert alert-danger py-2">
                        {String(err)}
                      </div>
                    </div>
                  )}

                  {/* PayPal Buttons */}
                  <div className="col-sm-12">
                    <div ref={paypalBtnRef} />
                    <div className="mt-2 text-center text-muted small">
                      Finaliza tu donación con tu cuenta PayPal o tarjeta.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* fin col derecha */}
        </div>
      </div>
    </section>
  );
};

export default Donation;
