import {
  createUserService,
  editProfileService,
  getAllUsersService,
  getUserByEmailService,
  getUserByIdService,
  toggleIsPrivateService,
} from "../services/user.service.js";
import { BodyReader } from "../utils/dataReader.js";

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

export const registerUser = async (req, res) => {
  try {
    const data = await BodyReader(req);

    const { email, password } = data;

    createUserService(email, password).then((data) => {
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          message: "Created User Successfulluy",
          user: data,
        }),
      );
      return;
    });

    return;
  } catch (error) {
    console.log("CREATE USER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal Server Erorr",
      }),
    );
  }
};

export const signInUser = async (req, res) => {
  try {
    const data = await BodyReader(req);
    const { email, password } = data;

    const user = await getUserByEmailService(email);

    if (user) {
      if (password == user.password) {
        console.log(user.email, " has logged in");

        res.statusCode = 200;
        res.end(
          JSON.stringify({
            message: "Sign In Success",
            user,
          }),
        );

        return;
      }

      console.log("Credentials Dont Match");
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: "Credentials Dont Match",
        }),
      );
      return;
    }

    res.statusCode = 404;
    res.end(
      JSON.stringify({
        message: "User does not exist",
      }),
    );
  } catch (error) {
    console.log("LOGIN ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal Server Erorr",
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
