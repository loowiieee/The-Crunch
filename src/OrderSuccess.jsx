import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OrderSuccess = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setVisible(true), 50);
        if (!state?.orderId && !state?.total) {
            const timer = setTimeout(() => navigate("/"), 5000);
            return () => clearTimeout(timer);
        }
    }, [navigate, state?.orderId, state?.total]);

    const { orderId, total, orderType, itemCount } = state || {};
    const orderTypeIcon = { "Dine In": "🍽️", "Pick-Up": "🏃", "Delivery": "🛵" }[orderType] || "🛒";
    const orderTypeMessage = {
        "Dine In": "Will be served at your table.",
        "Pick-Up": "Pick up at the counter when ready.",
        "Delivery": "On its way to you!",
    }[orderType] || "Order received.";

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

    return (
        <div style={s.page}>
            <div style={{
                ...s.receipt,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0) rotate(-0.3deg)" : "translateY(32px) rotate(-0.3deg)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
            }}>

                {/* Tear edge top */}
                <div style={s.tearTop} />

                {/* Header */}
                <div style={s.header}>
                    <p style={s.storeName}>THE CRUNCH</p>
                    <p style={s.storeTagline}>FRESHLY FRIED • BOLD FLAVOR</p>
                    <div style={s.headerDivider} />
                    <p style={s.dateTime}>{dateStr} — {timeStr}</p>
                </div>

                {/* Big check */}
                <div style={s.checkWrap}>
                    <div style={s.checkCircle}>
                        <span style={s.checkMark}>✓</span>
                    </div>
                    <p style={s.confirmedText}>ORDER CONFIRMED</p>
                </div>

                {/* Dashed divider */}
                <div style={s.dashedLine} />

                {/* Order details */}
                <div style={s.rows}>
                    {orderId && (
                        <div style={s.row}>
                            <span style={s.rowLabel}>ORDER #</span>
                            <span style={s.rowVal}>{orderId.slice(0, 8).toUpperCase()}</span>
                        </div>
                    )}
                    {orderType && (
                        <div style={s.row}>
                            <span style={s.rowLabel}>TYPE</span>
                            <span style={s.rowVal}>{orderTypeIcon} {orderType}</span>
                        </div>
                    )}
                    {itemCount && (
                        <div style={s.row}>
                            <span style={s.rowLabel}>ITEMS</span>
                            <span style={s.rowVal}>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                        </div>
                    )}
                    <div style={s.row}>
                        <span style={s.rowLabel}>STATUS</span>
                        <span style={{ ...s.rowVal, color: "#f59e0b", fontWeight: "900" }}>🕐 PENDING</span>
                    </div>
                </div>

                {/* Dashed divider */}
                <div style={s.dashedLine} />

                {/* Total */}
                {total && (
                    <div style={s.totalRow}>
                        <span style={s.totalLabel}>TOTAL</span>
                        <span style={s.totalVal}>₱{Number(total).toFixed(2)}</span>
                    </div>
                )}

                {/* Dashed divider */}
                <div style={s.dashedLine} />

                {/* Message */}
                <p style={s.message}>{orderTypeIcon} {orderTypeMessage}</p>
                <p style={s.thankYou}>THANK YOU FOR YOUR ORDER!</p>

                {/* Barcode decoration */}
                <div style={s.barcodeWrap}>
                    {Array.from({ length: 28 }).map((_, i) => (
                        <div key={i} style={{
                            ...s.barLine,
                            height: i % 3 === 0 ? "32px" : i % 5 === 0 ? "24px" : "40px",
                            width: i % 4 === 0 ? "3px" : "2px",
                            opacity: i % 7 === 0 ? 0.3 : 0.7,
                        }} />
                    ))}
                </div>
                <p style={s.barcodeText}>{orderId ? orderId.slice(0, 16).toUpperCase() : "THE-CRUNCH-POS"}</p>

                {/* Buttons */}
                <div style={s.btnCol}>
                    <button style={s.btnPrimary} onClick={() => navigate("/orders")}>
                        VIEW MY ORDERS
                    </button>
                    <button style={s.btnSecondary} onClick={() => navigate("/menu")}>
                        ORDER MORE
                    </button>
                    <button style={s.btnGhost} onClick={() => navigate("/")}>
                        ← Back to Home
                    </button>
                </div>

                {/* Tear edge bottom */}
                <div style={s.tearBottom} />
            </div>
        </div>
    );
};

