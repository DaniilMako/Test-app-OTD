// src/components/Sidebar/Sidebar.js
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isAuthenticated, role }) => {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {/* Публичные страницы */}
          <li><NavLink to="/intro">🚩<br />Введение</NavLink></li>
          <li><NavLink to="/main">📛<br />Описание</NavLink></li>
          <li><NavLink to="/conclusion">🏁<br />Заключение</NavLink></li>

          {/* Только для авторизованных */}
          {isAuthenticated && (
            <>
              <li><NavLink to="/posts">📒<br />Посты</NavLink></li>
              <li><NavLink to="/image">🖼️<br />Инвертировать изображение</NavLink></li>
            </>
          )}

          {/* Только для админа */}
          {role === "admin" && (
            <>
              <li><NavLink to="/api">🌐<br />API</NavLink></li>
              <li><NavLink to="/stats">📊<br />Статистика</NavLink></li>
            </>
          )}

          {/* Профиль — как обычный пункт */}
          <li>
            <NavLink to="/profile">
              👤<br />
              {isAuthenticated ? "Профиль" : "Войти"}
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
