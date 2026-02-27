import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
    FiUsers,
    FiPackage,
    FiShoppingCart,
    FiDollarSign,
    FiTrendingUp,
    FiUserPlus,
    FiInbox,
    FiActivity
} from "react-icons/fi";

const StatCard = ({ icon, label, value, sub, color, trend }) => (
    <div className="bg-white rounded-3xl p-7 flex flex-col gap-4 transition-all hover:scale-[1.02] hover:shadow-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner`}
                style={{ backgroundColor: `${color}15`, color: color }}>
                {icon}
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <FiTrendingUp size={12} /> {trend}
                </div>
            )}
        </div>
        <div>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-800 tracking-tight">{value ?? "—"}</span>
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</p>
            {sub && <p className="text-[11px] text-slate-400 font-medium mt-1 italic">{sub}</p>}
        </div>
    </div>
);

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
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin shadow-lg" />
            <p className="text-slate-500 font-bold text-sm animate-pulse tracking-widest uppercase">Initializing Dashboard...</p>
        </div>
    );

    if (error) return (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
            <div>
                <h3 className="font-bold">System Error</h3>
                <p className="text-sm opacity-80">{error}</p>
            </div>
        </div>
    );

    const formatINR = (n) => n?.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }) ?? "₹0";

    return (
        <div className="space-y-10">
            {/* Page Title & Intro */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Statistics</h1>
                    <p className="text-slate-500 font-medium mt-1">Showing real-time platform metrics and ecosystem health.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Live Engine Active</span>
                </div>
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<FiUsers />} label="Collective Users" value={stats?.totalUsers?.toLocaleString()} sub="Verified accounts on platform" color="#10b981" />
                <StatCard icon={<FiPackage />} label="Market Listings" value={stats?.totalProducts?.toLocaleString()} sub="Active item inventory" color="#f59e0b" />
                <StatCard icon={<FiShoppingCart />} label="Completed Orders" value={stats?.totalOrders?.toLocaleString()} sub="Successful transactions" color="#8b5cf6" />
                <StatCard icon={<FiDollarSign />} label="Net Revenue" value={formatINR(stats?.totalRevenue)} sub="Gross platform volume" color="#06b6d4" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Visualization */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <FiActivity size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Transaction Lifecycle</h2>
                    </div>

                    <div className="space-y-6">
                        {stats?.orderStatusBreakdown?.map((s) => (
                            <div key={s._id} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{s._id}</span>
                                    <span className="text-sm font-bold text-slate-800">{s.count}</span>
                                </div>
                                <div className="h-3 rounded-full bg-slate-50 overflow-hidden border border-slate-100 shadow-inner">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min(100, (s.count / (stats?.totalOrders || 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {(!stats?.orderStatusBreakdown || stats.orderStatusBreakdown.length === 0) && (
                            <div className="text-center py-10">
                                <FiInbox size={40} className="mx-auto text-slate-200 mb-2" />
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No order data synchronized</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                            <FiUserPlus size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Recent Onboarding</h2>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {stats?.recentUsers?.map((u) => (
                            <div key={u._id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 group">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black flex-shrink-0 shadow-md group-hover:scale-110 transition-transform"
                                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                                    {u.name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-800 truncate tracking-tight">{u.name}</p>
                                    <p className="text-[11px] text-slate-400 font-medium truncate italic">{u.email}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    {u.isSupplier && <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">Supplier</span>}
                                    {u.isVendor && <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md bg-amber-50 text-amber-600 border border-amber-100">Vendor</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Growth Chart Visualization */}
            {stats?.userGrowth?.length > 0 && (
                <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative border border-slate-800">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <FiTrendingUp size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">User Base Velocity</h2>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Last 6 Months Metrics</p>
                            </div>
                        </div>

                        <div className="flex items-end gap-4 h-48">
                            {stats.userGrowth.map((m) => {
                                const max = Math.max(...stats.userGrowth.map((x) => x.count));
                                const pct = max > 0 ? (m.count / max) * 100 : 5;
                                return (
                                    <div key={m._id} className="flex-1 flex flex-col items-center gap-3 group">
                                        <div className="relative w-full flex flex-col items-center">
                                            <span className="text-[10px] font-black text-emerald-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{m.count}</span>
                                            <div className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-700 ease-out shadow-lg shadow-emerald-600/20 group-hover:from-emerald-500 group-hover:to-emerald-300"
                                                style={{ height: `${pct}%` }} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{m._id?.slice(5)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
