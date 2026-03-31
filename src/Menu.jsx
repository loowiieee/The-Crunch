import { useEffect, useState } from "react";
import { subscribeToProducts } from "./Product_Service";
import { useCart } from "./useCart";
import { useAuth } from "./useAuth";
import { imageMap } from "./assets/imageMap";
import { useNavigate } from "react-router-dom";

const CATEGORY_ICONS = {
    "All": "🍽️",
    "Rice Meals": "🍚",
    "Sharing": "🍗",
    "Appetizers": "🥢",
    "Sides": "🥗",
    "Drinks": "🥤",
};

const SECTION_ORDER = [
    "Rice Meals",
    "Sharing",
    "Appetizers",
    "Sides",
    "Drinks",
];

const FLAVORS = [
    { label: "Classic", icon: "🤍", color: "#f5e6c8", light: false },
    { label: "Honey Garlic", icon: "⭐", color: "#f7ddaa", light: false },
    { label: "Teriyaki", icon: "👍", color: "#3b2801", light: true },
    { label: "Texas BBQ", icon: "🍴", color: "#1A1A1A", light: true },
    { label: "Garlic Parmesan", icon: "🧄", color: "#e8f0e0", light: false },
    { label: "K-Style", icon: "🌶️", color: "#e8504a", light: true },
    { label: "Spicy K-Style", icon: "🌶️", color: "#c0392b", light: true },
];

const needsFlavor = (product) => {
    const cat = product.category || "";
    const name = product.name || "";
    if (cat === "Rice Meals" || cat === "For Sharing") return true;
    if (cat === "Sides" && name.toLowerCase().includes("bucket")) return true;
    return false;
};

