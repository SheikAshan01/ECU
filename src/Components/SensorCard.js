import React from 'react';

function SensorCard({
    title,
    temp = 0.0,
    humidity = 0.0,
    onClick,
    selected,
    minTemp = 0,
    maxTemp = 100,
    minHumidity = 0,
    maxHumidity = 90,
    dataActive = false // <-- New prop

}) {
    const tempPercent = Math.min(((temp - minTemp) / (maxTemp - minTemp)) * 100, 100);
    const humidityPercent = Math.min(((humidity - minHumidity) / (maxHumidity - minHumidity)) * 100, 100);

    const isTempOutOfRange = temp < minTemp || temp > maxTemp;
    const isHumidityOutOfRange = humidity < minHumidity || humidity > maxHumidity;
    const isError = isTempOutOfRange || isHumidityOutOfRange;

    const showBlink = dataActive && isError;


    return (
        <div className={`card ${selected ? 'selected' : ''}`} onClick={onClick}>
            <div className='s-box'>
                <div className="status-lights">
                    <div className={`dot red ${showBlink ? 'blink' : ''}`} />
                    <div className={`dot green ${dataActive && !isError ? 'blink' : ''}`} />
                </div>

                <div className="title1">{title}</div>
                <div className="location">Sensor Location</div>
            </div>
            <div className="sensor-data">
                <div className={`temp-section ${isTempOutOfRange ? 'blink-bg' : ''}`}>
                    <div className="temp-label">
                        <span className="icon">🌡</span>
                        <h1 style={{ fontSize: "small", color: "white" }}>Temp</h1>
                    </div>
                    <div>
                        <div className="bar-line">
                            <span>
                                {minTemp}
                                <br />Min
                            </span>

                            <div className="bar-container">
                                <div className="red-bar" style={{ width: `${tempPercent}%` }}></div>
                            </div>

                            <span>
                                {maxTemp}
                                <br />Max
                            </span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div className="temp-value-box">
                                <span className="temp-value">{Number(temp).toFixed(1)}</span>
                            </div>
                            <h1 className="unit">°C</h1>
                        </div>
                    </div>
                </div>

                <div className={`temp-section ${isHumidityOutOfRange ? 'blink-bg' : ''}`}>
                    <div className="humidity-label">
                        <span className="icon">💧</span>
                        <h1 style={{ fontSize: "small" }}>Relative Humidity</h1>
                    </div>
                    <div>
                        <div className="bar-line">
                            <span>{minHumidity} <br />Min</span>
                            {/* <div className="blue-bar" style={{ width: `${humidityPercent}%` }}></div> */}
                            <div className="bar-container">
                                <div className="blue-bar" style={{ width: `${humidityPercent}%` }}></div>
                            </div>
                            <span>{maxHumidity}<br />Max</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div className="temp-value-box">
                                <span className="temp-value">{Number(humidity).toFixed(1)}</span>
                            </div>
                            <h1 className="unit">%</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SensorCard;
