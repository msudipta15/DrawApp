import express from "express";
import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client";

const app = express();

app.use(express.json());

app.post("/signup", async function (req: Request, res: Response) {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  try {
    const user = await prismaClient.user.create({
      data: {
        email,
        password,
        name,
      },
    });

    res.json({ user_id: user.id });
  } catch (error) {
    console.log(error);
  }
});

app.listen(3001);
