// src/components/ImageUpload.js
import React, { useState } from 'react';
import './ImageUpload.css';

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [originalImage, setOriginalImage] = useState('');
  const [invertedImage, setInvertedImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOriginalImage(URL.createObjectURL(selectedFile));
      setInvertedImage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/invert-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        setInvertedImage(URL.createObjectURL(blob));
      } else {
        alert('Ошибка при инверсии изображения');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось подключиться к серверу');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="image-upload-container">
      <div className="main-header">
        <h2>Инвертирование изображения</h2>
        <p>Выберите или перенестите изображение на белое поле и инвертируйте его цвета</p>
      </div>

      {/* Контролы */}
      <div className="upload-controls">
        <input
          className="input-button"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={!file || isUploading}
        >
          {isUploading ? 'Инвертируем...' : 'Инвертировать'}
        </button>
      </div>

      {/* Сравнение: До / После */}
      <div className="image-comparison">
        {/* Оригинал */}
        <div className="image-column">
          <h3>Оригинал (До)</h3>
          {originalImage ? (
            <img
              src={originalImage}
              alt="Оригинал"
              className="image-preview"
            />
          ) : (
            <div className="image-placeholder">
              Загрузите изображение
            </div>
          )}
        </div>

        {/* Инвертированное */}
        <div className="image-column">
          <h3>Инвертированное (После)</h3>
          {invertedImage ? (
            <img
              src={invertedImage}
              alt="Инвертированное"
              className="image-preview"
            />
          ) : (
            <div className="image-placeholder">
              {file ? 'Нажмите "Инвертировать"' : 'Результат появится здесь'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
