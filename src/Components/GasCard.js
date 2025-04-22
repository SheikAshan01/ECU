import React from 'react';

function GasCard({ title,
    temp = 0.0,
    humidity = 0.0,
    co,
    co2,
    onClick,
    selected,
    minTemp = 0,
    maxTemp = 100,
    minHumidity = 0,
    maxHumidity = 90,
    dataActive = false

}) {

    const copercent = Number(co).toFixed(1);
    const co2percent = Number(co2).toFixed(1);

    const isCOOutOfRange = co < minTemp || co > maxTemp;
    const isCO2OutOfRange = co2 < minHumidity || co2 > maxHumidity;
    const isError = isCOOutOfRange || isCO2OutOfRange;
    
    const showBlink = dataActive && isError;


    return (
        <div className={`card gas ${selected ? 'selected' : ''}`} onClick={onClick}>
            <div className="s-box2">
                <div className="status-lights">
                <div className={`dot red ${showBlink ? 'blink' : ''}`} />
                <div className={`dot green ${dataActive && !isError ? 'blink' : ''}`} />
                </div>

                <div className="title2">{title}<br />co / co2</div>
                <div className="location">Sensor Location</div>
            </div>

            <div className="gas-readings">
                {/* CO Section */}
                <div className={`gas-section ${isCOOutOfRange  ? 'blink-bg' : ''}`}>
                    <div className="gas-label">
                        <img src="danger.png" alt="CO" className="icon-img" />
                        <h1 style={{ fontSize: "larger", color: "white" }}>CO</h1>
                    </div>
                    <div style={{ alignItems: "center" }}>
                        <div className="bar-line">
                            <span>{minTemp}<br />Min</span>
                            <div className="bar-container2">
                                <div className="red-bar1 gas-bar" style={{ width: `${copercent}%` }}></div>
                            </div>
                            <span>{maxTemp}<br />Max</span>
                        </div>
                        <div className="reading-box">
                            <span className="value">{copercent}</span>
                            <span className="unit">ppm</span>
                        </div>
                    </div>
                </div>

                {/* CO2 Section */}
                <div className={`gas-section ${isCO2OutOfRange  ? 'blink-bg' : ''}`}>
                    <div className="gas-label">
                        <img src="co-warning.png" alt="CO2" className="icon-img" />
                        <h1 style={{ fontSize: "larger  ", color: "white" }}>CO2</h1>
                    </div>
                    <div style={{ alignItems: "center" }}>
                        <div className="bar-line">
                            <span>{minHumidity}<br />Min</span>
                            <div className="bar-container2">
                                <div className="blue-bar1 gas-bar" style={{ width: `${co2percent}%` }}></div>
                            </div>
                            <span>{maxHumidity}<br />Max</span>
                        </div>
                        <div className="reading-box">
                            <span className="value">{co2percent}</span>
                            <span className="unit">ppm</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GasCard;
