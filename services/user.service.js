import pool from "../config/db.js";


export async function createUserService(name, email, password) {
  const result = await pool.query(
    `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
    `,
    [name, email, password],
  );

  return result.rows[0];
}

export async function getUsersService() {
  const result = await pool.query(`
    SELECT id, name, email, created_at
    FROM users
    ORDER BY id;
  `);

  return result.rows;
}

export async function deleteUserByNameService(name) {
  const result = await pool.query(
    `
      DELETE FROM users
      WHERE name = $1
      RETURNING id, name, email, created_at;
    `,
    [name],
  );

  return result.rows[0];
}



export const createUsersTable = async() =>  {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(255),
        password TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Users table created");
  } catch (error) {
    console.error("❌ Failed to create users table:", error);
  }
}

export async function deleteUsersTable() {
  await pool.query(`
    DROP TABLE IF EXISTS users;
  `);
}