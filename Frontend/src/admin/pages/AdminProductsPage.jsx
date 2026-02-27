import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";

const CATEGORIES = ["", "Cars", "Properties", "Mobiles", "Bikes", "Electronics & Appliances", "Commercial Vehicles & Spares", "Furniture", "Fashion", "Books, Sports & Hobbies", "Services"];
const CONDITIONS = ["", "New", "Used", "Refurbished"];

const conditionColor = { New: "bg-blue-100 text-blue-700", Used: "bg-yellow-100 text-yellow-700", Refurbished: "bg-green-100 text-green-700" };

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
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProducts(page, search, category, condition); }, [page, search, category, condition]);

    const handleSearch = (e) => { e.preventDefault(); setPage(1); setSearch(searchInput); };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                <p className="text-gray-500 text-sm">All listings · {data?.total?.toLocaleString() || "—"} total</p>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products..." className="px-4 py-2 rounded-xl border text-sm outline-none w-52" style={{ borderColor: "#d1fae5" }} />
                    <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#16a34a" }}>Search</button>
                </form>
                <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: "#d1fae5" }}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c || "All Categories"}</option>)}
                </select>
                <select value={condition} onChange={(e) => { setCondition(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: "#d1fae5" }}>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c || "All Conditions"}</option>)}
                </select>
            </div>

            <div className="rounded-2xl bg-white shadow-sm border overflow-hidden" style={{ borderColor: "#e7f5ec" }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: "#f0fdf4" }}>
                                {["Product", "Category", "Condition", "Price", "Sold", "Seller", "Listed"].map((h) => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-12"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                            ) : data?.products?.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No products found</td></tr>
                            ) : data?.products?.map((p) => (
                                <tr key={p._id} className="hover:bg-green-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {p.imageUrl ? (
                                                <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">📦</div>
                                            )}
                                            <span className="font-medium text-gray-700 max-w-[160px] truncate">{p.productTitle}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{p.productCategory}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${conditionColor[p.condition] || "bg-gray-100 text-gray-600"}`}>{p.condition}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 font-medium">₹{p.price?.toLocaleString("en-IN")}</td>
                                    <td className="px-4 py-3 text-gray-500">{p.soldCount || 0}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{p.userId?.username || p.userId?.name || "—"}</td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
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
