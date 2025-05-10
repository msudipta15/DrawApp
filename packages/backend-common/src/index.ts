if (!process.env.JWT_SECRET) {
  throw new Error("jwt_key is not defined");
}

export const JWT_SECRET = process.env.JWT_SECRET;
