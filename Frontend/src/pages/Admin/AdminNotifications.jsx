import { useState, useEffect } from "react";
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Package,
  Building2,
  Calendar,
  Filter,
  Search,
  X
} from "lucide-react";
import api from "../../utils/api";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/notifications");
      setNotifications(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.response?.data?.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "low_stock":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case "expired":
        return <Clock className="w-5 h-5 text-red-600" />;
      case "out_of_stock":
        return <Package className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "low_stock":
        return "bg-orange-50 border-orange-200";
      case "expired":
        return "bg-red-50 border-red-200";
      case "out_of_stock":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const filteredNotifications = notifications
    .filter(n => {
      if (filterType !== "all" && n.type !== filterType) return false;
      if (searchTerm && !n.message?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="w-8 h-8 text-teal-600" />
              System Notifications
            </h1>
            <p className="text-gray-600 mt-2">
              Alerts and notifications from all branches
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full">
              <span className="font-semibold">{unreadCount}</span> Unread
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === "all"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("low_stock")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === "low_stock"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setFilterType("expired")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === "expired"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Expired
            </button>
            <button
              onClick={() => setFilterType("out_of_stock")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === "out_of_stock"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white border rounded-lg shadow-sm p-4 transition hover:shadow-md ${
                !notification.isRead ? "border-l-4 border-l-teal-600" : ""
              } ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {notification.message}
                      </p>
                      {notification.itemName && (
                        <p className="text-sm text-gray-600 mt-1">
                          Item: <span className="font-medium">{notification.itemName}</span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="text-gray-400 hover:text-red-600 transition ml-4"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {notification.branchId && (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span>{notification.branchId.branchName || notification.branchId.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="mt-3 text-sm text-teal-600 hover:text-teal-800 font-medium"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;