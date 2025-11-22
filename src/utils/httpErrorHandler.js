// src/utils/httpErrorHandler.js

import { alertaError } from "./alerts";

/**
 * Maneja errores HTTP provenientes de Axios o Fetch
 * y muestra un Swal con:
 *  - Mensaje principal
 *  - Detalle técnico (exception, file, line, status)
 * Además detecta sesión expirada (Unauthenticated)
 *
 * @param {object} err - error capturado en catch
 * @param {string} fallback - mensaje por defecto si falta info del backend
 */
export function handleHttpError(err, fallback = "Ocurrió un error inesperado.") {
  const status = err?.response?.status;
  const data = err?.response?.data || {};

  // ==========================
  // 🔥 Detectar sesión expirada
  // ==========================
  const isUnauthenticated =
    data?.error === "Unauthenticated." ||
    data?.exception === "Illuminate\\Auth\\AuthenticationException" ||
    String(data?.exception || "").includes("AuthenticationException");

  if (isUnauthenticated) {
    alertaError(
      "Sesión expirada",
      data?.message ||
        "Tu sesión ha expirado, por favor vuelve a iniciar sesión."
    );

    // Limpieza de sesión
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch {}

    // Opcional: redirigir
    // window.location.href = "/login-register?session=expired";

    return; // Ya manejado
  }

  // ==========================
  // 🔥 Manejo genérico de cualquier error (400, 404, 422, 500…)
  // ==========================
  const errors422 = data?.errors;

  // mensaje principal
  const message =
    data?.message ||
    (errors422 && Object.values(errors422)?.[0]?.[0]) ||
    fallback;

  // detalle técnico
  let detailParts = [];

  if (data?.error) detailParts.push(`Error: ${data.error}`);
  if (data?.exception) detailParts.push(`Excepción: ${data.exception}`);
  if (data?.file && data?.line)
    detailParts.push(`Ubicación: ${data.file}:${data.line}`);
  if (status) detailParts.push(`HTTP ${status}`);
  if (data?.detail) detailParts.push(String(data.detail));

  const detail = detailParts.join("\n");

  alertaError(message, detail);
}
