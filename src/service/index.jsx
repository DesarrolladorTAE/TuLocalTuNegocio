import axiosClient from "../axiosClient";

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

//Registrarse Con Google
export function registerWithGoogle() {
  window.location.href = "https://tulocaltunego.com/api/auth/google/redirect";
}

const API_URL = "https://tulocaltunego.com/api";
const FRONT_URL = window.location.origin;

// Google: redirección a proveedor
export function loginWithGoogle() {
  const redirect = encodeURIComponent(`${FRONT_URL}/oauth/callback`);
  window.location.assign(
    `${API_URL}/auth/google/redirect?redirect=${redirect}`
  );
}

// Google: manejar callback ?token=...&user=base64(json)
export function handleOAuthCallbackFromURL() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const userB64 = params.get("user");
  if (!token || !userB64) return false;
  const user = JSON.parse(atob(userB64));
  saveAuth({ token, user }, true);
  return true;
}

export async function logout() {
  try {
    await axiosClient.post("logout");
  } catch {}
  clearAuth();
}

// Suscribirse a cambios (útil para navbar)
export function onAuthChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}


//Crear productos por usuario.
export async function createProduct(data, onProgress) {
  const fd = new FormData();

  // helper para no mandar null/undefined/"" en form-data
  const appendIf = (k, v) => {
    if (v !== undefined && v !== null && `${v}`.trim() !== "") fd.append(k, v);
  };

  appendIf("name", data.name);
  appendIf("description", data.description);
  appendIf("price", data.price);
  appendIf("stock", data.stock);
  appendIf("category_id", data.category_id);

  // imágenes (hasta 10)
  if (data.images) {
    const arr = Array.from(data.images); // soporta File[] o FileList
    arr.slice(0, 10).forEach((file) => fd.append("images[]", file));
  }

  // Nota: content-type multipart/form-data lo pone el navegador automáticamente
  const res = await axiosClient.post("producto", fd, {
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