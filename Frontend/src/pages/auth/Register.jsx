import { useState } from "react";
import { ArrowRight, Building2, ChevronDown, Eye, EyeOff, Mail, MapPin, Phone, Search, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { registerTenant } from "../../services/authService";
import { AuthFrame } from "./Login";

function Register() {
	const navigate = useNavigate();
	const [form, setForm] = useState({ companyName: "", industry: "", city: "", state: "", referralCode: "", ownerName: "", phone: "", email: "", password: "", confirmPassword: "" });
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [industryOpen, setIndustryOpen] = useState(false);
	const [industrySearch, setIndustrySearch] = useState("");
	const [status, setStatus] = useState({ loading: false, error: "" });
	const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });
	const filteredIndustries = industries.filter((industry) => industry.toLowerCase().includes(industrySearch.toLowerCase()));
	const selectIndustry = (industry) => {
		setForm({ ...form, industry });
		setIndustrySearch("");
		setIndustryOpen(false);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setStatus({ loading: true, error: "" });
		try {
			await registerTenant(form);
			navigate("/dashboard");
		} catch (error) {
			setStatus({ loading: false, error: error.message });
		}
	};

	return <AuthFrame variant="register" eyebrow="Start organized" title="A sharper way to run inventory." description="Set up your workspace in minutes, then give your team a single source of truth.">
		<div className="auth-panel-heading"><p className="panel-kicker">New workspace</p><h2>Create your account</h2><p>Start your 30-day free trial. No card required.</p></div>
		<form className="auth-form register-form" onSubmit={handleSubmit}>
			<div className="register-section-label">Business details</div>
			<label className="field-label" htmlFor="companyName">Business name</label><div className="input-wrap"><Building2 size={18} aria-hidden="true" /><input id="companyName" name="companyName" placeholder="Northstar Goods" value={form.companyName} onChange={updateField} required /></div>
			<label className="field-label" htmlFor="industry-search">Industry</label>
			<div className={`industry-picker ${industryOpen ? "is-open" : ""}`}>
				<button type="button" className="input-wrap industry-trigger" onClick={() => setIndustryOpen(true)} aria-haspopup="listbox" aria-expanded={industryOpen}><Building2 size={17} aria-hidden="true" /><span className={form.industry ? "has-value" : "placeholder"}>{form.industry || "Select your industry"}</span><ChevronDown size={16} aria-hidden="true" /></button>
				{industryOpen && <div className="industry-options" role="listbox"><div className="industry-search-wrap"><Search size={16} aria-hidden="true" /><input id="industry-search" autoFocus value={industrySearch} onBlur={() => setTimeout(() => { setIndustryOpen(false); setIndustrySearch(""); }, 150)} onChange={(event) => { setIndustrySearch(event.target.value); setIndustryOpen(true); }} placeholder="Search industries..." aria-label="Search industries" /></div>{filteredIndustries.length ? filteredIndustries.map((industry) => <button type="button" role="option" aria-selected={form.industry === industry} className={form.industry === industry ? "is-selected" : ""} key={industry} onMouseDown={(event) => event.preventDefault()} onClick={() => selectIndustry(industry)}>{industry}</button>) : <p>No industries found.</p>}</div>}
			</div>
			<div className="two-fields"><div><label className="field-label" htmlFor="city">City</label><div className="input-wrap"><MapPin size={18} aria-hidden="true" /><input id="city" name="city" placeholder="Lagos" value={form.city} onChange={updateField} required /></div></div><div><label className="field-label" htmlFor="state">State</label><div className="input-wrap"><MapPin size={18} aria-hidden="true" /><input id="state" name="state" placeholder="Lagos State" value={form.state} onChange={updateField} required /></div></div></div>
			<label className="field-label" htmlFor="referralCode">Referral code <span>(optional)</span></label><div className="input-wrap"><input id="referralCode" name="referralCode" placeholder="Enter referral code" value={form.referralCode} onChange={updateField} /></div>
			<div className="register-section-label">Account details</div>
			<label className="field-label" htmlFor="ownerName">Your name</label><div className="input-wrap"><UserRound size={18} aria-hidden="true" /><input id="ownerName" name="ownerName" placeholder="Alex Morgan" value={form.ownerName} onChange={updateField} required autoComplete="name" /></div>
			<div className="two-fields"><div><label className="field-label" htmlFor="phone">Phone</label><div className="input-wrap"><Phone size={18} aria-hidden="true" /><input id="phone" name="phone" type="tel" placeholder="+234 801 234 5678" value={form.phone} onChange={updateField} required /></div></div><div><label className="field-label" htmlFor="register-email">Email</label><div className="input-wrap"><Mail size={18} aria-hidden="true" /><input id="register-email" name="email" type="email" placeholder="you@company.com" value={form.email} onChange={updateField} required autoComplete="email" /></div></div></div>
			<label className="field-label" htmlFor="register-password">Create password</label><div className="input-wrap"><LockIcon /><input id="register-password" name="password" type={showPassword ? "text" : "password"} placeholder="At least 8 characters" minLength="8" value={form.password} onChange={updateField} required autoComplete="new-password" /><button type="button" className="icon-button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
			<label className="field-label" htmlFor="confirm-password">Confirm password</label><div className="input-wrap"><LockIcon /><input id="confirm-password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Repeat your password" value={form.confirmPassword} onChange={updateField} required autoComplete="new-password" /><button type="button" className="icon-button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
			{status.error && <p className="form-error" role="alert">{status.error}</p>}
			<button className="submit-button" type="submit" disabled={status.loading}>{status.loading ? "Setting up workspace..." : <>Create workspace <ArrowRight size={18} /></>}</button>
		</form>
		<p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
	</AuthFrame>;
}

const industries = ["Retail/General trade", "Supermarket / Grocery", "Fashion and Apparel", "Food and Beverage", "Restaurant and Hospitality", "Health and beauty / cosmetics", "Pharmacy", "Electronics and Gadgets", "Building and Hardware", "Automotive and Spare-parts", "Furniture and Home", "Agriculture and Agro-Processing", "Manufacturing", "Wholesale / distribution", "Services", "Other"];

function LockIcon() { return <span className="lock-icon" aria-hidden="true"><Eye size={18} /></span>; }
export default Register;
