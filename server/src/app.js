
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import incidentRoutes from "./routes/incidents.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    message: "OpsRadar API is running",
    status: "OK"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
