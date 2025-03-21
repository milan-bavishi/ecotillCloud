const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const travelRoutes = require("./routes/travelRoutes");
const llmUsageRoutes = require("./routes/llmUsage.routes");
const carbonTrackerRoutes = require("./routes/carbonTracker.routes");
const cloudUsageRoutes = require("./routes/cloudUsage.routes");
const awsRoutes = require("./routes/awsRoutes");

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Set up routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/travel", travelRoutes);
app.use("/api/llm-usage", llmUsageRoutes);
app.use("/api/carbon-tracker", carbonTrackerRoutes);
app.use("/api/cloud-usage", cloudUsageRoutes);
app.use("/api/aws", awsRoutes);

// Root route for health check
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the EcoSattva API" });
});

// Connect to MongoDB
connectDB()
  .then(() => {
    // Start server after DB connection is established
    const PORT = process.env.PORT || 5000;
    const server = app
      .listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      })
      .on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          // If port 5000 is taken, try port 5001
          const alternativePort = PORT + 1;
          console.log(
            `Port ${PORT} is in use, trying port ${alternativePort}...`
          );
          app.listen(alternativePort, () => {
            console.log(
              `Server running on alternative port ${alternativePort}`
            );
          });
        } else {
          console.error("Server error:", err);
          process.exit(1);
        }
      });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);

  process.exit(1);
});
