export const unVerifiedActivites = (user) => {
  if (user.verified == false) {
    const error = new Error("Blocked: Account not verified!");
    error.statusCode = 403;
    throw error;
  }
};