/* ─── ProductCard ─── */
const ProductCard = ({ product, selectedId, setSelectedId, isLoggedIn }) => {
    const { name, price, description, imageUrl, available } = product;
    const { addToCart } = useCart();
    const [qty, setQty] = useState(0);
    const [added, setAdded] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [selectedFlavor, setSelectedFlavor] = useState(null);
    const [flavorError, setFlavorError] = useState(false);

    const selected = selectedId === product.id;
    const requiresFlavor = needsFlavor(product);

    const imageSrc =
        imageUrl ||
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23aaa'%3ENo Image%3C/text%3E%3C/svg%3E";

    const handleAdd = () => {
        if (qty === 0) return;
        if (requiresFlavor && !selectedFlavor) {
            setFlavorError(true);
            setTimeout(() => setFlavorError(false), 1800);
            return;
        }
        const productWithFlavor = requiresFlavor
            ? {
                ...product,
                flavor: selectedFlavor,
                name: `${name} (${selectedFlavor})`,
                id: `${product.id}_${selectedFlavor}`,
            }
            : product;
        for (let i = 0; i < qty; i++) addToCart(productWithFlavor);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
        setQty(0);
        setSelectedFlavor(null);
    };

    return (
        <div
            className="menu-card"
            style={{
                ...c.card,
                opacity: available ? 1 : 0.6,
                outline: selected ? "2.5px solid #27ae60" : "2.5px solid transparent",
                transform: selected
                    ? "scale(1.01)"
                    : hovered
                        ? "scale(1.005)"
                        : "scale(1)",
                boxShadow: selected
                    ? "0 4px 20px rgba(39,174,96,0.2)"
                    : hovered
                        ? "0 6px 20px rgba(0,0,0,0.13)"
                        : "0 2px 12px rgba(0,0,0,0.09)",
                cursor: "pointer",
            }}
            onClick={() => setSelectedId(selected ? null : product.id)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={c.imgWrap}>
                <img
                    src={imageSrc}
                    alt={name}
                    style={c.img}
                    onError={(e) => {
                        e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23aaa'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                />
                {!available && <div style={c.soldBanner}>SOLD OUT</div>}
                {requiresFlavor && available && (
                    <div style={c.flavorTag}>🍗 CHOOSE FLAVOR</div>
                )}
            </div>

            <div style={c.cardBody}>
                <p style={c.cardName}>{name}</p>
                <p style={c.cardDesc}>{description}</p>

                {isLoggedIn && available && requiresFlavor && (
                    <div style={c.flavorSection} onClick={(e) => e.stopPropagation()}>
                        <p style={{ ...c.flavorTitle, color: flavorError ? "#e74c3c" : "#888" }}>
                            {flavorError ? "⚠️ Pick a flavor first!" : "SELECT FLAVOR"}
                        </p>
                        <div style={c.flavorGrid}>
                            {FLAVORS.map((f) => {
                                const isSelected = selectedFlavor === f.label;
                                return (
                                    <button
                                        key={f.label}
                                        style={{
                                            ...c.flavorBtn,
                                            backgroundColor: isSelected ? f.color : "#f5f5f5",
                                            color: isSelected ? (f.light ? "#fff" : "#1A1A1A") : "#555",
                                            border: isSelected
                                                ? `2px solid ${f.light ? "rgba(255,255,255,0.4)" : "#1A1A1A"}`
                                                : "2px solid #e0e0e0",
                                            boxShadow: isSelected ? "2px 2px 0 rgba(0,0,0,0.15)" : "none",
                                            transform: isSelected ? "scale(1.04)" : "scale(1)",
                                            fontWeight: isSelected ? "900" : "700",
                                        }}
                                        onClick={() => {
                                            setSelectedFlavor(isSelected ? null : f.label);
                                            setFlavorError(false);
                                        }}
                                    >
                                        <span style={{ fontSize: "11px" }}>{f.icon}</span>
                                        {f.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div style={c.cardFooter}>
                    <span style={c.cardPrice}>₱{price}</span>
                    {!available && <span style={c.soldTag}>SOLD OUT</span>}
                    {isLoggedIn && available && (
                        <div style={c.qtyRow} onClick={(e) => e.stopPropagation()}>
                            <div style={c.qtyBox}>
                                <button style={c.qtyBtn} onClick={() => setQty(q => Math.max(0, q - 1))}>−</button>
                                <span style={c.qtyNum}>{qty}</span>
                                <button style={c.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
                            </div>
                            <button
                                style={{
                                    ...c.addToCartBtn,
                                    backgroundColor: added ? "#27ae60" : qty === 0 ? "#f0f0f0" : "#fff",
                                    color: added ? "#fff" : qty === 0 ? "#ccc" : "#27ae60",
                                    borderColor: qty === 0 ? "#ccc" : "#27ae60",
                                    cursor: qty === 0 ? "not-allowed" : "pointer",
                                }}
                                onClick={handleAdd}
                            >
                                {added ? "✓ Added!" : "Add to Cart"}
                            </button>
                        </div>
                    )}
                </div>

                {isLoggedIn && available && requiresFlavor && selectedFlavor && (
                    <div style={c.selectedFlavorChip} onClick={(e) => e.stopPropagation()}>
                        <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: "700", fontSize: "11px" }}>
                            {FLAVORS.find((f) => f.label === selectedFlavor)?.icon}{" "}
                            {selectedFlavor}
                        </span>
                        <button style={c.chipClear} onClick={() => setSelectedFlavor(null)}>✕</button>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─── Order Panel content (shared between sidebar & drawer) ─── */
const OrderPanelContent = ({ onClose }) => {
    const { cartItems, removeFromCart } = useCart();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Dine In");
    const [deliveryAddress, setDeliveryAddress] = useState("");

    const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    const total = subtotal;
    const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);

    const handlePlaceOrder = () => {
        if (activeTab === "Delivery" && !deliveryAddress.trim()) {
            alert("Please enter a delivery address.");
            return;
        }
        navigate("/cart", {
            state: {
                orderType: activeTab,
                deliveryAddress: activeTab === "Delivery" ? deliveryAddress : "",
                subtotal,
                total: activeTab === "Delivery" ? total + 50 : total,
            },
        });
    };

    return (
        <>
            <div style={p.panelHead}>
                <span style={p.panelTitle}>ORDER SUMMARY</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={p.itemCount}>{itemCount} items</span>
                    {onClose && (
                        <button onClick={onClose} style={p.drawerCloseBtn}>✕</button>
                    )}
                </div>
            </div>

            <div style={p.tabs}>
                {["Dine In", "Pick-Up", "Delivery"].map((t) => (
                    <button
                        key={t}
                        style={{ ...p.tab, ...(activeTab === t ? p.tabActive : {}) }}
                        onClick={() => setActiveTab(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {activeTab === "Dine In" && (
                <div style={p.infoBox}>
                    <span style={p.infoIcon}>🍽️</span>
                    <p style={p.infoText}>Your order will be served at your table.</p>
                </div>
            )}
            {activeTab === "Pick-Up" && (
                <div style={p.infoBox}>
                    <span style={p.infoIcon}>🏃</span>
                    <p style={p.infoText}>Pick up your order at the counter when ready.</p>
                </div>
            )}
            {activeTab === "Delivery" && (
                <div style={p.deliveryBox}>
                    <label style={p.deliveryLabel}>DELIVERY ADDRESS</label>
                    <input
                        style={p.deliveryInput}
                        type="text"
                        placeholder="Enter your full address..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                </div>
            )}

            <div style={p.itemsList}>
                {cartItems.length === 0 ? (
                    <div style={p.empty}>
                        <span style={{ fontSize: 32 }}>🛒</span>
                        <p style={p.emptyText}>Your order is empty</p>
                        <p style={p.emptyHint}>Add items from the menu</p>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.id} style={p.item}>
                            <img
                                src={
                                    typeof imageMap !== "undefined" && imageMap[item.name]
                                        ? imageMap[item.name]
                                        : item.imageUrl ||
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23aaa'%3ENo Image%3C/text%3E%3C/svg%3E"
                                }
                                alt={item.name}
                                style={p.itemImg}
                                onError={(e) => {
                                    e.target.src =
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23aaa'%3ENo Image%3C/text%3E%3C/svg%3E";
                                }}
                            />
                            <div style={p.itemInfo}>
                                <p style={p.itemName}>{item.name}</p>
                                <p style={p.itemMeta}>₱{item.price} × {item.qty}</p>
                            </div>
                            <div style={p.itemRight}>
                                <span style={p.itemTotal}>₱{(item.price * item.qty).toFixed(2)}</span>
                                <button style={p.removeBtn} onClick={() => removeFromCart(item.id)}>✕</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div style={p.totals}>
                <div style={p.totalRow}>
                    <span style={p.totalLabel}>Sub Total</span>
                    <span style={p.totalValue}>₱{subtotal.toFixed(2)}</span>
                </div>
                {activeTab === "Delivery" && (
                    <div style={p.totalRow}>
                        <span style={p.totalLabel}>Delivery Fee</span>
                        <span style={p.totalValue}>₱50.00</span>
                    </div>
                )}
                <div style={{ ...p.totalRow, ...p.grandRow }}>
                    <span style={p.grandLabel}>Total Amount</span>
                    <span style={p.grandValue}>
                        ₱{(activeTab === "Delivery" ? total + 50 : total).toFixed(2)}
                    </span>
                </div>
            </div>

            <button
                style={{
                    ...p.placeBtn,
                    opacity: cartItems.length === 0 ? 0.4 : 1,
                    cursor: cartItems.length === 0 ? "not-allowed" : "pointer",
                }}
                disabled={cartItems.length === 0}
                onClick={handlePlaceOrder}
            >
                PLACE ORDER →
            </button>
        </>
    );
};

/* ─── Desktop sidebar wrapper ─── */
const OrderPanel = () => (
    <aside style={p.panel} className="order-sidebar">
        <OrderPanelContent />
    </aside>
);

/* ─── Mobile bottom drawer ─── */
const MobileOrderDrawer = ({ isOpen, onClose, isLoggedIn }) => {
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);

    if (!isLoggedIn) {
        return (
            <>
                <div
                    style={{ ...d.backdrop, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
                    onClick={onClose}
                />
                <div style={{ ...d.drawer, transform: isOpen ? "translateY(0)" : "translateY(100%)" }}>
                    <div style={d.dragHandle} />
                    <div style={g.inner}>
                        <span style={g.icon}>🍗</span>
                        <h2 style={g.title}>READY TO ORDER?</h2>
                        <p style={g.subtitle}>Log in or create a free account to add items and place an order.</p>
                        <button style={g.loginBtn} onClick={() => navigate("/auth")}>LOGIN / SIGN UP</button>
                        <p style={g.hint}>It only takes a second!</p>
                    </div>
                    <button onClick={onClose} style={d.closeBtn}>✕ CLOSE</button>
                </div>
            </>
        );
    }

    void itemCount;

    return (
        <>
            <div
                style={{ ...d.backdrop, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
                onClick={onClose}
            />
            <div style={{ ...d.drawer, transform: isOpen ? "translateY(0)" : "translateY(100%)" }}>
                <div style={d.dragHandle} />
                <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "hidden" }}>
                    <OrderPanelContent onClose={onClose} />
                </div>
            </div>
        </>
    );
};

/* ─── Guest Banner (desktop sidebar only) ─── */
const GuestBanner = () => {
    const navigate = useNavigate();
    return (
        <aside style={g.panel} className="order-sidebar">
            <div style={g.inner}>
                <span style={g.icon}>🍗</span>
                <h2 style={g.title}>READY TO ORDER?</h2>
                <p style={g.subtitle}>
                    Log in or create a free account to add items to your cart and place an order.
                </p>
                <button style={g.loginBtn} onClick={() => navigate("/auth")}>LOGIN / SIGN UP</button>
                <p style={g.hint}>It only takes a second!</p>
            </div>
        </aside>
    );
};

/* ─── Main Menu ─── */
const Menu = () => {
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedId, setSelectedId] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { currentUser } = useAuth();
    const { cartItems } = useCart();

    const isLoggedIn = !!currentUser;
    const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);

    useEffect(() => {
        const unsubscribe = subscribeToProducts((data) => setProducts(data));
        return () => unsubscribe();
    }, []);

    const grouped = products.reduce((acc, product) => {
        const cat = product.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
    }, {});

    const sortedCategories = Object.keys(grouped).sort((a, b) => {
        const indexA = SECTION_ORDER.indexOf(a);
        const indexB = SECTION_ORDER.indexOf(b);
        if (a.toLowerCase().includes("flav")) return -1;
        if (b.toLowerCase().includes("flav")) return 1;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const allCategories = ["All", ...sortedCategories];
    const filteredProducts = activeCategory === "All" ? products : grouped[activeCategory] || [];
    const displayGrouped =
        activeCategory === "All"
            ? sortedCategories.reduce((acc, cat) => { acc[cat] = grouped[cat]; return acc; }, {})
            : { [activeCategory]: filteredProducts };

    return (
        <>
            <style>{`
                @media (min-width: 769px) {
                    .order-sidebar { display: flex !important; }
                    .mobile-cart-fab { display: none !important; }
                }
                @media (max-width: 768px) {
                    .order-sidebar { display: none !important; }
                    .mobile-cart-fab { display: flex !important; }
                    .menu-left-pane {
                        flex: 1 1 100% !important;
                        width: 100% !important;
                        padding-bottom: 100px !important;
                    }
                }
            `}</style>

            <div style={m.page}>
                {/* ── FIX: hero pulls up behind navbar, pads top to compensate ── */}
                <section style={m.hero}>
                    <div style={m.innerContainer}>
                        <h1 style={m.heroTitle}>
                            THE CRUNCH <span style={{ color: "#fff" }}>MENU</span>
                        </h1>
                        <p style={m.heroSubtitle}>FRESHLY FRIED • BOLD FLAVOR • MAXIMUM CRUNCH</p>
                        <div style={m.flavBar}>
                            <span style={m.flavLabel}>SIGNATURE FLAVORS</span>
                            <div style={m.flavList}>
                                {FLAVORS.map(({ label, icon, color, light }) => (
                                    <span
                                        key={label}
                                        style={{
                                            ...m.flavBadge,
                                            backgroundColor: color,
                                            color: light ? "#fff" : "#1A1A1A",
                                            border: `2px solid ${light ? "rgba(255,255,255,0.3)" : "#1A1A1A"}`,
                                        }}
                                    >
                                        <span>{icon}</span> {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div style={m.posLayout}>
                    <div className="menu-left-pane" style={m.leftPane}>
                        <div style={m.catBar}>
                            {allCategories.map((cat) => (
                                <button
                                    key={cat}
                                    style={{ ...m.catPill, ...(activeCategory === cat ? m.catPillActive : {}) }}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {CATEGORY_ICONS[cat] && (
                                        <span style={{ fontSize: "14px", lineHeight: 1 }}>
                                            {CATEGORY_ICONS[cat]}
                                        </span>
                                    )}
                                    {cat}
                                    {cat !== "All" && grouped[cat] && (
                                        <span style={{ ...m.catCount, ...(activeCategory === cat ? m.catCountActive : {}) }}>
                                            {grouped[cat].length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div style={m.sections}>
                            {Object.entries(displayGrouped).map(([category, items]) => (
                                <div key={category} style={m.section}>
                                    <div style={m.catHeader}>
                                        <div style={{ position: "relative", display: "inline-block" }}>
                                            <div style={{
                                                position: "absolute",
                                                bottom: "2px",
                                                left: "-3px",
                                                right: "-3px",
                                                height: "10px",
                                                backgroundColor: "#FFC72C",
                                                zIndex: 0,
                                            }} />
                                            <h2 style={{ ...m.catTitle, position: "relative", zIndex: 1 }}>
                                                {category}
                                            </h2>
                                        </div>
                                        <span style={{
                                            fontFamily: "'Public Sans', sans-serif",
                                            fontSize: "11px",
                                            fontWeight: "900",
                                            color: "#aaa",
                                            marginBottom: "4px",
                                        }}>
                                            {items.length} items
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            ...m.grid,
                                            gridTemplateColumns:
                                                window.innerWidth < 640
                                                    ? "1fr"
                                                    : items.length === 1
                                                        ? "minmax(0, 300px)"
                                                        : items.length === 2
                                                            ? "repeat(2, 1fr)"
                                                            : "repeat(auto-fit, minmax(280px, 1fr))",
                                        }}
                                    >
                                        {items.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                selectedId={selectedId}
                                                setSelectedId={setSelectedId}
                                                isLoggedIn={isLoggedIn}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {isLoggedIn ? <OrderPanel /> : <GuestBanner />}
                </div>
            </div>

            <button
                className="mobile-cart-fab"
                style={fab.btn}
                onClick={() => setDrawerOpen(true)}
            >
                <span style={fab.icon}>🛒</span>
                <span style={fab.label}>{isLoggedIn ? "VIEW ORDER" : "ORDER"}</span>
                {isLoggedIn && itemCount > 0 && (
                    <span style={fab.badge}>{itemCount}</span>
                )}
            </button>

            <MobileOrderDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                isLoggedIn={isLoggedIn}
            />
        </>
    );
};

/* ══════════════════════════════
   STYLES
══════════════════════════════ */

const m = {
    page: { backgroundColor: "#f8f8f8", minHeight: "100vh", width: "100%" },
    hero: {
        backgroundColor: "#FFC72C",
        // ── FIX: pull hero up behind navbar, pad top to compensate ──
        marginTop: "-80px",
        paddingTop: "calc(80px + 40px)",
        paddingBottom: "40px",
        textAlign: "center",
        borderBottom: "5px solid #1A1A1A",
        width: "100%",
    },
    innerContainer: {
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
        boxSizing: "border-box",
    },
    heroTitle: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "clamp(32px, 8vw, 72px)",
        margin: 0,
        color: "#1A1A1A",
        lineHeight: "1",
    },
    heroSubtitle: {
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "clamp(12px, 3vw, 18px)",
        letterSpacing: "2px",
        marginTop: "10px",
        color: "#1A1A1A",
    },
    posLayout: {
        display: "flex",
        alignItems: "flex-start",
        width: "100%",
        minHeight: "calc(100vh - 80px)",
    },
    leftPane: {
        flex: 1,
        minWidth: 0,
        padding: "clamp(12px, 4vw, 32px)",
        overflowY: "auto",
    },
    catBar: {
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
        marginBottom: "24px",
    },
    catPill: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "7px 14px",
        borderRadius: "999px",
        border: "2px solid #1A1A1A",
        backgroundColor: "#fff",
        color: "#1A1A1A",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "12px",
        letterSpacing: "0.3px",
        cursor: "pointer",
        transition: "all 0.14s",
        boxShadow: "2px 2px 0 #1A1A1A",
        whiteSpace: "nowrap",
    },
    catPillActive: { backgroundColor: "#FFC72C" },
    catCount: {
        backgroundColor: "#1A1A1A",
        color: "#FFC72C",
        fontSize: "10px",
        fontWeight: "900",
        padding: "1px 6px",
        borderRadius: "999px",
        fontFamily: "'Public Sans', sans-serif",
    },
    catCountActive: { backgroundColor: "#1A1A1A", color: "#FFC72C" },
    sections: {},
    section: { marginBottom: "48px" },
    catHeader: {
        display: "flex",
        alignItems: "flex-end",
        gap: "12px",
        paddingBottom: "12px",
        borderBottom: "1.5px solid #e0e0e0",
        marginBottom: "24px",
    },
    catTitle: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "22px",
        fontWeight: "900",
        color: "#1A1A1A",
        textTransform: "uppercase",
        letterSpacing: "1px",
        margin: 0,
        display: "inline-block",
    },
    catLine: {},
    grid: { display: "grid", gap: "20px" },
    flavBar: {
        marginTop: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
    },
    flavLabel: {
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "11px",
        letterSpacing: "3px",
        color: "#1A1A1A",
        opacity: 0.6,
    },
    flavList: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "8px",
    },
    flavBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "6px 14px",
        borderRadius: "12px",
        border: "2px solid #1A1A1A",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "11px",
        letterSpacing: "0.5px",
        whiteSpace: "nowrap",
    },
};

const c = {
    card: {
        backgroundColor: "#fff",
        borderRadius: "16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.09)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.18s, box-shadow 0.18s, outline 0.18s",
        border: "1px solid #f0f0f0",
    },
    imgWrap: {
        position: "relative",
        height: "210px",
        backgroundColor: "#f7f7f7",
        flexShrink: 0,
        overflow: "hidden",
    },
    img: { width: "100%", height: "100%", objectFit: "cover" },
    soldBanner: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.45)",
        color: "#fff",
        fontFamily: "'Oswald', sans-serif",
        fontSize: "18px",
        fontWeight: "900",
        letterSpacing: "2px",
    },
    flavorTag: {
        position: "absolute",
        top: "10px",
        right: "10px",
        backgroundColor: "#FFC72C",
        color: "#1A1A1A",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "9px",
        letterSpacing: "0.8px",
        padding: "3px 8px",
        border: "1.5px solid #1A1A1A",
        borderRadius: "4px",
        boxShadow: "1px 1px 0 rgba(0,0,0,0.15)",
    },
    cardBody: {
        padding: "14px 16px 16px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
    },
    cardName: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "15px",
        fontWeight: "700",
        textTransform: "capitalize",
        margin: "0 0 4px",
        color: "#1A1A1A",
        lineHeight: "1.3",
    },
    cardDesc: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "11px",
        color: "#aaa",
        margin: "0 0 10px",
        flex: 1,
        lineHeight: "1.4",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
    },
    flavorSection: {
        marginBottom: "10px",
        padding: "10px 10px 8px",
        backgroundColor: "#fafafa",
        border: "1.5px solid #e8e8e8",
        borderRadius: "10px",
    },
    flavorTitle: {
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "9px",
        letterSpacing: "1px",
        margin: "0 0 7px",
        transition: "color 0.2s",
    },
    flavorGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "6px",
    },
    flavorBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        padding: "8px 10px",
        borderRadius: "10px",
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "11px",
        letterSpacing: "0.3px",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.15s",
        textAlign: "center",
        whiteSpace: "nowrap",
    },
    selectedFlavorChip: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        marginTop: "8px",
        padding: "4px 10px",
        backgroundColor: "#e8f5e9",
        border: "1.5px solid #27ae60",
        borderRadius: "999px",
        alignSelf: "flex-start",
    },
    chipClear: {
        background: "none",
        border: "none",
        cursor: "pointer",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "10px",
        color: "#27ae60",
        padding: 0,
        lineHeight: 1,
    },
    cardFooter: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        marginTop: "auto",
    },
    cardPrice: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "18px",
        fontWeight: "900",
        color: "#27ae60",
    },
    addToCartBtn: {
        backgroundColor: "#fff",
        border: "1.5px solid #27ae60",
        color: "#27ae60",
        borderRadius: "8px",
        padding: "7px 14px",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "12px",
        cursor: "pointer",
        letterSpacing: "0.3px",
        transition: "all 0.15s",
    },
    soldTag: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "11px",
        fontWeight: "900",
        color: "#e74c3c",
        letterSpacing: "0.5px",
        border: "1.5px solid #e74c3c",
        borderRadius: "6px",
        padding: "4px 10px",
    },
    qtyRow: { display: "flex", alignItems: "center", gap: "6px" },
    qtyBox: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f0faf4",
        borderRadius: "999px",
        border: "1.5px solid #27ae60",
        overflow: "hidden",
        padding: "2px 4px",
    },
    qtyBtn: {
        backgroundColor: "transparent",
        border: "none",
        width: "26px",
        height: "26px",
        fontSize: "16px",
        fontWeight: "900",
        cursor: "pointer",
        color: "#27ae60",
        fontFamily: "'Oswald', sans-serif",
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
    },
    qtyNum: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "14px",
        fontWeight: "900",
        width: "22px",
        textAlign: "center",
        color: "#1A1A1A",
    },
    addBtn: {
        border: "1.5px solid #27ae60",
        borderRadius: "8px",
        padding: "6px 10px",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "11px",
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
    },
};

const p = {
    panel: {
        width: "340px",
        flexShrink: 0,
        backgroundColor: "#fff",
        borderLeft: "3px solid #1A1A1A",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: "80px",
        height: "calc(100vh - 80px)",
        overflowY: "hidden",
    },
    panelHead: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 20px 12px",
        borderBottom: "2px solid #1A1A1A",
        flexShrink: 0,
    },
    panelTitle: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "18px",
        fontWeight: "900",
        letterSpacing: "1px",
        color: "#1A1A1A",
    },
    itemCount: {
        backgroundColor: "#FFC72C",
        color: "#1A1A1A",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "12px",
        padding: "2px 10px",
        border: "2px solid #1A1A1A",
    },
    drawerCloseBtn: {
        background: "none",
        border: "2px solid #1A1A1A",
        padding: "2px 8px",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "12px",
        cursor: "pointer",
        color: "#1A1A1A",
    },
    tabs: { display: "flex", borderBottom: "2px solid #1A1A1A", flexShrink: 0 },
    tab: {
        flex: 1,
        padding: "10px 0",
        border: "none",
        borderRight: "1px solid #e0e0e0",
        backgroundColor: "#F5F5F5",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "11px",
        cursor: "pointer",
        color: "#888",
        letterSpacing: "0.5px",
    },
    tabActive: {
        backgroundColor: "#fff",
        color: "#1A1A1A",
        borderBottom: "3px solid #FFC72C",
    },
    infoBox: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 16px",
        backgroundColor: "#fffdf0",
        borderBottom: "2px solid #1A1A1A",
        flexShrink: 0,
    },
    infoIcon: { fontSize: "18px" },
    infoText: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "12px",
        fontWeight: "700",
        color: "#555",
        margin: 0,
    },
    deliveryBox: {
        padding: "10px 16px",
        backgroundColor: "#fffdf0",
        borderBottom: "2px solid #1A1A1A",
        flexShrink: 0,
    },
    deliveryLabel: {
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        fontSize: "10px",
        letterSpacing: "1px",
        color: "#888",
        display: "block",
        marginBottom: "6px",
    },
    deliveryInput: {
        width: "100%",
        padding: "8px 10px",
        border: "2px solid #1A1A1A",
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "12px",
        boxSizing: "border-box",
        outline: "none",
    },
    itemsList: { flex: 1, overflowY: "auto", padding: "12px 16px" },
    empty: { textAlign: "center", paddingTop: "48px", paddingBottom: "24px" },
    emptyText: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "16px",
        fontWeight: "700",
        color: "#1A1A1A",
        margin: "12px 0 4px",
    },
    emptyHint: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "12px",
        color: "#aaa",
        margin: 0,
    },
    item: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 0",
        borderBottom: "1px solid #f0f0f0",
    },
    itemImg: {
        width: "48px",
        height: "48px",
        objectFit: "cover",
        border: "2px solid #1A1A1A",
        flexShrink: 0,
    },
    itemInfo: { flex: 1, minWidth: 0 },
    itemName: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "14px",
        fontWeight: "700",
        color: "#1A1A1A",
        margin: "0 0 2px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    itemMeta: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "11px",
        color: "#888",
        margin: 0,
    },
    itemRight: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "4px",
        flexShrink: 0,
    },
    itemTotal: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "15px",
        fontWeight: "900",
        color: "#1A1A1A",
    },
    removeBtn: {
        background: "none",
        border: "none",
        fontSize: "11px",
        color: "#bbb",
        cursor: "pointer",
        padding: "0",
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: "900",
        lineHeight: 1,
    },
    totals: {
        padding: "14px 20px",
        borderTop: "2px solid #1A1A1A",
        flexShrink: 0,
    },
    totalRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "6px",
    },
    totalLabel: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "12px",
        fontWeight: "700",
        color: "#888",
    },
    totalValue: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "14px",
        fontWeight: "700",
        color: "#1A1A1A",
    },
    grandRow: {
        marginTop: "10px",
        paddingTop: "10px",
        borderTop: "2px dashed #1A1A1A",
        marginBottom: 0,
    },
    grandLabel: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "16px",
        fontWeight: "900",
        color: "#1A1A1A",
    },
    grandValue: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "22px",
        fontWeight: "900",
        color: "#1A1A1A",
    },
    placeBtn: {
        margin: "14px 20px 20px",
        padding: "16px",
        backgroundColor: "#FFC72C",
        border: "3px solid #1A1A1A",
        boxShadow: "4px 4px 0 #1A1A1A",
        fontFamily: "'Oswald', sans-serif",
        fontWeight: "900",
        fontSize: "18px",
        letterSpacing: "1px",
        color: "#1A1A1A",
        flexShrink: 0,
        transition: "transform 0.1s, box-shadow 0.1s",
        cursor: "pointer",
    },
};

