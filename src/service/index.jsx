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
    const res = await axiosClient.post("logout", null, {
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


//Todos Los Productos
export async function indexProductos() {
  try {
    const { data } = await axiosClient.get("productos"); // => {{tltn}}/api/productos si tu baseURL ya es {{tltn}}/api
    return Array.isArray(data) ? data : [];
  } catch (err) {
    // Log opcional para diagnóstico
    console.error("Error al cargar productos:", err?.response?.data || err.message);
    // Propaga un error legible para el front
    throw new Error("No se pudieron cargar los productos. Intenta de nuevo.");
  }
}

//Filtro de Productos por Categorias
export async function productsByCategory(categoryId) {
  if (!categoryId && categoryId !== 0) throw new Error("categoryId requerido");
  const { data } = await axiosClient.post("/categorias/productos", { id: Number(categoryId) });
  return Array.isArray(data) ? data : [];
}

// consultas admin
export async function adminKPI(fechaInicio, fechaFin) {
  // Usa el token del authState, como en el resto del módulo
  const token = getToken();

  // Normaliza fechas a YYYY-MM-DD si vienen como Date
  const toISO = (d) => {
    if (!d) return null;
    if (typeof d === "string") return d;
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const from = toISO(fechaInicio);
  const to = toISO(fechaFin);

  // Helper para GET con query
  const q = (params) => new URLSearchParams(params).toString();

  // Endpoints (todos GET)
  const endpoints = {
    overview: `admin/overview?${q({ from, to })}`,
    ordersSummary: `admin/orders/summary?${q({ from, to })}`,
    productsSummary: `admin/products/summary?${q({ from, to })}`,
    usersSummary: `admin/users/summary?${q({ from, to })}`,
    donationsSummary: `admin/donations/summary?${q({ from, to })}`,
    categoriesSummary: `admin/categories/summary?${q({ from, to })}`,
    vendorsBoard: `admin/vendors/leaderboard?${q({ from, to })}`,
    clientsBoard: `admin/clients/leaderboard?${q({ from, to })}`,
    inventoryAlerts: `admin/inventory/alerts?threshold=5`,
    systemHealth: `admin/system/health`,
  };

  try {
    // Usa axiosClient para todas las llamadas
    const [
      overviewRes,
      ordersRes,
      productsRes,
      usersRes,
      donationsRes,
      categoriesRes,
      vendorsRes,
      clientsRes,
      inventoryRes,
      healthRes
    ] = await Promise.all(
      Object.values(endpoints).map((url) =>
        axiosClient.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).then(r => r.data)
      )
    );

    // Tarjetas (hero KPIs)
    const kpis = {
      productosActivos: productsRes?.catalog?.active ?? 0,
      ventasTotales: (ordersRes?.totals?.sales_paid ?? overviewRes?.orders?.sales_total ?? 0),
      ordenes: ordersRes?.totals?.orders_paid ?? overviewRes?.orders?.count ?? 0,
      clientesActivos: usersRes?.active_clients ?? 0,
      repeatRate: usersRes?.repeat_rate_pct ?? 0,
      donaciones: (donationsRes?.totals?.amount ?? overviewRes?.donations?.amount_total ?? 0) / 100,
    };

    // Gráfica historial de ventas (línea/área)
    const salesHistory = (ordersRes?.series?.by_day || []).map(d => ({
      date: d.day,
      orders: Number(d.orders || 0),
      sales: Number(d.sales || 0),
    }));

    // Pie: ventas por categoría
    const salesByCategory = (categoriesRes?.categories || []).map(c => ({
      category_id: c.category_id,
      category: c.category,
      amount: Number(c.amount || 0),
      units: Number(c.units || 0),
    }));

    // Tablas
    const topVendors = (vendorsRes?.leaderboard || []).map(v => ({
      vendedor_id: v.vendedor_id,
      vendedor: v.vendedor?.name || `#${v.vendedor_id}`,
      email: v.vendedor?.email || "",
      orders: Number(v.orders || 0),
      sales: Number(v.sales || 0),
      avg_ticket: Number(
        (vendorsRes?.avg_ticket || []).find(a => a.vendedor_id === v.vendedor_id)?.avg_ticket || 0
      ),
    }));

    const topClients = (clientsRes?.top_clients || []).map(c => ({
      cliente_id: c.cliente_id,
      cliente: c.cliente?.name || `#${c.cliente_id}`,
      email: c.cliente?.email || "",
      orders: Number(c.orders || 0),
      spent: Number(c.spent || 0),
    }));

    const lowStock = (inventoryRes?.low_stock_by_location || []).map(i => ({
      product_id: i.product_id,
      product: i.product,
      address_id: i.address_id,
      city: i.city,
      state: i.state,
      stock: Number(i.stock || 0),
      is_active: !!i.is_active,
    }));

    // Extra útil para badges/estados
    const system = {
      apiStatus: healthRes?.status?.api ?? "unknown",
      time: healthRes?.app?.time ?? null,
    };

    // Regresa todo listo para pintar “al instante”
    return {
      ok: true,
      range: { from, to },
      kpis,
      charts: {
        salesHistory,
        salesByCategory,
      },
      tables: {
        topVendors,
        topClients,
        lowStock,
      },
      raw: {
        overviewRes,
        ordersRes,
        productsRes,
        usersRes,
        donationsRes,
        categoriesRes,
        vendorsRes,
        clientsRes,
        inventoryRes,
        healthRes,
      },
      system,
    };
  } catch (error) {
    console.error("adminKPI error:", error);
    return { ok: false, error: error?.message || "Error al cargar KPIs" };
  }
}


//Funcion para Mostar un Productos
export async function mostrarProducto(id) {
  try {
    const { data } = await axiosClient.post("/producto", { id: Number(id) });
    return data;
  } catch (error) {
    console.error("Error al mostrar producto:", error?.response?.data || error.message);
    throw new Error("No se pudo obtener la información del producto.");
  }
}

// service/index.js
export async function adminDetail(topic, fechaInicio, fechaFin) {
  const token = getToken();

  const toISO = (d) => {
    if (!d) return null;
    if (typeof d === "string") return d;
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const from = toISO(fechaInicio);
  const to = toISO(fechaFin);
  const q = (params) => new URLSearchParams(params).toString();

  // Mapa de tópico -> endpoint
  const endpointByTopic = {
    ventas: `admin/orders/summary?${q({ from, to })}`,     // series by_day, totals
    ordenes: `admin/orders/funnel?${q({ from, to })}`,     // funnel, avg ticket, avg items
    donaciones: `admin/donations/insights?${q({ from, to })}`, // serie diaria, ratios
    usuarios: `admin/users/summary?${q({ from, to })}`,    // signups_by_day, activos, repeat
    productos: `admin/products/summary?${q({ from, to })}`,// activos/inactivos (si lo tienes)
    inventario: `admin/inventory/alerts?threshold=5`,      // low stock
    categorias: `admin/categories/summary?${q({ from, to })}`, // ventas por categoría
    vendedores: `admin/vendors/leaderboard?${q({ from, to })}`, // ranking vendedores
    clientes: `admin/clients/leaderboard?${q({ from, to })}`,   // ranking clientes
  };

  const url = endpointByTopic[topic];
  if (!url) throw new Error(`Tópico no soportado: ${topic}`);

  const res = await axiosClient.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = res.data || {};

  // Normaliza salida: { title, series:[], table:[], kpis:{} }
  switch (topic) {
    case "ventas": {
      const rows = (data?.series?.by_day || []).map(d => ({
        x: d.day,
        orders: Number(d.orders || 0),
        sales: Number(d.sales || 0),
      }));
      return {
        title: "Historial de Ventas",
        series: [
          { name: "Ventas", data: rows.map(r => ({ x: r.x, y: r.sales })) },
          { name: "Órdenes", data: rows.map(r => ({ x: r.x, y: r.orders })) },
        ],
        kpis: {
          orders_paid: Number(data?.totals?.orders_paid || 0),
          sales_paid: Number(data?.totals?.sales_paid || 0),
          avg_ticket_paid: Number(data?.totals?.avg_ticket_paid || 0),
        },
        table: rows.map(r => ({ date: r.x, orders: r.orders, sales: r.sales })),
      };
    }
    case "ordenes": {
      const funnel = data?.funnel || [];
      return {
        title: "Embudo de Órdenes",
        series: [], // aquí no hay serie temporal en este endpoint
        kpis: {
          avg_items_per_order: Number(data?.avg_items_per_order || 0),
          avg_ticket_paid: Number(data?.avg_ticket_paid || 0),
        },
        table: funnel.map(f => ({
          status: f.status,
          qty: Number(f.qty || 0),
          amount: Number(f.amount || 0),
        })),
      };
    }
    case "donaciones": {
      const rows = (data?.series?.by_day || []).map(d => ({
      x: d.day,
      count: Number(d.count || 0),
      amount: Number(d.amount || 0) / 100, // convertir a divisa real
      }));
      return {
      title: "Donaciones",
      series: [
        { name: "Monto Donado", data: rows.map(r => ({ x: r.x, y: r.amount })) },
        { name: "Donaciones (#)", data: rows.map(r => ({ x: r.x, y: r.count })) },
      ],
      kpis: {
        donations_sum: Number(data?.totals?.donations_sum || 0) / 100,
        donations_count: Number(data?.totals?.donations_count || 0),
        avg_donation: Number(data?.totals?.avg_donation || 0) / 100,
        attach_rate: Number(data?.totals?.donation_attach_rate_pct || 0),
      },
      table: rows.map(r => ({ date: r.x, donations: r.count, amount: r.amount })),
      };
    }
    case "usuarios": {
      const rows = (data?.series?.signups_by_day || []).map(d => ({
        x: d.day,
        users: Number(d.users || 0),
      }));
      return {
        title: "Usuarios / Clientes",
        series: [{ name: "Altas por día", data: rows.map(r => ({ x: r.x, y: r.users })) }],
        kpis: {
          signups: Number(data?.signups || 0),
          active_clients: Number(data?.active_clients || 0),
          repeat_buyers: Number(data?.repeat_buyers || 0),
          repeat_rate_pct: Number(data?.repeat_rate_pct || 0),
        },
        table: rows.map(r => ({ date: r.x, signups: r.users })),
      };
    }
    case "inventario": {
      const low = (data?.low_stock_by_location || []).map(i => ({
        product_id: i.product_id,
        product: i.product,
        address_id: i.address_id,
        city: i.city,
        state: i.state,
        stock: Number(i.stock || 0),
        is_active: !!i.is_active,
      }));
      return {
        title: "Alertas de Inventario",
        series: [],
        kpis: { threshold: Number(data?.threshold || 5), inactive_products: (data?.inactive_products || []).length },
        table: low,
      };
    }
    case "categorias": {
      const cats = (data?.categories || []).map(c => ({
        category_id: c.category_id,
        category: c.category,
        units: Number(c.units || 0),
        amount: Number(c.amount || 0),
      }));
      return {
        title: "Ventas por Categoría",
        series: [], // lo mostraremos como tabla/lista
        kpis: {},
        table: cats,
      };
    }
    case "vendedores": {
      const rows = (data?.leaderboard || []).map(r => ({
        vendedor_id: r.vendedor_id,
        vendedor: r?.vendedor?.name || `#${r.vendedor_id}`,
        email: r?.vendedor?.email || "",
        orders: Number(r.orders || 0),
        sales: Number(r.sales || 0),
      }));
      const avgTicket = data?.avg_ticket || [];
      return {
        title: "Ranking de Vendedores",
        series: [],
        kpis: {},
        table: rows.map(r => ({
          ...r,
          avg_ticket: Number(avgTicket.find(a => a.vendedor_id === r.vendedor_id)?.avg_ticket || 0),
        })),
      };
    }
    case "clientes": {
      const rows = (data?.top_clients || []).map(r => ({
        cliente_id: r.cliente_id,
        cliente: r?.cliente?.name || `#${r.cliente_id}`,
        email: r?.cliente?.email || "",
        orders: Number(r.orders || 0),
        spent: Number(r.spent || 0),
      }));
      return {
        title: "Clientes Top",
        series: [],
        kpis: {},
        table: rows,
      };
    }
    case "productos": {
      // Suponiendo que /admin/products/summary te entrega catalog.active/inactive/top...
      return {
        title: "Productos",
        series: [],
        kpis: {
          activos: Number(data?.catalog?.active || 0),
          inactivos: Number(data?.catalog?.inactive || 0),
        },
        table: (data?.top || []),
      };
    }
    default:
      return { title: "Detalle", series: [], kpis: {}, table: [] };
  }
}
