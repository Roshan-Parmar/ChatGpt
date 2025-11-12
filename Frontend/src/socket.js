import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  withCredentials: true,
  auth: {
    token: localStorage.getItem("token"), // or read cookie
  },
});

export default socket;