const g = {
    panel: {
        width: "340px",
        flexShrink: 0,
        backgroundColor: "#fff",
        borderLeft: "3px solid #1A1A1A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "sticky",
        top: "80px",
        height: "calc(100vh - 80px)",
    },
    inner: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 28px",
        textAlign: "center",
        gap: "12px",
    },
    icon: { fontSize: "52px", marginBottom: "8px" },
    title: {
        fontFamily: "'Oswald', sans-serif",
        fontSize: "26px",
        fontWeight: "900",
        color: "#1A1A1A",
        margin: 0,
        letterSpacing: "1px",
    },
    subtitle: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "13px",
        fontWeight: "600",
        color: "#888",
        margin: 0,
        lineHeight: "1.6",
    },
    loginBtn: {
        marginTop: "8px",
        width: "100%",
        padding: "14px",
        backgroundColor: "#FFC72C",
        border: "3px solid #1A1A1A",
        boxShadow: "4px 4px 0 #1A1A1A",
        fontFamily: "'Oswald', sans-serif",
        fontWeight: "900",
        fontSize: "16px",
        letterSpacing: "1px",
        color: "#1A1A1A",
        cursor: "pointer",
    },
    hint: {
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "11px",
        color: "#bbb",
        margin: 0,
        fontWeight: "700",
    },
};

