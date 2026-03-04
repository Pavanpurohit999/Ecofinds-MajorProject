import React, { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
    FiSearch, FiChevronLeft, FiChevronRight,
    FiTrash2, FiSlash, FiCheckCircle
} from "react-icons/fi";
import AdminConfirmModal from "./AdminConfirmModal";
import AdminToast from "./AdminToast";

const ROLE_LABELS = [
    { key: "isSupplier", label: "Supplier", on: "bg-indigo-600 text-white border-indigo-700", off: "bg-slate-100 text-slate-500 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200" },
    { key: "isVendor", label: "Vendor", on: "bg-amber-500 text-white border-amber-600", off: "bg-slate-100 text-slate-500 border-slate-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200" },
];

export default function AdminUsersPage() {
    const { adminFetch } = useAdminAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [toast, setToast] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = useCallback(async (p = 1, s = "") => {
        setLoading(true);
        try {
            const res = await adminFetch(`/admin/users?page=${p}&limit=15&search=${encodeURIComponent(s)}`);
            setData(res);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [adminFetch]);

    useEffect(() => { fetchUsers(page, search); }, [page, search]);

    const handleSearch = (e) => { e.preventDefault(); setPage(1); setSearch(searchInput); };

    const handleConfirm = async () => {
        if (!confirm) return;
        setActionLoading(true);
        try {
            const { type, userId, extra } = confirm;
            if (type === "suspend") {
                await adminFetch(`/admin/users/${userId}/status`, { method: "PATCH", body: JSON.stringify({ isSuspended: true }) });
                setToast({ type: "success", message: "User suspended." });
                setData(prev => ({ ...prev, users: prev.users.map(u => u._id === userId ? { ...u, isSuspended: true } : u) }));
            } else if (type === "activate") {
                await adminFetch(`/admin/users/${userId}/status`, { method: "PATCH", body: JSON.stringify({ isSuspended: false }) });
                setToast({ type: "success", message: "User activated." });
                setData(prev => ({ ...prev, users: prev.users.map(u => u._id === userId ? { ...u, isSuspended: false } : u) }));
            } else if (type === "delete") {
                await adminFetch(`/admin/users/${userId}`, { method: "DELETE" });
                setToast({ type: "success", message: "User deleted." });
                setData(prev => ({ ...prev, users: prev.users.filter(u => u._id !== userId), total: prev.total - 1 }));
            } else if (type === "role") {
                await adminFetch(`/admin/users/${userId}/role`, { method: "PATCH", body: JSON.stringify(extra) });
                setToast({ type: "success", message: "Role updated." });
                setData(prev => ({ ...prev, users: prev.users.map(u => u._id === userId ? { ...u, ...extra } : u) }));
            }
        } catch (e) {
            setToast({ type: "error", message: e.message || "Action failed." });
        } finally {
            setActionLoading(false);
            setConfirm(null);
        }
    };

    const startSuspend = (u) => setConfirm({
        type: u.isSuspended ? "activate" : "suspend", userId: u._id,
        title: u.isSuspended ? "Activate User?" : "Suspend User?",
        message: u.isSuspended ? `Restore access for ${u.name}?` : `Block ${u.name} from logging in?`,
        mode: u.isSuspended ? "info" : "warning", label: u.isSuspended ? "Activate" : "Suspend",
    });

    const startDelete = (u) => setConfirm({
        type: "delete", userId: u._id,
        title: "Delete User Account?",
        message: `Permanently delete ${u.name} (${u.email})? This cannot be undone.`,
        mode: "danger", label: "Delete Permanently",
    });

    const startRoleToggle = (u, roleKey) => {
        const newVal = !u[roleKey];
        const roleName = roleKey === "isSupplier" ? "Supplier" : "Vendor";
        setConfirm({
            type: "role", userId: u._id, extra: { [roleKey]: newVal },
            title: newVal ? `Grant ${roleName} Role?` : `Remove ${roleName} Role?`,
            message: newVal ? `Promote ${u.name} to ${roleName}.` : `Remove ${roleName} from ${u.name}.`,
            mode: "info", label: newVal ? `Grant ${roleName}` : `Remove ${roleName}`,
        });
    };

    return (
        <div className="space-y-6">
            <AdminToast toast={toast} onClose={() => setToast(null)} />
            <AdminConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message}
                mode={confirm?.mode || "danger"} confirmLabel={confirm?.label}
                loading={actionLoading} onConfirm={handleConfirm} onCancel={() => setConfirm(null)} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-slate-400 text-sm mt-0.5">
                        Manage platform accounts •
                        <span className="text-indigo-600 font-bold ml-1">{data?.total?.toLocaleString() || "0"} total</span>
                    </p>
                </div>
                <form onSubmit={handleSearch} className="relative">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search name, email or username..."
                        className="pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm outline-none w-full md:w-72 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all" />
                </form>
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
                                {["User", "Username", "Email", "Roles", "Status", "Joined", "Actions"].map(h => (
                                    <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data?.users?.length === 0 && !loading ? (
                                <tr><td colSpan={7} className="text-center py-16 text-slate-400 text-sm font-bold">No users found</td></tr>
                            ) : data?.users?.map((u) => (
                                <tr key={u._id} className={`hover:bg-slate-50/70 transition-colors ${u.isSuspended ? "opacity-60" : ""}`}>
                                    {/* User */}
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                                                style={{ background: u.isSuspended ? "#94a3b8" : "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                                                {u.name?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm leading-tight">{u.name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">{u._id?.slice(-8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Username */}
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">@{u.username}</span>
                                    </td>
                                    {/* Email */}
                                    <td className="px-5 py-3.5">
                                        <p className="text-sm text-slate-600 font-medium">{u.email}</p>
                                        <p className="text-xs text-slate-400">{u.phone || "No phone"}</p>
                                    </td>
                                    {/* Roles */}
                                    <td className="px-5 py-3.5">
                                        <div className="flex flex-wrap gap-1.5">
                                            {ROLE_LABELS.map(r => (
                                                <button key={r.key} onClick={() => startRoleToggle(u, r.key)}
                                                    className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border transition-all cursor-pointer ${u[r.key] ? r.on : r.off}`}>
                                                    {r.label}
                                                </button>
                                            ))}
                                            {!u.isSupplier && !u.isVendor && (
                                                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded border bg-slate-50 text-slate-400 border-slate-200">Buyer</span>
                                            )}
                                        </div>
                                    </td>
                                    {/* Status */}
                                    <td className="px-5 py-3.5">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${u.isSuspended ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                                            {u.isSuspended ? "Suspended" : "Active"}
                                        </span>
                                    </td>
                                    {/* Joined */}
                                    <td className="px-5 py-3.5">
                                        <p className="text-xs font-bold text-slate-700">{new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                                    </td>
                                    {/* Actions */}
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => startSuspend(u)} title={u.isSuspended ? "Activate" : "Suspend"}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105 ${u.isSuspended ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"}`}>
                                                {u.isSuspended ? <FiCheckCircle size={13} /> : <FiSlash size={13} />}
                                            </button>
                                            <button onClick={() => startDelete(u)} title="Delete User"
                                                className="w-8 h-8 rounded-lg flex items-center justify-center border bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100 transition-all hover:scale-105">
                                                <FiTrash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 bg-slate-50/40 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400">Page {data.page} of {data.totalPages}</p>
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
