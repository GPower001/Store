import { ArrowRight, BarChart3, Boxes, Check, ChevronRight, Menu, ShoppingCart, Store, UsersRound, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const features = [
  { icon: ShoppingCart, number: "01", title: "Sell without slowing down", text: "A focused POS for quick checkout, barcode scanning, flexible payments, and receipts that stay tied to stock." },
  { icon: Boxes, number: "02", title: "Know what is moving", text: "Track quantities, reorder points, branches, and product performance before small gaps become expensive surprises." },
  { icon: BarChart3, number: "03", title: "See the business clearly", text: "Turn daily activity into useful signals with sales history, reports, stock movements, and live dashboard insight." },
  { icon: UsersRound, number: "04", title: "Give teams the right access", text: "Keep each branch organized with roles, permissions, and a workspace built for growing teams." },
];

const plans = [
  { name: "Starter", tier: "starter", price: "Free", detail: "For getting your first workspace in order", features: ["100 products", "1 branch", "2 team members", "POS and stock tracking"] },
  { name: "Growth", tier: "growth", price: "N10,000", detail: "For businesses ready to move faster", features: ["1,000 products", "5 branches", "10 team members", "Reports and purchase orders"], featured: true },
  { name: "Scale", tier: "scale", price: "N25,000", detail: "For multi-branch operations", features: ["Unlimited products", "Multiple branches", "Advanced permissions", "Priority support"] },
];

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <a className="landing-brand" href="#top" onClick={closeMenu}>
          <span className="landing-brand-mark"><Store size={17} /></span>
          <strong><b>Stock</b>Room</strong>
        </a>
        <button className="landing-menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <div className={`landing-nav-links ${menuOpen ? "is-open" : ""}`}>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#pricing" onClick={closeMenu}>Pricing</a>
          <a href="#blog" onClick={closeMenu}>Blog</a>
          <a href="#guide" onClick={closeMenu}>Guide</a>
          <a href="#affiliates" onClick={closeMenu}>Affiliates</a>
          <Link className="landing-login-link" to="/login" onClick={closeMenu}>Log in</Link>
          <Link className="landing-nav-cta" to="/login" onClick={closeMenu}>Start for free <ArrowRight size={15} /></Link>
        </div>
      </nav>

      <section className="landing-hero" id="top">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow"><span /> Business control, without the noise</p>
          <h1>Run the room.<br /><em>Know the numbers.</em></h1>
          <p className="landing-hero-text">StockRoom brings sales, inventory, orders, and team activity into one calm operating view, so every business day starts with clarity.</p>
          <div className="landing-hero-actions"><Link className="landing-primary-button" to="/login">Start for free <ArrowRight size={17} /></Link><a className="landing-text-link" href="#features">See how it works <ChevronRight size={16} /></a></div>
          <div className="landing-proof"><span><Check size={13} /> No card required</span><span><Check size={13} /> Built for growing teams</span></div>
        </div>
        <div className="landing-hero-visual" aria-label="StockRoom dashboard preview">
          <div className="landing-orbit landing-orbit-one" /><div className="landing-orbit landing-orbit-two" />
          <div className="landing-preview-window">
            <div className="preview-topbar"><span className="preview-dots"><i /><i /><i /></span><small>stockroom / dashboard</small><span className="preview-avatar">AM</span></div>
            <div className="preview-body"><div className="preview-sidebar"><strong><span>Stock</span>Room</strong><span className="preview-side-active">Overview</span><span>Inventory</span><span>Sales</span><span>Reports</span></div><div className="preview-main"><div className="preview-heading"><span><small>Tuesday, 18 September</small><strong>Good morning, Alex</strong></span><b>Today <ChevronRight size={12} /></b></div><div className="preview-metrics"><div><small>Today's sales</small><strong>N482,400</strong><em>+18.4%</em></div><div><small>Products in stock</small><strong>1,284</strong><em>Healthy</em></div><div><small>Stock alerts</small><strong>08</strong><em className="preview-alert">Needs attention</em></div></div><div className="preview-chart"><div className="preview-chart-heading"><span>Sales this week</span><small>Last 7 days</small></div><div className="preview-bars"><i style={{ height: "42%" }} /><i style={{ height: "60%" }} /><i style={{ height: "48%" }} /><i style={{ height: "78%" }} /><i style={{ height: "65%" }} /><i style={{ height: "92%" }} /><i style={{ height: "72%" }} /></div></div><div className="preview-bottom"><div><small>Recent activity</small><p><span /> POS sale recorded <b>2m</b></p><p><span /> Stock replenished <b>18m</b></p></div><div><small>Top product</small><strong>Everyday Essentials</strong><b>₦94,200 sold</b></div></div></div></div>
          </div>
        </div>
      </section>

      <section className="landing-trust"><span>One workspace for</span><b>Retail</b><b>Hospitality</b><b>Distribution</b><b>Pharmacy</b><b>Services</b></section>

      <section className="landing-section landing-features" id="features"><div className="landing-section-intro"><p className="landing-eyebrow">What you get</p><h2>Everything your business needs to keep moving.</h2><p>One connected system for the work that happens every day, from the first sale to the end-of-day number.</p></div><div className="landing-feature-grid">{features.map(({ icon: Icon, number, title, text }) => <article className="landing-feature" key={number}><span className="landing-feature-number">{number}</span><span className="landing-feature-icon"><Icon size={20} /></span><h3>{title}</h3><p>{text}</p><a href="#pricing">Explore feature <ArrowRight size={14} /></a></article>)}</div></section>

      <section className="landing-section landing-signal" id="guide"><div className="landing-signal-copy"><p className="landing-eyebrow">A better daily rhythm</p><h2>Less chasing. More knowing.</h2><p>Every sale, adjustment, order, and branch update becomes a signal you can act on. StockRoom keeps the details moving quietly in the background.</p><Link className="landing-outline-button" to="/login">Open your workspace <ArrowRight size={16} /></Link></div><div className="landing-signal-list"><div><span>01</span><strong>Open the dashboard</strong><small>See what needs attention before the day gets loud.</small></div><div><span>02</span><strong>Sell and replenish</strong><small>Keep checkout and stock in sync automatically.</small></div><div><span>03</span><strong>Close with confidence</strong><small>Review sales, margins, and activity in one place.</small></div></div></section>

      <section className="landing-section landing-pricing" id="pricing"><div className="landing-section-intro"><p className="landing-eyebrow">Simple pricing</p><h2>Start small. Grow when you are ready.</h2><p>Begin with the essentials and add more control as your operation expands.</p></div><div className="landing-plan-grid">{plans.map((plan) => <article className={`landing-plan ${plan.featured ? "is-featured" : ""}`} key={plan.name}>{plan.featured && <span className="landing-plan-tag">Most popular</span>}<p>{plan.name}</p><h3>{plan.price}{plan.price !== "Free" && <small>/ month</small>}</h3><span>{plan.detail}</span><ul>{plan.features.map((feature) => <li key={feature}><Check size={14} /> {feature}</li>)}</ul><Link className={plan.featured ? "landing-primary-button" : "landing-outline-button"} to={`/subscription/checkout?plan=${plan.tier}`}>Choose {plan.name} <ArrowRight size={15} /></Link></article>)}</div></section>

      <section className="landing-bottom-links" id="blog"><div><p className="landing-eyebrow">From the field</p><h2>Practical ideas for better business days.</h2></div><a href="#guide">Read the guide <ArrowRight size={15} /></a></section><section className="landing-affiliates" id="affiliates"><span>Know a business that needs more clarity?</span><a href="mailto:hello@stockroom.local">Become a StockRoom partner <ArrowRight size={15} /></a></section>
      <footer className="landing-footer"><a className="landing-brand" href="#top"><span className="landing-brand-mark"><Store size={17} /></span><strong><b>Stock</b>Room</strong></a><span>Sales, stock, and business control in one room.</span><small>© 2026 StockRoom</small></footer>
    </main>
  );
}

export default Landing;
