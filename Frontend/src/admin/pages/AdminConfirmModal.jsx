import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

export default function AdminConfirmModal({ open, title, message, mode = "danger", onConfirm, onCancel, loading = false, confirmLabel = "Confirm" }) {
    if (!open) return null;

    const confirmBg = {
        danger: "bg-rose-600 hover:bg-rose-700 text-white",
        warning: "bg-amber-500 hover:bg-amber-600 text-white",
        info: "bg-indigo-600 hover:bg-indigo-700 text-white",
    };
    const iconStyle = {
        danger: "bg-rose-50 text-rose-500 border-rose-100",
        warning: "bg-amber-50 text-amber-500 border-amber-100",
        info: "bg-indigo-50 text-indigo-500 border-indigo-100",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 animate-in zoom-in-95 fade-in duration-150">
                <button onClick={onCancel}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                    <FiX size={16} />
                </button>
                <div className="flex items-start gap-4 mb-5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${iconStyle[mode]}`}>
                        <FiAlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900">{title}</h3>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{message}</p>
                    </div>
                </div>
                <div className="flex gap-2.5">
                    <button onClick={onCancel} disabled={loading}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm ${confirmBg[mode]}`}>
                        {loading && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
