import React, { useState, useEffect } from 'react';
import { getStandups, getStandupStats } from '../services/standupService';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';

const Analytics = () => {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ posts_per_day: [], blocker_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, statsRes] = await Promise.all([
          getStandups(),
          getStandupStats()
        ]);
        setPosts(postsRes.data || []);
        setStats(statsRes.data);
        setError(null);
      } catch (err) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading analytics...</div>;
  if (error) return <div className="alert alert-warning m-4">{error}</div>;

  // Use data from /standups/stats/ endpoint
  const standupFrequency = (stats.posts_per_day || []).map(day => ({
    date: day.date.slice(5), // Convert "2026-06-01" to "06-01"
    count: day.posts || 0
  }));

  // Calculate blocker trend from stats data
  const blockerTrend = (stats.posts_per_day || []).map(day => ({
    date: day.date.slice(5),
    blockers: day.blockers || 0
  }));

  // Team Activity - unique days each member posted (still needs /standups/ data)
  const allAuthors = [...new Set(posts.map(p => p.author))];
  const authorActivity = allAuthors.map(author => {
    const uniqueDays = [...new Set(posts
      .filter(p => p.author === author)
      .map(p => new Date(p.timestamp).toISOString().split('T')[0])
    )];
    return {
      name: author,
      days: uniqueDays.length
    };
  }).sort((a, b) => b.days - a.days);

  const totalTeamStandups = authorActivity.reduce((sum, a) => sum + a.days, 0);
  const totalBlockers = stats.blocker_count || posts.filter(p => p.has_blocker === true).length;
  const blockerRate = totalTeamStandups === 0 ? 0 : Math.round((totalBlockers / totalTeamStandups) * 100);
  const avgPostsPerDay = Math.round(standupFrequency.reduce((sum, day) => sum + day.count, 0) / 7);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container py-4">
        <h2 className="mb-4" style={{ fontWeight: '600' }}>Analytics Dashboard</h2>

        {/* Stats Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="bg-white rounded shadow-sm p-3 text-center">
              <h6 className="text-muted mb-1">Avg. Daily Standups</h6>
              <h2 className="mb-0 text-primary">{avgPostsPerDay}</h2>
              <small className="text-muted">Last 7 days</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="bg-white rounded shadow-sm p-3 text-center">
              <h6 className="text-muted mb-1">Total Blockers</h6>
              <h2 className="mb-0 text-danger">{totalBlockers}</h2>
              <small className="text-muted">All time</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="bg-white rounded shadow-sm p-3 text-center">
              <h6 className="text-muted mb-1">Blocker Rate</h6>
              <h2 className="mb-0 text-warning">{blockerRate}%</h2>
              <small className="text-muted">of standups</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="bg-white rounded shadow-sm p-3 text-center">
              <h6 className="text-muted mb-1">Team Size</h6>
              <h2 className="mb-0 text-success">{allAuthors.length}</h2>
              <small className="text-muted">Active members</small>
            </div>
          </div>
        </div>

        {/* Charts Row - 2 charts side by side */}
        <div className="row g-4 mb-4">
          {/* Standup Frequency Chart - Using /standups/stats/ data */}
          <div className="col-md-6">
            <div className="bg-white rounded shadow-sm p-3">
              <h6 className="fw-bold mb-3">Standup Frequency (Last 7 Days)</h6>
              <p className="text-muted small mb-3">Number of team members who posted each day</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={standupFrequency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Blocker Trend Chart - Using /standups/stats/ data */}
          <div className="col-md-6">
            <div className="bg-white rounded shadow-sm p-3">
              <h6 className="fw-bold mb-3">Blocker Trend (Last 7 Days)</h6>
              <p className="text-muted small mb-3">Number of blockers reported each day</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={blockerTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="blockers" stroke="#dc3545" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Team Participation Table */}
        <div className="row">
          <div className="col-12">
            <div className="bg-white rounded shadow-sm p-3">
              <h6 className="fw-bold mb-3">Team Participation</h6>
              <p className="text-muted small mb-3">Number of days each team member submitted a standup</p>
              {authorActivity.length === 0 ? (
                <p className="text-muted text-center py-3">No data available</p>
              ) : (
                <div 
                  className="table-responsive"
                  style={{ 
                    maxHeight: authorActivity.length > 3 ? "300px" : "auto",
                    overflowY: authorActivity.length > 3 ? "auto" : "visible"
                  }}
                >
                  <table className="table table-hover">
                    <thead style={{ position: authorActivity.length > 3 ? "sticky" : "static", top: 0, backgroundColor: "white" }}>
                      <tr>
                        <th>No</th>
                        <th>Team Member</th>
                        <th>Days Participated</th>
                        <th>Participation Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {authorActivity.map((member, idx) => {
                        const participationRate = Math.round((member.days / 7) * 100);
                        return (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td className="fw-bold">{member.name}</td>
                            <td>{member.days} days</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                  <div 
                                    className="progress-bar bg-success" 
                                    style={{ width: `${participationRate}%` }}
                                  ></div>
                                </div>
                                <small className="text-muted">{participationRate}%</small>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;