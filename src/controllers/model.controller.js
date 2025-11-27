import { asyncHandler } from "../utils/asyncHandeler.js"
import { PythonShell } from "python-shell";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {Prediction} from "../models/prediction.model.js"
import { User } from "../models/user.model.js";
import { modelZod } from "../utils/validations.js";

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const predictFertilizer = asyncHandler(async(req,res)=>{
 
    const {data, success, error}= modelZod.safeParse(req.body);
    if(!success){
      return res.status(400).json({message: "Validation failed!", errors: error.flatten().fieldErrors})
    }
    const {Temparature,Humidity,Moisture,Soil_Type,Crop_Type,PresentN,PresentP,PresentK}= data;
   
    const input_data ={
            "Temparature": Temparature,
            "Humidity": Humidity,
            "Moisture": Moisture,
            "Soil Type": Soil_Type,
            "Crop Type": Crop_Type,
            "Present N": PresentN,
            "Present P": PresentP,
            "Present K": PresentK 		
        }
    // console.log(JSON.stringify(input_data))
    let options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: path.join(__dirname, '../ml/'),
        args: [JSON.stringify(input_data)]
      };
    PythonShell.run('predict.py', options).then(async(messages)=>{
         try {
          const result = JSON.parse(messages)
          // console.log("result", result)
          const prediction = await Prediction.create({
            Temparature,
            Humidity,
            Moisture,
            SoilType:Soil_Type,
            CropType:Crop_Type,
            PresentN,
            PresentP,
            PresentK,
            owner : req.user.id,
            fertilizer_name:result.fertilizer_name,
            fertilizer_quantity:result.fertilizer_quantity
          })
          if(!prediction){
            return res.status(400).json({message: "Error while saving prediction to database "});
          }
          const updated_user = await User.findByIdAndUpdate(req.user.id,
            {$push:{predictionHistory:prediction._id}},
            {new :true}
          );
          if(!updated_user){
            return res.status(400).json({message: "Error while updating prediction history "});
          }
          // console.log(updated_user.predictionHistory)
          // console.log(result)
          return res.status(200).send({result: result})
         } catch (error) {
            console.log("error in here ",error)
            return res.status(500).send({message: "Error occured!", error: error})
         }
      }).catch(err=>{
        console.log("error in Priction");
        return res.status(500).send({message: "Error occured!", error: err});
      });
})

export {predictFertilizer}