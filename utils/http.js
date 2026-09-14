const MAX_BODY_SIZE = 1_000_000;

export const sendJson = (res, statusCode, body) => {
  if (res.writableEnded) return;
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
};

export const sendError = (res, statusCode, message) =>
  sendJson(res, statusCode, { message });

export const readJsonBody = async (req) => {
  let body = "";

  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_SIZE) {
      const error = new Error("Request body is too large");
      error.statusCode = 413;
      throw error;
    }
  }

  if (!body) return {};

  try {
    return JSON.parse(body);
  } catch {
    const error = new Error("Request body must be valid JSON");
    error.statusCode = 400;
    throw error;
  }
};

export const getPathname = (req) =>
  new URL(req.url, `http://${req.headers.host ?? "localhost"}`).pathname;
