import { registerUser,loginUser,logoutUser, refreshTheToken, validateToken} from "../controllers/auth.controller.js";
import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router= Router()


router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/validate").get(verifyJWT,validateToken)
router.route("/refresh-token").post(refreshTheToken)

export default router

