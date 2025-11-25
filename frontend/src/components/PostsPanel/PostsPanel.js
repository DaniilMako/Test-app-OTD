// src/components/PostsPanel.js
import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import "./PostsPanel.css";

const PostsPanel = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [postCount, setPostCount] = useState(10);

  // Восстанавливаем выбор из localStorage
  const [useAxios, setUseAxios] = useState(() => {
    const saved = localStorage.getItem("useAxios");
    return saved !== null ? saved === "true" : true; // по умолчанию axios
  });

  // Сохраняем выбор
  useEffect(() => {
    localStorage.setItem("useAxios", useAxios);
  }, [useAxios]);

  // === Загрузка через Axios ===
  const loadWithAxios = useCallback(async () => {
    try {
      setPosts([]);
      setIsLoading(true);
      const response = await axios.get("http://localhost:8000/posts");
      // const response = await axios.get("https://jsonplaceholder.typicode.com/posts");
      setPosts(response.data);
      setIsError(false);
    } catch (error) {
      setIsError(true);
      console.error("Axios error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // === Загрузка через Fetch ===
  const loadWithFetch = useCallback(async () => {
    try {
      setPosts([]);
      setIsLoading(true);
      const response = await fetch("http://localhost:8000/posts");
      // const response = await fetch("https://jsonplaceholder.typicode.com/posts");
      if (!response.ok) throw new Error("Ошибка сети");
      const data = await response.json();
      setPosts(data);
      setIsError(false);
    } catch (error) {
      setIsError(true);
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // === Загрузка при изменении метода ===
  useEffect(() => {
    if (useAxios) {
      loadWithAxios();
    } else {
      loadWithFetch();
    }
  }, [useAxios, loadWithAxios, loadWithFetch]);

  // === Мемоизация отфильтрованных постов ===
  const memoizedPosts = useMemo(() => {
    return posts.slice(0, postCount);
  }, [posts, postCount]);

  if (isLoading) {
    return <section><p className="status-message"><strong>Загрузка...</strong></p></section>;
  }

  // === JSX ===
  return (
    <section>
      <div className="main-header">
        <h2>Посты<span className="anchor">🧷</span></h2>
      </div>
      {/* Переключатель метода (стилизован как Google-табы) */}
      <div className="method-tabs">
        <button
          className={`tab ${useAxios ? "active" : ""}`}
          onClick={() => setUseAxios(true)}
          aria-pressed={useAxios}
        >
          Axios
        </button>
        <button
          className={`tab ${!useAxios ? "active" : ""}`}
          onClick={() => setUseAxios(false)}
          aria-pressed={!useAxios}
        >
          Fetch
        </button>
      </div>

      {/* Ползунок количества */}
      <div className="range-slider">
        <label>Количество постов:</label>
        <input
          type="range"
          min="1"
          max="100"
          value={postCount}
          onChange={(e) => setPostCount(parseInt(e.target.value))}
        />
        <span>{postCount}</span>
      </div>

      {/* Статус */}
      {isError && <p className="status-message">❌ Ошибка загрузки данных ❌</p>}

      {/* Список постов */}
      <ol className="posts-container">
        {memoizedPosts.map((post) => (
          <li key={post.id} className="post-card">
            <h3 className="post-title">{post.title}</h3>
            <p className="post-body">{post.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default PostsPanel;
