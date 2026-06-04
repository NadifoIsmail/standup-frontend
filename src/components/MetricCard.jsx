import React from 'react';

const MetricCard = ({ title, value, subtitle, color = '#0d6efd' }) => {
  return (
    <div className="col-md-3 mb-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <h6 className="text-muted mb-2">{title}</h6>
          <h2 className="fw-bold mb-1">{value}</h2>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;