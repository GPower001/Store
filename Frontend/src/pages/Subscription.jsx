// import { useEffect, useState } from "react";
// import { ArrowUpRight, Check, CreditCard, Minus, Plus, ShieldCheck } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import { cancelSubscription, getSubscriptionLimits, getSubscriptionPlans, getSubscriptionStatus, initializeSubscriptionPayment } from "../services/subscriptionService";

// const fallbackPlans = { free: { name: "Starter", price: 0, features: ["100 products", "1 branch", "1 staff member"] }, basic: { name: "Growth", price: 10000, features: ["1,000 products", "5 branches", "10 staff members"] }, premium: { name: "Scale", price: 25000, features: ["Unlimited products", "Multiple branches", "Advanced permissions"] } };
// const money = (value) => `N${Number(value || 0).toLocaleString("en-NG")}`;

// function Subscription() {
//   const navigate = useNavigate();
//   const [status, setStatus] = useState(null);
//   const [plans, setPlans] = useState(fallbackPlans);
//   const [limits, setLimits] = useState(null);
//   const [slots, setSlots] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     let active = true;
//     Promise.all([getSubscriptionStatus(), getSubscriptionPlans(), getSubscriptionLimits()]).then(([subscription, availablePlans, subscriptionLimits]) => { if (active) { setStatus(subscription); setPlans(availablePlans.plans || fallbackPlans); setLimits(subscriptionLimits); } }).catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load subscription details"); }).finally(() => { if (active) setLoading(false); });
//     return () => { active = false; };
//   }, []);

//   const currentTier = status?.subscription?.tier || "free";
//   const currentPlan = status?.plan || plans[currentTier] || fallbackPlans.free;
//   const renewal = status?.subscription?.renewal;
//   const addSlots = async () => { if (currentTier === "free") { navigate("/subscription/checkout?plan=growth"); return; } setSaving(true); setError(""); try { const payment = await initializeSubscriptionPayment(null, Number(slots)); window.location.href = payment.authorizationUrl; } catch (requestError) { setError(requestError.response?.data?.message || "Unable to start staff slot payment"); setSaving(false); } };
//   const cancel = async () => { if (!window.confirm("Cancel this subscription? Access continues until the current period ends.")) return; setSaving(true); try { const result = await cancelSubscription("Cancelled from subscription settings"); setMessage(result.message); } catch (requestError) { setError(requestError.response?.data?.message || "Unable to cancel subscription"); } finally { setSaving(false); } };
//   const usageRows = limits ? Object.entries(limits).map(([key, value]) => ({ key, ...value })).filter((row) => ["items", "branches", "staff", "admins"].includes(row.key)) : [];

//   return <div className="subscription-manage-page"><header className="dashboard-heading subscription-manage-heading"><div><p className="panel-kicker">Billing and access</p><h1><CreditCard size={29} /> Subscription</h1><p className="dashboard-subtitle">Manage your plan, usage, and staff capacity.</p></div><Link className="secondary-action" to="/settings">Settings <ArrowUpRight size={15} /></Link></header>{error && <div className="subscription-manage-error">{error}</div>}{message && <div className="subscription-manage-success"><Check size={15} /> {message}</div>}{loading ? <div className="dashboard-loading">Loading subscription...</div> : <><section className="subscription-manage-hero"><div><span className="subscription-current-label">Current plan</span><h2>{currentPlan.name || currentTier}</h2><p>{status?.subscription?.status || "active"} {renewal?.daysRemaining !== undefined ? `· ${renewal.daysRemaining} days remaining` : ""}</p></div><strong>{money(status?.subscription?.monthlyCost?.total)}<small>/ month</small></strong><ShieldCheck size={25} /></section><section className="subscription-usage"><div className="subscription-section-heading"><div><p className="panel-kicker">Workspace capacity</p><h2>Usage and limits</h2></div></div><div className="subscription-usage-grid">{usageRows.map((row) => <div className="subscription-usage-card" key={row.key}><div><span>{row.key}</span><strong>{row.current} / {row.max}</strong></div><div className="usage-track"><span style={{ width: `${Math.min(100, (row.current / Math.max(row.max, 1)) * 100)}%` }} /></div></div>)}</div></section><section className="subscription-plan-grid">{Object.entries(plans).map(([tier, plan]) => <article className={`subscription-manage-plan ${tier === currentTier ? "current" : ""}`} key={tier}><div className="subscription-plan-top"><span>{plan.name}</span>{tier === currentTier && <b>Current</b>}</div><strong>{money(plan.price)}<small>{plan.price ? "/ month" : ""}</small></strong><ul>{(plan.features || []).map((feature) => <li key={feature}><Check size={14} /> {feature}</li>)}</ul>{tier !== currentTier && tier !== "free" && <button type="button" className="primary-action-dark" onClick={() => navigate(`/subscription/checkout?plan=${tier === "basic" ? "growth" : "scale"}`)}>Choose {plan.name} <ArrowUpRight size={14} /></button>}</article>)}</section><section className="subscription-actions"><div><p className="panel-kicker">Team capacity</p><h2>Add staff slots</h2><p>{currentTier === "free" ? "Upgrade your plan to add staff capacity." : "Increase your staff limit without changing your current plan."}</p></div><div className="staff-slot-control"><button type="button" onClick={() => setSlots((value) => Math.max(1, value - 1))}><Minus size={15} /></button><strong>{slots}</strong><button type="button" onClick={() => setSlots((value) => value + 1)}><Plus size={15} /></button><button type="button" className="primary-action-dark" onClick={addSlots} disabled={saving}>{currentTier === "free" ? "Upgrade to add staff" : "Add slots"}</button></div></section><button type="button" className="subscription-cancel" onClick={cancel} disabled={saving}>Cancel subscription</button></>}</div>;
// }

