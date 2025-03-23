import React, { useState, useEffect } from "react";
import { startGame, playCard, drawCard, nextPlayer, getGameState } from "../../api/gameApi";
import { GameState, Card } from "../../types/gameTypes";
import { Button } from "@/components/ui/button";

const GameComponent: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Charge l'état de la partie au montage du composant
    useEffect(() => {
        fetchGameState();
    }, []);

    // Fonction pour récupérer l'état de la partie
    const fetchGameState = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getGameState();
            setGameState(data);
        } catch (err) {
            setError("Failed to fetch game state");
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour démarrer une nouvelle partie
    const handleStartGame = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await startGame(["Alice", "Bob"]);
            setGameState(data.game);
        } catch (err) {
            setError("Failed to start game");
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour jouer une carte
    const handlePlayCard = async () => {
        setLoading(true);
        setError(null);
        try {
            const card: Card = { color: "red", value: "5" }; /// TEST
            const data = await playCard("Alice", card);
            console.log("Card played:", data);
            await fetchGameState(); // Met à jour l'état de la partie
        } catch (err) {
            setError("Failed to play card");
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour piocher une carte
    const handleDrawCard = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await drawCard("Alice");
            console.log("Card drawn:", data);
            await fetchGameState(); // Met à jour l'état de la partie
        } catch (err) {
            setError("Failed to draw card");
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour passer au joueur suivant
    const handleNextPlayer = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await nextPlayer();
            console.log("Next player:", data);
            await fetchGameState(); // Met à jour l'état de la partie
        } catch (err) {
            setError("Failed to switch to next player");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>UNO Game</h1>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <Button onClick={handleStartGame} disabled={loading}>
                Start Game
            </Button>

            <Button onClick={handlePlayCard} disabled={loading || !gameState}>
                Play Card (Red 5)
            </Button>

            <Button onClick={handleDrawCard} disabled={loading || !gameState}>
                Draw Card
            </Button>

            <Button onClick={handleNextPlayer} disabled={loading || !gameState}>
                Next Player
            </Button>

            <h1>Game State</h1>
            <pre>{JSON.stringify(gameState, null, 2)}</pre>
        </div>
    );
};

export default GameComponent;