import axiosClient from "../axiosClient";

const API_URL = "https://tulocaltunego.com/api";
const FRONT_URL = window.location.origin;

const STORAGE_KEYS = { token: "token", user: "user" };
let authState = { token: null, user: null };
const listeners = new Set(); // para notificar cambios (opcional)

// ---- helpers de persistencia ----
function loadFrom(storage = localStorage) {
  const t = storage.getItem(STORAGE_KEYS.token);
  const u = storage.getItem(STORAGE_KEYS.user);
  if (t && u) {
    authState.token = t;
    try {
      authState.user = JSON.parse(u);
    } catch {
      authState.user = null;
    }
  }
}
function saveAuth({ token, user }, persist = true) {
  authState = { token, user };
  const storage = persist ? localStorage : sessionStorage;
  storage.setItem(STORAGE_KEYS.token, token);
  storage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  // limpia el otro storage para evitar estados cruzados
  (persist ? sessionStorage : localStorage).removeItem(STORAGE_KEYS.token);
  (persist ? sessionStorage : localStorage).removeItem(STORAGE_KEYS.user);
  notify();
}
function clearAuth() {
  authState = { token: null, user: null };
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
  sessionStorage.removeItem(STORAGE_KEYS.token);
  sessionStorage.removeItem(STORAGE_KEYS.user);
  notify();
}
function notify() {
  listeners.forEach((cb) => cb({ ...authState }));
}

// ---- hidrata estado al cargar el módulo ----
loadFrom(localStorage);
if (!authState.token) loadFrom(sessionStorage);

// ---- Interceptores axios: Bearer + 401 ----
axiosClient.interceptors.request.use((config) => {
  if (authState.token)
    config.headers.Authorization = `Bearer ${authState.token}`;
  return config;
});
axiosClient.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) clearAuth();
    return Promise.reject(err);
  }
);

// ---- API pública del service ----
export function isAuthenticated() {
  return !!authState.token;
}
export function getToken() {
  return authState.token;
}
export function getUser() {
  return authState.user;
}

export async function login(credentials, { remember = true } = {}) {
  const { data } = await axiosClient.post("login", credentials);
  // espera { token, user }
  saveAuth({ token: data.token, user: data.user }, remember);
  return data;
}

//Registro Normal
// service/index.js (o donde lo tengas)
// Registro Normal (con token guardado)
export async function register(userData, { remember = true } = {}) {
  try {
    // si tu backend valida "accepted", asegúrate de mandar boolean
    const payload = {
      ...userData,
      terminos_aceptados: !!userData.terminos_aceptados,
    };

    const { data } = await axiosClient.post("registrar", payload);
    // si devuelve token/usuario, guárdalos
    if (data?.token && data?.user) {
      saveAuth({ token: data.token, user: data.user }, remember);
    }
    return data;
  } catch (err) {
    // re-lanza para que el componente pinte errores campo a campo
    throw err;
  }
}

// Redirige al backend para autenticación con Google
export function registerWithGoogle() {
  clearAuth(); // opcional pero útil al testear
  const returnUrl = `${window.location.origin}/oauth/callback`;
  const url = `${API_URL}/auth/google/redirect?redirect=${encodeURIComponent(returnUrl)}&ts=${Date.now()}`;
  window.location.href = url;
}

// Cuando el backend redirige al FRONT con los datos
export function handleGoogleCallback(userData) {
  // Guarda datos del usuario y token
  localStorage.setItem("user", JSON.stringify(userData.user));
  localStorage.setItem("token", userData.token);

  // Opcional: establecer cabeceras globales de axios
  // axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
}



// Google: redirección a proveedor
export function loginWithGoogle() {
  const redirect = encodeURIComponent(`${FRONT_URL}/oauth/callback`);
  window.location.assign(`${API_URL}/auth/google/redirect?redirect=${redirect}`);
}

