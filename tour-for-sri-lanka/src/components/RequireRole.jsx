import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function RequireRole({ role, children }) {
  const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (!user) {
      toast.error("Please login to continue");
    } else if (user.role !== role) {
      toast.error("You are not authorized to view this page");
    }
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}