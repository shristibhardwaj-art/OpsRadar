
import dotenv from "dotenv";

dotenv.config();

const { default: app } = await import("./app.js");

const PORT = Number(process.env.PORT) || 8080;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`OpsRadar server running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server startup error:", error);
});
