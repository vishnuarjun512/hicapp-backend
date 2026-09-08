import {
  createUserService,
  editProfileService,
  getAllUsersService,
  getUserByEmailService,
  getUserByIdService,
  toggleIsPrivateService,
} from "../services/user.service.js";
import {
  getFollowingService,
  getFollowersService,
} from "../services/follow.service.js";
import { getPostsByUserIdService } from "../services/post.service.js";
import { BodyReader } from "../utils/dataReader.js";

import { getConversationsService } from "../services/conversation.service.js";

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
    const data = await BodyReader(req);
    const { name, handle, bio, verified } = data;

    await editProfileService(id, name, handle, bio, verified);
    res.statusCode = 200;
    res.end(
      JSON.stringify({
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

export const togglePrivate = async (req, res, id) => {
  try {
    const data = await BodyReader(req);
    const { is_private } = data;
    await toggleIsPrivateService(id, is_private).then(() => {
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          message: `Switched to ${is_private ? "Private" : "Public"} Account`,
        }),
      );
    });
  } catch (error) {
    console.log("TOGGLE IS PRIVATE CONTROLLER ERROR");
  }
};

export const getProfileData = async (req, res, userId) => {
  try {
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
    const conversations = await getConversationsService(user.id);

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        followers,
        following,
        posts,
        conversations,
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
