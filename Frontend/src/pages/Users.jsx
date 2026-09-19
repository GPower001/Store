import { useEffect, useMemo, useState } from "react";
import { Check, Edit3, Mail, Plus, RefreshCw, Trash2, UserRound, X } from "lucide-react";
import { getBranches } from "../services/branchService";
import { createTeamMember, deleteTeamMember, getTeamMembers, updateTeamMember } from "../services/teamService";

const emptyUser = { name: "", email: "", password: "", role: "Staff", branchId: "", isActive: true };
const roles = ["Admin", "Manager", "Nurse", "Staff"];

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

  return <div className="workspace-page users-page"><header className="dashboard-heading workspace-heading"><div><p className="panel-kicker">People and access</p><h1><UserRound size={29} /> Team members</h1><p className="dashboard-subtitle">Give each person the right role and branch access.</p></div><div className="dashboard-actions"><button className="secondary-action" onClick={loadUsers} disabled={loading}><RefreshCw size={15} /> Refresh</button><button className="primary-action-dark" onClick={openCreate}><Plus size={16} /> Add member</button></div></header>{error && <div className="workspace-error" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss error"><X size={14} /></button></div>}<section className="workspace-stat-row"><Stat label="Team members" value={users.length} /><Stat label="Active members" value={users.filter((user) => user.isActive !== false).length} /><Stat label="Admins and managers" value={users.filter((user) => ["Admin", "Manager"].includes(user.role)).length} /></section><section className="team-panel"><div className="team-toolbar"><label className="team-search"><UserRound size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search team members" /></label></div>{loading ? <div className="workspace-empty">Loading team members...</div> : visibleUsers.length ? <div className="team-table-wrap"><table className="team-table"><thead><tr><th>Member</th><th>Role</th><th>Branch</th><th>Status</th><th /></tr></thead><tbody>{visibleUsers.map((user) => <tr key={user._id}><td><div className="team-person"><span>{user.name?.slice(0, 1).toUpperCase()}</span><div><strong>{user.name}</strong><small><Mail size={11} /> {user.email}</small></div></div></td><td><span className={`team-role role-${user.role.toLowerCase()}`}>{user.role}</span></td><td>{user.branchId?.name || "All branches"}</td><td><span className={`team-status ${user.isActive === false ? "inactive" : "active"}`}>{user.isActive === false ? "Inactive" : "Active"}</span></td><td><div className="team-actions"><button onClick={() => openEdit(user)} title="Edit member"><Edit3 size={14} /></button><button className="danger-action" onClick={() => remove(user)} title="Delete member"><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div> : <div className="workspace-empty"><UserRound size={30} /><strong>No team members found</strong><span>Invite the people who keep your operation moving.</span><button className="primary-action-dark" onClick={openCreate}><Plus size={15} /> Add member</button></div>}</section>{showForm && <UserModal form={form} editing={editing} branches={branches} saving={saving} updateForm={updateForm} submit={submit} close={() => !saving && setShowForm(false)} />}</div>;
}

function Stat({ label, value }) { return <div className="workspace-stat"><small>{label}</small><strong>{value}</strong></div>; }
function UserModal({ form, editing, branches, saving, updateForm, submit, close }) { return <div className="workspace-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><form className="workspace-modal" onSubmit={submit}><div className="workspace-modal-header"><div><p className="panel-kicker">{editing ? "Edit member" : "New member"}</p><h2>{editing ? "Update team access" : "Add a team member"}</h2></div><button type="button" className="icon-button" onClick={close} aria-label="Close"><X size={18} /></button></div><div className="workspace-form-grid"><Field label="Full name" name="name" value={form.name} onChange={updateForm} required /><Field label="Email" name="email" type="email" value={form.email} onChange={updateForm} required /><Field label={editing ? "New password (optional)" : "Temporary password"} name="password" type="password" value={form.password} onChange={updateForm} required={!editing} /><label className="workspace-field"><span>Role</span><select name="role" value={form.role} onChange={updateForm}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label><label className="workspace-field"><span>Branch access</span><select name="branchId" value={form.branchId} onChange={updateForm} required={form.role !== "Admin"}><option value="">{form.role === "Admin" ? "All branches" : "Select a branch"}</option>{branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}</select></label></div><label className="workspace-checkbox"><input type="checkbox" checked={form.isActive !== false} onChange={(event) => updateForm({ target: { name: "isActive", value: event.target.checked } })} /> Account is active</label><div className="workspace-modal-actions"><button type="button" className="secondary-action" onClick={close}>Cancel</button><button className="primary-action-dark" disabled={saving}>{saving ? "Saving..." : <><Check size={15} /> Save member</>}</button></div></form></div>; }
function Field({ label, ...props }) { return <label className="workspace-field"><span>{label}</span><input {...props} /></label>; }
export default Users;
