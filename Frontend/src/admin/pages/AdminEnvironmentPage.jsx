import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";

const EcoCard = ({ icon, value, unit, label, sub, gradient }) => (
    <div className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden" style={{ background: gradient }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
        <div className="relative z-10">
            <div className="text-4xl mb-3">{icon}</div>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{value ?? "0"}</span>
                {unit && <span className="text-base font-medium opacity-80">{unit}</span>}
            </div>
            <p className="text-sm font-semibold mt-1 opacity-90">{label}</p>
            {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
        </div>
    </div>
);

export default function AdminEnvironmentPage() {
    const { adminFetch } = useAdminAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminFetch("/admin/environment")
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const s = data?.summary || {};

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">🌱 Environmental Impact</h1>
                <p className="text-gray-500 text-sm mt-1">Waste prevented and CO₂ saved through EcoFinds platform</p>
            </div>

            {/* Hero metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <EcoCard icon="♻️" value={s.totalItemsSaved?.toLocaleString()} label="Items Saved from Waste" sub="Refurbished & used products sold" gradient="linear-gradient(135deg, #16a34a, #15803d)" />
                <EcoCard icon="🗑️" value={s.totalWasteKgPrevented?.toFixed(1)} unit="kg" label="Waste Prevented" sub="E-waste & material diverted from landfill" gradient="linear-gradient(135deg, #0891b2, #0e7490)" />
                <EcoCard icon="🌍" value={s.totalCO2KgSaved?.toFixed(1)} unit="kg CO₂" label="Carbon Emissions Saved" sub="Equivalent avoided manufacturing emissions" gradient="linear-gradient(135deg, #7c3aed, #6d28d9)" />
            </div>

            {/* Listing stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl p-5 bg-white shadow-sm border" style={{ borderColor: "#e7f5ec" }}>
                    <p className="text-3xl font-bold text-green-600">{s.totalListedRefurbished?.toLocaleString() || 0}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">Refurbished Listings</p>
                    <p className="text-xs text-gray-400">Currently active on platform</p>
                </div>
                <div className="rounded-2xl p-5 bg-white shadow-sm border" style={{ borderColor: "#e7f5ec" }}>
                    <p className="text-3xl font-bold text-orange-500">{s.totalListedUsed?.toLocaleString() || 0}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">Used Item Listings</p>
                    <p className="text-xs text-gray-400">Currently active on platform</p>
                </div>
                <div className="rounded-2xl p-5 bg-white shadow-sm border" style={{ borderColor: "#e7f5ec" }}>
                    <p className="text-3xl font-bold text-indigo-600">{s.totalEcoListings?.toLocaleString() || 0}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">Total Eco Listings</p>
                    <p className="text-xs text-gray-400">Combined refurbished + used</p>
                </div>
            </div>

            {/* Category breakdown */}
            {data?.breakdown?.length > 0 && (
                <div className="rounded-2xl p-6 bg-white shadow-sm border" style={{ borderColor: "#e7f5ec" }}>
                    <h2 className="font-semibold text-gray-700 mb-5">Category Breakdown</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ background: "#f0fdf4" }}>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Items Saved</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Waste Prevented (kg)</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">CO₂ Saved (kg)</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Impact Share</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.breakdown.map((b) => {
                                    const pct = s.totalWasteKgPrevented > 0 ? (b.wasteKgPrevented / s.totalWasteKgPrevented * 100) : 0;
                                    return (
                                        <tr key={b.category} className="hover:bg-green-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-700">{b.category}</td>
                                            <td className="px-4 py-3 text-gray-600">{b.itemsSaved?.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-blue-600 font-medium">{b.wasteKgPrevented?.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-purple-600 font-medium">{b.co2KgSaved?.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                                                        <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-xs text-gray-500">{pct.toFixed(1)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {(!data?.breakdown || data.breakdown.length === 0) && (
                <div className="rounded-2xl p-12 bg-white shadow-sm border text-center" style={{ borderColor: "#e7f5ec" }}>
                    <div className="text-5xl mb-4">🌱</div>
                    <p className="text-gray-500 font-medium">No eco impact data yet</p>
                    <p className="text-gray-400 text-sm mt-1">Impact will appear once refurbished/used products are sold</p>
                </div>
            )}
        </div>
    );
}
