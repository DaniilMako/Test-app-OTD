// src/components/StatsPanel/StatsPanel.js
import { useState, useEffect } from "react";

export default function StatsPage() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found");
      return;
    }

    fetch("http://localhost:8000/admin/kpis", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Access denied or server error");
        return res.json();
      })
      .then(setStats)
      .catch((err) => {
        console.error("Failed to load stats:", err);
        alert("Ошибка загрузки статистики. Возможно, у вас нет прав.");
      });
  }, []);

  return (
    <div className="main-header">
      <h2>Статистика</h2>
      {stats.length === 0 ? (
        <p>Нет данных для отображения</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Страница</th>
              <th>Посещения</th>
              <th>Время</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.page_id}>
                <td>{s.title}</td>
                <td>{s.visits}</td>
                <td>{s.time_spent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
