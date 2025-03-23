import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from '../../socket';

export const ProtectedRouteRoom = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isInRoom, setIsInRoom] = useState(false);
    const navigate = useNavigate();
    const { roomCode } = useParams();

    useEffect(() => {

        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate('/login'); // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
        } else {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            // Vérifier si l'utilisateur est dans la salle
            if (roomCode) {
                socket.emit("check-room-membership", { roomCode, token : parsedUser.token });

                socket.on("room-membership-status", (isMember) => {
                    console.log("isMember", isMember);
                    if (!isMember) {
                        navigate('/'); // Si l'utilisateur n'est pas membre de la salle, rediriger vers la page d'accueil
                    } else {
                        setIsInRoom(true);
                    }
                });
            }
        }

        return () => {
            socket.off("room-membership-status");
        }
        
    }, [navigate, roomCode]);

    if (!user || !isInRoom) { 
        return null; // Affiche rien tant que la vérification n'est pas faites
    }

    return children;


};