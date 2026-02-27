import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
    FiLock,
    FiMail,
    FiEye,
    FiEyeOff,
    FiShield,
    FiArrowRight,
    FiAlertCircle,
} from "react-icons/fi";

import { FaLeaf } from "react-icons/fa";
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
        <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans antialiased relative overflow-hidden">
            {/* High-end ambient background with blur effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
                <div className="absolute bottom-[0%] right-[0%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md mx-6 animate-in fade-in zoom-in duration-700">
                {/* Brand Identity */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] mb-6 shadow-2xl shadow-emerald-500/20 bg-gradient-to-br from-emerald-400 to-emerald-600 border border-emerald-400/20">
                        <FaLeaf className="text-white text-3xl" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">EcoFinds</h1>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Guardian Control Plane</p>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                </div>

                {/* Login Terminal */}
                <div className="rounded-[2.5rem] p-10 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-3xl">
                    <div className="mb-10">
                        <h2 className="text-2xl font-black text-white tracking-tight">System Access</h2>
                        <p className="text-slate-400 text-sm font-medium mt-1">Authenticate to bypass the firewall</p>
                    </div>

                    {error && (
                        <div className="mb-8 px-5 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                            <FiAlertCircle className="flex-shrink-0 text-lg" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terminal ID</label>
                            <div className="relative group">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="admin@ecofinds.com"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-600 text-sm font-semibold outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
                            <div className="relative group">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-600 text-sm font-semibold outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Syncing...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Initialise Session</span>
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-center gap-2">
                        <FiShield className="text-emerald-500/50" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">AES-256 Bit Encrypted</span>
                    </div>
                </div>

                {/* Version Control Tag */}
                <div className="mt-8 text-center">
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Build 2.4.0 • EcoFinds Core</p>
                </div>
            </div>
        </div>
    );
}
