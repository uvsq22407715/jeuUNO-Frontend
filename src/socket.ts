import { io } from "socket.io-client";

const socket = io("https://jeu-uno-back-q239.onrender.com");

export { socket };
