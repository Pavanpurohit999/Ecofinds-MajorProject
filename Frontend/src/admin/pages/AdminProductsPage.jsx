import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
    FiBox,
    FiSearch,
    FiFilter,
    FiChevronLeft,
    FiChevronRight,
    FiTag,
    FiExternalLink,
    FiPackage
} from "react-icons/fi";

const CATEGORIES = ["", "Cars", "Properties", "Mobiles", "Bikes", "Electronics & Appliances", "Commercial Vehicles & Spares", "Furniture", "Fashion", "Books, Sports & Hobbies", "Services"];
const CONDITIONS = ["", "New", "Used", "Refurbished"];

const conditionStyles = {
    New: "bg-blue-50 text-blue-600 border-blue-100",
    Used: "bg-amber-50 text-amber-600 border-amber-100",
    Refurbished: "bg-emerald-50 text-emerald-600 border-emerald-100"
};

export default function AdminProductsPage() {
    const { adminFetch } = useAdminAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");

    const fetchProducts = async (p = 1, s = "", cat = "", cond = "") => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p, limit: 15, search: s, category: cat, condition: cond });
            const res = await adminFetch(`/admin/products?${params}`);
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(page, search, category, condition); }, [page, search, category, condition]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Product Inventory</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Global catalog management •
                        <span className="text-emerald-600 font-bold ml-1">{data?.total?.toLocaleString() || "0"} Listed Items</span>
                    </p>
                </div>

                <form onSubmit={handleSearch} className="relative group">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by title or SKU..."
                        className="pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-sm font-semibold outline-none w-full md:w-80 shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                </form>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 px-2">
                    <FiFilter size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Filters</span>
                </div>
                <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                    className="pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c || "All Categories"}</option>)}
                </select>
                <select
                    value={condition}
                    onChange={(e) => { setCondition(e.target.value); setPage(1); }}
                    className="pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                >
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c || "All Conditions"}</option>)}
                </select>
            </div>

            {/* Catalog Table */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin shadow-lg" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                {["Product Asset", "Category", "State", "Pricing", "Velocity", "Custodian", "Timeline"].map((h) => (
                                    <th key={h} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data?.products?.length === 0 && !loading ? (
                                <tr><td colSpan={7} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">No inventory matches found</td></tr>
                            ) : data?.products?.map((p) => (
                                <tr key={p._id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {p.imageUrl ? (
                                                <div className="relative group/img">
                                                    <img src={p.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover/img:scale-110 transition-transform duration-300" />
                                                    <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                        <FiExternalLink className="text-white text-xs" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                                                    <FiPackage size={20} />
                                                </div>
                                            )}
                                            <div className="max-w-[180px]">
                                                <p className="font-black text-slate-800 tracking-tight leading-tight mb-1 truncate">{p.productTitle}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">SKU: {p._id?.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <FiTag size={12} className="text-emerald-500" />
                                            <span className="text-[11px] font-bold uppercase tracking-wider">{p.productCategory}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${conditionStyles[p.condition] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                            {p.condition}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-slate-800 tracking-tight">₹{p.price?.toLocaleString("en-IN")}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm font-bold text-slate-700">{p.soldCount || 0}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Sold</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">
                                                {(p.userId?.username || p.userId?.name || "?")[0].toUpperCase()}
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 truncate max-w-[100px]">
                                                {p.userId?.username || p.userId?.name || "—"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-xs font-bold text-slate-800">{new Date(p.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</p>
                                        <p className="text-[10px] text-slate-300 uppercase font-black tracking-tighter">Timestamp</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between px-8 py-6 bg-slate-50/30 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Batch {data.page} / {data.totalPages}</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-200 bg-white text-slate-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <FiChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                                disabled={page === data.totalPages}
                                className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-200 bg-white text-slate-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <FiChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
