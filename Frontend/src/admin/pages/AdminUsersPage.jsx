import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
    FiSearch,
    FiUser,
    FiShield,
    FiChevronLeft,
    FiChevronRight,
    FiFilter,
    FiDownload
} from "react-icons/fi";

export default function AdminUsersPage() {
    const { adminFetch } = useAdminAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");

    const fetchUsers = async (p = 1, s = "") => {
        setLoading(true);
        try {
            const res = await adminFetch(`/admin/users?page=${p}&limit=15&search=${encodeURIComponent(s)}`);
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(page, search); }, [page, search]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Identity Management</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Monitor and control all registered platform participants •
                        <span className="text-emerald-600 font-bold ml-1">{data?.total?.toLocaleString() || "0"} Accounts</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <form onSubmit={handleSearch} className="relative group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Find by name, email..."
                            className="pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-sm font-semibold outline-none w-full md:w-80 shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        />
                        <button type="submit" className="hidden">Search</button>
                    </form>
                </div>
            </div>

            {/* Table Container */}
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
                                {["Member Identity", "Access Handle", "Communication", "System Roles", "Inception"].map((h) => (
                                    <th key={h} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data?.users?.length === 0 && !loading ? (
                                <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">No matching identities found</td></tr>
                            ) : data?.users?.map((u) => (
                                <tr key={u._id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-md transform group-hover:scale-110 transition-transform"
                                                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                                                {u.name?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 tracking-tight leading-none mb-1">{u.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {u._id?.slice(-8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">@{u.username}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-slate-700">{u.email}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{u.phone || "No phone linked"}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {u.isSupplier && <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/50">Supplier</span>}
                                            {u.isVendor && <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-amber-50 text-amber-600 border border-amber-100/50">Vendor</span>}
                                            {!u.isSupplier && !u.isVendor && <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-slate-100 text-slate-500">Regular Buyer</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-slate-800">{new Date(u.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Platform Entry</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Wrapper */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between px-8 py-5 bg-slate-50/30 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Page {data.page} of {data.totalPages}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm bg-white text-slate-600 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <FiChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                                disabled={page === data.totalPages}
                                className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm bg-white text-slate-600 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <FiChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