const s = {
    // ── FIX: pull page up behind navbar, compensate with padding-top ──
    page: {
        minHeight: "100vh",
        backgroundColor: "#F0EEE8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "-80px",
        paddingTop: "calc(80px + 60px)",
        paddingBottom: "60px",
        paddingLeft: "20px",
        paddingRight: "20px",
        fontFamily: "'Public Sans', sans-serif",
        backgroundImage: "radial-gradient(#d0cec8 1px, transparent 1px)",
        backgroundSize: "20px 20px",
    },
    receipt: {
        backgroundColor: "#FFFDF7",
        width: "100%",
        maxWidth: "320px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "6px 6px 0 #1A1A1A, 12px 12px 0 #FFC72C",
        position: "relative",
    },

    tearTop: {
        width: "100%",
        height: "16px",
        backgroundImage: "radial-gradient(circle at 50% 0%, #F0EEE8 8px, #FFFDF7 8px)",
        backgroundSize: "20px 16px",
        backgroundRepeat: "repeat-x",
        flexShrink: 0,
    },
    tearBottom: {
        width: "100%",
        height: "16px",
        backgroundImage: "radial-gradient(circle at 50% 100%, #F0EEE8 8px, #FFFDF7 8px)",
        backgroundSize: "20px 16px",
        backgroundRepeat: "repeat-x",
        flexShrink: 0,
    },

    header: {
        textAlign: "center",
        padding: "8px 24px 0",
        width: "100%",
        boxSizing: "border-box",
    },
    storeName: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "28px",
        fontWeight: "900",
        color: "#1A1A1A",
        margin: "0 0 2px",
        letterSpacing: "4px",
    },
    storeTagline: {
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "700",
        fontSize: "9px",
        letterSpacing: "2px",
        color: "#aaa",
        margin: "0 0 12px",
    },
    headerDivider: {
        borderTop: "2px solid #1A1A1A",
        margin: "0 0 8px",
    },
    dateTime: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "10px",
        color: "#aaa",
        fontWeight: "700",
        margin: "0 0 8px",
        letterSpacing: "0.5px",
    },

    checkWrap: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px 0 8px",
        gap: "8px",
    },
    checkCircle: {
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "#FFC72C",
        border: "3px solid #1A1A1A",
        boxShadow: "3px 3px 0 #1A1A1A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    checkMark: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "28px",
        fontWeight: "900",
        color: "#1A1A1A",
        lineHeight: 1,
    },
    confirmedText: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "13px",
        fontWeight: "900",
        color: "#1A1A1A",
        letterSpacing: "2px",
        margin: 0,
    },

    dashedLine: {
        width: "calc(100% - 48px)",
        borderTop: "2px dashed #ccc",
        margin: "10px 0",
    },

    rows: {
        width: "calc(100% - 48px)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    row: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    rowLabel: {
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "10px",
        letterSpacing: "1px",
        color: "#aaa",
    },
    rowVal: {
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "700",
        fontSize: "12px",
        color: "#1A1A1A",
    },

    totalRow: {
        width: "calc(100% - 48px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
    },
    totalLabel: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "18px",
        fontWeight: "900",
        color: "#1A1A1A",
        letterSpacing: "1px",
    },
    totalVal: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "30px",
        fontWeight: "900",
        color: "#1A1A1A",
    },

    message: {
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "700",
        fontSize: "11px",
        color: "#888",
        margin: "10px 0 4px",
        textAlign: "center",
        padding: "0 24px",
        lineHeight: "1.5",
    },
    thankYou: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "13px",
        fontWeight: "900",
        color: "#1A1A1A",
        letterSpacing: "2px",
        margin: "0 0 12px",
        textAlign: "center",
    },

    barcodeWrap: {
        display: "flex",
        alignItems: "center",
        gap: "2px",
        margin: "4px 0 2px",
    },
    barLine: {
        backgroundColor: "#1A1A1A",
        borderRadius: "1px",
    },
    barcodeText: {
        fontFamily: "monospace",
        fontSize: "8px",
        color: "#bbb",
        letterSpacing: "1px",
        margin: "0 0 16px",
    },

    btnCol: {
        width: "calc(100% - 48px)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginBottom: "8px",
    },
    btnPrimary: {
        width: "100%",
        backgroundColor: "#FFC72C",
        border: "2.5px solid #1A1A1A",
        boxShadow: "3px 3px 0 #1A1A1A",
        padding: "12px",
        fontFamily: "'Oswald', sans-serif",
        fontWeight: "900",
        fontSize: "14px",
        letterSpacing: "0.5px",
        color: "#1A1A1A",
        cursor: "pointer",
    },
    btnSecondary: {
        width: "100%",
        backgroundColor: "#1A1A1A",
        border: "2.5px solid #1A1A1A",
        boxShadow: "3px 3px 0 #FFC72C",
        padding: "12px",
        fontFamily: "'Oswald', sans-serif",
        fontWeight: "900",
        fontSize: "14px",
        letterSpacing: "0.5px",
        color: "#FFC72C",
        cursor: "pointer",
    },
    btnGhost: {
        background: "none",
        border: "none",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "700",
        fontSize: "11px",
        color: "#aaa",
        cursor: "pointer",
        textDecoration: "underline",
        padding: "4px",
        textAlign: "center",
    },
};

export default OrderSuccess;