import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SquarePlus, SquareUser } from "lucide-react";
import { WaitingRoom } from "@/pages/WaitingRoom";
import { socket } from "../socket"; // 🔥 Importer `Socket.io`

type Player = {
  id: string;
  name: string;
  isHost: boolean;
};

export default function Room() {
  const [roomName, setRoomName] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [inWaitingRoom, setInWaitingRoom] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [currentRoomCode, setCurrentRoomCode] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // 🎧 Écouter la confirmation de création de room
    socket.on("room-created", (message) => {
      setCurrentRoomCode(message);
      setInWaitingRoom(true);
      setIsHost(true);

      toast({
        title: "Room créée",
        description: `Room "${message}" créée avec succès`,
      });

      localStorage.setItem("roomCode", message);
      const userStorage = localStorage.getItem("user");
      const user = userStorage ? JSON.parse(userStorage) : null;

      // ✅ Ajouter immédiatement l'hôte à la liste des joueurs
      setPlayers([
        { id: user.id || crypto.randomUUID(), name: user.nom, isHost: true },
      ]);
      navigate(`/waiting-room/${message}`);
    });

    // 🎧 Écouter la confirmation de join de room
    socket.on("room-joined", (roomCode) => {
      setCurrentRoomCode(roomCode);
      setInWaitingRoom(true);
      setIsHost(false);

      // ✅ Stocker le code de la room dans localStorage
      localStorage.setItem("roomCode", roomCode);

      toast({
        title: "Succès",
        description: `Vous avez rejoint la room ${roomCode}`,
      });

      // ✅ Redirection vers la salle d'attente
      navigate(`/waiting-room/${roomCode}`);
    });

    // 🎧 Gestion des erreurs envoyées par le serveur
    socket.on("roomError", (message) => {
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    });

    return () => {
      socket.off("room-created");
      socket.off("room-joined");
      socket.off("roomError");
    };
  }, []);

  const [players, setPlayers] = useState<Player[]>([]);

  const handleCreateRoom = async () => {
    const userStorage = localStorage.getItem("user");

    if (!roomName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom de room",
        variant: "destructive",
      });
      return;
    }

    try {
      const user = userStorage ? JSON.parse(userStorage) : null;

      if (!user) {
        toast({
          title: "Erreur",
          description: "Utilisateur non trouvé, veuillez vous reconnecter",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const token = user.token;

      socket.emit("create-room", { roomName, token, pname: user.nom });
      console.log({ roomName, token, pname: user.nom });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la room",
        variant: "destructive",
      });
      console.error("Erreur lors de la création de la room :", error);
    }
  };

  const handleJoinRoom = async () => {
    const userStorage = localStorage.getItem("user");

    console.log("joinRoomCode", joinRoomCode);

    if (!joinRoomCode.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un code de room",
        variant: "destructive",
      });
      return;
    }

    try {
      const user = userStorage ? JSON.parse(userStorage) : null;

      console.log("user", user);

      if (!user) {
        toast({
          title: "Erreur",
          description: "Utilisateur non trouvé, veuillez vous reconnecter",
          variant: "destructive",
        });
        navigate("/login"); // ✅ Redirection vers login si aucun utilisateur
        return;
      }

      const token = user.token;

      socket.emit("join-room", { roomCode: joinRoomCode, token, name: user.nom });
    } catch (error) {
      console.error("Erreur lors de la requête:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (inWaitingRoom) {
    return (
      <WaitingRoom
        roomCode={currentRoomCode}
        isHost={isHost}
        onGameStart={handleGameStart}
      />
    );
  }

  return (
    <div className="min-h-screen bg-uno-dark p-4 flex flex-col items-center justify-center">
      <Button
        className="mb-6 w-1/3 bg-uno-red hover:bg-red-600"
        onClick={() => {
          navigate("/");
        }}
      >
        Accueil
      </Button>
      <div className="container max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Créer une room */}
          <Card className="w-full h-full transition-transform hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SquarePlus className="h-6 w-6 text-uno-red" />
                Créer une Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomName">Nom de la room</Label>
                  <Input
                    id="roomName"
                    placeholder="Entrez le nom de votre room"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Maximum 4 joueurs par room
                  </p>
                </div>
                <Button
                  className="w-full bg-uno-red hover:bg-red-600"
                  onClick={handleCreateRoom}
                >
                  Créer la room
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rejoindre une room */}
          <Card className="w-full h-full transition-transform hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SquareUser className="h-6 w-6 text-uno-red" />
                Rejoindre une Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="joinCode">Code de la room</Label>
                  <Input
                    id="joinCode"
                    placeholder="Entrez le code de la room"
                    value={joinRoomCode}
                    onChange={(e) => setJoinRoomCode(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-uno-red hover:bg-red-600"
                  onClick={handleJoinRoom}
                >
                  Rejoindre la room
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}