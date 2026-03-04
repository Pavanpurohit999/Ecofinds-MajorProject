import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiXCircle, FiX } from "react-icons/fi";

export default function AdminToast({ toast, onClose }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (toast) {
            setVisible(true);
            const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, 3500);
            return () => clearTimeout(t);
        }
    }, [toast, onClose]);

    if (!toast) return null;
    const isSuccess = toast.type === "success";

    return (
        <div className="fixed bottom-6 right-6 z-[100] transition-all duration-300"
            style={{ transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.96)", opacity: visible ? 1 : 0 }}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl min-w-[260px] max-w-sm bg-white border
                ${isSuccess ? "border-emerald-200 shadow-emerald-100/80" : "border-rose-200 shadow-rose-100/80"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isSuccess ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                    {isSuccess ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
                </div>
                <p className="text-sm font-semibold text-slate-800 flex-1 leading-snug">{toast.message}</p>
                <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all flex-shrink-0">
                    <FiX size={12} />
                </button>
            </div>
        </div>
    );
}
