
from complaint_classification import classify_complaint
from priority_scoring import prioritize
from duplicate_detection import detect_duplicates

def process_complaint(description, waiting_hours=0, related_reports=0):
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
    # Step 4: Combine the results
    return {
        "description": description,
        "category": classification["category"],
        "confidence": classification["confidence"],
        "needs_review": classification["needs_review"],
        "needs_clarification": False,
        "priority": priority_result["priority"],
        "priority_score": priority_result["score"],
        "priority_explanation": priority_result["explanation"],
        "reasons": priority_result["reasons"],
        "potential_duplicates": duplicate_matches,
        "duplicate_count": len(duplicate_matches),
    }


if __name__ == "__main__":
    complaint = "A streetlight is broken near the public library"
    result = process_complaint(
        description=complaint,
        waiting_hours=2,
        related_reports=1
    )

    for key, value in result.items():
        print(f"{key}: {value}")
