import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
    FiTrash2,
    FiCloud,
    FiPackage,
    FiInbox,
    FiBarChart2,
    FiActivity,
    FiZap
} from "react-icons/fi";

import { FaRecycle } from "react-icons/fa";
const EcoCard = ({ icon, value, unit, label, sub, color }) => (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col gap-5 transition-all hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform group-hover:scale-110"
            style={{ backgroundColor: color }} />

        <div className="flex items-center justify-between">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:rotate-12"
                style={{ backgroundColor: `${color}15`, color: color }}>
                {icon}
            </div>
            <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Asset</span>
            </div>
        </div>

        <div>
            <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-slate-800 tracking-tighter">{value ?? "0"}</span>
                {unit && <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{unit}</span>}
            </div>
            <p className="text-sm font-black text-slate-800 uppercase tracking-tight mt-2">{label}</p>
            {sub && <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">{sub}</p>}
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin shadow-lg" />
            <p className="text-slate-500 font-bold text-sm animate-pulse tracking-widest uppercase">Calculating Ecosystem Impact...</p>
        </div>
    );

    const s = data?.summary || {};

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Environmental Intelligence</h1>
                    <p className="text-slate-500 font-medium mt-1">Measuring the circular economy impact of the EcoFinds movement.</p>
                </div>
                <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-3">
                    <FiActivity className="text-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Real-time Synchronization</span>
                </div>
            </div>

            {/* Core Impact Matrices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <EcoCard icon={<FaRecycle />} value={s.totalItemsSaved?.toLocaleString()} label="Asset Salvage Count" sub="Verified pre-owned products successfully repurposed" color="#10b981" />
                <EcoCard icon={<FiTrash2 />} value={s.totalWasteKgPrevented?.toFixed(1)} unit="kg" label="Landfill Diversion" sub="Toxic e-waste prevented from entering natural ecosystems" color="#0ea5e9" />
                <EcoCard icon={<FiCloud />} value={s.totalCO2KgSaved?.toFixed(1)} unit="kg CO₂" label="Emissions Abatement" sub="Estimated carbon footprint reduction from avoided manufacturing" color="#8b5cf6" />
            </div>

            {/* Inventory Sustainability Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow">
                    <FiZap className="absolute top-6 right-8 text-emerald-200 group-hover:text-emerald-400 transition-colors" size={32} />
                    <p className="text-4xl font-black text-emerald-600 tracking-tighter">{s.totalListedRefurbished?.toLocaleString() || 0}</p>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-[0.15em] mt-3">Refurbished Pipeline</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Active Eco-Assets</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow">
                    <FiActivity className="absolute top-6 right-8 text-amber-200 group-hover:text-amber-400 transition-colors" size={32} />
                    <p className="text-4xl font-black text-amber-500 tracking-tighter">{s.totalListedUsed?.toLocaleString() || 0}</p>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-[0.15em] mt-3">Reused Inventory</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Circular Trade Volume</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow">
                    <FiBarChart2 className="absolute top-6 right-8 text-indigo-200 group-hover:text-indigo-400 transition-colors" size={32} />
                    <p className="text-4xl font-black text-indigo-600 tracking-tighter">{s.totalEcoListings?.toLocaleString() || 0}</p>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-[0.15em] mt-3">Aggregate Eco-Listings</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Platform-wide Impact</p>
                </div>
            </div>

            {/* Categorical Distribution */}
            {data?.breakdown?.length > 0 && (
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mt-12">
                    <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FiBarChart2 className="text-emerald-500" size={24} />
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">System Breakdown</h2>
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Environmental Audit Log</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    {["Taxonomy", "Salvage Vol", "Waste Diversion (kg)", "Carbon Neutrality (kg)", "Ecosystem Weight"].map(h => (
                                        <th key={h} className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.breakdown.map((b) => {
                                    const pct = s.totalWasteKgPrevented > 0 ? (b.wasteKgPrevented / s.totalWasteKgPrevented * 100) : 0;
                                    return (
                                        <tr key={b.category} className="hover:bg-slate-50/80 transition-all">
                                            <td className="px-10 py-5">
                                                <span className="text-sm font-black text-slate-800 tracking-tight">{b.category}</span>
                                            </td>
                                            <td className="px-10 py-5">
                                                <span className="text-sm font-bold text-slate-600">{b.itemsSaved?.toLocaleString()} units</span>
                                            </td>
                                            <td className="px-10 py-5">
                                                <span className="text-sm font-black text-emerald-600">{b.wasteKgPrevented?.toFixed(2)}</span>
                                            </td>
                                            <td className="px-10 py-5">
                                                <span className="text-sm font-black text-indigo-600">{b.co2KgSaved?.toFixed(2)}</span>
                                            </td>
                                            <td className="px-10 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 h-2 rounded-full bg-slate-100 shadow-inner overflow-hidden min-w-[120px]">
                                                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 w-10">{pct.toFixed(1)}%</span>
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

            {/* Empty State */}
            {(!data?.breakdown || data.breakdown.length === 0) && (
                <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-100 shadow-inner">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <FiRecycle size={48} className="text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Ecosystem Awaiting Initialization</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto font-medium">Platform impact metrics will materialize as circular trade transactions are finalized within the system.</p>
                </div>
            )}
        </div>
    );
}
