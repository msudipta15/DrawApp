import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/token";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: string[];
  userid: string;
}

const users: User[] = [];

function checkuser(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.user_id) {
      return null;
    }

    return decoded.user_id;
  } catch (error) {
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  ws.on("error", console.error);

  const url = request.url;

  if (!url) {
    return;
  }

  const queryparams = new URLSearchParams(url.split("?")[1]);

  const token = queryparams.get("token");

  if (!token) {
    return;
  }

  const userid = checkuser(token);

  if (userid == null) {
    ws.close();
    return;
  }

  users.push({
    userid,
    rooms: [],
    ws,
  });

  ws.on("message", function message(data) {});

  ws.send("something");
});
