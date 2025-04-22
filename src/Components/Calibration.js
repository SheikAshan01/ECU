// Components/CalibrationDialog.js
import React from 'react';


const CalibrationDialog = ({ open, bayName, calibrations, onChange, onSave, onClose }) => {
    if (!open) return null;

    return (
        <div className="dialog-overlay">
            <div className="dialog">
                <div className="dialog-header">
                <h2>Calibration Set Points</h2>
                <button className="close-button" onClick={onClose}>✕</button>
                </div>
                <hr />
                <div className="dialog-group">
                    <label>Self Sensor Calibration</label>
                    <input
                        type="number"
                        value={calibrations.self}
                        onChange={(e) => onChange('self', e.target.value)}
                    />
                </div>
                <div className="dialog-group">
                    <label>Sensor to Sensor Matrix Calibration</label>
                    <input
                        type="number"
                        value={calibrations.matrix}
                        onChange={(e) => onChange('matrix', e.target.value)}
                    />
                </div>
                <div className="dialog-group">
                    <label>Offset Calibration</label>
                    <input
                        type="number"
                        value={calibrations.offset}
                        onChange={(e) => onChange('offset', e.target.value)}
                    />
                </div>
                <div className="dialog-group">
                    <label>Data Reference Calibration</label>
                    <input
                        type="number"
                        value={calibrations.reference}
                        onChange={(e) => onChange('reference', e.target.value)}
                    />
                </div>
                <hr/>
        <div className="dialog-actions">
                    <button onClick={onSave} className="save">Save</button>
                    <button onClick={onClose} className="close">Close</button>
                </div>
            </div>
        </div>
    );
};

export default CalibrationDialog;
