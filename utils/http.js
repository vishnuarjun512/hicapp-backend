export const sendJson = (res, statusCode, body) => {
  if (res.writableEnded) return;
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
};

export const sendError = (res, statusCode, message) =>
  sendJson(res, statusCode, { message });

export const getPathname = (req) =>
  new URL(req.url, `http://${req.headers.host ?? "localhost"}`).pathname;
