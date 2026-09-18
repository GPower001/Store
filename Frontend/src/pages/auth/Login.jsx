import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

function Login() {
	const navigate = useNavigate();
	const authLogin = useAuthStore((state) => state.login);
	const [form, setForm] = useState({ email: "", password: "" });
	const [showPassword, setShowPassword] = useState(false);
	const [status, setStatus] = useState({ loading: false, error: "" });
	const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

	const handleSubmit = async (event) => {
		event.preventDefault();
		setStatus({ loading: true, error: "" });
		try {
			await authLogin(form.email, form.password);
			navigate("/dashboard");
		} catch (error) {
			setStatus({ loading: false, error: error.message });
		}
	};

	return <AuthFrame variant="login" eyebrow="Welcome back" title="Your stockroom, in rhythm." description="Sign in to keep every item, order, and branch moving with confidence.">
		<div className="auth-panel-heading"><p className="panel-kicker">Account access</p><h2>Sign in</h2><p>Use your organization email to continue.</p></div>
		<form className="auth-form" onSubmit={handleSubmit}>
			<label className="field-label" htmlFor="email">Work email</label>
			<div className="input-wrap"><Mail size={18} aria-hidden="true" /><input id="email" name="email" type="email" placeholder="you@company.com" value={form.email} onChange={updateField} required autoComplete="email" /></div>
			<div className="field-row"><label className="field-label" htmlFor="password">Password</label><button type="button" className="text-button">Forgot password?</button></div>
			<div className="input-wrap"><LockKeyhole size={18} aria-hidden="true" /><input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={form.password} onChange={updateField} required autoComplete="current-password" /><button type="button" className="icon-button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
			{status.error && <p className="form-error" role="alert">{status.error}</p>}
			<button className="submit-button" type="submit" disabled={status.loading}>{status.loading ? "Checking your account..." : <>Enter workspace <ArrowRight size={18} /></>}</button>
		</form>
		<p className="auth-switch">New to StockRoom? <Link to="/register">Create an organization</Link></p>
	</AuthFrame>;
}

function AuthFrame({ variant = "register", children }) {
	return <main className={`auth-page auth-${variant}`}><div className="auth-shell"><header className="auth-topbar"><div className="brand-mark"><span>ST</span> <strong><span className="brand-stock">Stock</span><span className="brand-room">Room</span></strong></div><span className="auth-secure-label">Secure workspace access</span></header><section className="auth-form-side"><div className="auth-panel"><nav className={`auth-mode-toggle ${variant === "register" ? "register-active" : "login-active"}`} aria-label="Authentication page"><span className="auth-mode-indicator" aria-hidden="true" /><Link className={variant === "login" ? "is-active" : ""} to="/login">Log in</Link><Link className={variant === "register" ? "is-active" : ""} to="/register">Register</Link></nav><div className="auth-page-content" key={variant}>{children}</div></div></section><footer className="auth-shell-footer"><span className="status-dot" /> StockRoom keeps your workspace organized and secure.</footer></div></main>;
}

export { AuthFrame };
export default Login;
