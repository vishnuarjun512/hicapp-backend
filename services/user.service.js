import pool from "../config/db.js";

export async function createUserService(email, password) {
  const result = await pool.query(
    `
      INSERT INTO users (email, password)
      VALUES ($1, $2)
      RETURNING id, name, email, created_at
    `,
    [email, password],
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

export const getUserByEmail = async (email) => {
  const query = `SELECT * 
  FROM users 
  WHERE email=$1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

export const getUserByIdService = async (id) => {
  const query = `SELECT * 
  FROM users 
  WHERE id=$1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export async function deleteUserByEmail(email) {
  const result = await pool.query(
    `
      DELETE FROM users
      WHERE email = $1
      RETURNING id, name, email, created_at;
    `,
    [email],
  );
  return result.rows[0];
}

export const editProfileService = async (id, name, handle, bio) => {
  const query = `UPDATE users
  SET name=$2, handle=$3, bio=$4 
  WHERE id=$1`;

  await pool.query(query, [id, name, handle, bio]);
};

export const createUsersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100),
        email VARCHAR(255),
        handle VARCHAR(100),
        password TEXT NOT NULL,
        bio VARCHAR(255),
        profilePicUrl VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Users table created");
  } catch (error) {
    console.error("❌ Failed to create users table:", error);
  }
};

export async function deleteUsersTable() {
  await pool.query(`
    DROP TABLE IF EXISTS users;
  `);
}
