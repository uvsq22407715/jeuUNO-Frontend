import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser)); 
    }
  }, [navigate]);

  if (!user) {
    return null; 
  }

  return children; 
};