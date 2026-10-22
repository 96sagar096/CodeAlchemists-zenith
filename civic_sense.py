
from complaint_classification import classify_complaint
from priority_scoring import prioritize
from duplicate_detection import detect_duplicates
from hotspot_detection import detect_hotspots

def process_complaint(
    description,
    waiting_hours=0,
    related_reports=0,
    complaint_id=None,
    latitude=None,
    longitude=None,
    timestamp=None,
    existing_complaints=None
):
    # Step 1: Classify the complaint
    classification = classify_complaint(description)

    # Step 2: Stop automatic scoring if clarification is needed
    if classification["needs_clarification"]:
        return {
            "description": description,
            "category": classification["category"],
            "needs_clarification": True,
            "message": "Please provide more details about the complaint."
        }
    # Independent safety check for obvious electrical hazards
    text = description.lower()

    electrical_hazard = any(
        cue in text
        for cue in [
        "live wire",
        "exposed wire",
        "sparking wire",
        "electric wire is sparking",
        "risk of electrocution",
        "electrocuted",
        "fallen electric pole",
        ]
    )
    # Step 3: Calculate priority
    priority_result = prioritize(
        category=(
            "Electrical Hazard"
            if electrical_hazard
            else classification["category"]
        ),
        description=description,
        waiting_hours=waiting_hours,
        related_reports=related_reports
    )
    # Step 4: Check for potential duplicates
    duplicate_matches = detect_duplicates(description)
    # Step 5: Check whether this complaint belongs to a hotspot
    hotspot_matches = []
    if (
        complaint_id is not None
        and latitude is not None
        and longitude is not None
        and timestamp is not None
    ):
        from datetime import datetime

        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(
                timestamp.replace("Z", "+00:00")
            )

        complaint_record = {
            "id": complaint_id,
            "category": classification["category"],
            "latitude": latitude,
            "longitude": longitude,
            "timestamp": timestamp
        }

        records = list(existing_complaints or [])
        records.append(complaint_record)
        print("DEBUG hotspot records:", records)
        hotspot_matches = detect_hotspots(records)
    # Step 4: Combine the results
    return {
        "description": description,
        "category": priority_result,
        "confidence": classification["confidence"],
        "needs_review": classification["needs_review"],
        "needs_clarification": False,
        "priority": priority_result["priority"],
        "priority_score": priority_result["score"],
        "priority_explanation": priority_result["explanation"],
        "reasons": priority_result["reasons"],
        "potential_duplicates": duplicate_matches,
        "duplicate_count": len(duplicate_matches),
        "hotspots": hotspot_matches,
    }


if __name__ == "__main__":
    complaint = "A streetlight is broken near the public library"
    from datetime import datetime

    existing_complaints = [
        {
            "id": 201,
            "category": "Waterlogging",
            "latitude": 23.2599,
            "longitude": 77.4126,
            "timestamp": datetime(2026, 10, 22, 9, 0)
        },
        {
            "id": 202,
            "category": "Waterlogging",
            "latitude": 23.2605,
            "longitude": 77.4130,
            "timestamp": datetime(2026, 10, 22, 9, 15)
        }
    ]

    result = process_complaint(
        description="Waterlogging is blocking the road near the market",
        waiting_hours=4,
        related_reports=2,
        complaint_id=203,
        latitude=23.2610,
        longitude=77.4120,
        timestamp=datetime(2026, 10, 22, 9, 25),
        existing_complaints=existing_complaints
    )

    for key, value in result.items():
        print(f"{key}: {value}")
