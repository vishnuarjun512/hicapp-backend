import { sendError, sendJson } from "../utils/http.js";
import { requireAuthenticatedUser } from "../utils/jwt.js";
import {
  searchPostsService,
  searchUsersService,
} from "../services/search.service.js";

export const searchCallController = async (req, res, postId) => {
  try {
    const { userId } = requireAuthenticatedUser(req);

    const url = new URL(req.url, `http://${req.headers.host}`);
    const query = url.searchParams.get("query")?.trim();

    const type = url.searchParams.get("type") ?? "all";

    if (!query || query.length < 2) {
      return sendJson(res, 200, {
        users: [],
        posts: [],
        error: false,
      });
    }

    if (query.length > 100) {
      return sendError(res, 400, "Search query is too long");
    }

    if (!["all", "users"].includes(type)) {
      return sendError(res, 400, "Invalid search type");
    }

    const usersPromise = searchUsersService(query, userId);

    if (type === "users") {
      const users = await usersPromise;

      return sendJson(res, 200, {
        users: users.slice(0, 5),
        posts: [],
      });
    }

    const [users, posts] = await Promise.all([
      usersPromise,
      searchPostsService(query, userId),
    ]);

    sendJson(res, 200, { users, posts, error: false });
  } catch (error) {
    console.log("SEARCH CALL CONTROLLER ERROR - ", error);
    sendError(
      res,
      error.statusCode ?? 500,
      error.message ?? "Internal Server Error",
    );
  }
};
