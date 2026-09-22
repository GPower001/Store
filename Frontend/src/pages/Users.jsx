import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Edit3, Mail, Plus, RefreshCw, Trash2, UserRound, X } from "lucide-react";
import { getBranches } from "../services/branchService";
import { createTeamMember, deleteTeamMember, getTeamMembers, updateTeamMember } from "../services/teamService";

const emptyUser = { name: "", email: "", password: "", role: "Staff", branchId: "", isActive: true };
const roles = ["Admin", "Manager", "Staff"];

function Users() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(emptyUser);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getTeamMembers(), getBranches()]).then(([team, branchData]) => { if (active) { setUsers(team); setBranches(branchData); } }).catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load team workspace"); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const loadUsers = () => { setLoading(true); getTeamMembers().then(setUsers).catch((requestError) => setError(requestError.response?.data?.message || "Unable to load team members")).finally(() => setLoading(false)); };
  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const openCreate = () => { setEditing(null); setForm(emptyUser); setShowForm(true); };
  const openEdit = (user) => { setEditing(user); setForm({ ...emptyUser, ...user, branchId: user.branchId?._id || user.branchId || "", password: "" }); setShowForm(true); };
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form };
      if (payload.role !== "Admin" && !payload.branchId) {
        setError("Select a branch for non-admin staff members.");
        setSaving(false);
        return;
      }
      if (editing && !payload.password) delete payload.password;
      if (editing) {
        const saved = await updateTeamMember(editing._id, payload);
        setUsers((current) => current.map((user) => user._id === editing._id ? saved : user));
      } else {
        await createTeamMember(payload);
        setUsers(await getTeamMembers());
      }
      setShowForm(false);
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to save team member"); }
    finally { setSaving(false); }
  };
  const remove = async (user) => { if (!window.confirm(`Delete ${user.name}?`)) return; try { await deleteTeamMember(user._id); setUsers((current) => current.filter((entry) => entry._id !== user._id)); } catch (requestError) { setError(requestError.response?.data?.message || "Unable to delete team member"); } };
  const visibleUsers = useMemo(() => users.filter((user) => `${user.name} ${user.email} ${user.role} ${user.branchId?.name || ""}`.toLowerCase().includes(query.toLowerCase())), [query, users]);

  const activeCount = users.filter((user) => user.isActive !== false).length;
  const adminCount = users.filter((user) => ["Admin", "Manager"].includes(user.role)).length;

  return (
    <div className="tm">
      <header className="tm-hero">
        <div className="tm-hero-copy">
          <p className="tm-date">People and access</p>
          <h1>Team members</h1>
          <p className="tm-hero-sub">Give each person the right role and branch access.</p>
        </div>
        <div className="tm-hero-actions">
          <button type="button" className="tm-btn tm-btn-light" onClick={loadUsers} disabled={loading}>
            <RefreshCw size={18} /> Refresh
          </button>
          <button type="button" className="tm-btn tm-btn-blue" onClick={openCreate}>
            <Plus size={18} /> Add member
          </button>
        </div>
      </header>

      {error && (
        <div className="tm-alert" role="alert">
          <UserRound size={18} /> {error}
          <button onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button>
        </div>
      )}

      <section className="tm-metrics" aria-label="Team summary">
        <Stat label="Team members" value={users.length} tone="sky" icon={<UserRound size={22} />} />
        <Stat label="Active members" value={activeCount} tone="mint" icon={<Check size={22} />} />
        <Stat label="Admins and managers" value={adminCount} tone="sun" icon={<Edit3 size={22} />} />
      </section>

      <section className="tm-panel" aria-label="Team members list">
        <div className="tm-panel-head">
          <div>
            <h2>All members</h2>
            <p>{visibleUsers.length} {visibleUsers.length === 1 ? "member" : "members"} shown</p>
          </div>
          <div className="tm-panel-side">
            <label className="tm-search">
              <UserRound size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search team members" />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="tm-loading" role="status">
            <span className="tm-spinner" aria-hidden="true" />
            <span>Loading team members...</span>
          </div>
        ) : visibleUsers.length ? (
          <div className="tm-table-wrap">
            <table className="tm-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="tm-person">
                        <span className="tm-person-avatar">{user.name?.slice(0, 1).toUpperCase()}</span>
                        <div>
                          <strong>{user.name}</strong>
                          <small><Mail size={12} /> {user.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`tm-role role-${user.role.toLowerCase()}`}>{user.role}</span>
                    </td>
                    <td>{user.branchId?.name || "All branches"}</td>
                    <td>
                      <span className={`tm-status ${user.isActive === false ? "inactive" : "active"}`}>
                        {user.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td>
                      <div className="tm-actions">
                        <button type="button" onClick={() => openEdit(user)} title="Edit member"><Edit3 size={15} /></button>
                        <button type="button" className="tm-delete" onClick={() => remove(user)} title="Delete member"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="tm-empty">
            <span className="tm-empty-icon"><UserRound size={32} /></span>
            <strong>No team members found</strong>
            <span>Invite the people who keep your operation moving.</span>
            <button className="tm-btn tm-btn-blue" onClick={openCreate}>
              <Plus size={18} /> Add member
            </button>
          </div>
        )}
      </section>

      {showForm && (
        <UserModal
          form={form}
          editing={editing}
          branches={branches}
          saving={saving}
          updateForm={updateForm}
          submit={submit}
          close={() => !saving && setShowForm(false)}
        />
      )}
    </div>
  );
}

