import { createPostService } from "../services/post.service.js";
import { BodyReader } from "../utils/dataReader";

export const createPostController = async (req, res, userId) => {
  try {
    const { body, visibility } = await BodyReader(req);

    const post = await createPostService(userId, body, visibility);

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        message: "Post Created Successfully",
        post,
      }),
    );
    return;
  } catch (error) {
    console.log("CREATE POST ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};