// export default Subscription;

import { useEffect, useState } from "react";
import { ArrowUpRight, Check, CreditCard, Minus, Plus, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cancelSubscription, getSubscriptionLimits, getSubscriptionPlans, getSubscriptionStatus, initializeSubscriptionPayment } from "../services/subscriptionService";

const fallbackPlans = { free: { name: "Starter", price: 0, features: ["100 products", "1 branch", "1 staff member"] }, basic: { name: "Growth", price: 10000, features: ["1,000 products", "5 branches", "10 staff members"] }, premium: { name: "Scale", price: 25000, features: ["Unlimited products", "Multiple branches", "Advanced permissions"] } };
const money = (value) => `N${Number(value || 0).toLocaleString("en-NG")}`;

function Subscription() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [plans, setPlans] = useState(fallbackPlans);
  const [limits, setLimits] = useState(null);
  const [slots, setSlots] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getSubscriptionStatus(), getSubscriptionPlans(), getSubscriptionLimits()]).then(([subscription, availablePlans, subscriptionLimits]) => { if (active) { setStatus(subscription); setPlans(availablePlans.plans || fallbackPlans); setLimits(subscriptionLimits); } }).catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load subscription details"); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const currentTier = status?.subscription?.tier || "free";
  const currentPlan = status?.plan || plans[currentTier] || fallbackPlans.free;
  const renewal = status?.subscription?.renewal;
  const addSlots = async () => { if (currentTier === "free") { navigate("/subscription/checkout?plan=growth"); return; } setSaving(true); setError(""); try { const payment = await initializeSubscriptionPayment(null, Number(slots)); window.location.href = payment.authorizationUrl; } catch (requestError) { setError(requestError.response?.data?.message || "Unable to start staff slot payment"); setSaving(false); } };
  const cancel = async () => { if (!window.confirm("Cancel this subscription? Access continues until the current period ends.")) return; setSaving(true); try { const result = await cancelSubscription("Cancelled from subscription settings"); setMessage(result.message); } catch (requestError) { setError(requestError.response?.data?.message || "Unable to cancel subscription"); } finally { setSaving(false); } };
  const usageRows = limits ? Object.entries(limits).map(([key, value]) => ({ key, ...value })).filter((row) => ["items", "branches", "staff", "admins"].includes(row.key)) : [];

  return (
    <div className="sub">
      <header className="sub-hero">
        <div className="sub-hero-copy">
          <p className="sub-date">Billing and access</p>
          <h1>Subscription</h1>
          <p className="sub-hero-sub">Manage your plan, usage, and staff capacity.</p>
        </div>
        <div className="sub-hero-actions">
          <Link className="sub-btn sub-btn-light" to="/settings">
            Settings <ArrowUpRight size={18} />
          </Link>
        </div>
      </header>

      {error && (
        <div className="sub-error" role="alert">
          <CreditCard size={18} /> {error}
        </div>
      )}
      {message && (
        <div className="sub-success" role="status">
          <Check size={18} /> {message}
        </div>
      )}

      {loading ? (
        <div className="sub-loading" role="status">
          <span className="sub-spinner" aria-hidden="true" />
          <span>Loading subscription...</span>
        </div>
      ) : (
        <>
          {/* Current plan banner */}
          <section className="sub-current" aria-label="Current plan">
            <div className="sub-current-copy">
              <span className="sub-current-label">Current plan</span>
              <h2>{currentPlan.name || currentTier}</h2>
              <p>
                {status?.subscription?.status || "active"}
                {renewal?.daysRemaining !== undefined ? ` · ${renewal.daysRemaining} days remaining` : ""}
              </p>
            </div>
            <strong className="sub-current-price">
              {money(status?.subscription?.monthlyCost?.total)}
              <small>/ month</small>
            </strong>
            <span className="sub-current-icon"><ShieldCheck size={28} /></span>
          </section>

          {/* Usage */}
          <section className="sub-panel" aria-label="Usage and limits">
            <div className="sub-panel-head">
              <div>
                <p className="sub-kicker">Workspace capacity</p>
                <h2>Usage and limits</h2>
              </div>
            </div>
            <div className="sub-usage-grid">
              {usageRows.map((row) => {
                const percent = Math.min(100, (row.current / Math.max(row.max, 1)) * 100);
                const tone = percent >= 90 ? "pink" : percent >= 70 ? "sun" : "sky";
                return (
                  <div className={`sub-usage-card tone-${tone}`} key={row.key}>
                    <div className="sub-usage-head">
                      <span className="sub-usage-label">{row.key}</span>
                      <strong className="sub-usage-count">{row.current} / {row.max}</strong>
                    </div>
                    <div className="sub-usage-track">
                      <span style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Plans */}
          <section className="sub-plans" aria-label="Available plans">
            {Object.entries(plans).map(([tier, plan]) => {
              const isCurrent = tier === currentTier;
              const isFeatured = tier === "basic";
              return (
                <article key={tier} className={`sub-plan ${isCurrent ? "is-current" : ""} ${isFeatured ? "is-featured" : ""}`}>
                  <div className="sub-plan-head">
                    <span className="sub-plan-name">{plan.name}</span>
                    {isCurrent && <b className="sub-plan-tag is-current">Current</b>}
                    {isFeatured && !isCurrent && <b className="sub-plan-tag is-featured">Popular</b>}
                  </div>
                  <strong className="sub-plan-price">
                    {money(plan.price)}
                    <small>{plan.price ? "/ month" : ""}</small>
                  </strong>
                  <ul className="sub-plan-features">
                    {(plan.features || []).map((feature) => (
                      <li key={feature}><Check size={15} /> {feature}</li>
                    ))}
                  </ul>
                  {tier !== currentTier && tier !== "free" && (
                    <button
                      type="button"
                      className="sub-btn sub-btn-blue sub-plan-cta"
                      onClick={() => navigate(`/subscription/checkout?plan=${tier === "basic" ? "growth" : "scale"}`)}
                    >
                      Choose {plan.name} <ArrowUpRight size={16} />
                    </button>
                  )}
                </article>
              );
            })}
          </section>

          {/* Team slots */}
          <section className="sub-panel sub-slots" aria-label="Team capacity">
            <div className="sub-slots-copy">
              <p className="sub-kicker">Team capacity</p>
              <h2>Add staff slots</h2>
              <p>
                {currentTier === "free"
                  ? "Upgrade your plan to add staff capacity."
                  : "Increase your staff limit without changing your current plan."}
              </p>
            </div>
            <div className="sub-slot-control">
              <button type="button" onClick={() => setSlots((value) => Math.max(1, value - 1))} aria-label="Decrease slots">
                <Minus size={17} />
              </button>
              <strong>{slots}</strong>
              <button type="button" onClick={() => setSlots((value) => value + 1)} aria-label="Increase slots">
                <Plus size={17} />
              </button>
              <button type="button" className="sub-btn sub-btn-blue" onClick={addSlots} disabled={saving}>
                {currentTier === "free" ? "Upgrade to add staff" : "Add slots"}
              </button>
            </div>
          </section>

          <button type="button" className="sub-cancel" onClick={cancel} disabled={saving}>
            Cancel subscription
          </button>
        </>
      )}
    </div>
  );
}

export default Subscription;