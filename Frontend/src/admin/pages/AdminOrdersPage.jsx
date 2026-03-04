import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
    FiChevronLeft, FiChevronRight, FiFilter,
    FiFileText, FiPackage, FiCreditCard, FiEdit2
} from "react-icons/fi";
import AdminConfirmModal from "./AdminConfirmModal";
import AdminToast from "./AdminToast";

const STATUS_LIST = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Completed", "Cancelled"];

const statusStyles = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    Pending: "bg-amber-50 text-amber-700 border-amber-100",
    cancelled: "bg-rose-50 text-rose-600 border-rose-100",
    Cancelled: "bg-rose-50 text-rose-600 border-rose-100",
    processing: "bg-blue-50 text-blue-700 border-blue-100",
    Processing: "bg-blue-50 text-blue-700 border-blue-100",
    confirmed: "bg-indigo-50 text-indigo-700 border-indigo-100",
    Confirmed: "bg-indigo-50 text-indigo-700 border-indigo-100",
    shipped: "bg-violet-50 text-violet-700 border-violet-100",
    Shipped: "bg-violet-50 text-violet-700 border-violet-100",
};

function StatusDropdown({ order, onSelect }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                title="Change Status"
                className="w-8 h-8 rounded-lg flex items-center justify-center border bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 transition-all hover:scale-105">
                <FiEdit2 size={12} />
            </button>
            {open && (
                <div className="absolute right-0 top-10 z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-40 p-1 animate-in zoom-in-95 fade-in duration-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 py-1.5">Set Status</p>
                    {STATUS_LIST.map(s => (
                        <button key={s} onClick={() => { onSelect(s); setOpen(false); }}
                            disabled={order.status?.toLowerCase() === s.toLowerCase()}
                            className="w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 hover:bg-slate-50">
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminOrdersPage() {
    const { adminFetch } = useAdminAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("");
    const [toast, setToast] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchOrders = useCallback(async (p = 1, s = "") => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p, limit: 15, status: s });
            const res = await adminFetch(`/admin/orders?${params}`);
            setData(res);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [adminFetch]);

    useEffect(() => { fetchOrders(page, status); }, [page, status]);

    const startStatusChange = (order, newStatus) => setConfirm({
        orderId: order._id, newStatus,
        title: "Update Order Status?",
        message: `Change order #${order._id?.slice(-8).toUpperCase()} from "${order.status}" → "${newStatus}".`,
    });

    const handleConfirm = async () => {
        if (!confirm) return;
        setActionLoading(true);
        try {
            await adminFetch(`/admin/orders/${confirm.orderId}/status`, { method: "PATCH", body: JSON.stringify({ status: confirm.newStatus }) });
            setToast({ type: "success", message: `Status updated to "${confirm.newStatus}".` });
            setData(prev => ({ ...prev, orders: prev.orders.map(o => o._id === confirm.orderId ? { ...o, status: confirm.newStatus } : o) }));
        } catch (e) {
            setToast({ type: "error", message: e.message || "Update failed." });
        } finally {
            setActionLoading(false);
            setConfirm(null);
        }
    };

    return (
        <div className="space-y-6">
            <AdminToast toast={toast} onClose={() => setToast(null)} />
            <AdminConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message}
                mode="info" confirmLabel="Update Status"
                loading={actionLoading} onConfirm={handleConfirm} onCancel={() => setConfirm(null)} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Management</h1>
                    <p className="text-slate-400 text-sm mt-0.5">
                        Monitor and control all orders •
                        <span className="text-indigo-600 font-bold ml-1">{data?.total?.toLocaleString() || "0"} total</span>
                    </p>
                </div>
                <div className="relative">
                    <FiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="pl-10 pr-8 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-semibold outline-none shadow-sm focus:border-indigo-500 transition-all appearance-none cursor-pointer text-slate-600">
                        <option value="">All Statuses</option>
                        {STATUS_LIST.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                    </select>
                </div>
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
                                {["Order ID", "Product", "Buyer / Seller", "Amount", "Status", "Payment", "Date", "Actions"].map(h => (
                                    <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data?.orders?.length === 0 && !loading ? (
                                <tr><td colSpan={8} className="text-center py-16 text-slate-400 text-sm font-bold">No orders found</td></tr>
                            ) : data?.orders?.map((o) => (
                                <tr key={o._id} className="hover:bg-slate-50/70 transition-colors group">
                                    {/* ID */}
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <FiFileText size={12} className="text-slate-300" />
                                            <span className="text-[11px] font-black font-mono text-slate-500">#{o._id?.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </td>
                                    {/* Product */}
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                                <FiPackage size={12} />
                                            </div>
                                            <p className="text-sm font-bold text-slate-800 truncate max-w-[130px]">
                                                {o.productId?.productTitle || o.itemName || "—"}
                                            </p>
                                        </div>
                                    </td>
                                    {/* Buyer / Seller */}
                                    <td className="px-5 py-3.5">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black text-slate-300 uppercase w-3">B</span>
                                                <span className="text-xs font-semibold text-slate-600">{o.buyerId?.username || o.buyerId?.name || "—"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black text-slate-300 uppercase w-3">S</span>
                                                <span className="text-xs font-semibold text-slate-600">{o.sellerId?.username || o.sellerId?.name || "—"}</span>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Amount */}
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm font-black text-slate-800">₹{(o.totalPrice || o.totalAmount || 0)?.toLocaleString("en-IN")}</span>
                                    </td>
                                    {/* Status */}
                                    <td className="px-5 py-3.5">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusStyles[o.status] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    {/* Payment */}
                                    <td className="px-5 py-3.5">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${o.paymentStatus === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                                            {o.paymentStatus || "Awaiting"}
                                        </span>
                                    </td>
                                    {/* Date */}
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-bold text-slate-600">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                                    </td>
                                    {/* Actions */}
                                    <td className="px-5 py-3.5">
                                        <StatusDropdown order={o} onSelect={(newStatus) => startStatusChange(o, newStatus)} />
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
