import { BodyReader } from "../utils/dataReader.js";
import { requireAuthenticatedUser } from "../utils/jwt.js";

import { getImageUploadURLService } from "../services/image.service.js";

export const createPostImageUploadController = async (req, res) => {
  try {
    const { userId } = requireAuthenticatedUser(req);

    const data = await BodyReader(req);

    const { contentType } = data;

    if (!contentType) {
      res.statusCode = 400;

      res.end(
        JSON.stringify({
          message: "contentType is required",
        }),
      );

      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(contentType)) {
      res.statusCode = 400;

      res.end(
        JSON.stringify({
          message: "Unsupported image type",
        }),
      );

      return;
    }

    const upload = await getImageUploadURLService(userId, contentType);

    res.statusCode = 200;

    res.end(
      JSON.stringify({
        uploadUrl: upload.uploadUrl,
        fileUrl: upload.fileUrl,
        key: upload.key,
      }),
    );
  } catch (error) {
    console.log("CREATE POST IMAGE UPLOAD CONTROLLER ERROR - ", error);

    res.statusCode = 500;

    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};
