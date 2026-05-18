import express from "express";
import mongoose from "mongoose";
import router from "./routes";
// import cors from "cors";
// import dotenv from "dotenv";

// dotenv.config();

const app = express();

// Middlewares
// app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use('/api', router)

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/myProject";

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('\x1b[32m✓\x1b[0m \x1b[1mKết nối CSDL Thành công\x1b[0m');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.log("Kết nối CSDL thất bại:", error.message);
    });
