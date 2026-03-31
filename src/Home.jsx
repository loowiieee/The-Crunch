import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProducts } from "./Product_Service";
import { imageMap } from "./assets/imageMap";

// ── Reusable animated counter ──────────────────────────────────────────────
const useCountUp = (target, duration = 1200) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return count;
};

// ── Stats bar ──────────────────────────────────────────────────────────────
const statData = [
    { value: 12, suffix: "+", label: "Signature Flavors" },
    { value: 50, suffix: "K+", label: "Orders Served" },
    { value: 4, suffix: ".9★", label: "Average Rating" },
    { value: 100, suffix: "%", label: "Boneless Guaranteed" },
];

const StatItem = ({ value, suffix, label }) => {
    const count = useCountUp(value);
    return (
        <div style={s.statItem}>
            <span style={s.statNum}>
                {count}
                {suffix}
            </span>
            <span style={s.statLabel}>{label}</span>
        </div>
    );
};

const StatBar = () => (
    <div style={s.statBar}>
        {statData.map((st) => (
            <StatItem
                key={st.label}
                value={st.value}
                suffix={st.suffix}
                label={st.label}
            />
        ))}
    </div>
);

// ── Features section ───────────────────────────────────────────────────────
const features = [
    {
        icon: "🔥",
        title: "Double-Crunch Batter",
        desc: "Our proprietary batter is fried twice for an unmatched shatter-crunch on every bite.",
    },
    {
        icon: "🍗",
        title: "100% Boneless",
        desc: "Every piece is carefully deboned so you get all the crunch, none of the fuss.",
    },
    {
        icon: "🌶️",
        title: "Bold Flavors",
        desc: "From Classic to Spicy K-Style — 12+ signature sauces crafted in-house daily.",
    },
    {
        icon: "⚡",
        title: "Freshly Fried",
        desc: "Never frozen. Every order is fried fresh to order so it hits hot every time.",
    },
];

