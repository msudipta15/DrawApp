import dotenv from "dotenv";
dotenv.config();

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/token";

export function userAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["token"] as String;
  if (!token) {
    res.status(406).json({ msg: "No token found" });
    return;
  }
  const decoded = jwt.verify(token?.toString(), JWT_SECRET) as {
    user_id: String;
  };

  if (!decoded) {
    res.status(406).json({ msg: "You are not signed in !" });
    return;
  }

  try {
    const userid = decoded.user_id;
    //@ts-ignore
    req.id = userid;
    next();
  } catch (error) {
    res.status(406).json({ msg: "something went wrong" });
  }
}