function Stat({ label, value, icon, tone = "sky" }) {
  return (
    <article className={`tm-metric tone-${tone}`}>
      <div className="tm-metric-head">
        <span className="tm-metric-label">{label}</span>
        <span className="tm-metric-icon">{icon}</span>
      </div>
      <strong className="tm-metric-value">{value}</strong>
    </article>
  );
}

function UserModal({ form, editing, branches, saving, updateForm, submit, close }) {
  return (
    <div className="tm-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <form className="tm-modal" onSubmit={submit}>
        <div className="tm-modal-header">
          <div>
            <p className="tm-kicker">{editing ? "Edit member" : "New member"}</p>
            <h2>{editing ? "Update team access" : "Add a team member"}</h2>
          </div>
          <button type="button" className="tm-icon-button" onClick={close} aria-label="Close"><X size={19} /></button>
        </div>
        <div className="tm-form-grid">
          <Field label="Full name" name="name" value={form.name} onChange={updateForm} required />
          <Field label="Email" name="email" type="email" value={form.email} onChange={updateForm} required />
          <Field label={editing ? "New password (optional)" : "Temporary password"} name="password" type="password" value={form.password} onChange={updateForm} required={!editing} />
          <label className="tm-field">
            <span>Role</span>
            <MemberDropdown name="role" value={form.role} onChange={updateForm} options={roles.map((role) => ({ value: role, label: role }))} />
          </label>
          <label className="tm-field">
            <span>Branch access</span>
            <MemberDropdown
              name="branchId"
              value={form.branchId}
              onChange={updateForm}
              required={form.role !== "Admin"}
              placeholder={form.role === "Admin" ? "All branches" : "Select a branch"}
              options={branches.map((branch) => ({ value: branch._id, label: branch.name }))}
            />
          </label>
        </div>
        <label className="tm-checkbox">
          <input
            type="checkbox"
            checked={form.isActive !== false}
            onChange={(event) => updateForm({ target: { name: "isActive", value: event.target.checked } })}
          />
          Account is active
        </label>
        <div className="tm-modal-actions">
          <button type="button" className="tm-btn tm-btn-light" onClick={close}>Cancel</button>
          <button className="tm-btn tm-btn-blue" disabled={saving}>
            {saving ? "Saving..." : <><Check size={16} /> Save member</>}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="tm-field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

function MemberDropdown({ name, value, onChange, options, placeholder, required }) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const closePicker = (event) => {
      if (!pickerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closePicker);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closePicker);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const selectOption = (nextValue) => {
    onChange({ target: { name, value: nextValue } });
    setOpen(false);
  };

  return (
    <div className={`tm-dropdown${open ? " is-open" : ""}`} ref={pickerRef}>
      <button type="button" className={`tm-dropdown-trigger${selected ? "" : " is-placeholder"}`} onClick={() => setOpen((current) => !current)} aria-haspopup="listbox" aria-expanded={open}>
        <span>{selected?.label || placeholder}</span>
        <ChevronDown size={17} aria-hidden="true" />
      </button>
      {required && <input className="tm-dropdown-required" tabIndex={-1} value={value} required onChange={() => {}} aria-hidden="true" />}
      {open && (
        <div className="tm-dropdown-menu" role="listbox">
          {placeholder && (
            <button type="button" role="option" aria-selected={!value} className={!value ? "is-selected" : ""} onClick={() => selectOption("")}>
              <span className="tm-dropdown-dot all" /> {placeholder} {!value && <Check size={16} />}
            </button>
          )}
          {options.map((option, index) => (
            <button type="button" role="option" aria-selected={value === option.value} className={value === option.value ? "is-selected" : ""} key={option.value} onClick={() => selectOption(option.value)}>
              <span className={`tm-dropdown-dot tone-${index % 4}`} /> {option.label} {value === option.value && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export default Users;