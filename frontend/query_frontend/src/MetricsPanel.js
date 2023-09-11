// MetricsPanel.js
import React from 'react';

const MetricsPanel = ({ apiParams }) => {
  return (
    <div className="left-panel">
      <h2>Metrics</h2>
      <div className="api-params">
        <div className="input-container">
          <label>Metric 1:</label>
          <input
            type="text"
            value={apiParams.firstMetric}
            readOnly
          />
        </div>
        <div className="input-container">
          <label> Metric 2:</label>
          <input
            type="text"
            value={apiParams.secondMetric}
            readOnly
          />
        </div>
        <div className="input-container">
          <label>Metric 3:</label>
          <input
            type="text"
            value={apiParams.thirdMetric}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;
