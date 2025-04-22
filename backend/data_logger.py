import serial
import serial.tools.list_ports
import json
import time
from datetime import datetime

# ---------- CONFIG ----------
baudrate = 115200
retry_interval = 0.5  # Fast retry
final_result_file = 'final_result.json'
sensor_ids = [f"{i:02X}" for i in range(1, 23)]  # 01 to 22
last_values = {}

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
    print("⚠️ ECU disconnected — All values set to 0")

def find_port():
    ports = list(serial.tools.list_ports.comports())
    print("🔍 Scanning Ports:", [p.device for p in ports])
    for port in ports:
        try:
            test_ser = serial.Serial(port.device, baudrate, timeout=1)
            time.sleep(1)
            if test_ser.in_waiting > 0:
                data = test_ser.read(test_ser.in_waiting).hex().upper()
                if len(data) >= 28:
                    print(f"✅ ECU detected on {port.device}")
                    test_ser.close()
                    return port.device
            test_ser.close()
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
                print(f"🔌 Connected to {port}")
                return ser
            except Exception as e:
                print(f"❌ Connection failed on {port}: {e}")
        else:
            print("🔁 No ECU detected... Retrying...")
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

            # Fill other IDs with 0 if missing
            for sid in sensor_ids:
                if sid not in last_values:
                    last_values[sid] = {
                        "timestamp": timestamp,
                        "id": sid,
                        "Temperature": 0,
                        "Humidity": 0
                    }

            # Save
            with open(final_result_file, 'w') as f:
                json.dump(list(last_values.values()), f, indent=2)

            print(f"[{timestamp}] ID:{id_hex} | 🌡 {temp}°C | 💧 {humidity}%")

# ---------- MAIN ----------
def main():
    while True:
        ser = connect_serial()
        try:
            while True:
                read_from_serial(ser)
                time.sleep(0.05)
        except serial.SerialException:
            print("❌ Disconnected. Reconnecting...")
            try:
                ser.close()
            except:
                pass
            set_all_to_zero()
            time.sleep(retry_interval)
        except KeyboardInterrupt:
            print("🛑 Stopped by user.")
            break

if __name__ == '__main__':
    main()
