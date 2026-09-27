import { getUserByIdService } from "../services/user.service.js";
import {
  createFollowRequestService,
  createFollowService,
  deleteFollowRequestService,
  deleteFollowService,
  getAllFollowRequestByUserIDService,
  getAllSentFollowRequestsService,
  getFollowersService,
  getFollowingService,
  getFollowRequestService,
  getFollowService,
  getSuggestedUsersService,
} from "../services/follow.service.js";
import { requireAuthenticatedUser } from "../utils/jwt.js";
import { createNotificationService } from "../services/notification.service.js";
import { BodyReader } from "../utils/dataReader.js";
import pool from "../config/db.js";

export const followUser = async (req, res, receiver_id) => {
  const client = await pool.connect();
  try {
    const { userId: sender_id } = requireAuthenticatedUser(req);

    const receiver = await getUserByIdService(receiver_id);

    if (!receiver) {
      throw new Error("User does not exist!");
    }

    if (receiver.is_private) {
      const { id } = await createFollowRequestService(sender_id, receiver_id);

      await createNotificationService({
        client,
        recipientId: receiver_id,
        actorId: sender_id,
        type: "follow_request",
        postId: null,
        commentId: null,
        followRequestID: id,
      });

      res.statusCode = 200;

      res.end(
        JSON.stringify({
          message: "Follow Request Sent to " + receiver.name,
          request: true,
        }),
      );

      return;
    }

    await createFollowService(sender_id, receiver_id);

    res.statusCode = 200;

    res.end(
      JSON.stringify({
        message: "Following " + receiver.name,
        request: false,
      }),
    );

    return;
  } catch (error) {
    console.log("FOLLOW CONTROLLER ERROR - ", error);

    res.statusCode = 500;

    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};

export const unfollowUser = async (req, res, following_id) => {
  try {
    const { userId: follower_id } = requireAuthenticatedUser(req);

    const follow = await getFollowService(follower_id, following_id);

    if (!follow) {
      res.statusCode = 204;
      console.log("You are not following this User!");
      res.end(
        JSON.stringify({
          message: "You are not following this user",
        }),
      );
      return;
    }

    await deleteFollowService(follower_id, following_id);

    res.statusCode = 200;

    res.end(
      JSON.stringify({
        message: "Unfollowed",
      }),
    );
  } catch (error) {
    console.log("UNFOLLOW CONTROLLER ERROR - ", error);

    res.statusCode = 500;

    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};

export const acceptFollowRequest = async (req, res, sender_id) => {
  const client = await pool.connect();
  try {
    const { userId: receiver_id } = requireAuthenticatedUser(req);

    const request = await getFollowRequestService(sender_id, receiver_id);

    if (!request) {
      res.statusCode = 404;
      console.log("Follow Request does not exist");
      res.end(
        JSON.stringify({
          message: "Follow Request does not exist",
        }),
      );

      return;
    }

    await createFollowService(request.sender_id, request.receiver_id);

    await deleteFollowRequestService(request.id);

    await createNotificationService({
      client,
      recipientId: request.sender_id,
      actorId: request.receiver_id,
      type: "follow_request_accepted",
    });

    res.statusCode = 200;

    res.end(
      JSON.stringify({
        message: "Follow request accepted",
      }),
    );
  } catch (error) {
    console.log("ACCEPT FOLLOW REQUEST CONTROLLER ERROR - ", error);

    res.statusCode = 500;

    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};

export const rejectFollowRequest = async (req, res, sender_id) => {
  try {
    requireAuthenticatedUser(req);
    const { receiver_id } = await BodyReader(req);

    const request = await getFollowRequestService(sender_id, receiver_id);

    if (!request) {
      res.statusCode = 404;

      res.end(
        JSON.stringify({
          message: "Follow request does not exist",
        }),
      );

      return;
    }

    await deleteFollowRequestService(request.id);

    res.statusCode = 200;

    res.end(
      JSON.stringify({
        message: "Follow request rejected",
      }),
    );
  } catch (error) {
    console.log("REJECT FOLLOW REQUEST CONTROLLER ERROR - ", error);

    res.statusCode = 500;

    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};

export const getAllUsersFollowersFollowingFRSuggestedController = async (
  req,
  res,
  id,
) => {
  try {
    const { userId } = requireAuthenticatedUser(req);

    if (id !== userId) {
      res.statusCode = 403;
      res.end(
        JSON.stringify({ message: "You can only view your own follow data" }),
      );
      return;
    }

    const suggested = await getSuggestedUsersService(userId);
    const followers = await getFollowersService(userId);
    const following = await getFollowingService(userId);
    const followRequests = await getAllFollowRequestByUserIDService(userId);
    const sentFollowRequests = await getAllSentFollowRequestsService(userId);

    res.statusCode = 200;

    res.end(
      JSON.stringify({
        suggested,
        followers,
        following,
        followRequests,
        sentFollowRequests,
      }),
    );
    return;
  } catch (error) {
    console.log(
      "GET ALL USERS, FOLLOWERS, SUGGESTED CONTROLLER ERROR - ",
      error,
    );

    res.statusCode = 500;

    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};
