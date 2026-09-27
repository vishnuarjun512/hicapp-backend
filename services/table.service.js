import {
  createCommentTableQuery,
  createIndexesForLikesAndCommentsQuery,
  createLikeTableQuery,
} from "../query/create-tables/like-comment.js";
import pool from "../config/db.js";
import { createUsersTableQuery } from "../query/create-tables/user.js";
import {
  createFollowTableQuery,
  createFollowRequestTableQuery,
} from "../query/create-tables/follow.js";

import {
  createIndexesForNotificationTableQuery,
  createNotificationTableQuery,
} from "../query/create-tables/notification.js";

export const createUsersTableService = async () => {
  try {
    await pool.query(createUsersTableQuery);

    console.log("✅ Users table created");
  } catch (error) {
    console.error("❌ Failed to create users table:", error);
  }
};

export const createFollowTables = async () => {
  try {
    await pool.query(createFollowTableQuery);
    console.log("✅ Follow table created");

    await pool.query(createFollowRequestTableQuery);
    console.log("✅ Follow request table created");
  } catch (error) {
    console.log("CREATE FOLLOW TABLE SERVICE ERROR - ", error);
    throw error;
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

export const createNotificationTableAndIndexes = async () => {
  try {
    await pool.query(createNotificationTableQuery);
    await pool.query(createIndexesForNotificationTableQuery);
    console.log("✅ Notifications and Indexes created");
  } catch (error) {
    console.log("CREATE NOTIFICAIOTN TABLE SERVICE ERROR - ", error);
    throw error;
  }
};

export async function deleteUsersTableService() {
  await pool.query(`
    DROP TABLE IF EXISTS users;
  `);
}
