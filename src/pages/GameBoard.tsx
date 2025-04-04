import { useState, useEffect } from "react";
import { UnoCard } from "./UnoCard";
import { socket } from "@/socket";
import { useParams, useNavigate } from "react-router-dom";
import { Game, Player, Card } from "../types/gameTypes";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const GameBoard = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [currentPlayerName, setCurrentPlayerName] = useState<string>("");
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number | null>(
    null
  );
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [showScoreboard, setShowScoreboard] = useState(!isMobile);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (user && user.nom) {
      setCurrentPlayerName(user.nom); // Récupère le nom du joueur du localStorage
    }

    if (!roomCode) return;

    socket.emit("get-game", { roomCode });

    socket.on("game-state", (data: Game) => {
      socket.on("game-over", ({ message, players, winner }) => {
        setPlayers(players);
        setGameOver(true);
        setWinner(winner);
      });

      setGame(data);
      setPlayers(data.players || []);

      const currentPlayer = data.players.find((p) => p.name === user?.nom);
      if (currentPlayer) {
        setPlayerHand(currentPlayer.hand || []);
      }

      if (data.currentCard) {
        setCurrentCard(data.currentCard);
      }

      // Mettre à jour l'index du joueur actuel
      const currentPlayerIndex = data.players.findIndex(
        (p) => p.name === user?.nom
      );
      setCurrentPlayerIndex(currentPlayerIndex);
    });

    socket.on("game-error", (errorMsg: string) => {
      toast.error(errorMsg, { duration: 3000 });
    });

    // Nettoyage de l'événement socket à la fin du composant
    return () => {
      socket.off("game-state");
      socket.off("game-error");
    };
  }, [roomCode]);

  useEffect(() => {
    socket.on("game-won", ({ winner }) => {
      if (winner === currentPlayerName) {
        toast.success("Vous êtes le gagnant de la partie !", {
          duration: 6000,
        });
      } else {
        toast.info(`Le joueur ${winner} a gagné la partie.`, {
          duration: 6000,
        });
      }
      // Rediriger vers la page d'accueil après 4s (optionnel)
      setTimeout(() => {
        navigate("/");
      }, 5000);
    });

    return () => {
      socket.off("game-won");
    };
  }, [currentPlayerName, navigate]);

  useEffect(() => {
    socket.on("votre-tour", (gameData: Game) => {
      if (!gameData) return;
      if (currentPlayerIndex !== null) {
        if (gameData.currentPlayerIndex === currentPlayerIndex) {
          toast.info("C'est votre tour !", { duration: 3000 });
        }
      }
    });
    return () => {
      socket.off("votre-tour");
    };
  }, [currentPlayerIndex, players]);

  const handleLeaveRoom = () => {
    // Émettre l'événement pour quitter le jeu
    socket.emit("leave-game", { roomCode, playerName: currentPlayerName });
    // Optionnel : afficher un toast de confirmation
    toast.success("Vous avez quitté la partie.", { duration: 4000 });
    // Supprimer les informations de la room et rediriger (par exemple vers la page d'accueil)
    localStorage.removeItem("roomCode");
    // Rediriger vers la page d'accueil après un délai
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const handlePlayCard = (card: Card) => {
    if (game?.currentPlayerIndex !== currentPlayerIndex) {
      return;
    }

    if (card.valeur === "wild") {
      // Afficher le sélecteur de couleur pour les cartes Wild
      setSelectedCard(card);
      setShowColorPicker(true);
    } else {
      // Jouer une carte normale
      socket.emit("play-card", {
        roomCode,
        playerName: currentPlayerName,
        card,
      });
    }
  };

  const handleColorSelection = (color: string) => {
    if (selectedCard) {
      // On convertit la valeur de la carte en minuscule pour simplifier la comparaison
      const cardValue = selectedCard.valeur.toLowerCase();

      if (cardValue === "+4") {
        // Pour la carte +4, on émet l'événement "+4-color-chosen"
        socket.emit("+4-color-chosen", {
          roomCode,
          playerName: currentPlayerName,
          chosenColor: color,
        });
      } else if (cardValue === "wild") {
        // Pour la carte wild, on émet l'événement "color-chosen"
        socket.emit("color-chosen", {
          roomCode,
          playerName: currentPlayerName,
          chosenColor: color,
        });
      }

      setShowColorPicker(false);
      setSelectedCard(null);
    }
  };

  // Écouter l'événement "choose-color" pour afficher le sélecteur de couleur
  useEffect(() => {
    socket.on("choose-color", ({ playerName }) => {
      if (playerName === currentPlayerName) {
        setShowColorPicker(true);
      }
    });

    return () => {
      socket.off("choose-color");
    };
  }, [socket, currentPlayerName]);

  const handleDrawCard = () => {
    socket.emit("draw-card", { roomCode, playerName: currentPlayerName });
  };

  const handleSkipTurn = () => {
    socket.emit("skip-turn", { roomCode, playerName: currentPlayerName });
  };

  const toggleScoreboard = () => {
    setShowScoreboard(!showScoreboard);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white relative p-2 md:p-4">
      {/* Bouton pour afficher/masquer le scoreboard sur mobile */}
      {isMobile && (
        <button
          onClick={toggleScoreboard}
          className="absolute top-2 right-2 bg-gray-800 text-white px-3 py-1 rounded-full z-10 shadow-lg"
        >
          {showScoreboard ? "Cacher Scores" : "Voir Scores"}
        </button>
      )}

      {/* Scoreboard */}
      <div
        className={`
          ${isMobile ? (showScoreboard ? "fixed inset-0 z-20 bg-black bg-opacity-90 p-4 overflow-auto" : "hidden") : "absolute top-2 right-2 bg-gray-900 p-3 rounded shadow max-w-xs"}
        `}
      >
        {isMobile && showScoreboard && (
          <button
            onClick={toggleScoreboard}
            className="absolute top-2 right-2 bg-gray-800 px-3 py-1 rounded-full"
          >
            Fermer
          </button>
        )}

        <div className={`${isMobile ? "mt-10" : ""}`}>
          <table className="border-separate border-spacing-2 w-full text-sm md:text-base">
            <thead>
              <tr>
                <th className="text-left">Nom</th>
                <th className="text-left">Points</th>
                <th className="text-left">Cartes</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr
                  key={index}
                  className={
                    player.name === currentPlayerName
                      ? "font-bold text-green-500"
                      : ""
                  }
                >
                  <td>
                    {player.name}
                    {player.name === currentPlayerName && " (Vous)"}
                  </td>
                  <td className="text-center">{player.score || 0}</td>
                  <td className="text-center">{player.hand?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Afficher un message pour indiquer que c'est au tour du joueur */}
          {game && currentPlayerIndex !== null && (
            <div className="mt-4 text-center text-lg md:text-xl">
              {game.currentPlayerIndex === currentPlayerIndex ? (
                <span className="font-bold">C'est votre tour !</span>
              ) : (
                <>
                  C'est au tour de{" "}
                  <span className="font-bold">
                    {players[game.currentPlayerIndex]?.name}
                  </span>
                </>
              )}
            </div>
          )}
          
          {/* Bouton Quitter sous le tableau */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleLeaveRoom}
              className="bg-uno-red hover:bg-red-600 text-white px-6 py-2 rounded-lg border border-gray-400 shadow-md"
            >
              Quitter la partie
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen pt-10 pb-24">
        {currentCard ? (
          <UnoCard
            couleur={currentCard.couleur}
            valeur={currentCard.valeur}
            isPlayable={false}
            className="transform scale-100 md:scale-110 mb-4"
          />
        ) : (
          <p className="text-gray-400">Aucune carte actuelle</p>
        )}

        <div className="w-full px-2 md:px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mt-4 md:mt-6">Votre main</h2>
          <div className="flex flex-wrap justify-center gap-1 md:gap-2 mt-2 overflow-x-auto pb-2" style={{ maxWidth: '100vw' }}>
            {playerHand.map((card, index) => (
              <UnoCard
                key={index}
                couleur={card.couleur}
                valeur={card.valeur}
                isPlayable={game?.currentPlayerIndex === currentPlayerIndex}
                className={`
                  transform scale-90 md:scale-100
                  ${game?.currentPlayerIndex === currentPlayerIndex ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                `}
                onClick={() => handlePlayCard(card)}
              />
            ))}
          </div>
        </div>

        {/* Boutons */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-4 w-full px-4 md:w-auto">
          {/* Bouton pour piocher une carte */}
          <button
            onClick={handleDrawCard}
            className={`bg-gray-200 text-black px-4 md:px-6 py-2 rounded-lg border border-gray-400 shadow-md hover:bg-gray-300 ${
              game?.currentPlayerIndex !== currentPlayerIndex
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
            disabled={game?.currentPlayerIndex !== currentPlayerIndex}
          >
            Piocher
          </button>

          {/* Bouton pour passer le tour */}
          <button
            onClick={handleSkipTurn}
            className={`bg-gray-200 text-black px-4 md:px-6 py-2 rounded-lg border border-gray-400 shadow-md hover:bg-gray-300 ${
              game?.currentPlayerIndex !== currentPlayerIndex
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
            disabled={game?.currentPlayerIndex !== currentPlayerIndex}
          >
            Passer
          </button>
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-5/6 max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-black">
              Choisissez une couleur
            </h2>
            <div className="flex justify-around space-x-2 md:space-x-4">
              {["red", "blue", "green", "yellow"].map((color) => (
                <button
                  key={color}
                  className="w-12 h-12 rounded-full hover:scale-110 transition transform shadow"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelection(color)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && winner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 p-4 z-50">
          <div className="bg-white text-black p-4 md:p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-bold text-center mb-4">
              Félicitations, {winner.name} !
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse text-sm md:text-base">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-2">Position</th>
                    <th className="text-left p-2">Nom</th>
                    <th className="text-left p-2">Points</th>
                    <th className="text-left p-2">Message</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">1</td>
                    <td className="p-2">{winner.name}</td>
                    <td className="p-2">{winner.score}</td>
                    <td className="p-2">Gagnant !</td>
                  </tr>
                  {players
                    .sort((a, b) => b.score - a.score)
                    .filter((player) => player.name !== winner.name)
                    .map((player, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{index + 2}</td>
                        <td className="p-2">{player.name}</td>
                        <td className="p-2">{player.score}</td>
                        <td className="p-2">
                          {player.name === winner.name ? "Gagnant !" : "Perdant"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => navigate("/")}
                className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg mt-2 border-2 border-black w-full md:w-auto"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;