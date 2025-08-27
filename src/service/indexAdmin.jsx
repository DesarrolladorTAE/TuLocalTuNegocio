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
          promedio_articulos_orden: Number(data?.avg_items_per_order || 0),
          promedio_ordenes_pagadas: Number(data?.avg_ticket_paid || 0),
        },
        table: funnel.map(f => ({
          status: f.status,
          cant: Number(f.qty || 0),
          monto: Number(f.amount || 0),
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
          donaciones_sum: Number(data?.totals?.donations_sum || 0) / 100,
          donaciones_count: Number(data?.totals?.donations_count || 0),
          promociones_donacion: Number(data?.totals?.avg_donation || 0) / 100,
          // attach_rate: Number(data?.totals?.donation_attach_rate_pct || 0),
        },
        table: rows.map(r => ({ fecha: r.x, donaciones: r.count, monto: r.amount })),
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
          subscripciones: Number(data?.signups || 0),
          active_clients: Number(data?.active_clients || 0),
          repeat_buyers: Number(data?.repeat_buyers || 0),
          repeat_rate_pct: Number(data?.repeat_rate_pct || 0),
        },
        table: rows.map(r => ({ fecha: r.x, subscripciones: r.users })),
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

export async function actualizarAdmin(data) {
  const token = localStorage.getItem("token"); // Ajusta según dónde guardes el token

  try {
    const res = await axiosClient.post("user/actualizar", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    // Re-lanza el error para manejarlo en el componente
    throw error?.response?.data || error;
  }
}

export async function mostrarUsuario(role, admin) {
  try {
    const res = await axiosClient.post("mostrar/usuarios", { role, admin });
    return res.data;
  } catch (error) {
    // Re-lanza el error para manejarlo en el componente
    throw error?.response?.data || error;
  }
}

export async function actualizarProdcutoAdmin(producto) {
  const token = localStorage.getItem("token"); // Ajusta según dónde guardes el token
  try {
    const res = await axiosClient.post("producto/actualizar", producto, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    // Re-lanza el error para manejarlo en el componente
    throw error?.response?.data || error;
  }
}

export async function elimarProdAdmin(data) {
  const token = localStorage.getItem("token"); // Ajusta según dónde guardes el token
  try {
    const res = await axiosClient.post("producto/eliminar", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    // Re-lanza el error para manejarlo en el componente
    throw error?.response?.data || error;
  }
}

export async function refreshProdAdmin(vendedorID) {
  const token = localStorage.getItem("token"); // Ajusta según dónde guardes el token
  try {
    const res = await axiosClient.post("vendedorProduct", { vendedorID }, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    // Re-lanza el error para manejarlo en el componente
    throw error?.response?.data || error;
  }
}

export async function subirBanner(data) {
  const token = localStorage.getItem("token"); // Ajusta según dónde guardes el token
  try {
    const res = await axiosClient.post("subir/banner", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    // Re-lanza el error para manejarlo en el componente
    throw error?.response?.data || error;
  }
}

export async function crearCategoria(formData) {
  const res = await axiosClient.post("categorias", formData, {
    headers: {
      // dejar que el browser ponga el boundary:
      "Content-Type": "multipart/form-data",
      // Authorization ya lo agrega el interceptor (si lo tienes allí)
    },
  });
  return res.data;
}

export async function actualizarCategoria(formData) {
  const res = await axiosClient.post("categorias/actualizar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function eliminarCategoria(body) {
  const token = localStorage.getItem("token");
  // Enviar JSON simple { id }
  const res = await axiosClient.post("categorias/eliminar", body, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
}