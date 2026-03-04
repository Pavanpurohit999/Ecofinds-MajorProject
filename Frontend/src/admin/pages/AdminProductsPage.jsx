import React, { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
    FiSearch, FiFilter, FiChevronLeft, FiChevronRight,
    FiTag, FiPackage, FiTrash2
} from "react-icons/fi";
import AdminConfirmModal from "./AdminConfirmModal";
import AdminToast from "./AdminToast";

const CATEGORIES = ["", "Cars", "Properties", "Mobiles", "Bikes", "Electronics & Appliances", "Commercial Vehicles & Spares", "Furniture", "Fashion", "Books, Sports & Hobbies", "Services"];
const CONDITIONS = ["", "New", "Used", "Refurbished"];

const conditionStyles = {
    New: "bg-blue-50 text-blue-600 border-blue-100",
    Used: "bg-amber-50 text-amber-600 border-amber-100",
    Refurbished: "bg-violet-50 text-violet-600 border-violet-100",
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
    const [toast, setToast] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchProducts = useCallback(async (p = 1, s = "", cat = "", cond = "") => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p, limit: 15, search: s, category: cat, condition: cond });
            const res = await adminFetch(`/admin/products?${params}`);
            setData(res);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [adminFetch]);

    useEffect(() => { fetchProducts(page, search, category, condition); }, [page, search, category, condition]);

    const handleSearch = (e) => { e.preventDefault(); setPage(1); setSearch(searchInput); };

    const startDelete = (p) => setConfirm({ productId: p._id, productTitle: p.productTitle });

    const handleConfirm = async () => {
        if (!confirm) return;
        setActionLoading(true);
        try {
            await adminFetch(`/admin/products/${confirm.productId}`, { method: "DELETE" });
            setToast({ type: "success", message: "Product deleted." });
            setData(prev => ({ ...prev, products: prev.products.filter(p => p._id !== confirm.productId), total: prev.total - 1 }));
        } catch (e) {
            setToast({ type: "error", message: e.message || "Delete failed." });
        } finally {
            setActionLoading(false);
            setConfirm(null);
        }
    };

    return (
        <div className="space-y-6">
            <AdminToast toast={toast} onClose={() => setToast(null)} />
            <AdminConfirmModal
                open={!!confirm}
                title="Delete Product?"
                message={`Permanently remove "${confirm?.productTitle}"? This cannot be undone.`}
                mode="danger" confirmLabel="Delete Product"
                loading={actionLoading} onConfirm={handleConfirm} onCancel={() => setConfirm(null)} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog</h1>
                    <p className="text-slate-400 text-sm mt-0.5">
                        Manage all platform listings •
                        <span className="text-indigo-600 font-bold ml-1">{data?.total?.toLocaleString() || "0"} listings</span>
                    </p>
                </div>
                <form onSubmit={handleSearch} className="relative">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by product title..."
                        className="pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm outline-none w-full md:w-72 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all" />
                </form>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 px-1">
                    <FiFilter size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
                </div>
                <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                    className="pl-3 pr-8 py-2 rounded-lg border border-slate-200 text-sm font-semibold bg-white outline-none focus:border-indigo-400 transition-all appearance-none cursor-pointer text-slate-600">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c || "All Categories"}</option>)}
                </select>
                <select value={condition} onChange={(e) => { setCondition(e.target.value); setPage(1); }}
                    className="pl-3 pr-8 py-2 rounded-lg border border-slate-200 text-sm font-semibold bg-white outline-none focus:border-indigo-400 transition-all appearance-none cursor-pointer text-slate-600">
                    {CONDITIONS.map(c => <option key={c} value={c}>{c || "All Conditions"}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                        <div className="w-8 h-8 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/60">
                                {["Product", "Category", "Condition", "Price", "Sold", "Seller", "Listed", "Actions"].map(h => (
                                    <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data?.products?.length === 0 && !loading ? (
                                <tr><td colSpan={8} className="text-center py-16 text-slate-400 text-sm font-bold">No products found</td></tr>
                            ) : data?.products?.map((p) => (
                                <tr key={p._id} className="hover:bg-slate-50/70 transition-colors group">
                                    {/* Product */}
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            {p.imageUrl ? (
                                                <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                                    <FiPackage size={16} />
                                                </div>
                                            )}
                                            <div className="max-w-[180px]">
                                                <p className="font-bold text-slate-800 text-sm leading-tight truncate">{p.productTitle}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">{p._id?.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Category */}
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1.5">
                                            <FiTag size={11} className="text-slate-400" />
                                            <span className="text-[11px] font-bold text-slate-600">{p.productCategory}</span>
                                        </div>
                                    </td>
                                    {/* Condition */}
                                    <td className="px-5 py-3.5">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${conditionStyles[p.condition] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                            {p.condition}
                                        </span>
                                    </td>
                                    {/* Price */}
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm font-black text-slate-800">₹{p.price?.toLocaleString("en-IN")}</span>
                                    </td>
                                    {/* Sold */}
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm font-bold text-slate-600">{p.soldCount || 0}</span>
                                        <span className="text-[10px] text-slate-400 ml-1">sold</span>
                                    </td>
                                    {/* Seller */}
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-bold text-slate-600">{p.userId?.username || p.userId?.name || "—"}</span>
                                    </td>
                                    {/* Date */}
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-bold text-slate-600">{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                                    </td>
                                    {/* Actions */}
                                    <td className="px-5 py-3.5">
                                        <button onClick={() => startDelete(p)} title="Delete Product"
                                            className="w-8 h-8 rounded-lg flex items-center justify-center border bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100 transition-all hover:scale-105">
                                            <FiTrash2 size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 bg-slate-50/40 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400">Page {data.page} / {data.totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 transition-all">
                                <FiChevronLeft size={16} />
                            </button>
                            <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 transition-all">
                                <FiChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
