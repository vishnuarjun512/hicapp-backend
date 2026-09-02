import { createPostService } from "../services/post.service.js";
import { BodyReader } from "../utils/dataReader.js";

export const createPostController = async (req, res, userId) => {
  try {
    const data = await BodyReader(req);
    const { body, visibility, location } = data;
    await createPostService(userId, body, visibility, location).then((post) => {
      console.log("Post Creation Success");
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          message: "Post Created Successfully",
          post,
        }),
      );
      return;
    });
  } catch (error) {
    console.log("CREATE POST CONTROLLER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};
