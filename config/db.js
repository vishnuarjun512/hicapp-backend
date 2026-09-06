import "dotenv/config";
import PG from "pg";
const { Pool } = PG;

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (error) => {
  console.log("Unexpected PostgreSQL Error :", error);
});

export default pool;
