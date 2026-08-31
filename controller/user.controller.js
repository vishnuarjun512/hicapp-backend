import { createUserService, getUsers } from "../services/user.service.js";
import { BodyReader } from "../utils/dataReader.js";

export const getUsersController = async (req, res) => {
  try {
    const users = await getUsers();

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

export const createUser = async (req, res) => {
  try {
    const data = await BodyReader(req);

    const { email, password } = data;
    createUserService(email, password).then((data) => {
      res.end(
        JSON.stringify({
          message: "Created User Successfulluy",
          user: data,
        }),
      );
    });
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
