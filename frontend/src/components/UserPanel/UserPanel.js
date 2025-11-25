// src/components/UserPanel/UserPanel.js

import { NavLink } from "react-router-dom"; // ✅ Оставь только это

export default function UserPanel({ isAuthenticated }) {
  return (
    <li className="user-panel">
      <NavLink to="/profile" className="user-button">
        👤<br />{isAuthenticated ? "Профиль" : "Войти"}
      </NavLink>
    </li>
  );
}
