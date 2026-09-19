import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, CreditCard, FileText, Minus, Plus, ScanLine, Search, ShoppingBag, Trash2, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { completeSale, getPOSItems, scanPOSProduct } from "../services/posService";
import { getPurchaseOrders } from "../services/purchaseOrderService";

const paymentMethods = [
  { value: "cash", label: "Cash", icon: Wallet },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "transfer", label: "Transfer", icon: ShoppingBag },
];

const formatCurrency = (value) => `N${Number(value || 0).toLocaleString("en-NG")}`;
const orderFilters = ["All", "Pending", "Shipped", "Delivered", "Cancelled"];

const orderMatchesFilter = (order, filter) => {
  if (filter === "All") return true;
  if (filter === "Pending") return ["draft", "pending"].includes(order.status);
  if (filter === "Shipped") return ["approved", "ordered", "partially_received"].includes(order.status);
  if (filter === "Delivered") return order.status === "received";
  return order.status === "cancelled";
};

const orderDisplayStatus = (status) => {
  if (["draft", "pending"].includes(status)) return "Pending";
  if (["approved", "ordered", "partially_received"].includes(status)) return "Shipped";
  if (status === "received") return "Delivered";
  return "Cancelled";
};

function POS() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [scanCode, setScanCode] = useState("");
  const [category, setCategory] = useState("All");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [view, setView] = useState("pos");
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("All");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  useEffect(() => {
    getPOSItems()
      .then(setItems)
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load products"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (view !== "orders" || ordersLoaded) return;
    getPurchaseOrders()
      .then(setOrders)
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load orders"))
      .finally(() => {
        setOrdersLoading(false);
        setOrdersLoaded(true);
      });
  }, [view, ordersLoaded]);

  const categories = useMemo(() => ["All", ...new Set(items.map((item) => item.category).filter(Boolean))], [items]);
  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesQuery = `${item.name} ${item.itemCode}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === "All" || item.category === category);
  }), [items, query, category]);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const safeDiscount = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const total = subtotal - safeDiscount;
  const visibleOrders = orders.filter((order) => orderMatchesFilter(order, orderFilter));

  const addToCart = (product) => {
    setError("");
    setSuccess("");
    if (!product.openingQty) {
      setError(`${product.name} is out of stock`);
      return;
    }
    setCart((current) => {
      const existing = current.find((item) => item._id === product._id);
      if (existing) {
        return current.map((item) => item._id === product._id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.openingQty) }
          : item);
      }
      return [...current, { ...product, quantity: 1, price: Number(product.price || 0) }];
    });
  };

  const handleScan = async (event) => {
    event.preventDefault();
    const code = scanCode.trim();
    if (!code || scanLoading) return;

    setScanLoading(true);
    setError("");
    setSuccess("");
    try {
      const product = await scanPOSProduct(code);
      addToCart(product);
      setScanCode("");
      setSuccess(`${product.name} added to the basket`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Product code not found");
    } finally {
      setScanLoading(false);
    }
  };

  const updateQuantity = (id, amount) => {
    setCart((current) => current.flatMap((item) => {
      if (item._id !== id) return [item];
      const quantity = Math.min(item.quantity + amount, item.openingQty);
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  };

  const removeFromCart = (id) => setCart((current) => current.filter((item) => item._id !== id));

  const handleCheckout = async () => {
    if (!cart.length) return;
    setCheckoutLoading(true);
    setError("");
    setSuccess("");
    try {
      await completeSale({
        items: cart.map((item) => ({ itemId: item._id, quantity: item.quantity })),
        paymentMethod,
        discount: safeDiscount,
      });
      setItems((current) => current.map((product) => {
        const sold = cart.find((item) => item._id === product._id);
        return sold ? { ...product, openingQty: product.openingQty - sold.quantity } : product;
      }));
      setCart([]);
      setDiscount(0);
      setSuccess("Sale completed successfully");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to complete sale");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="pos-page">
      <header className="pos-header">
        <div>
          <p className="pos-kicker">Workspace commerce</p>
          <h1>{view === "pos" ? "Make a sale" : "Purchase orders"}</h1>
          <p>{view === "pos" ? "Find a product, build the basket, and take payment." : "Track every order from request to delivery."}</p>
        </div>
        <div className="pos-header-actions"><nav className="pos-view-toggle" aria-label="POS workspace view"><button type="button" className={view === "pos" ? "is-active" : ""} onClick={() => setView("pos")}><ShoppingBag size={16} /> Point of Sale</button><button type="button" className={view === "orders" ? "is-active" : ""} onClick={() => setView("orders")}><FileText size={16} /> Orders</button></nav><div className="pos-live-status"><span /> Register ready</div></div>
      </header>

      {(error || success) && <div className={`pos-feedback ${error ? "is-error" : "is-success"}`} role="status">{error || success}</div>}

      {view === "orders" ? <OrdersView orders={visibleOrders} filter={orderFilter} setFilter={setOrderFilter} loading={ordersLoading} /> : <div className="pos-workspace">
        <section className="pos-catalog">
          <div className="pos-catalog-toolbar">
            <form className="pos-scan" onSubmit={handleScan}>
              <ScanLine size={19} aria-hidden="true" />
              <input value={scanCode} onChange={(event) => setScanCode(event.target.value)} placeholder="Scan barcode or enter item code" aria-label="Scan barcode or enter item code" autoComplete="off" />
              <button type="submit" disabled={!scanCode.trim() || scanLoading}>{scanLoading ? "Finding..." : "Scan"}</button>
            </form>
            <label className="pos-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products or scan item code" aria-label="Search products" /></label>
            <div className="pos-categories" aria-label="Product categories">{categories.map((value) => <button type="button" className={category === value ? "is-active" : ""} key={value} onClick={() => setCategory(value)}>{value}</button>)}</div>
          </div>
          {loading ? <div className="pos-empty">Loading products...</div> : filteredItems.length ? <div className="pos-product-grid">{filteredItems.map((product) => <button type="button" className="pos-product" key={product._id} onClick={() => addToCart(product)} disabled={!product.openingQty}><span className="pos-product-image">{product.image ? <img src={product.image} alt="" /> : <ShoppingBag size={23} />}</span><span className="pos-product-copy"><strong>{product.name}</strong><small>{product.itemCode} · {product.openingQty} in stock</small></span><b>{formatCurrency(product.price)}</b><span className="pos-add-product"><Plus size={15} /></span></button>)}</div> : <div className="pos-empty">No products match your search.</div>}
        </section>

        <aside className="pos-cart">
          <div className="pos-cart-header"><div><p className="pos-kicker">Current order</p><h2>Basket <span>{cart.length}</span></h2></div><button type="button" className="pos-clear" onClick={() => setCart([])} disabled={!cart.length}>Clear</button></div>
          <div className="pos-cart-items">{cart.length ? cart.map((item) => <div className="pos-cart-item" key={item._id}><div><strong>{item.name}</strong><small>{formatCurrency(item.price)} each</small></div><div className="pos-quantity"><button type="button" onClick={() => updateQuantity(item._id, -1)} aria-label={`Decrease ${item.name}`}><Minus size={13} /></button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item._id, 1)} aria-label={`Increase ${item.name}`}><Plus size={13} /></button></div><b>{formatCurrency(item.price * item.quantity)}</b><button type="button" className="pos-remove" onClick={() => removeFromCart(item._id)} aria-label={`Remove ${item.name}`}><Trash2 size={14} /></button></div>) : <div className="pos-cart-empty"><ShoppingBag size={25} /><p>Your basket is empty</p><small>Select products to begin an order.</small></div>}</div>
          <div className="pos-summary"><div><span>Subtotal</span><b>{formatCurrency(subtotal)}</b></div><label><span>Discount</span><input type="number" min="0" max={subtotal} value={discount} onChange={(event) => setDiscount(event.target.value)} /></label><div className="pos-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div></div>
          <div className="pos-payment"><p>Payment method</p><div>{paymentMethods.map(({ value, label, icon: Icon }) => <button type="button" className={paymentMethod === value ? "is-active" : ""} key={value} onClick={() => setPaymentMethod(value)}><Icon size={15} /> {label}{paymentMethod === value && <Check size={13} />}</button>)}</div></div>
          <button type="button" className="pos-checkout" onClick={handleCheckout} disabled={!cart.length || checkoutLoading}>{checkoutLoading ? "Processing..." : `Charge ${formatCurrency(total)}`}<Check size={17} /></button>
        </aside>
      </div>}
    </div>
  );
}

function OrdersView({ orders, filter, setFilter, loading }) {
  return <section className="orders-view">
    <div className="orders-toolbar"><div className="orders-filters">{orderFilters.map((value) => <button type="button" className={filter === value ? "is-active" : ""} key={value} onClick={() => setFilter(value)}>{value}</button>)}</div><div className="orders-toolbar-actions"><span className="orders-count">{orders.length} order{orders.length === 1 ? "" : "s"}</span><Link className="add-order-button" to="/pos/orders/new"><Plus size={15} /> Add order</Link></div></div>
    {loading ? <div className="orders-empty">Loading purchase orders...</div> : orders.length ? <div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div className="order-card-main"><div className="order-card-heading"><span className="order-icon"><FileText size={18} /></span><div><strong>{order.poNumber || "Purchase order"}</strong><small>{new Date(order.createdAt || order.orderDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</small></div></div><span className={`order-status status-${orderDisplayStatus(order.status).toLowerCase()}`}>{orderDisplayStatus(order.status)}</span></div><div className="order-card-details"><span><small>Supplier</small><strong>{order.supplierName || "No supplier"}</strong></span><span><small>Items</small><strong>{order.items?.length || 0} line item{order.items?.length === 1 ? "" : "s"}</strong></span><span><small>Total</small><strong>{formatCurrency(order.totalAmount)}</strong></span><ChevronRight size={17} /></div></article>)}</div> : <div className="orders-empty"><FileText size={27} /><strong>No {filter.toLowerCase()} orders</strong><span>Orders matching this status will appear here.</span></div>}
  </section>;
}

export default POS;
