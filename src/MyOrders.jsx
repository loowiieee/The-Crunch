import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useCart } from "./useCart";
import { subscribeToUserOrders } from "./Orders_Service";
import { useNotifications } from "./useNotifications";

const PH = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%23aaa'%3E?%3C/text%3E%3C/svg%3E";

const STATUS_STYLES = {
    Pending:   { bg: "#fff8e1", color: "#f59e0b", border: "#f59e0b" },
    Preparing: { bg: "#e0f2fe", color: "#0284c7", border: "#0284c7" },
    Ready:     { bg: "#dcfce7", color: "#16a34a", border: "#16a34a" },
    Delivered: { bg: "#f3f4f6", color: "#6b7280", border: "#9ca3af" },
};

const STATUS_ICONS = {
    Pending: "🕐",
    Preparing: "👨‍🍳",
    Ready: "✅",
    Delivered: "📦",
};

const MyOrders = () => {
    const { currentUser } = useAuth();
    const { addToCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [indexError, setIndexError] = useState(false);

    useNotifications({ userId: currentUser?.uid, role: "customer" });

    useEffect(() => {
        if (!currentUser) { navigate("/auth"); return; }

        const unsubscribe = subscribeToUserOrders(
            currentUser.uid,
            (data) => {
                setOrders(data);
                setLoading(false);
                setIndexError(false);
            },
            (error) => {
                console.error("Orders listener error:", error);
                setLoading(false);
                if (error?.code === "failed-precondition" || error?.message?.includes("index")) {
                    setIndexError(true);
                }
            }
        );
        return () => unsubscribe();
    }, [currentUser, navigate]);

    const handleReorder = (order) => {
        clearCart();
        order.items.forEach(item => {
            for (let i = 0; i < item.qty; i++) 
                addToCart(item);
        });
        navigate("/cart");
    };

    const formatDate = (ts) => {
        if (!ts) return "—";
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString("en-PH", {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    const orderTypeIcon = { "Dine In": "🍽️", "Pick-Up": "🏃", "Delivery": "🛵" };

    return (
        <div style={o.page}>
            <div style={o.container}>
                <div style={o.header}>
                    <div>
                        <h1 style={o.title}>MY ORDERS</h1>
                        <p style={o.subtitle}>
                            {currentUser?.name ? `HI, ${currentUser.name.toUpperCase()} — ` : ""}
                            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
                        </p>
                    </div>
                    <button style={o.menuBtn} onClick={() => navigate("/menu")}>
                        + NEW ORDER
                    </button>
                </div>

                {indexError && (
                    <div style={o.errorBanner}>
                        <strong>⚠️ Setup Required:</strong> A Firestore index is missing.
                        Check the browser console for a link to create it automatically.
                        Orders will load correctly once the index is built (~1–2 min).
                    </div>
                )}

                {loading ? (
                    <div style={o.loading}>
                        <span style={{ fontSize: 36 }}>⏳</span>
                        <p style={o.loadingText}>Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div style={o.empty}>
                        <span style={{ fontSize: 56 }}>🛒</span>
                        <p style={o.emptyTitle}>No orders yet</p>
                        <p style={o.emptyHint}>Place your first order from the menu!</p>
                        <button style={o.menuBtn} onClick={() => navigate("/menu")}>GO TO MENU</button>
                    </div>
                ) : (
                    <div style={o.list}>
                        {orders.map((order) => {
                            const st = STATUS_STYLES[order.status] || STATUS_STYLES.Pending;
                            const expanded = expandedId === order.id;

                            return (
                                <div key={order.id} style={o.card}>
                                    <div style={o.cardTop}>
                                        <div style={o.cardLeft}>
                                            <span style={{
                                                ...o.statusBadge,
                                                backgroundColor: st.bg,
                                                color: st.color,
                                                border: `2px solid ${st.border}`,
                                            }}>
                                                {STATUS_ICONS[order.status] || "⏳"} {(order.status || "Pending").toUpperCase()}
                                            </span>
                                            <span style={o.orderDate}>{formatDate(order.createdAt)}</span>
                                        </div>
                                        <div style={o.cardRight}>
                                            <span style={o.orderTypeBadge}>
                                                {orderTypeIcon[order.orderType] || "🛒"} {order.orderType}
                                            </span>
                                            <span style={o.orderTotal}>₱{order.total?.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div style={o.itemPreview}>
                                        {order.items?.slice(0, 3).map((item, i) => (
                                            <div key={i} style={o.previewItem}>
                                                <img
                                                    src={item.imageUrl || PH}
                                                    alt={item.name}
                                                    style={o.previewImg}
                                                    onError={e => { e.target.src = PH; }}
                                                />
                                                <span style={o.previewName}>{item.name}</span>
                                                <span style={o.previewQty}>×{item.qty}</span>
                                            </div>
                                        ))}
                                        {order.items?.length > 3 && (
                                            <span style={o.moreItems}>+{order.items.length - 3} more</span>
                                        )}
                                    </div>

                                    {expanded && (
                                        <div style={o.expandedSection}>
                                            <div style={o.expandedDivider} />
                                            <div style={o.fullItemsList}>
                                                {order.items?.map((item, i) => (
                                                    <div key={i} style={o.fullItem}>
                                                        <img
                                                            src={item.imageUrl || PH}
                                                            alt={item.name}
                                                            style={o.fullItemImg}
                                                            onError={e => { e.target.src = PH; }}
                                                        />
                                                        <span style={o.fullItemName}>{item.name}</span>
                                                        <span style={o.fullItemQty}>×{item.qty}</span>
                                                        <span style={o.fullItemPrice}>₱{(item.price * item.qty).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={o.breakdown}>
                                                <div style={o.breakdownRow}>
                                                    <span style={o.breakdownLabel}>Subtotal</span>
                                                    <span style={o.breakdownValue}>₱{order.subtotal?.toFixed(2)}</span>
                                                </div>
                                                <div style={o.breakdownRow}>
                                                </div>
                                                {order.deliveryFee > 0 && (
                                                    <div style={o.breakdownRow}>
                                                        <span style={o.breakdownLabel}>Delivery Fee</span>
                                                        <span style={o.breakdownValue}>₱{order.deliveryFee?.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {order.orderType === "Delivery" && order.deliveryAddress && (
                                                    <div style={{ ...o.breakdownRow, marginTop: "8px" }}>
                                                        <span style={o.breakdownLabel}>Address</span>
                                                        <span style={{ ...o.breakdownValue, fontSize: "12px", maxWidth: "200px", textAlign: "right" }}>
                                                            {order.deliveryAddress}
                                                        </span>
                                                    </div>
                                                )}
                                                <div style={o.breakdownDivider} />
                                                <div style={o.breakdownRow}>
                                                    <span style={o.breakdownTotal}>TOTAL</span>
                                                    <span style={o.breakdownTotalVal}>₱{order.total?.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div style={o.cardFooter}>
                                        <button
                                            style={o.detailsBtn}
                                            onClick={() => setExpandedId(expanded ? null : order.id)}
                                        >
                                            {expanded ? "▲ HIDE DETAILS" : "▼ VIEW DETAILS"}
                                        </button>
                                        <button style={o.reorderBtn} onClick={() => handleReorder(order)}>
                                            🔁 REORDER
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const o = {
    // ── FIX: pull page up behind navbar, compensate with padding-top ──
    page: {
        backgroundColor: "#f8f8f8",
        minHeight: "100vh",
        marginTop: "-80px",
        paddingTop: "calc(80px + 40px)",
        paddingBottom: "60px",
    },
    container: { maxWidth: "800px", margin: "0 auto", padding: "0 24px" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px", borderBottom: "4px solid #1A1A1A", paddingBottom: "20px" },
    title: { fontFamily: "'Oswald', sans-serif", fontSize: "52px", fontWeight: "900", color: "#1A1A1A", margin: "0 0 4px" },
    subtitle: { fontFamily: "'Public Sans', sans-serif", fontWeight: "700", fontSize: "13px", color: "#888", margin: 0, letterSpacing: "0.5px" },
    menuBtn: { backgroundColor: "#FFC72C", border: "3px solid #1A1A1A", boxShadow: "4px 4px 0 #1A1A1A", padding: "12px 24px", fontFamily: "'Oswald', sans-serif", fontWeight: "900", fontSize: "15px", cursor: "pointer", color: "#1A1A1A", letterSpacing: "0.5px", flexShrink: 0 },
    errorBanner: { backgroundColor: "#fff3cd", border: "2px solid #f59e0b", padding: "14px 18px", marginBottom: "24px", fontFamily: "'Public Sans', sans-serif", fontSize: "13px", color: "#92400e", lineHeight: "1.5" },
    loading: { textAlign: "center", paddingTop: "80px" },
    loadingText: { fontFamily: "'Oswald', sans-serif", fontSize: "18px", color: "#aaa", marginTop: "12px" },
    empty: { textAlign: "center", paddingTop: "80px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
    emptyTitle: { fontFamily: "'Oswald', sans-serif", fontSize: "28px", fontWeight: "900", color: "#1A1A1A", margin: 0 },
    emptyHint: { fontFamily: "'Public Sans', sans-serif", fontSize: "14px", color: "#aaa", margin: 0 },
    list: { display: "flex", flexDirection: "column", gap: "20px" },
    card: { backgroundColor: "#fff", border: "3px solid #1A1A1A", boxShadow: "5px 5px 0 #1A1A1A", overflow: "hidden" },
    cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 20px 12px", borderBottom: "2px solid #f0f0f0", flexWrap: "wrap", gap: "8px" },
    cardLeft: { display: "flex", flexDirection: "column", gap: "6px" },
    cardRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" },
    statusBadge: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", fontFamily: "'Public Sans', sans-serif", fontWeight: "900", fontSize: "11px", letterSpacing: "0.5px", alignSelf: "flex-start" },
    orderDate: { fontFamily: "'Public Sans', sans-serif", fontSize: "11px", color: "#aaa", fontWeight: "600" },
    orderTypeBadge: { fontFamily: "'Public Sans', sans-serif", fontWeight: "700", fontSize: "12px", color: "#555" },
    orderTotal: { fontFamily: "'Oswald', sans-serif", fontSize: "22px", fontWeight: "900", color: "#1A1A1A" },
    itemPreview: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px", flexWrap: "wrap" },
    previewItem: { display: "flex", alignItems: "center", gap: "6px" },
    previewImg: { width: "36px", height: "36px", objectFit: "cover", border: "1.5px solid #1A1A1A" },
    previewName: { fontFamily: "'Public Sans', sans-serif", fontWeight: "700", fontSize: "12px", color: "#1A1A1A" },
    previewQty: { fontFamily: "'Oswald', sans-serif", fontSize: "12px", color: "#888", marginRight: "4px" },
    moreItems: { fontFamily: "'Public Sans', sans-serif", fontSize: "11px", color: "#aaa", fontWeight: "700", marginLeft: "4px" },
    expandedSection: { padding: "0 20px 16px" },
    expandedDivider: { borderTop: "2px dashed #e0e0e0", margin: "0 0 16px" },
    fullItemsList: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" },
    fullItem: { display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #f5f5f5" },
    fullItemImg: { width: "44px", height: "44px", objectFit: "cover", border: "2px solid #1A1A1A", flexShrink: 0 },
    fullItemName: { flex: 1, fontFamily: "'Oswald', sans-serif", fontSize: "14px", fontWeight: "700", color: "#1A1A1A" },
    fullItemQty: { fontFamily: "'Public Sans', sans-serif", fontSize: "12px", color: "#888", fontWeight: "700" },
    fullItemPrice: { fontFamily: "'Oswald', sans-serif", fontSize: "15px", fontWeight: "900", color: "#1A1A1A", minWidth: "70px", textAlign: "right" },
    breakdown: { backgroundColor: "#fafafa", border: "1.5px solid #e0e0e0", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "6px" },
    breakdownRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    breakdownLabel: { fontFamily: "'Public Sans', sans-serif", fontSize: "12px", color: "#888", fontWeight: "700" },
    breakdownValue: { fontFamily: "'Oswald', sans-serif", fontSize: "13px", fontWeight: "700", color: "#1A1A1A" },
    breakdownDivider: { borderTop: "1.5px dashed #ccc", margin: "4px 0" },
    breakdownTotal: { fontFamily: "'Oswald', sans-serif", fontSize: "16px", fontWeight: "900", color: "#1A1A1A" },
    breakdownTotalVal: { fontFamily: "'Oswald', sans-serif", fontSize: "20px", fontWeight: "900", color: "#1A1A1A" },
    cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: "2px solid #f0f0f0", backgroundColor: "#fafafa" },
    detailsBtn: { background: "none", border: "none", fontFamily: "'Public Sans', sans-serif", fontWeight: "900", fontSize: "11px", color: "#888", cursor: "pointer", letterSpacing: "0.5px", padding: 0 },
    reorderBtn: { backgroundColor: "#FFC72C", border: "2px solid #1A1A1A", boxShadow: "3px 3px 0 #1A1A1A", padding: "8px 18px", fontFamily: "'Oswald', sans-serif", fontWeight: "900", fontSize: "13px", cursor: "pointer", color: "#1A1A1A", letterSpacing: "0.5px" },
};

export default MyOrders;