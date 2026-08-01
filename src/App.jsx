import { useState, useEffect, useRef } from 'react';
import './App.css';

import catNormal from './weather-cats/cat-normal.png';
import catHot from './weather-cats/cat-hot.png';
import catWarm from './weather-cats/cat-warm.png';
import catCold from './weather-cats/cat-cold.png';
import catRain from './weather-cats/cat-rain.png';
import catSnow from './weather-cats/cat-snow.png';
import catThunder from './weather-cats/cat-thunder.png';

function getWeatherCat(weatherCode, temperature) {
  if (weatherCode >= 95 && weatherCode <= 99) {
    return catThunder;
  }
  if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) {
    return catSnow;
  }
  if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return catRain;
  }
  if (temperature >= 25) {
    return catHot;
  }
  if (temperature < 18) {
    return catCold;
  }
  return catWarm; // от 18°C до 25°C
}

function App() {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weather, setWeather] = useState(null);
  const [screen, setScreen] = useState('search'); // 'search' | 'result'

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  async function handleSearch() {
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );
      const geoData = await geoRes.json();

      if (!geoData.results) {
        setError('City not found');
        setLoading(false);
        return;
      }

      const { latitude, longitude, name } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,weather_code` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
      );
      const weatherData = await weatherRes.json();

      setWeather({ ...weatherData, cityName: name });
      setScreen('result');
    } catch (e) {
      setError('Something went wrong');
    }

    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  function backToSearch() {
    setScreen('search');
  }

  return (
    <div className="app">
      {screen === 'search' && (
        <div className="search-screen">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
            className="city-input"
          />
          {loading && <p className="status-text">Loading...</p>}
          {error && <p className="status-text error">{error}</p>}
          <img src={catNormal} alt="Cat" className="cat-fullscreen" />
        </div>
      )}

      {screen === 'result' && weather && (
        <div className="result-screen">
          <button className="back-button" onClick={backToSearch}>← Back</button>
          <h2 className="city-title">{weather.cityName}</h2>

          <div className="widget cat-widget">
            <img
              src={getWeatherCat(weather.current.weather_code, weather.current.temperature_2m)}
              alt="Weather cat"
              className="cat-widget-img"
            />
          </div>

          <div className="widget weather-widget">
            <p className="widget-temp">{Math.round(weather.current.temperature_2m)}°C</p>
            <div className="forecast">
              {weather.daily.time.map((date, index) => (
                <div key={date} className="forecast-day">
                  <p className="forecast-date">{date.slice(5)}</p>
                  <p className="forecast-temp">
                    {Math.round(weather.daily.temperature_2m_max[index])}° / {Math.round(weather.daily.temperature_2m_min[index])}°
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;