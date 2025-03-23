import { io } from "socket.io-client";

// URL de backend WebSocket
const SOCKET_SERVER_URL = "https://jeu-uno-back-q239.onrender.com";

// Création de la connexion WebSocket
export const socket = io(SOCKET_SERVER_URL, {
  transports: ["websocket", "polling"], // Utilise WebSocket en priorité
  withCredentials: true, // Permet d'envoyer les cookies si nécessaires
});
