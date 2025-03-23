import { io } from "socket.io-client";

// URL de backend WebSocket
const SOCKET_SERVER_URL = "http://localhost:5005";

// Création de la connexion WebSocket
export const socket = io(SOCKET_SERVER_URL, {
  transports: ["websocket", "polling"], // Utilise WebSocket en priorité
  withCredentials: true, // Permet d'envoyer les cookies si nécessaires
});
