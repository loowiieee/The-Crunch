import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./useCart";
import { useAuth } from "./useAuth";
import { placeOrder } from "./Orders_Service";
import { imageMap } from "./assets/imageMap";
import { useState } from "react";

const Cart = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { cartItems, updateQty, clearCart } = useCart();
    const { currentUser } = useAuth();
    const [isPlacing, setIsPlacing] = useState(false);

    const [customerNameInput, setCustomerNameInput] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [showSummaryMobile, setShowSummaryMobile] = useState(false);

    const orderType = state?.orderType || "Dine In";
    const deliveryAddress = state?.deliveryAddress || "";

    const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    const deliveryFee = orderType === "Delivery" ? 50 : 0;
    const total = subtotal + deliveryFee;

    const handleConfirm = async () => {
        if (!currentUser) {
            alert("You must be logged in to place an order.");
            navigate("/auth");
            return;
        }

        if (!customerNameInput.trim()) {
            alert("Please enter your name.");
            return;
        }

        if (isPlacing) return;
        setIsPlacing(true);

        try {
            const docRef = await placeOrder(currentUser.uid, {
                items: cartItems.map(i => ({
                    id: i.id,
                    name: i.name,
                    price: i.price,
                    qty: i.qty,
                    imageUrl: i.imageUrl || "",
                })),
                orderType,
                deliveryAddress,
                subtotal,
                deliveryFee,
                total,
                paymentMethod,
                customerName: customerNameInput.trim(),
            });

            clearCart();
            navigate("/order-success", {
                state: {
                    orderId: docRef.id,
                    total,
                    orderType,
                    itemCount: cartItems.reduce((s, i) => s + i.qty, 0),
                }
            });
        } catch (err) {
            console.error("Order failed:", err);
            alert(`Order failed: ${err.message || "Please try again."}`);
        } finally {
            setIsPlacing(false);
        }
    };

    const orderTypeIcon = { "Dine In": "🍽️", "Pick-Up": "🏃", "Delivery": "🛵" }[orderType] || "🛒";

    return (
        <div style={s.page} className="cart-page">
            <style>{`
                /* ── Mobile: stack vertically ── */
                @media (max-width: 768px) {
                    .cart-page {
                        flex-direction: column !important;
                    }

                    .cart-left {
                        flex: none !important;
                        width: 100% !important;
                        margin-right: 0 !important;
                        box-sizing: border-box !important;
                        border-right: none !important;
                        border-bottom: 3px solid #1A1A1A !important;
                        padding: 100px 16px 24px !important;
                    }

                    .cart-right {
                        position: static !important;
                        width: 100% !important;
                        flex-shrink: unset !important;
                        flex-basis: auto !important;
                        padding: 0 !important;
                        border-left: none !important;
                        border-top: 3px solid #1A1A1A !important;
                        background: white !important;
                        min-height: unset !important;
                        max-height: unset !important;
                        overflow: visible !important;
                    }

                    .toggle-summary-btn {
                        display: flex !important;
                        width: 100% !important;
                        padding: 14px 20px !important;
                        border: none !important;
                        border-bottom: 3px solid #1A1A1A !important;
                        background: #FFC72C !important;
                        font-family: 'Oswald', sans-serif !important;
                        font-weight: 900 !important;
                        font-size: 14px !important;
                        letter-spacing: 0.5px !important;
                        cursor: pointer !important;
                        color: #1A1A1A !important;
                        justify-content: center !important;
                        align-items: center !important;
                        box-sizing: border-box !important;
                    }

                    .cart-summary-card {
                        position: static !important;
                        top: auto !important;
                        padding: 20px 16px !important;
                        margin: 0 !important;
                        overflow: hidden !important;
                        transition: max-height 0.3s ease, opacity 0.3s ease !important;
                    }

                    .cart-summary-card.collapsed {
                        max-height: 0 !important;
                        padding-top: 0 !important;
                        padding-bottom: 0 !important;
                        opacity: 0 !important;
                    }

                    .cart-summary-card.expanded {
                        max-height: 1000px !important;
                        opacity: 1 !important;
                    }
                }

                /* ── Desktop: hide toggle button ── */
                @media (min-width: 769px) {
                    .toggle-summary-btn {
                        display: none !important;
                    }
                    .cart-summary-card {
                        max-height: none !important;
                        opacity: 1 !important;
                    }
                }
            `}</style>

            {/* ── LEFT: Item list ── */}
            <div style={s.left} className="cart-left">
                <button style={s.backBtn} onClick={() => navigate("/menu")}>
                    ← BACK TO MENU
                </button>

                <h1 style={s.pageTitle}>REVIEW YOUR ORDER</h1>

                <div style={s.typeBadge}>
                    <span style={s.typeIcon}>{orderTypeIcon}</span>
                    <span style={s.typeLabel}>{orderType.toUpperCase()}</span>
                    {orderType === "Delivery" && deliveryAddress && (
                        <span style={s.typeAddress}>— {deliveryAddress}</span>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <div style={s.emptyWrap}>
                        <span style={{ fontSize: 48 }}>🛒</span>
                        <p style={s.emptyText}>Your cart is empty.</p>
                        <button style={s.goMenuBtn} onClick={() => navigate("/menu")}>
                            GO TO MENU
                        </button>
                    </div>
                ) : (
                    <div style={s.itemsList}>
                        {cartItems.map((item) => {
                            const imgSrc =
                                (typeof imageMap !== "undefined" && imageMap[item.name]) ||
                                item.imageUrl ||
                                "https://via.placeholder.com/64?text=?";
                            return (
                                <div key={item.id} style={s.item}>
                                    <img src={imgSrc} alt={item.name} style={s.itemImg} />
                                    <div style={s.itemInfo}>
                                        <p style={s.itemName}>{item.name}</p>
                                        <p style={s.itemUnit}>₱{item.price} each</p>
                                    </div>
                                    <div style={s.qtyBox}>
                                        <button style={s.qtyBtn} onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                                        <span style={s.qtyNum}>{item.qty}</span>
                                        <button style={s.qtyBtn} onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                                    </div>
                                    <span style={s.itemTotal}>₱{(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── RIGHT: Order summary ── */}
            <div style={s.right} className="cart-right">
                <button
                    style={s.toggleSummaryBtn}
                    onClick={() => setShowSummaryMobile(prev => !prev)}
                    className="toggle-summary-btn"
                >
                    {showSummaryMobile ? "▲ HIDE ORDER SUMMARY" : "▼ SHOW ORDER SUMMARY"}
                </button>

                <div
                    style={s.summaryCard}
                    className={`cart-summary-card ${showSummaryMobile ? "expanded" : "collapsed"}`}
                >
                    <h2 style={s.summaryTitle}>ORDER SUMMARY</h2>

                    <div style={{ marginBottom: "16px" }}>
                        <p style={{ fontFamily: "'Oswald', sans-serif", fontWeight: "900", margin: "0 0 8px" }}>
                            CUSTOMER NAME
                        </p>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={customerNameInput}
                            onChange={(e) => setCustomerNameInput(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "2px solid #1A1A1A",
                                fontFamily: "'Public Sans', sans-serif",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <div style={s.summaryRows}>
                        <div style={s.summaryRow}>
                            <span style={s.summaryLabel}>Subtotal</span>
                            <span style={s.summaryValue}>₱{subtotal.toFixed(2)}</span>
                        </div>
                        {orderType === "Delivery" && (
                            <div style={s.summaryRow}>
                                <span style={s.summaryLabel}>Delivery Fee</span>
                                <span style={s.summaryValue}>₱50.00</span>
                            </div>
                        )}
                        <div style={s.divider} />
                        <div style={{ ...s.summaryRow, alignItems: "baseline" }}>
                            <span style={s.totalLabel}>TOTAL</span>
                            <span style={s.totalValue}>₱{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div style={s.paymentBox}>
                        <p style={s.paymentTitle}>PAYMENT METHOD</p>
                        {["Cash", "GCash", "QRPH"].map(method => (
                            <button
                                key={method}
                                style={{
                                    ...s.paymentBtn,
                                    ...(paymentMethod === method ? s.paymentBtnActive : {})
                                }}
                                onClick={() => setPaymentMethod(method)}
                            >
                                {method}
                            </button>
                        ))}
                    </div>

                    <button
                        style={{
                            ...s.confirmBtn,
                            opacity: cartItems.length === 0 || isPlacing ? 0.4 : 1,
                            cursor: cartItems.length === 0 || isPlacing ? "not-allowed" : "pointer",
                        }}
                        disabled={cartItems.length === 0 || isPlacing}
                        onClick={handleConfirm}
                    >
                        {isPlacing ? "PLACING ORDER..." : "CONFIRM ORDER ✓"}
                    </button>

                    <button style={s.cancelBtn} onClick={() => navigate("/menu")}>
                        Cancel & go back
                    </button>
                </div>
            </div>
        </div>
    );
};

const s = {
    page: {
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#F5F5F5",
        fontFamily: "'Public Sans', sans-serif",
        marginTop: "-80px",   // pull behind navbar
    },
    left: {
        flex: 1,
        padding: "128px 40px 48px", // top padding clears the 80px navbar + breathing room
        minWidth: 0,
        marginRight: "360px",       // offset for the fixed right panel
    },
    backBtn: {
        background: "none",
        border: "2px solid #1A1A1A",
        padding: "8px 16px",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "12px",
        letterSpacing: "1px",
        cursor: "pointer",
        color: "#1A1A1A",
        marginBottom: "32px",
        boxShadow: "2px 2px 0 #1A1A1A",
    },
    pageTitle: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "42px",
        fontWeight: "900",
        color: "#1A1A1A",
        margin: "0 0 20px",
        textTransform: "uppercase",
    },
    typeBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "#FFC72C",
        border: "2.5px solid #1A1A1A",
        padding: "6px 16px",
        marginBottom: "32px",
        boxShadow: "3px 3px 0 #1A1A1A",
    },
    typeIcon: { fontSize: "16px" },
    typeLabel: {
        fontFamily: "'Oswald', sans-serif",
        fontWeight: "700",
        fontSize: "14px",
        color: "#1A1A1A",
        letterSpacing: "1px",
    },
    typeAddress: {
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "700",
        fontSize: "12px",
        color: "#555",
    },
    itemsList: { display: "flex", flexDirection: "column", gap: "0" },
    item: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 0",
        borderBottom: "2px solid #e0e0e0",
    },
    itemImg: {
        width: "64px",
        height: "64px",
        objectFit: "cover",
        border: "2.5px solid #1A1A1A",
        flexShrink: 0,
    },
    itemInfo: { flex: 1, minWidth: 0 },
    itemName: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "16px",
        fontWeight: "700",
        color: "#1A1A1A",
        margin: "0 0 4px",
        textTransform: "uppercase",
    },
    itemUnit: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "12px",
        color: "#888",
        margin: 0,
    },
    qtyBox: {
        display: "flex",
        alignItems: "center",
        border: "2.5px solid #1A1A1A",
        overflow: "hidden",
        flexShrink: 0,
    },
    qtyBtn: {
        backgroundColor: "#fff",
        border: "none",
        width: "30px",
        height: "34px",
        fontSize: "16px",
        fontWeight: "900",
        cursor: "pointer",
        fontFamily: "'Oswald', sans-serif",
    },
    qtyNum: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "14px",
        fontWeight: "900",
        width: "30px",
        textAlign: "center",
        borderLeft: "1px solid #1A1A1A",
        borderRight: "1px solid #1A1A1A",
        lineHeight: "34px",
    },
    itemTotal: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "18px",
        fontWeight: "900",
        color: "#1A1A1A",
        minWidth: "80px",
        textAlign: "right",
        flexShrink: 0,
    },
    emptyWrap: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "80px",
        gap: "16px",
    },
    emptyText: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "22px",
        color: "#aaa",
        margin: 0,
    },
    goMenuBtn: {
        backgroundColor: "#FFC72C",
        border: "3px solid #1A1A1A",
        boxShadow: "4px 4px 0 #1A1A1A",
        padding: "12px 28px",
        fontFamily: "'Oswald', sans-serif",
        fontWeight: "900",
        fontSize: "16px",
        cursor: "pointer",
        color: "#1A1A1A",
        marginTop: "8px",
    },
    right: {
        width: "360px",
        position: "fixed",          // locked in place — never scrolls
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#fff",
        borderLeft: "3px solid #1A1A1A",
        overflow: "hidden",         // no scrollbar on the summary panel
        padding: "128px 32px 48px", // top clears navbar
        boxSizing: "border-box",
        zIndex: 10,
    },
    summaryCard: {
        display: "flex",
        flexDirection: "column",
        gap: "0",
    },
    toggleSummaryBtn: {
        display: "none",
    },
    summaryTitle: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "22px",
        fontWeight: "900",
        color: "#1A1A1A",
        margin: "0 0 24px",
        letterSpacing: "1px",
        borderBottom: "3px solid #1A1A1A",
        paddingBottom: "12px",
    },
    summaryRows: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" },
    summaryRow: { display: "flex", justifyContent: "space-between" },
    summaryLabel: { fontFamily: "'Public Sans', sans-serif", fontWeight: "700", fontSize: "13px", color: "#888" },
    summaryValue: { fontFamily: "'Oswald', sans-serif", fontSize: "15px", fontWeight: "700", color: "#1A1A1A" },
    divider: { borderTop: "2px dashed #1A1A1A", margin: "4px 0" },
    totalLabel: { fontFamily: "'Oswald', sans-serif", fontSize: "20px", fontWeight: "900", color: "#1A1A1A" },
    totalValue: { fontFamily: "'Oswald', sans-serif", fontSize: "28px", fontWeight: "900", color: "#1A1A1A" },
    confirmBtn: {
        width: "100%",
        backgroundColor: "#FFC72C",
        border: "3px solid #1A1A1A",
        boxShadow: "4px 4px 0 #1A1A1A",
        padding: "18px",
        fontFamily: "'Oswald', sans-serif",
        fontWeight: "900",
        fontSize: "20px",
        letterSpacing: "1px",
        color: "#1A1A1A",
        marginBottom: "12px",
        transition: "transform 0.1s, box-shadow 0.1s",
    },
    cancelBtn: {
        width: "100%",
        background: "none",
        border: "none",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "700",
        fontSize: "12px",
        color: "#aaa",
        cursor: "pointer",
        textDecoration: "underline",
        padding: "8px",
    },
    paymentBox: {
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    paymentTitle: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "14px",
        fontWeight: "900",
        color: "#1A1A1A",
    },
    paymentBtn: {
        padding: "10px",
        border: "2px solid #1A1A1A",
        backgroundColor: "#fff",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        cursor: "pointer",
    },
    paymentBtnActive: {
        backgroundColor: "#FFC72C",
    },
};

export default Cart;