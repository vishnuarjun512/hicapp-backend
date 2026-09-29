import {
  editProfileService,
  getAllUsersService,
  getUserByIdService,
  toggleIsPrivateService,
} from "../services/user.service.js";
import {
  getFollowingService,
  getFollowersService,
  getSuggestedUsersService,
  getFollowService,
  getFollowRequestService,
} from "../services/follow.service.js";
import {
  getFeedPostsService,
  getPostsByUserIdService,
} from "../services/post.service.js";

import { deleteProfileImageService } from "../services/image.service.js";
import { BodyReader } from "../utils/dataReader.js";

import { getConversationsService } from "../services/conversation.service.js";
import { requireAuthenticatedUser } from "../utils/jwt.js";
import { getNotificationByRecipentID } from "../services/notification.service.js";

export const getUsersController = async (req, res) => {
  try {
    const users = await getAllUsersService();

    res.statusCode = 200;

    res.end(
      JSON.stringify({
        data: users,
      }),
    );
  } catch (error) {
    console.log("GET USERS ERROR - ", error);

    res.statusCode = 500;

    res.end(
      JSON.stringify({
        message: "Internal server error",
      }),
    );
  }
};

export const getUserById = async (req, res, id) => {
  try {
    const user = await getUserByIdService(id);

    if (!user) {
      res.statusCode = 404;
      res.end(
        JSON.stringify({
          message: "User not found",
        }),
      );
      return;
    }

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        data: user,
      }),
    );
  } catch (error) {
    console.log("GET USER BY ID CONTROLLER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal server error",
      }),
    );
  }
};

export const editProfile = async (req, res, id) => {
  try {
    const { userId } = requireAuthenticatedUser(req);
    if (userId !== id) {
      res.statusCode = 403;
      res.end(
        JSON.stringify({ message: "You can only edit your own profile" }),
      );
      return;
    }
    const data = await BodyReader(req);
    const { name, handle, bio, verified, profilePicUrl } = data;

    const user = await getUserByIdService(userId);
    console.log(
      user.profile_pic_url &&
        user.profile_pic_url.length > 0 &&
        "User already has a profile pic",
    );

    if (profilePicUrl === null && !user.profile_pic_url) {
      await deleteProfileImageService(userId);
      console.log("Deleted Profile Image");
    }

    await editProfileService(id, name, handle, bio, verified, profilePicUrl);

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        profilePicUrl,
        error: false,
        message: "Profile Updated Successfully",
      }),
    );
    return;
  } catch (error) {
    console.log("EDIT PROFILE CONTROLLER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};

export const togglePrivate = async (req, res) => {
  try {
    const { userId } = requireAuthenticatedUser(req);
    const data = await BodyReader(req);
    const { is_private } = data;
    if (typeof is_private !== "boolean") {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "is_private must be a boolean" }));
      return;
    }
    await toggleIsPrivateService(userId, is_private);
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        message: `Switched to ${is_private ? "Private" : "Public"} Account`,
      }),
    );
  } catch (error) {
    console.log("TOGGLE IS PRIVATE CONTROLLER ERROR -", error);
    res.statusCode = error.statusCode ?? 500;
    res.end(
      JSON.stringify({
        message: error.statusCode ? error.message : "Internal Server Error",
      }),
    );
  }
};

export const getHomePageData = async (req, res) => {
  try {
    const { userId } = requireAuthenticatedUser(req);

    const user = await getUserByIdService(userId);

    if (!user) {
      res.statusCode = 404;
      res.end(
        JSON.stringify({
          message: "User not found",
        }),
      );
      return;
    }

    const followers = await getFollowersService(user.id);
    const following = await getFollowingService(user.id);
    const suggested = await getSuggestedUsersService(user.id);
    const posts = await getFeedPostsService(user.id);
    const conversations = await getConversationsService(user.id);
    const notifications = await getNotificationByRecipentID(user.id);

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        followers,
        following,
        posts,
        conversations,
        suggested,
        notifications,
      }),
    );
  } catch (error) {
    console.log("GET HOME PAGE DATA CONTROLLER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal server error",
      }),
    );
  }
};

export const getProfileData = async (req, res, userId) => {
  try {
    const { userId: selfId } = requireAuthenticatedUser(req);

    const user = await getUserByIdService(userId);

    if (!user) {
      res.statusCode = 404;
      res.end(
        JSON.stringify({
          message: "User not found",
        }),
      );
      return;
    }

    const followers = await getFollowersService(user.id);
    const following = await getFollowingService(user.id);
    const posts = await getPostsByUserIdService(user.id);
    const request = (await getFollowRequestService(selfId, user.id)) ?? null;
    const follow = (await getFollowService(selfId, user.id)) ?? null;

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        user,
        followers,
        following,
        posts,
        request,
        follow,
      }),
    );
  } catch (error) {
    console.log("GET USER PROFILE DATA BY ID CONTROLLER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal server error",
      }),
    );
  }
};
