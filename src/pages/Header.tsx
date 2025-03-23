import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

export const Header = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="w-full py-6 px-8 bg-uno-dark text-uno-light animate-fade-in">
      <div className="container max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={"./favicon.ico"} alt="Logo" className="h-10 w-auto mr-2" />
          <h1 className="text-2xl font-bold tracking-tight">Jeu</h1>
        </div>
        <nav>
          {isMobile ? (
            <Menubar className="bg-transparent border-none">
              <MenubarMenu>
                <MenubarTrigger className="text-uno-light hover:text-uno-red data-[state=open]:text-uno-red">
                  <Menu className="h-6 w-6" />
                </MenubarTrigger>
                <MenubarContent>
                  {user ? (
                    <>
                      <MenubarItem>
                        {user.nom} {user.prenom}
                      </MenubarItem>
                      <MenubarItem onClick={handleLogout}>
                        Se déconnecter
                      </MenubarItem>
                    </>
                  ) : (
                    <>
                      <MenubarItem onClick={() => navigate("/login")}>
                        Se connecter
                      </MenubarItem>
                      <MenubarItem onClick={() => navigate("/signup")}>
                        Créer un compte
                      </MenubarItem>
                    </>
                  )}
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          ) : (
            <div className="flex gap-6">
              {user ? (
                <>
                  <span className="font-bold text-white">
                    {user.prenom} {user.nom}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="hover:text-uno-red transition-colors duration-200"
                  >
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="hover:text-uno-red transition-colors duration-200"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="hover:text-uno-red transition-colors duration-200"
                  >
                    Créer un compte
                  </button>
                </>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