// Google: manejar callback ?token=...&user=base64(json)
export function handleOAuthCallbackFromURL({ defaultRedirect = "/", persist } = {}) {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const userB64 = params.get("user");
  const next = params.get("next");        // opcional: /dashboard, /pos, etc.
  const remember = persist ?? (params.get("remember") !== "0"); // por defecto true

  if (!token || !userB64) {
    // Limpia la URL ruidosa aunque falle
    try { window.history.replaceState({}, "", "/login"); } catch { }
    return false;
  }

  try {
    // base64-url => base64 estándar con padding
    const padded = userB64.replace(/-/g, "+").replace(/_/g, "/")
      .padEnd(Math.ceil(userB64.length / 4) * 4, "=");

    const bin = atob(padded);

    // UTF-8 safe: intenta TextDecoder, si no, fallback a escape()
    let user;
    try {
      const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
      user = JSON.parse(new TextDecoder("utf-8").decode(bytes));
    } catch {
      const json = decodeURIComponent(escape(bin));
      user = JSON.parse(json);
    }

    // ✅ guarda exactamente como quieres (persistente en localStorage)
    saveAuth({ token, user }, remember);

    // ✅ setea Authorization global
    if (axiosClient?.defaults) {
      axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    // ✅ limpia querystring por seguridad
    const target = next || defaultRedirect;
    try { window.history.replaceState({}, "", target); } catch { }

    return true;
  } catch (e) {
    console.error("Error al procesar callback de Google:", e);
    try { window.history.replaceState({}, "", "/login"); } catch { }
    return false;
  }
}


export async function logout() {
  if (!authState.token) {
    try {
      await axiosClient.post("logout", null, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });
    } catch (err) {
      console.error("Logout error:", err);
      // window.location.assign(`${API_URL}/login`);
      throw err
    }
  } else {
    window.location.href = `/login`;


  }

  clearAuth();
}

// Suscribirse a cambios (útil para navbar)
export function onAuthChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}


// Crear productos por usuario.
// service.js
export async function createProduct(formData, onProgress) {
  // Normaliza a FormData
  let fd;
  if (formData instanceof FormData) {
    fd = formData;
  } else {
    fd = new FormData();
    const d = formData || {};
    const appendIf = (k, v) => {
      if (v !== undefined && v !== null && `${v}`.trim() !== "") fd.append(k, v);
    };

    appendIf("id", d.id);
    appendIf("name", d.name);
    appendIf("description", d.description);
    appendIf("price", d.price);
    appendIf("stock", d.stock);
    appendIf("category_id", d.category_id);

    if (d.images) Array.from(d.images).slice(0, 10).forEach(file => fd.append("images[]", file, file.name));
    (d.selected_address_ids || []).forEach(id => fd.append("address_ids[]", id));

    const a = d.new_address || {};
    const hasSingle = a.recipient || a.phone || a.street;
    if (hasSingle) {
      appendIf("address[recipient]", a.recipient);
      appendIf("address[phone]", a.phone);
      appendIf("address[street]", a.street);
      appendIf("address[ext_no]", a.ext_no);
      appendIf("address[int_no]", a.int_no);
      appendIf("address[neighborhood]", a.neighborhood);
      appendIf("address[city]", a.city);
      appendIf("address[state]", a.state);
      appendIf("address[zip]", a.zip);
      appendIf("address[references]", a.references);
    }

    const dft = d.pivot_default || {};
    if (dft.stock !== "") fd.append("pivot[stock]", String(dft.stock));
    fd.append("pivot[is_active]", dft.is_active ? "1" : "0");
    if (dft.available_from) fd.append("pivot[available_from]", dft.available_from);
    if (dft.available_to) fd.append("pivot[available_to]", dft.available_to);
    if (dft.notes) fd.append("pivot[notes]", dft.notes);

    (d.pivots || []).forEach(p => {
      const base = `pivots[${p.address_id}]`;
      if (p.stock !== "") fd.append(`${base}[stock]`, String(p.stock));
      fd.append(`${base}[is_active]`, p.is_active ? "1" : "0");
      if (p.available_from) fd.append(`${base}[available_from]`, p.available_from);
      if (p.available_to) fd.append(`${base}[available_to]`, p.available_to);
      if (p.notes) fd.append(`${base}[notes]`, p.notes);
    });
  }

  const rawId = fd.get("id");
  const id = rawId && `${rawId}`.trim() !== "" ? rawId : null;

  let url = "producto";
  if (id) {
    url = "producto/actualizar";
    fd.append("_method", "POST"); // si tu backend usa POST como override
  }

  // ⚠️ No fijes Content-Type; axios lo arma (con boundary)
  const res = await axiosClient.post(url, fd, {
    headers: {}, // asegura que NO se arrastre 'application/json' de un interceptor
    onUploadProgress: (e) => {
      if (!onProgress) return;
      const percent = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
      onProgress({ percent });
    },
    transformRequest: [(data) => data], // evita serialización accidental
  });

  return res.data;
}




