import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { adminKPI, adminDetail } from "../service/indexAdmin";

const currency = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(Number(n || 0));
const num = (n) => new Intl.NumberFormat("es-MX").format(Number(n || 0));

const DashboardInner = () => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const [selectedTopic, setSelectedTopic] = useState(null); // "ventas" | "ordenes" | "donaciones" | "usuarios" | "inventario" | ...
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState(null);
  const [detail, setDetail] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(firstDay.toISOString().slice(0, 10));
  const [fechaFin, setFechaFin] = useState(today.toISOString().slice(0, 10));

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);


  const selectTopic = (topic) => {
    setSelectedTopic(topic);
  };

  useEffect(() => {
    let cancel = false;
    if (!selectedTopic) return;
    (async () => {
      setDetailLoading(true);
      setDetailErr(null);
      try {
        const d = await adminDetail(selectedTopic, fechaInicio, fechaFin);
        if (!cancel) setDetail(d);
      } catch (e) {
        if (!cancel) setDetailErr(e?.message || "Error cargando detalle");
      } finally {
        if (!cancel) setDetailLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [selectedTopic, fechaInicio, fechaFin]);


  // KPIs
  const [kpis, setKpis] = useState({
    productosActivos: 0,
    ventasTotales: 0,
    ordenes: 0,
    clientesActivos: 0,
    repeatRate: 0,
    donaciones: 0,
  });

  // Gráficas
  const [salesHistory, setSalesHistory] = useState([]);       // [{date, orders, sales}]
  const [salesByCategory, setSalesByCategory] = useState([]); // [{category, amount, units}]

  // Tablas
  const [topVendors, setTopVendors] = useState([]); // no se muestra aún en este layout
  const [topClients, setTopClients] = useState([]); // no se muestra aún en este layout

  // Llamada inicial
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await adminKPI(fechaInicio, fechaFin);
        if (cancel || !data?.ok) return;

        setKpis(data.kpis || {});
        setSalesHistory(data.charts?.salesHistory || []);
        setSalesByCategory(data.charts?.salesByCategory || []);
        setTopVendors(data.tables?.topVendors || []);
        setTopClients(data.tables?.topClients || []);
      } catch (e) {
        if (!cancel) setErr(e?.message || "Error cargando dashboard");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [fechaInicio, fechaFin]);

  // Series para Apex desde salesHistory
  const chartData = useMemo(() => {
    const categories = salesHistory.map((d) => d.date);
    const series = [
      { name: "Ventas", data: salesHistory.map((d) => Number(d.sales || 0)) },
      { name: "Órdenes", data: salesHistory.map((d) => Number(d.orders || 0)) },
    ];
    const options = {
      chart: { height: 350, type: "area", toolbar: { show: false } },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      xaxis: { type: "datetime", categories },
      yaxis: [
        { title: { text: "Ventas" } },
        { opposite: true, title: { text: "Órdenes" } },
      ],
      tooltip: {
        shared: true,
        x: { format: "dd/MM/yy" },
        y: {
          formatter: (val, { seriesIndex }) =>
            seriesIndex === 0 ? currency(val) : num(val),
        },
      },
    };
    return { options, series };
  }, [salesHistory]);

  // Tabla diaria desde salesHistory
  const tableRows = useMemo(() => {
    return salesHistory.map((d) => ({
      date: new Date(d.date).toLocaleDateString("es-MX", { weekday: "long", day: "2-digit", month: "short" }),
      orders: d.orders,
      sales: d.sales,
    }));
  }, [salesHistory]);

  return (
    <div className="dashboard-body__content">
      <div className="welcome-balance mt-2 mb-40 flx-between gap-2">
        <div className="welcome-balance__left">
          <div className="d-flex gap-2 mt-2">
            <input
              type="date"
              className="common-input"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
            <input
              type="date"
              className="common-input"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
        </div>
        <div className="welcome-balance__right flx-align gap-2">
          <span className="welcome-balance__text fw-500 text-heading">Ventas en rango:</span>
          <h4 className="welcome-balance__balance mb-0">
            {currency(kpis.ventasTotales)}
          </h4>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="dashboard-body__item-wrapper">
        {/* KPI Cards */}
        <div className="dashboard-body__item">
          <div className="row gy-4">
            <div className="col-xl-3 col-sm-6">
              <div
                className="dashboard-widget cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => selectTopic("productos")}
                onKeyDown={(e) => e.key === "Enter" && selectTopic("productos")}
              >
                <img src="assets/images/shapes/widget-shape1.png" alt="" className="dashboard-widget__shape one" />
                <img src="assets/images/shapes/widget-shape2.png" alt="" className="dashboard-widget__shape two" />
                <span className="dashboard-widget__icon">
                  <img src="assets/images/icons/dashboard-widget-icon1.svg" alt="" />
                </span>
                <div className="dashboard-widget__content flx-between gap-1 align-items-end">
                  <div>
                    <h4 className="dashboard-widget__number mb-1 mt-3">
                      {num(kpis.productosActivos)}
                    </h4>
                    <span className="dashboard-widget__text font-14">Total Productos</span>
                  </div>
                  <img src="assets/images/icons/chart-icon.svg" alt="" />
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-sm-6">
              <div
                className="dashboard-widget cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => selectTopic("donaciones")}
                onKeyDown={(e) => e.key === "Enter" && selectTopic("donaciones")}
              >
                <img src="assets/images/shapes/widget-shape1.png" alt="" className="dashboard-widget__shape one" />
                <img src="assets/images/shapes/widget-shape2.png" alt="" className="dashboard-widget__shape two" />
                <span className="dashboard-widget__icon">
                  <img src="assets/images/icons/dashboard-widget-icon2.svg" alt="" />
                </span>
                <div className="dashboard-widget__content flx-between gap-1 align-items-end">
                  <div>
                    <h4 className="dashboard-widget__number mb-1 mt-3">
                      {currency(kpis.donaciones)}
                    </h4>
                    <span className="dashboard-widget__text font-14">Total Donaciones</span>
                  </div>
                  <img src="assets/images/icons/chart-icon.svg" alt="" />
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-sm-6">
              <div
                className="dashboard-widget cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => selectTopic("ordenes")} // o "ventas" si prefieres el histórico
                onKeyDown={(e) => e.key === "Enter" && selectTopic("ordenes")}
              >
                <img src="assets/images/shapes/widget-shape1.png" alt="" className="dashboard-widget__shape one" />
                <img src="assets/images/shapes/widget-shape2.png" alt="" className="dashboard-widget__shape two" />
                <span className="dashboard-widget__icon">
                  <img src="assets/images/icons/dashboard-widget-icon3.svg" alt="" />
                </span>
                <div className="dashboard-widget__content flx-between gap-1 align-items-end">
                  <div>
                    <h4 className="dashboard-widget__number mb-1 mt-3">
                      {num(kpis.ordenes)}
                    </h4>
                    <span className="dashboard-widget__text font-14">Total Ordenes</span>
                  </div>
                  <img src="assets/images/icons/chart-icon.svg" alt="" />
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-sm-6">
              <div
                className="dashboard-widget cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => selectTopic("usuarios")}
                onKeyDown={(e) => e.key === "Enter" && selectTopic("usuarios")}
              >
                <img src="assets/images/shapes/widget-shape1.png" alt="" className="dashboard-widget__shape one" />
                <img src="assets/images/shapes/widget-shape2.png" alt="" className="dashboard-widget__shape two" />
                <span className="dashboard-widget__icon">
                  <img src="assets/images/icons/dashboard-widget-icon4.svg" alt="" />
                </span>
                <div className="dashboard-widget__content flx-between gap-1 align-items-end">
                  <div>
                    <h4 className="dashboard-widget__number mb-1 mt-3">
                      {num(kpis.clientesActivos)}
                    </h4>
                    <span className="dashboard-widget__text font-14">Clientes Activos</span>
                  </div>
                  <img src="assets/images/icons/chart-icon.svg" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales History + Right widget */}
        {/* Panel de detalle (drill-down) */}
        {selectedTopic && (
          <div className="dashboard-body__item">
            <div className="dashboard-card">
              <div className="dashboard-card__header flx-between gap-2">
                <h6 className="dashboard-card__title mb-0">
                  {detail?.title || "Detalle"}
                </h6>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setSelectedTopic(null)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>

              {detailLoading && (
                <div className="p-3">Cargando detalle...</div>
              )}
              {detailErr && (
                <div className="alert alert-danger m-3">{detailErr}</div>
              )}

              {!detailLoading && !detailErr && detail && (
                <div className="p-3">
                  {/* KPIs del panel (si hay) */}
                  {detail.kpis && (
                    <div className="row gy-3 mb-3">
                      {Object.entries(detail.kpis).map(([k, v]) => (
                        <div className="col-6 col-md-3" key={k}>
                          <div className="p-3 rounded border">
                            <div className="text-muted font-12">{k.replaceAll("_", " ").toUpperCase()}</div>
                            <div className="fw-600">
                              {typeof v === "number"
                                ? (k.includes("amount") || k.includes("sales") || k.includes("ticket") || k.includes("donations") || k.includes("sum"))
                                  ? currency(v)
                                  : k.includes("pct") || k.includes("rate")
                                    ? `${v}%`
                                    : num(v)
                                : String(v)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Gráfica si hay series con puntos (x,y) */}
                  {Array.isArray(detail.series) && detail.series.length > 0 && detail.series[0].data?.length > 0 && (
                    <div className="mb-4">
                      <Chart
                        options={{
                          chart: { type: "area", toolbar: { show: false } },
                          dataLabels: { enabled: false },
                          stroke: { curve: "smooth" },
                          xaxis: {
                            type: "datetime",
                            categories: detail.series[0].data.map(p => p.x),
                          },
                          tooltip: {
                            shared: true,
                            x: { format: "dd/MM/yy" },
                          },
                        }}
                        series={detail.series.map(s => ({
                          name: s.name,
                          data: s.data.map(p => p.y),
                        }))}
                        type="area"
                        height={380}
                        width="100%"
                      />
                    </div>
                  )}

                  {/* Tabla de detalle */}
                  <div className="table-responsive">
                    <table className="table style-two">
                      <thead>
                        <tr>
                          {detail.table && detail.table[0]
                            ? Object.keys(detail.table[0]).map((h) => <th key={h}>{h.toUpperCase()}</th>)
                            : <th>Sin datos</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {detail.table && detail.table.length > 0 ? (
                          detail.table.map((row, i) => (
                            <tr key={i}>
                              {Object.entries(row).map(([k, v]) => (
                                <td key={k}>
                                  {typeof v === "number"
                                    ? (k.includes("amount") || k.includes("sales") || k.includes("spent") || k.includes("ticket"))
                                      ? currency(v)
                                      : num(v)
                                    : String(v ?? "")}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="text-muted">Sin datos</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Acciones rápidas según tópico (opcional) */}
                  <div className="mt-3 d-flex gap-2">
                    {selectedTopic === "inventario" && (
                      <button className="btn btn-sm btn-primary" onClick={() => setSelectedTopic("productos")}>
                        Ver productos
                      </button>
                    )}
                    {selectedTopic === "ventas" && (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedTopic("ordenes")}>
                        Ver embudo de órdenes
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardInner;
