# CampusPath — Smart Campus Navigator

A student portfolio project demonstrating graph representation and Dijkstra's shortest-path algorithm through a responsive website.

## Features

- Illustrative visual campus map with clickable building markers
- Start and destination selectors, plus swap locations
- Python Flask API for shortest-path calculation
- Dijkstra's algorithm implemented with Python's `heapq` min-heap
- Highlighted shortest route, total distance, and step-by-step directions
- Input validation and mobile-friendly layout

## Requirements

- Python 3.10 or newer recommended
- pip

## Run locally on Windows

1. Extract the project ZIP and open the extracted folder in VS Code.
2. Open a terminal in that folder.
3. Create a virtual environment (recommended):

   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Start the server:

   ```bash
   python app.py
   ```

6. Open `http://127.0.0.1:5000` in your browser.

## Project structure

```text
smart_campus_navigator/
├── app.py
├── requirements.txt
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

## DSA notes

- Graph: adjacency-list representation
- Algorithm: Dijkstra's shortest-path algorithm
- Priority queue: Python `heapq` min-heap
- Time complexity: `O((V + E) log V)` for a simple graph with a binary heap
- Space complexity: `O(V + E)`

All distances and map positions are illustrative sample data, not a real survey of a campus. Replace them with measured distances and actual paths before presenting it as a real campus navigation tool.

## Important deployment note

This app requires a Python-capable host because the route API runs on Flask. A static-only host such as basic GitHub Pages cannot run `app.py` directly. Deploy the backend to a Python hosting service and configure the frontend/API accordingly, or use a host that supports both.
