import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import vmRoutes from "./routes/vmRoutes.js";
import { initSocket } from "./socket/socketServer.js";
import { runMigrations } from "./db/migrate.js";
dotenv.config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
// Initialize Socket.io
const io = initSocket(server);
app.set("io", io);
// Middleware
app.use(cors({
    origin: (origin, callback) => {
        callback(null, true);
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
// Routes (supporting both /api/... and direct root endpoints for robust compatibility)
app.use("/api/auth", authRoutes);
app.use("/api/vms", vmRoutes);
// Direct root endpoints as requested in prompt specs
app.use("/", authRoutes);
app.use("/vms", vmRoutes);
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Start server after running migrations
async function start() {
    await runMigrations();
    server.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
}
start().catch((err) => {
    console.error("Failed to start backend server:", err);
    process.exit(1);
});
