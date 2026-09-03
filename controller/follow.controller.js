import { BodyReader } from "../utils/dataReader.js";
import { getUserByIdService } from "../services/user.service.js";
import {
  createFollowRequestService,
  createFollowService,
  deleteFollowRequestService,
  getFollowersService,
  getFollowingService,
  getFollowRequestByIdService,
  getSuggestedUsersService,
} from "../services/follow.service.js";

export const followUser = async (req, res) => {
  try {
    const data = await BodyReader(req);

    const { sender_id, receiver_id } = data;

    const receiver = await getUserByIdService(receiver_id);

    if (!receiver) {
      throw new Error("User does not exist!");
    }

    if (receiver.is_private) {
      await createFollowRequestService(sender_id, receiver_id);

      res.statusCode = 200;

      res.end(
        JSON.stringify({
          message: "Follow Request Sent",
        }),
      );

      return;
    }

    await createFollowService(sender_id, receiver_id);

    res.statusCode = 200;

    res.end(
      JSON.stringify({
        message: "Followed User",
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

export const unfollowUser = async (req, res, id) => {
  try {
    const data = await BodyReader(req);

    const { follower_id } = data;

    const following_id = id;

    const follow = await getFollowService(follower_id, following_id);

    if (!follow) {
      res.statusCode = 404;

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
        message: "User unfollowed",
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

export const acceptFollowRequest = async (req, res, id) => {
  try {
    const data = await BodyReader(req);

    const { receiver_id } = data;

    const request = await getFollowRequestByIdService(id);

    if (!request) {
      res.statusCode = 404;

      res.end(
        JSON.stringify({
          message: "Follow request does not exist",
        }),
      );

      return;
    }

    if (request.receiver_id !== receiver_id) {
      res.statusCode = 403;

      res.end(
        JSON.stringify({
          message: "You cannot accept this request",
        }),
      );

      return;
    }

    await createFollowService(request.sender_id, request.receiver_id);

    await deleteFollowRequestService(id);

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

export const rejectFollowRequest = async (req, res, id) => {
  try {
    const data = await BodyReader(req);

    const { receiver_id } = data;

    const request = await getFollowRequestByIdService(id);

    if (!request) {
      res.statusCode = 404;

      res.end(
        JSON.stringify({
          message: "Follow request does not exist",
        }),
      );

      return;
    }

    if (request.receiver_id !== receiver_id) {
      res.statusCode = 403;

      res.end(
        JSON.stringify({
          message: "You cannot reject this request",
        }),
      );

      return;
    }

    await deleteFollowRequestService(id);

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

export const getSuggestedUsers = async (req, res, userId) => {
  try {
    const suggested = await getSuggestedUsersService(userId);

    res.statusCode = 200;

    res.end(
      JSON.stringify({
        suggested,
      }),
    );
  } catch (error) {
    console.log("GET SUGGESTED USERS CONTROLLER ERROR - ", error);

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
  userId,
) => {
  try {
    const suggested = await getSuggestedUsersService(userId);
    const followers = await getFollowersService(userId);
    const following = await getFollowingService(userId);
    const followRequests = await getFollowRequestByIdService(userId);

    res.statusCode = 200;

    res.end(
      JSON.stringify({
        suggested,
        followers,
        following,
        followRequests,
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
