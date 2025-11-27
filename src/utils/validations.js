import * as z from "zod";

const registerZod = z.object({
  fullName: z.string().trim(),
  email: z.email().trim(),
  password: z.string().min(8),
});

const loginZod = z.object({
  email: z.email().trim(),
  password: z.string().min(8),
});


export const modelZod = z.object({
  Temparature: z
    .number()
    .min(10, "Temperature too low (Min: 10°C)")
    .max(50, "Temperature too high (Max: 50°C)"), // °C

  Humidity: z
    .number()
    .min(10, "Humidity too low (Min: 10%)")
    .max(100, "Humidity too high (Max: 100%)"), // %

  Moisture: z
    .number()
    .min(0, "Moisture cannot be negative")
    .max(100, "Moisture too high (Max: 100%)"), // % Volumetric Water Content

  Soil_Type: z.enum([
    "Sandy", 
    "Loamy", 
    "Black", 
    "Red", 
    "Clayey",
  ]), // Indian soil types

  Crop_Type: z.enum([
    "Maize",
    "Sugarcane",
    "Cotton",
    "Tobacco",
    "Paddy",
    "Barley",
    "Wheat",
    "Millets",
    "Oil seeds",
    "Pulses",
    "Ground Nuts",
  ]), // You can expand as needed

  PresentN: z
    .number()
    .min(0, "Nitrogen value can't be negative")
    .max(140, "Nitrogen too high (Max: 140 kg/ha)"), // kg/ha

  PresentP: z
    .number()
    .min(0, "Phosphorus value can't be negative")
    .max(100, "Phosphorus too high (Max: 100 kg/ha)"), // kg/ha

  PresentK: z
    .number()
    .min(0, "Potassium value can't be negative")
    .max(400, "Potassium too high (Max: 400 kg/ha)"), // kg/ha
});


export {registerZod, loginZod}