// ── Main component ─────────────────────────────────────────────────────────
const Home = () => {
    const [bestSellers, setBestSellers] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const all = await getProducts();
                setBestSellers(all.filter((p) => p.available).slice(0, 4));
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingProducts(false);
            }
        };
        load();
    }, []);

    return (
        <div style={s.page}>
            <style>{`
                @keyframes marquee { from{transform:translateX(0)}to{transform:translateX(-50%)} }
                .marquee-track { animation: marquee 22s linear infinite; }
                @keyframes fadeUp { from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)} }
                .fu1{animation:fadeUp .5s .1s ease both}
                .fu2{animation:fadeUp .5s .25s ease both}
                .fu3{animation:fadeUp .5s .4s ease both}
                .fu4{animation:fadeUp .5s .55s ease both}
                .fu5{animation:fadeUp .5s .7s ease both}
                .card-hover{transition:transform .2s ease,box-shadow .2s ease}
                .card-hover:hover{transform:translateY(-6px);box-shadow:12px 16px 0px #1A1A1A !important}
                .btn-primary:hover{background:#333;box-shadow:10px 10px 0px #fff}
                .btn-secondary:hover{background:#1A1A1A;color:#FFC72C}
                .feature-card:hover{background:#FFC72C}
                .feature-card:hover .feat-icon{transform:scale(1.2) rotate(-5deg)}
                .feat-icon{transition:transform .2s ease}
                a { text-decoration: none; color: inherit; outline: none; }
                a:focus { outline: none; }
                button:focus { outline: none; }
            `}</style>

            {/* ── HERO ── */}
            <section style={s.hero}>
                <div style={s.heroDots} aria-hidden="true" />

                <div style={s.heroContent}>
                    <div className="fu1" style={s.badge}>
                        ✦ BEST BONELESS IN TOWN ✦
                    </div>

                    <h1 className="fu2" style={s.heroTitle}>
                        CRISPY.
                        <br />
                        BOLD.
                        <br />
                        <span style={s.heroHighlight}>UNFORGETTABLE.</span>
                    </h1>

                    <p className="fu3" style={s.heroSub}>
                        Premium boneless fried chicken with our signature double-crunch
                        batter. Freshly fried, never frozen.
                    </p>

                    <div className="fu4" style={s.btnGroup}>
                        <Link to="/menu">
                            <button className="btn-primary" style={s.btnPrimary}>
                                ORDER NOW →
                            </button>
                        </Link>
                        <Link to="/menu">
                            <button className="btn-secondary" style={s.btnSecondary}>
                                VIEW FULL MENU
                            </button>
                        </Link>
                    </div>
                </div>

                <div style={s.heroSlant} />
            </section>

            {/* ── TICKER ── */}
            <div style={s.tickerWrap}>
                <div className="marquee-track" style={s.tickerTrack}>
                    {Array(3)
                        .fill([
                            "CRISPY",
                            "BOLD",
                            "BONELESS",
                            "DOUBLE-CRUNCH",
                            "FRESHLY FRIED",
                            "MAXIMUM FLAVOR",
                        ])
                        .flat()
                        .map((w, i) => (
                            <span key={i} style={s.tickerItem}>
                                {w} <span style={s.tickerDot}>✦</span>
                            </span>
                        ))}
                </div>
            </div>

            {/* ── STATS BAR ── */}
            <StatBar />

            {/* ── WHY THE CRUNCH ── */}
            <section style={s.section}>
                <div style={s.sectionHeader}>
                    <span style={s.sectionTag}>WHY CHOOSE US</span>
                    <h2 style={s.sectionTitle}>THE CRUNCH DIFFERENCE</h2>
                </div>

                <div style={s.featureGrid}>
                    {features.map((f, i) => (
                        <div key={i} className="feature-card" style={s.featureCard}>
                            <span className="feat-icon" style={s.featIcon}>
                                {f.icon}
                            </span>
                            <h3 style={s.featTitle}>{f.title}</h3>
                            <p style={s.featDesc}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── BEST SELLERS ── */}
            <section style={{ ...s.section, backgroundColor: "#1A1A1A" }}>
                <div style={s.sectionHeader}>
                    <span
                        style={{
                            ...s.sectionTag,
                            backgroundColor: "#FFC72C",
                            color: "#1A1A1A",
                        }}
                    >
                        CROWD FAVORITES
                    </span>
                    <h2 style={{ ...s.sectionTitle, color: "#FFC72C" }}>BEST SELLERS</h2>
                </div>

                {loadingProducts ? (
                    <p
                        style={{
                            color: "#FFC72C",
                            textAlign: "center",
                            fontFamily: "'Oswald', sans-serif",
                            fontSize: "20px",
                        }}
                    >
                        LOADING...
                    </p>
                ) : (
                    <div style={s.bsGrid}>
                        {bestSellers.map((p) => {
                            const img =
                                imageMap?.[p.name] ||
                                p.imageUrl ||
                                "https://via.placeholder.com/300x220?text=No+Image";
                            return (
                                <div key={p.id} className="card-hover" style={s.bsCard}>
                                    <div style={s.bsImgWrap}>
                                        <img src={img} alt={p.name} style={s.bsImg} />
                                        <span style={s.bsPrice}>₱{p.price}</span>
                                    </div>
                                    <div style={s.bsInfo}>
                                        <p style={s.bsCategory}>{p.category}</p>
                                        <h3 style={s.bsName}>{p.name}</h3>
                                        <p style={s.bsDesc}>{p.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div style={{ textAlign: "center", marginTop: "50px" }}>
                    <Link to="/menu">
                        <button
                            className="btn-primary"
                            style={{
                                ...s.btnPrimary,
                                fontSize: "16px",
                                boxShadow: "6px 6px 0px #FFC72C",
                            }}
                        >
                            SEE FULL MENU →
                        </button>
                    </Link>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section style={s.cta}>
                <h2 style={s.ctaTitle}>READY TO CRUNCH?</h2>
                <p style={s.ctaSub}>
                    Order now and taste the difference. Fresh, bold, unforgettable.
                </p>
            </section>
        </div>
    );
};

// ── Styles ─────────────────────────────────────────────────────────────────
const s = {
    page: {
        backgroundColor: "#F9F9F9",
        margin: 0,
        padding: 0,
        width: "100%",
        overflowX: "hidden",
    },
    hero: {
        minHeight: "100vh",
        marginTop: "-80px",
        backgroundColor: "#FFC72C",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        padding: "clamp(100px, 14vw, 140px) 20px clamp(80px, 14vw, 120px)",
    },
    heroDots: {
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(#1A1A1A22 1.5px, transparent 1.5px)",
        backgroundSize: "28px 28px",
        zIndex: 0,
    },
    heroContent: { maxWidth: "820px", zIndex: 2, position: "relative" },
    badge: {
        display: "inline-block",
        backgroundColor: "#1A1A1A",
        color: "#FFC72C",
        padding: "6px 12px",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "clamp(10px, 2vw, 13px)",
        letterSpacing: "2px",
        marginBottom: "clamp(12px, 4vw, 24px)",
        transform: "rotate(-1.5deg)",
    },
    heroTitle: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "clamp(48px, 10vw, 108px)",
        fontWeight: "900",
        lineHeight: "0.88",
        color: "#1A1A1A",
        margin: "0 0 clamp(12px, 3vw, 24px)",
    },
    heroHighlight: {
        color: "#fff",
        textShadow: "3px 3px 0px #1A1A1A",
        display: "block",
    },
    heroSub: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "clamp(14px, 3vw, 18px)",
        fontWeight: "600",
        color: "#1A1A1A",
        maxWidth: "480px",
        margin: "0 auto clamp(24px, 6vw, 40px)",
        lineHeight: "1.6",
    },
    heroSlant: {
        position: "absolute",
        bottom: "-40px",
        left: 0,
        width: "100%",
        height: "100px",
        backgroundColor: "#F9F9F9",
        transform: "skewY(-3deg)",
        zIndex: 1,
    },

    btnGroup: {
        display: "flex",
        gap: "clamp(8px, 3vw, 16px)",
        justifyContent: "center",
        flexWrap: "wrap",
    },
    btnPrimary: {
        backgroundColor: "#1A1A1A",
        color: "#FFC72C",
        padding: "clamp(12px, 3vw, 18px) clamp(20px, 5vw, 44px)",
        border: "none",
        fontFamily: "'Oswald', sans-serif",
        fontSize: "clamp(14px, 3vw, 20px)",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "4px 4px 0px #fff",
        transition: "background .2s, box-shadow .2s",
        letterSpacing: "1px",
        minHeight: "44px",
        display: "flex",
        alignItems: "center",
    },
    btnSecondary: {
        backgroundColor: "transparent",
        color: "#1A1A1A",
        padding: "clamp(12px, 3vw, 18px) clamp(20px, 5vw, 44px)",
        border: "3px solid #1A1A1A",
        fontFamily: "'Oswald', sans-serif",
        fontSize: "clamp(14px, 3vw, 20px)",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "background .2s, color .2s",
        letterSpacing: "1px",
        minHeight: "44px",
        display: "flex",
        alignItems: "center",
    },

    tickerWrap: {
        backgroundColor: "#1A1A1A",
        overflow: "hidden",
        borderTop: "3px solid #FFC72C",
        borderBottom: "3px solid #FFC72C",
        padding: "8px 0",
    },
    tickerTrack: { display: "flex", whiteSpace: "nowrap", width: "max-content" },
    tickerItem: {
        fontFamily: "'Oswald', sans-serif",
        color: "#FFC72C",
        fontSize: "clamp(12px, 2.5vw, 14px)",
        fontWeight: "700",
        letterSpacing: "2px",
        padding: "0 clamp(16px, 4vw, 28px)",
    },
    tickerDot: { color: "#fff" },

    statBar: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        backgroundColor: "#fff",
        borderBottom: "3px solid #1A1A1A",
        padding: "clamp(20px, 4vw, 30px) clamp(12px, 4vw, 32px)",
    },
    statItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "clamp(8px, 2vw, 10px)",
    },
    statNum: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "clamp(28px, 6vw, 42px)",
        fontWeight: "900",
        color: "#1A1A1A",
        lineHeight: "1",
    },
    statLabel: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "clamp(10px, 2vw, 13px)",
        fontWeight: "700",
        color: "#888",
        letterSpacing: "1px",
        marginTop: "4px",
        textTransform: "uppercase",
    },

    section: {
        padding: "clamp(50px, 10vw, 90px) clamp(12px, 4vw, 48px)",
        backgroundColor: "#F9F9F9",
    },
    sectionHeader: {
        textAlign: "center",
        marginBottom: "clamp(30px, 8vw, 60px)",
    },
    sectionTag: {
        display: "inline-block",
        backgroundColor: "#1A1A1A",
        color: "#FFC72C",
        padding: "6px 14px",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "clamp(10px, 2vw, 12px)",
        letterSpacing: "2px",
        marginBottom: "12px",
    },
    sectionTitle: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "clamp(32px, 8vw, 48px)",
        fontWeight: "900",
        color: "#1A1A1A",
        margin: 0,
    },

    featureGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "clamp(16px, 4vw, 24px)",
    },
    featureCard: {
        backgroundColor: "#fff",
        border: "3px solid #1A1A1A",
        padding: "clamp(20px, 5vw, 36px)",
        boxShadow: "4px 4px 0px #1A1A1A",
        transition: "background .2s",
        cursor: "default",
    },
    featIcon: {
        fontSize: "clamp(28px, 7vw, 40px)",
        display: "block",
        marginBottom: "12px",
    },
    featTitle: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "clamp(16px, 4vw, 22px)",
        color: "#1A1A1A",
        margin: "0 0 12px",
        textTransform: "uppercase",
    },
    featDesc: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "clamp(13px, 2vw, 14px)",
        color: "#555",
        lineHeight: "1.6",
        margin: 0,
    },

    bsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "clamp(16px, 4vw, 32px)",
    },
    bsCard: {
        backgroundColor: "#fff",
        border: "3px solid #FFC72C",
        boxShadow: "6px 6px 0px #FFC72C",
        overflow: "hidden",
    },
    bsImgWrap: {
        position: "relative",
        height: "auto",
        aspectRatio: "300 / 210",
        borderBottom: "3px solid #FFC72C",
        overflow: "hidden",
    },
    bsImg: { width: "100%", height: "100%", objectFit: "cover" },
    bsPrice: {
        position: "absolute",
        bottom: 0,
        left: 0,
        backgroundColor: "#FFC72C",
        color: "#1A1A1A",
        fontFamily: "'Oswald', sans-serif",
        fontSize: "clamp(16px, 4vw, 22px)",
        fontWeight: "900",
        padding: "6px 12px",
        border: "3px solid #1A1A1A",
        borderLeft: "none",
        borderBottom: "none",
    },
    bsInfo: { padding: "clamp(12px, 3vw, 20px)" },
    bsCategory: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "clamp(9px, 2vw, 11px)",
        fontWeight: "900",
        letterSpacing: "2px",
        color: "#FFC72C",
        margin: "0 0 6px",
        textTransform: "uppercase",
    },
    bsName: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "clamp(16px, 4vw, 22px)",
        color: "#1A1A1A",
        margin: "0 0 8px",
        textTransform: "uppercase",
    },
    bsDesc: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "clamp(12px, 2vw, 13px)",
        color: "#666",
        margin: 0,
        lineHeight: "1.6",
    },

    cta: {
        backgroundColor: "#FFC72C",
        padding: "clamp(50px, 10vw, 100px) clamp(12px, 6vw, 64px)",
        textAlign: "center",
        borderTop: "5px solid #1A1A1A",
    },
    ctaTitle: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "clamp(32px, 8vw, 72px)",
        fontWeight: "900",
        color: "#1A1A1A",
        margin: "0 0 clamp(12px, 3vw, 16px)",
    },
    ctaSub: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "clamp(14px, 3vw, 18px)",
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 0,
    },
};

export default Home;