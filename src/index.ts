import dotenv from "dotenv";
import path from "path";

// --- START: Load environment variables FIRST ---
const env = process.env.NODE_ENV || "development";
// Construct the absolute path relative to the CWD (usually project root when running scripts)
// Or ensure the path is correct relative to the compiled JS file location if __dirname behavior differs post-compilation.
// Using process.cwd() might be more reliable if running from the project root.
const envPath = path.resolve(process.cwd(), `.env.${env}`); // Adjusted path resolution
console.log(`Attempting to load environment variables from: ${envPath}`);
const dotenvResult = dotenv.config({ path: envPath, debug: true });

if (dotenvResult.error) {
  console.error("Error loading .env file:", dotenvResult.error);
  // Decide if you want to exit or continue with potentially missing variables
  // process.exit(1); // Optional: exit if .env loading fails
} else {
  console.log("Loaded .env variables:", dotenvResult.parsed); // See what was actually loaded
}
// --- END: Load environment variables FIRST ---

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./middlewares/passport";
import { config } from "./config/app.config";
import connectDatabase from "./database/database";
import { errorHandler } from "./middlewares/errorHandler";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler";
import { registerRoutes } from "./common/utils/route-registrar";
import authRoutes from "./modules/auth/auth.routes";
import mfaRoutes from "./modules/mfa/mfa.routes";
import sessionRoutes from "./modules/session/session.routes";
import { authenticateJWT } from "./common/strategies/jwt.strategy";

const app = express();

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = Array.isArray(config.APP_ORIGIN)
        ? config.APP_ORIGIN
        : [config.APP_ORIGIN];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(passport.initialize());

// Welcome route
app.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Hello Subscribers!!!",
    });
  })
);

// Dynamic route registration
const routes = [
  { path: "/auth", router: authRoutes },
  { path: "/mfa", router: mfaRoutes },
  { path: "/session", router: sessionRoutes, middleware: [authenticateJWT] },
];

registerRoutes(app, routes);

// Error handling
app.use(errorHandler);

// Server startup
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(config.PORT, () => {
      console.log(
        `Server listening on port ${config.PORT} in ${config.NODE_ENV}`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
