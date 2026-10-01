import { searchCallController } from "../controller/search.controller.js";

export const searchRoutes = (req, res) => {
  if (req.method == "GET" && req.url.startsWith("/api/search")) {
    searchCallController(req, res);
    return true;
  }

  return false;
};
