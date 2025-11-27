import { asyncHandler } from "../utils/asyncHandeler.js";
import { User } from "../models/user.model.js";
import { generateAccessAndRefereshTokens } from "../utils/generateTokens.js";
import { registerZod, loginZod } from "../utils/validations.js";
import jwt from "jsonwebtoken";
import { email, success } from "zod";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  console.log("this is register hit ");
  const { data, success, error } = registerZod.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.flatten().fieldErrors,
    });
  }
  const { fullName, email, password } = data;
  const existedUser = await User.findOne({ email });

  if (existedUser) {
    return res
      .status(400)
      .json({ message: "User with this email already exists" });
  }

  const user = await User.create({
    fullName,
    email,
    password,
  });

  if (!user) {
    return res.status(500).json({
      message: "Failed to create user. Please try again later.",
    });
  }

  return res.status(201).json({ message: "User registered successfully!" });
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { data, success } = loginZod.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.flatten().fieldErrors,
    });
  }

  const { email, password } = data;

  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(400).json({ message: "User doesn't exist" });
  }

  console.log(user);

  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log(isPasswordValid);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid user credentials" });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
    path: "api/v1/auth/refresh-token",
  };

  return res.status(200).cookie("refreshToken", refreshToken, options).json({
    message: "User loggedIn successfully!",
    accessToken: accessToken,
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  const l = await User.findByIdAndUpdate(
    req.user.id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );
  console.log("req.user",req.user.id);
  console.log("l",l);
  const options = {
    httpOnly: true,
    secure: true,
    path: "api/v1/auth/refresh-token",
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .json({ message: "user logout successfully!" });
});

const refreshTheToken = asyncHandler(async (req, res) => {
  const {refreshToken} = req.cookies;

  if (!refreshToken) {
    return res.status(400).json({ message: "refresh token not found!" });
  }

  const decodedRefresh = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!decodedRefresh) {
    return res.status(400).json({ message: "refresh token not valid!" });
  }

  const userId = decodedRefresh.id;

  const newAccessToken = jwt.sign(
    { id: userId
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );

  if(!newAccessToken) {
     return res.status(400).json({message: "refresh token not valid!"})
  }

  return res.status(200).json({newAccessToken: newAccessToken});
});


const validateToken = asyncHandler(async (req, res) => {
    return res.status(200).json({success: true});
})

export { registerUser, loginUser, logoutUser, refreshTheToken, validateToken};
