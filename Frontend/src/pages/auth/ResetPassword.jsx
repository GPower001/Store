import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import { AuthFrame } from "./Login";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: "" });
  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      await resetPassword(token, form);
      navigate("/login", { state: { message: "Your password has been reset. Sign in with your new password." } });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  };

  return (
    <AuthFrame variant="login">
      <div className="af-panel-heading">
        <p className="af-kicker">New password</p>
        <h2>Reset your password</h2>
        <p>Choose a new password with at least 8 characters.</p>
      </div>
      <form className="af-form" onSubmit={handleSubmit}>
        <label className="af-field-label" htmlFor="new-password">New password</label>
        <div className="af-input-wrap">
          <LockKeyhole size={18} aria-hidden="true" />
          <input id="new-password" name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={updateField} minLength="8" required autoComplete="new-password" />
          <button type="button" className="af-icon-button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <label className="af-field-label" htmlFor="confirm-password">Confirm password</label>
        <div className="af-input-wrap">
          <LockKeyhole size={18} aria-hidden="true" />
          <input id="confirm-password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={updateField} minLength="8" required autoComplete="new-password" />
          <button type="button" className="af-icon-button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        {status.error && <p className="af-error" role="alert">{status.error}</p>}
        <button className="af-submit" type="submit" disabled={status.loading}>{status.loading ? "Resetting password..." : <>Save new password <ArrowRight size={18} /></>}</button>
        <Link className="af-back-link" to="/login">Back to sign in</Link>
      </form>
    </AuthFrame>
  );
}

export default ResetPassword;
