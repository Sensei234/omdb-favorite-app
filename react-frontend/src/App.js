// src/App.js
import React, { useState, useEffect } from "react";
import "./index.css";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Load favorites on start
  useEffect(() => {
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data) => setFavorites(data));
  }, []);

  // Dynamic search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        fetch(`/api/search?title=${query}`)
          .then((res) => res.json())
          .then((data) => setResults(data.Search || []));
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const addToFavorites = (movie) => {
    if (favorites.find((fav) => fav.imdbID === movie.imdbID)) return;
    fetch("/api/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movie),
    })
      .then((res) => res.json())
      .then(() => {
        setFavorites((prev) => [...prev, movie]);
      });
  };

  const removeFavorite = (imdbID) => {
    fetch("/api/remove_favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imdbID }),
    })
      .then((res) => res.json())
      .then(() => {
        setFavorites((prev) => prev.filter((movie) => movie.imdbID !== imdbID));
      });
  };

  const toggleWatched = (imdbID) => {
    fetch("/api/mark_watched", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imdbID }),
    })
      .then((res) => res.json())
      .then(() => {
        setFavorites((prev) =>
          prev.map((movie) =>
            movie.imdbID === imdbID
              ? { ...movie, watched: !movie.watched }
              : movie
          )
        );
      });
  };

  return (
    <div className="container">
      <h1>🎬 OMDB Movie Search</h1>

      <div className="search-bar">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies..."
        />
      </div>

      <h2>🔍 Results</h2>
      <div className="card-grid">
        {results.length === 0 && <p>No results found.</p>}
        {results.map((movie) => (
          <div className="movie-card" key={movie.imdbID}>
            <img
              src={
                movie.Poster !== "N/A"
                  ? movie.Poster
                  : "https://via.placeholder.com/200x300?text=No+Image"
              }
              alt={movie.Title}
            />
            <div className="movie-info">
              <h3>{movie.Title}</h3>
              <p>({movie.Year})</p>
              {favorites.find((fav) => fav.imdbID === movie.imdbID) ? (
                <button disabled style={{ backgroundColor: "#333", color: "#aaa" }}>
                  ✅ Favorited
                </button>
              ) : (
                <button onClick={() => addToFavorites(movie)}>⭐ Favorite</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "2rem" }}>❤️ Your Favorites</h2>
      <div className="card-grid">
        {favorites.map((movie) => (
          <div className="movie-card" key={movie.imdbID}>
            <img
              src={
                movie.Poster !== "N/A"
                  ? movie.Poster
                  : "https://via.placeholder.com/200x300?text=No+Image"
              }
              alt={movie.Title}
            />
            <div className="movie-info">
              <h3>{movie.Title}</h3>
              <p>({movie.Year})</p>
              <div className="button-group">
                <button
                  className="watched-btn"
                  onClick={() => toggleWatched(movie.imdbID)}
                  style={{ backgroundColor: movie.watched ? "#00dd66" : "#666" }}
                >
                  {movie.watched ? "🎉 Watched" : "👁 Mark as Watched"}
                </button>

                <button
                  className="remove-btn"
                  onClick={() => removeFavorite(movie.imdbID)}
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
