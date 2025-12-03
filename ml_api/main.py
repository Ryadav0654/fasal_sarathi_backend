import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# Load models and encoders
current_dir = os.path.dirname(os.path.abspath(__file__))

try:
    xgb_classifier = joblib.load(os.path.join(current_dir, 'xgboost_classifier.pkl'))
    catboost_model = joblib.load(os.path.join(current_dir, 'catboost_regressor.pkl'))
    soil_type_encoder = joblib.load(os.path.join(current_dir, 'soil_type_encoder.pkl'))
    crop_type_encoder = joblib.load(os.path.join(current_dir, 'crop_type_encoder.pkl'))
    fertilizer_name_encoder = joblib.load(os.path.join(current_dir, 'fertilizer_name_encoder.pkl'))
    scaler = joblib.load(os.path.join(current_dir, 'scaler.pkl'))
except Exception as e:
    print(f"Error loading models: {e}")
    # In a real app, we might want to exit here if models fail to load
    pass

class PredictionInput(BaseModel):
    Temparature: float
    Humidity: float
    Moisture: float
    Soil_Type: str
    Crop_Type: str
    PresentN: float
    PresentP: float
    PresentK: float

@app.post("/predict")
def predict(input_data: PredictionInput):
    try:
        # Create DataFrame from input
        data = input_data.dict()
        # Map input keys to match model expectations if necessary
        # The pydantic model uses underscores, but the original script used "Soil Type" and "Crop Type" with spaces for the encoder input?
        # Let's check the original script:
        # input_df['Soil Type'] = soil_type_encoder.transform(input_df['Soil Type'])
        # So we need to map "Soil_Type" to "Soil Type" in the dataframe
        
        df_data = {
            "Temparature": data["Temparature"],
            "Humidity": data["Humidity"],
            "Moisture": data["Moisture"],
            "Soil Type": data["Soil_Type"],
            "Crop Type": data["Crop_Type"],
            "Present N": data["PresentN"],
            "Present P": data["PresentP"],
            "Present K": data["PresentK"]
        }
        
        input_df = pd.DataFrame([df_data])
        
        # Transform categorical features
        input_df['Soil Type'] = soil_type_encoder.transform(input_df['Soil Type'])
        input_df['Crop Type'] = crop_type_encoder.transform(input_df['Crop Type'])
        
        # Features to scale
        features_to_scale = input_df[['Temparature', 'Humidity', 'Moisture', 'Present N', 'Present P', 'Present K']]
        
        # Scale features
        scaled_features = scaler.transform(features_to_scale)
        
        # Make predictions
        fertilizer_name_prediction = xgb_classifier.predict(scaled_features)
        fertilizer_name = fertilizer_name_encoder.inverse_transform(fertilizer_name_prediction)[0]
        
        fertilizer_quantity_prediction = catboost_model.predict(scaled_features)
        
        # Handle numpy types
        if isinstance(fertilizer_quantity_prediction, np.ndarray):
            fertilizer_quantity_prediction = fertilizer_quantity_prediction.item()
            
        return {
            "fertilizer_name": fertilizer_name,
            "fertilizer_quantity": round(float(fertilizer_quantity_prediction), 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "ML API is running"}
