from flask import Flask, render_template, request, jsonify
import heapq

app = Flask(__name__)

# Campus map: each building is a node and each path has a distance in metres.
# Paths are undirected, so each connection is listed in both directions.
CAMPUS = {
    "Main Gate": {"Library": 200, "CSE Block": 300},
    "Library": {"Main Gate": 200, "CSE Block": 100, "Canteen": 250},
    "CSE Block": {"Main Gate": 300, "Library": 100, "Auditorium": 200},
    "Canteen": {"Library": 250, "Auditorium": 150, "Administration": 300},
    "Auditorium": {"CSE Block": 200, "Canteen": 150, "Administration": 100},
    "Administration": {"Canteen": 300, "Auditorium": 100},
}

# Fixed illustrative positions for the visual map (not real geographic coordinates).
POSITIONS = {
    "Main Gate": [8, 52],
    "Library": [31, 30],
    "CSE Block": [50, 55],
    "Canteen": [53, 16],
    "Auditorium": [75, 45],
    "Administration": [88, 18],
}


def shortest_path(graph, start, destination):
    """Return the shortest route and distance using Dijkstra's algorithm."""
    distances = {node: float("inf") for node in graph}
    previous = {node: None for node in graph}
    distances[start] = 0
    priority_queue = [(0, start)]

    while priority_queue:
        current_distance, current = heapq.heappop(priority_queue)

        # A better route may have been found after this queue entry was added.
        if current_distance > distances[current]:
            continue

        # With non-negative edge weights, this destination distance is final.
        if current == destination:
            break

        for neighbour, weight in graph[current].items():
            new_distance = current_distance + weight
            if new_distance < distances[neighbour]:
                distances[neighbour] = new_distance
                previous[neighbour] = current
                heapq.heappush(priority_queue, (new_distance, neighbour))

    if distances[destination] == float("inf"):
        return None, None

    path = []
    current = destination
    while current is not None:
        path.append(current)
        current = previous[current]
    path.reverse()
    return path, distances[destination]


@app.route("/")
def home():
    return render_template(
        "index.html",
        buildings=list(CAMPUS.keys()),
        campus=CAMPUS,
        positions=POSITIONS,
    )


@app.route("/api/route", methods=["POST"])
def route_api():
    data = request.get_json(silent=True) or {}
    start = data.get("start")
    destination = data.get("destination")

    if start not in CAMPUS or destination not in CAMPUS:
        return jsonify({"error": "Please select valid campus locations."}), 400

    if start == destination:
        return jsonify({"path": [start], "distance": 0})

    path, distance = shortest_path(CAMPUS, start, destination)
    if path is None:
        return jsonify({"error": "No route exists between these locations."}), 404

    return jsonify({"path": path, "distance": distance})


if __name__ == "__main__":
    # debug=True is useful during local development; turn it off for deployment.
    app.run(debug=True)
