// src/components/ProfilePage/ProfilePage.js
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Декодируем токен, чтобы получить email (sub)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setEmail(payload.sub || "Неизвестный пользователь");
    } catch (e) {
      console.error("Invalid token", e);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <h2>Профиль пользователя</h2>
      <div className="profile-info">
        <p><strong>Логин (email):</strong> {email}</p>
      </div>
      <button onClick={handleLogout} className="logout-button">
        Выйти
      </button>
    </div>
  );
}
