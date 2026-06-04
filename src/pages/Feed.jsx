
import React, { useState, useEffect, useCallback } from "react";
import { getStandups } from "../services/standupService";
import WeatherWidget from "../components/WeatherWidget";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const postsRes = await getStandups();
      setPosts(postsRes.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "unknown";

    const date = new Date(timestamp);
    const now = new Date();

    const diff = Math.floor((now - date) / 1000 / 60);

    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;

    return `${Math.floor(diff / 1440)}d ago`;
  };

  const postsWithBlockers = posts.filter(
    (post) => post.has_blocker === true
  ).length;

  const uniqueAuthors = [...new Set(posts.map((p) => p.author))];

  const standupParticipation = uniqueAuthors.length;

  if (loading) {
    return (
      <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3"></div>
          <p className="text-muted">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>
            <h3 className="fw-bold mb-1">
              Activity Feed
            </h3>

            <p className="text-muted mb-0">
              Real-time team updates
            </p>
          </div>

          <WeatherWidget />

        </div>

        {/* ERROR */}
        {error && (
          <div className="alert alert-warning rounded-4 border-0 shadow-sm">
            {error}
          </div>
        )}

        <div className="row g-4">

          {/* LEFT COLUMN */}
          <div className="col-lg-8" style={{ maxHeight: "650px", overflowY: "auto" }}>

            {posts.length === 0 ? (
              <div className="bg-white border rounded-4 shadow-sm p-5 text-center">
                <i className="bi bi-chat-left-text fs-1 text-muted"></i>

                <h5 className="mt-3 fw-semibold">
                  No standups yet
                </h5>

                <p className="text-muted mb-0">
                  Submit one on the Dashboard
                </p>
              </div>
            ) : (
              <div>

                {posts.map((post) => (

                  <div
                    key={post.id}
                    className="bg-white border rounded-4 p-4 mb-4 shadow-sm"
                  >

                    {/* TOP SECTION */}
                    <div className="d-flex justify-content-between align-items-start mb-4">

                      <div className="d-flex align-items-center gap-3">

                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                          style={{
                            width: "45px",
                            height: "45px",
                            backgroundColor: "#ede9fe",
                            color: "#5b4ff7",
                          }}
                        >
                          {(post.author || "A")[0]}
                        </div>

                        {/* User Info */}
                        <div>
                          <h5 className="mb-1 fw-semibold">
                            {post.author || "Anonymous"}
                          </h5>

                          <small className="text-muted">
                            {getTimeAgo(post.timestamp)}
                          </small>
                        </div>

                      </div>

                      {/* Blocker Badge */}
                      {post.has_blocker && (
                        <span className="badge bg-danger rounded-pill px-3 py-2">
                          Blocker
                        </span>
                      )}

                    </div>

                    {/* YESTERDAY + TODAY */}
                    <div className="row g-3">

                      {/* Yesterday */}
                      <div className="col-md-6">

                        <div >

                          <h6 className="fw-bold text-secondary small mb-3">
                            YESTERDAY
                          </h6>

                          {post.yesterday ? (
                            post.yesterday.split("\n").map((line, i) => (
                              line.trim() && (
                                <p
                                  key={i}
                                  className="mb-2 text-dark"
                                  style={{ fontSize: "0.92rem" }}
                                >
                                  • {line}
                                </p>
                              )
                            ))
                          ) : (
                            <p className="text-muted mb-0">
                              • Nothing reported
                            </p>
                          )}

                        </div>

                      </div>

                      {/* Today */}
                      <div className="col-md-6">

                        <div >

                          <h6 className="fw-bold  small mb-3">
                            TODAY
                          </h6>

                          {post.today ? (
                            post.today.split("\n").map((line, i) => (
                              line.trim() && (
                                <p
                                  key={i}
                                  className="mb-2 "
                                  style={{ fontSize: "0.92rem" }}
                                >
                                   {line}
                                </p>
                              )
                            ))
                          ) : (
                            <p className="text-muted mb-0">
                              • Nothing reported
                            </p>
                          )}

                        </div>

                      </div>

                    </div>

                    {/* BLOCKERS */}
                    {post.blockers && post.blockers.trim() && (

                      <div className="mt-3 p-3 rounded-4  ">

                        <h6 className="fw-bold text-danger small mb-2">
                          BLOCKERS
                        </h6>

                        <p
                          className="mb-0"
                          style={{ fontSize: "0.92rem" }}
                        >
                          {post.blockers}
                        </p>

                      </div>

                    )}

                    {/* IMAGE */}
                    {post.file_attachment && (
                      <div className="mt-3">

                        <img
                          src={`https://standup-backend-v4n5.onrender.com/uploads/${post.file_attachment}`}
                          alt="Screenshot"
                          className="w-100 rounded-4 border"
                          style={{
                            maxHeight: "300px",
                            objectFit: "cover",
                          }}
                        />

                      </div>
                    )}

                  </div>

                ))}

              </div>
            )}

          </div>

          {/* RIGHT COLUMN */}
          <div className="col-lg-4">

            <div className="bg-white border rounded-4 p-4 shadow-sm">

              <h6 className="fw-bold text-secondary small mb-4">
                TEAM PERFORMANCE
              </h6>

              {/* Active Blockers */}
              <div className="d-flex justify-content-between align-items-center mb-4">

                <span className="text-muted">
                  Active Blockers
                </span>

                <span className="fw-bold fs-4">
                  {postsWithBlockers}
                </span>

              </div>

              {/* Participation */}
              <div className="d-flex justify-content-between align-items-center">

                <span className="text-muted">
                  Standup Participation
                </span>

                <span className="fw-bold fs-4">
                  {standupParticipation}
                </span>

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Feed;

