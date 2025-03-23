import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, UserX, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

export const WaitingRoom = () => {
  const { roomCode } = useParams(); // ✅ Récupérer roomCode depuis l'URL
  const { toast } = useToast();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false); // ✅ Suivre si l'utilisateur est l'hôte

  useEffect(() => {
    if (!roomCode) {
      console.error("❌ Erreur : roomCode est vide !");
      return;
    }

    // Vérifier si l'hôte est déjà ajouté
    if (players.length === 0) {
      const userStorage = localStorage.getItem("user");
      if (userStorage) {
        const user = JSON.parse(userStorage);
        setPlayers([
          { id: user.id || crypto.randomUUID(), name: user.nom, isHost: true },
        ]);
      }
    }

    socket.on("room-updated", (updatedRoom) => {
      const userStorage = localStorage.getItem("user");
      if (userStorage) {
        let user = JSON.parse(userStorage);
        let userName = user.nom;

        console.log("updatedRoom", updatedRoom);

        const player = updatedRoom.players.find((p) => p.name === userName);
        if (!player) {
          toast({
            title: "Kick",
            description: "You have been kicked from the room",
            variant: "destructive",
          });
          localStorage.removeItem("roomCode");
          socket.emit("leave-on-kick", roomCode);
          navigate("/");
          return;
        }
      }
      if (updatedRoom && updatedRoom.players) {
        // ✅ Forcer l'affichage de l'hôte en premier
        const sortedPlayers = [...updatedRoom.players].sort(
          (a, b) => b.isHost - a.isHost
        );
        setPlayers(sortedPlayers);
      }
    });

    socket.on("game-left", (updatedRoom) => {
      if (!updatedRoom) {
        toast({
          title: "Game left",
          description: "Vous avez quitté la partie",
          variant: "destructive",
        });
        localStorage.removeItem("roomCode");
        socket.emit("leave-on-kick", roomCode);
        navigate("/");
        return;
      }

      const userStorage = localStorage.getItem("user");
      if (userStorage) {
        let user = JSON.parse(userStorage);
        let userName = user.nom;

        const player = updatedRoom.players.find((p) => p.name === userName);
        if (!player) {
          toast({
            title: "Game left",
            description: "Vous avez quitté la partie",
            variant: "destructive",
          });
          localStorage.removeItem("roomCode");
          socket.emit("leave-on-kick", roomCode);
          navigate("/");
          return;
        }
      }
      if (updatedRoom && updatedRoom.players) {
        // ✅ Forcer l'affichage de l'hôte en premier
        const sortedPlayers = [...updatedRoom.players].sort(
          (a, b) => b.isHost - a.isHost
        );
        setPlayers(sortedPlayers);
      }
    });

    return () => {
      socket.off("room-updated");
    };
  }, [roomCode]);

  // Pour démarrer le jeu
  useEffect(() => {
    socket.on("game-started", ({ roomCode }) => {
      navigate(`/game/${roomCode}`); // ✅ TOUS les joueurs seront redirigés !
    });

    return () => {
      socket.off("game-started");
    };
  }, []);

  // ✅ Mettre à jour isHost dès que players est mis à jour
  useEffect(() => {
    if (players.length > 0) {
      const userStorage = localStorage.getItem("user");
      if (userStorage) {
        const user = JSON.parse(userStorage);
        const hostPlayer = players.find((p) => p.isHost);

        if (hostPlayer?.name === user.nom) {
          setIsHost(true);
          toast({
            title: "Updated",
            description: "Vous êtes l'hôte de la partie",
          });
        } else {
          setIsHost(false);
        }
      }
    }
  }, [players]);

  const handleKickPlayer = (playerNameKicked: string) => {
    if (!isHost) return;

    try {
      const userStorage = localStorage.getItem("user");
      if (userStorage) {
        const user = JSON.parse(userStorage);
        const hostToken = user.token;

        socket.emit("kick-player", { roomCode, playerNameKicked, hostToken }); // Envoie le token du host pour vérifier si c'est bien lui qui kick
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de quitter la partie",
        variant: "destructive",
      });
      console.error("Erreur lors du leave du joueur:", error);
    }
  };

  const handleStartGame = () => {
    if (!roomCode) {
      console.error(
        "❌ Erreur : roomCode est undefined dans handleStartGame !"
      );
      toast({
        title: "Erreur",
        description: "Impossible de démarrer, roomCode manquant.",
        variant: "destructive",
      });
      return;
    }

    if (players.length < 2 || players.length > 4) {
      toast({
        title: "Impossible de démarrer le jeu",
        description: "Pour commencer il faut exactement 4 joueurs !",
        variant: "destructive",
      });
      return;
    }

    // ✅ Vérifie que l'objet envoyé a bien roomCode
    socket.emit("start-game", { roomCode });
  };

  const handleLeaveRoom = async () => {
    if (!roomCode) return;
    try {
      const userStorage = localStorage.getItem("user");
      if (userStorage) {
        let user = JSON.parse(userStorage);

        const token = user.token;
        socket.emit("leave-room", { roomCode, token, pname: user.nom });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la room",
        variant: "destructive",
      });
      console.error("Erreur lors de la suppression de la room:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Waiting Room</h1>
          <p className="text-gray-400">Room Code: {roomCode}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Users className="h-5 w-5" />
            <span>{players.length}/4 Players</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {players.map((player, index) => (
            <motion.div
              key={`${player.id}-${index}`} // Combine player.id with index for guaranteed uniqueness
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 bg-white/10 backdrop-blur-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <span>{player.name}</span>
                    {player.isHost && (
                      <span className="text-xs bg-uno-red px-2 py-1 rounded-full">
                        Host
                      </span>
                    )}
                  </div>
                  {isHost && !player.isHost && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleKickPlayer(player.name)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <UserX className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {isHost && (
          <>
            <div className="flex justify-center">
              <Button
                onClick={handleStartGame}
                className="bg-uno-red hover:bg-red-600 text-white px-8"
                disabled={players.length < 2 || players.length > 4}
              >
                Commencer le jeu
              </Button>
            </div>
          </>
        )}

        <div className="flex justify-center mt-4">
          <Button
            onClick={handleLeaveRoom}
            className="bg-uno-red hover:bg-red-600 text-white px-8"
          >
            Quitter
          </Button>
        </div>
      </div>
    </div>
  );
};