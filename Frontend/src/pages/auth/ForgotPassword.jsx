import { useState } from "react";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../services/authService";
import { AuthFrame } from "./Login";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", sent: false });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "", sent: false });
    try {
      await requestPasswordReset(email);
      setStatus({ loading: false, error: "", sent: true });
    } catch (error) {
      setStatus({ loading: false, error: error.message, sent: false });
    }
  };

  return (
    <AuthFrame variant="login">
      <div className="af-panel-heading">
        <p className="af-kicker">Account recovery</p>
        <h2>Forgot your password?</h2>
        <p>Enter your work email and we&apos;ll send a secure reset link.</p>
      </div>
      {status.sent ? (
        <div className="af-form">
          <p className="af-success" role="status">If an account exists for that email, a reset link has been sent. Check your inbox and spam folder.</p>
          <Link className="af-submit af-submit-link" to="/login">Back to sign in <ArrowRight size={18} /></Link>
        </div>
      ) : (
        <form className="af-form" onSubmit={handleSubmit}>
          <label className="af-field-label" htmlFor="reset-email">Work email</label>
          <div className="af-input-wrap">
            <Mail size={18} aria-hidden="true" />
            <input id="reset-email" type="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </div>
          {status.error && <p className="af-error" role="alert">{status.error}</p>}
          <button className="af-submit" type="submit" disabled={status.loading}>{status.loading ? "Sending link..." : <>Send reset link <ArrowRight size={18} /></>}</button>
          <Link className="af-back-link" to="/login"><ArrowLeft size={15} /> Back to sign in</Link>
        </form>
      )}
    </AuthFrame>
  );
}

export default ForgotPassword;
