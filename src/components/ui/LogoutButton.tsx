import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Supprimer les données de l'utilisateur de localStorage
    localStorage.removeItem("user");

    // Rediriger l'utilisateur vers la page de connexion
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="absolute top-4 right-4 bg-red-600 text-white py-2 px-4 rounded-full shadow-lg hover:bg-red-700 transition duration-200 ease-in-out w-full max-w-xs"
    >
      Se déconnecter
    </button>
  );
};

export default LogoutButton;