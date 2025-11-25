// src/components/Auth/RegisterPage.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      alert("Регистрация успешна");
      navigate("/login");
    } else {
      alert("Ошибка регистрации");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Регистрация</h2>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Логин"       // ← улучшили текст
          type="text"               // ✅ Заменено: email → text
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          type="password"
          required
        />
        <button type="submit">Зарегистрироваться</button>

        <p style={{ marginTop: "15px" }}>
          Есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}
