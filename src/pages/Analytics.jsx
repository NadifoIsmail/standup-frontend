import React, { useState, useEffect } from 'react';
import { getStandups } from '../services/standupService';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';

const Analytics = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsRes = await getStandups();
        setPosts(postsRes.data || []);
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

  // Get last 7 days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  
  // Standup Frequency - unique authors per day
  const standupFrequency = last7Days.map(day => {
    const dayPosts = posts.filter(post => {
      const postDate = new Date(post.timestamp).toISOString().split('T')[0];
      return postDate === day;
    });
    const uniqueAuthors = [...new Set(dayPosts.map(p => p.author))];
    return {
      date: day.slice(5),
      count: uniqueAuthors.length
    };
  });

  // Blocker Trend - blockers per day
  const blockerTrend = last7Days.map(day => {
    const dayPosts = posts.filter(post => {
      const postDate = new Date(post.timestamp).toISOString().split('T')[0];
      return postDate === day && post.has_blocker === true;
    });
    return {
      date: day.slice(5),
      blockers: dayPosts.length
    };
  });

  // Team Activity - unique days each member posted
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
  const totalBlockers = posts.filter(p => p.has_blocker === true).length;
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
          {/* Standup Frequency Chart */}
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

          {/* Blocker Trend Chart */}
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

        {/* Top Contributors - Full width table */}
        <div className="row">
          <div className="col-12">
            <div className="bg-white rounded shadow-sm p-3">
              <h6 className="fw-bold mb-3">Team Participation</h6>
              <p className="text-muted small mb-3">Number of days each team member submitted a standup</p>
              {authorActivity.length === 0 ? (
                <p className="text-muted text-center py-3">No data available</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
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