//Categorias
export async function fetchCategorias() {
  const { data } = await axiosClient.get("categorias"); // baseURL ya está en axiosClient
  localStorage.setItem('categorias', JSON.stringify(data))
  return data; // array de categorías
}


//Todos Los Productos
export async function indexProductos() {
  try {
    const { data } = await axiosClient.get("/productos"); // <-- endpoint correcto
    // Acepta data, data.data o results
    const list =
      Array.isArray(data) ? data :
        Array.isArray(data?.data) ? data.data :
          Array.isArray(data?.results) ? data.results : [];

    if (!Array.isArray(list)) {
      throw new Error("Formato inesperado de la respuesta");
    }
    return list;
  } catch (err) {
    // Log detallado para depurar (status, payload del backend)
    console.error(
      "indexProductos()",
      err?.response?.status,
      err?.response?.data || err
    );
    // Reenvía un mensaje útil al componente
    throw new Error(
      err?.response?.data?.message ||
      err?.message ||
      "No se pudieron cargar los productos. Intenta de nuevo."
    );
  }
}

//Filtro de Productos por Categorias
export async function productsByCategory(categoryId) {
  if (categoryId == null) throw new Error("categoryId requerido");
  try {
    const { data } = await axiosClient.post("/categorias/productos", { id: Number(categoryId) });
    return Array.isArray(data) ? data :
      Array.isArray(data?.data) ? data.data : [];
  } catch (err) {
    console.error(
      "productsByCategory()",
      err?.response?.status,
      err?.response?.data || err
    );
    throw new Error(
      err?.response?.data?.message ||
      err?.message ||
      "No se pudieron cargar los productos de la categoría."
    );
  }
}



//Funcion para Mostar un Productos
export async function mostrarProducto(id) {
  try {
    const { data } = await axiosClient.post("/mostrarProducto", { id: Number(id) });
    return data;
  } catch (error) {
    console.error("Error al mostrar producto:", error?.response?.data || error.message);
    throw new Error("No se pudo obtener la información del producto.");
  }
}


//Productos de un vendedor
export async function productosPorVendedor(vendedorID) {
  const id = Number(vendedorID);
  if (!Number.isFinite(id)) {
    throw new Error("vendedorID inválido.");
  }

  try {
    const { data } = await axiosClient.post(
      "vendedorProduct",                 // <-- endpoint según tu doc: {{tltn}}vendedorProduct
      { vendedorID: id },
      { headers: { "Content-Type": "application/json" } }
    );
    // Aseguramos que siempre regrese un array
    return data;
  } catch (err) {
    const status = err?.response?.status;
    const msg = err?.response?.data || err?.message;

    if (status === 400) {
      // "ID de vendedor no proporcionado" o "Este no es un vendedor"
      throw new Error(
        typeof msg === "string" ? msg : "Solicitud inválida (400)."
      );
    }
    if (status === 404) {
      // "Vendedor no encontrado"
      throw new Error("Vendedor no encontrado (404).");
    }
    throw new Error("No se pudieron obtener los productos del vendedor.");
  }
}


// Informacion del Usuario /me
/** Lee el token desde localStorage */
function getAuthToken() {
  const direct = localStorage.getItem("token");
  if (direct) return direct;

  // por si lo guardaste dentro de algún objeto
  try {
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    if (auth?.token) return auth.token;
  } catch { }

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.token) return user.token;
  } catch { }

  return null;
}

/** 👤 /api/me - Usuario autenticado por Bearer */
export async function getMe({ cache = true } = {}) {
  const token = getAuthToken();
  if (!token) throw new Error("No hay token en localStorage.");

  try {
    const { data } = await axiosClient.get("me", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    // Puede venir como { user: {...} } o el objeto directo
    const me = data?.user ?? data;

    if (cache) {
      localStorage.setItem("user", JSON.stringify(me));
    }
    return me;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401) throw new Error("Sesión expirada o no autorizada (401).");
    throw new Error(err?.response?.data?.message || "No se pudo cargar el perfil /me.");
  }
}


