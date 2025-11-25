// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import APIDocumentation from "./components/APIDocumentation/APIDocumentation";
import ImageUpload from "./components/ImageUpload/ImageUpload";
import IntroPanel from "./components/IntroPanel/IntroPanel";
import MainPanel from "./components/MainPanel/MainPanel";
import ConclusionPanel from "./components/ConclusionPanel/ConclusionPanel";
import PostsPanel from "./components/PostsPanel/PostsPanel";
import Sidebar from "./components/Sidebar/Sidebar";
import StatsPanel from "./components/StatsPanel/StatsPanel";
import LoginPage from "./components/Auth/LoginPage";
import RegisterPage from "./components/Auth/RegisterPage";
import ProfilePage from "./components/ProfilePage/ProfilePage";


import "./App.css";
import { useEffect, useState } from "react";


function AppContent() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [role, setRole] = useState(null);
  const [trackedPaths, setTrackedPaths] = useState([]);


  // Проверка токена при загрузке и смене маршрута
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Декод JWT
        setRole(payload.role);
      } catch (e) {
        console.error("Invalid token", e);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setRole(null);
      }
    } else {
      setRole(null);
    }
  }, [location]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(null);
  };

  // Загрузка путей
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/admin/pages/paths", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const paths = Array.isArray(data.paths) ? data.paths : [];
        setTrackedPaths(paths);
      })
      .catch((err) => {
        console.error("Failed to load tracked paths:", err);
        setTrackedPaths([]);
      });
  }, [isAuthenticated]);


  // KPI
  useEffect(() => {
    if (!isAuthenticated || !Array.isArray(trackedPaths) || trackedPaths.length === 0) return;

    const path = location.pathname;
    if (!trackedPaths.includes(path)) return; // ← проверяем динамически

    const token = localStorage.getItem("token");
    let start = performance.now();
    let pageId = null;

    fetch(`http://localhost:8000/admin/page/by-path${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        pageId = data.id;
      })
      .catch(console.error);

    const sendTime = (seconds) => {
      if (!pageId || seconds <= 0) return;
      if (window.navigator.sendBeacon) {
        const body = JSON.stringify({ seconds });
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(`http://localhost:8000/admin/kpi/${pageId}/time`, blob);
      } else {
        fetch(`http://localhost:8000/admin/kpi/${pageId}/time`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ seconds }),
        }).catch(console.error);
      }
    };

    const handleBeforeUnload = () => {
      const end = performance.now();
      const seconds = Math.round((end - start) / 1000);
      sendTime(seconds);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      const end = performance.now();
      const seconds = Math.round((end - start) / 1000);
      sendTime(seconds);
    };
  }, [location.pathname, isAuthenticated, trackedPaths]);

  // Редирект на /login, если неавторизован
  if (!isAuthenticated && !["/login", "/register"].includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  // Страницы без сайдбара
  const noSidebar = ["/login", "/register"].includes(location.pathname);

  return (
    // ✅ Единый flex-контейнер
    <div className="app-container">
      {/* Сайдбар — только если нужен */}
      {!noSidebar && isAuthenticated && (
        <Sidebar isAuthenticated={isAuthenticated} role={role} onLogout={handleLogout} />
      )}

      {/* Основной контент — всегда */}
      <main className="content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/intro" replace />} />
          <Route path="/intro" element={<IntroPanel />} />
          <Route path="/main" element={<MainPanel />} />
          <Route path="/conclusion" element={<ConclusionPanel />} />
          <Route path="/posts" element={<PostsPanel />} />
          <Route path="/image" element={<ImageUpload />} />
          {isAuthenticated && <Route path="/profile" element={<ProfilePage />} />}
          {role === "admin" && <Route path="/api" element={<APIDocumentation />} />}
          {role === "admin" && <Route path="/stats" element={<StatsPanel />} />}
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="body">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
