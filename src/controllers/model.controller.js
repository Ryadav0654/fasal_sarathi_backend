import { asyncHandler } from "../utils/asyncHandeler.js"
import { Prediction } from "../models/prediction.model.js"
import { User } from "../models/user.model.js";
import { modelZod } from "../utils/validations.js";
import axios from "axios";

const predictFertilizer = asyncHandler(async (req, res) => {

  const { data, success, error } = modelZod.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ message: "Validation failed!", errors: error.flatten().fieldErrors })
  }
  const { Temparature, Humidity, Moisture, Soil_Type, Crop_Type, PresentN, PresentP, PresentK } = data;

  try {
    // Call the ML API
    const mlApiUrl = process.env.ML_API_URL || 'http://host.docker.internal:8000/predict';
    const response = await axios.post(mlApiUrl, {
      Temparature,
      Humidity,
      Moisture,
      Soil_Type,
      Crop_Type,
      PresentN,
      PresentP,
      PresentK
    });

    const result = response.data;

    const prediction = await Prediction.create({
      Temparature,
      Humidity,
      Moisture,
      SoilType: Soil_Type,
      CropType: Crop_Type,
      PresentN,
      PresentP,
      PresentK,
      owner: req.user.id,
      fertilizer_name: result.fertilizer_name,
      fertilizer_quantity: result.fertilizer_quantity
    })

    if (!prediction) {
      return res.status(400).json({ message: "Error while saving prediction to database " });
    }

    const updated_user = await User.findByIdAndUpdate(req.user.id,
      { $push: { predictionHistory: prediction._id } },
      { new: true }
    );

    if (!updated_user) {
      return res.status(400).json({ message: "Error while updating prediction history " });
    }

    return res.status(200).send({ result: result })

  } catch (error) {
    console.log("Error in prediction:", error.message);
    return res.status(500).send({ message: "Error occured during prediction!", error: error.message })
  }
})

export { predictFertilizer }