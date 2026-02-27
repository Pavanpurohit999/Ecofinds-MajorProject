import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
    FiShoppingCart,
    FiUser,
    FiTruck,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiChevronLeft,
    FiChevronRight,
    FiFilter,
    FiFileText,
    FiPackage,
    FiCreditCard
} from "react-icons/fi";

const statusStyles = {
    completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    Pending: "bg-amber-50 text-amber-600 border-amber-100",
    cancelled: "bg-rose-50 text-rose-600 border-rose-100",
    Cancelled: "bg-rose-50 text-rose-600 border-rose-100",
    processing: "bg-blue-50 text-blue-600 border-blue-100",
    confirmed: "bg-indigo-50 text-indigo-600 border-indigo-100",
    Confirmed: "bg-indigo-50 text-indigo-600 border-indigo-100",
    shipped: "bg-purple-50 text-purple-600 border-purple-100",
    Shipped: "bg-purple-50 text-purple-600 border-purple-100",
};

export default function AdminOrdersPage() {
    const { adminFetch } = useAdminAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("");

    const fetchOrders = async (p = 1, s = "") => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p, limit: 15, status: s });
            const res = await adminFetch(`/admin/orders?${params}`);
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(page, status); }, [page, status]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Transaction Ledger</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Monitor platform fulfillment •
                        <span className="text-emerald-600 font-bold ml-1">{data?.total?.toLocaleString() || "0"} Lifetime Orders</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            className="pl-11 pr-10 py-3 bg-white rounded-2xl border border-slate-200 text-sm font-bold outline-none shadow-sm focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Filter by Life Cycle</option>
                            {["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Completed", "Cancelled"].map((s) => (
                                <option key={s} value={s.toLowerCase()}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Ledger Table */}
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
                                {["Order Reference", "Asset Details", "Counterparty (B/S)", "Gross Amount", "Current Phase", "Fiscal State", "Timestamp"].map((h) => (
                                    <th key={h} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data?.orders?.length === 0 && !loading ? (
                                <tr><td colSpan={7} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">No transaction records found</td></tr>
                            ) : data?.orders?.map((o) => (
                                <tr key={o._id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <FiFileText className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                            <span className="text-[11px] font-black font-mono text-slate-500 tracking-tighter">
                                                #{o._id?.slice(-8).toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                                <FiPackage size={14} />
                                            </div>
                                            <p className="text-sm font-black text-slate-800 tracking-tight leading-tight truncate max-w-[140px]">
                                                {o.productId?.productTitle || o.itemName || "Unidentified Asset"}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black uppercase text-slate-300 w-3">B</span>
                                                <span className="text-xs font-bold text-slate-600">{o.buyerId?.username || o.buyerId?.name || "—"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black uppercase text-slate-300 w-3">S</span>
                                                <span className="text-xs font-bold text-slate-600">{o.sellerId?.username || o.sellerId?.name || "—"}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <FiCreditCard className="text-slate-300 text-xs" />
                                            <span className="text-sm font-black text-slate-800 tracking-tight">₹{(o.totalPrice || o.totalAmount || 0)?.toLocaleString("en-IN")}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusStyles[o.status] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${o.paymentStatus === "completed" ? "bg-emerald-500 text-white border-emerald-600" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                                            {o.paymentStatus || "Awaiting"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-xs font-bold text-slate-800">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</p>
                                        <p className="text-[10px] text-slate-300 uppercase font-black tracking-tighter">Settlement</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between px-8 py-6 bg-slate-50/30 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Block {data.page} / {data.totalPages}</p>
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
