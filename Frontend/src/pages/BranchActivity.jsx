import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowDownLeft, ArrowUpRight, ChevronLeft, RefreshCw, RotateCcw, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { getBranches } from "../services/branchService";
import { getBranchActivity } from "../services/branchActivityService";

const movementLabels = { addition: "Stock added", removal: "Stock removed", adjustment: "Stock adjusted", transfer: "Stock transferred" };
const movementIcons = { addition: ArrowUpRight, removal: ArrowDownLeft, adjustment: RotateCcw, transfer: ArrowUpRight };

function BranchActivity() {
  const [branches, setBranches] = useState([]);
  const [activity, setActivity] = useState([]);
  const [filters, setFilters] = useState(() => ({ branchId: new URLSearchParams(window.location.search).get("branchId") || "", movementType: "", startDate: "", endDate: "" }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getBranches().then((data) => { if (active) { setBranches(data); if (data[0]) setFilters((current) => current.branchId ? current : { ...current, branchId: data[0]._id }); else setLoading(false); } }).catch((requestError) => { if (active) { setError(requestError.response?.data?.message || "Unable to load branches"); setLoading(false); } });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!filters.branchId) return undefined;
    let active = true;
    const params = { branchId: filters.branchId, movementType: filters.movementType, startDate: filters.startDate, endDate: filters.endDate };
    getBranchActivity(params).then((data) => { if (active) setActivity(data.activities || []); }).catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load branch activity"); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters.branchId, filters.movementType, filters.startDate, filters.endDate]);

  const updateFilter = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  const selectedBranch = branches.find((branch) => branch._id === filters.branchId);
  const stats = useMemo(() => activity.reduce((result, entry) => { result.total += 1; result[entry.movementType] = (result[entry.movementType] || 0) + 1; return result; }, { total: 0 }), [activity]);

  return <div className="branch-activity-page workspace-page"><header className="dashboard-heading workspace-heading"><div><Link className="workspace-back-link" to="/branches"><ChevronLeft size={15} /> Back to branches</Link><p className="panel-kicker">Branch oversight</p><h1><Activity size={29} /> Branch activity</h1><p className="dashboard-subtitle">See who changed stock, what moved, and when it happened.</p></div><button className="secondary-action" onClick={() => setFilters((current) => ({ ...current }))} disabled={loading}><RefreshCw size={15} /> Refresh</button></header>{error && <div className="workspace-error" role="alert">{error}</div>}<section className="branch-activity-controls"><label><span>Branch</span><select name="branchId" value={filters.branchId} onChange={updateFilter}><option value="">Select a branch</option>{branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}</select></label><label><span>Activity type</span><select name="movementType" value={filters.movementType} onChange={updateFilter}><option value="">All activity</option><option value="addition">Stock added</option><option value="removal">Stock removed</option><option value="adjustment">Stock adjusted</option><option value="transfer">Stock transferred</option></select></label><label><span>From</span><input type="date" name="startDate" value={filters.startDate} onChange={updateFilter} /></label><label><span>To</span><input type="date" name="endDate" value={filters.endDate} onChange={updateFilter} /></label></section>{selectedBranch && <><section className="workspace-stat-row"><div className="workspace-stat"><small>{selectedBranch.name} activity</small><strong>{stats.total}</strong></div><div className="workspace-stat"><small>Stock additions</small><strong>{stats.addition || 0}</strong></div><div className="workspace-stat"><small>Stock removals</small><strong>{stats.removal || 0}</strong></div></section><section className="activity-feed-panel"><div className="activity-feed-heading"><div><p className="panel-kicker">Live ledger</p><h2>{selectedBranch.name}</h2></div><span>{activity.length} recent events</span></div>{loading ? <div className="workspace-empty">Loading branch activity...</div> : activity.length ? <div className="branch-activity-feed">{activity.map((entry) => <ActivityRow key={entry.id} entry={entry} />)}</div> : <div className="workspace-empty"><Activity size={30} /><strong>No activity for this branch</strong><span>Stock changes will appear here as the team works.</span></div>}</section></>}</div>;
}

function ActivityRow({ entry }) { const Icon = movementIcons[entry.movementType] || Activity; return <article className="branch-activity-row"><span className={`activity-type-icon ${entry.color || "blue"}`}><Icon size={16} /></span><div className="branch-activity-main"><div className="branch-activity-title"><strong>{entry.item?.name || "Inventory item"}</strong><span>{movementLabels[entry.movementType] || entry.action}</span></div><p>{entry.reason || "Inventory update"}</p><small><UserRound size={11} /> {entry.user?.name || "Unknown user"} · {new Date(entry.timestamp).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</small></div><div className="branch-activity-quantity"><strong>{entry.movementType === "removal" ? "-" : "+"}{entry.quantity}</strong><small>{entry.previousQuantity} → {entry.newQuantity}</small></div></article>; }
export default BranchActivity;
