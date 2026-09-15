import {
  createCommentTableQuery,
  createIndexesForLikesAndCommentsQuery,
  createLikeTableQuery,
  createUsersTableQuery,
} from "../query/create-tables.js";
import pool from "../config/db.js";

export const createUsersTableService = async () => {
  try {
    await pool.query(createUsersTableQuery);

    console.log("✅ Users table created");
  } catch (error) {
    console.error("❌ Failed to create users table:", error);
  }
};

export const createLikeTableService = async () => {
  try {
    await pool.query(createLikeTableQuery);

    console.log("✅ Likes table created");
  } catch (error) {
    console.error("❌ Failed to create likes table:", error);
  }
};

export const createCommentTableService = async () => {
  try {
    await pool.query(createCommentTableQuery);
    console.log("✅ Comments table created");
  } catch (error) {
    console.error("❌ Failed to create comments table:", error);
  }
};

export const createIndexesForLikesAndCommentsService = async () => {
  try {
    await pool.query(createIndexesForLikesAndCommentsQuery);
    console.log("✅ Indexes for Likes and Comments table created");
  } catch (error) {
    console.error(
      "❌ Failed to create Indexes for likes and comments table:",
      error,
    );
  }
};

export async function deleteUsersTableService() {
  await pool.query(`
    DROP TABLE IF EXISTS users;
  `);
}
