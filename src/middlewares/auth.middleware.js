import { asyncHandler } from "../utils/asyncHandeler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({message: "Invalid or missing authentication token"})
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?.id).select("-password -refreshToken")

        if (!user) {
            return res.status(401).json({message: "Invalid or expired token"})
        }

        req.user = user;
        next()
})