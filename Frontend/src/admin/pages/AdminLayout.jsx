import React, { useState } from "react";
import { NavLink, useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import AdminOverviewPage from "./AdminOverviewPage";
import AdminUsersPage from "./AdminUsersPage";
import AdminProductsPage from "./AdminProductsPage";
import AdminOrdersPage from "./AdminOrdersPage";
import AdminEnvironmentPage from "./AdminEnvironmentPage";
import {
    FiGrid,
    FiUsers,
    FiPackage,
    FiShoppingCart,
    FiLogOut,
    FiChevronLeft,
    FiChevronRight,
    FiMenu
} from "react-icons/fi";

import { FaLeaf } from "react-icons/fa";
const NAV = [
    { to: "overview", icon: <FiGrid />, label: "Overview" },
    { to: "users", icon: <FiUsers />, label: "Users" },
    { to: "products", icon: <FiPackage />, label: "Products" },
    { to: "orders", icon: <FiShoppingCart />, label: "Orders" },
    { to: "environment", icon: <FaLeaf />, label: "Eco Impact" },
];

export default function AdminLayout() {
    const { admin, adminLogout } = useAdminAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = async () => {
        await adminLogout();
        navigate("/admin/login");
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans antialiased text-slate-900">
            {/* Sidebar */}
            <aside
                className={`flex flex-col border-r border-slate-200 transition-all duration-300 ease-in-out z-30 bg-slate-900 text-slate-300 shadow-xl`}
                style={{
                    width: sidebarOpen ? 260 : 80,
                    minHeight: "100vh",
                    flexShrink: 0,
                }}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
                    <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                            <FaLeaf className="text-white text-xl" />
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden transition-all duration-300 whitespace-nowrap">
                                <h1 className="text-white font-bold text-lg leading-tight tracking-tight">EcoFinds</h1>
                                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Admin Control</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Toggle Button - Fixed positioning for better access */}
                <div className="absolute top-20 -right-4 z-40">
                    <button
                        onClick={() => setSidebarOpen((o) => !o)}
                        className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-emerald-600 shadow-md hover:shadow-lg transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
                        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        {sidebarOpen ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-8 space-y-2 px-3">
                    {NAV.map((item) => (
                        <NavLink
                            key={item.to}
                            to={`/admin/${item.to}`}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative
                                ${isActive
                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`
                            }
                        >
                            <span className="text-xl flex-shrink-0 transition-transform group-hover:scale-110">
                                {item.icon}
                            </span>
                            {sidebarOpen && (
                                <span className="whitespace-nowrap opacity-100 transition-opacity duration-300">
                                    {item.label}
                                </span>
                            )}
                            {!sidebarOpen && (
                                <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Admin Footer */}
                <div className="p-4 border-t border-slate-800/50">
                    {sidebarOpen && (
                        <div className="mb-4 px-2 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Authenticated Admin</p>
                            <p className="text-sm text-white font-bold truncate">{admin?.name || "Administrator"}</p>
                            <p className="text-xs text-slate-400 truncate opacity-60">{admin?.email}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200
                            ${sidebarOpen
                                ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                                : "text-slate-400 hover:text-red-500 justify-center"}`}
                    >
                        <FiLogOut className="text-lg flex-shrink-0" />
                        {sidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Topbar/Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-20 shadow-sm shadow-slate-100">
                    <div className="flex items-center gap-4">
                        <button
                            className="text-slate-400 hover:text-slate-600 md:hidden"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <FiMenu size={24} />
                        </button>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                            {NAV.find(n => window.location.pathname.includes(n.to))?.label || "Admin Console"}
                        </h2>
                    </div>
                </header>

                {/* Content Container */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-8">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <Routes>
                            <Route index element={<Navigate to="overview" replace />} />
                            <Route path="overview" element={<AdminOverviewPage />} />
                            <Route path="users" element={<AdminUsersPage />} />
                            <Route path="products" element={<AdminProductsPage />} />
                            <Route path="orders" element={<AdminOrdersPage />} />
                            <Route path="environment" element={<AdminEnvironmentPage />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
}
