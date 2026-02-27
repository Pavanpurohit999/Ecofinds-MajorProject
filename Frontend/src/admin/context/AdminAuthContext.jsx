import React, { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Restore admin from localStorage on mount
    useEffect(() => {
        const storedAdmin = localStorage.getItem("adminData");
        const storedToken = localStorage.getItem("adminToken");
        if (storedAdmin && storedToken) {
            setAdmin(JSON.parse(storedAdmin));
            setIsAdminAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const adminLogin = async (email, password) => {
        const res = await fetch(`${API_BASE}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");
        localStorage.setItem("adminToken", data.data.accessToken);
        localStorage.setItem("adminData", JSON.stringify(data.data.admin));
        setAdmin(data.data.admin);
        setIsAdminAuthenticated(true);
        return data.data;
    };

    const adminLogout = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            await fetch(`${API_BASE}/admin/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
        } catch (_) { }
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        setAdmin(null);
        setIsAdminAuthenticated(false);
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem("adminToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const adminFetch = async (path, options = {}) => {
        const res = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers: { "Content-Type": "application/json", ...getAuthHeaders(), ...(options.headers || {}) },
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Request failed");
        return data.data;
    };

    return (
        <AdminAuthContext.Provider value={{ admin, isAdminAuthenticated, isLoading, adminLogin, adminLogout, adminFetch }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error("useAdminAuth must be inside AdminAuthProvider");
    return ctx;
};
