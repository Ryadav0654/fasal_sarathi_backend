import requests
import json

url = "http://127.0.0.1:8000/predict"

data = {
    "Temparature": 26,
    "Humidity": 52,
    "Moisture": 38,
    "Soil_Type": "Sandy",
    "Crop_Type": "Maize",
    "PresentN": 37,
    "PresentP": 0,
    "PresentK": 0
}

try:
    response = requests.post(url, json=data)
    if response.status_code == 200:
        print("Success!")
        print("Response:", json.dumps(response.json(), indent=2))
    else:
        print("Error:", response.status_code)
        print(response.text)
except Exception as e:
    print("Failed to connect:", e)
