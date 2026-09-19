import { useEffect, useState } from "react";
import { Activity, Building2, Check, Edit3, MapPin, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createBranch, deleteBranch, getBranches, updateBranch } from "../services/branchService";

const emptyBranch = { name: "", location: "", address: "", phone: "", managerName: "", isActive: true };

function Branches() {
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(emptyBranch);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadBranches = () => {
    setLoading(true);
    getBranches().then(setBranches).catch((requestError) => setError(requestError.response?.data?.message || "Unable to load branches")).finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    getBranches().then((data) => { if (active) setBranches(data); }).catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load branches"); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const openCreate = () => { setEditing(null); setForm(emptyBranch); setShowForm(true); };
  const openEdit = (branch) => { setEditing(branch); setForm({ ...emptyBranch, ...branch }); setShowForm(true); };
  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      const saved = editing ? await updateBranch(editing._id, form) : await createBranch(form);
      setBranches((current) => editing ? current.map((branch) => branch._id === editing._id ? saved : branch) : [saved, ...current]);
      setShowForm(false);
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to save branch"); }
    finally { setSaving(false); }
  };
  const remove = async (branch) => {
    if (!window.confirm(`Delete ${branch.name}?`)) return;
    try { await deleteBranch(branch._id); setBranches((current) => current.filter((entry) => entry._id !== branch._id)); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to delete branch"); }
  };

  return <div className="workspace-page branches-page"><header className="dashboard-heading workspace-heading"><div><p className="panel-kicker">Workspace structure</p><h1><Building2 size={29} /> Branches</h1><p className="dashboard-subtitle">Keep each location, manager, and operating status organized.</p></div><div className="dashboard-actions"><Link className="secondary-action" to="/branches/activity"><Activity size={15} /> View activity</Link><button className="secondary-action" onClick={loadBranches} disabled={loading}><RefreshCw size={15} /> Refresh</button><button className="primary-action-dark" onClick={openCreate}><Plus size={16} /> Add branch</button></div></header>{error && <div className="workspace-error" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss error"><X size={14} /></button></div>}<section className="workspace-stat-row"><Stat label="Total branches" value={branches.length} /><Stat label="Active locations" value={branches.filter((branch) => branch.isActive !== false).length} /><Stat label="Managers assigned" value={branches.filter((branch) => branch.managerName).length} /></section>{loading ? <div className="workspace-empty">Loading branches...</div> : branches.length ? <section className="branch-grid">{branches.map((branch) => <article className="branch-card" key={branch._id}><div className="branch-card-heading"><span className="branch-icon"><Building2 size={19} /></span><span className={`branch-status ${branch.isActive === false ? "inactive" : "active"}`}>{branch.isActive === false ? "Inactive" : "Active"}</span></div><h2>{branch.name}</h2><p className="branch-location"><MapPin size={14} /> {branch.location || "Location not set"}</p><div className="branch-details"><span><small>Manager</small><strong>{branch.managerName || "Unassigned"}</strong></span><span><small>Contact</small><strong>{branch.phone || "No phone"}</strong></span></div><div className="branch-actions"><Link to={`/branches/activity?branchId=${branch._id}`}><Activity size={14} /> Activity</Link><button onClick={() => openEdit(branch)}><Edit3 size={14} /> Edit</button><button className="branch-delete" onClick={() => remove(branch)}><Trash2 size={14} /> Delete</button></div></article>)}</section> : <div className="workspace-empty"><Building2 size={30} /><strong>No branches yet</strong><span>Add the first location for your organization.</span><button className="primary-action-dark" onClick={openCreate}><Plus size={15} /> Add branch</button></div>}{showForm && <BranchModal form={form} editing={editing} saving={saving} updateForm={updateForm} submit={submit} close={() => !saving && setShowForm(false)} />}</div>;
}

function Stat({ label, value }) { return <div className="workspace-stat"><small>{label}</small><strong>{value}</strong></div>; }
function BranchModal({ form, editing, saving, updateForm, submit, close }) { return <div className="workspace-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><form className="workspace-modal" onSubmit={submit}><div className="workspace-modal-header"><div><p className="panel-kicker">{editing ? "Edit location" : "New location"}</p><h2>{editing ? "Update branch details" : "Add a branch"}</h2></div><button type="button" className="icon-button" onClick={close} aria-label="Close"><X size={18} /></button></div><div className="workspace-form-grid"><Field label="Branch name" name="name" value={form.name} onChange={updateForm} required /><Field label="Location" name="location" value={form.location} onChange={updateForm} placeholder="City or area" /><Field label="Address" name="address" value={form.address} onChange={updateForm} /><Field label="Phone" name="phone" value={form.phone} onChange={updateForm} /><Field label="Manager name" name="managerName" value={form.managerName} onChange={updateForm} /></div><label className="workspace-checkbox"><input type="checkbox" name="isActive" checked={form.isActive !== false} onChange={(event) => setFormValue(updateForm, "isActive", event.target.checked)} /> This branch is active</label><div className="workspace-modal-actions"><button type="button" className="secondary-action" onClick={close}>Cancel</button><button className="primary-action-dark" disabled={saving}>{saving ? "Saving..." : <><Check size={15} /> Save branch</>}</button></div></form></div>; }
function setFormValue(updateForm, name, value) { updateForm({ target: { name, value } }); }
function Field({ label, ...props }) { return <label className="workspace-field"><span>{label}</span><input {...props} /></label>; }
export default Branches;
