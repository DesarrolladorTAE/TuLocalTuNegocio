import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { adminKPI } from "../service/index";

const currency = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(Number(n || 0));
const num = (n) => new Intl.NumberFormat("es-MX").format(Number(n || 0));

const DashboardInner = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const [fechaInicio, setFechaInicio] = useState(firstDay.toISOString().slice(0, 10));
  const [fechaFin, setFechaFin] = useState(today.toISOString().slice(0, 10));

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

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
      {/* welcome balance */}
      <div className="welcome-balance mt-2 mb-40 flx-between gap-2">
        <div className="welcome-balance__left">
          <h4 className="welcome-balance__title mb-0">Welcome back!</h4>
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
              <div className="dashboard-widget">
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
                    <span className="dashboard-widget__text font-14">Total Products</span>
                  </div>
                  <img src="assets/images/icons/chart-icon.svg" alt="" />
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-sm-6">
              <div className="dashboard-widget">
                <img src="assets/images/shapes/widget-shape1.png" alt="" className="dashboard-widget__shape one" />
                <img src="assets/images/shapes/widget-shape2.png" alt="" className="dashboard-widget__shape two" />
                <span className="dashboard-widget__icon">
                  <img src="assets/images/icons/dashboard-widget-icon2.svg" alt="" />
                </span>
                <div className="dashboard-widget__content flx-between gap-1 align-items-end">
                  <div>
                    <h4 className="dashboard-widget__number mb-1 mt-3">
                      {currency(kpis.ventasTotales)}
                    </h4>
                    <span className="dashboard-widget__text font-14">Total Earnings</span>
                  </div>
                  <img src="assets/images/icons/chart-icon.svg" alt="" />
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-sm-6">
              <div className="dashboard-widget">
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
                    <span className="dashboard-widget__text font-14">Total Orders</span>
                  </div>
                  <img src="assets/images/icons/chart-icon.svg" alt="" />
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-sm-6">
              <div className="dashboard-widget">
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
                    <span className="dashboard-widget__text font-14">Active Clients</span>
                  </div>
                  <img src="assets/images/icons/chart-icon.svg" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales History + Right widget */}
        <div className="dashboard-body__item">
          <div className="row gy-4">
            <div className="col-xl-8">
              <div className="dashboard-card">
                <div className="dashboard-card__header flx-between gap-2">
                  <h6 className="dashboard-card__title mb-0">Sales History</h6>
                  <div className="select-has-icon d-inline-block">
                    <select className="select common-input select-sm" defaultValue={1}>
                      <option value={1}>Daily</option>
                    </select>
                  </div>
                </div>
                <div className="dashboard-card__chart">
                  <Chart
                    options={chartData.options}
                    series={chartData.series}
                    type="area"
                    height={"500"}
                    width={"100%"}
                  />
                </div>
              </div>
            </div>

            <div className="col-xl-4">
              <div className="dashboard-card">
                <div className="dashboard-card__header">
                  <h6 className="dashboard-card__title mb-0">Ventas por Categoría</h6>
                </div>
                <ul className="country-list">
                  {salesByCategory.slice(0, 10).map((c) => (
                    <li key={c.category_id} className="country-list__item flx-between gap-2">
                      <div className="country-list__content flx-align gap-2">
                        <span className="country-list__flag">
                          <img src="assets/images/thumbs/flag1.png" alt="" />
                        </span>
                        <span className="country-list__name">{c.category || "Sin categoría"}</span>
                      </div>
                      <span className="country-list__amount">{currency(c.amount)}</span>
                    </li>
                  ))}
                  {!salesByCategory.length && (
                    <li className="country-list__item flx-between gap-2">
                      <span className="text-muted">Sin datos en el rango.</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla diaria (Date / Item Sales / Earning) */}
        <div className="dashboard-body__item">
          <div className="table-responsive">
            <table className="table style-two">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item Sales</th>
                  <th>Earning</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.date}</td>
                    <td>{num(r.orders)}</td>
                    <td>{currency(r.sales)}</td>
                  </tr>
                ))}
                {!tableRows.length && (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
                      {loading ? "Cargando..." : "Sin datos en el rango seleccionado"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardInner;
