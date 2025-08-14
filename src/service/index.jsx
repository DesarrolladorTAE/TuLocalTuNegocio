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
export function register(userData) {
  try {
    return axiosClient.post("registrar", userData);
  } catch (err) {
    throw err;
  }
}

// Redirige al backend para autenticación con Google
export function registerWithGoogle() {
  window.location.href = `${API_URL}/auth/google/redirect`;
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
export function handleOAuthCallbackFromURL() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const userB64 = params.get("user");
  if (!token || !userB64) return false;

  try {
    // base64 urlsafe → estándar
    const b64 = userB64.replace(/-/g, "+").replace(/_/g, "/").padEnd(
      Math.ceil(userB64.length / 4) * 4, "="
    );

    // Decodifica (compat UTF-8)
    const json = decodeURIComponent(escape(window.atob(b64)));
    const user = JSON.parse(json);

    // Guarda token + user (persistente)
    saveAuth({ token, user }, true);
    return true;
  } catch (e) {
    console.error("Error al procesar callback de Google:", e);
    return false;
  }
}


export async function logout() {
  try {
    await axiosClient.post("logout", null, {
      headers: {
        Authorization: `Bearer ${authState.token}`,
      },
    });
  } catch (err) {
    console.error("Logout error:", err);
    throw err
  }
  clearAuth();
}

// Suscribirse a cambios (útil para navbar)
export function onAuthChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}


// Crear productos por usuario.
export async function createProduct(payload, onProgress) {
  // Si ya viene como FormData desde el componente, lo usamos tal cual.
  let fd;
  if (payload instanceof FormData) {
    fd = payload;
  } else {
    // Si viene un objeto plano, construimos el FormData aquí.
    const data = payload || {};
    fd = new FormData();

    // --- helper: append si trae valor útil ---
    const appendIf = (k, v) => {
      if (v === undefined || v === null) return;
      const str = typeof v === "string" ? v.trim() : v;
      if (str === "" || str === null || str === undefined) return;
      fd.append(k, v);
    };

    // --- campos base ---
    appendIf("name", data.name);
    appendIf("description", data.description);
    appendIf("price", data.price);
    appendIf("stock", data.stock);
    appendIf("category_id", data.category_id);

    // --- imágenes (hasta 10) ---
    if (data.images) {
      const arr = Array.from(data.images); // soporta FileList o File[]
      arr.slice(0, 10).forEach((file) => fd.append("images[]", file));
    }

    // --- direcciones por ID ---
    appendIf("address_id", data.address_id);
    if (Array.isArray(data.address_ids)) {
      data.address_ids
        .filter((v) => v !== null && v !== undefined && String(v).trim() !== "")
        .forEach((id) => fd.append("address_ids[]", id));
    }

    // --- dirección única (address:{...}) ---
    if (data.address && typeof data.address === "object") {
      const a = data.address;
      const keys = [
        "recipient",
        "phone",
        "street",
        "ext_no",
        "int_no",
        "neighborhood",
        "city",
        "state",
        "zip",
        "references",
      ];
      keys.forEach((k) => appendIf(`address[${k}]`, a[k]));
    }

    // --- varias direcciones nuevas (addresses:[{...}]) ---
    if (Array.isArray(data.addresses)) {
      data.addresses.forEach((addr, idx) => {
        if (!addr || typeof addr !== "object") return;
        Object.entries(addr).forEach(([k, v]) => {
          appendIf(`addresses[${idx}][${k}]`, v);
        });
      });
    }

    // --- pivot defaults ---
    if (data.pivot && typeof data.pivot === "object") {
      const p = data.pivot;
      // stock (entero), is_active (booleano), fechas y notas
      if (p.stock !== "" && p.stock !== undefined && p.stock !== null) {
        appendIf("pivot[stock]", p.stock);
      }
      // normalizar booleanos a 1/0 para el backend
      if (typeof p.is_active === "boolean") {
        fd.append("pivot[is_active]", p.is_active ? "1" : "0");
      } else if (p.is_active !== undefined) {
        appendIf("pivot[is_active]", p.is_active);
      }
      appendIf("pivot[available_from]", p.available_from);
      appendIf("pivot[available_to]", p.available_to);
      appendIf("pivot[notes]", p.notes);
    }
  }

  const res = await axiosClient.post("producto", fd, {
    headers: {
      // El navegador pone el boundary automáticamente al mandar FormData,
      // pero este header explícito ayuda a algunos servers/proxies.
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (e) => {
      if (!onProgress) return;
      const percent = e.total ? Math.round((e.loaded * 100) / e.total) : undefined;
      onProgress({ loaded: e.loaded, total: e.total, percent });
    },
  });

  return res.data; // { message, product, ... }
}

//Categorias
export async function fetchCategorias() {
  const { data } = await axiosClient.get("categorias"); // baseURL ya está en axiosClient
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