import React, { useEffect, useState } from 'react';
import SensorCard from './Components/SensorCard';
import GasCard from './Components/GasCard';
import SetPointDialog from './Components/SetPointDialog';
import './App.css';
import CalibrationDialog from './Components/Calibration';


function App() {
  const bays = Array.from({ length: 22 }, (_, i) => `BAY${i + 1}`);
  const gasIndexes = [10, 15]; // BAY11, BAY16 will show GasCard

  const [sensorData, setSensorData] = useState([]);
  const [gasCardData, setGasCardData] = useState([]);
  const [selectedBayIndex, setSelectedBayIndex] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calibrationOpen, setCalibrationOpen] = useState(false);
  const defaultCalibration = {
    self: 0,
    matrix: 0,
    offset: 0,
    reference: 0,
  };

  const [calibrationMap, setCalibrationMap] = useState(
    Object.fromEntries(bays.map((_, index) => [index, { ...defaultCalibration }]))
  );
  const [calibrations, setCalibrations] = useState(defaultCalibration);


  const defaultSetPoint = {
    tempMin: 0,
    tempMax: 100,
    humidityMin: 0,
    humidityMax: 90,
  };

  const [setPoints, setSetPoints] = useState(defaultSetPoint);
  const [setPointMap, setSetPointMap] = useState(
    Object.fromEntries(bays.map((_, index) => [index, { ...defaultSetPoint }]))
  );
  const [gasCalibrationMap, setGasCalibrationMap] = useState(
    Object.fromEntries(gasIndexes.map((index) => [index, { ...defaultCalibration }]))
  );


  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/data');
      const json = await res.json();
      console.log("✅ Fetch response:", json);      
      

      // Fixed ID to BAY mapping
      const bayIdMap = [
        '01', '02', '03', '04', '05', '06', '07', '08', '09', '0A',
        '14', // GasCard BAY11
        '0B', '0C', '0D', '0E',
        '15', // GasCard BAY16
        '0F', '10', '11', '12', '13',
        'FIXED_0A' // BAY22 (copy of 0A)
      ];

      // Get valid response only
      const responseMap = {};
      json.forEach(entry => {
        if (entry.id) {
          responseMap[entry.id.toUpperCase()] = entry;
        }
      });

      const orderedBays = bayIdMap.map(id => {
        if (id === 'FIXED_0A') {
          return responseMap['0A'] ? { ...responseMap['0A'], id: 'FIXED_0A' } : {
            id: 'FIXED_0A',
            Temperature: 0.0,
            Humidity: 0.0,
            timestamp: ''
          };
        }
        return responseMap[id] || {
          id,
          Temperature: 0.0,
          Humidity: 0.0,
          timestamp: ''
        };
      });

      // Extract gas data
      const gasCardData = [orderedBays[10], orderedBays[15]];

      // Extract sensor data (all others)
      const sensorCardData = [
        ...orderedBays.slice(0, 10),
        ...orderedBays.slice(11, 15),
        ...orderedBays.slice(16, 22)
      ];

      setGasCardData(gasCardData);
      setSensorData(sensorCardData);

    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const getSensorInfo = (index) => {
    const sensorIndex = index - gasIndexes.filter(i => i < index).length;
    const item = sensorData[sensorIndex];

    const rawTemp = parseFloat(item?.Temperature) || 0.0;
    const rawHumidity = parseFloat(item?.Humidity) || 0.0;

    const calibration = calibrationMap[index] || defaultCalibration;

    const adjustedTemp = rawTemp - calibration.self + calibration.matrix;
    const adjustedHumidity = rawHumidity - calibration.offset + calibration.reference;

    const dataActive = !!item?.timestamp && (rawTemp !== 0.0 || rawHumidity !== 0.0);

    return {
      temp: adjustedTemp.toFixed(2),
      humidity: adjustedHumidity.toFixed(2),
      dataActive
    };
  };



  const getGasCardInfo = (index) => {
    const gasPosition = gasIndexes.indexOf(index);
    const item = gasCardData[gasPosition];

    const rawCO = parseFloat(item?.Temperature) || 0.0;
    const rawCO2 = parseFloat(item?.Humidity) || 0.0;

    const calibration = gasCalibrationMap[index] || defaultCalibration;

    const adjustedCO = rawCO - calibration.self + calibration.matrix;
    const adjustedCO2 = rawCO2 - calibration.offset + calibration.reference;

    const dataActive = !!item?.timestamp && (rawCO !== 0.0 || rawCO2 !== 0.0);

    return {
      co: adjustedCO.toFixed(2),
      co2: adjustedCO2.toFixed(2),
      dataActive
    };
  };


  const handleCardClick = (index) => {
    setSelectedBayIndex(index);
    setSetPoints(setPointMap[index]);

    if (gasIndexes.includes(index)) {
      setCalibrations(gasCalibrationMap[index]);
    } else {
      setCalibrations(calibrationMap[index]);
    }
  };


  const openSetPointDialog = () => {
    if (selectedBayIndex !== null) {
      setDialogOpen(true);
    }
  };

  const handleSetPointChange = (key, value) => {
    setSetPoints(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleSetPointSave = () => {
    setSetPointMap(prev => ({
      ...prev,
      [selectedBayIndex]: { ...setPoints }
    }));
    setDialogOpen(false);
  };

  const handleCalibrationChange = (key, value) => {
    setCalibrations(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleCalibrationSave = () => {
    if (selectedBayIndex !== null) {
      if (gasIndexes.includes(selectedBayIndex)) {
        setGasCalibrationMap(prev => ({
          ...prev,
          [selectedBayIndex]: { ...calibrations }
        }));
      } else {
        setCalibrationMap(prev => ({
          ...prev,
          [selectedBayIndex]: { ...calibrations }
        }));
      }
    }
    setCalibrationOpen(false);
  };

  return (
    <div className="app">
      <div className="grid">
        {bays.map((bay, index) => {
          if (gasIndexes.includes(index)) {
            const { co, co2, dataActive } = getGasCardInfo(index);
            return (
              <GasCard
                key={index}
                title="c1"
                co={co}
                co2={co2}
                dataActive={dataActive}
                onClick={() => handleCardClick(index)}
                selected={selectedBayIndex === index}
                minTemp={setPointMap[index].tempMin}
                maxTemp={setPointMap[index].tempMax}
                minHumidity={setPointMap[index].humidityMin}
                maxHumidity={setPointMap[index].humidityMax}
              />

            );
          }

          const { temp, humidity, dataActive } = getSensorInfo(index);

          return (
            <SensorCard
              key={index}
              title={bay}
              temp={temp}
              humidity={humidity}
              dataActive={dataActive}
              onClick={() => handleCardClick(index)}
              selected={selectedBayIndex === index}
              minTemp={setPointMap[index].tempMin}
              maxTemp={setPointMap[index].tempMax}
              minHumidity={setPointMap[index].humidityMin}
              maxHumidity={setPointMap[index].humidityMax}
            />
          );
        })}
      </div>

      <div className="controls">
        <button onClick={openSetPointDialog}>Set point</button>
        <button>Correction</button>
        <button onClick={() => setCalibrationOpen(true)}>Calibration</button>
      </div>

      <SetPointDialog
        open={dialogOpen}
        bayName={selectedBayIndex !== null ? bays[selectedBayIndex] : ''}
        setPoints={setPoints}
        onChange={handleSetPointChange}
        onSave={handleSetPointSave}
        onClose={() => setDialogOpen(false)}
      />

      <CalibrationDialog
        open={calibrationOpen}
        bayName={selectedBayIndex !== null ? bays[selectedBayIndex] : ''}
        calibrations={calibrations}
        onChange={handleCalibrationChange}
        onSave={handleCalibrationSave}
        onClose={() => setCalibrationOpen(false)}
      />

    </div>
  );
}

export default App;
