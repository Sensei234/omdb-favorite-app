from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)

OMDB_API_KEY = "7c0ff5c5"  # Replace with your actual OMDB API key
# Ensure you have a valid OMDB API key from https://www.omdbapi.com/apikey.aspx
FAV_FILE = "favorites.json"


# Helper functions
def load_favorites():
    if os.path.exists(FAV_FILE):
        with open(FAV_FILE, "r") as f:
            return json.load(f)
    return []

def save_favorites(data):
    with open(FAV_FILE, "w") as f:
        json.dump(data, f, indent=2)


# Routes
@app.route("/api/search")
def search_movies():
    title = request.args.get("title", "")
    if not title:
        return jsonify({"error": "Missing title"}), 400

    url = f"http://www.omdbapi.com/?apikey={OMDB_API_KEY}&s={title}"
    response = requests.get(url)
    return jsonify(response.json())


@app.route("/api/favorites", methods=["GET"])
def get_favorites():
    return jsonify(load_favorites())


@app.route("/api/favorite", methods=["POST"])
def add_favorite():
    movie = request.json
    favorites = load_favorites()
    if any(m["imdbID"] == movie["imdbID"] for m in favorites):
        return jsonify({"message": "Already favorited"})
    movie["watched"] = False
    favorites.append(movie)
    save_favorites(favorites)
    return jsonify({"message": "Added to favorites"})


@app.route("/api/remove_favorite", methods=["POST"])
def remove_favorite():
    imdbID = request.json.get("imdbID")
    if not imdbID:
        return jsonify({"error": "Missing imdbID"}), 400
    favorites = load_favorites()
    new_favs = [m for m in favorites if m["imdbID"] != imdbID]
    save_favorites(new_favs)
    return jsonify({"message": "Removed from favorites"})


@app.route("/api/mark_watched", methods=["POST"])
def mark_watched():
    imdbID = request.json.get("imdbID")
    if not imdbID:
        return jsonify({"error": "Missing imdbID"}), 400
    favorites = load_favorites()
    for m in favorites:
        if m["imdbID"] == imdbID:
            m["watched"] = not m.get("watched", False)
            break
    save_favorites(favorites)
    return jsonify({"message": "Toggled watched status"})


if __name__ == "__main__":
    app.run(debug=True)
