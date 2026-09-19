import { useEffect, useState } from "react";
import { ArrowLeft, Check, CreditCard, ShieldCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { initializeSubscriptionPayment, verifySubscriptionPayment } from "../services/subscriptionService";

const plans = {
  starter: { tier: "free", name: "Starter", price: "Free", features: ["100 products", "1 branch", "2 team members"] },
  growth: { tier: "basic", name: "Growth", price: "N10,000", features: ["1,000 products", "5 branches", "10 team members"] },
  scale: { tier: "premium", name: "Scale", price: "N25,000", features: ["Unlimited products", "Multiple branches", "Advanced permissions"] },
};

function SubscriptionCheckout() {
  const [params] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const selected = plans[params.get("plan")] || plans.growth;
  const reference = params.get("reference");
  const [loading, setLoading] = useState(Boolean(reference));
  const [message, setMessage] = useState(reference ? "Confirming your payment..." : "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference || !user) return;
    verifySubscriptionPayment(reference)
      .then((result) => setMessage(result.message || "Subscription activated successfully."))
      .catch((requestError) => setError(requestError.response?.data?.message || "Payment verification failed"))
      .finally(() => setLoading(false));
  }, [reference, user]);

  const handlePayment = async () => {
    if (selected.tier === "free") return;
    setLoading(true);
    setError("");
    try {
      const payment = await initializeSubscriptionPayment(selected.tier);
      window.location.href = payment.authorizationUrl;
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to start payment");
      setLoading(false);
    }
  };

  if (!user) {
    return <main className="subscription-page"><section className="subscription-locked"><ShieldCheck size={32} /><p className="pos-kicker">Secure checkout</p><h1>Sign in to choose a plan</h1><p>Your organization details are needed to initialize a secure Paystack payment.</p><Link className="landing-primary-button" to={`/login?redirect=/subscription/checkout?plan=${params.get("plan") || "growth"}`}>Go to login <ArrowLeft size={15} /></Link></section></main>;
  }

  return <main className="subscription-page"><div className="subscription-shell"><Link className="subscription-back" to="/subscription"><ArrowLeft size={15} /> Back to subscription</Link><div className="subscription-grid"><section className="subscription-copy"><p className="pos-kicker">Secure checkout</p><h1>Choose a plan that keeps you moving.</h1><p>Payments are processed securely by Paystack. Your subscription is activated only after the payment is verified by StockRoom.</p><div className="subscription-trust"><ShieldCheck size={18} /><span><strong>Protected payment</strong><small>Card and bank transfer options are handled by Paystack.</small></span></div></section><section className="subscription-card"><div className="subscription-card-top"><span className="subscription-plan-mark"><CreditCard size={17} /></span><span>Monthly plan</span></div><h2>{selected.name}</h2><strong className="subscription-price">{selected.price}<small>{selected.tier !== "free" && "/ month"}</small></strong><ul>{selected.features.map((feature) => <li key={feature}><Check size={14} /> {feature}</li>)}</ul>{message && <div className="subscription-message">{message}</div>}{error && <div className="subscription-error">{error}</div>}{selected.tier === "free" ? <Link className="subscription-pay-button" to="/register">Start free trial <ArrowLeft size={15} /></Link> : <button className="subscription-pay-button" type="button" onClick={handlePayment} disabled={loading}>{loading ? "Connecting to Paystack..." : `Pay ${selected.price}`} <ArrowLeft size={15} /></button>}<small className="subscription-footnote">Cancel anytime. No payment details are stored by StockRoom.</small></section></div></div></main>;
}

export default SubscriptionCheckout;