//Actualizar Informacion del usuario
export async function actualizarUsuario(fields = {}, opts = {}) {
  const { endpoint = "user/actualizar", method = "post", syncCache = true } = opts;

  const token = getAuthToken();
  if (!token) throw new Error("No hay token en localStorage.");

  // normaliza alias
  const payload = { ...fields };
  if (payload.avatarFile && !payload.avatar) {
    payload.avatar = payload.avatarFile;
    delete payload.avatarFile;
  }

  const hasFile = payload.avatar instanceof File || payload.avatar instanceof Blob;

  try {
    let res;

    if (hasFile) {
      // --- MULTIPART ---
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (v instanceof File || v instanceof Blob) {
          fd.append(k, v, v.name || "avatar.jpg"); // nombre por si falta
        } else {
          fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
        }
      });

      res = await axiosClient.request({
        url: endpoint,
        method,
        data: fd,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          // ❗ NO fijes Content-Type: deja que axios ponga el boundary
          "Content-Type": undefined,
        },
        // Limpia Content-Type que algún interceptor haya puesto
        transformRequest: (data, headers) => {
          delete headers.common?.["Content-Type"];
          delete headers.post?.["Content-Type"];
          delete headers["Content-Type"];
          return data;
        },
      });
    } else {
      // --- JSON ---
      res = await axiosClient.request({
        url: endpoint,
        method,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
    }

    const user = res.data?.user ?? res.data;
    if (syncCache && user?.id) {
      const prev = JSON.parse(localStorage.getItem("user") || "null") || {};
      localStorage.setItem("user", JSON.stringify({ ...prev, ...user }));
    }
    return user;
  } catch (err) {
    const st = err?.response?.status;

    if (st === 422) {
      const payload = err?.response?.data;
      const errors = payload?.errors || payload;
      console.error("Validación 422:", errors);
      const first =
        errors?.avatar?.[0] ||
        errors?.name?.[0] ||
        (typeof errors === "string" ? errors : null);
      throw new Error(first || "Datos inválidos (422).");
    }
    if (st === 401) throw new Error("No autorizado (401).");
    if (st === 500) {
      const msg = err?.response?.data?.message || "Error interno del servidor";
      throw new Error(msg);
    }
    throw new Error(err?.response?.data?.message || "No se pudo actualizar el perfil.");
  }
}

/** Azúcar: actualizar solo el avatar */
export const actualizarSoloAvatar = (file, opts) =>
  actualizarUsuario({ avatar: file }, opts);

// --- NUEVO SERVICIO: subir solo avatar en multipart puro ---
export async function actualizarAvatar(
  file,
  { endpoint = "user/actualizar" } = {} // <-- usa la misma ruta que en Postman
) {
  if (!(file instanceof File || file instanceof Blob)) {
    throw new Error("Archivo inválido para avatar.");
  }

  // mismo helper que usas en actualizarUsuario
  const token = typeof getAuthToken === "function" ? getAuthToken() : null;
  if (!token) throw new Error("No hay token en localStorage.");

  // arma la URL con el baseURL que ya tenga tu axiosClient (si existe)
  const base = (axiosClient?.defaults?.baseURL || "").replace(/\/$/, "");
  const url = `${base}/${endpoint.replace(/^\//, "")}`;

  // ---- FORM DATA (multipart) ----
  const fd = new FormData();
  fd.append("avatar", file, file.name || "avatar.jpg"); // 👈 nombre EXACTO del campo

  // DEBUG opcional: verifica qué va en el FormData
  // console.log([...fd.entries()]);

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // ❗ NO pongas Content-Type aquí
      Accept: "application/json",
    },
    body: fd,
  });

  let data;
  try { data = await resp.json(); } catch { /* ignore */ }
  if (!resp.ok) {
    const msg =
      data?.message ||
      (data?.errors && (Object.values(data.errors)[0]?.[0] || JSON.stringify(data.errors))) ||
      `Error ${resp.status}`;
    throw new Error(msg);
  }

  // tu backend puede devolver { user, message } o el user directo
  return data?.user ?? data;
}