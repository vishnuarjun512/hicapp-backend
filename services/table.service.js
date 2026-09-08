import { createUsersTableQuery } from "../query/create-tables.js";

export const createUsersTableService = async () => {
  try {
    await pool.query(createUsersTableQuery);

    console.log("✅ Users table created");
  } catch (error) {
    console.error("❌ Failed to create users table:", error);
  }
};

export async function deleteUsersTableService() {
  await pool.query(`
    DROP TABLE IF EXISTS users;
  `);
}
