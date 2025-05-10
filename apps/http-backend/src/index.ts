import express from "express";
import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import { SignupSchema, SigninSchema, RoomSchema } from "@repo/common/types";
import { JWT_SECRET } from "@repo/backend-common/token";

const app = express();

app.use(express.json());

console.log(JWT_SECRET);

app.post("/signup", async function (req: Request, res: Response) {
  const safeparse = SignupSchema.safeParse(req.body);

  if (safeparse.error) {
    res.json({ msg: "Invalid Input" });
  } else {
    try {
      const user = await prismaClient.user.create({
        data: {
          email: safeparse.data?.email,
          password: safeparse.data?.password,
          name: safeparse.data?.name,
        },
      });

      res.json({ user_id: user.id });
    } catch (error) {
      console.log(error);
    }
  }
});

app.listen(3001);
