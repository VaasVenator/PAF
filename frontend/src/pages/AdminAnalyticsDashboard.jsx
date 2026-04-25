import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiGet } from "../lib/api";

export default function AdminAnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const payload = await apiGet("/api/bookings/analytics", user);
      setAnalytics(payload);
      setError("");
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setAnalytics(null);
      // Don't show error if analytics endpoint doesn't exist
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return null;
  }

  const approvalRate = analytics.total > 0 
    ? Math.round((analytics.approved / analytics.total) * 100) 
    : 0;
  const rejectionRate = analytics.total > 0
    ? Math.round((analytics.rejected / analytics.total) * 100)
    : 0;
  const pendingPercentage = analytics.total > 0
    ? Math.round((analytics.pending / analytics.total) * 100)
    : 0;

  return (
    <div className="analytics-dashboard">
      <div className="analytics-section analytics-metrics">
        <h3>Quick Metrics</h3>
        
        <div className="metrics-grid">
          <div className="metric-card metric-primary">
            <div className="metric-icon">📊</div>
            <div className="metric-info">
              <p className="metric-label">Approval Rate</p>
              <p className="metric-value">{approvalRate}%</p>
              <p className="metric-detail">{analytics.approved} approved</p>
            </div>
          </div>

          <div className="metric-card metric-warning">
            <div className="metric-icon">⏳</div>
            <div className="metric-info">
              <p className="metric-label">Pending Reviews</p>
              <p className="metric-value">{analytics.pending}</p>
              <p className="metric-detail">{pendingPercentage}% of total</p>
            </div>
          </div>

          <div className="metric-card metric-danger">
            <div className="metric-icon">❌</div>
            <div className="metric-info">
              <p className="metric-label">Rejection Rate</p>
              <p className="metric-value">{rejectionRate}%</p>
              <p className="metric-detail">{analytics.rejected} rejected</p>
            </div>
          </div>

          <div className="metric-card metric-info">
            <div className="metric-icon">📈</div>
            <div className="metric-info">
              <p className="metric-label">Total Bookings</p>
              <p className="metric-value">{analytics.total}</p>
              <p className="metric-detail">All time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-section analytics-distribution">
        <h3>Booking Status Distribution</h3>
        
        <div className="distribution-container">
          <div className="distribution-bars">
            <div className="distribution-bar-item">
              <div className="bar-label">
                <span>Approved</span>
                <span className="bar-count">{analytics.approved}</span>
              </div>
              <div className="bar-wrapper">
                <div 
                  className="bar bar-approved" 
                  style={{width: `${analytics.total > 0 ? (analytics.approved / analytics.total) * 100 : 0}%`}}
                />
              </div>
            </div>

            <div className="distribution-bar-item">
              <div className="bar-label">
                <span>Pending</span>
                <span className="bar-count">{analytics.pending}</span>
              </div>
              <div className="bar-wrapper">
                <div 
                  className="bar bar-pending" 
                  style={{width: `${analytics.total > 0 ? (analytics.pending / analytics.total) * 100 : 0}%`}}
                />
              </div>
            </div>

            <div className="distribution-bar-item">
              <div className="bar-label">
                <span>Rejected</span>
                <span className="bar-count">{analytics.rejected}</span>
              </div>
              <div className="bar-wrapper">
                <div 
                  className="bar bar-rejected" 
                  style={{width: `${analytics.total > 0 ? (analytics.rejected / analytics.total) * 100 : 0}%`}}
                />
              </div>
            </div>

            <div className="distribution-bar-item">
              <div className="bar-label">
                <span>Cancelled</span>
                <span className="bar-count">{analytics.cancelled}</span>
              </div>
              <div className="bar-wrapper">
                <div 
                  className="bar bar-cancelled" 
                  style={{width: `${analytics.total > 0 ? (analytics.cancelled / analytics.total) * 100 : 0}%`}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {analytics.bookingsByDay && analytics.bookingsByDay.length > 0 && (
        <div className="analytics-section analytics-trends">
          <h3>Recent Booking Activity</h3>
          
          <div className="trends-container">
            <div className="trend-chart">
              {analytics.bookingsByDay.map((day, index) => (
                <div key={index} className="trend-bar-item">
                  <div className="trend-bar-value">
                    <div className="trend-bar" style={{height: `${(day.count / Math.max(...analytics.bookingsByDay.map(d => d.count), 1)) * 100}px`}}>
                    </div>
                  </div>
                  <div className="trend-bar-label">{day.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
