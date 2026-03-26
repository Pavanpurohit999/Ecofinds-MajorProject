import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
    FiUsers, FiPackage, FiShoppingCart, FiDollarSign,
    FiTrendingUp, FiUserPlus, FiInbox, FiActivity
} from "react-icons/fi";

const STAT_COLORS = [
    { bg: "#eef2ff", icon: "#6366f1", border: "#e0e7ff" }, // indigo — users
    { bg: "#fff7ed", icon: "#f97316", border: "#ffedd5" }, // orange — products
    { bg: "#f5f3ff", icon: "#8b5cf6", border: "#ede9fe" }, // violet — orders
    { bg: "#ecfdf5", icon: "#10b981", border: "#d1fae5" }, // emerald — revenue (kept green for money)
];

const StatCard = ({ icon, label, value, sub, colorIdx = 0 }) => {
    const c = STAT_COLORS[colorIdx];
    return (
        <div className="bg-white rounded-[1.5rem] sm:rounded-2xl p-5 sm:p-6 flex flex-col gap-3 sm:gap-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl"
                    style={{ backgroundColor: c.bg, color: c.icon, border: `1px solid ${c.border}` }}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-2xl font-black text-slate-800 tracking-tight">{value ?? "—"}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</p>
                {sub && <p className="text-[11px] text-slate-400 font-medium mt-1">{sub}</p>}
            </div>
        </div>
    );
};

const STATUS_COLORS = {
    completed: "#10b981", delivered: "#10b981", Delivered: "#10b981", Completed: "#10b981",
    pending: "#f59e0b", Pending: "#f59e0b",
    cancelled: "#ef4444", Cancelled: "#ef4444",
    processing: "#3b82f6", Processing: "#3b82f6",
    confirmed: "#6366f1", Confirmed: "#6366f1",
    shipped: "#8b5cf6", Shipped: "#8b5cf6",
};

export default function AdminOverviewPage() {
    const { adminFetch } = useAdminAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        adminFetch("/admin/stats")
            .then(setStats)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-10 h-10 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-bold text-xs animate-pulse tracking-widest uppercase">Loading dashboard...</p>
        </div>
    );

    if (error) return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-lg">⚠</div>
            <div><h3 className="font-bold text-sm">Error</h3><p className="text-sm opacity-80">{error}</p></div>
        </div>
    );

    const formatINR = (n) => n?.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }) ?? "₹0";

    const maxGrowth = stats?.userGrowth?.length > 0 ? Math.max(...stats.userGrowth.map(x => x.count)) : 1;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
                <p className="text-slate-400 text-sm mt-1 font-medium">Real-time platform metrics and analytics.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard colorIdx={0} icon={<FiUsers />} label="Total Users" value={stats?.totalUsers?.toLocaleString()} sub="Registered accounts" />
                <StatCard colorIdx={1} icon={<FiPackage />} label="Listings" value={stats?.totalProducts?.toLocaleString()} sub="Active inventory" />
                <StatCard colorIdx={2} icon={<FiShoppingCart />} label="Orders" value={stats?.totalOrders?.toLocaleString()} sub="All time transactions" />
                <StatCard colorIdx={3} icon={<FiDollarSign />} label="Revenue" value={formatINR(stats?.totalRevenue)} sub="Completed orders" />
            </div>

            {/* Middle row: Order breakdown + Recent users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <FiActivity size={16} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-800">Order Status Breakdown</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Transaction lifecycle</p>
                        </div>
                    </div>
                    <div className="space-y-3.5">
                        {stats?.orderStatusBreakdown?.map((s) => {
                            const barColor = STATUS_COLORS[s._id] || "#94a3b8";
                            const pct = Math.min(100, (s.count / (stats?.totalOrders || 1)) * 100);
                            return (
                                <div key={s._id}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-bold text-slate-600 capitalize">{s._id}</span>
                                        <span className="text-xs font-black text-slate-800">{s.count}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, backgroundColor: barColor }} />
                                    </div>
                                </div>
                            );
                        })}
                        {(!stats?.orderStatusBreakdown || stats.orderStatusBreakdown.length === 0) && (
                            <div className="text-center py-8">
                                <FiInbox size={32} className="mx-auto text-slate-200 mb-2" />
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No order data</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white rounded-[1.5rem] sm:rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 overflow-hidden">
                    <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                            <FiUserPlus size={16} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-800">Recent Registrations</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last 5 users</p>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-50 overflow-x-auto min-w-full">
                        {stats?.recentUsers?.map((u) => (
                            <div key={u._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 min-w-max pr-2">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                                    {u.name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">{u.name}</p>
                                    <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    {u.isSupplier && <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-indigo-50 text-indigo-600 border border-indigo-100">Supplier</span>}
                                    {u.isVendor && <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-amber-50 text-amber-600 border border-amber-100">Vendor</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Growth Chart — FIXED */}
            {stats?.userGrowth?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                            <FiTrendingUp size={16} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-800">User Growth Trend</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monthly new registrations — last 6 months</p>
                        </div>
                    </div>

                    {/* Chart — fixed: use explicit pixel heights, not % */}
                    <div className="mt-2">
                        <div className="flex items-end gap-3" style={{ height: "180px" }}>
                            {stats.userGrowth.map((m) => {
                                const pxHeight = maxGrowth > 0 ? Math.max(8, Math.round((m.count / maxGrowth) * 140)) : 8;
                                return (
                                    <div key={m._id} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                        {/* Hover label */}
                                        <span className="text-xs font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {m.count}
                                        </span>
                                        {/* Bar */}
                                        <div
                                            className="w-full max-w-[48px] rounded-t-lg transition-all duration-700 ease-out group-hover:opacity-90"
                                            style={{
                                                height: `${pxHeight}px`,
                                                background: "linear-gradient(to top, #4f46e5, #818cf8)"
                                            }}
                                        />
                                        {/* Month label */}
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                            {m._id?.slice(5)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Y-axis labels */}
                        <div className="border-t border-slate-100 mt-1 pt-1 flex items-center justify-between">
                            <span className="text-[10px] text-slate-300 font-bold">0</span>
                            <span className="text-[10px] text-slate-300 font-bold">Max: {maxGrowth}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
