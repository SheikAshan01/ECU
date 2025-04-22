import React from 'react';
import './SetPointDialog.css';

function SetPointDialog({ open, onClose, bayName, setPoints, onChange, onSave }) {
  if (!open) return null;

  const createStepper = (label, key, value) => (
    <div className="input-group">
      <span>{label}</span>
      <div className="stepper">
        <button onClick={() => onChange(key, Math.max(0, Number(value) - 1))}>−</button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
        />
        <button onClick={() => onChange(key, Number(value) + 1)}>+</button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Set Points - {bayName}</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="modal-section">
          <label>Temperature (°C)</label>
          <div className="input-row">
            {createStepper('Min', 'tempMin', setPoints.tempMin)}
            {createStepper('Max', 'tempMax', setPoints.tempMax)}
          </div>
        </div>

        <div className="modal-section">
          <label>Humidity (%)</label>
          <div className="input-row">
            {createStepper('Min', 'humidityMin', setPoints.humidityMin)}
            {createStepper('Max', 'humidityMax', setPoints.humidityMax)}
          </div>
        </div>

        <div className="modal-buttons">
          <button className="save-btn" onClick={onSave}>Save</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default SetPointDialog;
