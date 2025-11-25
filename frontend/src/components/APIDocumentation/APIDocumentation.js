// src/components/APIDocumentation.js
import React, { useState, useEffect } from 'react';
// import '../App.css';
import './APIDocumentation.css';

const APIDocumentation = () => {
  // Восстанавливаем последнюю вкладку из localStorage
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('apiTab');
    return saved && (saved === 'redoc' || saved === 'swagger') ? saved : 'redoc';
  });

  // Сохраняем при изменении
  useEffect(() => {
    localStorage.setItem('apiTab', activeTab);
  }, [activeTab]);

  return (
    <div className="api-container">
      {/* Вкладки */}
      <div className="api-tabs">
        <button
          className={`tab ${activeTab === 'redoc' ? 'active' : ''}`}
          onClick={() => setActiveTab('redoc')}
          aria-pressed={activeTab === 'redoc'}
        >
          ReDoc
        </button>
        <button
          className={`tab ${activeTab === 'swagger' ? 'active' : ''}`}
          onClick={() => setActiveTab('swagger')}
          aria-pressed={activeTab === 'swagger'}
        >
          Swagger UI
        </button>
      </div>

      {/* Контент */}
      <div className="api-content">
        {activeTab === 'redoc' && (
          <iframe
            src="http://localhost:8000/redoc"
            title="ReDoc"
            className="api-frame"
            frameBorder="0"
          />
        )}
        {activeTab === 'swagger' && (
          <iframe
            src="http://localhost:8000/docs"
            title="Swagger UI"
            className="api-frame"
            frameBorder="0"
          />
        )}
      </div>
    </div>
  );
};

export default APIDocumentation;
