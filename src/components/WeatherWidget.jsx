import React, { useState, useEffect } from 'react';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Nairobi coordinates: latitude: -1.2864, longitude: 36.8172
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-1.2864&longitude=36.8172&current_weather=true'
        );
        const data = await response.json();
        setWeather(data.current_weather);
        setError(false);
      } catch (err) {
        console.error('Weather API failed:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // Get weather icon based on temperature or conditions
  const getWeatherIcon = () => {
    if (!weather) return '🌡️';
    const temp = weather.temperature;
    if (temp > 25) return '☀️';
    if (temp > 18) return '⛅';
    if (temp > 12) return '☁️';
    return '❄️';
  };

  if (loading) {
    return <div className="text-muted">Loading weather...</div>;
  }

  if (error) {
    return <div className="text-muted">🌡️ Weather unavailable</div>;
  }

  return (
    <div className="d-flex align-items-center gap-2 bg-light px-3 py-2 rounded">
      <span style={{ fontSize: '1.5rem' }}>{getWeatherIcon()}</span>
      <div>
        <span className="fw-bold">{weather.temperature}°C</span>
        <span className="text-muted ms-1">Nairobi</span>
      </div>
    </div>
  );
};

export default WeatherWidget;