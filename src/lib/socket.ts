import { io, Socket } from "socket.io-client";

export const socket: Socket = io("https://chatbackend-2frf.onrender.com", {
  transports: ["websocket"],
});

