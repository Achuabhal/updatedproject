import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import friendRoutes from "./routes/friend.route.js"; // Add this line
import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";


dotenv.config();

const PORT = process.env.PORT;

// Middleware
app.use(express.json({ limit: "50mb" })); // Increase JSON payload limit to handle large files
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Increase URL-encoded payload limit
app.use(cookieParser());

// Configure CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your frontend
    credentials: true, // Allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

// Preflight request handling
app.options("*", cors());

// Define API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api", friendRoutes); // Add this line


// Start the server
server.listen(PORT, () => {
  console.log("Server is running on PORT: " + PORT);
  connectDB();
});
