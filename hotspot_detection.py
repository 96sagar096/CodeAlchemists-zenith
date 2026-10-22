
from datetime import datetime
import numpy as np
from sklearn.cluster import DBSCAN
from math import radians

# Sample civic complaints for testing
complaints = [
    {
        "id": 101,
        "category": "Waterlogging",
        "latitude": 23.2599,
        "longitude": 77.4126,
        "timestamp": datetime(2026, 10, 22, 9, 0)
    },
    {
        "id": 102,
        "category": "Waterlogging",
        "latitude": 23.2605,
        "longitude": 77.4130,
        "timestamp": datetime(2026, 10, 22, 9, 15)
    },
    {
        "id": 103,
        "category": "Waterlogging",
        "latitude": 23.2610,
        "longitude": 77.4120,
        "timestamp": datetime(2026, 10, 22, 9, 25)
    },
    {
        "id": 104,
        "category": "Garbage",
        "latitude": 23.2700,
        "longitude": 77.4300,
        "timestamp": datetime(2026, 10, 22, 10, 0)
    },
    {
        "id": 105,
        "category": "Waterlogging",
        "latitude": 23.2900,
        "longitude": 77.4500,
        "timestamp": datetime(2026, 10, 22, 11, 0)
    }
]


def detect_hotspots(
    complaints,
    radius_meters=300,
    min_complaints=3,
    time_window_hours=24
):
    categories = {}

    # Separate complaints by category
    for complaint in complaints:
        categories.setdefault(complaint["category"], []).append(complaint)

    hotspots = []
    earth_radius_meters = 6_371_000
    seen_clusters = set()

    for category, items in categories.items():
        items = sorted(items, key=lambda item: item["timestamp"])

        for start_item in items:
            # Include complaints reported within the next 24 hours
            window = [
                item for item in items
                if 0 <= (
                    item["timestamp"] - start_item["timestamp"]
                ).total_seconds() <= time_window_hours * 3600
            ]

            if len(window) < min_complaints:
                continue

            coordinates = np.array([
                [radians(item["latitude"]), radians(item["longitude"])]
                for item in window
            ])

            model = DBSCAN(
                eps=radius_meters / earth_radius_meters,
                min_samples=min_complaints,
                metric="haversine"
            )

            labels = model.fit_predict(coordinates)

            for label in set(labels):
                if label == -1:
                    continue

                cluster = [
                    window[i]
                    for i in range(len(window))
                    if labels[i] == label
                ]

                ids = tuple(sorted(item["id"] for item in cluster))
                cluster_key = (category, ids)

                if cluster_key in seen_clusters:
                    continue

                seen_clusters.add(cluster_key)

                hotspots.append({
                    "category": category,
                    "complaint_ids": list(ids),
                    "complaint_count": len(cluster),
                    "time_window_hours": time_window_hours
                })

    return hotspots


# Display the sample complaints

if __name__ == "__main__":
    print("--- Original sample ---")

    results = detect_hotspots(complaints)

    if results:
        for hotspot in results:
            print("\nHotspot detected!")
            print("Category:", hotspot["category"])
            print("Complaint IDs:", hotspot["complaint_ids"])
            print("Number of complaints:", hotspot["complaint_count"])
    else:
        print("No hotspots detected.")

    print("\n--- Testing complaints far apart in time ---")

    test_complaints = [
        {
            "id": 201,
            "category": "Waterlogging",
            "latitude": 23.2599,
            "longitude": 77.4126,
            "timestamp": datetime(2026, 10, 20, 9, 0)
        },
        {
            "id": 202,
            "category": "Waterlogging",
            "latitude": 23.2605,
            "longitude": 77.4130,
            "timestamp": datetime(2026, 10, 21, 10, 0)
        },
        {
            "id": 203,
            "category": "Waterlogging",
            "latitude": 23.2610,
            "longitude": 77.4120,
            "timestamp": datetime(2026, 10, 22, 11, 0)
        }
    ]

    print(detect_hotspots(test_complaints))
    
    print("\n--- Testing different categories ---")

    mixed_complaints = [
        {
            "id": 301,
            "category": "Waterlogging",
            "latitude": 23.2599,
            "longitude": 77.4126,
            "timestamp": datetime(2026, 10, 22, 9, 0)
        },
        {
            "id": 302,
            "category": "Garbage",
            "latitude": 23.2600,
            "longitude": 77.4127,
            "timestamp": datetime(2026, 10, 22, 9, 5)
        },
        {
            "id": 303,
            "category": "Waterlogging",
            "latitude": 23.2605,
            "longitude": 77.4130,
            "timestamp": datetime(2026, 10, 22, 9, 10)
        },
        {
            "id": 304,
            "category": "Garbage",
            "latitude": 23.2606,
            "longitude": 77.4131,
            "timestamp": datetime(2026, 10, 22, 9, 15)
        },
        {
            "id": 305,
            "category": "Waterlogging",
            "latitude": 23.2610,
            "longitude": 77.4120,
            "timestamp": datetime(2026, 10, 22, 9, 20)
        },
        {
            "id": 306,
            "category": "Garbage",
            "latitude": 23.2611,
            "longitude": 77.4121,
            "timestamp": datetime(2026, 10, 22, 9, 25)
        }
    ]

    print(detect_hotspots(mixed_complaints))

