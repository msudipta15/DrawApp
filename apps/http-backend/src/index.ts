import dotenv from "dotenv";
dotenv.config();

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import { SignupSchema, SigninSchema, RoomSchema } from "@repo/common/types";

import { JWT_SECRET } from "@repo/backend-common/token";
import { userAuth } from "./middleware";

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
    const hashpassword = await bcrypt.hash(safeparse.data.password, 10);

    const user = await prismaClient.user.create({
      data: {
        email: safeparse.data?.email,
        password: hashpassword,
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

  const hashpassword = await bcrypt.compare(
    safeparse.data.password,
    user.password
  );

  if (!hashpassword) {
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

app.post("/room", userAuth, async function (req: Request, res: Response) {
  //@ts-ignore
  const admin_id = req.id;

  const parsedata = RoomSchema.safeParse(req.body);

  if (parsedata.error) {
    res.status(406).json({ msg: "Invalid Input" });
    return;
  }

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedata.data?.room_name!,
        adminId: admin_id,
      },
    });

    res.status(200).json({ roomId: room.id });
  } catch (error) {
    res.status(200).json({ msg: "Room name already exists" });
    console.log(error);
  }
});
app.listen(3001);
