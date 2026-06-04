import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="bg-dark text-white" style={{ width: "260px", minHeight: "100vh", padding: "1rem" }}>
      

      <button 
        className="btn btn-outline-light w-100 text-start mb-2"
        onClick={() => navigate("/homepage")}
      >
         Dashboard
      </button>

      <button 
        className="btn btn-outline-light w-100 text-start mb-2"
        onClick={() => navigate("/feed")}
      >
        Feed
      </button>

      <button 
        className="btn btn-outline-light w-100 text-start mb-2"
        onClick={() => navigate("/analytics")}
      >
        Analytics
      </button>

    </div>
  );
}