import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";

const StatCard = ({ icon, label, value, sub, color }) => (
    <div className="rounded-2xl p-6 shadow-sm border flex flex-col gap-3 transition-all hover:shadow-md" style={{ background: "#fff", borderColor: "#e7f5ec" }}>
        <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: color + "20" }}>
                {icon}
            </div>
            <span className="text-3xl font-bold" style={{ color }}>{value ?? "—"}</span>
        </div>
        <div>
            <p className="text-sm font-semibold text-gray-700">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
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
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    const formatINR = (n) => n?.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }) ?? "₹0";

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-500 text-sm mt-1">Real-time platform statistics • EcoFinds Admin</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon="👥" label="Total Users" value={stats?.totalUsers?.toLocaleString()} sub="Registered accounts" color="#16a34a" />
                <StatCard icon="📦" label="Products Listed" value={stats?.totalProducts?.toLocaleString()} sub="Active listings" color="#f97316" />
                <StatCard icon="🛒" label="Total Orders" value={stats?.totalOrders?.toLocaleString()} sub="All time orders" color="#7c3aed" />
                <StatCard icon="💰" label="Total Revenue" value={formatINR(stats?.totalRevenue)} sub="From completed orders" color="#0891b2" />
            </div>

            {/* Order Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl p-6 bg-white shadow-sm border" style={{ borderColor: "#e7f5ec" }}>
                    <h2 className="font-semibold text-gray-700 mb-4">Order Status Breakdown</h2>
                    <div className="space-y-3">
                        {stats?.orderStatusBreakdown?.map((s) => (
                            <div key={s._id} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 capitalize">{s._id}</span>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 rounded-full bg-green-100 overflow-hidden w-32">
                                        <div
                                            className="h-full rounded-full bg-green-500"
                                            style={{ width: `${Math.min(100, (s.count / (stats?.totalOrders || 1)) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 w-8 text-right">{s.count}</span>
                                </div>
                            </div>
                        ))}
                        {(!stats?.orderStatusBreakdown || stats.orderStatusBreakdown.length === 0) && (
                            <p className="text-sm text-gray-400">No order data yet</p>
                        )}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="rounded-2xl p-6 bg-white shadow-sm border" style={{ borderColor: "#e7f5ec" }}>
                    <h2 className="font-semibold text-gray-700 mb-4">Recent Signups</h2>
                    <div className="space-y-3">
                        {stats?.recentUsers?.map((u) => (
                            <div key={u._id} className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                                    {u.name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">{u.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    {u.isSupplier && <span className="px-1.5 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Supplier</span>}
                                    {u.isVendor && <span className="px-1.5 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700">Vendor</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* User growth chart (text-based) */}
            {stats?.userGrowth?.length > 0 && (
                <div className="rounded-2xl p-6 bg-white shadow-sm border" style={{ borderColor: "#e7f5ec" }}>
                    <h2 className="font-semibold text-gray-700 mb-4">User Growth (Last 6 Months)</h2>
                    <div className="flex items-end gap-3 h-32">
                        {stats.userGrowth.map((m) => {
                            const max = Math.max(...stats.userGrowth.map((x) => x.count));
                            const pct = max > 0 ? (m.count / max) * 100 : 5;
                            return (
                                <div key={m._id} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-xs font-semibold text-green-700">{m.count}</span>
                                    <div className="w-full rounded-t-lg bg-green-500 transition-all" style={{ height: `${pct}%` }} />
                                    <span className="text-xs text-gray-400">{m._id?.slice(5)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
