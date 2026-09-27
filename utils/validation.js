export const validateCredentials = ({ email, password }) => {
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    const error = new Error(
      "Email and a password of at least 8 characters are required",
    );
    error.statusCode = 400;
    throw error;
  }
};
