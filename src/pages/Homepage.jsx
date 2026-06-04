import React, { useState, useEffect, useCallback } from 'react';
import { getStandups } from '../services/standupService';
import StandupForm from '../components/StandupForm';
import RecentActivity from '../components/RecentActivity';
import WeatherWidget from '../components/WeatherWidget';

const Homepage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await getStandups();
      setPosts(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">Daily Standup </h3>
          <p className="text-muted mb-0">Share your progress and blockers with the team for today</p>
        </div>
        <WeatherWidget />
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="row">
        <div className="col-md-7">
          <StandupForm onPostSuccess={fetchPosts} />
        </div>
        <div className="col-md-5">
          <RecentActivity posts={posts} error={error} />
        </div>
      </div>
    </div>
  );
};

export default Homepage;