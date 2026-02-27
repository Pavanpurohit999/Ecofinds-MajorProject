import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLoginPage() {
    const { adminLogin } = useAdminAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await adminLogin(email, password);
            navigate("/admin/overview");
        } catch (err) {
            setError(err.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f1f0f 0%, #1a3a1a 50%, #0d2b1a 100%)" }}>
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #4ade80, transparent)" }} />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #f97316, transparent)" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5" style={{ background: "radial-gradient(circle, #86efac, transparent)" }} />
            </div>

            <div className="relative w-full max-w-md mx-4">
                {/* Logo block */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                        <span className="text-3xl">🌿</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">EcoFinds</h1>
                    <p className="text-green-400 text-sm mt-1 font-medium tracking-widest uppercase">Admin Portal</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl p-8 shadow-2xl" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <h2 className="text-xl font-semibold text-white mb-2">Welcome back</h2>
                    <p className="text-gray-400 text-sm mb-8">Sign in to access the admin dashboard</p>

                    {error && (
                        <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin@ecofinds.com"
                                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all duration-200"
                                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                                onFocus={(e) => (e.target.style.borderColor = "#4ade80")}
                                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all duration-200 pr-12"
                                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                                    onFocus={(e) => (e.target.style.borderColor = "#4ade80")}
                                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
                            style={{ background: loading ? "#166534" : "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 4px 15px rgba(22,163,74,0.4)" }}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In to Dashboard"
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-500 mt-6">
                        🔒 Secured admin access • EcoFinds Platform
                    </p>
                </div>
            </div>
        </div>
    );
}
