// frontend/src/pages/admin/DashboardPage.jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { fetchDashboard } from "../../features/admin/adminSlice";
import StatCard from "../../components/admin/StatCard";
import styles from "./DashboardPage.module.css";

const STATUS_COLORS = { processing: "#CCCCCC", shipped: "#666666", delivered: "#111111" };
const money = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { dashboard, status } = useSelector((s) => s.admin);

  useEffect(() => { dispatch(fetchDashboard({ days: 30, topLimit: 5 })); }, [dispatch]);

  if (status === "loading" || !dashboard) {
    return <div className={styles.loading}>Loading dashboard…</div>;
  }

  const { stats, salesChart, orderStatus, topProducts } = dashboard;
  const deliveryData = orderStatus.delivery.map((d) => ({ name: d.status, value: d.count }));

  return (
    <div>
      <h1 className={styles.h1}>Dashboard</h1>

      <div className={styles.cards}>
        <StatCard label="Total Revenue" value={money(stats.totalRevenue)} icon="💰" accent="primary" />
        <StatCard label="Paid Orders" value={stats.totalOrders} icon="📦" accent="blue" />
        <StatCard label="Products" value={stats.totalProducts} icon="🏷️" accent="amber" />
        <StatCard label="Customers" value={stats.totalCustomers} icon="👥" accent="green" />
      </div>

      <div className={styles.grid}>
        <div className={styles.panel} style={{ gridColumn: "1 / span 2" }}>
          <h3 className={styles.panelTitle}>Revenue — last 30 days</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesChart} margin={{ left: -10, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111111" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#111111" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={(d) => d.slice(5)} minTickGap={24} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <Tooltip formatter={(v) => money(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#111111" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Delivery status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={deliveryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {deliveryData.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name] || "#CBD5E1"} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {deliveryData.map((d) => (
              <span key={d.name} className={styles.legendItem}>
                <i style={{ background: STATUS_COLORS[d.name] || "#CBD5E1" }} />{d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Top selling products</h3>
        {topProducts.length === 0 ? (
          <p className={styles.muted}>No sales yet.</p>
        ) : (
          <div className={styles.topList}>
            {topProducts.map((p, i) => (
              <div key={p.productId} className={styles.topRow}>
                <span className={styles.rank}>{i + 1}</span>
                <span className={styles.topName}>{p.name}</span>
                <span className={styles.units}>{p.unitsSold} sold</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
