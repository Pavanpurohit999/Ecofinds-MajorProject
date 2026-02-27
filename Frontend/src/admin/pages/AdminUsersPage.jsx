import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";

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
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Users</h1>
                    <p className="text-gray-500 text-sm">Manage registered users · {data?.total?.toLocaleString() || "—"} total</p>
                </div>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by name, email, username..."
                        className="px-4 py-2 rounded-xl border text-sm outline-none w-64"
                        style={{ borderColor: "#d1fae5" }}
                    />
                    <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#16a34a" }}>
                        Search
                    </button>
                </form>
            </div>

            <div className="rounded-2xl bg-white shadow-sm border overflow-hidden" style={{ borderColor: "#e7f5ec" }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: "#f0fdf4" }}>
                                {["Name", "Username", "Email", "Phone", "Role", "Joined"].map((h) => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12">
                                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                </td></tr>
                            ) : data?.users?.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No users found</td></tr>
                            ) : data?.users?.map((u) => (
                                <tr key={u._id} className="hover:bg-green-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #16a34a, #f97316)" }}>
                                                {u.name?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            <span className="font-medium text-gray-700 truncate max-w-[140px]">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">@{u.username}</td>
                                    <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{u.email}</td>
                                    <td className="px-4 py-3 text-gray-500">{u.phone || "—"}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 flex-wrap">
                                            {u.isSupplier && <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">Supplier</span>}
                                            {u.isVendor && <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700 font-medium">Vendor</span>}
                                            {!u.isSupplier && !u.isVendor && <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">Buyer</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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
