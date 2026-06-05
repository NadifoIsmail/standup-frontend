import React, { useState, useEffect } from 'react';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-1.2921&longitude=36.8219&current_weather=true'
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

  const getWeatherIcon = (weatherCode) => {
    // Weather codes from Open-Meteo
    const icons = {
      0: 'wi wi-day-sunny',           // Clear sky
      1: 'wi wi-day-sunny-overcast',   // Mainly clear
      2: 'wi wi-day-cloudy',           // Partly cloudy
      3: 'wi wi-cloudy',               // Overcast
      45: 'wi wi-fog',                 // Fog
      48: 'wi wi-fog',                 // Depositing rime fog
      51: 'wi wi-rain-mix',            // Drizzle
      61: 'wi wi-rain',                // Rain
      80: 'wi wi-showers',             // Rain showers
    };
    return icons[weatherCode] || 'wi wi-day-sunny';
  };

  if (loading) {
    return <div className="text-muted">Loading weather...</div>;
  }

  if (error) {
    return <div className="text-muted"> Weather unavailable</div>;
  }

  const iconClass = getWeatherIcon(weather.weathercode);

  return (
    <div className="d-flex align-items-center gap-2 bg-light px-3 py-2 rounded">
      <i className={iconClass} style={{ fontSize: '1.5rem' }}></i>
      <div>
        <span className="fw-bold">{weather.temperature}°C</span>
        <span className="text-muted ms-1">Nairobi</span>
      </div>
    </div>
  );
};

export default WeatherWidget;