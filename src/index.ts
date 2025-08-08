import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { mkdirSync, appendFileSync } from "fs";
import { join, dirname } from "path";

// Create Hono app
const app = new Hono();

// Define port
const PORT = process.env.PORT || 3000;

// Security middleware (equivalent to helmet)
app.use("*", secureHeaders());

// CORS middleware
app.use("*", cors());

// Custom logging middleware (equivalent to your custom logger)
app.use(
  "*",
  logger((message) => {
    // console.log(`${new Date().toISOString()} - ${message}`);
    // log into csv file
    const logFilePath = join(__dirname, "server.log");
    const logMessage = `${new Date().toISOString()} - ${message}\n`;

    // Ensure the directory exists
    mkdirSync(dirname(logFilePath), { recursive: true });

    // Append log message to file
    appendFileSync(logFilePath, logMessage, "utf8");
  })
);

// Body parser middleware is built into Hono by default

// Routes
app.get("/", (c) => {
  return c.json({
    message: "Welcome to Simple Hono Server!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

app.get("/api/health", (c) => {
  return c.json({
    status: "OK",
    message: "Server is running properly",
    timestamp: new Date().toISOString(),
  });
});

// 404 middleware - Hono handles this automatically, but we can customize it
app.notFound((c) => {
  return c.json(
    {
      error: "Route not found",
      message: `The requested route ${c.req.path} does not exist`,
    },
    404
  );
});

// Global error handling middleware
app.onError((err, c) => {
  console.error("Error:", err.stack);
  return c.json(
    {
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong!",
    },
    500
  );
});

// Start server
console.log(`🚀 Server is running on port ${PORT}`);
console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`🌐 Access your server at: http://localhost:${PORT}`);

export default {
  port: PORT,
  fetch: app.fetch,
};
