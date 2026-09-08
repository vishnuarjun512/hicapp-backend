import jwt from "jsonwebtoken";
import { readJWT } from "../utils/jwt.js";
import { BodyReader } from "../utils/dataReader.js";
import {
  createUserService,
  getUserByEmailService,
} from "../services/user.service.js";

export const signInUser = async (req, res) => {
  try {
    const data = await BodyReader(req);
    const { email, password } = data;

    const user = await getUserByEmailService(email);

    if (!user) {
      res.statusCode = 404;
      res.end(
        JSON.stringify({
          message: "User does not exist",
        }),
      );
      return;
    }

    if (password != user.password) {
      console.log("Credentials Dont Match");
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: "Credentials Dont Match",
        }),
      );
      return;
    }

    console.log(user.email, " has logged in");

    const accesstoken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });

    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": [
        `hicappAccessToken=${accesstoken}; HttpOnly; Secure; SameSite=None; Path=/`,
        `hicappRefreshToken=${refreshToken}; HttpOnly; Secure; SameSite=None; Path=/`,
      ],
    });

    res.end(
      JSON.stringify({
        message: "Sign In Success",
        user,
      }),
    );

    return;
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

export const refreshToken = async (req, res) => {
  try {
    const cookies = req.headers.cookie;
    if (!cookies) {
      res.statusCode = 401;

      res.end(
        JSON.stringify({
          message: "Refresh token missing",
        }),
      );

      return;
    }

    const refreshCookie = cookies
      .split("; ")
      .find((cookie) => cookie.startsWith("hicappRefreshToken="));

    if (!refreshCookie) {
      res.statusCode = 401;
      console.log("Refresh Token Expird");
      res.end(
        JSON.stringify({
          message: "Refresh token missing",
        }),
      );

      return;
    }

    const refreshToken = refreshCookie.slice("hicappRefreshToken=".length);

    const payload = readJWT(refreshToken);

    const newAccessToken = jwt.sign(
      {
        userId: payload.userId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "5m",
      },
    );

    res.setHeader(
      "Set-Cookie",
      `hicappAccessToken=${newAccessToken}; HttpOnly; Path=/; SameSite=Lax`,
    );

    res.statusCode = 200;

    res.end(
      JSON.stringify({
        message: "Token refreshed",
      }),
    );
  } catch (error) {
    console.log("REFRESH TOKEN ERROR - ", error);

    res.statusCode = 401;

    res.end(
      JSON.stringify({
        message: "Session expired",
      }),
    );
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": [
        "hicappAccessToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
        "hicappRefreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
      ],
    });

    res.end(
      JSON.stringify({
        message: "Logged out successfully",
      }),
    );
  } catch (error) {
    console.log("LOGOUT ERROR - ", error);

    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Something went wrong",
      }),
    );
  }
};
