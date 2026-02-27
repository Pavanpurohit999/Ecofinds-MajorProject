import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";

const STATUSES = ["", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "pending", "confirmed", "processing", "shipped", "delivered", "completed", "cancelled"];

const statusColor = {
    completed: "bg-green-100 text-green-700",
    delivered: "bg-green-100 text-green-700",
    Delivered: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    Pending: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
    Cancelled: "bg-red-100 text-red-700",
    processing: "bg-blue-100 text-blue-700",
    confirmed: "bg-indigo-100 text-indigo-700",
    Confirmed: "bg-indigo-100 text-indigo-700",
    shipped: "bg-purple-100 text-purple-700",
    Shipped: "bg-purple-100 text-purple-700",
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
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(page, status); }, [page, status]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                    <p className="text-gray-500 text-sm">All platform orders · {data?.total?.toLocaleString() || "—"} total</p>
                </div>
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: "#d1fae5" }}>
                    <option value="">All Statuses</option>
                    {["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Completed", "Cancelled"].map((s) => (
                        <option key={s} value={s.toLowerCase()}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="rounded-2xl bg-white shadow-sm border overflow-hidden" style={{ borderColor: "#e7f5ec" }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: "#f0fdf4" }}>
                                {["Order ID", "Product", "Buyer", "Seller", "Amount", "Status", "Payment", "Date"].map((h) => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-12"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                            ) : data?.orders?.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No orders found</td></tr>
                            ) : data?.orders?.map((o) => (
                                <tr key={o._id} className="hover:bg-green-50 transition-colors">
                                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{o._id?.slice(-8).toUpperCase()}</td>
                                    <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">{o.productId?.productTitle || o.itemName || "—"}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{o.buyerId?.username || o.buyerId?.name || "—"}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{o.sellerId?.username || o.sellerId?.name || "—"}</td>
                                    <td className="px-4 py-3 text-gray-700 font-medium">₹{(o.totalPrice || o.totalAmount || 0)?.toLocaleString("en-IN")}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[o.status] || "bg-gray-100 text-gray-600"}`}>{o.status}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${o.paymentStatus === "completed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{o.paymentStatus}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "#e7f5ec" }}>
                        <p className="text-sm text-gray-500">Page {data.page} of {data.totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-40 hover:bg-green-50" style={{ borderColor: "#d1fae5" }}>← Prev</button>
                            <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-40 hover:bg-green-50" style={{ borderColor: "#d1fae5" }}>Next →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
