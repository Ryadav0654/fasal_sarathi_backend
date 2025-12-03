import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";

dotenv.config()

const app = express()

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Performance & Logging
app.use(compression()); // Compress all responses
app.use(morgan("combined")); // Log requests

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000" || "http://localhost:5173",
    credentials: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())

import modelRouter from "./routes/model.route.js"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
app.use("/api/v1/predict", modelRouter)
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

app.get("/", (req, res) => {
    res.send("Hello from Fasal Sarathi Backend")
})

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});


export { app }