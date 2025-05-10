import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import { SignupSchema, SigninSchema, RoomSchema } from "@repo/common/types";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/token";

const app = express();

app.use(express.json());

app.post("/signup", async function (req: Request, res: Response) {
  const safeparse = SignupSchema.safeParse(req.body);

  if (safeparse.error) {
    res.status(406).json({ msg: "Invalid Input" });
    return;
  }

  const finduser = await prismaClient.user.findFirst({
    where: { email: safeparse.data.email },
  });

  if (finduser) {
    res.status(411).json({ msg: "user already exists with this email" });
    return;
  }

  try {
    const user = await prismaClient.user.create({
      data: {
        email: safeparse.data?.email,
        password: safeparse.data?.password,
        name: safeparse.data?.name,
      },
    });

    res.status(200).json({ user_id: user.id });
  } catch (error) {
    console.log(error);
    res.status(411).json({ msg: "something went wrong" });
  }
});

app.post("/signin", async function (req: Request, res: Response) {
  const safeparse = SigninSchema.safeParse(req.body);

  if (safeparse.error) {
    res.status(406).json({ msg: "Invalid Input" });
    return;
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: safeparse.data.email,
    },
  });

  if (!user) {
    res.status(406).json({ msg: "No user found" });
    return;
  }

  if (user.password !== safeparse.data.password) {
    res.status(406).json({ msg: "Incorrect Password" });
    return;
  }

  try {
    const token = jwt.sign({ user_id: user.id }, JWT_SECRET);
    res.status(200).json({ token: token });
  } catch (error) {
    console.log(error);
    res.status(402).json({ msg: "something went wrong" });
  }
});

app.listen(3001);
