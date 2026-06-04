import React from 'react';
import { useNavigate } from 'react-router-dom';

const RecentActivity = ({ posts, error }) => {
  const navigate = useNavigate();
  
  const getRelativeTime = (timestamp) => {
    const postDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return postDate.toLocaleDateString();
  };

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div className="card shadow-sm ">
      <div className="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">
        <span>RECENT ACTIVITY</span>
        <button 
          onClick={() => navigate('/feed')}
          className="btn btn-sm btn-outline-primary"
        >
          View All
        </button>
      </div>
      <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {error && <div className="alert alert-warning">{error}</div>}
        {recentPosts.length === 0 && !error && (
          <p className="text-muted text-center">No standups yet. Be the first to post!</p>
        )}
        {recentPosts.map(post => (
          <div key={post.id} className="mb-3 pb-2 border-bottom">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <strong>{post.author}</strong>
                <small className="text-muted ms-2">{getRelativeTime(post.timestamp)}</small>
              </div>
              {post.has_blocker && <span className="badge bg-danger">Blocker</span>}
            </div>
            
            <p className="mb-0 small"><strong>Yesterday:</strong> {post.yesterday}</p>
            <p className="mb-0 small"><strong>Today:</strong> {post.today}</p>
            
            {post.blockers && (
              <p className="mb-0 small text-danger"><strong>Blockers:</strong> {post.blockers}</p>
            )}
            
            {post.file_attachment && (
              <div className="mt-2">
                <img 
                  src={`https://standup-backend-v4n5.onrender.com/uploads/${post.file_attachment}`}
                  alt="Attachment"
                  style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '4px' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;