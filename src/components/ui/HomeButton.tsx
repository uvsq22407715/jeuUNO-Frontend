import { useNavigate } from "react-router-dom";

const HomeButton = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/"); // Redirige vers la page d'accueil
  };

  return (
    <button
      onClick={handleGoHome}
      className="absolute top-16 right-4 bg-blue-600 text-white py-2 px-4 rounded-full shadow-lg hover:bg-blue-700 transition duration-200 ease-in-out w-full max-w-xs"
    >
      Accueil
    </button>
  );
};

export default HomeButton;