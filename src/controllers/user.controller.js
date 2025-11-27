import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandeler.js";

const getPredictionHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ message: "Invalid user Id" });
  }
  const user = await User.findById(userId).populate("predictionHistory").select("-password -refreshToken");
  console.log(user);
  if (!user) {
    return res.status(400).json({ message: "User does not exist" });
  }
  res.status(200).json({ user: user });
});

export { getPredictionHistory };
