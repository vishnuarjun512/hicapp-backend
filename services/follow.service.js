import pool from "../config/db.js";
import {
  createFollowRequestTableQuery,
  createFollowTableQuery,
} from "../query/create-tables.js";

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

export const createFollowService = async (followerId, followingId) => {
  try {
    const query = `
      INSERT INTO follow (follower_id, following_id)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const result = await pool.query(query, [followerId, followingId]);

    return result.rows[0];
  } catch (error) {
    console.log("CREATE FOLLOW SERVICE ERROR - ", error);
    throw error;
  }
};

export const deleteFollowService = async (followerId, followingId) => {
  try {
    const query = `
      DELETE FROM follow
      WHERE follower_id = $1, following_id = $2
      VALUES ($1, $2)
      RETURNING *;
    `;

    const result = await pool.query(query, [followerId, followingId]);

    return result.rows[0];
  } catch (error) {
    console.log("CREATE FOLLOW SERVICE ERROR - ", error);
    throw error;
  }
};

export const getFollowService = async (followerId, followingId) => {
  try {
    const query = `
      SELECT *
      FROM follow
      WHERE follower_id = $1
      AND following_id = $2;
    `;

    const result = await pool.query(query, [followerId, followingId]);

    return result.rows[0];
  } catch (error) {
    console.log("GET FOLLOW SERVICE ERROR - ", error);
    throw error;
  }
};

export const createFollowRequestService = async (senderId, receiverId) => {
  try {
    const query = `
      INSERT INTO follow_request (sender_id, receiver_id)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const result = await pool.query(query, [senderId, receiverId]);

    return result.rows[0];
  } catch (error) {
    console.log("CREATE FOLLOW REQUEST SERVICE ERROR - ", error);

    throw error;
  }
};

export const getFollowRequestByIdService = async (id) => {
  try {
    const query = `
      SELECT *
      FROM follow_request
      WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
  } catch (error) {
    console.log("GET FOLLOW REQUEST SERVICE ERROR - ", error);

    throw error;
  }
};

export const deleteFollowRequestService = async (id) => {
  try {
    const query = `
      DELETE FROM follow_request
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
  } catch (error) {
    console.log("DELETE FOLLOW REQUEST SERVICE ERROR - ", error);

    throw error;
  }
};

export const getFollowersService = async (userId) => {
  try {
    const query = `
      SELECT
        u.id,
        u.name,
        u.handle,
        u.bio,
        u."profile_pic_url"
      FROM follow f
      JOIN users u
        ON f.follower_id = u.id
      WHERE f.following_id = $1
      ORDER BY f.created_at DESC;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows;
  } catch (error) {
    console.log("GET FOLLOWERS SERVICE ERROR - ", error);
    throw error;
  }
};

export const getFollowingService = async (userId) => {
  try {
    const query = `
      SELECT
        u.id,
        u.name,
        u.handle,
        u.bio,
        u."profile_pic_url"
      FROM follow f
      JOIN users u
        ON f.following_id = u.id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows;
  } catch (error) {
    console.log("GET FOLLOWING SERVICE ERROR - ", error);
    throw error;
  }
};

export const getSuggestedUsersService = async (userId) => {
  try {
    const query = `
      SELECT
        u.id,
        u.name,
        u.handle,
        u.bio,
        u."profile_pic_url"
      FROM users u
      WHERE u.id <> $1
      AND NOT EXISTS (
        SELECT 1
        FROM follow f
        WHERE f.follower_id = $1
        AND f.following_id = u.id
      )
      ORDER BY u.created_at DESC;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows;
  } catch (error) {
    console.log("GET SUGGESTED USERS SERVICE ERROR - ", error);

    throw error;
  }
};