const fab = {
    btn: {
        display: "none",
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        alignItems: "center",
        gap: "8px",
        padding: "14px 28px",
        backgroundColor: "#FFC72C",
        border: "3px solid #1A1A1A",
        boxShadow: "4px 4px 0 #1A1A1A",
        fontFamily: "'Oswald', sans-serif",
        fontWeight: "900",
        fontSize: "16px",
        letterSpacing: "1px",
        color: "#1A1A1A",
        cursor: "pointer",
        whiteSpace: "nowrap",
    },
    icon: { fontSize: "18px" },
    label: {},
    badge: {
        backgroundColor: "#1A1A1A",
        color: "#FFC72C",
        fontFamily: "'Oswald', sans-serif",
        fontWeight: "900",
        fontSize: "12px",
        padding: "1px 7px",
        borderRadius: "999px",
        minWidth: "20px",
        textAlign: "center",
    },
};

const d = {
    backdrop: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1001,
        transition: "opacity 0.3s ease",
    },
    drawer: {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1002,
        backgroundColor: "#fff",
        borderTop: "3px solid #1A1A1A",
        borderRadius: "16px 16px 0 0",
        display: "flex",
        flexDirection: "column",
        maxHeight: "85vh",
        overflowY: "hidden",
        transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
    },
    dragHandle: {
        width: "40px",
        height: "4px",
        backgroundColor: "#ccc",
        borderRadius: "2px",
        margin: "12px auto 4px",
        flexShrink: 0,
    },
    closeBtn: {
        margin: "0 20px 16px",
        padding: "12px",
        border: "2px solid #1A1A1A",
        background: "none",
        fontFamily: "'Oswald', sans-serif",
        fontWeight: "900",
        fontSize: "13px",
        letterSpacing: "1px",
        cursor: "pointer",
        color: "#888",
        flexShrink: 0,
    },
};

export default Menu;