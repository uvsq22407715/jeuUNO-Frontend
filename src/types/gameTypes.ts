// Path: src/types/gameTypes.ts

export interface Card {
  couleur: "red" | "blue" | "green" | "yellow" | "black";
  valeur: string;
}

export interface Player {
  score: number;
  _id?: string;
  name: string;
  hand?: Card[];
  isHost?: boolean;
  isAvailable?: boolean;
}

export interface Game {
  currentCard: Card;
  _id?: string;
  roomCode: string;
  players: Player[];
  deck?: Card[];
  discardPile?: Card[];
  indiceActuelPlayer?: number;
  currentPlayerIndex: number;
}
