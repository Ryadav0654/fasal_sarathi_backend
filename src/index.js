import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path: './env'
})


connectDB()
    .then(() => {
        const server = app.listen(process.env.PORT || 3000, () => {
            console.log(`⚙️   Server is running at port : ${process.env.PORT}`);
        })

        const gracefulShutdown = () => {
            console.log("Received kill signal, shutting down gracefully");
            server.close(() => {
                console.log("Closed out remaining connections");
                process.exit(0);
            });
        };

        process.on("SIGTERM", gracefulShutdown);
        process.on("SIGINT", gracefulShutdown);
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })
