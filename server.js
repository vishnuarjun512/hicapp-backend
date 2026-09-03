import dotenv from "dotenv";
import http from "http";
import pool from "./config/db.js";
import { userRoutes } from "./routes/user.route.js";
import { postRoutes } from "./routes/post.route.js";
import { followRoutes } from "./routes/follow.route.js";

dotenv.config();
const PORT = process.env.PORT;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.setHeader("Content-Type", "application/json");

  const userRouteshandled = userRoutes(req, res);
  if (userRouteshandled) {
    return;
  }

  const postRoutesHandled = postRoutes(req, res);

  if (postRoutesHandled) {
    return;
  }

  const followRoutesHandled = followRoutes(req, res);
  if (followRoutesHandled) {
    return;
  }

  if (req.method == "GET" && req.url == "/") {
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        message: "HIKE API is running",
      }),
    );
    return;
  }

  console.log(req.url, req.method);
  res.statusCode = 404;
  res.end(
    JSON.stringify({
      message: "Route not found",
    }),
  );
});

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("POSTGRESQL Connected");

    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:");
    console.error("Error - ", error);
    process.exit(1);
  }
}

startServer();
