// import { useEffect, useMemo, useState } from "react";
// import { AlertTriangle, Bell, Check, Clock3, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
// import { getNotifications, markNotificationRead } from "../services/notificationService";

// const icons = { "low-stock": AlertTriangle, expired: XCircle, "expiring-soon": Clock3, "out-of-stock": ShieldAlert };
// const labels = { "low-stock": "Low stock", expired: "Expired item", "expiring-soon": "Expiring soon", "out-of-stock": "Out of stock" };

// function Notifications() {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("all");
//   const [error, setError] = useState("");

//   const load = () => { setLoading(true); getNotifications().then(setNotifications).catch((requestError) => setError(requestError.response?.data?.message || "Unable to load notifications")).finally(() => setLoading(false)); };
//   useEffect(() => { let active = true; getNotifications().then((data) => { if (active) setNotifications(data); }).catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load notifications"); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
//   const visible = useMemo(() => notifications.filter((notification) => filter === "all" || (filter === "unread" ? !notification.isRead : notification.type === filter)), [filter, notifications]);
//   const markRead = async (notification) => { if (notification.isRead) return; try { await markNotificationRead(notification._id); setNotifications((current) => current.map((entry) => entry._id === notification._id ? { ...entry, isRead: true } : entry)); } catch (requestError) { setError(requestError.response?.data?.message || "Unable to update notification"); } };

//   return <div className="notifications-page"><header className="dashboard-heading notifications-heading"><div><p className="panel-kicker">Workspace alerts</p><h1><Bell size={29} /> Notifications</h1><p className="dashboard-subtitle">Stay ahead of stock, expiry, and inventory issues.</p></div><button className="secondary-action" onClick={load} disabled={loading}><RefreshCw size={15} /> Refresh</button></header><section className="notifications-panel"><div className="notifications-toolbar"><div className="notifications-filter-group">{[["all", "All"], ["unread", "Unread"], ["low-stock", "Low stock"], ["expired", "Expired"]].map(([value, label]) => <button key={value} className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{label}</button>)}</div><span>{notifications.filter((notification) => !notification.isRead).length} unread</span></div>{error && <div className="notification-page-error">{error}</div>}{loading ? <div className="notification-page-empty">Loading notifications...</div> : visible.length ? <div className="notification-page-list">{visible.map((notification) => <NotificationRow key={notification._id} notification={notification} onRead={markRead} />)}</div> : <div className="notification-page-empty"><Bell size={29} /><strong>No notifications</strong><span>New stock and expiry alerts will appear here.</span></div>}</section></div>;
// }
// function NotificationRow({ notification, onRead }) { const Icon = icons[notification.type] || Bell; return <article className={`notification-page-row ${notification.isRead ? "is-read" : "is-unread"}`}><span className={`notification-page-icon ${notification.type}`}><Icon size={17} /></span><div><strong>{notification.message}</strong><p>{labels[notification.type] || "Inventory alert"} · {notification.item} {notification.branchId?.name ? `· ${notification.branchId.name}` : ""}</p><small>{new Date(notification.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</small></div>{!notification.isRead && <button onClick={() => onRead(notification)} title="Mark as read"><Check size={15} /> Mark read</button>}</article>; }
// export default Notifications;

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell, Check, Clock3, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import { getNotifications, markNotificationRead } from "../services/notificationService";

const icons = { "low-stock": AlertTriangle, expired: XCircle, "expiring-soon": Clock3, "out-of-stock": ShieldAlert };
const labels = { "low-stock": "Low stock", expired: "Expired item", "expiring-soon": "Expiring soon", "out-of-stock": "Out of stock" };

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const load = () => { setLoading(true); getNotifications().then(setNotifications).catch((requestError) => setError(requestError.response?.data?.message || "Unable to load notifications")).finally(() => setLoading(false)); };
  useEffect(() => { let active = true; getNotifications().then((data) => { if (active) setNotifications(data); }).catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load notifications"); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const visible = useMemo(() => notifications.filter((notification) => filter === "all" || (filter === "unread" ? !notification.isRead : notification.type === filter)), [filter, notifications]);
  const markRead = async (notification) => { if (notification.isRead) return; try { await markNotificationRead(notification._id); setNotifications((current) => current.map((entry) => entry._id === notification._id ? { ...entry, isRead: true } : entry)); } catch (requestError) { setError(requestError.response?.data?.message || "Unable to update notification"); } };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const filters = [
    ["all", "All"],
    ["unread", "Unread"],
    ["low-stock", "Low stock"],
    ["expired", "Expired"],
    ["expiring-soon", "Expiring soon"],
    ["out-of-stock", "Out of stock"],
  ];

  return (
    <div className="nt">
      <header className="nt-hero">
        <div className="nt-hero-copy">
          <p className="nt-date">Workspace alerts</p>
          <h1>Notifications</h1>
          <p className="nt-hero-sub">Stay ahead of stock, expiry, and inventory issues.</p>
        </div>
        <div className="nt-hero-actions">
          <button type="button" className="nt-btn nt-btn-light" onClick={load} disabled={loading}>
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </header>

      <section className="nt-panel" aria-label="Notifications list">
        <div className="nt-toolbar">
          <div className="nt-filters" role="tablist">
            {filters.map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={filter === value ? "is-active" : ""}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="nt-count">
            {unreadCount} unread
          </span>
        </div>

        {error && (
          <div className="nt-error" role="alert">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        {loading ? (
          <div className="nt-loading" role="status">
            <span className="nt-spinner" aria-hidden="true" />
            <span>Loading notifications...</span>
          </div>
        ) : visible.length ? (
          <div className="nt-list">
            {visible.map((notification) => (
              <NotificationRow key={notification._id} notification={notification} onRead={markRead} />
            ))}
          </div>
        ) : (
          <div className="nt-empty">
            <span className="nt-empty-icon"><Bell size={30} /></span>
            <strong>No notifications</strong>
            <span>New stock and expiry alerts will appear here.</span>
          </div>
        )}
      </section>
    </div>
  );
}

function NotificationRow({ notification, onRead }) {
  const Icon = icons[notification.type] || Bell;
  const isRead = notification.isRead;
  return (
    <article className={`nt-row ${isRead ? "is-read" : "is-unread"} type-${notification.type}`}>
      <span className={`nt-row-icon ${notification.type}`}>
        <Icon size={20} />
      </span>
      <div className="nt-row-main">
        <strong>{notification.message}</strong>
        <p>
          <span className="nt-row-tag">{labels[notification.type] || "Inventory alert"}</span>
          <span>{notification.item}</span>
          {notification.branchId?.name && <span>· {notification.branchId.name}</span>}
        </p>
        <small>{new Date(notification.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</small>
      </div>
      <div className="nt-row-action">
        {!isRead ? (
          <button type="button" onClick={() => onRead(notification)} title="Mark as read">
            <Check size={16} /> Mark read
          </button>
        ) : (
          <span className="nt-row-read">
            <Check size={14} /> Read
          </span>
        )}
      </div>
    </article>
  );
}

export default Notifications;