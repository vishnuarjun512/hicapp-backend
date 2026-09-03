import pool from "../config/db.js";
import { createUsersTableQuery } from "../query/create-tables.js";

export async function createUserService(email, password) {
  try {
    const result = await pool.query(
      `
      INSERT INTO users (email, password)
      VALUES ($1, $2)
      RETURNING id, name, email, created_at
    `,
      [email, password],
    );

    return result.rows[0];
  } catch (error) {
    throw new Error("CREATE USER SERVICE ERROR - ", error);
  }
}

export async function getAllUsersService() {
  const result = await pool.query(`
    SELECT id, name, email, created_at
    FROM users
    ORDER BY id;
  `);

  return result.rows;
}

export const getUserByEmailService = async (email) => {
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

export async function deleteUserByEmailService(email) {
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

export const editProfileService = async (
  id,
  name,
  handle,
  bio,
  verified = false,
) => {
  const query = `UPDATE users
  SET name=$2, handle=$3, bio=$4 , verified=$5
  WHERE id=$1`;

  await pool.query(query, [id, name, handle, bio, verified]);
};

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
