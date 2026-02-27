import React, { useState } from "react";
import { NavLink, useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import AdminOverviewPage from "./AdminOverviewPage";
import AdminUsersPage from "./AdminUsersPage";
import AdminProductsPage from "./AdminProductsPage";
import AdminOrdersPage from "./AdminOrdersPage";
import AdminEnvironmentPage from "./AdminEnvironmentPage";

const NAV = [
    { to: "overview", icon: "📊", label: "Overview" },
    { to: "users", icon: "👥", label: "Users" },
    { to: "products", icon: "📦", label: "Products" },
    { to: "orders", icon: "🛒", label: "Orders" },
    { to: "environment", icon: "🌱", label: "Eco Impact" },
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
        <div className="min-h-screen flex" style={{ background: "#f0fdf4" }}>
            {/* Sidebar */}
            <aside
                className="flex flex-col transition-all duration-300"
                style={{
                    width: sidebarOpen ? 240 : 64,
                    background: "linear-gradient(180deg, #0f1f0f 0%, #1a3a1a 100%)",
                    minHeight: "100vh",
                    flexShrink: 0,
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                        <span className="text-lg">🌿</span>
                    </div>
                    {sidebarOpen && (
                        <div>
                            <p className="text-white font-bold text-sm leading-tight">EcoFinds</p>
                            <p className="text-green-400 text-xs">Admin Panel</p>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen((o) => !o)}
                        className="ml-auto text-gray-400 hover:text-white transition-colors"
                        title="Toggle sidebar"
                    >
                        {sidebarOpen ? "◀" : "▶"}
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-4 space-y-1 px-2">
                    {NAV.map((item) => (
                        <NavLink
                            key={item.to}
                            to={`/admin/${item.to}`}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-green-700 text-white shadow-md"
                                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                                }`
                            }
                            title={!sidebarOpen ? item.label : ""}
                        >
                            <span className="text-lg flex-shrink-0">{item.icon}</span>
                            {sidebarOpen && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Admin info + logout */}
                <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                    {sidebarOpen && (
                        <div className="mb-3 px-2">
                            <p className="text-xs text-gray-400">Logged in as</p>
                            <p className="text-sm text-white font-medium truncate">{admin?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                    >
                        <span>🚪</span>
                        {sidebarOpen && "Logout"}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <Routes>
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<AdminOverviewPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="environment" element={<AdminEnvironmentPage />} />
                </Routes>
            </main>
        </div>
    );
}
