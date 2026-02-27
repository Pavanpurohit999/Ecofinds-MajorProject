import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

// Animated counter hook
function useCountUp(target, duration = 2000, started = false) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!started || !target) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start = Math.min(start + step, target);
            setValue(Math.floor(start));
            if (start >= target) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration, started]);
    return value;
}

// Intersection observer hook
function useVisible() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return [ref, visible];
}

const MetricCard = ({ icon, value, unit, label, sublabel, color, started }) => {
    const displayed = useCountUp(typeof value === "number" ? value : 0, 2000, started);
    return (
        <div className="rounded-3xl p-8 text-white text-center shadow-xl relative overflow-hidden" style={{ background: color }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: "white", transform: "translate(40%, -40%)" }} />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10" style={{ background: "white", transform: "translate(-30%, 30%)" }} />
            <div className="relative z-10">
                <div className="text-5xl mb-4">{icon}</div>
                <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-extrabold tracking-tight">
                        {typeof value === "number" ? displayed.toLocaleString() : value}
                    </span>
                    {unit && <span className="text-xl font-semibold opacity-80">{unit}</span>}
                </div>
                <p className="text-lg font-semibold mt-2 opacity-95">{label}</p>
                {sublabel && <p className="text-sm opacity-70 mt-1">{sublabel}</p>}
            </div>
        </div>
    );
};

export default function EnvironmentPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsRef, statsVisible] = useVisible();

    useEffect(() => {
        fetch(`${API_BASE}/admin/environment/public`, { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setData(d.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const s = data?.summary || {};

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main>
                {/* Hero */}
                <section className="relative overflow-hidden py-24 px-4" style={{ background: "linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)" }}>
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #86efac, transparent)" }} />
                        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #f97316, transparent)" }} />
                    </div>
                    <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
                            <span>🌱</span> Real-time Environmental Dashboard
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                            EcoFinds is Fighting<br /><span style={{ color: "#86efac" }}>E-Waste Together</span>
                        </h1>
                        <p className="text-xl opacity-80 max-w-2xl mx-auto leading-relaxed">
                            Every refurbished phone sold on EcoFinds is one less device in a landfill. Here's the real-world impact our community is making together.
                        </p>
                    </div>
                </section>

                {/* Key metrics */}
                <section ref={statsRef} className="py-20 px-4" style={{ background: "#f0fdf4" }}>
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold" style={{ color: "#14532d" }}>Our Collective Impact</h2>
                            <p className="text-gray-500 mt-2">Based on all refurbished and used products sold through EcoFinds</p>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-16">
                                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MetricCard
                                    icon="♻️"
                                    value={s.totalItemsSaved}
                                    label="Items Saved from Waste"
                                    sublabel="Devices given a second life"
                                    color="linear-gradient(135deg, #15803d, #166534)"
                                    started={statsVisible}
                                />
                                <MetricCard
                                    icon="🗑️"
                                    value={s.totalWasteKgPrevented}
                                    unit="kg"
                                    label="Waste Prevented"
                                    sublabel="E-waste diverted from landfill"
                                    color="linear-gradient(135deg, #0891b2, #0e7490)"
                                    started={statsVisible}
                                />
                                <MetricCard
                                    icon="🌍"
                                    value={s.totalCO2KgSaved}
                                    unit="kg CO₂"
                                    label="Carbon Saved"
                                    sublabel="Avoided manufacturing emissions"
                                    color="linear-gradient(135deg, #7c3aed, #6d28d9)"
                                    started={statsVisible}
                                />
                            </div>
                        )}
                    </div>
                </section>

                {/* Platform stats */}
                {!loading && (s.totalEcoListings > 0 || s.totalListedRefurbished > 0) && (
                    <section className="py-16 px-4 bg-white">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "#14532d" }}>Active Eco Listings on Platform</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="rounded-2xl p-6 text-center border-2" style={{ borderColor: "#bbf7d0" }}>
                                    <p className="text-4xl font-bold" style={{ color: "#16a34a" }}>{s.totalListedRefurbished?.toLocaleString() || 0}</p>
                                    <p className="text-gray-600 font-medium mt-2">Refurbished Listings</p>
                                    <p className="text-gray-400 text-sm">Restored & ready to reuse</p>
                                </div>
                                <div className="rounded-2xl p-6 text-center border-2" style={{ borderColor: "#fed7aa" }}>
                                    <p className="text-4xl font-bold" style={{ color: "#ea580c" }}>{s.totalListedUsed?.toLocaleString() || 0}</p>
                                    <p className="text-gray-600 font-medium mt-2">Used Item Listings</p>
                                    <p className="text-gray-400 text-sm">Pre-loved, still valuable</p>
                                </div>
                                <div className="rounded-2xl p-6 text-center border-2" style={{ borderColor: "#c4b5fd" }}>
                                    <p className="text-4xl font-bold" style={{ color: "#7c3aed" }}>{s.totalEcoListings?.toLocaleString() || 0}</p>
                                    <p className="text-gray-600 font-medium mt-2">Total Eco Listings</p>
                                    <p className="text-gray-400 text-sm">Combined eco-friendly items</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Category breakdown */}
                {!loading && data?.breakdown?.length > 0 && (
                    <section className="py-16 px-4" style={{ background: "#f0fdf4" }}>
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold text-center mb-2" style={{ color: "#14532d" }}>Impact by Category</h2>
                            <p className="text-gray-500 text-center text-sm mb-10">Breakdown of waste prevented per product category</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.breakdown.map((cat) => (
                                    <div key={cat.category} className="rounded-2xl p-5 bg-white shadow-sm border" style={{ borderColor: "#bbf7d0" }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="font-semibold text-gray-700 text-sm">{cat.category}</p>
                                            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "#dcfce7", color: "#15803d" }}>
                                                {cat.itemsSaved} items
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>🗑️ Waste prevented</span>
                                                <span className="font-semibold text-blue-600">{cat.wasteKgPrevented?.toFixed(2)} kg</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>🌍 CO₂ saved</span>
                                                <span className="font-semibold text-purple-600">{cat.co2KgSaved?.toFixed(2)} kg</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* If no data yet */}
                {!loading && (!data?.summary?.totalItemsSaved || data.summary.totalItemsSaved === 0) && (
                    <section className="py-24 px-4 text-center bg-white">
                        <div className="max-w-lg mx-auto">
                            <div className="text-7xl mb-6">🌱</div>
                            <h2 className="text-2xl font-bold text-gray-700 mb-3">The Journey Begins</h2>
                            <p className="text-gray-400">As refurbished and used products are sold on EcoFinds, their environmental impact will appear here. Start by listing your old devices!</p>
                            <a href="/add-item" className="inline-block mt-6 px-6 py-3 rounded-xl text-white font-semibold" style={{ background: "#16a34a" }}>
                                List an Item
                            </a>
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section className="py-20 px-4" style={{ background: "linear-gradient(135deg, #14532d, #166534)" }}>
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Be Part of the Solution</h2>
                        <p className="text-lg opacity-80 mb-8">Sell your old phones and electronics on EcoFinds instead of letting them collect dust or end up in landfills.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/add-item" className="px-8 py-3 rounded-xl font-semibold text-green-900 transition-all hover:shadow-lg" style={{ background: "#86efac" }}>
                                Sell Your Device
                            </a>
                            <a href="/products" className="px-8 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-all">
                                Browse Refurbished
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
