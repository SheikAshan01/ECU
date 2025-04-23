import serial
import serial.tools.list_ports
import json
import time
import os
from datetime import datetime

print("🚀 Starting Data Logger...")

# ----------- CONFIG ------------
baudrate = 115200
retry_interval = 0.5

sensor_ids = [
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '0A',
    '14',  # GasCard (BAY11)
    '0B', '0C', '0D', '0E',
    '15',  # GasCard (BAY16)
    '0F', '10', '11', '12', '13',
    'FIXED'
]

# ----------- PATH SETUP ----------
script_dir = os.path.dirname(os.path.abspath(__file__))
final_result_file = os.path.join(script_dir, "final_result.json")
log_dir = os.path.join(script_dir, "logs")
os.makedirs(log_dir, exist_ok=True)

def get_today_log_file():
    today = datetime.now().strftime("%d-%m-%Y")
    return os.path.join(log_dir, f"log_{today}.json")

last_values = {}

# ----------- FUNCTIONS -----------
def set_all_to_zero():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    for sid in sensor_ids:
        last_values[sid] = {
            "timestamp": timestamp,
            "id": sid,
            "Temperature": 0,
            "Humidity": 0
        }
    with open(final_result_file, 'w') as f:
        json.dump(list(last_values.values()), f, indent=2)

def find_port():
    ports = list(serial.tools.list_ports.comports())
    print("🔍 Scanning Ports:", [p.device for p in ports])
    for port in ports:
        try:
            ser = serial.Serial(port.device, baudrate, timeout=1)
            time.sleep(1)
            if ser.in_waiting > 0:
                data = ser.read(ser.in_waiting).hex().upper()
                if len(data) >= 28:
                    ser.close()
                    return port.device
            ser.close()
        except:
            continue
    return None

def connect_serial():
    while True:
        port = find_port()
        if port:
            try:
                ser = serial.Serial(port, baudrate, timeout=1)
                ser.reset_input_buffer()
                print(f"✅ Connected to {port}")
                return ser
            except:
                pass
        print("🔁 No ECU detected. Retrying...")
        set_all_to_zero()
        time.sleep(retry_interval)

def read_from_serial(ser):
    global last_values
    while ser.in_waiting > 0:
        data = ser.read(ser.in_waiting)
        hex_data = data.hex().upper()
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if len(hex_data) >= 28:
            id_hex = hex_data[0:2]
            temp1 = int(hex_data[2:6], 16)
            temp2 = int(hex_data[6:10], 16)
            hum1 = int(hex_data[10:14], 16)
            hum2 = int(hex_data[14:18], 16)
            hum3 = int(hex_data[18:22], 16)

            temp = round((temp2 if temp2 != 0 else temp1) / 100, 2)
            humidity = round((hum1 or hum2 or hum3) / 100, 2)

            last_values[id_hex] = {
                "timestamp": timestamp,
                "id": id_hex,
                "Temperature": temp,
                "Humidity": humidity
            }

            for sid in sensor_ids:
                if sid not in last_values:
                    last_values[sid] = {
                        "timestamp": timestamp,
                        "id": sid,
                        "Temperature": 0,
                        "Humidity": 0
                    }

            # ✅ Save current state
            with open(final_result_file, 'w') as f:
                json.dump(list(last_values.values()), f, indent=2)

            # ✅ Append latest reading to today's log
            with open(get_today_log_file(), 'a') as f:
                json.dump(last_values[id_hex], f)
                f.write(",\n")

            print(f"[{timestamp}] ID:{id_hex} | 🌡 {temp}°C | 💧 {humidity}%")

# ----------- MAIN LOOP -----------
def main():
    try:
        while True:
            ser = connect_serial()
            try:
                while True:
                    read_from_serial(ser)
                    time.sleep(0.05)
            except serial.SerialException:
                print("❌ Connection lost. Reconnecting...")
                try:
                    ser.close()
                except:
                    pass
                set_all_to_zero()
                time.sleep(retry_interval)
    except KeyboardInterrupt:
        print("\n🛑 Program stopped by user. Exiting gracefully.")

if __name__ == '__main__':
    main()
