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

  ws.on("message", async function message(data) {
    let parsedata;
    if (typeof data !== "string") {
      parsedata = JSON.parse(data.toString());
    } else {
      parsedata = JSON.parse(data);
    }

    if (parsedata.type === "join-room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }

      user.rooms = user.rooms.filter((x) => x === parsedata.room);
    }

    if (parsedata.type === "chat") {
      const roomid = parsedata.roomid;
      const message = parsedata.message;

      await prismaClient.chat.create({
        data: {
          userId: userid,
          roomId: Number(roomid),
          message: message,
        },
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomid)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              roomid,
            })
          );
        }
      });
    }
  });

  ws.send("something");
});
