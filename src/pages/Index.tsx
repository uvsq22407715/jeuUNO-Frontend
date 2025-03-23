import { Header } from "@/pages/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { Footer } from "@/pages/footer";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        {/* Hero Section */}
        <div
          className="text-center space-y-6 py-20 rounded-2xl bg-gradient-to-r from-red-500/90 to-red-600/90 relative overflow-hidden"
          style={{
            backgroundImage: 'url("/uno-cards-bg.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/90 to-red-600/90" />
          <div className="relative z-10 px-4">
            <h1 className="text-4xl font-bold text-white mb-4">
              Bienvenue sur UNO Online
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Jouez au célèbre jeu de cartes UNO en ligne !
            </p>
            <Button
              className="bg-white hover:bg-gray-100 text-uno-red hover:text-red-600 text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
              onClick={() => {
                const user = localStorage.getItem("user");
                if (user) {
                  navigate("/Room");
                } else {
                  navigate("/login");
                }
              }}
            >
              <Play className="mr-2 h-6 w-6" />
              Jouer maintenant
            </Button>
          </div>
        </div>

        {/* Rules Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-uno-dark mb-4">
                But du jeu
              </h2>
              <p className="text-gray-700">
                <strong>Objectif :</strong> Être le premier joueur à se
                débarrasser de toutes ses cartes.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-uno-dark mb-4">
                Déroulement
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Chaque joueur reçoit 7 cartes au début de la partie.</li>
                <li>
                  Les joueurs doivent poser une carte de la même couleur ou du
                  même chiffre que celle du dessus de la pile.
                </li>
                <li>
                  Si un joueur ne peut pas jouer, il doit piocher une carte.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-uno-dark mb-4">
                Cartes spéciales
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-gray-700">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold">+2</p>
                  <p>Le joueur suivant pioche 2 cartes et passe son tour</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold">Inversement</p>
                  <p>Change le sens du jeu</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold">Passer</p>
                  <p>Le joueur suivant passe son tour</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold">Joker</p>
                  <p>Permet de changer la couleur</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold">+4</p>
                  <p>
                    Le joueur suivant pioche 4 cartes, passe son tour et vous
                    choisissez la couleur
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
