import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { verifyTwoFactorLogin } from "../../services/authService";

function Login() {
	const navigate = useNavigate();
	const authLogin = useAuthStore((state) => state.login);
	const [form, setForm] = useState({ email: "", password: "" });
	const [challengeToken, setChallengeToken] = useState("");
	const [code, setCode] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [status, setStatus] = useState({ loading: false, error: "" });
	const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

	const handleSubmit = async (event) => {
		event.preventDefault();
		setStatus({ loading: true, error: "" });
		try {
			const result = await authLogin(form.email, form.password);
			if (result.twoFactorRequired) {
				setChallengeToken(result.challengeToken);
				setStatus({ loading: false, error: "" });
				return;
			}
			navigate("/dashboard");
		} catch (error) {
			setStatus({ loading: false, error: error.message });
		}
	};
	const handleTwoFactor = async (event) => {
		event.preventDefault();
		setStatus({ loading: true, error: "" });
		try { await verifyTwoFactorLogin(challengeToken, code); window.location.href = "/dashboard"; }
		catch (error) { setStatus({ loading: false, error: error.message }); }
	};

	return <AuthFrame variant="login" eyebrow="Welcome back" title="Your stockroom, in rhythm." description="Sign in to keep every item, order, and branch moving with confidence.">
		<div className="auth-panel-heading"><p className="panel-kicker">Account access</p><h2>Sign in</h2><p>Use your organization email to continue.</p></div>
		{challengeToken ? <form className="auth-form" onSubmit={handleTwoFactor}><div className="two-factor-heading"><ShieldCheck size={24} /><strong>Authenticator verification</strong><span>Enter the 6-digit code from your authenticator app.</span></div><label className="field-label" htmlFor="two-factor-code">Verification code</label><div className="input-wrap"><ShieldCheck size={18} aria-hidden="true" /><input id="two-factor-code" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" autoComplete="one-time-code" required /></div>{status.error && <p className="form-error" role="alert">{status.error}</p>}<button className="submit-button" type="submit" disabled={status.loading || code.length !== 6}>{status.loading ? "Verifying..." : <>Verify and enter workspace <ArrowRight size={18} /></>}</button><button type="button" className="text-button two-factor-back" onClick={() => { setChallengeToken(""); setCode(""); setStatus({ loading: false, error: "" }); }}><ArrowLeft size={14} /> Use a different account</button></form> : <form className="auth-form" onSubmit={handleSubmit}>
			<label className="field-label" htmlFor="email">Work email</label>
			<div className="input-wrap"><Mail size={18} aria-hidden="true" /><input id="email" name="email" type="email" placeholder="you@company.com" value={form.email} onChange={updateField} required autoComplete="email" /></div>
			<div className="field-row"><label className="field-label" htmlFor="password">Password</label><button type="button" className="text-button">Forgot password?</button></div>
			<div className="input-wrap"><LockKeyhole size={18} aria-hidden="true" /><input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={form.password} onChange={updateField} required autoComplete="current-password" /><button type="button" className="icon-button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
			{status.error && <p className="form-error" role="alert">{status.error}</p>}
			<button className="submit-button" type="submit" disabled={status.loading}>{status.loading ? "Checking your account..." : <>Enter workspace <ArrowRight size={18} /></>}</button>
		</form>}
		<p className="auth-switch">New to StockRoom? <Link to="/register">Create an organization</Link></p>
	</AuthFrame>;
}

function AuthFrame({ variant = "register", children }) {
	return <main className={`auth-page auth-${variant}`}><div className="auth-shell"><header className="auth-topbar"><div className="brand-mark"><span>ST</span> <strong><span className="brand-stock">Stock</span><span className="brand-room">Room</span></strong></div><span className="auth-secure-label">Secure workspace access</span></header><section className="auth-form-side"><div className="auth-panel"><nav className={`auth-mode-toggle ${variant === "register" ? "register-active" : "login-active"}`} aria-label="Authentication page"><span className="auth-mode-indicator" aria-hidden="true" /><Link className={variant === "login" ? "is-active" : ""} to="/login">Log in</Link><Link className={variant === "register" ? "is-active" : ""} to="/register">Register</Link></nav><div className="auth-page-content" key={variant}>{children}</div></div></section><footer className="auth-shell-footer"><span className="status-dot" /> StockRoom keeps your workspace organized and secure.</footer></div></main>;
}

export { AuthFrame };
export default Login;
